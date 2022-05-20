// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const { ethers } = require("hardhat");
const hre = require("hardhat");

async function main() {
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled
  // await hre.run('compile');

  // We get the contract to deploy
  let trendivision
  let trend
  let tokenSale
  let reserve
  let marketplace
  let defaultFeeRate = 0
  let defaultFeeDecimal = 0
  const Trendivision = await ethers.getContractFactory("Trendivision");
  trendivision = await Trendivision.deploy()
  await trendivision.deployed()
  console.log("Trendivision deployed to:", trendivision.address)

  const Trend = await ethers.getContractFactory("Trend");
  trend = await Trend.deploy()
  await trend.deployed()
  console.log("Trend deployed to:", trend.address)

  const TokenSale = await ethers.getContractFactory("TokenSale")
  tokenSale = await TokenSale.deploy(trend.address)
  await tokenSale.deployed()
  const transferTx = await trend.transfer(tokenSale.address, ethers.utils.parseUnits("1000000", "ether"))
  await transferTx.wait()
  console.log("TokenSale deployed to:", tokenSale.address);

  const Reserve = await ethers.getContractFactory("Reserve")
  reserve = await Reserve.deploy(trend.address)
  await reserve.deployed()
  console.log("Reserve deployed to:", reserve.address);

  const Marketplace = await ethers.getContractFactory("Marketplace")
  marketplace = await Marketplace.deploy(trendivision.address,defaultFeeDecimal, defaultFeeRate, reserve.address)
  await marketplace.deployed()
  console.log("Marketplace deployed to:", marketplace.address);

  const addPaymentTx = await marketplace.addPaymentToken(trend.address)
  await addPaymentTx.wait()
  console.log("Trend is payment token? true or false", await marketplace.isPaymentTokenSupported(trend.address));
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
