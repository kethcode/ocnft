// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

/// ----------------------------------------------------------------------------
/// Imports
/// ----------------------------------------------------------------------------
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/interfaces/IERC20.sol";

// import "hardhat/console.sol";
/// ----------------------------------------------------------------------------
/// Enums and Structs
/// ----------------------------------------------------------------------------

/// ----------------------------------------------------------------------------
/// Errors
/// ----------------------------------------------------------------------------

error BadTokenID();
error SendFailed();
error Soulbound();
error InvalidAddress();
error NotRemoteOwner();
error NotNFTOwner();

contract host is ERC721Enumerable, Ownable {
  using Strings for uint256;

  /// ------------------------------------------------------------------------
  /// Events
  /// ------------------------------------------------------------------------

  /// ------------------------------------------------------------------------
  /// Variables
  /// ------------------------------------------------------------------------

  string public baseURI;
  string public viewerURI;

  bytes32 internal constant HEAD_SLOT = keccak256("HEAD_SLOT");
  bytes32 internal constant HAND_SLOT = keccak256("HAND_SLOT");
  bytes32 internal constant BODY_SLOT = keccak256("BODY_SLOT");
  bytes32 internal constant BADGE_SLOT = keccak256("BADGE_SLOT");

  //      tokenId =>         featureSlot => imageURI
  mapping(uint256 => mapping(bytes32 => string)) public features;

  /// ------------------------------------------------------------------------
  /// Modifiers
  /// ------------------------------------------------------------------------

  /// ------------------------------------------------------------------------
  /// Functions
  /// ------------------------------------------------------------------------

  constructor() ERC721("host", "host") {}

  function tokenURI(uint256 _tokenId)
    public
    view
    override
    returns (string memory)
  {
    if (_exists(_tokenId) == false) {
      revert BadTokenID();
    }

    return bytes(_baseURI()).length > 0 ? getMetadata(_tokenId) : "";
  }

  function setBaseURI(string memory _bURI) public onlyOwner {
    baseURI = _bURI;
  }

  function setViewerURI(string memory _vURI) public onlyOwner {
    viewerURI = _vURI;
  }

  function getMetadata(uint256 _tokenId) internal view returns (string memory) {
    string memory nftJson = '{"name":"host","description":"ocnft host","image":"';
    string memory tokenIdString = Strings.toString(_tokenId);
    nftJson = string(
      abi.encodePacked(
        nftJson,
        baseURI,
        tokenIdString,
        '.png","external_url":"',
        viewerURI,
        tokenIdString,
        '"}'
      )
    );

    string memory nftEncoded = Base64.encode(bytes(nftJson));
    return
      string(abi.encodePacked("data:application/json;base64,", nftEncoded));
  }

  function register(
    uint256 _tokenId,
    string calldata _featureSlot,
    address remoteContractAddr,
    uint256 remoteTokenId
  ) public {
    if (_exists(_tokenId) == false) {
      revert BadTokenID();
    }
    if (msg.sender != ownerOf(_tokenId)) revert NotNFTOwner();
    if (remoteContractAddr == address(0)) revert InvalidAddress();
    // reentrancy guard

    bytes32 featureSlot = keccak256(abi.encodePacked(_featureSlot));

    // check if msg.sender if owner of remote token
    // address remoteContractAddr = features[_tokenId][_featureSlot].remoteContractAddr;
    // uint256 remoteTokenId = features[_tokenId][_featureSlot].remoteTokenId;

    (bool success, bytes memory data) = remoteContractAddr.call(
      abi.encodeWithSignature("ownerOf(uint256)", remoteTokenId)
    );

    if (success) {
      if (abi.decode(data, (address)) != msg.sender) revert NotRemoteOwner();
    }

    (success, data) = remoteContractAddr.call(
      abi.encodeWithSignature("getImageURI(uint256)", remoteTokenId)
    );

    if (success) {
      features[_tokenId][featureSlot] = abi.decode(data, (string));
    }
  }

  function deregister(uint256 _tokenId, string calldata _featureSlot) public {
    if (_exists(_tokenId) == false) {
      revert BadTokenID();
    }

    if (msg.sender != ownerOf(_tokenId)) revert NotNFTOwner();

    bytes32 featureSlot = keccak256(abi.encodePacked(_featureSlot));
    features[_tokenId][featureSlot] = "";
  }

  function getFeatureList(uint256 _tokenId)
    public
    view
    returns (string memory)
  {
    if (_exists(_tokenId) == false) {
      revert BadTokenID();
    }

    string memory featureList = string(
      abi.encodePacked(
        '{"HEAD_SLOT":"',
        getImageURI(_tokenId, "HEAD_SLOT"),
        '","HAND_SLOT":"',
        getImageURI(_tokenId, "HAND_SLOT"),
        '","BODY_SLOT":"',
        getImageURI(_tokenId, "BODY_SLOT"),
        '","BADGE_SLOT":"',
        getImageURI(_tokenId, "BADGE_SLOT"),
        '"}'
      )
    );

    return featureList;
  }

  function getImageURI(uint256 _tokenId, string memory _featureSlot)
    public
    view
    returns (string memory)
  {
    if (_exists(_tokenId) == false) {
      revert BadTokenID();
    }

    bytes32 featureSlot = keccak256(abi.encodePacked(_featureSlot));
    return features[_tokenId][featureSlot];
  }

  function mint(address to) public onlyOwner {
    _mint(to, totalSupply());
  }

  function withdraw() public onlyOwner {
    (bool sent, ) = msg.sender.call{value: address(this).balance}("");
    if (!sent) {
      revert SendFailed();
    }
  }

  function withdrawTokens(IERC20 _token) public onlyOwner {
    bool sent = _token.transfer(msg.sender, _token.balanceOf(address(this)));
    if (!sent) {
      revert SendFailed();
    }
  }

  function _baseURI() internal view override returns (string memory) {
    return baseURI;
  }

  function _transfer(
    address,
    address,
    uint256
  ) internal pure override {
    revert Soulbound();
  }

  /// ------------------------------------------------------------------------
  /// ERC165
  /// ------------------------------------------------------------------------

  /// ------------------------------------------------------------------------
  /// Utility
  /// ------------------------------------------------------------------------
}

/// ----------------------------------------------------------------------------
/// External Contracts
/// ----------------------------------------------------------------------------

// Primes NFT
//https://etherscan.io/address/0xBDA937F5C5f4eFB2261b6FcD25A71A1C350FdF20#code#L1507
library Base64 {
  string internal constant TABLE_ENCODE =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

  function encode(bytes memory data) internal pure returns (string memory) {
    if (data.length == 0) return "";

    // load the table into memory
    string memory table = TABLE_ENCODE;

    // multiply by 4/3 rounded up
    uint256 encodedLen = 4 * ((data.length + 2) / 3);

    // add some extra buffer at the end required for the writing
    string memory result = new string(encodedLen + 32);

    assembly {
      // set the actual output length
      mstore(result, encodedLen)

      // prepare the lookup table
      let tablePtr := add(table, 1)

      // input ptr
      let dataPtr := data
      let endPtr := add(dataPtr, mload(data))

      // result ptr, jump over length
      let resultPtr := add(result, 32)

      // run over the input, 3 bytes at a time
      for {

      } lt(dataPtr, endPtr) {

      } {
        // read 3 bytes
        dataPtr := add(dataPtr, 3)
        let input := mload(dataPtr)

        // write 4 characters
        mstore8(resultPtr, mload(add(tablePtr, and(shr(18, input), 0x3F))))
        resultPtr := add(resultPtr, 1)
        mstore8(resultPtr, mload(add(tablePtr, and(shr(12, input), 0x3F))))
        resultPtr := add(resultPtr, 1)
        mstore8(resultPtr, mload(add(tablePtr, and(shr(6, input), 0x3F))))
        resultPtr := add(resultPtr, 1)
        mstore8(resultPtr, mload(add(tablePtr, and(input, 0x3F))))
        resultPtr := add(resultPtr, 1)
      }

      // padding with '='
      switch mod(mload(data), 3)
      case 1 {
        mstore(sub(resultPtr, 2), shl(240, 0x3d3d))
      }
      case 2 {
        mstore(sub(resultPtr, 1), shl(248, 0x3d))
      }
    }

    return result;
  }
}
