import logger from '../config/logger.mjs';
import { roleQueries } from '../dbqueries/roleQueries.mjs';
import { AppError } from "../utils/appError.mjs";

/**
 * @description Retrieves a paginated and searchable list of all non-deleted roles.
 * @param {number} page - The page number for pagination.
 * @param {number} limit - The number of items per page.
 * @param {string} search - A search term to filter roles by name.
 * @returns {Promise<object>} A list of role documents.
 */
const getAllRoles = async (page, limit, search) => {
  return await roleQueries.findAllRoles(page, limit, search);
};

/**
 * @description Retrieves a single role by its ID, ensuring it is not deleted.
 * @param {string} id - The ID of the role to retrieve.
 * @returns {Promise<object>} The role document.
 * @throws {AppError} Throws an error if the role is not found or has been deleted.
 */
const getRoleById = async (id) => {
  const role = await roleQueries.findRoleById(id);
  if(role.IsDelete){
    logger.info("Role is deleted");
  }
   if (!role || role.IsDelete ) {
    throw new AppError("Role not found.", 404);
  }
  return role;
};

/**
 * @description Creates a new role, ensuring the name is unique and not deleted.
 * @param {object} roleData - The data for the new role.
 * @param {string} roleData.Role - The name of the role.
 * @returns {Promise<object>} The newly created role document.
 * @throws {AppError} Throws an error if a role with the same name already exists.
 */
const createRole = async (roleData) => {
  const name = roleData.Role.trim();
  const rolesExists = await roleQueries.findAllRoleByName(name);
  const roles = rolesExists.find(role => role.IsDelete === false);
  if (roles) {
    throw new AppError('Role name already exists.', 403);
  }
  const newRoleData = {
    ...roleData,
    Role: name,
  };
  const newRole = await roleQueries.createNewRole(newRoleData);
  return newRole;
};

/**
 * @description Edits an existing role's name.
 * @param {string} id - The ID of the role to edit.
 * @param {object} updateData - The update data.
 * @param {string} updateData.Role - The new name for the role.
 * @param {string} updateData.ModifiedBy - The user ID of the modifier.
 * @returns {Promise<object>} The updated role document.
 * @throws {AppError} Throws an error if the role is not found, in use, or if the new name already exists.
 */
const editRole = async (id, updateData) => {
  const { Role: newName, ModifiedBy } = updateData;
  const role = await roleQueries.findRoleById(id);
  if(role.IsDelete){
    logger.info("Can't edit as the role is deleted");
  }
  if (!role || role.IsDelete ) {
    throw new AppError("Role not found.", 404);
  }
  const activeUser = await roleQueries.findActiveUserByRole(id);
  if (activeUser) {
    throw new AppError("Cannot update role. They are assigned to active User.", 409);
  }
  const formattedName = newName.trim();
  const rolesExists = await roleQueries.findAllRoleByName(formattedName);
  const roles = rolesExists.find(role => role.IsDelete === false);
  if (roles) {
    throw new AppError('Role name already exists.', 403);
  }
  role.Role = formattedName || role.Role;
  role.ModifiedBy = ModifiedBy;
  role.ModifiedOn = Date.now();
  const updatedRole = await roleQueries.saveRole(role);
  return updatedRole;
};

/**
 * @description Soft-deletes a role by setting its IsDelete flag to true.
 * @param {string} id - The ID of the role to delete.
 * @param {string} deletedBy - The user ID of the person performing the deletion.
 * @returns {Promise<object>} The soft-deleted role document.
 * @throws {AppError} Throws an error if the role is not found or is in active use.
 */
const removeRole = async (id, deletedBy) => {
  const role = await roleQueries.findRoleById(id);
  if(role.IsDelete){
    logger.info("Can't delete as the role is already deleted");
  }
  if (!role || role.IsDelete ) {
    throw new AppError("Role not found.", 404);
  }
  const activeUser = await roleQueries.findActiveUserByRole(id);
  if (activeUser) {
    throw new AppError("Cannot delete role. They are assigned to active User.", 409);
  }
  role.IsDelete = true;
  role.DeletedBy = deletedBy;
  role.DeletedOn = Date.now();
  await roleQueries.saveRole(role);
  return role;
};

export const roleService = {
    getAllRoles,
    getRoleById,
    createRole,
    editRole,
    removeRole,
}
