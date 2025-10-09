import logger from '../config/logger.mjs';
import { jobPositionQueries } from '../dbqueries/jobPositionQueries.mjs';
import { AppError } from "../utils/appError.mjs";

const toTitleCase = (str) => {
  return str.replace(
    /\w\S*/g,
    (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  );
};

/**
 * @description Retrieves a paginated and searchable list of all non-deleted job positions.
 * @param {number} page - The page number for pagination.
 * @param {number} limit - The number of items per page.
 * @param {string} search - A search term to filter job positions by name.
 * @returns {Promise<object>} A list of job position documents.
 */
const getAllJobPositions = async (page, limit, search) => {
  return await jobPositionQueries.findAllJobPositions(page, limit, search);
};

/**
 * @description Retrieves a single job position by its ID, ensuring it is not deleted.
 * @param {string} id - The ID of the job position to retrieve.
 * @returns {Promise<object>} The job position document.
 * @throws {AppError} Throws an error if the job position is not found or has been deleted.
 */
const getJobPositionById = async (id) => {
  const jobPosition = await jobPositionQueries.findJobPositionById(id);
  if(jobPosition.IsDelete){
    logger.info("Job Position is deleted");
  }
   if (!jobPosition || jobPosition.IsDelete ) {
    throw new AppError("Job Position not found.", 404);
  }
  return jobPosition;
};

/**
 * @description Creates a new job position, ensuring the name is unique and not deleted.
 * @param {object} jobPositionData - The data for the new job position.
 * @param {string} jobPositionData.JobPosition - The name of the job position.
 * @returns {Promise<object>} The newly created job position document.
 * @throws {AppError} Throws an error if a job position with the same name already exists.
 */
const createJobPosition = async (jobPositionData) => {
  const formattedName = toTitleCase(jobPositionData.JobPosition).trim();
  const jobPositionsExists = await jobPositionQueries.findAllJobPositionByName(formattedName);
  const jobPositions = jobPositionsExists.find(jobPosition => jobPosition.IsDelete === false);
  if (jobPositions) {
    throw new AppError('Job Position name already exists.', 409);
  }
  const newJobPositionData = {
    ...jobPositionData,
    JobPosition: formattedName,
  };
  const newJobPosition = await jobPositionQueries.createNewJobPosition(newJobPositionData);
  return newJobPosition;
};

/**
 * @description Edits an existing job position's name.
 * @param {string} id - The ID of the job position to edit.
 * @param {object} updateData - The update data.
 * @param {string} updateData.JobPosition - The new name for the job position.
 * @param {string} updateData.ModifiedBy - The user ID of the modifier.
 * @returns {Promise<object>} The updated job position document.
 * @throws {AppError} Throws an error if the record is not found, in use, or if the new name already exists.
 */
const editJobPosition = async (id, updateData) => {
  const { JobPosition: newName, ModifiedBy } = updateData;
  const jobPosition = await jobPositionQueries.findJobPositionById(id);
  if(jobPosition.IsDelete){
    logger.info("Can't edit as the job position is deleted");
  }
  if (!jobPosition || jobPosition.IsDelete ) {
    throw new AppError("Job Position not found.", 404);
  }
  const activePR = await jobPositionQueries.findActivePRByJobPosition(id);
  if (activePR) {
    throw new AppError("Cannot update job position. They are assigned to active People Requisitions.", 409);
  }
  const activeUser = await jobPositionQueries.findActiveUserByJobPosition(id);
  if (activeUser) {
    throw new AppError("Cannot update job position. They are assigned to active User.", 409);
  }
  const formattedName = toTitleCase(newName).trim();
  const jobPositionsExists = await jobPositionQueries.findAllJobPositionByName(formattedName);
  const jobPositions = jobPositionsExists.find(jobPosition => jobPosition.IsDelete === false);
  if (jobPositions) {
    throw new AppError('Job Position name already exists.', 409);
  }
  jobPosition.JobPosition = formattedName || jobPosition.JobPosition;
  jobPosition.ModifiedBy = ModifiedBy;
  jobPosition.ModifiedOn = Date.now();
  const updatedJobPosition = await jobPositionQueries.saveJobPosition(jobPosition);
  return updatedJobPosition;
};

/**
 * @description Soft-deletes a job position by setting its IsDelete flag to true.
 * @param {string} id - The ID of the job position to delete.
 * @param {string} deletedBy - The user ID of the person performing the deletion.
 * @returns {Promise<object>} The soft-deleted job position document.
 * @throws {AppError} Throws an error if the record is not found or is in active use.
 */
const removeJobPosition = async (id, deletedBy) => {
  const jobPosition = await jobPositionQueries.findJobPositionById(id);
  if(jobPosition.IsDelete){
    logger.info("Can't delete as the job position is already deleted");
  }
  if (!jobPosition || jobPosition.IsDelete ) {
    throw new AppError("Job Position not found.", 404);
  }
  const activePR = await jobPositionQueries.findActivePRByJobPosition(id);
  if (activePR) {
    throw new AppError("Cannot delete job position. They are assigned to active People Requisitions.", 409);
  }
  const activeUser = await jobPositionQueries.findActiveUserByJobPosition(id);
  if (activeUser) {
    throw new AppError("Cannot delete job position. They are assigned to active User.", 409);
  }
  jobPosition.IsDelete = true;
  jobPosition.DeletedBy = deletedBy;
  jobPosition.DeletedOn = Date.now();
  await jobPositionQueries.saveJobPosition(jobPosition);
  return jobPosition;
};

export const jobPositionService = {
    getAllJobPositions,
    getJobPositionById,
    createJobPosition,
    editJobPosition,
    removeJobPosition,
}