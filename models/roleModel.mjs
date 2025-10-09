
import mongoose from 'mongoose';
const roleSchema = new mongoose.Schema({
  Role: {
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

const Role = mongoose.model('Role', roleSchema);

export default Role;