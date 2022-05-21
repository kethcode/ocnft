import React, { useState, useEffect } from "react";

import "./styles.css";

import host from "../abi/host.json";

import { CTZN_ADDRESS, AVATAR_ADDRESS, BACK_ADDRESS } from "../constants";

import getOwnedTokens from "../components/getOwnedTokens";
import getTokenImage from "../components/getTokenImage";
import getComposableFeatureData from "../components/getComposableFeatureData";

const Citizen = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [currentAccount, setCurrentAccount] = useState(null);

  const [citizenTokenID, setCitizenTokenID] = useState(null);
  const [citizenImageURI, setCitizenImageURI] = useState(null);
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
      if (citizenTokenID == null) {
        getOwnedTokens(currentAccount, CTZN_ADDRESS, host.abi).then(
          (citizenTokenList) => {
            // for now, i'm going to use owned first token by default
            if (citizenTokenList) {
              setCitizenTokenID(citizenTokenList[0]);
            }
          }
        );
      } else if (citizenImageURI == null) {
        console.log("citizenTokenID:", citizenTokenID);
        getTokenImage(citizenTokenID, CTZN_ADDRESS, host.abi).then(
          (imageURI) => {
            setCitizenImageURI(imageURI);
            setIsLoading(false);
          }
        );
      } else {
        getComposableFeatureData(citizenTokenID, CTZN_ADDRESS, host.abi).then(
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
  }, [currentAccount, citizenTokenID, citizenImageURI, avatarTokenID]);

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
      if (citizenTokenID != null) {
        return (
          <div className="content-container ">
            Citizen Card
            <br />
            <div className="image-space-wrapper">
              <img className="image-space" src={citizenImageURI} />
            </div>
            <br />
            <div className="content">
              <p>
                Citizen Token:{" "}
                {citizenTokenID != null ? citizenTokenID : "Not Found"}
                <br />
                Citizen Contract:{" "}
                {CTZN_ADDRESS != null ? CTZN_ADDRESS : "Not Found"}
                <br />
                Citizen ImageURI:{" "}
                <a
                  href={citizenImageURI != null ? citizenImageURI : "#"}
                  target="_blank"
                  rel="noreferrer"
                >
                  {citizenImageURI != null ? citizenImageURI : "Not Found"}
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
        // return <div>No Citizen Token Found</div>;
      }
    }
  };

  return (
    <div className="App">
      <div className="content-container">{renderContent()}</div>
    </div>
  );
};

export default Citizen;
