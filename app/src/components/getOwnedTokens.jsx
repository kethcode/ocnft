import { ethers } from "ethers";

const getOwnedTokens = async (own_addr, con_addr, con_abi) => {
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();
  const contract = new ethers.Contract(con_addr, con_abi, signer);

  const tokenList = [];

  try {
    const balance = await contract.balanceOf(own_addr);
    const length = parseInt(balance);
    if (length > 0) {
      for (let i = 0; i < length; i++) {
        await contract.tokenOfOwnerByIndex(own_addr, i).then((token) => {
          tokenList.push(parseInt(token));
        });
      }
      // console.log("tokenList:", tokenList);
      return tokenList;
    }
  } catch (e) {
    console.log("getOwnedTokens:", e);
  }
};

export default getOwnedTokens;
