import { expect } from "./setup";
import { Contract, ContractFactory, Signer } from "ethers";
import { ethers } from "hardhat";

describe("Remote", () => {
  let signers: Signer[];
  before(async () => {
    signers = await ethers.getSigners();
  });

  let RemoteFactory: ContractFactory;
  before(async () => {
    RemoteFactory = await ethers.getContractFactory("remote");
  });

  let Remote: Contract;
  beforeEach(async () => {
    Remote = await RemoteFactory.deploy("https://localhost:4200/","https://localhost:4201/");
  });

  describe("construction", () => {
    it("Remote contract should have correct owner", async () => {
      expect(await Remote.owner()).to.deep.equal(await signers[0].getAddress());
    });
  });

  describe("baseURI", () => {
    // describe("default at deploy", () => {
    //   it("should be blank", async () => {
    //     expect(await Remote.baseURI()).to.deep.equal("");
    //   });
    // });

    describe("after being set", () => {
      it("should match the input", async () => {
        const _baseURI: string = "http://localhost:4200/";
        await Remote.setBaseURI(_baseURI);
        expect(await Remote.baseURI()).to.deep.equal(_baseURI);
      });
    });
  });

  describe("mint", () => {
    describe("when called by owner", () => {
      it("should mint tokens in sequence", async () => {
        let mintList = [];
        mintList.push(parseInt(await Remote.totalSupply()));

        for (let i = 0; i < 4; i++) {
          Remote.mint(await signers[0].getAddress(),1);
          mintList.push(parseInt(await Remote.totalSupply()));
        }

        expect(mintList).to.deep.equal([0, 1, 2, 3, 4]);
      });
    });

    describe("when called by non-owner", () => {
      it("should revert with 'Ownable: caller is not the owner'", async () => {
        expect(
          Remote.connect(signers[1]).mint(await signers[0].getAddress(),1)
        ).to.be.revertedWith("Ownable: caller is not the owner");
      });
    });
  });

  describe("tokenURI", () => {
    describe("when called with invalid tokenId", () => {
      it("should revert()", async () => {
        await expect(Remote.tokenURI(0)).to.be.reverted;
      });
    });

    describe("when called with valid tokenId", () => {
      it("should return json metadata base64 blob", async () => {
        await Remote.setBaseURI(
          "https://kethic.mypinata.cloud/ipfs/QmeDo7kdQdoc9v1ucgMPTrGGqVFWcmvnaWrS7a4yJ4ema8/"
        );
        await Remote.setExternalURI("http://localhost:4201/");
        await Remote.mint(await signers[0].getAddress(),1);
        const metadata = await Remote.tokenURI(0);
        expect(metadata).to.deep.equal(
          "data:application/json;base64,eyJuYW1lIjoicmVtb3RlIiwiZGVzY3JpcHRpb24iOiJvY25mdCByZW1vdGUiLCJpbWFnZSI6Imh0dHBzOi8va2V0aGljLm15cGluYXRhLmNsb3VkL2lwZnMvUW1lRG83a2RRZG9jOXYxdWNnTVBUckdHcVZGV2Ntdm5hV3JTN2E0eUo0ZW1hOC8wLnBuZyIsImV4dGVybmFsX3VybCI6Imh0dHA6Ly9sb2NhbGhvc3Q6NDIwMS8wIn0="
        );
      });
    });
  });
});
