import { ethers } from "hardhat";

const fs = require("fs");

const path_ipfshash_data = "./data/ipfs_cids.json";
const path_contract_addresses = "./data/contract_addresses.json";

const ipfs_gateway = "https://kethic.mypinata.cloud/ipfs/";
const hostBaseURI = "http://45.77.213.147:4200/";
const externalURI = "https://localhost:4201/";

async function main() {
  let contractData = JSON.parse(
    fs.readFileSync(path_contract_addresses, { flag: "r+" })
  );

  const Host = await ethers.getContractFactory("host");
  const Remote = await ethers.getContractFactory("remote");

  const ctzn = Host.attach(contractData["ctznAddress"]);
  const host = Host.attach(contractData["hostAddress"]);
  const remoteBackground = Remote.attach(
    contractData["remoteBackgroundAddress"]
  );
  const remoteBase = Remote.attach(contractData["remoteBaseAddress"]);
  const remoteHead = Remote.attach(contractData["remoteHeadAddress"]);
  const remoteFace = Remote.attach(contractData["remoteFaceAddress"]);
  const remoteBadge = Remote.attach(contractData["remoteBadgeAddress"]);

  const backgroundSlotHash = ethers.utils.keccak256(
    ethers.utils.toUtf8Bytes("BACKGROUND_SLOT")
  );

  const avatarSlotHash = ethers.utils.keccak256(
    ethers.utils.toUtf8Bytes("AVATAR_SLOT")
  );

  const baseSlotHash = ethers.utils.keccak256(
    ethers.utils.toUtf8Bytes("BASE_SLOT")
  );

  const headSlotHash = ethers.utils.keccak256(
    ethers.utils.toUtf8Bytes("HEAD_SLOT")
  );

  const faceSlotHash = ethers.utils.keccak256(
    ethers.utils.toUtf8Bytes("FACE_SLOT")
  );

  const badge1SlotHash = ethers.utils.keccak256(
    ethers.utils.toUtf8Bytes("BADGE1_SLOT")
  );

  const badge2SlotHash = ethers.utils.keccak256(
    ethers.utils.toUtf8Bytes("BADGE2_SLOT")
  );

  const accounts = await ethers.getSigners();
  let tx: any;

  // function enableFeatures(FeatureData[] calldata _featureData)
  // [bytes32 featureHash, uint160 layer, uint24 x, uint24 y, uint24 w, uint24 h]

  // configure ctzn feature slots
  tx = await ctzn.enableFeatures([
    [backgroundSlotHash, 0, 0, 0, 300, 400],
    [avatarSlotHash, 1, 50, 50, 200, 200],
  ]);
  await tx.wait();
  console.log(
    "ctzn.enableFeatures([ \
      [backgroundSlotHash, 0, 0, 0, 300, 400], \
      [avatarSlotHash, 1, 50, 50, 200, 200], \
    ])"
  );

  // configure host feature slots
  tx = await host.enableFeatures([
    [baseSlotHash, 0, 0, 0, 350, 350],
    [headSlotHash, 4, 100, 0, 150, 130],
    [faceSlotHash, 1, 75, 75, 200, 200],
    [badge1SlotHash, 2, 10, 310, 30, 30],
    [badge2SlotHash, 3, 40, 310, 30, 30],
  ]);
  await tx.wait();
  console.log(
    "host.enableFeatures([ \
      [baseSlotHash, 0, 0, 0, 350, 350], \
      [headSlotHash, 4, 100, 0, 150, 130], \
      [faceSlotHash, 1, 75, 75, 200, 200], \
      [badge1SlotHash, 2, 10, 310, 30, 30], \
      [badge2SlotHash, 3, 40, 310, 30, 30], \
    ])"
  );

  // assign some features to the ctzn token 0
  tx = await ctzn.configureFeatures(0, [
    [backgroundSlotHash, remoteBackground.address, 0],
    [avatarSlotHash, host.address, 0],
  ]);
  await tx.wait();
  console.log(
    "ctzn.configureFeatures(0, [ \
      [backgroundSlotHash, remoteBackground.address, 0], \
      [avatarSlotHash, host.address, 0], \
    ]);"
  );

  // assign some features to the host (avatar) token 0
  tx = await host.configureFeatures(0, [
    [baseSlotHash, remoteBase.address, 0],
    [headSlotHash, remoteHead.address, 0],
    [faceSlotHash, remoteFace.address, 0],
    [badge1SlotHash, remoteBadge.address, 0],
    [badge2SlotHash, remoteBadge.address, 1],
  ]);
  await tx.wait();
  console.log(
    "host.configureFeatures(0, [ \
      [baseSlotHash, remoteBase.address, 0], \
      [headSlotHash, remoteHead.address, 0], \
      [faceSlotHash, remoteFace.address, 0], \
      [badge1SlotHash, remoteBadge.address, 0], \
      [badge2SlotHash, remoteBadge.address, 1], \
    ]);"
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
