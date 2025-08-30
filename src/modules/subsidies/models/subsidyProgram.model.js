import mongoose from 'mongoose';
const RuleSchema = new mongoose.Schema({ id: String, fieldPath: String, operator: String, value: mongoose.Schema.Types.Mixed, weight: Number }, { _id: false });
const SubsidyProgramSchema = new mongoose.Schema({
  name: String, description: String, authorityId: mongoose.Types.ObjectId,
  rules: [RuleSchema], payoutAmount: Number, payoutCurrency: { type:String, default:'INR' },
  maxPayouts: { type:Number, default:1 }, approvalMode: { type:String, enum:['AUTO','MANUAL'], default:'AUTO' }, status: { type:String, enum:['ACTIVE','PAUSED'], default:'ACTIVE' }
}, { timestamps:true });
export default mongoose.model('SubsidyProgram', SubsidyProgramSchema);
