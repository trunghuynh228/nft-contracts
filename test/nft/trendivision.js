const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Trendivison", function () {
    let [accountA, accountB, accountC] =[]
    let trendivision
    let address0 = "0x0000000000000000000000000000000000000000"
    let uri = "nft.trendivision.vn/"
    beforeEach(async () => {
        [accountA, accountB, accountC] = await ethers.getSigners();
        const Trendivision = await ethers.getContractFactory("Trendivision");
        trendivision = await Trendivision.deploy();
        await trendivision.deployed()
    })

    describe("mint", function () {
        it("should revert if mint to zero  address", async function() {
            await expect(trendivision.mint(address0)).to.be.revertedWith("ERC721: mint to the zero address");
        });
        it("should mint correctly", async function() {
            const mintTx = await trendivision.mint(accountA.address)
            await expect(mintTx).to.be.emit(trendivision, "Transfer").withArgs(address0,accountA.address,1)
            expect(await trendivision.balanceOf(accountA.address)).to.be.equal(1)
            expect(await trendivision.ownerOf(1)).to.be.equal(accountA.address)
            const mintTx2 = await trendivision.mint(accountA.address)
            await expect(mintTx2).to.be.emit(trendivision, "Transfer").withArgs(address0,accountA.address,2)
            expect(await trendivision.balanceOf(accountA.address)).to.be.equal(2)
            expect(await trendivision.ownerOf(2)).to.be.equal(accountA.address)
        });
    })
    describe("updateBaseTokenURI", function () {
        it("should update Base Token URI correctly", async function() {
            await trendivision.mint(accountA.address)
            await trendivision.updateBaseTokenURI(uri)
            expect(await trendivision.tokenURI(1)).to.be.equal(uri + "1")
        });
    })
})