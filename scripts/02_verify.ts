import { ethers } from "hardhat";

const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

const path_contract_addresses = path.resolve(
  __dirname,
  `../data/contract_addresses.json`
);

async function main() {

  let contractData = JSON.parse(
    fs.readFileSync(path_contract_addresses, { flag: "r+" })
  );

  const Host = await ethers.getContractFactory("host");
  const Remote = await ethers.getContractFactory("remote");

  const host = Host.attach(contractData['hostAddress']);
  const remoteHead = Remote.attach(contractData['remoteHeadAddress']);

  await hre.run("verify:verify", {
    contract: "contracts/host.sol:host",
    address: host.address
  });

  await hre.run("verify:verify", {
    contract: "contracts/remote.sol:remote",
    address: remoteHead.address
  });

  // duplicate bytecode doesn't need to be reverified
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
