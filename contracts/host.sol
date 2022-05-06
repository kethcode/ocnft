// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

/// ----------------------------------------------------------------------------
/// Overview
/// ----------------------------------------------------------------------------

// function mint(address to)   
// function setBaseURI(string calldata _bURI)   
// function setExternalURI(string calldata _eURI)   
// function tokenURI(uint256 _tokenId) 
// function withdraw()  
// function withdrawToken()  

// function enableFeature(string calldata _featureName)  
// function disableFeature(string calldata _featureName)  
// function getEnabledFeatures()
// function setFeature(uint256 _tokenId, FeatureSetObject calldata inputData) 
// function setFeatureBatch(uint256 _tokenId, FeatureSetObject[] calldata inputData) 
// function clearFeature(uint256 _tokenId, string calldata _featureName) 
// function clearFeatureAll(uint256 _tokenId) 
// function getFeatureList(uint256 _tokenId)

// i feel like this needs a batch minting function, and/or maybe batch transfer function

/// ----------------------------------------------------------------------------
/// Library Imports
/// ----------------------------------------------------------------------------
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/interfaces/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

// I feel like we also need AccessControl so we can enable transfer for 
// OPCO distribution of soulbound nfts

// import "hardhat/console.sol";

/// ----------------------------------------------------------------------------
/// Contract Imports
/// ----------------------------------------------------------------------------
import {remote} from "./remote.sol";

/// ----------------------------------------------------------------------------
/// Enums and Structs
/// ----------------------------------------------------------------------------
struct FeatureData {
  string featureName; // used in json metadata
  bytes32 featureHash;
}

struct RemoteFeature {
  address remoteContractAddr;
  uint256 remoteTokenId;
}

struct FeatureSetObject {
  string _featureName;
  remote _remoteContractAddr;
  uint256 _remoteTokenId;
}

/// ----------------------------------------------------------------------------
/// Errors
/// ----------------------------------------------------------------------------
error invalidTokenId();
error withdrawFailed();
error isSoulbound();

error isNotTokenOwner();
error invalidAddress();

error IsNotRemoteTokenOwner();
error invalidFeature();

/**
 * @title host
 * @dev redacted
 */

contract host is ERC721Enumerable, Ownable, ReentrancyGuard {
  /// ------------------------------------------------------------------------
  /// External Contract References
  /// ------------------------------------------------------------------------
  using Strings for uint256; // inherited from ERC721Enumerable

  /// ------------------------------------------------------------------------
  /// Events
  /// ------------------------------------------------------------------------
  event BaseURISet(string baseURI);
  event ExternalURISet(string externalURI);

  event FeatureEnabled(string indexed featureName);
  event FeatureDisabled(string indexed featureName);

  event FeatureSet(
    address indexed owner,
    uint256 indexed tokenId,
    string indexed featureName
  );

  event FeatureCleared(
    address indexed owner,
    uint256 indexed tokenId,
    string indexed featureName
  );

  /// ------------------------------------------------------------------------
  /// Variables
  /// ------------------------------------------------------------------------
  string public constant nftName = "hostname";
  string public constant nftSymbol = "hostsymb";
  string public constant nftDescription = "ocnft host";

  string public baseURI;
  string public externalURI;

  /**
  * @dev use enableFeature(string) to register a feature that can be setFeature
  * @dev was tempted to map to bool, but wanted to be able to iterate these later
  */
  FeatureData[] public enabledFeatures;

  /**
  * @dev tokenId => featureHash => remote contract [addr,id]
  */
  mapping(uint256 => mapping(bytes32 => RemoteFeature)) public selectedFeatures;

  /// ------------------------------------------------------------------------
  /// Constructor
  /// ------------------------------------------------------------------------

  /**
  * @dev Empty Constructor, calls remote constructor with long name and symbol
  */
  constructor() ERC721(nftName, nftSymbol) {}

  /// ------------------------------------------------------------------------
  /// Basic NFT Functionality
  /// ------------------------------------------------------------------------

  /**
  * @param to Address to receive the NFT
  */
  function mint(address to) public onlyOwner {
    _mint(to, totalSupply());
  }

  /**
  * @param _bURI baseURI to be used to retreive image data
  */
  function setBaseURI(string calldata _bURI) public onlyOwner {
    baseURI = _bURI;
    emit BaseURISet(baseURI);
  }

  /**
  * @param _eURI alternate externalURI base to be used to view the NFT
  */
  function setExternalURI(string calldata _eURI) public onlyOwner {
    externalURI = _eURI;
    emit ExternalURISet(externalURI);
  }

  /**
  * @param _tokenId Token index of the json metadata to retrieve
  */
  function tokenURI(uint256 _tokenId)
    public
    view
    override
    returns (string memory)
  {
    if (_exists(_tokenId) == false) revert invalidTokenId();
    return bytes(_baseURI()).length > 0 ? _getMetadata(_tokenId) : "";
  }

  /**
  * @param _tokenId Token index of the json metadata to generate
  * @dev Returned data is base64 encoded
  */
  function _getMetadata(uint256 _tokenId)
    internal
    view
    returns (string memory)
  {
    string memory tokenIdString = Strings.toString(_tokenId);

    string memory nftJson = string(
      abi.encodePacked(
        '{"name":"',
        nftName,
        '","description":"',
        nftDescription,
        '","image":"',
        baseURI,
        tokenIdString,
        '.png","external_url":"',
        externalURI,
        tokenIdString,
        '"}'
      )
    );

    string memory nftEncoded = Base64.encode(bytes(nftJson));
    return
      string(abi.encodePacked("data:application/json;base64,", nftEncoded));
  }

  /**
  * @dev used to retrieve all ETH from the contract. multisig friendly.
  */
  function withdraw() public onlyOwner {
    (bool sent, ) = msg.sender.call{value: address(this).balance}("");
    if (!sent) {
      revert withdrawFailed();
    }
  }

  /**
  * @param _token ERC20 token to retrieve
  * @dev used to retrieve all of an ERC20 token from the contract
  */
  function withdrawTokens(IERC20 _token) public onlyOwner {
    bool sent = _token.transfer(msg.sender, _token.balanceOf(address(this)));
    if (!sent) {
      revert withdrawFailed();
    }
  }

  /**
  * @dev glue logic for ERC721Enumerable
  */
  function _baseURI() internal view override returns (string memory) {
    return baseURI;
  }

  /**
  * @dev override to disable transfer.  May need to AccessControl this instead.
  */
  function _transfer(
    address,
    address,
    uint256
  ) internal pure override {
    revert isSoulbound();
  }

  /// ------------------------------------------------------------------------
  /// Specific Functionality
  /// ------------------------------------------------------------------------

  /**
  * @param _featureName string representation of feature slot to enable
  * @dev string is hashed and added to enabledFeatures
  */
  function enableFeature(string calldata _featureName) public onlyOwner {
    bytes32 featureSlot = keccak256(abi.encodePacked(_featureName));

    enabledFeatures.push(FeatureData(_featureName, featureSlot));
    emit FeatureEnabled(_featureName);
  }

  /**
  * @param _featureName string representation of feature slot to disable
  * @dev string is hashed and removed from enabledFeatures
  * @dev does not check if it exists first
  */
  function disableFeature(string calldata _featureName) public onlyOwner {
    bytes32 featureSlot = keccak256(abi.encodePacked(_featureName));

    // delete array element while maintaining no gaps
    for (uint256 i = 0; i < enabledFeatures.length; i++) {
      if (enabledFeatures[i].featureHash == featureSlot) {
        enabledFeatures[i] = enabledFeatures[enabledFeatures.length - 1];
        enabledFeatures.pop();
        emit FeatureDisabled(_featureName);
        break;
      }
    }
  }

  /**
  * @dev utility function to fetch array of structs
  */
  function getEnabledFeatures() public view returns (FeatureData[] memory) {
    return enabledFeatures;
  }

  /**
  * @param _tokenId host token number to configure 
  * @param inputData [_featureName, _remoteContractAddr, _remoteTokenId]
  * @dev stores remote contract address and tokenId for a specific feature
  * @dev these values will be used to retrieve the remote image for layering
  */
  function setFeature(uint256 _tokenId, FeatureSetObject calldata inputData)
    public
    nonReentrant
  {
    if (_exists(_tokenId) == false) revert invalidTokenId();
    if (msg.sender != ownerOf(_tokenId)) revert isNotTokenOwner();
    if (address(inputData._remoteContractAddr) == address(0))
      revert invalidAddress();
    if (
      inputData._remoteContractAddr.ownerOf(inputData._remoteTokenId) !=
      msg.sender
    ) revert IsNotRemoteTokenOwner();

    bytes32 featureSlot = keccak256(abi.encodePacked(inputData._featureName));

    bool found = false;
    uint256 length = enabledFeatures.length;
    for (uint256 i = 0; i < length; i++) {
      if (enabledFeatures[i].featureHash == featureSlot) {
        found = true;
        break;
      }
    }
    if (!found) revert invalidFeature();

    selectedFeatures[_tokenId][featureSlot].remoteContractAddr = address(
      inputData._remoteContractAddr
    );
    selectedFeatures[_tokenId][featureSlot].remoteTokenId = inputData
      ._remoteTokenId;

    emit FeatureSet(msg.sender, _tokenId, inputData._featureName);
  }

  /**
  * @param _tokenId host token number to configure 
  * @param inputData [_featureName, _remoteContractAddr, _remoteTokenId][]
  * @dev same as setFeature, but allows multiple features to be set in one call
  */
  function setFeatureBatch(
    uint256 _tokenId,
    FeatureSetObject[] calldata inputData
  ) public nonReentrant {
    if (_exists(_tokenId) == false) revert invalidTokenId();
    if (msg.sender != ownerOf(_tokenId)) revert isNotTokenOwner();

    uint256 batchLength = inputData.length;
    for (uint256 i = 0; i < batchLength; i++) {
      if (address(inputData[i]._remoteContractAddr) == address(0))
        revert invalidAddress();
      if (
        inputData[i]._remoteContractAddr.ownerOf(inputData[i]._remoteTokenId) !=
        msg.sender
      ) revert IsNotRemoteTokenOwner();
    }

    for (uint256 j = 0; j < batchLength; j++) {
      bytes32 featureSlot = keccak256(
        abi.encodePacked(inputData[j]._featureName)
      );

      bool found = false;
      uint256 enabledLength = enabledFeatures.length;
      for (uint256 k = 0; k < enabledLength; k++) {
        if (enabledFeatures[k].featureHash == featureSlot) {
          found = true;
          break;
        }
      }
      if (!found) revert invalidFeature();

      selectedFeatures[_tokenId][featureSlot].remoteContractAddr = address(
        inputData[j]._remoteContractAddr
      );
      selectedFeatures[_tokenId][featureSlot].remoteTokenId = inputData[j]
        ._remoteTokenId;

      emit FeatureSet(msg.sender, _tokenId, inputData[j]._featureName);
    }
  }

  /**
  * @param _tokenId host token number to configure 
  * @param _featureName string representation of feature slot to erase
  * @dev clears the feature data for this slot from this token
  */
  function clearFeature(uint256 _tokenId, string calldata _featureName) public {
    if (_exists(_tokenId) == false) revert invalidTokenId();
    if (msg.sender != ownerOf(_tokenId)) revert isNotTokenOwner();

    bytes32 featureSlot = keccak256(abi.encodePacked(_featureName));

    selectedFeatures[_tokenId][featureSlot].remoteContractAddr = address(0);
    selectedFeatures[_tokenId][featureSlot].remoteTokenId = 0;

    emit FeatureCleared(msg.sender, _tokenId, _featureName);
  }

  /**
  * @param _tokenId host token number to configure 
  * @dev clears all enabled feature data slots from this token
  */
  function clearFeatureAll(uint256 _tokenId) public {
    if (_exists(_tokenId) == false) revert invalidTokenId();
    if (msg.sender != ownerOf(_tokenId)) revert isNotTokenOwner();

    uint256 length = enabledFeatures.length;

    for (uint256 i = 0; i < length; i++) {
      selectedFeatures[_tokenId][enabledFeatures[i].featureHash]
        .remoteContractAddr = address(0);
      selectedFeatures[_tokenId][enabledFeatures[i].featureHash]
        .remoteTokenId = 0;
      emit FeatureCleared(msg.sender, _tokenId, enabledFeatures[i].featureName);
    }
  }

  /**
  * @param _tokenId host token number to retrieve 
  * @dev returns json array of feature names, addresses, and tokens
  * @dev used to fetch and generate the final NFT image
  */
  function getFeatureList(uint256 _tokenId)
    public
    view
    returns (string memory)
  {
    if (_exists(_tokenId) == false) revert invalidTokenId();
    string memory featureList = "{";

    uint256 length = enabledFeatures.length;
    for (uint256 i = 0; i < length; i++) {
      featureList = string(
        abi.encodePacked(
          featureList,
          '"',
          enabledFeatures[i].featureName,
          '":["',
          Strings.toHexString(
            uint160(
              selectedFeatures[_tokenId][enabledFeatures[i].featureHash]
                .remoteContractAddr
            )
          ),
          '","',
          Strings.toString(
            selectedFeatures[_tokenId][enabledFeatures[i].featureHash]
              .remoteTokenId
          ),
          '"]',
          i == length - 1 ? "" : "," // the correct number of commas in the correct places
        )
      );
    }

    featureList = string(abi.encodePacked(featureList, "}"));
    return featureList;
  }
}

/// ----------------------------------------------------------------------------
/// Libraries
/// ----------------------------------------------------------------------------

/**
* @dev Base64 copied from Primes NFT
* @dev https://etherscan.io/address/0xBDA937F5C5f4eFB2261b6FcD25A71A1C350FdF20#code#L1507
* @dev Slightly cheaper than the common implementations going around
* @dev Used to base64 encode metadata on the fly for simple browser decode
*/
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
