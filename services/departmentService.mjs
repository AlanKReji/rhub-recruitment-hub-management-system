import logger from '../config/logger.mjs';
import { departmentQueries } from "../dbqueries/departmentQueries.mjs";
import { AppError } from "../utils/appError.mjs";

const toTitleCase = (str) => {
  return str.replace(
    /\w\S*/g,
    (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  );
};

/**
 * @description Retrieves a paginated and searchable list of all non-deleted departments.
 * @param {number} page - The page number for pagination.
 * @param {number} limit - The number of items per page.
 * @param {string} search - A search term to filter departments by name.
 * @returns {Promise<object>} A list of department documents.
 */
const getAllDepartments = async (page, limit, search) => {
  return await departmentQueries.findAllDepartments(page, limit, search);
};

/**
 * @description Retrieves a single department by its ID, ensuring it is not deleted.
 * @param {string} id - The ID of the department to retrieve.
 * @returns {Promise<object>} The department document.
 * @throws {AppError} Throws an error if the department is not found or has been deleted.
 */
const getDepartmentById = async (id) => {
  const department = await departmentQueries.findDepartmentById(id);
  if(department.IsDelete){
    logger.info("Department is deleted");
  }
   if (!department || department.IsDelete ) {
    throw new AppError("Department not found.", 404);
  }
  return department;
};

/**
 * @description Creates a new department, ensuring the name is unique and not deleted.
 * @param {object} departmentData - The data for the new department.
 * @param {string} departmentData.Department - The name of the department.
 * @returns {Promise<object>} The newly created department document.
 * @throws {AppError} Throws an error if a department with the same name already exists.
 */
const createDepartment = async (departmentData) => {
  const formattedName = toTitleCase(departmentData.Department).trim();
  const departmentsExists = await departmentQueries.findAllDepartmentByName(formattedName);
  const departments = departmentsExists.find(department => department.IsDelete === false);
  if (departments) {
    throw new AppError('Department name already exists.', 409);
  }
  const newDepartmentData = {
    ...departmentData,
    Department: formattedName,
  };
  const newDepartment = await departmentQueries.createNewDepartment(newDepartmentData);
  return newDepartment;
};

/**
 * @description Edits an existing department's name.
 * @param {string} id - The ID of the department to edit.
 * @param {object} updateData - The update data.
 * @param {string} updateData.Department - The new name for the department.
 * @param {string} updateData.ModifiedBy - The user ID of the modifier.
 * @returns {Promise<object>} The updated department document.
 * @throws {AppError} Throws an error if the department is not found, in use, or if the new name already exists.
 */
const editDepartment = async (id, updateData) => {
  const { Department: newName, ModifiedBy } = updateData;
  const department = await departmentQueries.findDepartmentById(id);
  if(department.IsDelete){
    logger.info("Can't edit as the department is deleted");
  }
  if (!department || department.IsDelete ) {
    throw new AppError("Department not found.", 404);
  }
  const activePR = await departmentQueries.findActivePRByDepartment(id);
  if (activePR) {
    throw new AppError("Cannot update department. They are assigned to active People Requisitions.", 409);
  }
  const activeUser = await departmentQueries.findActiveUserByDepartment(id);
  if (activeUser) {
    throw new AppError("Cannot update department. They are assigned to active User.", 409);
  }
  const formattedName = toTitleCase(newName).trim();
  const departmentsExists = await departmentQueries.findAllDepartmentByName(formattedName);
  const departments = departmentsExists.find(department => department.IsDelete === false);
  if (departments) {
    throw new AppError('Department name already exists.', 409);
  }
  department.Department = formattedName || department.Department;
  department.ModifiedBy = ModifiedBy;
  department.ModifiedOn = Date.now();
  const updatedDepartment = await departmentQueries.saveDepartment(department);
  return updatedDepartment;
};

/**
 * @description Soft-deletes a department by setting its IsDelete flag to true.
 * @param {string} id - The ID of the department to delete.
 * @param {string} deletedBy - The user ID of the person performing the deletion.
 * @returns {Promise<object>} The soft-deleted department document.
 * @throws {AppError} Throws an error if the department is not found or is in active use.
 */
const removeDepartment = async (id, deletedBy) => {
  const department = await departmentQueries.findDepartmentById(id);
  if(department.IsDelete){
    logger.info("Can't delete as the department is already deleted");
  }
  if (!department || department.IsDelete ) {
    throw new AppError("Department not found.", 404);
  }
  const activePR = await departmentQueries.findActivePRByDepartment(id);
  if (activePR) {
    throw new AppError("Cannot delete department. They are assigned to active People Requisitions.", 409);
  }
  const activeUser = await departmentQueries.findActiveUserByDepartment(id);
  if (activeUser) {
    throw new AppError("Cannot delete department. They are assigned to active User.", 409);
  }
  department.IsDelete = true;
  department.DeletedBy = deletedBy;
  department.DeletedOn = Date.now();
  await departmentQueries.saveDepartment(department);
  return department;
};

export const departmentService = {
    getAllDepartments,
    getDepartmentById,
    createDepartment,
    editDepartment,
    removeDepartment,
}