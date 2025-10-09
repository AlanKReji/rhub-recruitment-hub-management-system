import { jobPositionService } from '../services/jobPositionService.mjs';
import logger from '../config/logger.mjs';

// @desc    Get all job positions
// @route   GET /api/master/job-positions
// @access  Private/HRBP
const getJobPositions = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const search = req.query.search?.trim() ?? '';

    const { jobPositions, total } = await jobPositionService.getAllJobPositions(page, limit, search);

    res.status(200).json({
      status: 'success',
      pagination: {
        total,
        limit,
        page,
        totalPages: Math.ceil(total / limit),
      },
      data: {
        jobPositions,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get a specific job position
// @route   GET /api/master/job-positions/:id
// @access  Private/HRBP
const getJobPosition = async (req, res, next) => {
  try {
    const { id } = req.params;
    const jobPosition = await jobPositionService.getJobPositionById(id);
    res.status(200).json({
      status: 'success',
      data: {
        jobPosition,
      },
    });
  } catch (error) {
      next(error);
  }
};

// @desc    Add a new job position
// @route   POST /api/master/job-positions
// @access  Private/HRBP
const addJobPosition = async (req, res, next) => {
  try {
    const { JobPosition } = req.body;
    const CreatedBy = req.user.RHubUserId;
    const newJobPosition = await jobPositionService.createJobPosition({ JobPosition, CreatedBy });
    logger.info(`Job Position created by ${CreatedBy}: ${newJobPosition.JobPosition}`);
    res.status(201).json({
      status: 'success',
      message: "Job Position added successfully",
      data: {
        jobPosition: newJobPosition,
      },
    });
  } catch (error) {
   next(error);
  }
};

// @desc    Update a job position
// @route   PUT /api/master/job-positions/:id
// @access  Private/HRBP
const updateJobPosition = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { JobPosition } = req.body;
    const ModifiedBy = req.user.RHubUserId;

    const updatedJobPosition = await jobPositionService.editJobPosition(id, {
      JobPosition,
      ModifiedBy,
    });
    logger.info(`Job Position ID ${id} updated by ${ModifiedBy}`);
    res.status(200).json({
      status: 'success',
      message: "Job Position updated successfully",
      data: {
        jobPosition: updatedJobPosition,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a job position
// @route   DELETE /api/master/job-positions/:id
// @access  Private/HRBP
const deleteJobPosition = async (req, res, next) => {
  try {
    const { id } = req.params;
    const DeletedBy = req.user.RHubUserId;
    await jobPositionService.removeJobPosition(id, DeletedBy);
    logger.info(`Job Position ID ${id} deleted by ${DeletedBy}`);
    res.status(200).json({
      status: 'success',
      message: "Job Position deleted successfully"
    });
  } catch (error) {
    next(error);
  }
};

export const jobPositionController = {
    getJobPositions,
    getJobPosition,
    addJobPosition,
    updateJobPosition,
    deleteJobPosition,
}