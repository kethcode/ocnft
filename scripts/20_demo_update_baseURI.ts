import { ethers } from "hardhat";

const fs = require("fs");

const path_ipfshash_data = "./data/ipfs_cids.json";
const path_contract_addresses = "./data/contract_addresses.json";

const ipfs_gateway = "https://kethic.mypinata.cloud/ipfs/";
const hostBaseURI = "https://localhost:4200/";
const externalURI = "https://localhost:4201/";

async function main() {

  let contractData = JSON.parse(
    fs.readFileSync(path_contract_addresses, { flag: "r+" })
  );

  const Host = await ethers.getContractFactory("host");
  const Remote = await ethers.getContractFactory("remote");

  const host = Host.attach(contractData['hostAddress']);
  const remoteHead = Remote.attach(contractData['remoteHeadAddress']);
  const remoteFace = Remote.attach(contractData['remoteFaceAddress']);
  const remoteBadge = Remote.attach(contractData['remoteBadgeAddress']);

  let IpfsHash = JSON.parse(
    fs.readFileSync(path_ipfshash_data, { flag: "r+" })
  );

  let cid_head = IpfsHash["IpfsHash_head"];
  let cid_face = IpfsHash["IpfsHash_face"];
  let cid_badge = IpfsHash["IpfsHash_badge"];

  const accounts = await ethers.getSigners();
  let tx: any;

  // // head URIs
  // tx = await remoteHead.setBaseURI(ipfs_gateway + cid_head + "/");
  // await tx.wait();
  // console.log("remoteHead.setBaseURI:", ipfs_gateway + cid_head + "/");

  // // face URIs
  // tx = await remoteFace.setBaseURI(ipfs_gateway + cid_face + "/");
  // await tx.wait();
  // console.log("remoteFace.setBaseURI:", ipfs_gateway + cid_face + "/");

  // badge URIs
  console.log("remoteBadge.setBaseURI:", ipfs_gateway + cid_badge + "/");
  tx = await remoteBadge.setBaseURI(ipfs_gateway + cid_badge + "/");
  console.log(tx);
  await tx.wait();
  console.log("remoteBadge.setBaseURI:", ipfs_gateway + cid_badge + "/ complete");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
