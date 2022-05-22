import { expect } from "./setup";
import { Contract, ContractFactory, Signer } from "ethers";
import { ethers } from "hardhat";

describe("Composable", () => {
  let signers: Signer[];
  before(async () => {
    signers = await ethers.getSigners();
  });

  let ComposableFactory: ContractFactory;
  let ERC721Factory: ContractFactory;
  before(async () => {
    ComposableFactory = await ethers.getContractFactory("Composable");
    ERC721Factory = await ethers.getContractFactory("NFT_721E");
  });

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

  let Composable: Contract;
  beforeEach(async () => {
    Composable = await ComposableFactory.deploy(
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
        expect(await Composable.owner()).to.deep.equal(await signers[0].getAddress());
      });

      it("should have correct name and symbol", async () => {
        expect([await Composable.name(), await Composable.symbol()]).to.deep.equal([
          "hostname",
          "hostsymb",
        ]);
      });
    });
  });

  /// ------------------------------------------------------------------------
  /// ERC165
  /// ------------------------------------------------------------------------

  describe("supportsInterface", () => {
    describe("when called with the correct ERC165 signature", () => {
      it("should return true", async () => {
        expect(await Composable.supportsInterface('0x01ffc9a7')).to.be.true;
      });
    });
    describe("when called with the correct IComposable signature", () => {
      it("should return true", async () => {
        expect(await Composable.supportsInterface('0x09e3ba39')).to.be.true;
      });
    });
    describe("when called with the incorrect IComposable signature", () => {
      it("should return false", async () => {
        expect(await Composable.supportsInterface('0x09e3ba38')).to.be.false;
      });
    });
    describe("when called with the correct ERC721Enumerable signature", () => {
      it("should return true", async () => {
        expect(await Composable.supportsInterface('0x780e9d63')).to.be.true;
      });
    });
    describe("when called with the correct ERC721Metadata signature", () => {
      it("should return true", async () => {
        expect(await Composable.supportsInterface('0x5b5e139f')).to.be.true;
      });
    });
    describe("when called with the correct ERC721 signature", () => {
      it("should return true", async () => {
        expect(await Composable.supportsInterface('0x80ac58cd')).to.be.true;
      });
    });
    describe("when called with the correct ERC173 signature", () => {
      it("should return true", async () => {
        expect(await Composable.supportsInterface('0x7f5828d0')).to.be.true;
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
        mintList.push(parseInt(await Composable.totalSupply()));

        for (let i = 0; i < 4; i++) {
          Composable.mint(await signers[0].getAddress(), 1);
          mintList.push(parseInt(await Composable.totalSupply()));
        }

        expect(mintList).to.deep.equal([0, 1, 2, 3, 4]);
      });
    });

    describe("when called by non-owner", () => {
      it("should revert with 'Ownable: caller is not the owner'", async () => {
        await expect(
          Composable.connect(signers[1]).mint(await signers[0].getAddress(), 1)
        ).to.be.revertedWith("Ownable: caller is not the owner");
      });
    });
  });

  describe("baseURI", () => {
    // describe("default at deploy", () => {
    //   it("should be blank", async () => {
    //     expect(await Composable.baseURI()).to.deep.equal("");
    //   });
    // });

    describe("after setBaseURI", () => {
      it("should match the input", async () => {
        const _baseURI: string = "http://localhost:4200/";
        await Composable.setBaseURI(_baseURI);
        expect(await Composable.baseURI()).to.deep.equal(_baseURI);
      });
    });
  });

  describe("externalURI", () => {
    // describe("default at deploy", () => {
    //   it("should be blank", async () => {
    //     expect(await Composable.externalURI()).to.deep.equal("");
    //   });
    // });

    describe("after setExternalURI", () => {
      it("should match the input", async () => {
        const _externalURI: string = "http://localhost:4201/";
        await Composable.setExternalURI(_externalURI);
        expect(await Composable.externalURI()).to.deep.equal(_externalURI);
      });
    });
  });

  describe("tokenURI", () => {
    describe("when called with invalid tokenId", () => {
      it("should revert()", async () => {
        await expect(Composable.tokenURI(0)).to.be.reverted;
      });
    });

    describe("when called with valid tokenId", () => {
      it("should return json metadata base64 blob", async () => {
        await Composable.setBaseURI("http://localhost:4200/");
        await Composable.setExternalURI("http://localhost:4201/");
        await Composable.mint(await signers[0].getAddress(), 1);

        // this also exercises _getMetadata(uint256 _tokenId) internal view
        const metadata = await Composable.tokenURI(0);
        expect(metadata).to.deep.equal(
          "data:application/json;base64,eyJuYW1lIjoiaG9zdG5hbWUiLCJkZXNjcmlwdGlvbiI6Im9jbmZ0IGhvc3QiLCJpbWFnZSI6Imh0dHA6Ly9sb2NhbGhvc3Q6NDIwMC8wLnBuZyIsImV4dGVybmFsX3VybCI6Imh0dHA6Ly9sb2NhbGhvc3Q6NDIwMS8wIn0="
        );
      });
    });
  });

  describe("withdraw", () => {
    describe("when called by non-owner", () => {
      it("should revert()", async () => {
        await expect(Composable.connect(signers[1]).withdraw()).to.be.reverted;
      });
    });

    // describe("when called by owner", () => {
    //   it("should withdraw ETH", async () => {
    //     await expect(Composable.connect(signers[0]).withdraw()).to.be.not.reverted;
    //   });
    // });

    // needs more
  });

  describe("withdrawTokens", () => {
    describe("when called by non-owner", () => {
      it("should revert()", async () => {
        await expect(Composable.connect(signers[1]).withdrawTokens()).to.be.reverted;
      });
    });

    // describe("when called by owner", () => {
    //   it("should withdraw ETH", async () => {
    //     await expect(Composable.connect(signers[0]).withdrawTokens()).to.be.not.reverted;
    //   });
    // });

    // needs more
  });

  describe("Soulbound", () => {
    describe("transferFrom(from, to, tokenId)", () => {
      it("should revert with Soulbound()", async () => {
        Composable.mint(await signers[0].getAddress(), 1);
        await expect(
          Composable.transferFrom(signers[0].getAddress(), signers[1].getAddress(), 0)
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
        await Composable.mint(await signers[0].getAddress(), 1);
        await expect(
          Composable.connect(signers[1]).enableFeatures([
            [headSlotHash, 0, 0, 0, 0, 0],
          ])
        ).to.be.revertedWith("Ownable: caller is not the owner");
      });
    });

    describe("when called from owner with a single valid FeatureData", () => {
      it("should add to enabledFeatures", async () => {
        await Composable.mint(await signers[0].getAddress(), 1);
        await Composable.enableFeatures([[headSlotHash, 0, 0, 0, 0, 0]]);

        let featureData = await Composable.getEnabledFeatures();
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
        await Composable.mint(await signers[0].getAddress(), 1);

        await expect(Composable.enableFeatures([[headSlotHash, 0, 0, 0, 0, 0]]))
          .to.emit(Composable, "FeatureEnabled")
          .withArgs(headSlotHash);
      });
    });

    describe("when called from owner with a multiple valid FeatureData", () => {
      it("should add to enabledFeatures", async () => {
        await Composable.mint(await signers[0].getAddress(), 1);
        await Composable.enableFeatures([
          [headSlotHash, 0, 1, 1, 1, 1],
          [faceSlotHash, 1, 2, 2, 2, 2],
        ]);

        let featureData = await Composable.getEnabledFeatures();
        expect(featureData).to.deep.equal([
          [headSlotHash, ethers.BigNumber.from(0), 1, 1, 1, 1],
          [faceSlotHash, ethers.BigNumber.from(1), 2, 2, 2, 2],
        ]);
      });
    });

    describe("when called multiple times", () => {
      it("should provides gas usage numbers", async () => {
        await Composable.mint(await signers[0].getAddress(), 1);

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
          await Composable.enableFeatures(featureList);
        }
      });
    });
  });

  describe("disableFeatures", () => {
    describe("when called from non-owner", () => {
      it("should revert()", async () => {
        await Composable.mint(await signers[0].getAddress(), 1);
        await Composable.enableFeatures([[headSlotHash, 0, 0, 0, 0, 0]]);

        await expect(
          Composable.connect(signers[1]).disableFeatures([headSlotHash])
        ).to.be.revertedWith("Ownable: caller is not the owner");
      });
    });

    describe("when called from owner with single valid featureHash", () => {
      it("should remove from enabledFeatures", async () => {
        await Composable.mint(await signers[0].getAddress(), 1);
        await Composable.enableFeatures([
          [headSlotHash, 0, 1, 1, 1, 1],
          [faceSlotHash, 1, 2, 2, 2, 2],
        ]);

        await Composable.disableFeatures([headSlotHash]);

        let featureData = await Composable.getEnabledFeatures();
        expect(featureData).to.deep.equal([
          [faceSlotHash, ethers.BigNumber.from(1), 2, 2, 2, 2],
        ]);
      });

      it("should emit FeatureDisabled", async () => {
        await Composable.mint(await signers[0].getAddress(), 1);
        await Composable.enableFeatures([
          [headSlotHash, 0, 1, 1, 1, 1],
          [faceSlotHash, 1, 2, 2, 2, 2],
        ]);

        await expect(Composable.disableFeatures([headSlotHash]))
          .to.emit(Composable, "FeatureDisabled")
          .withArgs(headSlotHash);
      });
    });

    describe("when called from owner with multiple valid featureHash", () => {
      it("should remove from enabledFeatures", async () => {
        await Composable.mint(await signers[0].getAddress(), 1);
        await Composable.enableFeatures([
          [headSlotHash, 0, 1, 1, 1, 1],
          [faceSlotHash, 1, 2, 2, 2, 2],
          [badge1SlotHash, 2, 3, 3, 3, 3],
          [badge2SlotHash, 3, 4, 4, 4, 4],
        ]);

        await Composable.disableFeatures([headSlotHash, badge1SlotHash]);

        let featureData = await Composable.getEnabledFeatures();

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
        await Composable.mint(await signers[0].getAddress(), 1);

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
          await Composable.enableFeatures(featureList);
          await Composable.disableFeatures(featureHashes);
        }
      });
    });
  });

  describe("getEnabledFeatures", () => {
    describe("when called", () => {
      it("should return enabledFeatures", async () => {
        await Composable.mint(await signers[0].getAddress(), 1);
        await Composable.enableFeatures([
          [headSlotHash, 0, 1, 1, 1, 1],
          [faceSlotHash, 1, 2, 2, 2, 2],
          [badge1SlotHash, 2, 3, 3, 3, 3],
          [badge2SlotHash, 3, 4, 4, 4, 4],
        ]);

        let featureData = await Composable.getEnabledFeatures();

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
      await Composable.mint(await signers[0].getAddress(), 1);

      remoteHead = await ERC721Factory.deploy(
        "https://localhost:4200/",
        "https://localhost:4201/"
      );
      await remoteHead.mint(await signers[0].getAddress(), 1);

      remoteFace = await ERC721Factory.deploy(
        "https://localhost:4200/",
        "https://localhost:4201/"
      );
      await remoteFace.mint(await signers[0].getAddress(), 1);

      await Composable.enableFeatures([
        [headSlotHash, 0, 1, 2, 1, 1],
        [faceSlotHash, 1, 2, 3, 2, 2],
        [badge1SlotHash, 2, 3, 4, 3, 3],
        [badge2SlotHash, 3, 4, 5, 4, 4],
      ]);
    });

    describe("when called with a single instance of remote data", () => {
      it("should add remote data", async () => {
        await Composable.configureFeatures(0, [
          [headSlotHash, remoteHead.address, 0],
        ]);

        let [remoteContractAddr, remoteTokenId] = await Composable.selectedFeatures(
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
          Composable.configureFeatures(0, [[headSlotHash, remoteHead.address, 0]])
        )
          .to.emit(Composable, "FeatureConfigured")
          .withArgs(0, headSlotHash);
      });
    });

    describe("when called with a multiple instances of remote data", () => {
      it("should add all remote data", async () => {
        await Composable.configureFeatures(0, [
          [headSlotHash, remoteHead.address, 0],
          [faceSlotHash, remoteFace.address, 0],
        ]);

        let featureData = await Composable.getConfiguredFeatures(0);
        expect(featureData).to.deep.equal(
          '{"0":["' +
            headSlotHash +
            '","' +
            remoteHead.address.toLowerCase() +
            '",0,1,2,1,1],' +
            '"1":["' +
            faceSlotHash +
            '","' +
            remoteFace.address.toLowerCase() +
            '",0,2,3,2,2],' +
            '"2":["' +
            badge1SlotHash +
            '","' +
            "0x00" +
            '",0,3,4,3,3],' +
            '"3":["' +
            badge2SlotHash +
            '","' +
            "0x00" +
            '",0,4,5,4,4]}'
        );
      });

      it("should emit FeatureConfigured multiple times", async () => {
        expect(
          await Composable.configureFeatures(0, [
            [headSlotHash, remoteHead.address, 0],
            [faceSlotHash, remoteFace.address, 0],
          ])
        )
          .to.emit(Composable, "FeatureConfigured")
          .withArgs(0, headSlotHash)
          .to.emit(Composable, "FeatureConfigured")
          .withArgs(0, faceSlotHash);
      });

      describe("when feature address is zero", () => {
        it("should revert", async () => {
          await expect(
            Composable.configureFeatures(0, [
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
      await Composable.mint(await signers[0].getAddress(), 1);

      remoteHead = await ERC721Factory.deploy(
        "https://localhost:4200/",
        "https://localhost:4201/"
      );
      await remoteHead.mint(await signers[0].getAddress(), 1);

      remoteFace = await ERC721Factory.deploy(
        "https://localhost:4200/",
        "https://localhost:4201/"
      );
      await remoteFace.mint(await signers[0].getAddress(), 1);

      remoteBadge1 = await ERC721Factory.deploy(
        "https://localhost:4200/",
        "https://localhost:4201/"
      );
      await remoteBadge1.mint(await signers[0].getAddress(), 1);

      remoteBadge2 = await ERC721Factory.deploy(
        "https://localhost:4200/",
        "https://localhost:4201/"
      );
      await remoteBadge2.mint(await signers[0].getAddress(), 1);

      await Composable.enableFeatures([
        [headSlotHash, 0, 1, 2, 1, 1],
        [faceSlotHash, 1, 2, 3, 2, 2],
        [badge1SlotHash, 2, 3, 4, 3, 3],
        [badge2SlotHash, 3, 4, 5, 4, 4],
      ]);
    });

    describe("when called with valid _tokenId and a single _featureHash", () => {
      it("should zero the data for that featureHash", async () => {
        await Composable.configureFeatures(0, [
          [headSlotHash, remoteHead.address, 0],
        ]);

        let [setRemoteContractAddr, setRemoteTokenId] =
          await Composable.selectedFeatures(0, headSlotHash);

        await Composable.clearFeatures(0, [headSlotHash]);
        let [clearedRemoteContractAddr, clearedRemoteTokenId] =
          await Composable.selectedFeatures(0, headSlotHash);

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

      it("should emit FeatureConfigured", async () => {
        await Composable.configureFeatures(0, [
          [headSlotHash, remoteHead.address, 0],
        ]);

        await expect(Composable.clearFeatures(0, [headSlotHash]))
          .to.emit(Composable, "FeatureConfigured")
          .withArgs(0, headSlotHash);
      });
    });

    describe("when called with valid _tokenId and multiple _featureHashes", () => {
      it("should zero the data for all appropriate featureHashes", async () => {
        await Composable.configureFeatures(0, [
          [headSlotHash, remoteHead.address, 0],
          [faceSlotHash, remoteFace.address, 0],
        ]);

        let [setRemoteContractAddr0, setRemoteTokenId0] =
          await Composable.selectedFeatures(0, headSlotHash);
        let [setRemoteContractAddr1, setRemoteTokenId1] =
          await Composable.selectedFeatures(0, faceSlotHash);

        await Composable.clearFeatures(0, [headSlotHash, faceSlotHash]);

        let [clearedRemoteContractAddr0, clearedRemoteTokenId0] =
          await Composable.selectedFeatures(0, headSlotHash);
        let [clearedRemoteContractAddr1, clearedRemoteTokenId1] =
          await Composable.selectedFeatures(0, faceSlotHash);

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

      it("should emit multiple FeatureConfigured", async () => {
        await Composable.configureFeatures(0, [
          [headSlotHash, remoteHead.address, 0],
          [faceSlotHash, remoteFace.address, 0],
        ]);

        await expect(Composable.clearFeatures(0, [headSlotHash,faceSlotHash]))
          .to.emit(Composable, "FeatureConfigured")
          .withArgs(0, headSlotHash)
          .to.emit(Composable, "FeatureConfigured")
          .withArgs(0, faceSlotHash);
      });
    });

    describe("when called with invalid _tokenId", () => {
      it("should revert with invalidTokenId()", async () => {
        await Composable.configureFeatures(0, [
          [headSlotHash, remoteHead.address, 0],
          [faceSlotHash, remoteFace.address, 0],
        ]);

        await expect(Composable.clearFeatures(1, [headSlotHash])).to.be.revertedWith(
          "invalidTokenId()"
        );
      });
    });

    describe("when called on token the msg.sender does not own", () => {
      it("should revert", async () => {
        await Composable.configureFeatures(0, [
          [headSlotHash, remoteHead.address, 0],
          [faceSlotHash, remoteFace.address, 0],
        ]);

        await expect(
          Composable.connect(signers[1]).clearFeatures(0, [headSlotHash])
        ).to.be.revertedWith("isNotTokenOwner()");
      });
    });
  });

  //  function getConfiguredFeatures(uint256 _tokenId)
  describe("getConfiguredFeatures", () => {
    let remoteHead: Contract;
    let remoteFace: Contract;
    let remoteBadge1: Contract;
    let remoteBadge2: Contract;

    beforeEach(async () => {
      await Composable.mint(await signers[0].getAddress(), 1);

      remoteHead = await ERC721Factory.deploy(
        "https://localhost:4200/",
        "https://localhost:4201/"
      );
      await remoteHead.mint(await signers[0].getAddress(), 1);

      remoteFace = await ERC721Factory.deploy(
        "https://localhost:4200/",
        "https://localhost:4201/"
      );
      await remoteFace.mint(await signers[0].getAddress(), 1);

      remoteBadge1 = await ERC721Factory.deploy(
        "https://localhost:4200/",
        "https://localhost:4201/"
      );
      await remoteBadge1.mint(await signers[0].getAddress(), 1);

      remoteBadge2 = await ERC721Factory.deploy(
        "https://localhost:4200/",
        "https://localhost:4201/"
      );
      await remoteBadge2.mint(await signers[0].getAddress(), 1);

      await Composable.enableFeatures([
        [headSlotHash, 0, 1, 2, 1, 1],
        [faceSlotHash, 1, 2, 3, 2, 2],
        [badge1SlotHash, 2, 3, 4, 3, 3],
        [badge2SlotHash, 3, 4, 5, 4, 4],
      ]);
    });

    describe("when called with valid _tokenId", () => {
      it("should return json feature table", async () => {
        // host

        await Composable.configureFeatures(0, [
          [headSlotHash, remoteHead.address, 0],
          [faceSlotHash, remoteFace.address, 0],
          [badge1SlotHash, remoteBadge1.address, 0],
          [badge2SlotHash, remoteBadge2.address, 0],
        ]);

        let featureData = await Composable.getConfiguredFeatures(0);
        expect(featureData).to.deep.equal(
          '{"0":["' +
            headSlotHash +
            '","' +
            remoteHead.address.toLowerCase() +
            '",0,1,2,1,1],' +
            '"1":["' +
            faceSlotHash +
            '","' +
            remoteFace.address.toLowerCase() +
            '",0,2,3,2,2],' +
            '"2":["' +
            badge1SlotHash +
            '","' +
            remoteBadge1.address.toLowerCase() +
            '",0,3,4,3,3],' +
            '"3":["' +
            badge2SlotHash +
            '","' +
            remoteBadge2.address.toLowerCase() +
            '",0,4,5,4,4]}'
        );
      });
    });
  });
});
