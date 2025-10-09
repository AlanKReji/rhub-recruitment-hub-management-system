import mongoose from 'mongoose';
const jobPositionSchema = new mongoose.Schema({
  JobPosition: {
    type: String,
    required: true,
  },
  IsActive: {
    type: Boolean,
    default: true,
  },
  IsDelete: {
    type: Boolean,
    default: false,
  },
  CreatedBy: { type: String },
  CreatedOn: { type: Date, default: Date.now },
  ModifiedBy: { type: String },
  ModifiedOn: { type: Date },
  DeletedBy: { type: String },
  DeletedOn: { type: Date },
});
const JobPosition = mongoose.model('JobPosition', jobPositionSchema);

export default JobPosition;