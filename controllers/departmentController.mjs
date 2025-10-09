import { departmentService } from '../services/departmentService.mjs';
import logger from '../config/logger.mjs';

// @desc    Get all departments
// @route   GET /api/master/departments
// @access  Private/HRBP
const getDepartments = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const search = req.query.search?.trim() ?? '';

    const { departments, total } = await departmentService.getAllDepartments(page, limit, search);

    res.status(200).json({
      status: 'success',
      pagination: {
        total,
        limit,
        page,
        totalPages: Math.ceil(total / limit),
      },
      data: {
        departments,
      },
    });
  } catch (error) {
        next(error);
  }
};

// @desc    Get a specific department
// @route   GET /api/master/departments/:id
// @access  Private/HRBP
const getDepartment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const department = await departmentService.getDepartmentById(id);
    res.status(200).json({
      status: 'success',
      data: {
        department,
      },
    });
  } catch (error) {
      next(error);
  }
};

// @desc    Add a new department
// @route   POST /api/master/departments
// @access  Private/HRBP
const addDepartment = async (req, res, next) => {
  try {
    const { Department } = req.body;
    const CreatedBy = req.user.RHubUserId;
    const newDepartment = await departmentService.createDepartment({ Department, CreatedBy });
    logger.info(`Department created by ${CreatedBy}: ${newDepartment.Department}`);
    res.status(201).json({
      status: 'success',
      message: "Department added successfully",
      data: {
        department: newDepartment,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a department
// @route   PUT /api/master/departments/:id
// @access  Private/HRBP
const updateDepartment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { Department } = req.body;
    const ModifiedBy = req.user.RHubUserId;

    const updatedDepartment = await departmentService.editDepartment(id, {
      Department,
      ModifiedBy,
    });
    logger.info(`Department ID ${id} updated by ${ModifiedBy}`);
    res.status(200).json({
      status: 'success',
      message: "Department updated successfully",
      data: {
        department: updatedDepartment,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a department
// @route   DELETE /api/master/departments/:id
// @access  Private/HRBP
const deleteDepartment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const DeletedBy = req.user.RHubUserId;
    await departmentService.removeDepartment(id, DeletedBy);
    logger.info(`Department ID ${id} deleted by ${DeletedBy}`);
    res.status(200).json({
      status: 'success',
      message: "Department deleted successfully"
    });
  } catch (error) {
    next(error);
  }
};

export const departmentController = {
    getDepartments,
    getDepartment,
    addDepartment,
    updateDepartment,
    deleteDepartment,
}