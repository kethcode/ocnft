import { ethers } from "hardhat";

const fs = require("fs");
const path = require("path");

const path_contract_addresses = path.resolve(
  __dirname,
  `../data/contract_addresses.json`
);

const path_ipfshash_data = path.resolve(__dirname, `../data/ipfs_cids.json`);


async function main() {

  let IpfsHash = JSON.parse(
    fs.readFileSync(path_ipfshash_data, { flag: "r+" })
  );

  const Host = await ethers.getContractFactory("host");
  const Remote = await ethers.getContractFactory("remote");
  
  const host = await Host.deploy();
  await host.deployed();
  console.log("Host deployed to:       ", host.address);

  const remoteHead = await Remote.deploy();
  await remoteHead.deployed();
  console.log("remoteHead deployed to: ", remoteHead.address);

  const remoteFace = await Remote.deploy();
  await remoteFace.deployed();
  console.log("remoteFace deployed to: ", remoteFace.address);

  const remoteBadge = await Remote.deploy();
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
