import mongoose from 'mongoose';
const natureOfEmploymentSchema = new mongoose.Schema({
  NatureOfEmployment: {
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
const NatureOfEmployment = mongoose.model('NatureOfEmployment', natureOfEmploymentSchema);

export default NatureOfEmployment;