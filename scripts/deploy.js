import hre from "hardhat";

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);

  const SubsidyLog = await hre.ethers.getContractFactory("SubsidyLog");
  const subsidyLog = await SubsidyLog.deploy();
  await subsidyLog.deployed();

  console.log("SubsidyLog deployed to:", subsidyLog.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
