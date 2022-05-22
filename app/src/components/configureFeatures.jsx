import { ethers } from "ethers";

import Composable from "../abi/Composable.json";

const configureFeatures = async (
  composable_addr,
  composable_tokenId,
  featureData
) => {
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();
  const contract = new ethers.Contract(composable_addr, Composable.abi, signer);

  try {
    let tx = await contract.configureFeatures(composable_tokenId, featureData);
    await tx.wait();
    console.log(
      "configureFeatures:",
      composable_addr,
      composable_tokenId,
      featureData
    );
  } catch (e) {
    console.log("configureFeatures:", e);
  }
};

export default configureFeatures;
