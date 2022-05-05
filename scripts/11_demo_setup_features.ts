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
  const remoteHand = Host.attach(contractData['remoteHandAddress']);
  const remoteBody = Host.attach(contractData['remoteBodyAddress']);
  const remoteBadge = Host.attach(contractData['remoteBadgeAddress']);

  let IpfsHash = JSON.parse(
    fs.readFileSync(path_ipfshash_data, { flag: "r+" })
  );

  let cid_badge = IpfsHash["IpfsHash_badges"];
  let cid_body = IpfsHash["IpfsHash_bodies"];
  let cid_hand = IpfsHash["IpfsHash_hands"];
  let cid_head = IpfsHash["IpfsHash_hats"];

  const accounts = await ethers.getSigners();
  let tx: any;

  // head URIs
  tx = await remoteHead.setBaseURI(ipfs_gateway + cid_head + "/");
  await tx.wait();
  console.log("remoteHead.setBaseURI:", ipfs_gateway + cid_head + "/");
  tx = await remoteHead.setExternalURI(externalURI);
  await tx.wait();
  console.log("remoteHead.setExternalURI:",externalURI);

  // hand URIs
  tx = await remoteHand.setBaseURI(ipfs_gateway + cid_hand + "/");
  await tx.wait();
  console.log("remoteHand.setBaseURI:", ipfs_gateway + cid_hand + "/");
  tx = await remoteHand.setExternalURI(externalURI);
  await tx.wait();
  console.log("remoteHead.setExternalURI:",externalURI);

  // body URIs
  tx = await remoteBody.setBaseURI(ipfs_gateway + cid_body + "/");
  await tx.wait();
  console.log("remoteBody.setBaseURI:", ipfs_gateway + cid_body + "/");
  tx = await remoteBody.setExternalURI(externalURI);
  await tx.wait();
  console.log("remoteBody.setExternalURI:",externalURI);

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
  tx = await host.enableFeature('HAND_SLOT');
  await tx.wait();
  console.log("host.enableFeature: 'HAND_SLOT'");
  tx = await host.enableFeature('BODY_SLOT');
  await tx.wait();
  console.log("host.enableFeature: 'BODY_SLOT'");
  tx = await host.enableFeature('BADGE_SLOT');
  await tx.wait();
  console.log("host.enableFeature: 'BADGE_SLOT'");

  // mint some features and host token 0
  tx = await remoteHead.mint(accounts[0].address);
  await tx.wait();
  console.log("remoteHead.mint: 0");
  tx = await remoteHead.mint(accounts[0].address);
  await tx.wait();
  console.log("remoteHead.mint: 1");
  tx = await remoteHand.mint(accounts[0].address);
  await tx.wait();
  console.log("remoteHand.mint: 0");
  tx = await remoteHand.mint(accounts[0].address);
  await tx.wait();
  console.log("remoteHand.mint: 1");
  tx = await remoteBody.mint(accounts[0].address);
  await tx.wait();
  console.log("remoteBody.mint: 0");
  tx = await remoteBody.mint(accounts[0].address);
  await tx.wait();
  console.log("remoteBody.mint: 1");
  tx = await remoteBadge.mint(accounts[0].address);
  await tx.wait();
  console.log("remoteBadge.mint: 0");
  tx = await remoteBadge.mint(accounts[0].address);
  await tx.wait();
  console.log("remoteBadge.mint: 1");
  tx = await host.mint(accounts[0].address);
  await tx.wait();
  console.log("host.mint: 0");

  // assign some features to the host token 0
  tx = await host.setFeature(0,['HEAD_SLOT',remoteHead.address,0]);
  await tx.wait();
  console.log("host.setFeature: 0,['HEAD_SLOT',",remoteHead.address);
  tx = await host.setFeature(0,['HAND_SLOT',remoteHand.address,0]);
  await tx.wait();
  console.log("host.setFeature: 0,['HAND_SLOT',",remoteHand.address);
  tx = await host.setFeature(0,['BODY_SLOT',remoteBody.address,0]);
  await tx.wait();
  console.log("host.setFeature: 0,['BODY_SLOT',",remoteBody.address);
  tx = await host.setFeature(0,['BADGE_SLOT',remoteBadge.address,0]);
  await tx.wait();
  console.log("host.setFeature: 0,['BADGE_SLOT',",remoteBadge.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
