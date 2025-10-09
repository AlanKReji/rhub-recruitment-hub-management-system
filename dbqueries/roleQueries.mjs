import Role from '../models/roleModel.mjs';
import User from '../models/userModel.mjs';

const findAllRoles = async (page, limit, search) => {
  const skip = (page - 1) * limit;
  const query = { IsDelete: false };
  if (search) {
    query.Role = { $regex: search, $options: 'i' }; 
  }
  const total = await Role.countDocuments(query);
  const roles = await Role.find(query).limit(limit).skip(skip);
  return { roles, total };
};

const findRoleByName = async (name) => {
  return await Role.findOne({ Role: { $regex: `^${name}$`, $options: 'i' } });
};

const findAllRoleByName = async(name) => {
  return await Role.find({Role: { $regex: `^${name}$`, $options: 'i'}})
}

const findRoleById = async (id) => {
  return await Role.findById(id);
};

const findActiveUserByRole = async (id) => {
  return await User.findOne({RoleId : id, IsDelete : false});
};
const createNewRole = async (roleData) => {
  return await Role.create(roleData);
};

const saveRole = async (role) => {
  return await role.save();
};

export const roleQueries = {
    findAllRoles,
    findAllRoleByName,
    findRoleByName,
    findRoleById,
    findActiveUserByRole,
    createNewRole,
    saveRole,
};