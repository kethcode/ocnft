require("dotenv").config();

const provider_env = process.env.ALCHEMY_KEY_RINKEBY;
const wallet_env = process.env.PRIVATE_KEY_RINKEBY;

const fs = require("fs");
const stream = require('stream')
const client = require('https');

const express = require('express')
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = 4200;

const { createCanvas, loadImage } = require("canvas");
const image_path = "./images";

const imageFormat = {
  width: 350,
  height: 350
};

const ethers = require('ethers');
const path_contract_addresses = "../data/contract_addresses.json";
const abi_hostGetFeatureList = ["function getFeatureList(uint256) view returns (string memory)"];

function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
      client.get(url, (res) => {
          if (res.statusCode === 200) {
              res.pipe(fs.createWriteStream(filepath))
                  .on('error', reject)
                  .once('close', () => resolve(filepath));
          } else {
              // Consume response data to free up memory
              res.resume();
              reject(new Error(`Request Failed With a Status Code: ${res.statusCode}`));

          }
      });
  });
}

app.use(cors());

// Configuring body parser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get('/:tokenId', async (req, res) => {

  const tokenId = parseInt(req.params.tokenId.split('.')[0]);
    
  console.log(`building token ${tokenId}`)
  //res.status(200).send(`building token ${tokenId}`);

  // retreive remote images

  // get imageURIs from host contract
  let contractData = JSON.parse(
    fs.readFileSync(path_contract_addresses, { flag: "r+" })
  );

  const provider = new ethers.providers.JsonRpcProvider(provider_env)
  const wallet = new ethers.Wallet(wallet_env, provider)

  const contract = new ethers.Contract(contractData['hostAddress'], abi_hostGetFeatureList, wallet);
  const host = contract.connect(wallet)

  let imageURIstring = await host.getFeatureList(tokenId);
  let imageURIjson = JSON.parse(imageURIstring.toString())
  //console.log(imageURIjson);

  // caching options
  // const headPath = './images/cache/head_' + tokenId.toString() + '.png';
  // const handPath = './images/cache/hand_' + tokenId.toString() + '.png';
  // const bodyPath = './images/cache/body_' + tokenId.toString() + '.png';
  // const badgePath = './images/cache/badge_' + tokenId.toString() + '.png';

  // await downloadImage(imageURIjson['HEAD_SLOT'], headPath)
  // await downloadImage(imageURIjson['HAND_SLOT'], handPath)
  // await downloadImage(imageURIjson['BODY_SLOT'], bodyPath)
  // await downloadImage(imageURIjson['BADGE_SLOT'], badgePath)

  const headImage = await loadImage(imageURIjson['HEAD_SLOT']);
  const handImage = await loadImage(imageURIjson['HAND_SLOT']);
  const bodyImage = await loadImage(imageURIjson['BODY_SLOT']);
  const badgeImage = await loadImage(imageURIjson['BADGE_SLOT']);


  // layer it up
  let canvas;
  let ctx;

  canvas = createCanvas(imageFormat.width, imageFormat.height);
  ctx = canvas.getContext("2d");
  
  ctx.drawImage(headImage,0,0,imageFormat.width,imageFormat.height);
  ctx.drawImage(handImage,0,0,imageFormat.width,imageFormat.height);
  ctx.drawImage(bodyImage,0,0,imageFormat.width,imageFormat.height);
  ctx.drawImage(badgeImage,0,0,imageFormat.width,imageFormat.height);

  fs.writeFileSync( './images/' + tokenId.toString() + '.png', canvas.toBuffer("image/png") );
  console.log(`token ${tokenId} updated.`)

  //eturn the image
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
});

app.listen(port, () => console.log(`OCNFT server listening on port ${port}`));