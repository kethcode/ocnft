import { expect } from "./setup";
import { Contract, ContractFactory, Signer } from "ethers";
import { ethers } from "hardhat";
import { BigNumber } from "ethers";
import { hostname } from "os";

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
    Host = await HostFactory.deploy();
  });

  describe("construction", () => {
    it("Host contract should have correct owner", async () => {
      expect(await Host.owner()).to.deep.equal(await signers[0].getAddress());
    });
  });

  describe("baseURI", () => {
    describe("default at deploy", () => {
      it("should be blank", async () => {
        expect(await Host.baseURI()).to.deep.equal("");
      });
    });

    describe("after being set", () => {
      it("should match the input", async () => {
        const _baseURI: string = "http://localhost:4200/";
        await Host.setBaseURI(_baseURI);
        expect(await Host.baseURI()).to.deep.equal(_baseURI);
      });
    });
  });

  describe("mint", () => {
    describe("when called by owner", () => {
      it("should mint tokens in sequence", async () => {
        let mintList = [];
        mintList.push(parseInt(await Host.totalSupply()));

        for (let i = 0; i < 4; i++) {
          Host.mint(await signers[0].getAddress());
          mintList.push(parseInt(await Host.totalSupply()));
        }

        expect(mintList).to.deep.equal([0, 1, 2, 3, 4]);
      });
    });

    describe("when called by non-owner", () => {
      it("should revert with 'Ownable: caller is not the owner'", async () => {
        await expect(
          Host.connect(signers[1]).mint(await signers[0].getAddress())
        ).to.be.revertedWith("Ownable: caller is not the owner");
      });
    });
  });

  describe("Soulbound", () => {
    describe("transferFrom(from, to, tokenId)", () => {
      it("should revert with Soulbound()", async () => {
        Host.mint(await signers[0].getAddress());
        await expect(
          Host.transferFrom(signers[0].getAddress(), signers[1].getAddress(), 0)
        ).to.be.revertedWith("Soulbound()");
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
        await Host.setViewerURI("http://localhost:4201/");
        await Host.mint(await signers[0].getAddress());
        const metadata = await Host.tokenURI(0);
        expect(metadata).to.deep.equal(
          "data:application/json;base64,eyJuYW1lIjoiaG9zdCIsImRlc2NyaXB0aW9uIjoib2NuZnQgaG9zdCIsImltYWdlIjoiaHR0cDovL2xvY2FsaG9zdDo0MjAwLzAucG5nIiwiZXh0ZXJuYWxfdXJsIjoiaHR0cDovL2xvY2FsaG9zdDo0MjAxLzAifQ=="
        );
      });
    });
  });

  describe("register", () => {
    describe("when called with new remote data", () => {
      it("should add remote data", async () => {
        await Host.setBaseURI("http://localhost:4200/");
        await Host.setViewerURI("http://localhost:4201/");
        await Host.mint(await signers[0].getAddress());

        let remoteHead = await RemoteFactory.deploy();
        await remoteHead.setBaseURI(
          "https://kethic.mypinata.cloud/ipfs/QmeDo7kdQdoc9v1ucgMPTrGGqVFWcmvnaWrS7a4yJ4ema8/"
        );
        await remoteHead.setViewerURI("http://localhost:4201/");
        await remoteHead.mint(await signers[0].getAddress());

        await Host.register(0, "HEAD_SLOT", remoteHead.address, 0);

        const featureSlot = ethers.utils.keccak256(
          ethers.utils.toUtf8Bytes("HEAD_SLOT")
        );

        expect(await Host.features(0, featureSlot)).to.deep.equal(
          "https://kethic.mypinata.cloud/ipfs/QmeDo7kdQdoc9v1ucgMPTrGGqVFWcmvnaWrS7a4yJ4ema8/0.png"
        );
      });
    });

    describe("when called with new remote data that msg.sender does not own", () => {
      it("should revert", async () => {
        await Host.setBaseURI("http://localhost:4200/");
        await Host.setViewerURI("http://localhost:4201/");
        await Host.mint(await signers[0].getAddress());

        let remoteHead = await RemoteFactory.deploy();
        await remoteHead.setBaseURI(
          "https://kethic.mypinata.cloud/ipfs/QmeDo7kdQdoc9v1ucgMPTrGGqVFWcmvnaWrS7a4yJ4ema8/"
        );
        await remoteHead.setViewerURI("http://localhost:4201/");
        await remoteHead.mint(await signers[0].getAddress());
        await remoteHead.mint(await signers[1].getAddress());

        await expect(
          Host.register(0, "HEAD_SLOT", remoteHead.address, 1)
        ).to.be.revertedWith("NotRemoteOwner()");
      });
    });

    describe("when called with updated remote data", () => {
      it("should replace remote data", async () => {
        await Host.setBaseURI("http://localhost:4200/");
        await Host.setViewerURI("http://localhost:4201/");
        await Host.mint(await signers[0].getAddress());

        let remoteHead = await RemoteFactory.deploy();
        await remoteHead.setBaseURI(
          "https://kethic.mypinata.cloud/ipfs/QmeDo7kdQdoc9v1ucgMPTrGGqVFWcmvnaWrS7a4yJ4ema8/"
        );
        await remoteHead.setViewerURI("http://localhost:4201/");
        await remoteHead.mint(await signers[0].getAddress());
        await remoteHead.mint(await signers[0].getAddress());

        await Host.register(0, "HEAD_SLOT", remoteHead.address, 0);

        await Host.register(0, "HEAD_SLOT", remoteHead.address, 1);

        const featureSlot = ethers.utils.keccak256(
          ethers.utils.toUtf8Bytes("HEAD_SLOT")
        );

        expect(await Host.features(0, featureSlot)).to.deep.equal(
          "https://kethic.mypinata.cloud/ipfs/QmeDo7kdQdoc9v1ucgMPTrGGqVFWcmvnaWrS7a4yJ4ema8/1.png"
        );
      });
    });
  });

  //  function deregister(uint256 _tokenId, string calldata _featureSlot)
  describe("deregister", () => {
    describe("when called with valid _tokenId and _featureSlot", () => {
      it("should blank existing data", async () => {
        await Host.setBaseURI("http://localhost:4200/");
        await Host.setViewerURI("http://localhost:4201/");
        await Host.mint(await signers[0].getAddress());

        let remoteHead = await RemoteFactory.deploy();
        await remoteHead.setBaseURI(
          "https://kethic.mypinata.cloud/ipfs/QmeDo7kdQdoc9v1ucgMPTrGGqVFWcmvnaWrS7a4yJ4ema8/"
        );
        await remoteHead.setViewerURI("http://localhost:4201/");
        await remoteHead.mint(await signers[0].getAddress());

        await Host.register(0, "HEAD_SLOT", remoteHead.address, 0);

        const featureSlot = ethers.utils.keccak256(
          ethers.utils.toUtf8Bytes("HEAD_SLOT")
        );

        let registeredImageURI = await Host.features(0, featureSlot);

        await Host.deregister(0, "HEAD_SLOT");
        let deregisteredImageURI = await Host.features(0, featureSlot);

        expect(
          registeredImageURI ==
            "https://kethic.mypinata.cloud/ipfs/QmeDo7kdQdoc9v1ucgMPTrGGqVFWcmvnaWrS7a4yJ4ema8/0.png" &&
            deregisteredImageURI == ""
        ).to.be.true;
      });
    });

    describe("when called with invalid _tokenId", () => {
      it("should revert", async () => {
        await Host.setBaseURI("http://localhost:4200/");
        await Host.setViewerURI("http://localhost:4201/");
        await Host.mint(await signers[0].getAddress());

        let remoteHead = await RemoteFactory.deploy();
        await remoteHead.setBaseURI(
          "https://kethic.mypinata.cloud/ipfs/QmeDo7kdQdoc9v1ucgMPTrGGqVFWcmvnaWrS7a4yJ4ema8/"
        );
        await remoteHead.setViewerURI("http://localhost:4201/");
        await remoteHead.mint(await signers[0].getAddress());

        await Host.register(0, "HEAD_SLOT", remoteHead.address, 0);

        await expect(Host.deregister(1, "HEAD_SLOT")).to.be.revertedWith(
          "BadTokenID()"
        );
      });
    });

    describe("when called with new remote data that msg.sender does not own", () => {
      it("should revert", async () => {
        await Host.setBaseURI("http://localhost:4200/");
        await Host.setViewerURI("http://localhost:4201/");
        await Host.mint(await signers[1].getAddress());

        let remoteHead = await RemoteFactory.deploy();
        await remoteHead.setBaseURI(
          "https://kethic.mypinata.cloud/ipfs/QmeDo7kdQdoc9v1ucgMPTrGGqVFWcmvnaWrS7a4yJ4ema8/"
        );
        await remoteHead.setViewerURI("http://localhost:4201/");
        await remoteHead.mint(await signers[1].getAddress());

        await Host.connect(signers[1]).register(
          0,
          "HEAD_SLOT",
          remoteHead.address,
          0
        );

        await expect(Host.deregister(0, "HEAD_SLOT")).to.be.revertedWith(
          "NotNFTOwner()"
        );
      });
    });
  });

  // function getImageURI(uint256 _tokenId, bytes32 _featureSlot)
  describe("getImageURI", () => {
    describe("when called with valid _tokenId and _featureSlot", () => {
      it("should return remote imageURI string", async () => {
        await Host.setBaseURI("http://localhost:4200/");
        await Host.setViewerURI("http://localhost:4201/");
        await Host.mint(await signers[0].getAddress());

        let remoteHead = await RemoteFactory.deploy();
        await remoteHead.setBaseURI(
          "https://kethic.mypinata.cloud/ipfs/QmeDo7kdQdoc9v1ucgMPTrGGqVFWcmvnaWrS7a4yJ4ema8/"
        );
        await remoteHead.setViewerURI("http://localhost:4201/");
        await remoteHead.mint(await signers[0].getAddress());

        await Host.register(0, "HEAD_SLOT", remoteHead.address, 0);

        let imageURI = await Host.getImageURI(0, "HEAD_SLOT");
        expect(imageURI).to.deep.equal(
          "https://kethic.mypinata.cloud/ipfs/QmeDo7kdQdoc9v1ucgMPTrGGqVFWcmvnaWrS7a4yJ4ema8/0.png"
        );
      });
    });

    describe("when called with valid _tokenId and invalid _featureSlot", () => {
      it("should return empty string", async () => {
        await Host.setBaseURI("http://localhost:4200/");
        await Host.setViewerURI("http://localhost:4201/");
        await Host.mint(await signers[0].getAddress());

        let remoteHead = await RemoteFactory.deploy();
        await remoteHead.setBaseURI(
          "https://kethic.mypinata.cloud/ipfs/QmeDo7kdQdoc9v1ucgMPTrGGqVFWcmvnaWrS7a4yJ4ema8/"
        );
        await remoteHead.setViewerURI("http://localhost:4201/");
        await remoteHead.mint(await signers[0].getAddress());

        await Host.register(0, "HEAD_SLOT", remoteHead.address, 0);

        let imageURI = await Host.getImageURI(0, "HEART_SLOT");
        expect(imageURI).to.deep.equal("");
      });
    });

    describe("when called with invalid _tokenId", () => {
      it("should revert", async () => {
        await Host.setBaseURI("http://localhost:4200/");
        await Host.setViewerURI("http://localhost:4201/");
        await Host.mint(await signers[0].getAddress());

        let remoteHead = await RemoteFactory.deploy();
        await remoteHead.setBaseURI(
          "https://kethic.mypinata.cloud/ipfs/QmeDo7kdQdoc9v1ucgMPTrGGqVFWcmvnaWrS7a4yJ4ema8/"
        );
        await remoteHead.setViewerURI("http://localhost:4201/");
        await remoteHead.mint(await signers[0].getAddress());

        await expect(Host.getImageURI(1, "HEAD_SLOT")).to.be.revertedWith(
          "BadTokenID()"
        );
      });
    });
  });

  //  function getFeatureList(uint256 _tokenId)
  describe("getFeatureList", () => {
    describe("when called with valid _tokenId", () => {
      it("should return json imageURI table", async () => {
        // host
        await Host.setBaseURI("http://localhost:4200/");
        await Host.setViewerURI("http://localhost:4201/");
        await Host.mint(await signers[0].getAddress());

        // head
        let remoteHead = await RemoteFactory.deploy();
        await remoteHead.setBaseURI(
          "https://kethic.mypinata.cloud/ipfs/QmeDo7kdQdoc9v1ucgMPTrGGqVFWcmvnaWrS7a4yJ4ema8/"
        );
        await remoteHead.setViewerURI("http://localhost:4201/");
        await remoteHead.mint(await signers[0].getAddress());
        await Host.register(0, "HEAD_SLOT", remoteHead.address, 0);

        let remoteHand = await RemoteFactory.deploy();
        await remoteHand.setBaseURI(
          "https://kethic.mypinata.cloud/ipfs/QmbBXqmhsa8LpXsy8VtyhkoHc6SaaTP9SWcQfuAKNTtoKm/"
        );
        await remoteHand.setViewerURI("http://localhost:4201/");
        await remoteHand.mint(await signers[0].getAddress());
        await Host.register(0, "HAND_SLOT", remoteHand.address, 0);

        let remoteBody = await RemoteFactory.deploy();
        await remoteBody.setBaseURI(
          "https://kethic.mypinata.cloud/ipfs/Qmbe7WL5AkmUD5AndRs1NTidDUFDCRLpjuahjuK1NCzXft/"
        );
        await remoteBody.setViewerURI("http://localhost:4201/");
        await remoteBody.mint(await signers[0].getAddress());
        await Host.register(0, "BODY_SLOT", remoteBody.address, 0);

        let remoteBadge = await RemoteFactory.deploy();
        await remoteBadge.setBaseURI(
          "https://kethic.mypinata.cloud/ipfs/QmSMwDCNrhejJAZmvQ1FhtBR4NbwjgYSjCh1k7CTZyHkg3/"
        );
        await remoteBadge.setViewerURI("http://localhost:4201/");
        await remoteBadge.mint(await signers[0].getAddress());
        await Host.register(0, "BADGE_SLOT", remoteBadge.address, 0);

        let imageURIjson = await Host.getFeatureList(0);
        expect(imageURIjson).to.deep.equal(
          '{"HEAD_SLOT":"https://kethic.mypinata.cloud/ipfs/QmeDo7kdQdoc9v1ucgMPTrGGqVFWcmvnaWrS7a4yJ4ema8/0.png","HAND_SLOT":"https://kethic.mypinata.cloud/ipfs/QmbBXqmhsa8LpXsy8VtyhkoHc6SaaTP9SWcQfuAKNTtoKm/0.png","BODY_SLOT":"https://kethic.mypinata.cloud/ipfs/Qmbe7WL5AkmUD5AndRs1NTidDUFDCRLpjuahjuK1NCzXft/0.png","BADGE_SLOT":"https://kethic.mypinata.cloud/ipfs/QmSMwDCNrhejJAZmvQ1FhtBR4NbwjgYSjCh1k7CTZyHkg3/0.png"}'
        );
      });
    });
  });
});
