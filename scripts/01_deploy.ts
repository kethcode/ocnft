import { ethers } from "hardhat";

const fs = require("fs");
const path_ipfshash_data = "./data/ipfs_cids.json";
const path_contract_addresses = "./data/contract_addresses.json";

const ipfs_gateway = "https://kethic.mypinata.cloud/ipfs/";
const hostBaseURI = "https://localhost:4200/";
const hostViewerURI = "https://localhost:4201/";


async function main() {

  let IpfsHash = JSON.parse(
    fs.readFileSync(path_ipfshash_data, { flag: "r+" })
  );

  let cid_badge = IpfsHash["IpfsHash_badges"];
  let cid_body = IpfsHash["IpfsHash_bodies"];
  let cid_hand = IpfsHash["IpfsHash_hands"];
  let cid_head = IpfsHash["IpfsHash_hats"];

  const Host = await ethers.getContractFactory("host");
  const Remote = await ethers.getContractFactory("remote");
  
  const host = await Host.deploy();
  await host.deployed();
  console.log("Host deployed to:       ", host.address);

  const remoteHead = await Remote.deploy();
  await remoteHead.deployed();
  console.log("remoteHead deployed to: ", remoteHead.address);

  const remoteHand = await Remote.deploy();
  await remoteHand.deployed();
  console.log("remoteHand deployed to: ", remoteHand.address);

  const remoteBody = await Remote.deploy();
  await remoteBody.deployed();
  console.log("remoteBody deployed to: ", remoteBody.address);

  const remoteBadge = await Remote.deploy();
  await remoteBadge.deployed();
  console.log("remoteBadge deployed to:", remoteBadge.address);

  let contractData = {
    hostAddress: host.address,
    remoteHeadAddress: remoteHead.address,
    remoteHandAddress: remoteHand.address,
    remoteBodyAddress: remoteBody.address,
    remoteBadgeAddress: remoteBadge.address,
  };
  fs.writeFileSync(path_contract_addresses, JSON.stringify(contractData), {
    flag: "w+",
  });

  const accounts = await ethers.getSigners();
  let tx: any;

  tx = await remoteHead.setBaseURI(ipfs_gateway + cid_head + "/");
  await tx.wait();
  console.log("remoteHead.setBaseURI:", ipfs_gateway + cid_head + "/");
  tx = await remoteHead.mint(accounts[0].address);
  await tx.wait();
  console.log("remoteHead.mint: 0");

  tx = await remoteHand.setBaseURI(ipfs_gateway + cid_hand + "/");
  await tx.wait();
  console.log("remoteHand.setBaseURI:", ipfs_gateway + cid_hand + "/");
  tx = await remoteHand.mint(accounts[0].address);
  await tx.wait();
  console.log("remoteHand.mint: 0");

  tx = await remoteBody.setBaseURI(ipfs_gateway + cid_body + "/");
  await tx.wait();
  console.log("remoteBody.setBaseURI:", ipfs_gateway + cid_body + "/");
  tx = await remoteBody.mint(accounts[0].address);
  await tx.wait();
  console.log("remoteBody.mint: 0");

  tx = await remoteBadge.setBaseURI(ipfs_gateway + cid_badge + "/");
  await tx.wait();
  console.log("remoteBadge.setBaseURI:", ipfs_gateway + cid_badge + "/");
  tx = await remoteBadge.mint(accounts[0].address);
  await tx.wait();
  console.log("remoteBadge.mint: 0");

  tx = await host.setBaseURI(hostBaseURI);
  await tx.wait();
  console.log("host.setBaseURI:", hostBaseURI);
  tx = await host.setViewerURI(hostViewerURI);
  await tx.wait();
  console.log("host.setViewerURI:",hostViewerURI);
  tx = await host.mint(accounts[0].address);
  await tx.wait();
  console.log("host.mint: 0");

  tx = await host.register(0,'HEAD_SLOT',remoteHead.address,0);
  await tx.wait();
  console.log("host.register: 0,'HEAD_SLOT',",remoteHead.address);
  tx = await host.register(0,'HAND_SLOT',remoteHand.address,0);
  await tx.wait();
  console.log("host.register: 0,'HAND_SLOT',",remoteHand.address);
  tx = await host.register(0,'BODY_SLOT',remoteBody.address,0);
  await tx.wait();
  console.log("host.register: 0,'BODY_SLOT',",remoteBody.address);
  tx = await host.register(0,'BADGE_SLOT',remoteBadge.address,0);
  await tx.wait();
  console.log("host.register: 0,'BADGE_SLOT',",remoteBadge.address);

}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
