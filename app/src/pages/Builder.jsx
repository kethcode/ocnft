import React, { useState, useEffect } from "react";
import "./styles.css";

import { ethers } from "ethers";
import host from "../abi/host.json";
import remote from "../abi/remote.json";

import {
  AVATAR_ADDRESS,
  BASE_ADDRESS,
  HEAD_ADDRESS,
  FACE_ADDRESS,
  BADGE_ADDRESS,
} from "../constants";

import getOwnedTokens from "../components/getOwnedTokens";
import getTokenImage from "../components/getTokenImage";
import getTokenImageArray from "../components/getTokenImageArray";
import getComposableFeatureData from "../components/getComposableFeatureData";
import configureFeatures from "../components/configureFeatures";

const headSlotHash = ethers.utils.keccak256(
  ethers.utils.toUtf8Bytes("HEAD_SLOT")
);

const faceSlotHash = ethers.utils.keccak256(
  ethers.utils.toUtf8Bytes("FACE_SLOT")
);

const badge1SlotHash = ethers.utils.keccak256(
  ethers.utils.toUtf8Bytes("BADGE1_SLOT")
);

const badge2SlotHash = ethers.utils.keccak256(
  ethers.utils.toUtf8Bytes("BADGE2_SLOT")
);

const Builder = () => {
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

  const [headSelectorReady, setHeadSelectorReady] = useState(false);
  const [headSelectorKey, setHeadSelectorKey] = useState(false);
  const [headSelectorImageList, setHeadSelectorImageList] = useState(false);
  const [headSelectorImageDisplay, setHeadSelectorImageDisplay] =
    useState(null);

  const [faceSelectorReady, setFaceSelectorReady] = useState(false);
  const [faceSelectorKey, setFaceSelectorKey] = useState(false);
  const [faceSelectorImageList, setFaceSelectorImageList] = useState(false);
  const [faceSelectorImageDisplay, setFaceSelectorImageDisplay] =
    useState(null);

  const [badge1SelectorReady, setBadge1SelectorReady] = useState(false);
  const [badge1SelectorKey, setBadge1SelectorKey] = useState(false);
  const [badge1SelectorImageList, setBadge1SelectorImageList] = useState(false);
  const [badge1SelectorImageDisplay, setBadge1SelectorImageDisplay] =
    useState(null);

  const [badge2SelectorReady, setBadge2SelectorReady] = useState(false);
  const [badge2SelectorKey, setBadge2SelectorKey] = useState(false);
  const [badge2SelectorImageList, setBadge2SelectorImageList] = useState(false);
  const [badge2SelectorImageDisplay, setBadge2SelectorImageDisplay] =
    useState(null);

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
      return <div className="content-container ">Builder</div>;
    }
  };

  /// ------------------------------------------------------------------------
  /// HEAD
  /// ------------------------------------------------------------------------

  useEffect(() => {
    // lets go get all the head token images
    if (headTokenID != null) {
      getOwnedTokens(currentAccount, HEAD_ADDRESS, remote.abi).then(
        (headTokenList) => {
          if (headTokenList) {
            getTokenImageArray(headTokenList, HEAD_ADDRESS, remote.abi).then(
              (imageList) => {
                setHeadSelectorImageList(imageList);
                setHeadSelectorKey(headTokenID);
                setHeadSelectorImageDisplay(imageList[headTokenID]);
                setHeadSelectorReady(true);
              }
            );
          }
        }
      );
    }
    // }
  }, [headTokenID]);

  const prevHead = () => {
    console.log("headSelectorKey: ", headSelectorKey);
    let keyIndex = Object.keys(headSelectorImageList).indexOf(headSelectorKey);
    if (keyIndex - 1 < 0) {
      keyIndex = Object.keys(headSelectorImageList).length - 1;
    } else {
      keyIndex = keyIndex - 1;
    }
    setHeadSelectorKey(Object.keys(headSelectorImageList)[keyIndex]);
  };

  const nextHead = () => {
    console.log("headSelectorKey: ", headSelectorKey);
    let keyIndex = Object.keys(headSelectorImageList).indexOf(headSelectorKey);
    if (keyIndex + 1 > Object.keys(headSelectorImageList).length - 1) {
      keyIndex = 0;
    } else {
      keyIndex = keyIndex + 1;
    }
    setHeadSelectorKey(Object.keys(headSelectorImageList)[keyIndex]);
  };

  const saveHead = () => {
    //const configureFeatures = async (feature_hash,feature_addr,feature_token,con_addr,con_abi)
    configureFeatures(
      headSlotHash,
      HEAD_ADDRESS,
      headSelectorKey,
      AVATAR_ADDRESS,
      host.abi
    );
  };

  useEffect(() => {
    setHeadSelectorImageDisplay(headSelectorImageList[headSelectorKey]);
  }, [headSelectorKey]);

  const headSelector = () => {
    if (headSelectorReady) {
      return (
        <div className="content-container">
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gridGap: 10,
            }}
          >
            <button onClick={prevHead}>Prev</button>
            <div className="image-space">
              <img className="image" src={headSelectorImageDisplay}></img>
            </div>
            <button onClick={nextHead}>Next</button>
            <button onClick={saveHead}>Save</button>
          </div>
        </div>
      );
    } else {
      return <div className="content-container ">Loading Headware...</div>;
    }
  };

  /// ------------------------------------------------------------------------
  /// FACE
  /// ------------------------------------------------------------------------
  useEffect(() => {
    // lets go get all the face token images
    if (faceTokenID != null) {
      getOwnedTokens(currentAccount, FACE_ADDRESS, remote.abi).then(
        (faceTokenList) => {
          if (faceTokenList) {
            getTokenImageArray(faceTokenList, FACE_ADDRESS, remote.abi).then(
              (imageList) => {
                setFaceSelectorImageList(imageList);
                setFaceSelectorKey(faceTokenID);
                setFaceSelectorImageDisplay(imageList[faceTokenID]);
                setFaceSelectorReady(true);
              }
            );
          }
        }
      );
    }
    // }
  }, [faceTokenID]);

  const prevFace = () => {
    console.log("faceSelectorKey: ", faceSelectorKey);
    let keyIndex = Object.keys(faceSelectorImageList).indexOf(faceSelectorKey);
    if (keyIndex - 1 < 0) {
      keyIndex = Object.keys(faceSelectorImageList).length - 1;
    } else {
      keyIndex = keyIndex - 1;
    }
    setFaceSelectorKey(Object.keys(faceSelectorImageList)[keyIndex]);
  };

  const nextFace = () => {
    console.log("faceSelectorKey: ", faceSelectorKey);
    let keyIndex = Object.keys(faceSelectorImageList).indexOf(faceSelectorKey);
    if (keyIndex + 1 > Object.keys(faceSelectorImageList).length - 1) {
      keyIndex = 0;
    } else {
      keyIndex = keyIndex + 1;
    }
    setFaceSelectorKey(Object.keys(faceSelectorImageList)[keyIndex]);
  };

  const saveFace = () => {
    //const configureFeatures = async (feature_hash,feature_addr,feature_token,con_addr,con_abi)
    configureFeatures(
      faceSlotHash,
      FACE_ADDRESS,
      faceSelectorKey,
      AVATAR_ADDRESS,
      host.abi
    );
  };

  useEffect(() => {
    setFaceSelectorImageDisplay(faceSelectorImageList[faceSelectorKey]);
  }, [faceSelectorKey]);

  const faceSelector = () => {
    if (faceSelectorReady) {
      return (
        <div className="content-container">
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gridGap: 10,
            }}
          >
            <button onClick={prevFace}>Prev</button>
            <div className="image-space">
              <img className="image" src={faceSelectorImageDisplay}></img>
            </div>
            <button onClick={nextFace}>Next</button>
            <button onClick={saveFace}>Save</button>
          </div>
        </div>
      );
    } else {
      return <div className="content-container ">Loading Faces...</div>;
    }
  };

  /// ------------------------------------------------------------------------
  /// BADGE1
  /// ------------------------------------------------------------------------
  useEffect(() => {
    // lets go get all the badge1 token images
    if (badge1TokenID != null) {
      getOwnedTokens(currentAccount, BADGE_ADDRESS, remote.abi).then(
        (badge1TokenList) => {
          if (badge1TokenList) {
            getTokenImageArray(badge1TokenList, BADGE_ADDRESS, remote.abi).then(
              (imageList) => {
                setBadge1SelectorImageList(imageList);
                setBadge1SelectorKey(badge1TokenID);
                setBadge1SelectorImageDisplay(imageList[badge1TokenID]);
                setBadge1SelectorReady(true);
              }
            );
          }
        }
      );
    }
    // }
  }, [badge1TokenID]);

  const prevBadge1 = () => {
    console.log("badge1SelectorKey: ", badge1SelectorKey);
    let keyIndex = Object.keys(badge1SelectorImageList).indexOf(
      badge1SelectorKey
    );
    if (keyIndex - 1 < 0) {
      keyIndex = Object.keys(badge1SelectorImageList).length - 1;
    } else {
      keyIndex = keyIndex - 1;
    }
    setBadge1SelectorKey(Object.keys(badge1SelectorImageList)[keyIndex]);
  };

  const nextBadge1 = () => {
    console.log("badge1SelectorKey: ", badge1SelectorKey);
    let keyIndex = Object.keys(badge1SelectorImageList).indexOf(
      badge1SelectorKey
    );
    if (keyIndex + 1 > Object.keys(badge1SelectorImageList).length - 1) {
      keyIndex = 0;
    } else {
      keyIndex = keyIndex + 1;
    }
    setBadge1SelectorKey(Object.keys(badge1SelectorImageList)[keyIndex]);
  };

  const saveBadge1 = () => {
    //const configureFeatures = async (feature_hash,feature_addr,feature_token,con_addr,con_abi)
    configureFeatures(
      badge1SlotHash,
      BADGE_ADDRESS,
      badge1SelectorKey,
      AVATAR_ADDRESS,
      host.abi
    );
  };

  useEffect(() => {
    setBadge1SelectorImageDisplay(badge1SelectorImageList[badge1SelectorKey]);
  }, [badge1SelectorKey]);

  const badge1Selector = () => {
    if (badge1SelectorReady) {
      return (
        <div className="content-container">
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gridGap: 10,
            }}
          >
            <button onClick={prevBadge1}>Prev</button>
            <div className="image-space">
              <img className="image" src={badge1SelectorImageDisplay}></img>
            </div>
            <button onClick={nextBadge1}>Next</button>
            <button onClick={saveBadge1}>Save</button>
          </div>
        </div>
      );
    } else {
      return <div className="content-container ">Loading Badges...</div>;
    }
  };

  /// ------------------------------------------------------------------------
  /// BADGE2
  /// ------------------------------------------------------------------------
  useEffect(() => {
    // lets go get all the badge2 token images
    if (badge2TokenID != null) {
      getOwnedTokens(currentAccount, BADGE_ADDRESS, remote.abi).then(
        (badge2TokenList) => {
          if (badge2TokenList) {
            getTokenImageArray(badge2TokenList, BADGE_ADDRESS, remote.abi).then(
              (imageList) => {
                setBadge2SelectorImageList(imageList);
                setBadge2SelectorKey(badge2TokenID);
                setBadge2SelectorImageDisplay(imageList[badge2TokenID]);
                setBadge2SelectorReady(true);
              }
            );
          }
        }
      );
    }
    // }
  }, [badge2TokenID]);

  const prevBadge2 = () => {
    console.log("badge2SelectorKey: ", badge2SelectorKey);
    let keyIndex = Object.keys(badge2SelectorImageList).indexOf(
      badge2SelectorKey
    );
    if (keyIndex - 1 < 0) {
      keyIndex = Object.keys(badge2SelectorImageList).length - 1;
    } else {
      keyIndex = keyIndex - 1;
    }
    setBadge2SelectorKey(Object.keys(badge2SelectorImageList)[keyIndex]);
  };

  const nextBadge2 = () => {
    console.log("badge2SelectorKey: ", badge2SelectorKey);
    let keyIndex = Object.keys(badge2SelectorImageList).indexOf(
      badge2SelectorKey
    );
    if (keyIndex + 1 > Object.keys(badge2SelectorImageList).length - 1) {
      keyIndex = 0;
    } else {
      keyIndex = keyIndex + 1;
    }
    setBadge2SelectorKey(Object.keys(badge2SelectorImageList)[keyIndex]);
  };

  const saveBadge2 = () => {
    //const configureFeatures = async (feature_hash,feature_addr,feature_token,con_addr,con_abi)
    configureFeatures(
      badge2SlotHash,
      BADGE_ADDRESS,
      badge2SelectorKey,
      AVATAR_ADDRESS,
      host.abi
    );
  };

  useEffect(() => {
    setBadge2SelectorImageDisplay(badge2SelectorImageList[badge2SelectorKey]);
  }, [badge2SelectorKey]);

  const badge2Selector = () => {
    if (badge2SelectorReady) {
      return (
        <div className="content-container">
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gridGap: 10,
            }}
          >
            <button onClick={prevBadge2}>Prev</button>
            <div className="image-space">
              <img className="image" src={badge2SelectorImageDisplay}></img>
            </div>
            <button onClick={nextBadge2}>Next</button>
            <button onClick={saveBadge2}>Save</button>
          </div>
        </div>
      );
    } else {
      return <div className="content-container ">Loading Badges...</div>;
    }
  };

  const saveAll = () => {
    configureFeatures(
      headSlotHash,
      HEAD_ADDRESS,
      headSelectorKey,
      AVATAR_ADDRESS,
      host.abi
    );
    configureFeatures(
      faceSlotHash,
      FACE_ADDRESS,
      faceSelectorKey,
      AVATAR_ADDRESS,
      host.abi
    );
    configureFeatures(
      badge1SlotHash,
      BADGE_ADDRESS,
      badge1SelectorKey,
      AVATAR_ADDRESS,
      host.abi
    );
    configureFeatures(
      badge2SlotHash,
      BADGE_ADDRESS,
      badge2SelectorKey,
      AVATAR_ADDRESS,
      host.abi
    );
    //configureFeaturesAll(AVATAR_ADDRESS,host.abi,[[headSlotHash,HEAD_ADDRESS,headSelectorKey],[faceSlotHash,FACE_ADDRESS,faceSelectorKey],[badge1SlotHash,BADGE_ADDRESS,badge1SelectorKey],[badge2SlotHash,BADGE_ADDRESS,badge2SelectorKey]]);
  };

  return (
    <div className="App">
      <div className="content-container">{renderContent()}</div>
      <div className="content-container">{headSelector()}</div>
      <div className="content-container">{faceSelector()}</div>
      <div className="content-container">{badge1Selector()}</div>
      <div className="content-container">{badge2Selector()}</div>
      <div className="content-container">
        <button onClick={saveAll}>Save All</button>
      </div>
    </div>
  );
};

export default Builder;
