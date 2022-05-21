import React, { useState, useEffect } from "react";

import "./styles.css";

import host from "../abi/host.json";

import {
  AVATAR_ADDRESS,
  BASE_ADDRESS,
  HEAD_ADDRESS,
  FACE_ADDRESS,
  BADGE_ADDRESS,
} from "../constants";

import getOwnedTokens from "../components/getOwnedTokens";
import getTokenImage from "../components/getTokenImage";
import getComposableFeatureData from "../components/getComposableFeatureData";

const Avatar = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [currentAccount, setCurrentAccount] = useState(null);

  const [avatarTokenID, setAvatarTokenID] = useState(null);
  const [avatarImageURI, setAvatarImageURI] = useState(null);

  const [baseTokenID, setBaseTokenID] = useState(null);
  const [headTokenID, setHeadTokenID] = useState(null);
  const [faceTokenID, setFaceTokenID] = useState(null);
  const [badge1TokenID, setBadge1TokenID] = useState(null);
  const [badge2TokenID, setBadge2TokenID] = useState(null);

  const [baseImageURI, setBaseImageURI] = useState(null);
  const [headImageURI, setHeadImageURI] = useState(null);
  const [faceImageURI, setFaceImageURI] = useState(null);
  const [badge1ImageURI, setBadge1ImageURI] = useState(null);
  const [badge2ImageURI, setBadge2ImageURI] = useState(null);

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
      if (avatarTokenID == null) {
        getOwnedTokens(currentAccount, AVATAR_ADDRESS, host.abi).then(
          (avatarTokenList) => {
            // for now, i'm going to use owned first token by default
            if (avatarTokenList) {
              setAvatarTokenID(avatarTokenList[0]);
            }
          }
        );
      } else if (avatarImageURI == null) {
        console.log("avatarTokenID:", avatarTokenID);
        getTokenImage(avatarTokenID, AVATAR_ADDRESS, host.abi).then(
          (imageURI) => {
            setAvatarImageURI(imageURI);
            setIsLoading(false);
          }
        );
      } else {
        getComposableFeatureData(avatarTokenID, AVATAR_ADDRESS, host.abi).then(
          (featureListJSON) => {
            console.log(featureListJSON);

            let badgeCount = 0;

            for (const key of Object.keys(featureListJSON)) {
              if (
                featureListJSON[key][1].toLowerCase() ===
                BASE_ADDRESS.toLowerCase()
              ) {
                setBaseTokenID(featureListJSON[key][2]);
                setBaseImageURI(featureListJSON[key][7]);
              } else if (
                featureListJSON[key][1].toLowerCase() ===
                HEAD_ADDRESS.toLowerCase()
              ) {
                setHeadTokenID(featureListJSON[key][2]);
                setHeadImageURI(featureListJSON[key][7]);
              } else if (
                featureListJSON[key][1].toLowerCase() ===
                FACE_ADDRESS.toLowerCase()
              ) {
                setFaceTokenID(featureListJSON[key][2]);
                setFaceImageURI(featureListJSON[key][7]);
              } else if (
                featureListJSON[key][1].toLowerCase() ===
                BADGE_ADDRESS.toLowerCase()
              ) {
                switch (badgeCount) {
                  case 0:
                    setBadge1TokenID(featureListJSON[key][2]);
                    setBadge1ImageURI(featureListJSON[key][7]);
                    break;
                  case 1:
                    setBadge2TokenID(featureListJSON[key][2]);
                    setBadge2ImageURI(featureListJSON[key][7]);
                    break;
                }
                badgeCount++;
              }
            }
          }
        );
      }
    }
  }, [
    currentAccount,
    avatarTokenID,
    avatarImageURI,
    baseTokenID,
    headTokenID,
    faceTokenID,
    badge1TokenID,
    badge2TokenID,
  ]);

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
      if (avatarTokenID != null) {
        return (
          <div className="content-container ">
            Avatar Card
            <br />
            <div className="image-space-wrapper">
              <img className="image-space" src={avatarImageURI} />
            </div>
            <br />
            <div className="content">
              <p>
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
                <br />
                <br />
                Base Token: {baseTokenID != null ? baseTokenID : "Not Found"}
                <br />
                Base Contract:{" "}
                {BASE_ADDRESS != null ? BASE_ADDRESS : "Not Found"}
                <br />
                Base ImageURI:{" "}
                <a
                  href={baseImageURI != null ? baseImageURI : "#"}
                  target="_blank"
                  rel="noreferrer"
                >
                  {baseImageURI != null ? baseImageURI : "Not Found"}
                </a>
                <br />
                <br />
                Head Token: {headTokenID != null ? headTokenID : "Not Found"}
                <br />
                Head Contract:{" "}
                {HEAD_ADDRESS != null ? HEAD_ADDRESS : "Not Found"}
                <br />
                Head ImageURI:{" "}
                <a
                  href={headImageURI != null ? headImageURI : "#"}
                  target="_blank"
                  rel="noreferrer"
                >
                  {headImageURI != null ? headImageURI : "Not Found"}
                </a>
                <br />
                <br />
                Face Token: {faceTokenID != null ? faceTokenID : "Not Found"}
                <br />
                Face Contract:{" "}
                {FACE_ADDRESS != null ? FACE_ADDRESS : "Not Found"}
                <br />
                Face ImageURI:{" "}
                <a
                  href={faceImageURI != null ? faceImageURI : "#"}
                  target="_blank"
                  rel="noreferrer"
                >
                  {faceImageURI != null ? faceImageURI : "Not Found"}
                </a>
                <br />
                <br />
                Badge1 Token:{" "}
                {badge1TokenID != null ? badge1TokenID : "Not Found"}
                <br />
                Badge1 Contract:{" "}
                {BADGE_ADDRESS != null ? BADGE_ADDRESS : "Not Found"}
                <br />
                Badge1 ImageURI:{" "}
                <a
                  href={badge1ImageURI != null ? badge1ImageURI : "#"}
                  target="_blank"
                  rel="noreferrer"
                >
                  {badge1ImageURI != null ? badge1ImageURI : "Not Found"}
                </a>
                <br />
                <br />
                Badge2 Token:{" "}
                {badge2TokenID != null ? badge2TokenID : "Not Found"}
                <br />
                Badge2 Contract:{" "}
                {BADGE_ADDRESS != null ? BADGE_ADDRESS : "Not Found"}
                <br />
                Badge2 ImageURI:{" "}
                <a
                  href={badge2ImageURI != null ? badge2ImageURI : "#"}
                  target="_blank"
                  rel="noreferrer"
                >
                  {badge2ImageURI != null ? badge2ImageURI : "Not Found"}
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

export default Avatar;
