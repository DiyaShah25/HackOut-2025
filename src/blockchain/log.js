// ...existing code...
const { ethers } = require("ethers");
const fs = require("fs");
const path = require("path");

const RPC = process.env.RPC_URL;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
// prefer legacy location but fallback to Hardhat artifact
const LEGACY_ABI_PATH = path.join(process.cwd(), "contracts", "SubsidyLogABI.json");
const ARTIFACT_PATH = path.join(
  process.cwd(),
  "artifacts",
  "contracts",
  "SubsidyLog.sol",
  "SubsidyLog.json"
);

let provider, wallet, contract;

function initBlockchain() {
  if (!RPC || !PRIVATE_KEY || !CONTRACT_ADDRESS) {
    console.warn(
      "Blockchain settings not fully provided; skipping on-chain logging."
    );
    return;
  }

  try {
    provider = new ethers.JsonRpcProvider(RPC);
    wallet = new ethers.Wallet(PRIVATE_KEY, provider);

    let abi;
    if (fs.existsSync(LEGACY_ABI_PATH)) {
      const raw = fs.readFileSync(LEGACY_ABI_PATH, "utf8");
      abi = JSON.parse(raw);
      console.log("Loaded ABI from contracts/SubsidyLogABI.json");
    } else if (fs.existsSync(ARTIFACT_PATH)) {
      const artifact = JSON.parse(fs.readFileSync(ARTIFACT_PATH, "utf8"));
      abi = artifact.abi;
      console.log("Loaded ABI from Hardhat artifact:", ARTIFACT_PATH);
    } else {
      throw new Error(
        `ABI not found. Looked at:\n - ${LEGACY_ABI_PATH}\n - ${ARTIFACT_PATH}`
      );
    }

    contract = new ethers.Contract(CONTRACT_ADDRESS, abi, wallet);
    console.log("Blockchain logging initialized.");
  } catch (err) {
    console.error("Failed to initialize blockchain logging:", err.message);
    contract = null;
  }
}

// ...existing code...
async function logOnChain(action, dataHash) {
  if (!contract) {
    console.warn("Contract not initialized. Skipping on-chain log.");
    return null;
  }

  try {
    const tx = await contract.addEntry(action, dataHash);
    const receipt = await tx.wait();
    console.log(`On-chain log success: ${receipt.transactionHash}`);
    return receipt.transactionHash;
  } catch (err) {
    console.error("Failed to log on-chain:", err.message);
    return null;
  }
}

module.exports = { initBlockchain, logOnChain };
// ...existing code...