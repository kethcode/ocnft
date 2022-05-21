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

// function enableFeatures(FeatureData[] calldata _featureData)
// function disableFeatures(bytes32[] calldata _featureHashes) 
// function getEnabledFeatures() public view returns (FeatureData[] memory)
// function configureFeatures(uint256 _tokenId, SetFeatureInput[] calldata inputData)
// function clearFeatures(uint256 _tokenId, bytes32[] calldata _featureHashes)
// function getFeatures(uint256 _tokenId) public view returns (string memory)

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

import "hardhat/console.sol";

/// ----------------------------------------------------------------------------
/// Contract Imports
/// ----------------------------------------------------------------------------
import {remote} from "./remote.sol";

/// ----------------------------------------------------------------------------
/// Enums and Structs
/// ----------------------------------------------------------------------------
struct FeatureData {
  bytes32 featureHash;
  uint160 layer;
  uint24 x;
  uint24 y;
  uint24 w;
  uint24 h;
  // do I want a composable flag in here?  or let the app query supportsInterface?
}

// struct FeatureDataCompact {
//   bytes32 featureHash;
//   uint256 featureParameters;
// }

struct RemoteData {
  address remoteContractAddr;
  uint256 remoteTokenId;
}

struct SetFeatureInput {
  bytes32 _featureHash;
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
  using Strings for bytes32; // inherited from ERC721Enumerable

  /// ------------------------------------------------------------------------
  /// Events
  /// ------------------------------------------------------------------------
  event BaseURISet(string baseURI);
  event ExternalURISet(string externalURI);

  event FeatureEnabled(bytes32 indexed featureHash);
  event FeatureUpdated(bytes32 indexed featureHash);
  event FeatureDisabled(bytes32 indexed featureHash);

  event FeatureConfigured(uint256 indexed tokenId, bytes32 indexed featureHash);
  event FeatureCleared(uint256 indexed tokenId, bytes32 indexed featureHash);

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
  mapping(uint256 => mapping(bytes32 => RemoteData)) public selectedFeatures;

  /// ------------------------------------------------------------------------
  /// Constructor
  /// ------------------------------------------------------------------------

  /**
   * @param _bURI assigns to baseURI for metadata generation
   * @param _eURI assigns to externalURI for metadata generation
   * @dev Calls remote constructor with long name and symbol
   */
  constructor(string memory _bURI, string memory _eURI)
    ERC721(nftName, nftSymbol)
  {
    baseURI = string(abi.encodePacked(_bURI, Strings.toHexString(uint160(address(this))),'/'));
    externalURI = _eURI;
  }

  /// ------------------------------------------------------------------------
  /// Basic NFT Functionality
  /// ------------------------------------------------------------------------

  /**
   * @param _to Address to receive the NFT
   * @param _quantity number of nfts to mint to target address
   * @dev honestly, should override _mint to batch mint cheaper
   * @dev but OZ contracts have key variables marked private
   */
  function mint(address _to, uint256 _quantity) public onlyOwner {
    for (uint256 i = 0; i < _quantity; i++) {
      _mint(_to, totalSupply());
    }
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
   * @param _featureData array fo feature details to enable or update
   * @dev [bytes32 featureHash, uint160 layer, uint24 x, uint24 y, uint24 w, uint24 h]
   * @dev convenience function for _enableFeature()
   */
  function enableFeatures(FeatureData[] calldata _featureData)
    public
    onlyOwner
  {
    bool found = false;
    for (uint256 i = 0; i < _featureData.length; i++) {
      for (uint256 j = 0; j < enabledFeatures.length; j++) {
        if (enabledFeatures[j].featureHash == _featureData[i].featureHash) {
          enabledFeatures[j].layer = _featureData[i].layer;
          enabledFeatures[j].x = _featureData[i].x;
          enabledFeatures[j].y = _featureData[i].y;
          enabledFeatures[j].w = _featureData[i].w;
          enabledFeatures[j].h = _featureData[i].h;
          found = true;
          emit FeatureUpdated(_featureData[i].featureHash);
          break;
        }
      }
      if (found == false) {
        enabledFeatures.push(
          FeatureData(
            _featureData[i].featureHash,
            _featureData[i].layer,
            _featureData[i].x,
            _featureData[i].y,
            _featureData[i].w,
            _featureData[i].h
          )
        );
        emit FeatureEnabled(_featureData[i].featureHash);
      }
    }
  }

  /**
   * @param _featureHashes string representations of feature slot to disable
   * @dev strings are hashed and removed from enabledFeatures
   * @dev does not check if it exists first
   */
  function disableFeatures(bytes32[] calldata _featureHashes) public onlyOwner {
    for (uint256 i = 0; i < _featureHashes.length; i++) {
      for (uint256 j = 0; j < enabledFeatures.length; j++) {
        if (enabledFeatures[j].featureHash == _featureHashes[i]) {
          enabledFeatures[j] = enabledFeatures[enabledFeatures.length - 1];
          enabledFeatures.pop();
          emit FeatureDisabled(_featureHashes[i]);
          break;
        }
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
   * @param inputData [_featureHash, _remoteContractAddr, _remoteTokenId][]
   * @dev stores remote contract address and tokenId for a specific feature
   * @dev these values will be used to retrieve the remote image for layering
   */
  function configureFeatures(
    uint256 _tokenId,
    SetFeatureInput[] calldata inputData
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
      // bytes32 featureSlot = keccak256(
      //   abi.encodePacked(inputData[j]._featureName)
      // );

      bool found = false;
      uint256 enabledLength = enabledFeatures.length;
      for (uint256 k = 0; k < enabledLength; k++) {
        if (enabledFeatures[k].featureHash == inputData[j]._featureHash) {
          found = true;
          break;
        }
      }
      if (!found) revert invalidFeature();

      selectedFeatures[_tokenId][inputData[j]._featureHash]
        .remoteContractAddr = address(inputData[j]._remoteContractAddr);
      selectedFeatures[_tokenId][inputData[j]._featureHash]
        .remoteTokenId = inputData[j]._remoteTokenId;

      emit FeatureConfigured(_tokenId, inputData[j]._featureHash);
    }
  }

  /**
   * @param _tokenId host token number to configure
   * @param _featureHashes string representations of feature slot to erase
   * @dev clears the feature data for this slot from this token
   */
  function clearFeatures(uint256 _tokenId, bytes32[] calldata _featureHashes)
    public
  {
    if (_exists(_tokenId) == false) revert invalidTokenId();
    if (msg.sender != ownerOf(_tokenId)) revert isNotTokenOwner();

    for (uint256 i = 0; i < _featureHashes.length; i++) {
      selectedFeatures[_tokenId][_featureHashes[i]].remoteContractAddr = address(0);
      selectedFeatures[_tokenId][_featureHashes[i]].remoteTokenId = 0;
      emit FeatureCleared(_tokenId, _featureHashes[i]);
    }
  }

  /**
   * @param _tokenId host token number to retrieve
   * @dev returns json { layer:[hash,addr,id,x,y,w,h], layer:[hash,addr,id,x,y,w,h] }
   * @dev used to fetch and generate the final NFT image
   */
  function getFeatures(uint256 _tokenId) public view returns (string memory) {
    if (_exists(_tokenId) == false) revert invalidTokenId();
    string memory featureList = "{";

    uint256 length = enabledFeatures.length;
    for (uint256 i = 0; i < length; i++) {
      // have to break this into two parts to deal with stack depth limitations
      // part 1
      featureList = string(
        abi.encodePacked(
          featureList,
          '"',
          Strings.toString(enabledFeatures[i].layer), // json wont parse a number as the first key, grumble.  gotta be a string
          '":["',
          Strings.toHexString(uint256(enabledFeatures[i].featureHash)),
          '","',
              Strings.toHexString(
                uint160(
                  selectedFeatures[_tokenId][enabledFeatures[i].featureHash]
                    .remoteContractAddr
                )
              ),
              '",',
              Strings.toString(
                selectedFeatures[_tokenId][enabledFeatures[i].featureHash]
                  .remoteTokenId
              )
        )
      );

      // part 2
      featureList = string(
        abi.encodePacked(
          featureList,
          ",",
          Strings.toString(enabledFeatures[i].x),
          ",",
          Strings.toString(enabledFeatures[i].y),
          ",",
          Strings.toString(enabledFeatures[i].w),
          ",",
          Strings.toString(enabledFeatures[i].h),
          "]",
          i == length - 1 ? "" : "," // the correct number of commas in the correct places
        )
      );
    }

    featureList = string(abi.encodePacked(featureList, "}"));
    // console.log(featureList);
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
