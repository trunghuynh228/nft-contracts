const { expect } = require("chai");
const { ethers, network } = require("hardhat");

describe("Reserve", function () {
    let [admin, staker, staker2] = []
    let stakingreserve
    let trend //erc20
    let staking
    let defaultRate = 158548 // apr = 50% => exchange to second = 0.00000158458% and no compounding
    let defaultFeeDecimal = 13
    let reserveBalance = ethers.utils.parseEther("1000000")
    let stakerBalance = ethers.utils.parseEther("1000000")
    let address0 = "0x0000000000000000000000000000000000000000"
    let oneWeek = 86400 * 7
    let oneYear = 986400 * 365
    let defaultMinStaking = ethers.utils.parseEther("100")
    let defaultStakeAmount = ethers.utils.parseEther("10000")
    beforeEach(async () => {
        [admin, staker, staker2] = await ethers.getSigners();
        const Trend = await ethers.getContractFactory("Trend");
        trend = await Trend.deploy()
        await trend.deployed()
        const Staking = await ethers.getContractFactory("Staking");
        staking = await Staking.deploy(trend.address)
        await staking.deployed()
        const StakingReserve = await ethers.getContractFactory("StakingReserve");
        stakingreserve = await StakingReserve.deploy(trend.address,staking.address)
        await stakingreserve.deployed()
        await staking.setReserve(stakingreserve.address)
        await trend.transfer(staker.address, stakerBalance)
        await trend.transfer(stakingreserve.address, reserveBalance)
        await trend.connect(staker).approve(staking.address,defaultStakeAmount.mul(4))
    })
    describe("setReserve", function () {
        it ("should revert if reserveAddress is address 0", async function () {
            await expect(staking.setReserve(address0)).to.be.revertedWith("Staking: Invalid reserve address")
        });

        it ("should revert if sender isn't contract owner", async function () {
            await expect(staking.connect(staker).setReserve(staker2.address)).to.be.revertedWith("Ownable: caller is not the owner")
        });

        it ("should update correctly", async function () {
            await staking.setReserve(staker2.address)
            expect(await staking.reserve()).to.be.equal(staker2.address)
        });

    });

    describe("addStakePackage", function () {
        it ("should revert if minStaking_ = 0", async function () {
            await expect(staking.addStakePackage(defaultRate,defaultFeeDecimal,0,oneWeek)).to.be.revertedWith("Staking: Invalid  min stake amount");
        });

        it ("should revert if rate_ = 0", async function () {
            await expect(staking.addStakePackage(0,defaultFeeDecimal,1,oneWeek)).to.be.revertedWith("Staking: Invalid rate");
        });

        it ("should revert if lockTime_ = 0", async function () {
            await expect(staking.addStakePackage(defaultRate,defaultFeeDecimal,1,0)).to.be.revertedWith("Staking: Invalid lock time");
        });

        it ("should revert if sender is not owner", async function () {
            await expect(staking.connect(staker).addStakePackage(defaultRate,defaultFeeDecimal,1,0)).to.be.revertedWith("Ownable: caller is not the owner")
        });

        it ("should add package correctly", async function () {
            await staking.addStakePackage(defaultRate,defaultFeeDecimal,defaultMinStaking,oneWeek)
            const stakePackage = await staking.stakePackages(1)
            expect(stakePackage.rate).to.be.equal(defaultRate)
            expect(stakePackage.decimal).to.be.equal(defaultFeeDecimal)
            expect(stakePackage.minStaking).to.be.equal(defaultMinStaking)
            expect(stakePackage.lockTime).to.be.equal(oneWeek)
        });
    })
    describe("removeStakePackage", function () {
        it ("should revert if minStaking = 0", async function () {
            await expect(staking.removeStakePackage(1)).to.be.revertedWith("Staking: Stake package non-existence")
        });
    
        it ("should rever if stake package was offline", async function () {
            await staking.addStakePackage(defaultRate,defaultFeeDecimal,defaultMinStaking,oneWeek)
            await staking.removeStakePackage(1)
            await expect(staking.removeStakePackage(1)).to.be.revertedWith("Staking: Invalid stake package")
        });
    
        it ("should remove correctly", async function () {
            await staking.addStakePackage(defaultRate,defaultFeeDecimal,defaultMinStaking,oneWeek)
            await staking.removeStakePackage(1)
            const stakePackage = await staking.stakePackages(0)
            expect(stakePackage.rate).to.be.equal(0)
            expect(stakePackage.decimal).to.be.equal(0)
            expect(stakePackage.minStaking).to.be.equal(0)
            expect(stakePackage.lockTime).to.be.equal(0)
        });

    });

    describe("Stake", function () {
        beforeEach(async () => {
            await staking.addStakePackage(defaultRate,defaultFeeDecimal, defaultMinStaking, oneYear)
        })
        it ("should revert if amount < min staking", async function () {
            await expect(staking.stake(defaultMinStaking.sub(1),1)).to.be.revertedWith("Staking:  stake amount must greater than min stake")
        });
    
        it ("should revert if invalid package", async function () {
            await expect(staking.stake(defaultMinStaking,0)).to.be.revertedWith("Staking: Stake package non-existence")
        });
    
        it ("should  remove if package is offline", async function () {
            await staking.removeStakePackage(1)
            await expect(staking.stake(defaultMinStaking,1)).to.be.revertedWith("Staking: Package is offline")
        });

        it ("should add stake correctly to a new stake info", async function () {
            let stakeTx = await staking.connect(staker).stake(defaultStakeAmount,1)
            let stakeInfo = await staking.stakes(staker.address,1)
            const blockNum = await ethers.provider.getBlockNumber();
            const block = await ethers.provider.getBlock(blockNum);
            expect(stakeInfo.amount).to.be.equal(defaultStakeAmount)
            expect(stakeInfo.startTime).to.be.equal(block.timestamp)
            expect(stakeInfo.timePoint).to.be.equal(block.timestamp)
            expect(stakeInfo.totalProfit).to.be.equal(0)
            await expect(stakeTx).to.be.emit(staking, "StakeUpdate").withArgs(staker.address,1,defaultStakeAmount,0)

        });

        it ("should add stake correctly to a existing stake info", async function () {
            await staking.connect(staker).stake(defaultStakeAmount,1)
            const startblockNum = await ethers.provider.getBlockNumber();
            const startblock = await ethers.provider.getBlock(startblockNum);
            await network.provider.send("evm_increaseTime", [oneYear])
            let stakeTx = await staking.connect(staker).stake(defaultStakeAmount,1)
            let stakeInfo = await staking.stakes(staker.address,1)
            const blockNum = await ethers.provider.getBlockNumber();
            const block = await ethers.provider.getBlock(blockNum);
            expect(stakeInfo.amount).to.be.equal(defaultStakeAmount.add(defaultStakeAmount))
            expect(stakeInfo.startTime).to.be.equal(startblock.timestamp)
            expect(stakeInfo.timePoint).to.be.equal(block.timestamp)
            let profit = defaultStakeAmount.mul(oneYear).mul(defaultRate).div(10**defaultFeeDecimal)
            expect(stakeInfo.totalProfit).to.be.equal(profit)
            await expect(stakeTx).to.be.emit(staking, "StakeUpdate").withArgs(staker.address,1,defaultStakeAmount.add(defaultStakeAmount),profit)

        });

    });
    describe("unStake", function () {
        beforeEach(async () => {
            await staking.addStakePackage(defaultRate,defaultFeeDecimal, defaultMinStaking, oneYear)
            await staking.connect(staker).stake(defaultStakeAmount, 1)
        })
        it ("should revert if package not exist", async function () {
            await expect(staking.connect(staker).unStake(0)).to.be.revertedWith("Staking: Invalid stake")
        });
    
        it ("should rever if not reach lock time", async function () {
            await network.provider.send("evm_increaseTime", [oneYear - 1])
            await expect(staking.connect(staker).unStake(1)).to.be.revertedWith("Staking: Not reach lock time")
        });

            
        it ("should rever if not reach lock time 2", async function () {
            await network.provider.send("evm_increaseTime", [oneYear + 1])
            await staking.connect(staker).stake(defaultStakeAmount,1)
            await expect(staking.connect(staker).unStake(1)).to.be.revertedWith("Staking: Not reach lock time")
        });
    
        it ("should  unstake correctly", async function () {
            await network.provider.send("evm_increaseTime", [oneYear])
            let unstakeTx = await staking.connect(staker).unStake(1)
            let profit = defaultStakeAmount.mul(oneYear).mul(defaultRate).div(10**defaultFeeDecimal)
            await expect(unstakeTx).to.emit(staking , "StakeReleased").withArgs(staker.address,1,defaultStakeAmount,profit);
            expect(await trend.balanceOf(staker.address)).to.be.equal(stakerBalance.add(profit))
            expect(await trend.balanceOf(stakingreserve.address)).to.be.equal(reserveBalance.sub(profit))
        });

        it ("should  unstake correctly after multiple time staking", async function () {
            await network.provider.send("evm_increaseTime", [oneYear])
            await staking.connect(staker).stake(defaultStakeAmount,1)
            await network.provider.send("evm_increaseTime", [oneWeek])
            await staking.connect(staker).stake(defaultStakeAmount,1)
            await network.provider.send("evm_increaseTime", [oneYear])
            await staking.connect(staker).stake(defaultStakeAmount,1)
            await network.provider.send("evm_increaseTime", [oneYear])
            let unstakeTx = await staking.connect(staker).unStake(1)
            let profit = defaultStakeAmount.mul(oneYear).mul(defaultRate).div(10**defaultFeeDecimal)
                .add(defaultStakeAmount.mul(2).mul(oneWeek).mul(defaultRate).div(10**defaultFeeDecimal))
                .add(defaultStakeAmount.mul(3).mul(oneYear).mul(defaultRate).div(10**defaultFeeDecimal))
                .add(defaultStakeAmount.mul(4).mul(oneYear).mul(defaultRate).div(10**defaultFeeDecimal))
            await expect(unstakeTx).to.emit(staking , "StakeReleased").withArgs(staker.address,1,defaultStakeAmount.mul(4),profit);
            expect(await trend.balanceOf(staker.address)).to.be.equal(stakerBalance.add(profit))
            expect(await trend.balanceOf(stakingreserve.address)).to.be.equal(reserveBalance.sub(profit))
        });



    });

})