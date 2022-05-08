import { ethers } from "hardhat";

const fs = require("fs");
const path = require("path");

const path_contract_addresses = path.resolve(
  __dirname,
  `../data/contract_addresses.json`
);

const path_ipfshash_data = path.resolve(__dirname, `../data/ipfs_cids.json`);

const ipfs_gateway = "https://kethic.mypinata.cloud/ipfs/";
const hostBaseURI = "https://localhost:4200/";
const externalURI = "https://localhost:4201/";

async function main() {
  
  let IpfsHash = JSON.parse(
    fs.readFileSync(path_ipfshash_data, { flag: "r+" })
  );

  let cid_head = IpfsHash["IpfsHash_head"];
  let cid_face = IpfsHash["IpfsHash_face"];
  let cid_badge = IpfsHash["IpfsHash_badge"];

  const remoteHeadBaseURI = ipfs_gateway + cid_head + "/";
  const remoteFaceBaseURI = ipfs_gateway + cid_face + "/";
  const remoteBadgeBaseURI = ipfs_gateway + cid_badge + "/";

  const Host = await ethers.getContractFactory("host");
  const Remote = await ethers.getContractFactory("remote");

  const host = await Host.deploy(hostBaseURI, externalURI);
  await host.deployed();
  console.log("Host deployed to:       ", host.address);

  const remoteHead = await Remote.deploy(remoteHeadBaseURI, externalURI);
  await remoteHead.deployed();
  console.log("remoteHead deployed to: ", remoteHead.address);

  const remoteFace = await Remote.deploy(remoteFaceBaseURI, externalURI);
  await remoteFace.deployed();
  console.log("remoteFace deployed to: ", remoteFace.address);

  const remoteBadge = await Remote.deploy(remoteBadgeBaseURI, externalURI);
  await remoteBadge.deployed();
  console.log("remoteBadge deployed to:", remoteBadge.address);

  let contractData = {
    hostAddress: host.address,
    remoteHeadAddress: remoteHead.address,
    remoteFaceAddress: remoteFace.address,
    remoteBadgeAddress: remoteBadge.address,
  };
  fs.writeFileSync(path_contract_addresses, JSON.stringify(contractData), {
    flag: "w+",
  });
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
