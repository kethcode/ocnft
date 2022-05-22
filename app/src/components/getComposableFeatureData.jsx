import { ethers } from "ethers";
import { Buffer } from "buffer";

import NFT_721E from "../abi/NFT_721E.json";

const getComposableFeatureData = async (own_token, con_addr, con_abi) => {
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();
  let  contract = new ethers.Contract(con_addr, con_abi, signer);

  try {
    const featureList = await contract.getConfiguredFeatures(own_token);
    const featureListJSON = JSON.parse(featureList);

    for (const key of Object.keys(featureListJSON)) {
      if (featureListJSON[key][1] != "0x00") {
        contract = new ethers.Contract(
          featureListJSON[key][1],
          NFT_721E.abi,
          signer
        );
        let encodedMetadata = await contract.tokenURI(
          parseInt(featureListJSON[key][2])
        );
        let decodedMetadata = Buffer.from(
          encodedMetadata.replace("data:application/json;base64,", ""),
          "base64"
        ).toString();
        let parsedMetadata = JSON.parse(decodedMetadata);
        featureListJSON[key].push(parsedMetadata["image"]);
      }
    }

    console.log(featureListJSON);
    return featureListJSON;

  } catch (e) {
    console.log("getComposableFeatureData:", e);
  }
};

export default getComposableFeatureData;
