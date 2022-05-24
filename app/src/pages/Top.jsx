import React, { useState, useEffect } from "react";
import { ethers } from "ethers";

import "./styles.css";

import Composable from "../abi/Composable.json";

import { TOP_ADDRESS, AVATAR_ADDRESS, BACK_ADDRESS } from "../constants";

import getOwnedTokens from "../components/getOwnedTokens";
import getTokenImage from "../components/getTokenImage";
import getComposableFeatureData from "../components/getComposableFeatureData";
import configureFeatures from "../components/configureFeatures";

const Top = () => {
  const [currentAccount, setCurrentAccount] = useState(null);

  const [topTokenID, settopTokenID] = useState(null);
  const [topImageURI, settopImageURI] = useState(null);
  const [backgroundTokenID, setBackgroundTokenID] = useState(null);
  const [backgroundImageURI, setBackgroundImageURI] = useState(null);
  const [avatarTokenID, setAvatarTokenID] = useState(null);
  const [avatarImageURI, setAvatarImageURI] = useState(null);

  const [avatarAddressOverride, setAvatarAddressOverride] =
    useState(AVATAR_ADDRESS);
  const [avatarTokenIdOverride, setAvatarTokenIdOverride] = useState(0);
  const [avatarOverrideEnabled, setAvatarOverrideEnabled] = useState(false);

  const avatarSlotHash = ethers.utils.keccak256(
    ethers.utils.toUtf8Bytes("AVATAR_SLOT")
  );

  const checkIfWalletIsConnected = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        console.log("get metamask");
        return;
      } else {
        console.log("connected ethereum");

        let chainId = await ethereum.request({ method: "eth_chainId" });
        console.log("chianId:", chainId);

        const rinkebyChainId = "0x4";
        if (chainId !== rinkebyChainId) {
          alert(`You are not on Rinkeby.`);
        }

        const accounts = await ethereum.request({ method: "eth_accounts" });

        if (accounts.length !== 0) {
          const account = accounts[0];
          console.log("authorized", account);
          setCurrentAccount(account);
        } else {
          console.log("no account");
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  const connectWalletAction = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("get metamask");
        return;
      }

      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });

      console.log("connected ", accounts[0]);
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    checkIfWalletIsConnected();
  }, []);

  useEffect(() => {
    if (currentAccount != null) {
      if (topTokenID == null) {
        getOwnedTokens(currentAccount, TOP_ADDRESS, Composable.abi).then(
          (topTokenList) => {
            // for now, i'm going to use owned first token by default
            if (topTokenList) {
              settopTokenID(topTokenList[0]);
            }
          }
        );
      } else if (topImageURI == null) {
        console.log("topTokenID:", topTokenID);
        getTokenImage(topTokenID, TOP_ADDRESS, Composable.abi).then(
          (imageURI) => {
            settopImageURI(imageURI);
          }
        );
      } else {
        getComposableFeatureData(topTokenID, TOP_ADDRESS, Composable.abi).then(
          (featureListJSON) => {
            console.log(featureListJSON);

            for (const key of Object.keys(featureListJSON)) {
              if (
                featureListJSON[key][1].toLowerCase() ===
                AVATAR_ADDRESS.toLowerCase()
              ) {
                setAvatarTokenID(featureListJSON[key][2]);
                setAvatarImageURI(featureListJSON[key][7]);
              } else if (
                featureListJSON[key][1].toLowerCase() ===
                BACK_ADDRESS.toLowerCase()
              ) {
                setBackgroundTokenID(featureListJSON[key][2]);
                setBackgroundImageURI(featureListJSON[key][7]);
              }
            }
          }
        );
      }
    }
  }, [currentAccount, topTokenID, topImageURI, avatarTokenID, avatarOverrideEnabled]);

  const addressChangeHandler = (e) => {
    setAvatarAddressOverride(e.target.value);
  };

  const tokenIdChangeHandler = (e) => {
    setAvatarTokenIdOverride(e.target.value);
  };

  const onSubmit = (e) => {
    setAvatarOverrideEnabled(avatarAddressOverride != AVATAR_ADDRESS);
    console.log("setAvatarOverride:", avatarAddressOverride != AVATAR_ADDRESS);
    console.log("avatarAddressOverride:", avatarAddressOverride);
    console.log("avatarTokenIdOverride:", avatarTokenIdOverride);

    //update Top
    configureFeatures(TOP_ADDRESS, topTokenID, [
      [avatarSlotHash, avatarAddressOverride, avatarTokenIdOverride]
    ]);
  };

  const renderContent = () => {
    if (!currentAccount) {
      return (
        <div className="connect-wallet-container">
          <button
            className="cta-button connect-wallet-button"
            onClick={connectWalletAction}
          >
            Connect Wallet To Get Started
          </button>
        </div>
      );
    } else {
      if (topTokenID != null) {
        return (
          <>
            <div className="transaction-flow__container">
              <div class="transaction-flow__mode-types">Top Card</div>
              <div class="image-space-wrapper">
                <img src={topImageURI} />
              </div>
              <br />
              <div class="content">
                <p>
                  Top Token: {topTokenID != null ? topTokenID : "Not Found"}
                  <br />
                  Top Contract:{" "}
                  {TOP_ADDRESS != null ? TOP_ADDRESS : "Not Found"}
                  <br />
                  Top ImageURI:{" "}
                  <a
                    href={topImageURI != null ? topImageURI : "#"}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {topImageURI != null ? topImageURI : "Not Found"}
                  </a>
                  <br />
                  <br />
                  Background Token:{" "}
                  {backgroundTokenID != null ? backgroundTokenID : "Not Found"}
                  <br />
                  Background Contract:{" "}
                  {BACK_ADDRESS != null ? BACK_ADDRESS : "Not Found"}
                  <br />
                  Background ImageURI:{" "}
                  <a
                    href={backgroundImageURI != null ? backgroundImageURI : "#"}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {backgroundImageURI != null
                      ? backgroundImageURI
                      : "Not Found"}
                  </a>
                  <br />
                  <br />
                  Avatar Token:{" "}
                  {avatarTokenID != null ? avatarTokenID : "Not Found"}
                  <br />
                  Avatar Contract:{" "}
                  {AVATAR_ADDRESS != null ? AVATAR_ADDRESS : "Not Found"}
                  <br />
                  Avatar ImageURI:{" "}
                  <a
                    href={avatarImageURI != null ? avatarImageURI : "#"}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {avatarImageURI != null ? avatarImageURI : "Not Found"}
                  </a>
                </p>
              </div>
              <div class="builder__container">
                <div class="avatar_override__subcontainer">
                    <div>Override Avatar Token</div>
                    <div class="native-transaction__input-container ">
                      Address:
                      <input
                        class="input_style"
                        type="text"
                        id="inputAddr"
                        value={avatarAddressOverride}
                        onChange={addressChangeHandler}
                      />
                      TokenID:
                      <input
                        class="input_style"
                        type="number"
                        id="inputTokenId"
                        value={avatarTokenIdOverride}
                        onChange={tokenIdChangeHandler}
                      />
                    </div>
                    <div>Default Avatar Address: {AVATAR_ADDRESS}</div>
                    <div>
                      <button class="builder_commit_button" onClick={onSubmit}>
                        Save Override
                      </button>
                    </div>
                </div>
              </div>
            </div>
          </>
        );
      } else {
        // return <div>No top Token Found</div>;
      }
    }
  };

  return <div className="transaction-flow__wrapper">{renderContent()}</div>;
};

export default Top;
