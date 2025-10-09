import JobPosition from '../models/jobPositionModel.mjs';
import PeopleRequisition from '../models/peopleRequisitionModel.mjs';
import User from '../models/userModel.mjs';

const findAllJobPositions = async(page, limit, search) => {
    const skip = (page - 1) * limit;
    const query = {IsDelete: false};
    if(search){
      query.JobPosition = { $regex: search, $options: 'i'};
    }
    const total = await(JobPosition.countDocuments(query));
    const jobPositions = await JobPosition.find(query).limit(limit).skip(skip)
    return { jobPositions, total}
}

const findJobPositionByName = async (name) => {
  return await JobPosition.findOne({ JobPosition: { $regex: `^${name}$`, $options: 'i' } });
};

const findAllJobPositionByName = async(name) => {
  return await JobPosition.find({ JobPosition: { $regex: `^${name}$`, $options: 'i'}})
}

const findJobPositionById = async (id) => {
  return await JobPosition.findById(id);
};

const findActivePRByJobPosition = async(id) => {
  return await PeopleRequisition.findOne({JobId: id, IsDelete: false});
}

const findActiveUserByJobPosition = async(id) => {
  return await User.findOne({JobPositionId: id, IsDelete: false});
}

const createNewJobPosition = async(jobPositionData) =>{
  return await JobPosition.create(jobPositionData);
}

const saveJobPosition = async(jobPosition) =>{
  return await jobPosition.save();
}

export const jobPositionQueries = {
    findAllJobPositions,
    findJobPositionByName,
    findAllJobPositionByName,
    findJobPositionById,
    findActivePRByJobPosition,
    findActiveUserByJobPosition,
    createNewJobPosition,
    saveJobPosition,
};
