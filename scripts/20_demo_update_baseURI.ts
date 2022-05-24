import { ethers } from "hardhat";

const fs = require("fs");

const path_ipfshash_data = "./data/ipfs_cids.json";
const path_contract_addresses = "./data/contract_addresses.json";

const ipfs_gateway = "https://kethic.mypinata.cloud/ipfs/";
const composeServerURI = "http://207.246.72.251:4200/";
const externalURI = "https://207.246.72.251:3000/";

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

  const accounts = await ethers.getSigners();
  let tx: any;

  // host URIs
  console.log("top.setBaseURI:", composeServerURI + contractData["topAddress"] + '/');
  tx = await top.setBaseURI(composeServerURI + contractData["topAddress"] + '/');
  await tx.wait();
  console.log("top.setBaseURI:", composeServerURI + contractData["topAddress"] + '/' + " complete");

  console.log("avatar.setBaseURI:", composeServerURI + contractData["avatarAddress"] + '/');
  tx = await avatar.setBaseURI(composeServerURI + contractData["avatarAddress"] + '/');
  await tx.wait();
  console.log("avatar.setBaseURI:", composeServerURI + contractData["avatarAddress"] + '/' + " complete");

  // // head URIs
  // tx = await remoteHead.setBaseURI(ipfs_gateway + cid_head + "/");
  // await tx.wait();
  // console.log("remoteHead.setBaseURI:", ipfs_gateway + cid_head + "/");

  // // face URIs
  // tx = await remoteFace.setBaseURI(ipfs_gateway + cid_face + "/");
  // await tx.wait();
  // console.log("remoteFace.setBaseURI:", ipfs_gateway + cid_face + "/");

  // // badge URIs
  // console.log("remoteBadge.setBaseURI:", ipfs_gateway + cid_badge + "/");
  // tx = await remoteBadge.setBaseURI(ipfs_gateway + cid_badge + "/");
  // await tx.wait();
  // console.log("remoteBadge.setBaseURI:", ipfs_gateway + cid_badge + "/ complete");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
