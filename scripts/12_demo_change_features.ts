import { Bytes } from "ethers";
import { ethers } from "hardhat";

const fs = require("fs");
const path = require("path");

const path_ipfshash_data = path.resolve(__dirname, `../data/ipfs_cids.json`);
const path_contract_addresses = path.resolve(
  __dirname,
  `../data/contract_addresses.json`
);

const ipfs_gateway = "https://kethic.mypinata.cloud/ipfs/";
const composeServerURI = "http://207.246.72.251:4200/";
const externalURI = "https://207.246.72.251:3000/";

const hashfn = (element: string) => {
  return Buffer.from(ethers.utils.keccak256(ethers.utils.toUtf8Bytes(element)).slice(2), 'hex') as Bytes
  // return ethers.utils.keccak256(
  //   ethers.utils.toUtf8Bytes(element)
  //return hre.ethers.utils.keccak256(element);
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

  // configure feature slots
  tx = await top.enableFeatures([
    [backgroundSlotHash, 0, 0, 0, 300, 400],
    [avatarSlotHash, 1, 30, 30, 240, 240]
  ]);
  await tx.wait();
  console.log(
    "top.enableFeatures([ \
      [backgroundSlotHash, 0, 0, 0, 300, 400], \
      [avatarSlotHash, 1, 50, 50, 200, 200], \
    ])"
  );

  // // configure feature slots
  // tx = await avatar.enableFeatures([
  //   [baseSlotHash, 0, 0, 0, 350, 350],
  //   [headSlotHash, 4, 100, 0, 150, 130],
  //   [faceSlotHash, 1, 75, 75, 200, 200],
  //   [badge1SlotHash, 2, 10, 310, 30, 30],
  //   [badge2SlotHash, 3, 40, 310, 30, 30]
  // ]);
  // await tx.wait();
  // console.log(
  //   "avatar.enableFeatures([ \
  //     [baseSlotHash, 0, 0, 0, 350, 350], \
  //     [headSlotHash, 4, 100, 0, 150, 130], \
  //     [faceSlotHash, 1, 50, 50, 200, 200], \
  //     [badge1SlotHash, 2, 10, 310, 30, 30], \
  //     [badge2SlotHash, 3, 40, 310, 30, 30], \
  //   ])"
  // );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
