import { ethers } from "hardhat";

const hre = require("hardhat");
const fs = require("fs");
const path_contract_addresses = "./data/contract_addresses.json";


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
