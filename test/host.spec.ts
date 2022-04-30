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
  let Remote: Contract;
  beforeEach(async () => {
    Host = await HostFactory.deploy();

    Remote = await RemoteFactory.deploy();
    Remote.mint(await signers[0].getAddress());
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
        expect(
          Host.connect(signers[1]).mint(await signers[0].getAddress())
        ).to.be.revertedWith("Ownable: caller is not the owner");
      });
    });
  });

  describe("Soulbound", () => {
    describe("transferFrom(from, to, tokenId)", () => {
      it("should revert with Soulbound()", async () => {
        Host.mint(await signers[0].getAddress());
        expect(
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
          "data:application/json;base64,eyJuYW1lIjoiaG9zdCIsImRlc2NyaXB0aW9uIjoib2NuZnQiLCJpbWFnZSI6Imh0dHA6Ly9sb2NhbGhvc3Q6NDIwMC8wLnBuZyIsImV4dGVybmFsX3VybCI6Imh0dHA6Ly9sb2NhbGhvc3Q6NDIwMS8wIn0="
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

        await Host.register(
          0,
          "HEAD_SLOT",
          "0x0000000000000000000000000000000000000007",
          4
        );

        await Host.register(
          0,
          "HAND_SLOT",
          "0x0000000000000000000000000000000000000008",
          3
        );

        const featureSlot = ethers.utils.keccak256(
          ethers.utils.toUtf8Bytes("HEAD_SLOT")
        );

        let [remoteContractAddr, remoteTokenId] = await Host.features(
          0,
          featureSlot
        );

        expect([remoteContractAddr, parseInt(remoteTokenId)]).to.deep.equal([
          "0x0000000000000000000000000000000000000007",
          4,
        ]);
      });
    });

    describe("when called with updated remote data", () => {
      it("should replace remote data", async () => {

        await Host.setBaseURI("http://localhost:4200/");
        await Host.setViewerURI("http://localhost:4201/");
        await Host.mint(await signers[0].getAddress());

        await Host.register(0,'HEAD_SLOT','0x0000000000000000000000000000000000000007',4);
        await Host.register(0,'HAND_SLOT','0x0000000000000000000000000000000000000008',3);
        await Host.register(0,'HEAD_SLOT','0x0000000000000000000000000000000000000007',5);

        const featureSlot = ethers.utils.keccak256(
          ethers.utils.toUtf8Bytes("HEAD_SLOT")
        );

        let [remoteContractAddr, remoteTokenId] = await Host.features(
          0,
          featureSlot
        );

        expect([remoteContractAddr, parseInt(remoteTokenId)]).to.deep.equal([
          "0x0000000000000000000000000000000000000007",
          5,
        ]);

      });
    });
  });

  // function getImageURI(uint256 _tokenId, bytes32 _featureSlot)
  describe("getImageURI", () => {
    describe("when called with valid _tokenId and _featureSlot", () => {
      it("should return remote imageURI string", async () => {

        // setup remote
        await Remote.setBaseURI(
          "https://kethic.mypinata.cloud/ipfs/QmeDo7kdQdoc9v1ucgMPTrGGqVFWcmvnaWrS7a4yJ4ema8/"
        );
        await Remote.setViewerURI("http://localhost:4201/");
        await Remote.mint(await signers[0].getAddress());

        // setup host
        await Host.setBaseURI("http://localhost:4200/");
        await Host.setViewerURI("http://localhost:4201/");
        await Host.mint(await signers[0].getAddress());

        await Host.register(0,'HEAD_SLOT',Remote.address,0);

        

        const featureSlot = ethers.utils.keccak256(
          ethers.utils.toUtf8Bytes("HEAD_SLOT")
        );

        let imageURI = await Host.getImageURI(0,featureSlot);
        console.log(imageURI);
      });
    });
  });

  //   function getFeatureList(uint256 _tokenId) public returns (string memory) {
  describe("getFeatureList", () => {
    describe("when called with valid _tokenId", () => {
      it("should return feature list json", async () => {

        // setup remote
        await Remote.setBaseURI(
          "https://kethic.mypinata.cloud/ipfs/QmeDo7kdQdoc9v1ucgMPTrGGqVFWcmvnaWrS7a4yJ4ema8/"
        );
        await Remote.setViewerURI("http://localhost:4201/");
        await Remote.mint(await signers[0].getAddress());

        // setup host
        await Host.setBaseURI("http://localhost:4200/");
        await Host.setViewerURI("http://localhost:4201/");
        await Host.mint(await signers[0].getAddress());

        await Host.register(0,'HEAD_SLOT',Remote.address,0);
        await Host.register(0,'HAND_SLOT',Remote.address,0);
        await Host.register(0,'BODY_SLOT',Remote.address,0);
        await Host.register(0,'BADGE_SLOT',Remote.address,0);
        

        let featureList = await Host.getFeatureList(0);
        console.log(featureList);
      });
    });
  });

  // describe("getFeatureList", () => {
  //   describe("when called with valid tokenId", () => {
  //     it("should return a data array", async () => {

  //       await Host.setBaseURI("http://localhost:4200/");
  //       await Host.setViewerURI("http://localhost:4201/");
  //       await Host.mint(await signers[0].getAddress());

  //       await Host.register(0,'0x0000000000000000000000000000000000000007',4);
  //       await Host.register(0,'0x0000000000000000000000000000000000000008',3);

  //       // typescript gives us labeled objects in addition to the raw tuple
  //       let remoteData = await Host.getFeatureList(0);
  //       // tuple[] :  0x0000000000000000000000000000000000000007,4,0x0000000000000000000000000000000000000008,3
  //       console.log(remoteData)
  //       //expect([remoteContractAddr, parseInt(remoteTokenId)]).to.deep.equal(['0x0000000000000000000000000000000000000008',3])

  //     });
  //   });
  // });
});
