import User from '../models/userModel.mjs';
import '../models/roleModel.mjs';
import Role from '../models/roleModel.mjs';
import Department from '../models/departmentModel.mjs';
import PeopleRequisition from '../models/peopleRequisitionModel.mjs';
/**
 * @description Finds a user by their email address and populates their role
 * @param {string} email - The email of the user to find.
 * @returns {Promise<Document|null>} The Mongoose document for the user or null if not found.
 */
const findByEmail = async (email) => {
  return User.findOne({ Email: email}).populate('RoleId', 'Role');
};

/**
 * @description Finds a user by their password reset token, ensuring it has not expired
 * @param {string} token - The password reset token
 * @returns {Promise<Document|null>} The user document or null
 */
const findByResetToken = async (token) => {
  return User.findOne({
    resetPasswordToken: token,
    resetPasswordExpires: { $gt: Date.now() },
  });
};

/**
 * @description A generic function to save any changes to a user document
 * @param {Document} user - The Mongoose user document to save
 * @returns {Promise<Document>} The saved user document
 */
const save = async (user) => {
  return user.save();
};

/**
 * @description Finds a user by their MongoDB document ID
 * @param {string} id - The _id of the user
 * @returns {Promise<Document|null>} The user document or null
 */

const findAllUsers = async (page, limit, search, role, department, loggedInUser) => {
    const skip = (page - 1) * limit;
    let query = {
        $and: [
            { IsDelete: false }
        ]
    };
    if (search) {
        query.$and.push({
            $or: [
                { Name: { $regex: search, $options: 'i' } },
                { Email: { $regex: search, $options: 'i' } },
            ]
        });
    }
    if (loggedInUser.RoleId.Role === 'HRBP') {
        if (role) {
            const roleDoc = await Role.findOne({ Role: { $regex: `^${role}$`, $options: 'i' } });
            if (roleDoc) {
                query.$and.push({ RoleId: roleDoc._id });
            } else {
                return { users: [], total: 0 };
            }
        }
    } 
    else if (loggedInUser.RoleId.Role === 'Recruiter') {
        const rolesToView = await Role.find({ Role: { $in: ['HRBP', 'Interview Panel'] } });
        const roleIdsToView = rolesToView.map(r => r._id);
        query.$and.push({
            $or: [
                { RoleId: { $in: roleIdsToView } },
                { _id: loggedInUser._id }
            ]
        });
        if (department) {
            const departmentDoc = await Department.findOne({ Department: { $regex: `^${department}$`, $options: 'i' } });
            if (departmentDoc) {
                query.$and.push({ DepartmentId: departmentDoc._id });
            } else {
                return { users: [], total: 0 };
            }
        }
    }

    const total = await User.countDocuments(query);
    const users = await User.find(query)
        .populate('RoleId', 'Role')
        .populate('DepartmentId', 'Department')
        .select('-Password')
        .limit(limit)
        .skip(skip);

    return { users, total };
};

const findUserById = async (id) => {
    return await User.findById(id)
        .populate('RoleId', 'Role')
        .populate('DepartmentId', 'Department')
        .select('-Password');
};

const findById = async (id) => {
    return User.findById(id).populate('RoleId', 'Role');;
};

const findUserByEmail = async (email) => {
    return User.findOne({ Email: email, IsDelete: false }).populate('RoleId', 'Role');
};

const createNewUser = async (userData) => {
    return await User.create(userData);
};

const findActivePRByUser = async (id) => {
    return await PeopleRequisition.findOne({
        $or: [
            { RecruiterId: id },
            { HRBPId: id }
        ],
        IsDelete: false,
        Status: { $ne: 'completed' }
    });
};

export const userQueries = {
  findAllUsers,
  findUserById,
  findUserByEmail,
  findActivePRByUser,
  createNewUser,
  findByEmail,
  findByResetToken,
  save,
  findUserById,
  findById,
};