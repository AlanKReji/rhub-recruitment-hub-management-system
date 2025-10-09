import logger from "../config/logger.mjs";
import { natureOfEmploymentService } from "../services/natureOfEmploymentService.mjs";
// @desc    Get all nature of employments
// @route   GET /api/master/nature-ofemployments
// @access  Private/HRBP
const getNatureOfEmployments = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const search = req.query.search?.trim() ?? "";

    const { natureOfEmployments, total } = await natureOfEmploymentService.getAllNatureOfEmployments(
      page,
      limit,
      search
    );

    res.status(200).json({
      status: "success",
      pagination: {
        total,
        limit,
        page,
        totalPages: Math.ceil(total / limit),
      },
      data: {
        natureOfEmployments,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get a specific nature of employment
// @route   GET /api/master/nature-ofemployments/:id
// @access  Private/HRBP
const getNatureOfEmployment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const natureOfEmployment = await natureOfEmploymentService.getNatureOfEmploymentById(id);
    res.status(200).json({
      status: "success",
      data: {
        natureOfEmployment,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add a new nature of employment
// @route   POST /api/master/nature-ofemployments
// @access  Private/HRBP
const addNatureOfEmployment = async (req, res, next) => {
  try {
    const { NatureOfEmployment } = req.body;
    const CreatedBy = req.user.RHubUserId;
    const newNatureOfEmployment = await natureOfEmploymentService.createNatureOfEmployment({
      NatureOfEmployment,
      CreatedBy,
    });
    logger.info(
      `Nature of Employment created by ${CreatedBy}: ${newNatureOfEmployment.NatureOfEmployment}`
    );
    res.status(201).json({
      status: "success",
      message: "Nature of Employment added successfully",
      data: {
        natureOfEmployment: newNatureOfEmployment,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a department
// @route   PUT /api/master/nature-ofemployments/:id
// @access  Private/HRBP
const updateNatureOfEmployment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { NatureOfEmployment } = req.body;
    const ModifiedBy = req.user.RHubUserId;

    const updatedNatureOfEmployment = await natureOfEmploymentService.editNatureOfEmployment(id, {
      NatureOfEmployment,
      ModifiedBy,
    });
    logger.info(`Nature of Employment ID ${id} updated by ${ModifiedBy}`);
    res.status(200).json({
      status: "success",
      message: "Nature of Employment updated successfully",
      data: {
        natureOfEmployment: updatedNatureOfEmployment,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a nature of employment
// @route   DELETE /api/master/nature-ofemployments/:id
// @access  Private/HRBP
const deleteNatureOfEmployment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const DeletedBy = req.user.RHubUserId;
    await natureOfEmploymentService.removeNatureOfEmployment(id, DeletedBy);
    logger.info(`Nature of Employment ID ${id} deleted by ${DeletedBy}`);
    res.status(200).json({
      status: "success",
      message: "Nature of Employment deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const natureOfEmploymentController = {
    getNatureOfEmployments,
    getNatureOfEmployment,
    addNatureOfEmployment,
    updateNatureOfEmployment,
    deleteNatureOfEmployment,
}