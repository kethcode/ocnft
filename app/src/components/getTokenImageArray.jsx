import { ethers } from "ethers";
import { Buffer } from "buffer";

const getTokenImageArray = async (own_token, con_addr, con_abi) => {
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();
  const contract = new ethers.Contract(con_addr, con_abi, signer);

  try {
    let length = own_token.length;
    let imageList = {};

    for (let i = 0; i < length; i++) {
      let encodedMetadata = await contract.tokenURI(own_token[i]);
      let decodedMetadata = Buffer.from(
        encodedMetadata.replace("data:application/json;base64,", ""),
        "base64"
      ).toString();
      let parsedMetadata = JSON.parse(decodedMetadata);
      imageList[own_token[i]] = parsedMetadata["image"];
    }
    // console.log(imageList);
    return imageList;

    // let encodedMetadata = await contract.tokenURI(own_token);
    // let decodedMetadata = Buffer.from(
    //   encodedMetadata.replace("data:application/json;base64,", ""),
    //   "base64"
    // ).toString();
    // let parsedMetadata = JSON.parse(decodedMetadata);
    // // console.log(parsedMetadata["image"]);
    // return parsedMetadata["image"];
  } catch (e) {
    console.log("getTokenImage:", e);
  }
};

export default getTokenImageArray;
