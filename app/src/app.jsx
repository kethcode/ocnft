import React, { useState, useEffect } from "react";
// import ReactDOM from "react-dom/client";
// import Container from "react-bootstrap/Container";
// import Row from "react-bootstrap/Row";
// import Col from "react-bootstrap/Col";

import { Buffer } from "buffer";
import "./App.css";

import { ethers } from "ethers";

import host from "./abi/host.json";
import remote from "./abi/remote.json";

import {
  CTZN_ADDRESS,
  AVATAR_ADDRESS,
  BACK_ADDRESS,
  BASE_ADDRESS,
  HEAD_ADDRESS,
  FACE_ADDRESS,
  BADGE_ADDRESS,
  ALCHEMY_KEY_RINKEBY,
} from "./constants";

import getOwnedTokens from "./components/getOwnedTokens";
import getTokenImage from './components/getTokenImage';

function app() {
  const [isLoading, setIsLoading] = useState(false);
  const [currentAccount, setCurrentAccount] = useState(null);
  const [ctznTokenID, setCtznTokenID] = useState(null);
  const [ctznImageURI, setCtznImageURI] = useState(null);
  const [avatarTokenID, setAvatarTokenID] = useState(null);
  const [avatarImageURI, setAvatarImageURI] = useState(null);

  const connectMetamask = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        console.log("get metamask");
        setIsLoading(false);
        return;
      } else {
        console.log("connected metamask");

        const accounts = await ethereum.request({ method: "eth_accounts" });

        if (accounts.length !== 0) {
          const account = accounts[0];
          console.log("account:", account);
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

  const renderContent = () => {
    if (!currentAccount) {
      return (
        <div className="connect-wallet-container">
          <button
            className="cta-button connect-wallet-button"
            onClick={connectMetamask}
          >
            Connect Wallet To Get Started
          </button>
        </div>
      );
    } else {
      if (ctznTokenID != null) {
        return (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gridGap: 20,
            }}
          >
            <div>
              <p>Wallet:<br/>{currentAccount}</p>
              
              
              <img
                src={ctznImageURI}
                style={{ border: "1px solid #021a40", padding: 25 }}
              />
              <br />
              Found Citizen Token: {ctznTokenID}
              <br />
              <br />
              <img
                src={avatarImageURI}
                style={{ border: "1px solid #021a40" }}
              />
              <br />
              Found Avatar Token: {avatarTokenID}
            </div>
            <div>component nfts</div>
          </div>
        );
      } else {
        return <div>No CTZN Token Found</div>;
      }
    }
  };

  useEffect(() => {
    setIsLoading(true);
    connectMetamask();
  }, []);

  useEffect(() => {
    if (currentAccount != null) {
      if (ctznTokenID == null) {
        getOwnedTokens(currentAccount, CTZN_ADDRESS, host.abi).then(
          (citizenTokenList) => {
            // at this point, i'm going to assume the first token is their citizenship
            if (citizenTokenList) {
              setCtznTokenID(citizenTokenList[0]);
            }
          }
        );
      } else if (ctznImageURI == null) {
        console.log("ctznTokenID:", ctznTokenID);
        getTokenImage(ctznTokenID, CTZN_ADDRESS, host.abi).then((imageURI) => {
          setCtznImageURI(imageURI);
        })
      }

      if (avatarTokenID == null) {
        getOwnedTokens(currentAccount, AVATAR_ADDRESS, host.abi).then(
          (avatarTokenList) => {
            // at this point, i'm going to assume the first token is their avatar
            if (avatarTokenList) {
              setAvatarTokenID(avatarTokenList[0]);

            }
          }
        );
      } else if (avatarImageURI == null) {
        console.log("avatarTokenID:", avatarTokenID);
        getTokenImage(avatarTokenID, AVATAR_ADDRESS, host.abi).then((imageURI) => {
          setAvatarImageURI(imageURI);
        })
      }
    }
  }, [currentAccount, ctznTokenID, ctznImageURI, avatarTokenID, avatarImageURI]);

  return (
    <div className="App">
      <div className="header-container">
        <div className="header">OCNFT Demo</div>
      </div>
      <div className="content-container">{renderContent()}</div>
      {/* 
      <div className='footer-container'>
        <div className='footer'><p>footer</p></div>
      </div>
      */}
    </div>
  );
}

export default App;
