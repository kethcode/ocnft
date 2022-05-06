const fs = require("fs");
const path = require("path");

const ethers = require("ethers");

const pinataSDK = require("@pinata/sdk");
const pinata = pinataSDK(
  process.env.PINATA_API_KEY,
  process.env.PINATA_SECRET_API_KEY
);

const path_contract_addresses = path.resolve(
  __dirname,
  `../data/contract_addresses.json`
);

const path_ipfshash_data = path.resolve(__dirname, `../data/ipfs_cids.json`);
const path_ipfshash_images_badge = path.resolve(__dirname, `../ipfs/badge/`);
const path_ipfshash_images_face = path.resolve(__dirname, `../ipfs/face/`);
const path_ipfshash_images_head = path.resolve(__dirname, `../ipfs/head/`);

const options_images_badge = {
  pinataMetadata: {
    name: "ocnft badge",
    keyvalues: {
      lastUpdated: Date(),
    },
  },
  pinataOptions: {
    cidVersion: 0,
  },
};

const options_images_face = {
  pinataMetadata: {
    name: "ocnft face",
    keyvalues: {
      lastUpdated: Date(),
    },
  },
  pinataOptions: {
    cidVersion: 0,
  },
};

const options_images_head = {
  pinataMetadata: {
    name: "ocnft head",
    keyvalues: {
      lastUpdated: Date(),
    },
  },
  pinataOptions: {
    cidVersion: 0,
  },
};

const main = async () => {
  pinata.testAuthentication().then((auth) => {
    console.log(auth);

    let cidData = {};

    // pin badges
    pinata
      .pinFromFS(path_ipfshash_images_badge, options_images_badge)
      .then((iResult) => {
        console.log(iResult);
        cidData["IpfsHash_badge"] = iResult["IpfsHash"];

        // pin faces
        pinata
          .pinFromFS(path_ipfshash_images_face, options_images_face)
          .then((iResult) => {
            console.log(iResult);
            cidData["IpfsHash_face"] = iResult["IpfsHash"];

            // pin hands
            pinata
              .pinFromFS(path_ipfshash_images_head, options_images_head)
              .then((iResult) => {
                console.log(iResult);
                cidData["IpfsHash_head"] = iResult["IpfsHash"];

                // save the cids
                fs.writeFileSync(
                  path_ipfshash_data,
                  JSON.stringify(cidData),
                  { flag: "w+" }
                );
              });
          });
      });
  });
};

(() => {
  main();
})();