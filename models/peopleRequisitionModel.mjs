import mongoose from 'mongoose';
const peopleRequisitionSchema = new mongoose.Schema({
  JobCode: {
    type: String,
    required: true,
    unique: true,
  },
  JobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'JobPosition',
    required: true,
  },
  DepartmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    required: true,
  },
  RecruiterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'RHubUser',
    required: true,
  },
  HRBPId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'RHubUser',
    required: true,
  },
  NatureOfEmploymentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'NatureOfEmployment',
    required: true,
  },
  JobDescription: {
    type: String,
  },
  Status: {
    type: String,
    enum: ['open', 'inprogress', 'onhold', 'completed', 'closed'],
    default: 'open',
  },
  PRFNumber: {
    type: String,
  },
  PRFLink: {
    type: String,
  },
  ClosingDate: {
    type: Date,
  },
  IsApprovedByHRBP: {
    type: Boolean,
    default: false,
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
  JdFileName: {
        type: String,
    },
    JdFilePath: {
        type: String,
    },
    JdUploadedOn: {
        type: Date,
  },
});
const PeopleRequisition = mongoose.model('PeopleRequisition', peopleRequisitionSchema);
export default PeopleRequisition;