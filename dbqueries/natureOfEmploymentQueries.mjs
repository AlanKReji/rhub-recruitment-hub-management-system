import NatureOfEmployment from "../models/natureOfEmploymentModel.mjs";
import PeopleRequisition from "../models/peopleRequisitionModel.mjs";

const findAllNatureOfEmployments = async (page, limit, search) => {
  const skip = (page - 1) * limit;
  const query = { IsDelete: false };
  if (search) {
    query.NatureOfEmployment = { $regex: search, $options: "i" };
  }
  const total = await NatureOfEmployment.countDocuments(query);
  const natureOfEmployments = await NatureOfEmployment.find(query)
    .limit(limit)
    .skip(skip);
  return { natureOfEmployments, total };
};

const findNatureOfEmploymentByName = async (name) => {
  return await NatureOfEmployment.findOne({
    NatureOfEmployment: { $regex: `^${name}$`, $options: 'i' }
  });
};

const findAllNatureOfEmploymentByName = async(name) => {
  return await NatureOfEmployment.find({NatureOfEmployment: { $regex: `^${name}$`, $options: 'i'}})
}

const findNatureOfEmploymentById = async (id) => {
  return await NatureOfEmployment.findById(id);
};

const findActivePRByNatureOfEmployment = async (id) => {
  return await PeopleRequisition.findOne({ NatureOfEmploymentId: id , IsDelete: false});
};

const createNewNatureOfEmployment = async (natureOfEmploymentData) => {
  return NatureOfEmployment.create(natureOfEmploymentData);
};

const saveNatureOfEmployment = async (natureOfEmployment) => {
  return await natureOfEmployment.save();
};

export const natureOfEmploymentQueries = {
    findAllNatureOfEmployments,
    findNatureOfEmploymentByName,
    findAllNatureOfEmploymentByName,
    findNatureOfEmploymentById,
    findActivePRByNatureOfEmployment,
    createNewNatureOfEmployment,
    saveNatureOfEmployment,
};
