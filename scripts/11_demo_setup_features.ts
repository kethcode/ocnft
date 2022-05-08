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

  const accounts = await ethers.getSigners();
  let tx: any;

  // configure host feature slots
  tx = await host.enableFeatures(['HEAD_SLOT','FACE_SLOT','BADGE1_SLOT','BADGE2_SLOT']);
  await tx.wait();
  console.log("host.enableFeatures(['HEAD_SLOT','FACE_SLOT','BADGE1_SLOT','BADGE2_SLOT'])");
  
  // mint some features and host token 0
  tx = await remoteHead.mint(accounts[0].address,6);
  await tx.wait();
  console.log("remoteHead.mint");

  tx = await remoteFace.mint(accounts[0].address,2);
  await tx.wait();
  console.log("remoteFace.mint");

  tx = await remoteBadge.mint(accounts[0].address,5);
  await tx.wait();
  console.log("remoteBadge.mint");

  tx = await host.mint(accounts[0].address,2);
  await tx.wait();
  console.log("host.mint");


  // assign some features to the host token 0
  tx = await host.setFeatures(0,[['HEAD_SLOT',remoteHead.address,1],['FACE_SLOT',remoteFace.address,0],['BADGE1_SLOT',remoteBadge.address,2]]);
  await tx.wait();
  console.log("host.setFeatures(0,[['HEAD_SLOT',remoteHead.address,0],['FACE_SLOT',remoteFace.address,0],['BADGE1_SLOT',remoteBadge.address,0]])");

  // assign some features to the host token 1
  tx = await host.setFeatures(1,[['HEAD_SLOT',remoteHead.address,3],['FACE_SLOT',remoteFace.address,1],['BADGE1_SLOT',remoteBadge.address,3],['BADGE2_SLOT',remoteBadge.address,1]]);
  await tx.wait();
  console.log("host.setFeatures(1,[['HEAD_SLOT',remoteHead.address,4],['FACE_SLOT',remoteFace.address,1],['BADGE1_SLOT',remoteBadge.address,4],['BADGE2_SLOT',remoteBadge.address,1]])");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
