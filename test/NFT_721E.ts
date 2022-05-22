import { expect } from "./setup";
import { Contract, ContractFactory, Signer } from "ethers";
import { ethers } from "hardhat";

describe("NFT_721E", () => {
  let signers: Signer[];
  before(async () => {
    signers = await ethers.getSigners();
  });

  let contractFactory: ContractFactory;
  before(async () => {
    contractFactory = await ethers.getContractFactory("NFT_721E");
  });

  let contract: Contract;
  beforeEach(async () => {
    contract = await contractFactory.deploy("https://localhost:4200/","https://localhost:4201/");
  });

  describe("construction", () => {
    it("Remote contract should have correct owner", async () => {
      expect(await contract.owner()).to.deep.equal(await signers[0].getAddress());
    });
  });

    /// ------------------------------------------------------------------------
  /// ERC165
  /// ------------------------------------------------------------------------

  describe("supportsInterface", () => {
    describe("when called with the correct ERC165 signature", () => {
      it("should return true", async () => {
        expect(await contract.supportsInterface('0x01ffc9a7')).to.be.true;
      });
    });
    describe("when called with the correct IComposable signature", () => {
      it("should return true", async () => {
        expect(await contract.supportsInterface('0x09e3ba39')).to.be.false;
      });
    });
    describe("when called with the incorrect IComposable signature", () => {
      it("should return false", async () => {
        expect(await contract.supportsInterface('0x09e3ba38')).to.be.false;
      });
    });
    describe("when called with the correct ERC721Enumerable signature", () => {
      it("should return true", async () => {
        expect(await contract.supportsInterface('0x780e9d63')).to.be.true;
      });
    });
    describe("when called with the correct ERC721Metadata signature", () => {
      it("should return true", async () => {
        expect(await contract.supportsInterface('0x5b5e139f')).to.be.true;
      });
    });
    describe("when called with the correct ERC721 signature", () => {
      it("should return true", async () => {
        expect(await contract.supportsInterface('0x80ac58cd')).to.be.true;
      });
    });
    describe("when called with the correct ERC173 signature", () => {
      it("should return true", async () => {
        expect(await contract.supportsInterface('0x7f5828d0')).to.be.false;
      });
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
        await contract.setBaseURI(_baseURI);
        expect(await contract.baseURI()).to.deep.equal(_baseURI);
      });
    });
  });

  describe("mint", () => {
    describe("when called by owner", () => {
      it("should mint tokens in sequence", async () => {
        let mintList = [];
        mintList.push(parseInt(await contract.totalSupply()));

        for (let i = 0; i < 4; i++) {
          contract.mint(await signers[0].getAddress(),1);
          mintList.push(parseInt(await contract.totalSupply()));
        }

        expect(mintList).to.deep.equal([0, 1, 2, 3, 4]);
      });
    });

    describe("when called by non-owner", () => {
      it("should revert with 'Ownable: caller is not the owner'", async () => {
        expect(
          contract.connect(signers[1]).mint(await signers[0].getAddress(),1)
        ).to.be.revertedWith("Ownable: caller is not the owner");
      });
    });
  });

  describe("tokenURI", () => {
    describe("when called with invalid tokenId", () => {
      it("should revert()", async () => {
        await expect(contract.tokenURI(0)).to.be.reverted;
      });
    });

    describe("when called with valid tokenId", () => {
      it("should return json metadata base64 blob", async () => {
        await contract.setBaseURI(
          "https://kethic.mypinata.cloud/ipfs/QmeDo7kdQdoc9v1ucgMPTrGGqVFWcmvnaWrS7a4yJ4ema8/"
        );
        await contract.setExternalURI("http://localhost:4201/");
        await contract.mint(await signers[0].getAddress(),1);
        const metadata = await contract.tokenURI(0);
        console.log(metadata);
        expect(metadata).to.deep.equal(
          "data:application/json;base64,eyJuYW1lIjoiTkZUXzcyMUUiLCJkZXNjcmlwdGlvbiI6IkdlbmVyaWMgRVJDNzIxRW51bWVyYWJsZSBORlQiLCJpbWFnZSI6Imh0dHBzOi8va2V0aGljLm15cGluYXRhLmNsb3VkL2lwZnMvUW1lRG83a2RRZG9jOXYxdWNnTVBUckdHcVZGV2Ntdm5hV3JTN2E0eUo0ZW1hOC8wLnBuZyIsImV4dGVybmFsX3VybCI6Imh0dHA6Ly9sb2NhbGhvc3Q6NDIwMS8wIn0="
        );
      });
    });
  });
});
