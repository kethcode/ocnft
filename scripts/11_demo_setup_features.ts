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
  const remoteHead = Host.attach(contractData['remoteHeadAddress']);
  const remoteFace = Host.attach(contractData['remoteFaceAddress']);
  const remoteBadge = Host.attach(contractData['remoteBadgeAddress']);

  let IpfsHash = JSON.parse(
    fs.readFileSync(path_ipfshash_data, { flag: "r+" })
  );

  let cid_head = IpfsHash["IpfsHash_head"];
  let cid_face = IpfsHash["IpfsHash_face"];
  let cid_badge = IpfsHash["IpfsHash_badge"];

  const accounts = await ethers.getSigners();
  let tx: any;

  // head URIs
  tx = await remoteHead.setBaseURI(ipfs_gateway + cid_head + "/");
  await tx.wait();
  console.log("remoteHead.setBaseURI:", ipfs_gateway + cid_head + "/");
  tx = await remoteHead.setExternalURI(externalURI);
  await tx.wait();
  console.log("remoteHead.setExternalURI:",externalURI);

  // body URIs
  tx = await remoteFace.setBaseURI(ipfs_gateway + cid_face + "/");
  await tx.wait();
  console.log("remoteFace.setBaseURI:", ipfs_gateway + cid_face + "/");
  tx = await remoteFace.setExternalURI(externalURI);
  await tx.wait();
  console.log("remoteFace.setExternalURI:",externalURI);

  // badge URIs
  tx = await remoteBadge.setBaseURI(ipfs_gateway + cid_badge + "/");
  await tx.wait();
  console.log("remoteBadge.setBaseURI:", ipfs_gateway + cid_badge + "/");
  tx = await remoteBadge.setExternalURI(externalURI);
  await tx.wait();
  console.log("remoteBadge.setExternalURI:",externalURI);

  // host URIs
  tx = await host.setBaseURI(hostBaseURI);
  await tx.wait();
  console.log("host.setBaseURI:", hostBaseURI);
  tx = await host.setExternalURI(externalURI);
  await tx.wait();
  console.log("host.setExternalURI:",externalURI);

  // configure host feature slots
  tx = await host.enableFeature('HEAD_SLOT');
  await tx.wait();
  console.log("host.enableFeature: 'HEAD_SLOT'");
  tx = await host.enableFeature('FACE_SLOT');
  await tx.wait();
  console.log("host.enableFeature: 'FACE_SLOT'");
  tx = await host.enableFeature('BADGE1_SLOT');
  await tx.wait();
  console.log("host.enableFeature: 'BADGE1_SLOT'");
  tx = await host.enableFeature('BADGE2_SLOT');
  await tx.wait();
  console.log("host.enableFeature: 'BADGE2_SLOT'");

  // mint some features and host token 0
  tx = await remoteHead.mint(accounts[0].address);
  await tx.wait();
  console.log("remoteHead.mint: 0");
  tx = await remoteHead.mint(accounts[0].address);
  await tx.wait();
  console.log("remoteHead.mint: 1");
  tx = await remoteHead.mint(accounts[0].address);
  await tx.wait();
  console.log("remoteHead.mint: 2");
  tx = await remoteHead.mint(accounts[0].address);
  await tx.wait();
  console.log("remoteHead.mint: 3");
  tx = await remoteHead.mint(accounts[0].address);
  await tx.wait();
  console.log("remoteHead.mint: 4");
  tx = await remoteHead.mint(accounts[0].address);
  await tx.wait();
  console.log("remoteHead.mint: 5");

  tx = await remoteFace.mint(accounts[0].address);
  await tx.wait();
  console.log("remoteFace.mint: 0");
  tx = await remoteFace.mint(accounts[0].address);
  await tx.wait();
  console.log("remoteFace.mint: 1");

  tx = await remoteBadge.mint(accounts[0].address);
  await tx.wait();
  console.log("remoteBadge.mint: 0");
  tx = await remoteBadge.mint(accounts[0].address);
  await tx.wait();
  console.log("remoteBadge.mint: 1");
  tx = await remoteBadge.mint(accounts[0].address);
  await tx.wait();
  console.log("remoteBadge.mint: 2");
  tx = await remoteBadge.mint(accounts[0].address);
  await tx.wait();
  console.log("remoteBadge.mint: 3");
  tx = await remoteBadge.mint(accounts[0].address);
  await tx.wait();
  console.log("remoteBadge.mint: 4");

  tx = await host.mint(accounts[0].address);
  await tx.wait();
  console.log("host.mint: 0");
  tx = await host.mint(accounts[0].address);
  await tx.wait();
  console.log("host.mint: 1");


  // assign some features to the host token 0
  tx = await host.setFeature(0,['HEAD_SLOT',remoteHead.address,0]);
  await tx.wait();
  console.log("host.setFeature: 0,['HEAD_SLOT',",remoteHead.address);
  tx = await host.setFeature(0,['FACE_SLOT',remoteFace.address,0]);
  await tx.wait();
  console.log("host.setFeature: 0,['FACE_SLOT',",remoteFace.address);
  tx = await host.setFeature(0,['BADGE1_SLOT',remoteBadge.address,0]);
  await tx.wait();
  console.log("host.setFeature: 0,['BADGE1_SLOT',",remoteBadge.address);

  // assign some features to the host token 1
  tx = await host.setFeatureBatch(1,[['HEAD_SLOT',remoteHead.address,4],['FACE_SLOT',remoteFace.address,1],['BADGE1_SLOT',remoteBadge.address,4],['BADGE2_SLOT',remoteBadge.address,1]]);
  await tx.wait();
  console.log("host.setFeatureBatch: 1");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
