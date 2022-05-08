import { ethers } from "hardhat";

const fs = require("fs");

const path_contract_addresses = "./data/contract_addresses.json";

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

  // reassign some features to the host token 0
  tx = await host.setFeatures(0,[['HEAD_SLOT',remoteHead.address,2],['BADGE1_SLOT',remoteBadge.address,4],['BADGE2_SLOT',remoteBadge.address,0]]);
  await tx.wait();
  console.log("host.setFeatures: 0");

  // clear features to the host token 1
  tx = await host.clearFeatures(1,['HEAD_SLOT','BADGE1_SLOT','BADGE2_SLOT']);
  await tx.wait();
  console.log("host.clearFeatures: 1");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
