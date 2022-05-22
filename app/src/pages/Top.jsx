import React, { useState, useEffect } from "react";

import "./styles.css";

import Composable from "../abi/Composable.json";

import { TOP_ADDRESS, AVATAR_ADDRESS, BACK_ADDRESS } from "../constants";

import getOwnedTokens from "../components/getOwnedTokens";
import getTokenImage from "../components/getTokenImage";
import getComposableFeatureData from "../components/getComposableFeatureData";

const Top = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [currentAccount, setCurrentAccount] = useState(null);

  const [topTokenID, settopTokenID] = useState(null);
  const [topImageURI, settopImageURI] = useState(null);
  const [backgroundTokenID, setBackgroundTokenID] = useState(null);
  const [backgroundImageURI, setBackgroundImageURI] = useState(null);
  const [avatarTokenID, setAvatarTokenID] = useState(null);
  const [avatarImageURI, setAvatarImageURI] = useState(null);

  const checkIfWalletIsConnected = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        console.log("get metamask");
        setIsLoading(false);
        return;
      } else {
        console.log("connected ethereum");

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
    setIsLoading(false);
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
    setIsLoading(true);
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
            setIsLoading(false);
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
  }, [currentAccount, topTokenID, topImageURI, avatarTokenID]);

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
          <div className="content-container ">
            Top Card
            <br />
            <div className="image-space-wrapper">
              <img className="image-space" src={topImageURI} />
            </div>
            <br />
            <div className="content">
              <p>
                Top Token: {topTokenID != null ? topTokenID : "Not Found"}
                <br />
                Top Contract: {TOP_ADDRESS != null ? TOP_ADDRESS : "Not Found"}
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
          </div>
        );
      } else {
        // return <div>No top Token Found</div>;
      }
    }
  };

  return (
    <div className="App">
      <div className="content-container">{renderContent()}</div>
    </div>
  );
};

export default Top;
