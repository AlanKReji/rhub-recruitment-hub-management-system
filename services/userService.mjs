import bcrypt from 'bcrypt';
import { AppError } from '../utils/appError.mjs';
import { isPasswordComplex } from '../validators/passwordValidator.mjs';
import { userQueries } from '../dbqueries/userQueries.mjs';
import { departmentQueries } from '../dbqueries/departmentQueries.mjs';
import { roleQueries } from '../dbqueries/roleQueries.mjs';
import { jobPositionQueries } from '../dbqueries/jobPositionQueries.mjs';
import { prefixCounterQueries } from '../dbqueries/prefixCounterQueries.mjs';
import generateRandomPassword from '../utils/generatePassword.mjs';
import { emailService } from './emailService.mjs';
import logger from '../config/logger.mjs';

/**
 * @description Changes the password for a logged-in user.
 * @param {string} userId - The ID of the user.
 * @param {string} currentPassword - The user's current password.
 * @param {string} newPassword - The desired new password.
 * @returns {Promise<void>}
 * @throws {AppError} Throws an error if the new password is not complex, the user is not found, or the current password is incorrect.
 */
const changePassword = async (userId, currentPassword, newPassword) => {
    if (!isPasswordComplex(newPassword)) {
        throw new AppError(
            'Password must be at least 8 characters long and contain an uppercase letter, a lowercase letter, a number, and a special character (@#$%&*).',
            400
        );
    }
    const user = await userQueries.findById(userId);
    if (user.IsDelete){
    logger.info(`${user.id} this users account is deleted but tried to change password`)
    }
    if (!user || user.IsDelete) {
        throw new AppError('User not found.', 404);
    }
    const isMatch = await bcrypt.compare(currentPassword, user.Password);
    if (!isMatch) {
        throw new AppError('Incorrect current password.', 401);
    }
    user.Password = newPassword;
    await userQueries.save(user);
};

/**
 * @description Retrieves a paginated and filtered list of users.
 * @param {number} page - The page number for pagination.
 * @param {number} limit - The number of items per page.
 * @param {string} search - A search term to filter by name or email.
 * @param {string} role - A role ID to filter by.
 * @param {string} department - A department ID to filter by.
 * @param {object} loggedInUser - The user object of the person making the request.
 * @returns {Promise<object>} A list of user documents.
 */
const getAllUsers = async (page, limit, search, role, department, loggedInUser) => {
    return await userQueries.findAllUsers(page, limit, search, role, department, loggedInUser);
};

/**
 * @description Retrieves a single user by their ID, with role-based access control.
 * @param {string} id - The ID of the user to retrieve.
 * @param {object} loggedInUser - The user object of the person making the request.
 * @returns {Promise<object>} The user document.
 * @throws {AppError} Throws an error if the user is not found or if a recruiter tries to view another recruiter.
 */
const getUserById = async (id, loggedInUser) => {
    const user = await userQueries.findUserById(id);
    if(user.IsDelete){
        logger.info("User is deleted");
    }
    if (!user || user.IsDelete) {
        throw new AppError('User not found.', 404);
    }
    if (loggedInUser.RoleId.Role === 'Recruiter') {
        if (user.RoleId.Role === 'Recruiter' && user._id.toString() !== loggedInUser._id.toString()) {
            throw new AppError('You are not authorized to view this user.', 403);
        }
    }
    return user;
};

/**
 * @description Creates a new user and sends a welcome email with a temporary password.
 * @param {object} userData - The data for the new user.
 * @returns {Promise<object>} The newly created user document.
 * @throws {AppError} Throws an error for invalid email domains, duplicate emails, or invalid foreign keys.
 */
const createUser = async (userData) => {
    const { Name, Email, DepartmentId, RoleId, JobPositionId, CreatedBy } = userData;
    const formattedName = Name.trim();
    const formattedEmail = Email.toLowerCase().trim(); 
    const emailPattern = /^[^\s@]+@gmail\.com$/i;
    if (!emailPattern.test(formattedEmail)) {
        throw new AppError('Invalid email domain. Email must end with @gmail.com and no spaces', 400);
    }
    const existingUser = await userQueries.findUserByEmail(formattedEmail);
    if (existingUser) {
        throw new AppError('An active user with this email already exists.', 409);
    }
    const department = await departmentQueries.findDepartmentById(DepartmentId);
    if (!department || department.IsDelete) {
        throw new AppError('The specified department does not exist or is inactive.', 400);
    }
    const role = await roleQueries.findRoleById(RoleId);
    if (!role || role.IsDelete) {
        throw new AppError('The specified role does not exist or is inactive.', 400);
    }
    const jobPosition = await jobPositionQueries.findJobPositionById(JobPositionId);
    if (!jobPosition || jobPosition.IsDelete) {
        throw new AppError('The specified job position does not exist or is inactive.', 400);
    }
    const prefix = 'RHUB-';
    const counterDoc = await prefixCounterQueries.findAndIncrement(prefix);
    const formattedCount = String(counterDoc.count).padStart(3, '0');
    const RHubUserId = `${prefix}${formattedCount}`;
    const temporaryPassword = generateRandomPassword();
    const newUserData = {
        RHubUserId,
        Name: formattedName,
        Email: formattedEmail,
        DepartmentId,
        RoleId,
        JobPositionId,
        Password: temporaryPassword,
        CreatedBy,
    };
    const newUser = await userQueries.createNewUser(newUserData)
    const changePasswordUrl = `http://localhost:3000/api/users/change-password`;
    await emailService.sendEmail(
        formattedEmail,
        'Welcome to R-Hub! Your Account Details',
        'welcomeEmail',
        {
            name: formattedName,
            to: formattedEmail,
            temporaryPassword: temporaryPassword,
            changePasswordUrl: changePasswordUrl
        }
    );
    return newUser;
};

/**
 * @description Edits an existing user's details.
 * @param {string} id - The ID of the user to edit.
 * @param {object} updateData - The update data for the user.
 * @returns {Promise<object>} The updated user document.
 * @throws {AppError} Throws an error if the user is not found, assigned to an active PR, or if data is invalid.
 */
const editUser = async (id, updateData) => {
    const { Name, Email, DepartmentId, RoleId, JobPositionId, ModifiedBy } = updateData;
    const formattedEmail = Email?.toLowerCase().trim();
    const formattedName = Name?.trim();
    const user = await userQueries.findUserById(id);
    if(user.IsDelete){
        logger.info("Can't edit as the user is deleted");
      }
    if (!user || user.IsDelete) {
        throw new AppError('User not found.', 404);
    }
    const activePR = await userQueries.findActivePRByUser(id);
    if (activePR) {
        throw new AppError('Cannot edit user. They are assigned to active People Requisitions.', 409);
    }
    if (DepartmentId !== undefined) {
        const department = await departmentQueries.findDepartmentById(DepartmentId);
        if (!department || department.IsDelete) {
            if (department && department.IsDelete) {
                logger.info("Can't edit as the department is deleted");
            }
            throw new AppError('The specified department does not exist or is inactive.', 400);
        }
        user.DepartmentId = DepartmentId;
    }
    if (RoleId !== undefined) {
        const role = await roleQueries.findRoleById(RoleId);
        if (!role || role.IsDelete) {
            if(role && role.IsDelete){
                logger.info("Can't edit as the role is deleted");
            }
            throw new AppError('The specified role does not exist or is inactive.', 400);
        }
        user.RoleId = RoleId;
    }
    if (JobPositionId !== undefined) {
        const jobPosition = await jobPositionQueries.findJobPositionById(JobPositionId);
        if (!jobPosition || jobPosition.IsDelete) {
            if(jobPosition && jobPosition.IsDelete){
                logger.info("Can't edit as the job position is deleted");
            }
            throw new AppError('The specified job position does not exist or is inactive.', 400);
        }
        user.JobPositionId = JobPositionId;
    }
    if (Email && Email !== user.Email) {
        const existingUser = await userQueries.findUserByEmail(formattedEmail);
        if (existingUser) {
            throw new AppError('Another active user with this email already exists.', 409);
        }
        const emailPattern = /^[^\s@]+@gmail\.com$/i;
        if (!emailPattern.test(formattedEmail)) {
            throw new AppError('Invalid email domain. Email must end with @gmail.com and no spaces', 400);
        }
        user.Email = formattedEmail;
    }
    if (formattedName !== undefined) {
        user.Name = formattedName;
    }
    user.ModifiedBy = ModifiedBy ?? user.ModifiedBy;
    user.ModifiedOn = Date.now();
    const updatedUser =  await userQueries.save(user);
    return updatedUser;
};

/**
 * @description Soft-deletes a user by setting their IsDelete flag to true.
 * @param {string} id - The ID of the user to delete.
 * @param {string} deletedBy - The RHubUserId of the user performing the deletion.
 * @returns {Promise<object>} The soft-deleted user document.
 * @throws {AppError} Throws an error if a user tries to delete their own account, or if the user is in active use.
 */
const removeUser = async (id, deletedBy) => {
    const user = await userQueries.findUserById(id);
    if (user.RHubUserId === String(deletedBy)) {
        throw new AppError('You cannot delete your own account.', 403);
    } 
    if(user.IsDelete){
        logger.info("Can't delete as the user is already deleted");
    }
    if (!user || user.IsDelete) {
        throw new AppError('User not found.', 404);
    }
    const activePR = await userQueries.findActivePRByUser(id);
    if (activePR) {
        throw new AppError('Cannot delete user. They are assigned to active People Requisitions.', 409);
    }

    user.IsDelete = true;
    user.DeletedBy = deletedBy;
    user.DeletedOn = Date.now();
    
    await userQueries.save(user);
    return user;
};

export const userService = {
    changePassword,
    getAllUsers,
    getUserById,
    createUser,
    editUser,
    removeUser,
};