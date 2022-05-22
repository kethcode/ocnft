const fs = require("fs");
const path = require("path");
const stream = require("stream");

require("dotenv").config();
const ethers = require("ethers");
const provider_env = process.env.QUICKNODE_KEY_RINKEBY;
const wallet_env = process.env.PRIVATE_KEY_RINKEBY;
const provider = new ethers.providers.JsonRpcProvider(provider_env);
const wallet = new ethers.Wallet(wallet_env, provider);

const path_abi_Composable = "./abi/Composable.json";
const path_abi_NFT_721E = "./abi/NFT_721E.json";
const path_data = path.resolve(__dirname, `./data/`);

const { createCanvas, loadImage } = require("canvas");

const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const app = express();
const port = 4200;

const getFeatureUpdateHistory = async (contractAddress) => {
  //console.log("getFeatureUpdateHistory(%s %d)", contractAddress, tokenId);
  let lastUpdated = 10715427;

  let abiComposable = JSON.parse(
    fs.readFileSync(path_abi_Composable, { flag: "r+" })
  );

  const provider = new ethers.providers.JsonRpcProvider(provider_env);
  const contract = new ethers.Contract(
    contractAddress,
    abiComposable["abi"],
    provider
  );

  // let blockNum = await provider.getBlockNumber();
  let blockOfLatestFeatureUpdate = 0;

  filterFrom = contract.filters.FeatureConfigured();
  let events = await contract.queryFilter(filterFrom, 10715427);
  events.forEach((element) => {
    if (parseInt(element["blockNumber"]) > blockOfLatestFeatureUpdate) {
      blockOfLatestFeatureUpdate = parseInt(element["blockNumber"]);
    }
  });
  console.log("latest:", blockOfLatestFeatureUpdate);
  return blockOfLatestFeatureUpdate;
};

const needsRebuild = async (contractAddressString, tokenId) => {
  let lastUpdated = 10715427;
  let path_contract_folder = path_data + "/" + contractAddressString;

  // does this tokenId have an image yet?
  let path_token_image =
    path_contract_folder + "/images/" + tokenId.toString() + ".png";
  let path_token_metadata =
    path_contract_folder + "/metadata/" + tokenId.toString() + ".json";

    let abiComposable = JSON.parse(
      fs.readFileSync(path_abi_Composable, { flag: "r+" })
    );

  try {
    let token_image = fs.readFileSync(path_token_image, { flag: "r+" });
    console.log("token %s image exists", path_token_image);

    // it exists, so it should have metadata too
    try {
      let token_metadata = fs.readFileSync(path_token_metadata, { flag: "r+" });
      
      // console.log(token_metadata);

      lastUpdated = await getFeatureUpdateHistory(
        contractAddressString
      );

      // console.log(lastUpdated);

      console.log(
        "%d < %d ?",
        JSON.parse(token_metadata)["lastUpdated"],
        lastUpdated
      );

      // console.log(JSON.parse(token_metadata));
      // if it is older than the most recent FeatureConfigured call, rebuild it
      if (JSON.parse(token_metadata)["lastUpdated"] < lastUpdated) {
        return true;
      }
      console.log("token %s metadata exists", path_token_metadata);

      // at this point, we think we are looking to use the cache.  however, we need to check
      // if any of the component nfts are also composable, and if they have updated since
      // the top level composable was last updated

      const composableContract = new ethers.Contract(
        contractAddressString,
        abiComposable["abi"],
        wallet
      );

      //const composable = composableContract.connect(wallet);

      let featureListstring = await composableContract.getConfiguredFeatures(tokenId);
      // console.log(featureListstring);

      let featureListJSON = JSON.parse(featureListstring.toString());
      // console.log(featureListJSON);

      let featureContract;
      let featureConnection;
      let abi_supportsInterface = ["function supportsInterface(bytes4 interfaceId) public view returns (bool)"];

      for (const key of Object.keys(featureListJSON)) {
        if (featureListJSON[key][1] != "0x00") {
          featureContract = new ethers.Contract(
            featureListJSON[key][1],
            abi_supportsInterface,
            wallet
          );
          // featureConnection = featureContract.connect(wallet);
          let isComposable = await featureContract.supportsInterface("0x09e3ba39");
          console.log("remote composable?", isComposable);

          if (isComposable) {

            featureUpdated = await getFeatureUpdateHistory(
              featureListJSON[key][1]
            );

            console.log(
              "%d < %d ?",
              JSON.parse(token_metadata)["lastUpdated"],
              featureUpdated
            );
      
            // if it is older than the most recent FeatureConfigured call, rebuild it
            if (JSON.parse(token_metadata)["lastUpdated"] < featureUpdated) {
              return true;
            }
          }
        }
      }
      
      // if we get here, we don't need to rebuild
      return false;

    } catch (e) {
      console.log("failed to read metadata:", e);
      return true;
    }
  } catch (e) {
    console.log("failed to read image:", e);
    return true;
  }
};

const cluster = require("cluster");
const os = require("os");

if (cluster.isPrimary) {
  const availableCpus = os.cpus();
  console.log(`Clustering to ${availableCpus.length} processes`);
  availableCpus.forEach(() => cluster.fork());
} else {
  const { pid } = process;

  /// ------------------------------------------------------------------------
  /// App Starts Here
  /// ------------------------------------------------------------------------

  // we still store images and metadata in contract specific folders
  app.get("/:contractAddress/:tokenId", async (req, res) => {
    // extract contract address string
    const contractAddressString = req.params.contractAddress;

    // validate it
    // is this a string
    // TODO: does it match an address format
    // TODO: is the contract an address?
    if (isNaN(contractAddressString)) {
      console.log(`invalid tokenId ${tokenIdString}`);
      return res.sendStatus(400);
    }

    // extract token Id
    const tokenIdString = req.params.tokenId.split(".")[0];
    const tokenId = parseInt(req.params.tokenId.split(".")[0]);

    // validate it
    // is it a number?
    // TODO: is it a valid token on the contract?
    if (isNaN(tokenId)) {
      console.log(`invalid tokenId ${tokenId}`);
      return res.sendStatus(400);
    }

    // does this contract have metadata yet?
    let path_contract_folder = path_data + "/" + contractAddressString;
    try {
      await fs.promises.access(path_contract_folder);
      console.log("dir %s exists", path_contract_folder);
    } catch {
      try {
        await fs.promises.mkdir(path_contract_folder);
        await fs.promises.mkdir(path_contract_folder + "/images");
        await fs.promises.mkdir(path_contract_folder + "/metadata");
        console.log("dir %s structure created", path_contract_folder);
      } catch (e) {
        console.log(e);
      }
    }

    // do we need to rebuild this image, or can we use the cached version?
    let rebuild_image = await needsRebuild(contractAddressString, tokenId);

    let path_token_image =
    path_contract_folder + "/images/" + tokenId.toString() + ".png";
  let path_token_metadata =
    path_contract_folder + "/metadata/" + tokenId.toString() + ".json";


    console.log("rebuild_image: ", rebuild_image);
    if (rebuild_image) {
      console.log(
        `building token ${tokenId} for composable nft ${contractAddressString}`
      );

      let lastUpdated = await getFeatureUpdateHistory(
        contractAddressString
      );

      let abiComposable = JSON.parse(
        fs.readFileSync(path_abi_Composable, { flag: "r+" })
      );
      let abiNFT_721E = JSON.parse(
        fs.readFileSync(path_abi_NFT_721E, { flag: "r+" })
      );

      const composableContract = new ethers.Contract(
        contractAddressString,
        abiComposable["abi"],
        wallet
      );
      const composable = composableContract.connect(wallet);

      // returns json { layer:[hash,addr,id,x,y,w,h], layer:[hash,addr,id,x,y,w,h] }
      let featureListstring = await composable.getConfiguredFeatures(tokenId);
      let featureListJSON = JSON.parse(featureListstring.toString());
      // console.log(featureListJSON);

      let NFT_721EContract;
      let NFT_721E;
      let encodedMetadata;
      let decodedMetadata;
      let parsedMetadata;

      // can use ethcall multicall later

      for (const key of Object.keys(featureListJSON)) {
        // console.log(featureListJSON[key][1])
        if (featureListJSON[key][1] != "0x00") {
          NFT_721EContract = new ethers.Contract(
            featureListJSON[key][1],
            abiNFT_721E["abi"],
            wallet
          );
          NFT_721E = NFT_721EContract.connect(wallet);
          encodedMetadata = await NFT_721E.tokenURI(
            parseInt(featureListJSON[key][2])
          );
          decodedMetadata = Buffer.from(
            encodedMetadata.replace("data:application/json;base64,", ""),
            "base64"
          ).toString();
          parsedMetadata = JSON.parse(decodedMetadata);
          featureListJSON[key].push(parsedMetadata["image"]);
        }
      }

      //console.log(featureListJSON);

      // layer it up
      let canvas;
      let ctx;
      let image;

      //canvas = createCanvas(imageFormat.width, imageFormat.height);
      // find the smallest layer number, use that to set image size
      var firstKey = Object.keys(featureListJSON)[0];
      canvas = createCanvas(
        featureListJSON[firstKey][5],
        featureListJSON[firstKey][6]
      );
      ctx = canvas.getContext("2d");

      for (const key of Object.keys(featureListJSON)) {
        image = await loadImage(featureListJSON[key][7]); // "image URI" extracted from metadata
        ctx.drawImage(
          image,
          featureListJSON[key][3], // x
          featureListJSON[key][4], // y
          featureListJSON[key][5], // w
          featureListJSON[key][6] // h
        );
      }

      // store the image and metadata in ram cache

      // store the image on the hard disk
      fs.writeFileSync(path_token_image, canvas.toBuffer("image/png"));

      // store the metadata on hard disk
      let token_metadata = {};
      token_metadata["lastUpdated"] = lastUpdated;
      fs.writeFileSync(path_token_metadata, JSON.stringify(token_metadata));

      console.log(`token ${tokenId} updated.`);
    } else {
      console.log(
        `retrieving token ${tokenId} for nft ${contractAddressString}`
      );
    }

    // return the image
    const r = fs.createReadStream(path_token_image); // or any other way to get a readable stream
    const ps = new stream.PassThrough(); // <---- this makes a trick with stream error handling
    stream.pipeline(
      r,
      ps, // <---- this makes a trick with stream error handling
      (err) => {
        if (err) {
          console.log(err); // No such file or any other kind of error
          return res.sendStatus(400);
        }
      }
    );
    ps.pipe(res); // <---- this makes a trick with stream error handling
  });

  app.listen(port, () => console.log(`OCNFT ${pid} started`));
}
