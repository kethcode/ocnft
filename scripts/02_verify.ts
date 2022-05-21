import { ethers } from "hardhat";

const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

const path_contract_addresses = path.resolve(
  __dirname,
  `../data/contract_addresses.json`
);
const path_ipfshash_data = path.resolve(__dirname, `../data/ipfs_cids.json`);

const ipfs_gateway = "https://kethic.mypinata.cloud/ipfs/";
const hostBaseURI = "http://45.77.213.147:4200/";
const externalURI = "https://localhost:4201/";

async function main() {
  let IpfsHash = JSON.parse(
    fs.readFileSync(path_ipfshash_data, { flag: "r+" })
  );

  let cid_background = IpfsHash["IpfsHash_background"];
  let cid_base = IpfsHash["IpfsHash_base"];
  let cid_head = IpfsHash["IpfsHash_head"];
  let cid_face = IpfsHash["IpfsHash_face"];
  let cid_badge = IpfsHash["IpfsHash_badge"];

  const remoteBackgroundBaseURI = ipfs_gateway + cid_background + "/";
  const remoteBaseBaseURI = ipfs_gateway + cid_base + "/";
  const remoteHeadBaseURI = ipfs_gateway + cid_head + "/";
  const remoteFaceBaseURI = ipfs_gateway + cid_face + "/";
  const remoteBadgeBaseURI = ipfs_gateway + cid_badge + "/";


  let contractData = JSON.parse(
    fs.readFileSync(path_contract_addresses, { flag: "r+" })
  );

  const Host = await ethers.getContractFactory("host");
  const Remote = await ethers.getContractFactory("remote");

  const ctzn = Host.attach(contractData["ctznAddress"]);
  const host = Host.attach(contractData["hostAddress"]);
  const remoteBackground = Remote.attach(contractData["remoteBackgroundAddress"]);
  const remoteBase = Remote.attach(contractData["remoteBaseAddress"]);
  const remoteHead = Remote.attach(contractData["remoteHeadAddress"]);
  const remoteFace = Remote.attach(contractData["remoteFaceAddress"]);
  const remoteBadge = Remote.attach(contractData["remoteBadgeAddress"]);

  await hre.run("verify:verify", {
    contract: "contracts/host.sol:host",
    address: host.address,
    constructorArguments: [hostBaseURI, externalURI],
  });

  await hre.run("verify:verify", {
    contract: "contracts/remote.sol:remote",
    address: remoteBackground.address,
    constructorArguments: [remoteBackgroundBaseURI, externalURI],
  });

  await hre.run("verify:verify", {
    contract: "contracts/remote.sol:remote",
    address: remoteBase.address,
    constructorArguments: [remoteBaseBaseURI, externalURI],
  });

  await hre.run("verify:verify", {
    contract: "contracts/remote.sol:remote",
    address: remoteHead.address,
    constructorArguments: [remoteHeadBaseURI, externalURI],
  });

  await hre.run("verify:verify", {
    contract: "contracts/remote.sol:remote",
    address: remoteFace.address,
    constructorArguments: [remoteFaceBaseURI, externalURI],
  });

  await hre.run("verify:verify", {
    contract: "contracts/remote.sol:remote",
    address: remoteBadge.address,
    constructorArguments: [remoteBadgeBaseURI, externalURI],
  });

  // duplicate bytecode doesn't need to be reverified
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
