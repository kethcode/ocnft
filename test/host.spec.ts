import { expect } from "./setup";
import { Contract, ContractFactory, Signer } from "ethers";
import { ethers } from "hardhat";

describe("Host", () => {
  let signers: Signer[];
  before(async () => {
    signers = await ethers.getSigners();
  });

  let HostFactory: ContractFactory;
  let RemoteFactory: ContractFactory;
  before(async () => {
    HostFactory = await ethers.getContractFactory("host");
    RemoteFactory = await ethers.getContractFactory("remote");
  });

  let Host: Contract;
  beforeEach(async () => {
    Host = await HostFactory.deploy("https://localhost:4200/","https://localhost:4201/");
  });

  /// ------------------------------------------------------------------------
  /// Constructor
  /// ------------------------------------------------------------------------

  describe("constructor", () => {
    describe("when deployed", () => {
      it("should have correct owner", async () => {
        expect(await Host.owner()).to.deep.equal(await signers[0].getAddress());
      });

      it("should have correct name and symbol", async () => {
        expect([await Host.name(), await Host.symbol()]).to.deep.equal([
          "hostname",
          "hostsymb",
        ]);
      });
    });
  });

  /// ------------------------------------------------------------------------
  /// Basic NFT Functionality
  /// ------------------------------------------------------------------------

  describe("mint", () => {
    describe("when called by owner", () => {
      it("should mint tokens in sequence", async () => {
        let mintList = [];
        mintList.push(parseInt(await Host.totalSupply()));

        for (let i = 0; i < 4; i++) {
          Host.mint(await signers[0].getAddress(), 1);
          mintList.push(parseInt(await Host.totalSupply()));
        }

        expect(mintList).to.deep.equal([0, 1, 2, 3, 4]);
      });
    });

    describe("when called by non-owner", () => {
      it("should revert with 'Ownable: caller is not the owner'", async () => {
        await expect(
          Host.connect(signers[1]).mint(await signers[0].getAddress(), 1)
        ).to.be.revertedWith("Ownable: caller is not the owner");
      });
    });
  });

  describe("baseURI", () => {
    // describe("default at deploy", () => {
    //   it("should be blank", async () => {
    //     expect(await Host.baseURI()).to.deep.equal("");
    //   });
    // });

    describe("after setBaseURI", () => {
      it("should match the input", async () => {
        const _baseURI: string = "http://localhost:4200/";
        await Host.setBaseURI(_baseURI);
        expect(await Host.baseURI()).to.deep.equal(_baseURI);
      });
    });
  });

  describe("externalURI", () => {
    // describe("default at deploy", () => {
    //   it("should be blank", async () => {
    //     expect(await Host.externalURI()).to.deep.equal("");
    //   });
    // });

    describe("after setExternalURI", () => {
      it("should match the input", async () => {
        const _externalURI: string = "http://localhost:4201/";
        await Host.setExternalURI(_externalURI);
        expect(await Host.externalURI()).to.deep.equal(_externalURI);
      });
    });
  });

  describe("tokenURI", () => {
    describe("when called with invalid tokenId", () => {
      it("should revert()", async () => {
        await expect(Host.tokenURI(0)).to.be.reverted;
      });
    });

    describe("when called with valid tokenId", () => {
      it("should return json metadata base64 blob", async () => {
        await Host.setBaseURI("http://localhost:4200/");
        await Host.setExternalURI("http://localhost:4201/");
        await Host.mint(await signers[0].getAddress(),1);

        // this also exercises _getMetadata(uint256 _tokenId) internal view
        const metadata = await Host.tokenURI(0);
        expect(metadata).to.deep.equal(
          "data:application/json;base64,eyJuYW1lIjoiaG9zdG5hbWUiLCJkZXNjcmlwdGlvbiI6Im9jbmZ0IGhvc3QiLCJpbWFnZSI6Imh0dHA6Ly9sb2NhbGhvc3Q6NDIwMC8wLnBuZyIsImV4dGVybmFsX3VybCI6Imh0dHA6Ly9sb2NhbGhvc3Q6NDIwMS8wIn0="
        );
      });
    });
  });

  describe("withdraw", () => {
    describe("when called by non-owner", () => {
      it("should revert()", async () => {
        await expect(Host.connect(signers[1]).withdraw()).to.be.reverted;
      });
    });

    // describe("when called by owner", () => {
    //   it("should withdraw ETH", async () => {
    //     await expect(Host.connect(signers[0]).withdraw()).to.be.not.reverted;
    //   });
    // });

    // needs more
  });

  describe("withdrawTokens", () => {
    describe("when called by non-owner", () => {
      it("should revert()", async () => {
        await expect(Host.connect(signers[1]).withdrawTokens()).to.be.reverted;
      });
    });

    // describe("when called by owner", () => {
    //   it("should withdraw ETH", async () => {
    //     await expect(Host.connect(signers[0]).withdrawTokens()).to.be.not.reverted;
    //   });
    // });

    // needs more
  });

  describe("Soulbound", () => {
    describe("transferFrom(from, to, tokenId)", () => {
      it("should revert with Soulbound()", async () => {
        Host.mint(await signers[0].getAddress(),1);
        await expect(
          Host.transferFrom(signers[0].getAddress(), signers[1].getAddress(), 0)
        ).to.be.revertedWith("isSoulbound()");
      });
    });
  });

  /// ------------------------------------------------------------------------
  /// Specific Functionality
  /// ------------------------------------------------------------------------

  describe("enableFeatures", () => {
    describe("when called from non-owner", () => {
      it("should revert()", async () => {
        await Host.mint(await signers[0].getAddress(),1);

        await expect(
          Host.connect(signers[1]).enableFeatures(["HEAD_SLOT"])
        ).to.be.revertedWith("Ownable: caller is not the owner");
      });
    });

    describe("when called from owner with valid _featureName", () => {
      it("should add to enabledFeatures", async () => {
        await Host.mint(await signers[0].getAddress(),1);
        await Host.enableFeatures(["HEAD_SLOT"]);

        const featureSlot = ethers.utils.keccak256(
          ethers.utils.toUtf8Bytes("HEAD_SLOT")
        );

        let featureData = await Host.getEnabledFeatures();

        expect(featureData[0].featureName, featureData[0].featureHash).to.equal(
          "HEAD_SLOT",
          featureSlot
        );
      });

      it("should emit FeatureEnabled", async () => {
        await Host.mint(await signers[0].getAddress(),1);

        await expect(Host.enableFeatures(["HEAD_SLOT"]))
          .to.emit(Host, "FeatureEnabled")
          .withArgs("HEAD_SLOT");
      });
    });
  });

  describe("disableFeatures", () => {
    describe("when called from non-owner", () => {
      it("should revert()", async () => {
        await Host.mint(await signers[0].getAddress(),1);
        await Host.enableFeatures(["HEAD_SLOT"]);

        await expect(
          Host.connect(signers[1]).disableFeatures(["HEAD_SLOT"])
        ).to.be.revertedWith("Ownable: caller is not the owner");
      });
    });

    describe("when called from owner with valid _featureName", () => {
      it("should remove from enabledFeatures", async () => {
        await Host.mint(await signers[0].getAddress(),1);
        await Host.enableFeatures(["HEAD_SLOT", "HAND_SLOT"]);

        await Host.disableFeatures(["HEAD_SLOT"]);

        let featureData = await Host.getEnabledFeatures();

        const featureSlot = ethers.utils.keccak256(
          ethers.utils.toUtf8Bytes("HAND_SLOT")
        );

        expect(featureData[0].featureName, featureData[0].featureHash).to.equal(
          "HAND_SLOT",
          featureSlot
        );
      });

      it("should emit FeatureDisabled", async () => {
        await Host.mint(await signers[0].getAddress(),1);
        await Host.enableFeatures(["HEAD_SLOT", "HAND_SLOT"]);

        await expect(Host.disableFeatures(["HEAD_SLOT"]))
          .to.emit(Host, "FeatureDisabled")
          .withArgs("HEAD_SLOT");
      });
    });
  });

  describe("getEnabledFeatures", () => {
    describe("when called", () => {
      it("should return enabledFeatures", async () => {
        await Host.mint(await signers[0].getAddress(),1);
        await Host.enableFeatures(["HEAD_SLOT"]);

        const featureSlot = ethers.utils.keccak256(
          ethers.utils.toUtf8Bytes("HEAD_SLOT")
        );

        let featureData = await Host.getEnabledFeatures();

        expect(featureData[0].featureName, featureData[0].featureHash).to.equal(
          "HEAD_SLOT",
          featureSlot
        );
      });
    });
  });

  // function setFeature(uint256 _tokenId, FeatureSetObject[] calldata inputData)
  describe("setFeatures", () => {
    describe("when called with a single instance of remote data", () => {
      it("should add remote data", async () => {
        await Host.mint(await signers[0].getAddress(),1);

        let remoteHead = await RemoteFactory.deploy("https://localhost:4200/","https://localhost:4201/");
        await remoteHead.mint(await signers[0].getAddress(),1);

        await Host.enableFeatures(["HEAD_SLOT"]);
        await Host.setFeatures(0, [["HEAD_SLOT", remoteHead.address, 0]]);

        const featureSlot = ethers.utils.keccak256(
          ethers.utils.toUtf8Bytes("HEAD_SLOT")
        );

        let [remoteContractAddr, remoteTokenId] = await Host.selectedFeatures(
          0,
          featureSlot
        );

        expect([remoteContractAddr, parseInt(remoteTokenId)]).to.deep.equal([
          remoteHead.address,
          0,
        ]);
      });

      it("should emit FeatureSet once", async () => {
        await Host.mint(await signers[0].getAddress(),1);

        let remoteHead = await RemoteFactory.deploy("https://localhost:4200/","https://localhost:4201/");
        await remoteHead.mint(await signers[0].getAddress(),1);

        await Host.enableFeatures(["HEAD_SLOT"]);

        await expect(
          Host.setFeatures(0, [["HEAD_SLOT", remoteHead.address, 0]])
        )
          .to.emit(Host, "FeatureSet")
          .withArgs(await signers[0].getAddress(), 0, "HEAD_SLOT");
      });
    });

    describe("when called with a multiple instances of remote data", () => {
      it("should add all remote data", async () => {
        await Host.mint(await signers[0].getAddress(),1);

        let remoteHead = await RemoteFactory.deploy("https://localhost:4200/","https://localhost:4201/");
        await remoteHead.mint(await signers[0].getAddress(),1);

        let remoteHand = await RemoteFactory.deploy("https://localhost:4200/","https://localhost:4201/");
        await remoteHand.mint(await signers[0].getAddress(),1);

        await Host.enableFeatures(["HEAD_SLOT", "HAND_SLOT"]);
        await Host.setFeatures(0, [
          ["HEAD_SLOT", remoteHead.address, 0],
          ["HAND_SLOT", remoteHand.address, 0],
        ]);

        let featureData = await Host.getFeatures(0);
        expect(featureData).to.deep.equal(
          '{"HEAD_SLOT":["' +
            remoteHead.address.toLowerCase() +
            '",0],"HAND_SLOT":["' +
            remoteHand.address.toLowerCase() +
            '",0]}'
        );
      });

      it("should emit FeatureSet once", async () => {
        await Host.mint(await signers[0].getAddress(),1);

        let remoteHead = await RemoteFactory.deploy("https://localhost:4200/","https://localhost:4201/");
        await remoteHead.mint(await signers[0].getAddress(),1);

        let remoteHand = await RemoteFactory.deploy("https://localhost:4200/","https://localhost:4201/");
        await remoteHand.mint(await signers[0].getAddress(),1);

        await Host.enableFeatures(["HEAD_SLOT", "HAND_SLOT"]);

        await expect(
          Host.setFeatures(0, [
            ["HEAD_SLOT", remoteHead.address, 0],
            ["HAND_SLOT", remoteHand.address, 0],
          ])
        )
          .to.emit(Host, "FeatureSet")
          .withArgs(await signers[0].getAddress(), 0, "HEAD_SLOT")
          .to.emit(Host, "FeatureSet")
          .withArgs(await signers[0].getAddress(), 0, "HAND_SLOT");
      });

      describe("when feature address in zero", () => {
        it("should revert", async () => {
          await Host.mint(await signers[0].getAddress(),1);

          let remoteHead = await RemoteFactory.deploy("https://localhost:4200/","https://localhost:4201/");
          await remoteHead.mint(await signers[0].getAddress(),1);

          let remoteHand = await RemoteFactory.deploy("https://localhost:4200/","https://localhost:4201/");
          await remoteHand.mint(await signers[0].getAddress(),1);

          await Host.enableFeatures(["HEAD_SLOT", "HAND_SLOT"]);
          await expect(
            Host.setFeatures(0, [
              ["HEAD_SLOT", remoteHead.address, 0],
              ["HAND_SLOT", "0x0000000000000000000000000000000000000000", 0],
            ])
          ).to.be.revertedWith("invalidAddress()");
        });
      });
    });
  });

  //  clearFeatures(uint256 _tokenId, string[] calldata _featureName)
  describe("clearFeatures", () => {
    describe("when called with valid _tokenId and _featureName", () => {
      it("should blank existing data", async () => {
        await Host.mint(await signers[0].getAddress(),1);

        let remoteHead = await RemoteFactory.deploy("https://localhost:4200/","https://localhost:4201/");
        await remoteHead.mint(await signers[0].getAddress(),2);

        await Host.enableFeatures(["HEAD_SLOT"]);
        await Host.setFeatures(0, [["HEAD_SLOT", remoteHead.address, 1]]);

        const featureSlot = ethers.utils.keccak256(
          ethers.utils.toUtf8Bytes("HEAD_SLOT")
        );

        let [setRemoteContractAddr, setRemoteTokenId] =
          await Host.selectedFeatures(0, featureSlot);

        await Host.clearFeatures(0, ["HEAD_SLOT"]);
        let [clearedRemoteContractAddr, clearedRemoteTokenId] =
          await Host.selectedFeatures(0, featureSlot);

        expect([
          setRemoteContractAddr,
          parseInt(setRemoteTokenId),
          clearedRemoteContractAddr,
          parseInt(clearedRemoteTokenId),
        ]).to.deep.equal([
          remoteHead.address,
          1,
          "0x0000000000000000000000000000000000000000",
          0,
        ]);
      });

      it("should emit FeatureCleared", async () => {
        await Host.mint(await signers[0].getAddress(),1);

        let remoteHead = await RemoteFactory.deploy("https://localhost:4200/","https://localhost:4201/");
        await remoteHead.mint(await signers[0].getAddress(),2);

        await Host.enableFeatures(["HEAD_SLOT"]);
        await Host.setFeatures(0, [["HEAD_SLOT", remoteHead.address, 1]]);

        await expect(Host.clearFeatures(0, ["HEAD_SLOT"]))
          .to.emit(Host, "FeatureCleared")
          .withArgs(await signers[0].getAddress(), 0, "HEAD_SLOT");
      });
    });

    describe("when called with invalid _tokenId", () => {
      it("should revert with invalidTokenId()", async () => {
        await Host.mint(await signers[0].getAddress(),1);

        let remoteHead = await RemoteFactory.deploy("https://localhost:4200/","https://localhost:4201/");
        await remoteHead.mint(await signers[0].getAddress(),1);

        await Host.enableFeatures(["HEAD_SLOT"]);
        await Host.setFeatures(0, [["HEAD_SLOT", remoteHead.address, 0]]);

        await expect(Host.clearFeatures(1, ["HEAD_SLOT"])).to.be.revertedWith(
          "invalidTokenId()"
        );
      });
    });

    describe("when called on token the msg.sender does not own", () => {
      it("should revert", async () => {
        await Host.mint(await signers[0].getAddress(),1);

        let remoteHead = await RemoteFactory.deploy("https://localhost:4200/","https://localhost:4201/");
        await remoteHead.mint(await signers[0].getAddress(),1);

        await Host.enableFeatures(["HEAD_SLOT"]);
        await Host.setFeatures(0, [["HEAD_SLOT", remoteHead.address, 0]]);

        await expect(
          Host.connect(signers[1]).clearFeatures(0, ["HEAD_SLOT"])
        ).to.be.revertedWith("isNotTokenOwner()");
      });
    });
  });

  //  function getFeatureList(uint256 _tokenId)
  describe("getFeatures", () => {
    describe("when called with valid _tokenId", () => {
      it("should return json feature table", async () => {
        // host
        await Host.setBaseURI("http://localhost:4200/");
        await Host.setExternalURI("http://localhost:4201/");
        await Host.mint(await signers[0].getAddress(),1);

        await Host.enableFeatures([
          "HEAD_SLOT",
          "HAND_SLOT",
          "BODY_SLOT",
          "BADGE_SLOT",
        ]);

        // head
        let remoteHead = await RemoteFactory.deploy("https://localhost:4200/","https://localhost:4201/");
        await remoteHead.mint(await signers[0].getAddress(),1);
        let remoteHand = await RemoteFactory.deploy("https://localhost:4200/","https://localhost:4201/");
        await remoteHand.mint(await signers[0].getAddress(),1);
        let remoteBody = await RemoteFactory.deploy("https://localhost:4200/","https://localhost:4201/");
        await remoteBody.mint(await signers[0].getAddress(),1);
        let remoteBadge = await RemoteFactory.deploy("https://localhost:4200/","https://localhost:4201/");
        await remoteBadge.mint(await signers[0].getAddress(),1);

        await Host.setFeatures(0, [
          ["HEAD_SLOT", remoteHead.address, 0],
          ["HAND_SLOT", remoteHand.address, 0],
          ["BODY_SLOT", remoteBody.address, 0],
          ["BADGE_SLOT", remoteBadge.address, 0],
        ]);

        let featureList = await Host.getFeatures(0);
        expect(featureList).to.equal(
          '{"HEAD_SLOT":["' +
            remoteHead.address.toLowerCase() +
            '",0],"HAND_SLOT":["' +
            remoteHand.address.toLowerCase() +
            '",0],"BODY_SLOT":["' +
            remoteBody.address.toLowerCase() +
            '",0],"BADGE_SLOT":["' +
            remoteBadge.address.toLowerCase() +
            '",0]}'
        );
      });
    });
  });
});
