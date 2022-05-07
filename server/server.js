require("dotenv").config();

const provider_env = process.env.ALCHEMY_KEY_RINKEBY;
const wallet_env = process.env.PRIVATE_KEY_RINKEBY;

const fs = require("fs");
const path = require("path");

const stream = require("stream");
const client = require("https");

const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
const port = 4200;

const { createCanvas, loadImage } = require("canvas");
const baseImagePath = '../ipfs/base.png'

const imageFormat = {
  width: 350,
  height: 350,
};

const ethers = require("ethers");
const path_contract_addresses = "../data/contract_addresses.json";
const abi_hostGetFeatureList = [
  "function getFeatureList(uint256) view returns (string memory)",
];
const abi_remoteTokenURI = [
  "function tokenURI(uint256 _tokenId) public view returns (string memory)",
];

function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    client.get(url, (res) => {
      if (res.statusCode === 200) {
        res
          .pipe(fs.createWriteStream(filepath))
          .on("error", reject)
          .once("close", () => resolve(filepath));
      } else {
        // Consume response data to free up memory
        res.resume();
        reject(
          new Error(`Request Failed With a Status Code: ${res.statusCode}`)
        );
      }
    });
  });
}

app.use(cors());

// Configuring body parser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get("/:tokenId", async (req, res) => {
  const tokenIdString = req.params.tokenId.split(".")[0]
  if(isNaN(tokenIdString))
  {
    console.log(`invalid tokenId ${tokenIdString}`);
    return res.sendStatus(400);
  }

  const tokenId = parseInt(req.params.tokenId.split(".")[0]);
  console.log(`building token ${tokenId}`);

  let contractData = JSON.parse(
    fs.readFileSync(path_contract_addresses, { flag: "r+" })
  );

  const provider = new ethers.providers.JsonRpcProvider(provider_env);
  const wallet = new ethers.Wallet(wallet_env, provider);

  const hostContract = new ethers.Contract(
    contractData["hostAddress"],
    abi_hostGetFeatureList,
    wallet
  );
  const host = hostContract.connect(wallet);

  let featureListstring = await host.getFeatureList(tokenId);
  let featureListJSON = JSON.parse(featureListstring.toString());
  console.log(featureListJSON);

  // at this point, I know every featurename
  // how can I associate contracta addresses with the...
  // oh, i just grab them from the featureList.  derp.

  // eg featurelist object:
  // {
  //   HEAD_SLOT: [ '0x6602eab3eda0feaaaa2408d30d191c109eae3d7c', '4' ],
  //   FACE_SLOT: [ '0x0846510777bb7bfcc1d8909a1a28638f98d17ff4', '1' ],
  //   BADGE1_SLOT: [ '0xf4764a8fcb7ace782b5eedc944319899ce78b11a', '4' ],
  //   BADGE2_SLOT: [ '0xf4764a8fcb7ace782b5eedc944319899ce78b11a', '1' ]
  // }


  let remoteContract;
  let remoteConnection;
  let encodedMetadata;
  let decodedMetadata;
  let parsedMetadata
  let imageURI = {};
  
// can use ethcall multicall later

  for(const key of Object.keys(featureListJSON)) {
    if(featureListJSON[key][0] != '0x00')
    {
      remoteContract = new ethers.Contract(featureListJSON[key][0],abi_remoteTokenURI,wallet)
      remoteConnection = remoteContract.connect(wallet)
      encodedMetadata = await remoteConnection.tokenURI(parseInt(featureListJSON[key][1]))
      decodedMetadata = Buffer.from(encodedMetadata.replace('data:application/json;base64,',''), 'base64').toString()
      parsedMetadata = JSON.parse(decodedMetadata)
      imageURI[key] = parsedMetadata['image']
    }
  }

  console.log(imageURI)

    // layer it up
  let canvas;
  let ctx;

  canvas = createCanvas(imageFormat.width, imageFormat.height);
  ctx = canvas.getContext("2d");

  let image = await loadImage(baseImagePath);
  ctx.drawImage(image,0,0,imageFormat.width,imageFormat.height);

  let head_image;
  let head_found = false;
  for(const key of Object.keys(imageURI)) {

    image = await loadImage(imageURI[key])
    switch(key) {
      case 'HEAD_SLOT':
        // delay render so it's on top
        head_image = image;
        head_found = true;
        break;
      case 'FACE_SLOT':
        ctx.drawImage(image,0,0,imageFormat.width,imageFormat.height);
        break;
      case 'BADGE1_SLOT':
        ctx.drawImage(image,10,310,30,30);
        break;
      case 'BADGE2_SLOT':
        ctx.drawImage(image,40,310,30,30);
        break;
    }
  }
  if(head_found)
  {
    ctx.drawImage(head_image,100,130 - head_image.height,150,head_image.height);
  }
  

  fs.writeFileSync( './images/' + tokenId.toString() + '.png', canvas.toBuffer("image/png") );
  console.log(`token ${tokenId} updated.`)

  // return the image
  const r = fs.createReadStream('./images/' + tokenId.toString() + '.png') // or any other way to get a readable stream
  const ps = new stream.PassThrough() // <---- this makes a trick with stream error handling
  stream.pipeline(
   r,
   ps, // <---- this makes a trick with stream error handling
   (err) => {
    if (err) {
      console.log(err) // No such file or any other kind of error
      return res.sendStatus(400);
    }
  })
  ps.pipe(res) // <---- this makes a trick with stream error handling




  //   const baseImage = await loadImage(imageURIjson['HEAD_SLOT']);
  // const headImage = await loadImage(imageURIjson['HEAD_SLOT']);
  // const faceImage = await loadImage(imageURIjson['FACE_SLOT']);
  // const badge1Image = await loadImage(imageURIjson['BADGE1_SLOT']);
  // const badge2Image = await loadImage(imageURIjson['BADGE2_SLOT']);


  // ctx.drawImage(headImage,0,0,imageFormat.width,imageFormat.height);
  // ctx.drawImage(handImage,0,0,imageFormat.width,imageFormat.height);
  // ctx.drawImage(bodyImage,0,0,imageFormat.width,imageFormat.height);
  // ctx.drawImage(badgeImage,0,0,imageFormat.width,imageFormat.height);

  // await Promise.all(files.map(async (file) => {
  //   const contents = await fs.readFile(file, 'utf8')
  //   console.log(contents)
  // }));

  // const remoteHeadContract = new ethers.Contract(
  //   contractData["remoteHeadAddress"],
  //   abi_remoteTokenURI,
  //   wallet
  // );
  // const remoteFaceContract = new ethers.Contract(
  //   contractData["remoteFaceAddress"],
  //   abi_remoteTokenURI,
  //   wallet
  // );
  // const remoteBadgeContract = new ethers.Contract(
  //   contractData["remoteBadgeAddress"],
  //   abi_remoteTokenURI,
  //   wallet
  // );




  // const featureSlotLabels = ['HEAD_SLOT', 'FACE_SLOT', 'BADGE_SLOT1', 'BADGE_SLOT2'];

  // let featureContracts = [
  //   remoteHeadContract.connect(wallet),
  //   remoteFaceContract.connect(wallet),
  //   remoteBadgeContract.connect(wallet),
  //   remoteBadgeContract.connect(wallet),
  // ];

  // //console.log(await featureContracts[0].tokenURI(parseInt(featureListJSON[featureSlotLabels[0]][1])))

  // let tokenURIbase64 = [];

  // // go to each contract in the featurelist
  // for (let i = 0; i < Object.keys(featureListJSON).length; i++) {
    
  //   tokenURI.push(await featureContracts[i].tokenURI(parseInt(featureListJSON[Object.keys(featureListJSON)[i]][1])))
  // }
  // console.log(tokenURIbase64)
  // console.log(tokenURIbase64[0])
  // console.log(tokenURIbase64[0].replace('data:application/json;base64,',''))
  // console.log(Buffer.from(tokenURIbase64[0].replace('data:application/json;base64,',''), 'base64'))
  // console.log((Buffer.from(tokenURIbase64[0].replace('data:application/json;base64,',''), 'base64')).toString())
  // console.log(JSON.parse(Buffer.from(tokenURIbase64[0].replace('data:application/json;base64,',''), 'base64').toString()))
  // console.log(JSON.parse(Buffer.from(tokenURIbase64[0].replace('data:application/json;base64,',''), 'base64').toString())['image'])



  // // retreive and decode base64 json
  // let tokenURIJSON = [];
  // for (let i = 0; i < Object.keys(featureListJSON).length; i++) {
    
  //   tokenURIJSON.push(JSON.parse(Buffer.toString(Buffer.from(tokenURIbase64[i].replace('data:application/json;base64,',''), 'base64'))));
  // }
  // console.log(tokenURIJSON)

  // extract image: URI

  // caching options
  // const headPath = './images/cache/head_' + tokenId.toString() + '.png';
  // const handPath = './images/cache/hand_' + tokenId.toString() + '.png';
  // const bodyPath = './images/cache/body_' + tokenId.toString() + '.png';
  // const badgePath = './images/cache/badge_' + tokenId.toString() + '.png';

  // await downloadImage(imageURIjson['HEAD_SLOT'], headPath)
  // await downloadImage(imageURIjson['HAND_SLOT'], handPath)
  // await downloadImage(imageURIjson['BODY_SLOT'], bodyPath)
  // await downloadImage(imageURIjson['BADGE_SLOT'], badgePath)

  // const baseImage = await loadImage(imageURIjson['HEAD_SLOT']);
  // const headImage = await loadImage(imageURIjson['HEAD_SLOT']);
  // const faceImage = await loadImage(imageURIjson['FACE_SLOT']);
  // const badge1Image = await loadImage(imageURIjson['BADGE1_SLOT']);
  // const badge2Image = await loadImage(imageURIjson['BADGE2_SLOT']);

  // // layer it up
  // let canvas;
  // let ctx;

  // canvas = createCanvas(imageFormat.width, imageFormat.height);
  // ctx = canvas.getContext("2d");

  // ctx.drawImage(headImage,0,0,imageFormat.width,imageFormat.height);
  // ctx.drawImage(handImage,0,0,imageFormat.width,imageFormat.height);
  // ctx.drawImage(bodyImage,0,0,imageFormat.width,imageFormat.height);
  // ctx.drawImage(badgeImage,0,0,imageFormat.width,imageFormat.height);

  // fs.writeFileSync( './images/' + tokenId.toString() + '.png', canvas.toBuffer("image/png") );
  // console.log(`token ${tokenId} updated.`)

  // //eturn the image
  // const r = fs.createReadStream('./images/' + tokenId.toString() + '.png') // or any other way to get a readable stream
  // const ps = new stream.PassThrough() // <---- this makes a trick with stream error handling
  // stream.pipeline(
  //  r,
  //  ps, // <---- this makes a trick with stream error handling
  //  (err) => {
  //   if (err) {
  //     console.log(err) // No such file or any other kind of error
  //     return res.sendStatus(400);
  //   }
  // })
  // ps.pipe(res) // <---- this makes a trick with stream error handling
});

app.listen(port, () => console.log(`OCNFT server listening on port ${port}`));
