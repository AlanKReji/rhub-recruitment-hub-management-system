import mongoose from 'mongoose';
const departmentSchema = new mongoose.Schema({
  Department: {
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
  CreatedBy: {
    type: String,
  },
  CreatedOn: {
    type: Date,
    default: Date.now,
  },
  ModifiedBy: {
    type: String,
  },
  ModifiedOn: {
    type: Date,
  },
  DeletedBy: {
    type: String,
  },
  DeletedOn: {
    type: Date,
  },
});

const Department = mongoose.model('Department', departmentSchema);

export default Department;