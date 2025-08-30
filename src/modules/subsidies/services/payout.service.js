import Project from '../models/project.model.js';
import SubsidyProgram from '../models/subsidyProgram.model.js';
import { customAlphabet } from 'nanoid';
import { signObject } from '../../utils/signature.js';
const keyGen = customAlphabet('1234567890abcdef', 12);

export async function markEligible(project){
  const program = await SubsidyProgram.findById(project.programId);
  const key = keyGen();
  const payout = { idempotencyKey: key, amount: program.payoutAmount, currency: program.payoutCurrency, date: new Date(), status: program.approvalMode === 'AUTO' ? 'PENDING' : 'ELIGIBLE', evidence: { metricsAtEvaluation: project.metrics } };
  project.payouts.push(payout);
  await project.save();
  return project.payouts[project.payouts.length-1];
}

export async function processPayout(projectId, payoutId){
  const project = await Project.findById(projectId);
  if(!project) throw new Error('project not found');
  const payout = project.payouts.id(payoutId);
  if(!payout) throw new Error('payout not found');
  if(payout.status === 'RELEASED') return payout;
  payout.status = 'PENDING';
  await project.save();

  // simulate bank transfer (mock)
  const bankRef = 'MOCK-'+Date.now();

  const receipt = { projectId: project._id.toString(), payoutId: payout._id.toString(), amount: payout.amount, currency: payout.currency, date: new Date(), metrics: project.metrics };
  const signature = signObject(receipt);

  payout.status = 'RELEASED';
  payout.bankRef = bankRef;
  payout.receiptHash = signature;
  await project.save();

  return payout;
}
