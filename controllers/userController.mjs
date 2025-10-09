import { userService } from '../services/userService.mjs';
import logger from '../config/logger.mjs';
const changePassword = async (req, res, next) => {
    try {
        const { currentPassword, newPassword, confirmPassword } = req.body;
        const userId = req.user.id;
        if (newPassword !== confirmPassword) {
            logger.warn(`Password change failed for user ${userId}: New passwords do not match.`);
            return res.status(400).json({ message: 'New passwords do not match.' });
        }
        await userService.changePassword(userId, currentPassword, newPassword);
        logger.info(`User ${userId} changed their password successfully.`);
        res.status(200).json({ message: 'Password changed successfully.' });
    } catch (error) {
        next(error);
    }
};

// @desc    Get all users
// @route   GET /api/users
// @access  Public
const getUsers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const search = req.query.search?.trim() ?? '';
    const role = req.query.role?.trim() ?? '';
    const department = req.query.department?.trim() ?? '';
    const loggedInUser = req.user;

    const { users, total } = await userService.getAllUsers(page, limit, search, role, department, loggedInUser);

    res.status(200).json({
      status: 'success',
      pagination: {
        total,
        limit,
        page,
        totalPages: Math.ceil(total / limit),
      },
      data: {
        users,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users
// @route   GET /api/users/:id
// @access  Public
const getUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const loggedInUser = req.user;
    const user = await userService.getUserById(id, loggedInUser);
    res.status(200).json({
      status: 'success',
      data: {
        user,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add a new user
// @route   POST /api/users
// @access  Private/HRBP
const addUser = async (req, res, next) => {
  try {
    const userData = { ...req.body, CreatedBy: req.user.RHubUserId };
    const newUser = await userService.createUser(userData);
    logger.info(`User created by ${req.user.RHubUserId}: ${newUser.Email}`);
    res.status(201).json({
      status: 'success',
      message: "User added successfully. A welcome email has been sent.",
      data: {
        user: newUser,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a user
// @route   PUT /api/users/:id
// @access  Private/HRBP
const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body, ModifiedBy: req.user.RHubUserId };
    const updatedUser = await userService.editUser(id, updateData);
    logger.info(`User ID ${id} updated by ${req.user.RHubUserId}`);
    res.status(200).json({
      status: 'success',
      message: "User updated successfully",
      data: {
        user: updatedUser,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a user
// @route   DELETE /api/users/:id
// @access  Private/HRBP
const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const DeletedBy = req.user.RHubUserId;
    await userService.removeUser(id, DeletedBy);
    logger.info(`User ID ${id} deleted by ${DeletedBy}`);
    res.status(200).json({
      status: 'success',
      message: "User deleted successfully"
    });
  } catch (error) {
    next(error);
  }
};

export const userController = {
    getUsers,
    getUser,
    addUser,
    updateUser,
    deleteUser,
    changePassword
}