// src/modules/producers/services/blockchain.service.js
// Simple stubs that return fake tx hashes. Replace these with real web3/ethers calls.

const { v4: uuidv4 } = require("uuid");

async function registerProjectOnChain(project) {
  // Example: send tx to register project
  console.log("[blockchain] registering project on-chain:", project._id.toString());
  return { success: true, txHash: `0xREG-${uuidv4()}` };
}

async function submitMilestoneOnChain(projectId, payoutIndex, evidenceHash) {
  console.log(`[blockchain] submitMilestone project=${projectId} index=${payoutIndex} evidenceHash=${evidenceHash}`);
  return { success: true, txHash: `0xSUB-${uuidv4()}` };
}

// You can also add verifyMilestoneOnChain, releasePayoutOnChain etc.
module.exports = { registerProjectOnChain, submitMilestoneOnChain };
