import { ethers } from "hardhat";

const fs = require("fs");
const path_ipfshash_data = "./data/ipfs_cids.json";
const path_contract_addresses = "./data/contract_addresses.json";

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

}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
