import Department from '../models/departmentModel.mjs';
import PeopleRequisition from '../models/peopleRequisitionModel.mjs';
import User from '../models/userModel.mjs';

const findAllDepartments = async (page, limit, search) => {
  const skip = (page - 1) * limit;
  const query = { IsDelete: false };
  if (search) {
    query.Department = { $regex: search, $options: 'i' }; 
  }
  const total = await Department.countDocuments(query);
  const departments = await Department.find(query).limit(limit).skip(skip);
  return { departments, total };
};

const findDepartmentByName = async (name) => {
  return await Department.findOne({ Department: { $regex: `^${name}$`, $options: 'i' } });
};

const findAllDepartmentByName = async(name) => {
  return await Department.find({Department: { $regex: `^${name}$`, $options: 'i'}})
}

const findDepartmentById = async (id) => {
  return await Department.findById(id);
};

const findActivePRByDepartment = async (id) => {
  return await PeopleRequisition.findOne({DepartmentId : id, IsDelete : false});
};

const findActiveUserByDepartment = async (id) => {
  return await User.findOne({DepartmentId : id, IsDelete : false});
};

const createNewDepartment = async (departmentData) => {
  return await Department.create(departmentData);
};

const saveDepartment = async (department) => {
  return await department.save();
};

export const departmentQueries = {
    findAllDepartments,
    findAllDepartmentByName,
    findDepartmentByName,
    findDepartmentById,
    findActivePRByDepartment,
    findActiveUserByDepartment,
    createNewDepartment,
    saveDepartment,
};
