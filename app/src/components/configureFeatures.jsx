// tx = await ctzn.configureFeatures(0, [
//   [backgroundSlotHash, remoteBackground.address, 0],
//   [avatarSlotHash, host.address, 0],
// ]);
// await tx.wait();

import { ethers } from "ethers";

const configureFeatures = async (
  feature_hash,
  feature_addr,
  feature_token,
  con_addr,
  con_abi
) => {
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();
  const contract = new ethers.Contract(con_addr, con_abi, signer);

  try {
    let tx = await contract.configureFeatures(0, [
      [feature_hash, feature_addr, feature_token],
    ]);
    await tx.wait();
    console.log(
      "configureFeatures:",
      feature_hash,
      feature_addr,
      feature_token
    );
  } catch (e) {
    console.log("configureFeatures:", e);
  }
};

export default configureFeatures;
