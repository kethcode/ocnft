import { expect } from "./setup";
import { Contract, ContractFactory, Signer } from "ethers";
import { ethers } from "hardhat";

// const hashfn = (element: any) => {
//   return Buffer.from(ethers.utils.keccak256(element).slice(2), "hex");
// };

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

  // const headSlotHash = hashfn(ethers.utils.toUtf8Bytes("HEAD_SLOT"));

  beforeEach(async () => {
    Host = await HostFactory.deploy(
      "https://localhost:4200/",
      "https://localhost:4201/"
    );
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
        await Host.mint(await signers[0].getAddress(), 1);

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
        Host.mint(await signers[0].getAddress(), 1);
        await expect(
          Host.transferFrom(signers[0].getAddress(), signers[1].getAddress(), 0)
        ).to.be.revertedWith("isSoulbound()");
      });
    });
  });

  /// ------------------------------------------------------------------------
  /// Specific Functionality
  /// ------------------------------------------------------------------------

  // function enableFeatures(FeatureData[] calldata _featureData)
  // [bytes32 featureHash, uint160 layer, uint24 x, uint24 y, uint24 w, uint24 h]
  describe("enableFeatures", () => {
    describe("when called from non-owner", () => {
      it("should revert()", async () => {
        await Host.mint(await signers[0].getAddress(), 1);
        await expect(
          Host.connect(signers[1]).enableFeatures([
            [headSlotHash, 0, 0, 0, 0, 0],
          ])
        ).to.be.revertedWith("Ownable: caller is not the owner");
      });
    });

    describe("when called from owner with a single valid FeatureData", () => {
      it("should add to enabledFeatures", async () => {
        await Host.mint(await signers[0].getAddress(), 1);
        await Host.enableFeatures([[headSlotHash, 0, 0, 0, 0, 0]]);

        let featureData = await Host.getEnabledFeatures();
        expect([
          featureData[0].featureHash,
          featureData[0].layer,
          featureData[0].x,
          featureData[0].y,
          featureData[0].w,
          featureData[0].h,
        ]).to.deep.equal([headSlotHash, ethers.BigNumber.from(0), 0, 0, 0, 0]);
      });

      it("should emit FeatureEnabled", async () => {
        await Host.mint(await signers[0].getAddress(), 1);

        await expect(Host.enableFeatures([[headSlotHash, 0, 0, 0, 0, 0]]))
          .to.emit(Host, "FeatureEnabled")
          .withArgs(headSlotHash);
      });
    });

    describe("when called from owner with a multiple valid FeatureData", () => {
      it("should add to enabledFeatures", async () => {
        await Host.mint(await signers[0].getAddress(), 1);
        await Host.enableFeatures([
          [headSlotHash, 0, 1, 1, 1, 1],
          [faceSlotHash, 1, 2, 2, 2, 2],
        ]);

        let featureData = await Host.getEnabledFeatures();
        expect(featureData).to.deep.equal([
          [headSlotHash, ethers.BigNumber.from(0), 1, 1, 1, 1],
          [faceSlotHash, ethers.BigNumber.from(1), 2, 2, 2, 2],
        ]);
      });
    });

    describe("when called multiple times", () => {
      it("should provides gas usage numbers", async () => {
        await Host.mint(await signers[0].getAddress(), 1);

        let featureList = [];
        for (let i = 0; i < 32; i++) {
          featureList.push([
            ethers.utils.keccak256(
              ethers.utils.toUtf8Bytes("slot_" + i.toString())
            ),
            0,
            0,
            0,
            0,
            0,
          ]);
          await Host.enableFeatures(featureList);
        }
      });
    });
  });

  describe("disableFeatures", () => {
    describe("when called from non-owner", () => {
      it("should revert()", async () => {
        await Host.mint(await signers[0].getAddress(), 1);
        await Host.enableFeatures([[headSlotHash, 0, 0, 0, 0, 0]]);

        await expect(
          Host.connect(signers[1]).disableFeatures([headSlotHash])
        ).to.be.revertedWith("Ownable: caller is not the owner");
      });
    });

    describe("when called from owner with single valid featureHash", () => {
      it("should remove from enabledFeatures", async () => {
        await Host.mint(await signers[0].getAddress(), 1);
        await Host.enableFeatures([
          [headSlotHash, 0, 1, 1, 1, 1],
          [faceSlotHash, 1, 2, 2, 2, 2],
        ]);

        await Host.disableFeatures([headSlotHash]);

        let featureData = await Host.getEnabledFeatures();
        expect(featureData).to.deep.equal([
          [faceSlotHash, ethers.BigNumber.from(1), 2, 2, 2, 2],
        ]);
      });

      it("should emit FeatureDisabled", async () => {
        await Host.mint(await signers[0].getAddress(), 1);
        await Host.enableFeatures([
          [headSlotHash, 0, 1, 1, 1, 1],
          [faceSlotHash, 1, 2, 2, 2, 2],
        ]);

        await expect(Host.disableFeatures([headSlotHash]))
          .to.emit(Host, "FeatureDisabled")
          .withArgs(headSlotHash);
      });
    });

    describe("when called from owner with multiple valid featureHash", () => {
      it("should remove from enabledFeatures", async () => {
        await Host.mint(await signers[0].getAddress(), 1);
        await Host.enableFeatures([
          [headSlotHash, 0, 1, 1, 1, 1],
          [faceSlotHash, 1, 2, 2, 2, 2],
          [badge1SlotHash, 2, 3, 3, 3, 3],
          [badge2SlotHash, 3, 4, 4, 4, 4],
        ]);

        await Host.disableFeatures([headSlotHash, badge1SlotHash]);

        let featureData = await Host.getEnabledFeatures();

        expect(featureData).to.deep.equal([
          [badge2SlotHash, ethers.BigNumber.from(3), 4, 4, 4, 4],
          [faceSlotHash, ethers.BigNumber.from(1), 2, 2, 2, 2],
        ]);
      });
    });

    // note:  this script enables AND DISABLES all features every time
    //        so host gas costs are huge (new storage, large write)
    //        I mention this because the previous gas sweep loop
    //        reports much less gas for updating an existing feature table
    //        (max 244k vs max 1.25m gas for 32 features)
    describe("when called multiple times", () => {
      it("should provides gas usage numbers", async () => {
        await Host.mint(await signers[0].getAddress(), 1);

        let featureList = [];
        let featureHashes = [];
        for (let i = 0; i < 32; i++) {
          featureList.push([
            ethers.utils.keccak256(
              ethers.utils.toUtf8Bytes("slot_" + i.toString())
            ),
            0,
            0,
            0,
            0,
            0,
          ]);
          featureHashes.push(
            ethers.utils.keccak256(
              ethers.utils.toUtf8Bytes("slot_" + i.toString())
            )
          );
          await Host.enableFeatures(featureList);
          await Host.disableFeatures(featureHashes);
        }
      });
    });
  });

  describe("getEnabledFeatures", () => {
    describe("when called", () => {
      it("should return enabledFeatures", async () => {
        await Host.mint(await signers[0].getAddress(), 1);
        await Host.enableFeatures([
          [headSlotHash, 0, 1, 1, 1, 1],
          [faceSlotHash, 1, 2, 2, 2, 2],
          [badge1SlotHash, 2, 3, 3, 3, 3],
          [badge2SlotHash, 3, 4, 4, 4, 4],
        ]);

        let featureData = await Host.getEnabledFeatures();

        expect(featureData).to.deep.equal([
          [headSlotHash, ethers.BigNumber.from(0), 1, 1, 1, 1],
          [faceSlotHash, ethers.BigNumber.from(1), 2, 2, 2, 2],
          [badge1SlotHash, ethers.BigNumber.from(2), 3, 3, 3, 3],
          [badge2SlotHash, ethers.BigNumber.from(3), 4, 4, 4, 4],
        ]);
      });
    });
  });

  // function configureFeatures( uint256 _tokenId, SetFeatureInput[] calldata inputData )
  // [ bytes32 _featureHash, remote _remoteContractAddr, uint256 _remoteTokenId ]
  describe("configureFeatures", () => {
    let remoteHead: Contract;
    let remoteFace: Contract;
    beforeEach(async () => {
      await Host.mint(await signers[0].getAddress(), 1);

      remoteHead = await RemoteFactory.deploy(
        "https://localhost:4200/",
        "https://localhost:4201/"
      );
      await remoteHead.mint(await signers[0].getAddress(), 1);

      remoteFace = await RemoteFactory.deploy(
        "https://localhost:4200/",
        "https://localhost:4201/"
      );
      await remoteFace.mint(await signers[0].getAddress(), 1);

      await Host.enableFeatures([
        [headSlotHash, 0, 1, 2, 1, 1],
        [faceSlotHash, 1, 2, 3, 2, 2],
        [badge1SlotHash, 2, 3, 4, 3, 3],
        [badge2SlotHash, 3, 4, 5, 4, 4],
      ]);
    });

    describe("when called with a single instance of remote data", () => {
      it("should add remote data", async () => {
        await Host.configureFeatures(0, [
          [headSlotHash, remoteHead.address, 0],
        ]);

        let [remoteContractAddr, remoteTokenId] = await Host.selectedFeatures(
          0,
          headSlotHash
        );

        expect([remoteContractAddr, parseInt(remoteTokenId)]).to.deep.equal([
          remoteHead.address,
          0,
        ]);
      });

      it("should emit FeatureConfigured once", async () => {
        await expect(
          Host.configureFeatures(0, [[headSlotHash, remoteHead.address, 0]])
        )
          .to.emit(Host, "FeatureConfigured")
          .withArgs(0, headSlotHash);
      });
    });

    describe("when called with a multiple instances of remote data", () => {
      it("should add all remote data", async () => {
        await Host.configureFeatures(0, [
          [headSlotHash, remoteHead.address, 0],
          [faceSlotHash, remoteFace.address, 0],
        ]);

        let featureData = await Host.getFeatures(0);
        expect(featureData).to.deep.equal(
          '{0:["' +
            headSlotHash +
            '","' +
            remoteHead.address.toLowerCase() +
            '",0,1,2,1,1],' +
            '1:["' +
            faceSlotHash +
            '","' +
            remoteFace.address.toLowerCase() +
            '",0,2,3,2,2],' +
            '2:["' +
            badge1SlotHash +
            '","' +
            "0x00" +
            '",0,3,4,3,3],' +
            '3:["' +
            badge2SlotHash +
            '","' +
            "0x00" +
            '",0,4,5,4,4]}'
        );
      });

      it("should emit FeatureConfigured multiple times", async () => {
        expect(
          await Host.configureFeatures(0, [
            [headSlotHash, remoteHead.address, 0],
            [faceSlotHash, remoteFace.address, 0],
          ])
        )
          .to.emit(Host, "FeatureConfigured")
          .withArgs(0, headSlotHash)
          .to.emit(Host, "FeatureConfigured")
          .withArgs(0, faceSlotHash);
      });

      describe("when feature address is zero", () => {
        it("should revert", async () => {
          await expect(
            Host.configureFeatures(0, [
              [headSlotHash, remoteHead.address, 0],
              [faceSlotHash, "0x0000000000000000000000000000000000000000", 0],
            ])
          ).to.be.revertedWith("invalidAddress()");
        });
      });
    });
  });

  //  function clearFeatures(uint256 _tokenId, bytes32[] calldata _featureHashes)
  describe("clearFeatures", () => {
    let remoteHead: Contract;
    let remoteFace: Contract;
    let remoteBadge1: Contract;
    let remoteBadge2: Contract;

    beforeEach(async () => {
      await Host.mint(await signers[0].getAddress(), 1);

      remoteHead = await RemoteFactory.deploy(
        "https://localhost:4200/",
        "https://localhost:4201/"
      );
      await remoteHead.mint(await signers[0].getAddress(), 1);

      remoteFace = await RemoteFactory.deploy(
        "https://localhost:4200/",
        "https://localhost:4201/"
      );
      await remoteFace.mint(await signers[0].getAddress(), 1);

      remoteBadge1 = await RemoteFactory.deploy(
        "https://localhost:4200/",
        "https://localhost:4201/"
      );
      await remoteBadge1.mint(await signers[0].getAddress(), 1);

      remoteBadge2 = await RemoteFactory.deploy(
        "https://localhost:4200/",
        "https://localhost:4201/"
      );
      await remoteBadge2.mint(await signers[0].getAddress(), 1);

      await Host.enableFeatures([
        [headSlotHash, 0, 1, 2, 1, 1],
        [faceSlotHash, 1, 2, 3, 2, 2],
        [badge1SlotHash, 2, 3, 4, 3, 3],
        [badge2SlotHash, 3, 4, 5, 4, 4],
      ]);
    });

    describe("when called with valid _tokenId and a single _featureHash", () => {
      it("should zero the data for that featureHash", async () => {
        await Host.configureFeatures(0, [
          [headSlotHash, remoteHead.address, 0],
        ]);

        let [setRemoteContractAddr, setRemoteTokenId] =
          await Host.selectedFeatures(0, headSlotHash);

        await Host.clearFeatures(0, [headSlotHash]);
        let [clearedRemoteContractAddr, clearedRemoteTokenId] =
          await Host.selectedFeatures(0, headSlotHash);

        expect([
          setRemoteContractAddr,
          parseInt(setRemoteTokenId),
          clearedRemoteContractAddr,
          parseInt(clearedRemoteTokenId),
        ]).to.deep.equal([
          remoteHead.address,
          0,
          "0x0000000000000000000000000000000000000000",
          0,
        ]);
      });

      it("should emit FeatureCleared", async () => {
        await Host.configureFeatures(0, [
          [headSlotHash, remoteHead.address, 0],
        ]);

        await expect(Host.clearFeatures(0, [headSlotHash]))
          .to.emit(Host, "FeatureCleared")
          .withArgs(0, headSlotHash);
      });
    });

    describe("when called with valid _tokenId and multiple _featureHashes", () => {
      it("should zero the data for all appropriate featureHashes", async () => {
        await Host.configureFeatures(0, [
          [headSlotHash, remoteHead.address, 0],
          [faceSlotHash, remoteFace.address, 0],
        ]);

        let [setRemoteContractAddr0, setRemoteTokenId0] =
          await Host.selectedFeatures(0, headSlotHash);
        let [setRemoteContractAddr1, setRemoteTokenId1] =
          await Host.selectedFeatures(0, faceSlotHash);

        await Host.clearFeatures(0, [headSlotHash, faceSlotHash]);

        let [clearedRemoteContractAddr0, clearedRemoteTokenId0] =
          await Host.selectedFeatures(0, headSlotHash);
        let [clearedRemoteContractAddr1, clearedRemoteTokenId1] =
          await Host.selectedFeatures(0, faceSlotHash);

        expect([
          setRemoteContractAddr0,
          parseInt(setRemoteTokenId0),
          clearedRemoteContractAddr0,
          parseInt(clearedRemoteTokenId0),
          setRemoteContractAddr1,
          parseInt(setRemoteTokenId1),
          clearedRemoteContractAddr1,
          parseInt(clearedRemoteTokenId1),
        ]).to.deep.equal([
          remoteHead.address,
          0,
          "0x0000000000000000000000000000000000000000",
          0,
          remoteFace.address,
          0,
          "0x0000000000000000000000000000000000000000",
          0,
        ]);
      });

      it("should emit multiple FeatureCleared", async () => {
        await Host.configureFeatures(0, [
          [headSlotHash, remoteHead.address, 0],
          [faceSlotHash, remoteFace.address, 0],
        ]);

        await expect(Host.clearFeatures(0, [headSlotHash,faceSlotHash]))
          .to.emit(Host, "FeatureCleared")
          .withArgs(0, headSlotHash)
          .to.emit(Host, "FeatureCleared")
          .withArgs(0, faceSlotHash);
      });
    });

    describe("when called with invalid _tokenId", () => {
      it("should revert with invalidTokenId()", async () => {
        await Host.configureFeatures(0, [
          [headSlotHash, remoteHead.address, 0],
          [faceSlotHash, remoteFace.address, 0],
        ]);

        await expect(Host.clearFeatures(1, [headSlotHash])).to.be.revertedWith(
          "invalidTokenId()"
        );
      });
    });

    describe("when called on token the msg.sender does not own", () => {
      it("should revert", async () => {
        await Host.configureFeatures(0, [
          [headSlotHash, remoteHead.address, 0],
          [faceSlotHash, remoteFace.address, 0],
        ]);

        await expect(
          Host.connect(signers[1]).clearFeatures(0, [headSlotHash])
        ).to.be.revertedWith("isNotTokenOwner()");
      });
    });
  });

  //  function getFeatureList(uint256 _tokenId)
  describe("getFeatures", () => {
    let remoteHead: Contract;
    let remoteFace: Contract;
    let remoteBadge1: Contract;
    let remoteBadge2: Contract;

    beforeEach(async () => {
      await Host.mint(await signers[0].getAddress(), 1);

      remoteHead = await RemoteFactory.deploy(
        "https://localhost:4200/",
        "https://localhost:4201/"
      );
      await remoteHead.mint(await signers[0].getAddress(), 1);

      remoteFace = await RemoteFactory.deploy(
        "https://localhost:4200/",
        "https://localhost:4201/"
      );
      await remoteFace.mint(await signers[0].getAddress(), 1);

      remoteBadge1 = await RemoteFactory.deploy(
        "https://localhost:4200/",
        "https://localhost:4201/"
      );
      await remoteBadge1.mint(await signers[0].getAddress(), 1);

      remoteBadge2 = await RemoteFactory.deploy(
        "https://localhost:4200/",
        "https://localhost:4201/"
      );
      await remoteBadge2.mint(await signers[0].getAddress(), 1);

      await Host.enableFeatures([
        [headSlotHash, 0, 1, 2, 1, 1],
        [faceSlotHash, 1, 2, 3, 2, 2],
        [badge1SlotHash, 2, 3, 4, 3, 3],
        [badge2SlotHash, 3, 4, 5, 4, 4],
      ]);
    });

    describe("when called with valid _tokenId", () => {
      it("should return json feature table", async () => {
        // host

        await Host.configureFeatures(0, [
          [headSlotHash, remoteHead.address, 0],
          [faceSlotHash, remoteFace.address, 0],
          [badge1SlotHash, remoteBadge1.address, 0],
          [badge2SlotHash, remoteBadge2.address, 0],
        ]);

        let featureData = await Host.getFeatures(0);
        expect(featureData).to.deep.equal(
          '{0:["' +
            headSlotHash +
            '","' +
            remoteHead.address.toLowerCase() +
            '",0,1,2,1,1],' +
            '1:["' +
            faceSlotHash +
            '","' +
            remoteFace.address.toLowerCase() +
            '",0,2,3,2,2],' +
            '2:["' +
            badge1SlotHash +
            '","' +
            remoteBadge1.address.toLowerCase() +
            '",0,3,4,3,3],' +
            '3:["' +
            badge2SlotHash +
            '","' +
            remoteBadge2.address.toLowerCase() +
            '",0,4,5,4,4]}'
        );
      });
    });
  });
});
