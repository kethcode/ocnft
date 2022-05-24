import { ethers } from "hardhat";

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

  const ComposableFactory = await ethers.getContractFactory("Composable");
  const ERC721Factory = await ethers.getContractFactory("NFT_721E");

  const top = await ComposableFactory.deploy(composeServerURI, externalURI);
  await top.deployed();
  console.log("Top deployed to:    ", top.address);

  const avatar = await ComposableFactory.deploy(composeServerURI, externalURI);
  await avatar.deployed();
  console.log("Avatar deployed to: ", avatar.address);

  const remoteBackground = await ERC721Factory.deploy(remoteBackgroundBaseURI, externalURI);
  await remoteBackground.deployed();
  console.log("Back deployed to:   ", remoteBackground.address);

  const remoteBase = await ERC721Factory.deploy(remoteBaseBaseURI, externalURI);
  await remoteBase.deployed();
  console.log("Base deployed to:   ", remoteBase.address);

  const remoteHead = await ERC721Factory.deploy(remoteHeadBaseURI, externalURI);
  await remoteHead.deployed();
  console.log("Head deployed to:   ", remoteHead.address);

  const remoteFace = await ERC721Factory.deploy(remoteFaceBaseURI, externalURI);
  await remoteFace.deployed();
  console.log("Face deployed to:   ", remoteFace.address);

  const remoteBadge = await ERC721Factory.deploy(remoteBadgeBaseURI, externalURI);
  await remoteBadge.deployed();
  console.log("Badge deployed to:  ", remoteBadge.address);

  let contractData = {
    topAddress: top.address,
    avatarAddress: avatar.address,
    remoteBackgroundAddress: remoteBackground.address,
    remoteBaseAddress: remoteBase.address,
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
