const { expect } = require("chai");
const { ethers } = require("hardhat");

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
        await stakingreserve.setReserve(stakingreserve.address)
        await trend.transfer(staker.address, stakerBalance)
        await trend.transfer(reserve.address, reserveBalane)
        await trend.connect(staker).approve(staking.address,defaultStakeAmount.mul(4))
    })
    describe("setReserve", function () {
        it ("should revert if reserveAddress is address 0", async function () {

        });

        it ("should revert if sender isn't contract owner", async function () {

        });

        it ("should update correctly", async function () {

        });

    });

    describe("addStakePackage", function () {
        it ("should revert if minStaking_ = 0", async function () {

        });

        it ("should revert if rate_ = 0", async function () {

        });

        it ("should revert if lockTime_ = 0", async function () {

        });

        it ("should revert if sender is not owner", async function () {

        });

        it ("should add package correctly", async function () {

        });
    })
    describe("removeStakePackage", function () {
        it ("should revert if minStaking = 0", async function () {
    
        });
    
        it ("should rever if stake package was offline", async function () {
    
        });
    
        it ("should remove correctly", async function () {
    
        });

    });

    describe("Stake", function () {
        beforeEach(async () => {
            await staking.addStakePackage(defautRate,defaultDecimal, defaultMinStaking, oneYear)
        })
        it ("should revert if amount < min staking", async function () {
    
        });
    
        it ("should rever if invalid package", async function () {
    
        });
    
        it ("should  remove if package is offline", async function () {
    
        });

        it ("should add stake correctly to a new stake info", async function () {
    
        });

        it ("should add stake correctly to a existing stake info", async function () {
    
        });

    });
    describe("unStake", function () {
        beforeEach(async () => {
            await staking.addStakePackage(defautRate,defaultDecimal, defaultMinStaking, oneYear)
            await staking.connect(staker).stake(defaultStakeAmount, 1)
        })
        it ("should revert if package not exist", async function () {
    
        });
    
        it ("should rever if not reach lock time", async function () {
    
        });

            
        it ("should rever if not reach lock time 2", async function () {
    
        });
    
        it ("should  unstake correctly", async function () {
    
        });

        it ("should  unstake correctly", async function () {
    
        });



    });

})