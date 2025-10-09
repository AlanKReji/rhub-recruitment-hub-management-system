import logger from "../config/logger.mjs";
import { natureOfEmploymentQueries } from "../dbqueries/natureOfEmploymentQueries.mjs";
import { AppError } from "../utils/appError.mjs";

const toTitleCase = (str) => {
  return str.replace(
    /\w\S*/g,
    (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  );
};

/**
 * @description Retrieves a paginated and searchable list of all non-deleted nature of employments.
 * @param {number} page - The page number for pagination.
 * @param {number} limit - The number of items per page.
 * @param {string} search - A search term to filter by name.
 * @returns {Promise<object>} A list of nature of employment documents.
 */
const getAllNatureOfEmployments = async (page, limit, search) => {
  return await natureOfEmploymentQueries.findAllNatureOfEmployments(page, limit, search);
};

/**
 * @description Retrieves a single nature of employment by its ID, ensuring it is not deleted.
 * @param {string} id - The ID of the nature of employment to retrieve.
 * @returns {Promise<object>} The nature of employment document.
 * @throws {AppError} Throws an error if the nature of employment is not found or has been deleted.
 */
const getNatureOfEmploymentById = async (id) => {
  const natureOfEmployment = await natureOfEmploymentQueries.findNatureOfEmploymentById(id);
  if (natureOfEmployment.IsDelete) {
    logger.info("Nature of Employment is deleted");
  }
  if (!natureOfEmployment || natureOfEmployment.IsDelete) {
    throw new AppError("Nature of Employment not found", 404);
  }
  return natureOfEmployment;
};

/**
 * @description Creates a new nature of employment, ensuring the name is unique and not deleted.
 * @param {object} natureOfEmploymentData - The data for the new nature of employment.
 * @param {string} natureOfEmploymentData.NatureOfEmployment - The name of the employment type.
 * @returns {Promise<object>} The newly created nature of employment document.
 * @throws {AppError} Throws an error if a nature of employment with the same name already exists.
 */
const createNatureOfEmployment = async (natureOfEmploymentData) => {
  const formattedName = toTitleCase(natureOfEmploymentData.NatureOfEmployment).trim();
  const natureOfEmploymentExists = await natureOfEmploymentQueries.findAllNatureOfEmploymentByName(formattedName);
  const natureOfEmployments = natureOfEmploymentExists.find(natureOfEmployment => natureOfEmployment.IsDelete === false);
  if (natureOfEmployments) {
    throw new AppError('Nature of Employment name already exists.', 409);
  }
  const newNatureOfEmploymentData = {
    ...natureOfEmploymentData,
    NatureOfEmployment: formattedName,
  };
  const newNatureOfEmployment = await natureOfEmploymentQueries.createNewNatureOfEmployment(newNatureOfEmploymentData);
  return newNatureOfEmployment;
};

/**
 * @description Edits an existing nature of employment's name.
 * @param {string} id - The ID of the nature of employment to edit.
 * @param {object} updateData - The update data.
 * @param {string} updateData.NatureOfEmployment - The new name.
 * @param {string} updateData.ModifiedBy - The user ID of the modifier.
 * @returns {Promise<object>} The updated nature of employment document.
 * @throws {AppError} Throws an error if the record is not found, in use, or if the new name already exists.
 */
const editNatureOfEmployment = async (id, updateData) => {
  const { NatureOfEmployment: newName, ModifiedBy } = updateData;
  const natureOfEmployment = await natureOfEmploymentQueries.findNatureOfEmploymentById(id);
  if (natureOfEmployment.IsDelete) {
    logger.info("Can't edit as the nature of employment is deleted");
  }
  if (!natureOfEmployment || natureOfEmployment.IsDelete) {
    throw new AppError("Nature of Employment not found.", 404);
  }
  const activePR = await natureOfEmploymentQueries.findActivePRByNatureOfEmployment(id);
  if (activePR) {
    throw new AppError(
      "Cannot update nature of employment. They are assigned to active People Requisitions.",
      409
    );
  }
  const formattedName = toTitleCase(newName).trim();
  const natureOfEmploymentExists = await natureOfEmploymentQueries.findAllNatureOfEmploymentByName(
    formattedName
  );
  const natureOfEmployments = natureOfEmploymentExists.find(natureOfEmployment => natureOfEmployment.IsDelete === false);
  if (natureOfEmployments) {
    throw new AppError('Nature of Employment name already exists.', 409);
  }
  natureOfEmployment.NatureOfEmployment = formattedName || natureOfEmployment.NatureOfEmployment;
  natureOfEmployment.ModifiedBy = ModifiedBy;
  natureOfEmployment.ModifiedOn = Date.now();
  const updatedNatureOfEmployment = await natureOfEmploymentQueries.saveNatureOfEmployment(
    natureOfEmployment
  );
  return updatedNatureOfEmployment;
};

/**
 * @description Soft-deletes a nature of employment by setting its IsDelete flag to true.
 * @param {string} id - The ID of the nature of employment to delete.
 * @param {string} deletedBy - The user ID of the person performing the deletion.
 * @returns {Promise<object>} The soft-deleted nature of employment document.
 * @throws {AppError} Throws an error if the record is not found or is in active use.
 */
const removeNatureOfEmployment = async (id, deletedBy) => {
  const natureOfEmployment = await natureOfEmploymentQueries.findNatureOfEmploymentById(id);
  if (natureOfEmployment.IsDelete) {
    logger.info("Can't delete as the nature of employment is already deleted");
  }
  if (!natureOfEmployment || natureOfEmployment.IsDelete) {
    throw new AppError("Nature of Employment not found.", 404);
  }
  const activePR = await natureOfEmploymentQueries.findActivePRByNatureOfEmployment(id);
  if (activePR) {
    throw new AppError(
      "Cannot delete nature of employment. They are assigned to active People Requisitions.",
      409
    );
  }
  natureOfEmployment.IsDelete = true;
  natureOfEmployment.DeletedBy = deletedBy;
  natureOfEmployment.DeletedOn = Date.now();
  await natureOfEmploymentQueries.saveNatureOfEmployment(natureOfEmployment);
  return natureOfEmployment;
};

export const natureOfEmploymentService = {
    getAllNatureOfEmployments,
    getNatureOfEmploymentById,
    createNatureOfEmployment,
    editNatureOfEmployment,
    removeNatureOfEmployment,
}