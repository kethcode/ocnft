import { ethers } from "ethers";
import { Buffer } from "buffer";

const getTokenImage = async (own_token, con_addr, con_abi) => {
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();
  const contract = new ethers.Contract(con_addr, con_abi, signer);

  try {
    let encodedMetadata = await contract.tokenURI(own_token);
    let decodedMetadata = Buffer.from(
      encodedMetadata.replace("data:application/json;base64,", ""),
      "base64"
    ).toString();
    let parsedMetadata = JSON.parse(decodedMetadata);
    // console.log(parsedMetadata["image"]);
    return parsedMetadata["image"];
  } catch (e) {
    console.log("getTokenImage:", e);
  }
};

export default getTokenImage;
