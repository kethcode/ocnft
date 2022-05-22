import { Bytes } from "ethers";
import { ethers } from "hardhat";

const fs = require("fs");

const path_ipfshash_data = "./data/ipfs_cids.json";
const path_contract_addresses = "./data/contract_addresses.json";

const ipfs_gateway = "https://kethic.mypinata.cloud/ipfs/";
const hostBaseURI = "http://45.77.213.147:4200/";
const externalURI = "https://localhost:4201/";

const hashfn = (element: string) => {
  return Buffer.from(ethers.utils.keccak256(ethers.utils.toUtf8Bytes(element)).slice(2), 'hex') as Bytes
}

async function main() {
  let contractData = JSON.parse(
    fs.readFileSync(path_contract_addresses, { flag: "r+" })
  );

  const ComposableFactory = await ethers.getContractFactory("Composable");
  const ERC721Factory = await ethers.getContractFactory("NFT_721E");

  const top = ComposableFactory.attach(contractData["topAddress"]);
  const avatar = ComposableFactory.attach(contractData["avatarAddress"]);
  const remoteBackground = ERC721Factory.attach(
    contractData["remoteBackgroundAddress"]
  );
  const remoteBase = ERC721Factory.attach(contractData["remoteBaseAddress"]);
  const remoteHead = ERC721Factory.attach(contractData["remoteHeadAddress"]);
  const remoteFace = ERC721Factory.attach(contractData["remoteFaceAddress"]);
  const remoteBadge = ERC721Factory.attach(contractData["remoteBadgeAddress"]);

  const backgroundSlotHash = hashfn("BACKGROUND_SLOT");
  const avatarSlotHash = hashfn("AVATAR_SLOT");
  const baseSlotHash = hashfn("BASE_SLOT");
  const headSlotHash = hashfn("HEAD_SLOT");
  const faceSlotHash = hashfn("FACE_SLOT");
  const badge1SlotHash = hashfn("BADGE1_SLOT");
  const badge2SlotHash = hashfn("BADGE2_SLOT");

  const accounts = await ethers.getSigners();
  let tx: any;


  // function enableFeatures(FeatureData[] calldata _featureData)
  // [bytes32 featureHash, uint160 layer, uint24 x, uint24 y, uint24 w, uint24 h]

  // assign some features to the top token 0
  // tx = await top.configureFeatures(0, [
  //   [backgroundSlotHash, remoteBackground.address, 0],
  //   [avatarSlotHash, avatar.address, 0],
  // ]);
  // await tx.wait();
  // console.log(
  //   "top.configureFeatures(0, [ \
  //     [backgroundSlotHash, remoteBackground.address, 0], \
  //     [avatarSlotHash, avatar.address, 0], \
  //   ]);"
  // );

  // assign some features to the avatar token 0
  tx = await avatar.configureFeatures(0, [
    [baseSlotHash, remoteBase.address, 0],
    [headSlotHash, remoteHead.address, 0],
    [faceSlotHash, remoteFace.address, 0],
    [badge1SlotHash, remoteBadge.address, 2],
    [badge2SlotHash, remoteBadge.address, 3],
  ]);
  await tx.wait();
  console.log(
    "avatar.configureFeatures(0, [ \
      [baseSlotHash, remoteBase.address, 0], \
      [headSlotHash, remoteHead.address, 0], \
      [faceSlotHash, remoteFace.address, 0], \
      [badge1SlotHash, remoteBadge.address, 2], \
      [badge2SlotHash, remoteBadge.address, 3], \
    ]);"
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
