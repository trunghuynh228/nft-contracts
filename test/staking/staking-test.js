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
    describe("common", function () {})