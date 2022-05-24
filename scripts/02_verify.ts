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
const composeServerURI = "http://207.246.72.251:4200/";
const externalURI = "https://207.246.72.251:3000/";

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

  const ComposableFactory = await ethers.getContractFactory("Composable");
  const ERC721Factory = await ethers.getContractFactory("NFT_721E");

  const top = ComposableFactory.attach(contractData["topAddress"]);
  const avatar = ComposableFactory.attach(contractData["avatarAddress"]);
  const remoteBackground = ERC721Factory.attach(contractData["remoteBackgroundAddress"]);
  const remoteBase = ERC721Factory.attach(contractData["remoteBaseAddress"]);
  const remoteHead = ERC721Factory.attach(contractData["remoteHeadAddress"]);
  const remoteFace = ERC721Factory.attach(contractData["remoteFaceAddress"]);
  const remoteBadge = ERC721Factory.attach(contractData["remoteBadgeAddress"]);

  // await hre.run("verify:verify", {
  //   contract: "contracts/Composable.sol:Composable",
  //   address: top.address,
  //   constructorArguments: [composeServerURI, externalURI],
  // });

  await hre.run("verify:verify", {
    contract: "contracts/Composable.sol:Composable",
    address: top.address,
    constructorArguments: [composeServerURI, externalURI],
  });

  // await hre.run("verify:verify", {
  //   contract: "contracts/NFT_721E.sol:NFT_721E",
  //   address: remoteBackground.address,
  //   constructorArguments: [remoteBackgroundBaseURI, externalURI],
  // });

  await hre.run("verify:verify", {
    contract: "contracts/NFT_721E.sol:NFT_721E",
    address: remoteBase.address,
    constructorArguments: [remoteBaseBaseURI, externalURI],
  });

  await hre.run("verify:verify", {
    contract: "contracts/NFT_721E.sol:NFT_721E",
    address: remoteHead.address,
    constructorArguments: [remoteHeadBaseURI, externalURI],
  });

  await hre.run("verify:verify", {
    contract: "contracts/NFT_721E.sol:NFT_721E",
    address: remoteFace.address,
    constructorArguments: [remoteFaceBaseURI, externalURI],
  });

  await hre.run("verify:verify", {
    contract: "contracts/NFT_721E.sol:NFT_721E",
    address: remoteBadge.address,
    constructorArguments: [remoteBadgeBaseURI, externalURI],
  });

  // duplicate bytecode doesn't need to be reverified
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
