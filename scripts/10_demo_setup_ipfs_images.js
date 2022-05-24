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

const ipfs_gateway = "https://kethic.mypinata.cloud/ipfs/";
const composeServerURI = "http://207.246.72.251:4200/";
const externalURI = "https://207.246.72.251:3000/";

const path_ipfshash_data = path.resolve(__dirname, `../data/ipfs_cids.json`);
const path_ipfshash_images_badge = path.resolve(__dirname, `../ipfs/badge/`);
const path_ipfshash_images_face = path.resolve(__dirname, `../ipfs/face/`);
const path_ipfshash_images_head = path.resolve(__dirname, `../ipfs/head/`);
const path_ipfshash_images_base = path.resolve(__dirname, `../ipfs/base/`);
const path_ipfshash_images_background = path.resolve(
  __dirname,
  `../ipfs/background/`
);

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

const options_images_base = {
  pinataMetadata: {
    name: "ocnft base",
    keyvalues: {
      lastUpdated: Date(),
    },
  },
  pinataOptions: {
    cidVersion: 0,
  },
};

const options_images_background = {
  pinataMetadata: {
    name: "ocnft background",
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

    // pin base
    pinata
      .pinFromFS(path_ipfshash_images_base, options_images_base)
      .then((iResult) => {
        console.log(iResult);
        cidData["IpfsHash_base"] = iResult["IpfsHash"];

        // pin ctzn
        pinata
          .pinFromFS(path_ipfshash_images_background, options_images_background)
          .then((iResult) => {
            console.log(iResult);
            cidData["IpfsHash_background"] = iResult["IpfsHash"];

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
                          {
                            flag: "w+",
                          }
                        );
                      });
                  });
              });
          });
      });
  });
};

(() => {
  main();
})();
