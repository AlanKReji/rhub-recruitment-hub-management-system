import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const userSchema = new mongoose.Schema({
  RHubUserId: {
    type: String,
    unique: true,
    validate: {
      validator: function(v) {
        return typeof v === 'string' && v.length > 0;
      },
      message: props => `${props.value} is not a valid RHubUserId! It cannot be empty.`
    },
  },
  Name: {
    type: String,
    required: true,
  },
  Email: {
    type: String,
    required: true,
  },
  Password: {
    type: String,
    required: true,
  },
  RoleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Role',
  },
  DepartmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
  },
  JobPositionId:{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'JobPosition',
  },
  IsActive: {
    type: Boolean,
    default: true,
  },
  IsDelete: {
    type: Boolean,
    default: false,
  },
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  CreatedBy: { type: String },
  CreatedOn: { type: Date, default: Date.now },
  ModifiedBy: { type: String },
  ModifiedOn: { type: Date },
  DeletedBy: { type: String },
  DeletedOn: { type: Date },
});

// Pre-save hook to hash the password before saving
userSchema.pre('save', async function (next) {
  console.log('Document being saved:', this); 
  
  if (!this.isModified('Password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.Password = await bcrypt.hash(this.Password, salt);
  next();
});
const User = mongoose.model('RHubUser', userSchema);
export default User;