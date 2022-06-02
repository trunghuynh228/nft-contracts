const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Trendivision NFT", function () {
    let [accountA, accountB, accountC] = []
    let trendivisionGacha
    let trend
    let address0 = "0x0000000000000000000000000000000000000000"
    let defaulBalance = ethers.utils.parseEther("1000000")
    let priceGacha1 = ethers.utils.parseEther("100")
    let priceGacha2 = ethers.utils.parseEther("200")
    let priceGacha3 = ethers.utils.parseEther("300")
    let oneDay = 86400
    beforeEach(async () => {
        [accountA, accountB, accountC] = await ethers.getSigners();
        const Trend = await ethers.getContractFactory("Trend");
        trend = await Trend.deploy()
        await trend.deployed()
        const TrendivisionGacha = await ethers.getContractFactory("TrendivisionGacha");
        trendivisionGacha = await TrendivisionGacha.deploy(trend.address)
        await trendivisionGacha.deployed()

        await trend.approve(trendivisionGacha.address, defaulBalance)
        await trend.approve(accountA.address, defaulBalance)

    })
    describe("openGacha", function () {
        it("should revert if gacha nonexistent", async function () {
            await expect(trendivisionGacha.openGacha(7, priceGacha1))
                .to.be.revertedWith("TrendivisionGacha: invalid gacha")
        });
        it("should revert if price not match", async function () {
            await expect(trendivisionGacha.openGacha(1, priceGacha2))
                .to.be.revertedWith("TrendivisionGacha: price not match")
        });
        it("should open gacha correctly gacha 1", async function () {
            var times = 3;
            for (var i = 1; i <= times; i++) {
                await trendivisionGacha.openGacha(1, priceGacha1)
                const trendivision = await trendivisionGacha._tokenIdToTrendivision(i)
                console.log(trendivision.rank)
                expect(await trendivisionGacha.ownerOf(i)).to.be.equal(accountA.address)
            }
            expect(await trend.balanceOf(trendivisionGacha.address)).to.be
                .equal(priceGacha1.mul(times))
                
                console.log(priceGacha1.mul(times))
                console.log(defaulBalance)

            expect(await trend.balanceOf(accountA.address)).to.be
                .equal(defaulBalance.sub(priceGacha1.mul(times)))
                
        });
        it("should open gacha correctly gacha 2", async function () {
            var times = 3;
            for (var i = 1; i <= times; i++) {
                await trendivisionGacha.openGacha(2, priceGacha2)
                const trendivision = await trendivisionGacha._tokenIdToTrendivision(i)
                console.log(trendivision.rank)
                expect(await trendivisionGacha.ownerOf(i)).to.be.equal(accountA.address)
            }
            expect(await trend.balanceOf(trendivisionGacha.address)).to.be
                .equal(priceGacha2.mul(times))
            expect(await trend.balanceOf(accountA.address)).to.be
                .equal(defaulBalance.sub(priceGacha2.mul(times)))
        });
        it("should open gacha correctly gacha 3", async function () {
            var times = 3;
            for (var i = 1; i <= times; i++) {
                await trendivisionGacha.openGacha(3, priceGacha3)
                const trendivision = await trendivisionGacha._tokenIdToTrendivision(i)
                console.log(trendivision.rank)
                expect(await trendivisionGacha.ownerOf(i)).to.be.equal(accountA.address)
            }
            expect(await trend.balanceOf(trendivisionGacha.address)).to.be
                .equal(priceGacha3.mul(times))
            expect(await trend.balanceOf(accountA.address)).to.be
                .equal(defaulBalance.sub(priceGacha3.mul(times)))
        });
    })
    describe("breedPetties", function () {
        it("should revert if not owner", async function () {
            await trendivisionGacha.setApprovalForAll(trendivisionGacha.address, true)
            await trendivisionGacha.openGacha(1, priceGacha1)
            await trendivisionGacha.openGacha(1, priceGacha1)
            await expect(trendivisionGacha.connect(accountB).breedPetties(1, 2))
                .to.be.revertedWith("TrendivisionGacha: sender is not owner of token")
        });
        it("should revert if not same rank", async function () {
            await trendivisionGacha.setApprovalForAll(trendivisionGacha.address, true)
            await trendivisionGacha.openGacha(4, priceGacha1)
            await trendivisionGacha.openGacha(5, priceGacha1)
            await expect(trendivisionGacha.breedPetties(1, 2))
                .to.be.revertedWith("TrendivisionGacha: must same rank")
        });
        it("should revert if trendivision is at the highest rank", async function () {
            await trendivisionGacha.setApprovalForAll(trendivisionGacha.address, true)
            await trendivisionGacha.openGacha(6, priceGacha1)
            await trendivisionGacha.openGacha(6, priceGacha1)
            await expect(trendivisionGacha.breedPetties(1, 2))
                .to.be.revertedWith("TrendivisionGacha: petties is at the highest rank")
        });
        it("should revert if nft hasnt been approved", async function () {
            await trendivisionGacha.openGacha(4, priceGacha1)
            await trendivisionGacha.openGacha(4, priceGacha1)
            await expect(trendivisionGacha.breedPetties(1, 2))
                .to.be.revertedWith("TrendivisionGacha: The contract is unauthorized to manage this token")
        });
        it("should breed correctly rank 1", async function () {
            await trendivisionGacha.setApprovalForAll(trendivisionGacha.address, true)
            await trendivisionGacha.openGacha(4, priceGacha1)
            await trendivisionGacha.openGacha(4, priceGacha1)
            await trendivisionGacha.breedPetties(1, 2)
            await expect(trendivisionGacha.ownerOf(1))
            .to
            .be.revertedWith("ERC721: owner query for nonexistent token")
            await expect(trendivisionGacha.ownerOf(2))
            .to
            .be.revertedWith("ERC721: owner query for nonexistent token")

            // expect(await trendivisionGacha.ownerOf(3)).to.be.equal(accountA.address)
            // const trendivision1 = await trendivisionGacha._tokenIdToTrendivision(1)
            // const trendivision2 = await trendivisionGacha._tokenIdToTrendivision(2)
            // const trendivision3 = await trendivisionGacha._tokenIdToTrendivision(3)
            // expect(trendivision1.rank).to.be.equal(0)
            // expect(trendivision2.rank).to.be.equal(0)
            // expect(trendivision3.rank).to.be.equal(2)
            const blockNum = await ethers.provider.getBlockNumber();
            const block = await ethers.provider.getBlock(blockNum);

            let breedInfo = await trendivisionGacha._idToBreedInfo(1)
            expect(breedInfo.startTime).to.be.equal(await block.timestamp)
            expect(breedInfo.breedTime).to.be.equal(oneDay)
            expect(breedInfo.owner).to.be.equal(accountA.address)
            expect(breedInfo.matron).to.be.equal(1)
            expect(breedInfo.sire).to.be.equal(2)
            expect(breedInfo.newRank).to.be.equal(2)

        })
        it("should breed correctly rank 2", async function () {
            await trendivisionGacha.setApprovalForAll(trendivisionGacha.address, true)
            await trendivisionGacha.openGacha(5, priceGacha1)
            await trendivisionGacha.openGacha(5, priceGacha1)
            await trendivisionGacha.breedPetties(1, 2)
            await expect(trendivisionGacha.ownerOf(1))
            .to
            .be.revertedWith("ERC721: owner query for nonexistent token")
            const blockNum = await ethers.provider.getBlockNumber();
            const block = await ethers.provider.getBlock(blockNum);
            await expect(trendivisionGacha.ownerOf(2))
            .to
            .be.revertedWith("ERC721: owner query for nonexistent token")
            let breedInfo = await trendivisionGacha._idToBreedInfo(1)
            expect(breedInfo.startTime).to.be.equal(await block.timestamp)
            expect(breedInfo.breedTime).to.be.equal(oneDay*2)
            expect(breedInfo.owner).to.be.equal(accountA.address)
            expect(breedInfo.matron).to.be.equal(1)
            expect(breedInfo.sire).to.be.equal(2)
            expect(breedInfo.newRank).to.be.equal(3)          
        })
    })
    describe("claimsPetty", function () {
        it("should revert if not owner", async function () {
            await trendivisionGacha.setApprovalForAll(trendivisionGacha.address, true)
            await trendivisionGacha.openGacha(4, priceGacha1)
            await trendivisionGacha.openGacha(4, priceGacha1)
            await trendivisionGacha.breedPetties(1, 2)
            await expect(trendivisionGacha.connect(accountB).claimsPetty(1))
            .to
            .be
            .revertedWith("TrendivisionGacha: sender is not breed owner")
        })
        it("should revert if not exceed claim time rank 1", async function () {
            await trendivisionGacha.setApprovalForAll(trendivisionGacha.address, true)
            await trendivisionGacha.openGacha(4, priceGacha1)
            await trendivisionGacha.openGacha(4, priceGacha1)
            await trendivisionGacha.breedPetties(1, 2)
            await network.provider.send("evm_increaseTime", [oneDay * 1 - 1])
            await expect(trendivisionGacha.claimsPetty(1))
            .to
            .be
            .revertedWith("TrendivisionGacha: breed time hasn't been exceeded")
        })
        it("should claim correctly rank 1", async function () {
            await trendivisionGacha.setApprovalForAll(trendivisionGacha.address, true)
            await trendivisionGacha.openGacha(4, priceGacha1)
            await trendivisionGacha.openGacha(4, priceGacha1)
            await trendivisionGacha.breedPetties(1, 2)
            await network.provider.send("evm_increaseTime", [oneDay * 1 + 1])
            await trendivisionGacha.claimsPetty(1)
            const trendivision3 = await trendivisionGacha._tokenIdToTrendivision(3)
            expect(trendivision3.rank).to.be.equal(2)
            let breedInfo = await trendivisionGacha._idToBreedInfo(1)
            expect(breedInfo.startTime).to.be.equal(0)
            expect(breedInfo.breedTime).to.be.equal(0)
            expect(breedInfo.owner).to.be.equal(address0)
            expect(breedInfo.matron).to.be.equal(0)
            expect(breedInfo.sire).to.be.equal(0)
            expect(breedInfo.newRank).to.be.equal(0)
        })
        it("should revert if not exceed breed time rank 2", async function () {
            await trendivisionGacha.setApprovalForAll(trendivisionGacha.address, true)
            await trendivisionGacha.openGacha(5, priceGacha1)
            await trendivisionGacha.openGacha(5, priceGacha1)
            await trendivisionGacha.breedPetties(1, 2)
            await network.provider.send("evm_increaseTime", [oneDay * 2 - 1])
            await expect(trendivisionGacha.claimsPetty(1))
            .to
            .be
            .revertedWith("TrendivisionGacha: breed time hasn't been exceeded")
        })
        it("should claim correctly rank 2", async function () {
            await trendivisionGacha.setApprovalForAll(trendivisionGacha.address, true)
            await trendivisionGacha.openGacha(5, priceGacha1)
            await trendivisionGacha.openGacha(5, priceGacha1)
            await trendivisionGacha.breedPetties(1, 2)
            await network.provider.send("evm_increaseTime", [oneDay * 2 + 1])
            await trendivisionGacha.claimsPetty(1)
            const trendivision3 = await trendivisionGacha._tokenIdToTrendivision(3)
            expect(trendivision3.rank).to.be.equal(3)
            let breedInfo = await trendivisionGacha._idToBreedInfo(1)
            expect(breedInfo.startTime).to.be.equal(0)
            expect(breedInfo.breedTime).to.be.equal(0)
            expect(breedInfo.owner).to.be.equal(address0)
            expect(breedInfo.matron).to.be.equal(0)
            expect(breedInfo.sire).to.be.equal(0)
            expect(breedInfo.newRank).to.be.equal(0)

        })
    })
})