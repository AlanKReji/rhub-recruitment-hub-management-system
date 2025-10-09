import { roleService } from '../services/roleService.mjs';
import logger from '../config/logger.mjs';

// @desc    Get all roles
// @route   GET /api/master/roles
// @access  Private/HRBP
const getRoles = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const search = req.query.search?.trim() ?? '';

    const { roles, total } = await roleService.getAllRoles(page, limit, search);

    res.status(200).json({
      status: 'success',
      pagination: {
        total,
        limit,
        page,
        totalPages: Math.ceil(total / limit),
      },
      data: {
        roles,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get a specific role
// @route   GET /api/master/roles/:id
// @access  Private/HRBP
const getRole = async (req, res, next) => {
  try {
    const { id } = req.params;
    const role = await roleService.getRoleById(id);
    res.status(200).json({
      status: 'success',
      data: {
        role,
      },
    });
  } catch (error) {
      next(error);
  }
};

// @desc    Add a new role
// @route   POST /api/master/departments
// @access  Private/HRBP
const addRole = async (req, res, next) => {
  try {
    const { Role } = req.body;
    const CreatedBy = req.user.RHubUserId;
    const newRole = await roleService.createRole({ Role, CreatedBy });
    logger.info(`Role created by ${CreatedBy}: ${newRole.Role}`);
    res.status(201).json({
      status: 'success',
      message: "Role added successfully",
      data: {
        role: newRole,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a role
// @route   PUT /api/master/roles/:id
// @access  Private/HRBP
const updateRole = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { Role } = req.body;
    const ModifiedBy = req.user.RHubUserId;

    const updatedRole = await roleService.editRole(id, {
      Role,
      ModifiedBy,
    });
    logger.info(`Role ID ${id} updated by ${ModifiedBy}`);
    res.status(200).json({
      status: 'success',
      message: "Role updated successfully",
      data: {
        role: updatedRole,
      },
    });
  } catch (error) {
   next(error);
  }
};

// @desc    Delete a role
// @route   DELETE /api/master/roles/:id
// @access  Private/HRBP
const deleteRole = async (req, res, next) => {
  try {
    const { id } = req.params;
    const DeletedBy = req.user.RHubUserId;
    await roleService.removeRole(id, DeletedBy);
    logger.info(`Role ID ${id} deleted by ${DeletedBy}`);
    res.status(200).json({
      status: 'success',
      message: "Role deleted successfully"
    });
  } catch (error) {
    next(error);
  }
};

export const roleController = {
    getRoles,
    getRole,
    addRole,
    updateRole,
    deleteRole,
}