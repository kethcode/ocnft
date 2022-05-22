// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

/// ----------------------------------------------------------------------------
/// Overview
/// ----------------------------------------------------------------------------

/**
 * @title IComposable
 * @author Kethic
 * @notice IComposable contains all external function interfaces, events,
 *         and errors for composable nft contracts.
 */

// interface IComposable is IERC165 {
//   function enableFeatures(FeatureData[] calldata _featureData) external;
//   function disableFeatures(bytes32[] calldata _featureHashes) external;
//   function getEnabledFeatures() external view;
//   function configureFeatures(uint256 _tokenId, ConfigData[] calldata inputData) external;
//   function clearFeatures(uint256 _tokenId, bytes32[] calldata _featureHashes) external;
//   function getConfiguredFeatures(uint256 _tokenId) external view;
// }
// ERC165 InterfaceId: 0x09e3ba39

/// ----------------------------------------------------------------------------
/// Library Imports
/// ----------------------------------------------------------------------------
import "@openzeppelin/contracts/interfaces/IERC721.sol";
import "@openzeppelin/contracts/interfaces/IERC165.sol";

/// ----------------------------------------------------------------------------
/// Enums and Structs
/// ----------------------------------------------------------------------------

/**
 * @dev suggested feature detail data storage
 * @dev FeatureData[] public enabledFeatures;
 */
struct FeatureData {
  bytes32 featureHash;
  uint160 layer;
  uint24 x;
  uint24 y;
  uint24 w;
  uint24 h;
}

/**
 * @dev suggested remote nft contract data storage
 * @dev tokenId => featureHash => remote contract [addr,id]
 * @dev mapping(uint256 => mapping(bytes32 => RemoteData)) public selectedFeatures;
 */
struct RemoteData {
  address remoteContractAddr;
  uint256 remoteTokenId;
}

/**
 * @dev used by configureFeatures receive inputs to RemoteData mapping
 */
struct ConfigData {
  bytes32 _featureHash;
  IERC721 _remoteContractAddr;
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
 * @title IComposable
 * @dev redacted
 */

interface IComposable is IERC165 {
  /// ------------------------------------------------------------------------
  /// Events
  /// ------------------------------------------------------------------------
  event FeatureEnabled(bytes32 indexed featureHash);
  // event FeatureUpdated(bytes32 indexed featureHash);
  event FeatureDisabled(bytes32 indexed featureHash);

  event FeatureConfigured(uint256 indexed tokenId, bytes32 indexed featureHash);
  // event FeatureCleared(uint256 indexed tokenId, bytes32 indexed featureHash);

  /// ------------------------------------------------------------------------
  /// Variables
  /// ------------------------------------------------------------------------

  /// ------------------------------------------------------------------------
  /// Specific Functionality
  /// ------------------------------------------------------------------------

  /**
   * @param _featureData array fo feature details to enable or update
   * @dev [bytes32 featureHash, uint160 layer, uint24 x, uint24 y, uint24 w, uint24 h]
   * @dev convenience function for _enableFeature()
   */
  function enableFeatures(FeatureData[] calldata _featureData) external;

  /**
   * @param _featureHashes string representations of feature slot to disable
   * @dev strings are hashed and removed from enabledFeatures
   * @dev does not check if it exists first
   */
  function disableFeatures(bytes32[] calldata _featureHashes) external;

  /**
   * @dev utility function to fetch array of structs
   */
  function getEnabledFeatures() external view returns (FeatureData[] memory);

  /**
   * @param _tokenId host token number to configure
   * @param inputData [_featureHash, _remoteContractAddr, _remoteTokenId][]
   * @dev stores remote contract address and tokenId for a specific feature
   * @dev these values will be used to retrieve the remote image for layering
   */
  function configureFeatures(uint256 _tokenId, ConfigData[] calldata inputData)
    external;

  /**
   * @param _tokenId host token number to configure
   * @param _featureHashes string representations of feature slot to erase
   * @dev clears the feature data for this slot from this token
   */
  function clearFeatures(uint256 _tokenId, bytes32[] calldata _featureHashes)
    external;

  /**
   * @param _tokenId host token number to retrieve
   * @dev returns json { layer:[hash,addr,id,x,y,w,h], layer:[hash,addr,id,x,y,w,h] }
   * @dev used to fetch and generate the final NFT image
   */
  function getConfiguredFeatures(uint256 _tokenId) external view returns (string memory);
}
