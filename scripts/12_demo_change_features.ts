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
  tx = await host.setFeatureBatch(0,[['HEAD_SLOT',remoteHead.address,1],['FACE_SLOT',remoteFace.address,0],['BADGE1_SLOT',remoteBadge.address,2],['BADGE2_SLOT',remoteBadge.address,3]]);
  await tx.wait();
  console.log("host.setFeatureBatch: 0");

  // clear features to the host token 1
  tx = await host.clearFeatureAll(1);
  await tx.wait();
  console.log("host.setFeatureBatch: 1");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
