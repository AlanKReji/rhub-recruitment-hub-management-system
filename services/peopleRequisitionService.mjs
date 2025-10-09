import { AppError } from "../utils/appError.mjs";
import logger from  '../config/logger.mjs';
import { userQueries} from '../dbqueries/userQueries.mjs';
import { jobPositionQueries } from "../dbqueries/jobPositionQueries.mjs";
import { departmentQueries } from '../dbqueries/departmentQueries.mjs';
import { natureOfEmploymentQueries } from "../dbqueries/natureOfEmploymentQueries.mjs";
import { peopleRequisitionQueries } from "../dbqueries/peopleRequisitionQueries.mjs";
import { prefixCounterQueries } from "../dbqueries/prefixCounterQueries.mjs";
import fs  from 'fs';
import { emailService } from './emailService.mjs';

/**
 * @description Creates a new People Requisition after validating all provided IDs and checking for duplicates.
 * @param {object} prData - The data for the new PR from the request body.
 * @param {object} creatingUser - The user object of the HRBP creating the PR.
 * @returns {Promise<object>} The newly created People Requisition document.
 * @throws {AppError} Throws an error if a duplicate PR exists or if any provided IDs are invalid/deleted.
 */
const createPeopleRequisition = async (prData, creatingUser) => {
    const { jobId, departmentId, recruiterId, natureOfEmploymentId, jobDescription, PRFNumber, PRFLink, ClosingDate } = prData;
    const existingPR = await peopleRequisitionQueries.findActiveByDetails(jobId, departmentId, natureOfEmploymentId);
    if (existingPR) {
        logger.warn(`Attempt to create a duplicate PR by HRBP ${creatingUser.id}. An active PR (${existingPR.JobCode}) already exists.`);
        throw new AppError('An active People Requisition for this job and department already exists.', 409);
    }
    const [jobPosition, department, recruiter, natureOfEmployment] = await Promise.all([
        jobPositionQueries.findJobPositionById(jobId),
        departmentQueries.findDepartmentById(departmentId),
        userQueries.findUserById(recruiterId),
        natureOfEmploymentQueries.findNatureOfEmploymentById(natureOfEmploymentId),
    ]);
    if (!jobPosition || jobPosition.IsDelete) {
        logger.error(`PR creation failed for HRBP ${creatingUser.id}: JobPosition with ID ${jobId} is invalid or deleted.`);
        throw new AppError('One or more provided fields are invalid.', 400);
    }
    if (!department || department.IsDelete) {
        logger.error(`PR creation failed for HRBP ${creatingUser.id}: Department with ID ${departmentId} is invalid or deleted.`);
        throw new AppError('One or more provided fields are invalid.', 400);
    }
    if (!recruiter || recruiter.IsDelete || recruiter.RoleId.Role !== 'Recruiter') {
        logger.error(`PR creation failed for HRBP ${creatingUser.id}: Recruiter with ID ${recruiterId} is invalid, deleted, or not a recruiter.`);
        throw new AppError('One or more provided fields are invalid.', 400);
    }
    if (!natureOfEmployment || natureOfEmployment.IsDelete) {
        logger.error(`PR creation failed for HRBP ${creatingUser.id}: NatureOfEmployment with ID ${natureOfEmploymentId} is invalid or deleted.`);
        throw new AppError('One or more provided fields are invalid.', 400);
    }

    const prefix = jobPosition.JobPosition.split(' ').map(word => word[0]).join('').toUpperCase();
    const counterDoc = await prefixCounterQueries.findAndIncrement(prefix);
    const formattedCount = String(counterDoc.count).padStart(3, '0');
    const jobCode = `${prefix}${formattedCount}`;

    const newPR = {
        JobCode: jobCode,
        JobId: jobId,
        DepartmentId: departmentId,
        RecruiterId: recruiterId,
        NatureOfEmploymentId: natureOfEmploymentId,
        HRBPId: creatingUser.id,
        CreatedBy: creatingUser.RHubUserId,
        JobDescription: jobDescription,
        PRFNumber: PRFNumber,
        PRFLink: PRFLink,
        ClosingDate: ClosingDate,
    };
    const createdPR = await peopleRequisitionQueries.createNewPeopleRequisition(newPR);
    logger.info(`People Requisition ${jobCode} created successfully by HRBP ${creatingUser.RHubUserId}.`);

    return createdPR;
};

/**
 * @description Approves a People Requisition and sends a notification email to the recruiter.
 * @param {string} prId - The ID of the PR to approve.
 * @param {object} approvingUser - The user object of the HRBP performing the approval.
 * @returns {Promise<object>} The updated People Requisition document.
 * @throws {AppError} Throws an error if the PR is not found, deleted, or already approved.
 */
const approvePeopleRequisition = async (prId, approvingUser) => {
    const pr = await peopleRequisitionQueries.findByIdAndPopulateDetails(prId);

    if (!pr) {
        throw new AppError('People Requisition not found.', 404);
    }
    if (pr.IsDelete) {
        throw new AppError('This People Requisition has been deleted and cannot be approved.', 409);
    }
    if (pr.IsApprovedByHRBP) {
        throw new AppError('This People Requisition has already been approved.', 409);
    }
    pr.IsApprovedByHRBP = true;
    pr.ModifiedBy = approvingUser.RHubUserId;
    pr.ModifiedOn = Date.now();
    const updatedPR = await pr.save();
    const emailData = {
        recruiterName: updatedPR.RecruiterId.Name,
        departmentName: updatedPR.DepartmentId.Department,
        positionName: updatedPR.JobId.JobPosition,
    };
    await emailService.sendEmail(
        updatedPR.RecruiterId.Email,
        `New Requirement Assigned: ${updatedPR.JobId.JobPosition}`,
        'prApprovalEmail',
        emailData
    );
    logger.info(`People Requisition ${updatedPR.JobCode} approved by HRBP ${approvingUser.RHubUserId}.`);
    return updatedPR;
};

/**
 * @description Updates the core details of a PR based on the user's role (HRBP or Recruiter).
 * @param {string} prId - The ID of the PR to update.
 * @param {object} updateData - The data to be updated.
 * @param {object} updatingUser - The user object of the person performing the update.
 * @returns {Promise<object>} The updated and populated People Requisition document.
 * @throws {AppError} Throws an error if the user is not authorized, the PR is locked, or if any provided IDs are invalid.
 */
const HRBP_EDITABLE_FIELDS = ['PRFNumber', 'PRFLink', 'RecruiterId', 'DepartmentId', 'NatureOfEmploymentId','JobDescription'];
const RECRUITER_EDITABLE_FIELDS = ['PRFNumber', 'PRFLink', 'DepartmentId', 'NatureOfEmploymentId', 'JobDescription'];

const updatePeopleRequisition = async (prId, updateData, updatingUser) => {
    const pr = await peopleRequisitionQueries.findById(prId);
    if (!pr) {
        throw new AppError('People Requisition not found.', 404);
    }
    if (pr.IsDelete) {
        throw new AppError('This People Requisition has been deleted and cannot be edited.', 409);
    }
    const isAssignedHrbp = pr.HRBPId.toString() === updatingUser.id;
    const isAssignedRecruiter = pr.RecruiterId.toString() === updatingUser.id;

    if (!isAssignedHrbp && !isAssignedRecruiter) {
        throw new AppError('You do not have permission to edit this People Requisition.', 403);
    }
    if (!['open', 'onhold'].includes(pr.Status)) {
        throw new AppError(`Cannot edit details of a requisition with status "${pr.Status}".`, 409);
    }
    const userRole = updatingUser.RoleId.Role;
    const allowedFields = userRole === 'HRBP' ? HRBP_EDITABLE_FIELDS : RECRUITER_EDITABLE_FIELDS;
    for (const key in updateData) {
        if (!allowedFields.includes(key)) {
            logger.warn(`Recruiter ${updatingUser.RHubUserId} attempted to edit unallowed field "${key}" on PR ${pr.JobCode}.`);
            throw new AppError(`You do not have permission to edit the ${key} field.`, 403);
        }
    }
    if (updateData.RecruiterId) {
        const newRecruiter = await userQueries.findUserById(updateData.RecruiterId);
        if (!newRecruiter || newRecruiter.IsDelete || newRecruiter.RoleId.Role !== 'Recruiter') {
            logger.error(`PR update failed: Invalid or deleted RecruiterId ${updateData.RecruiterId}.`);
            throw new AppError('The provided Recruiter ID is invalid.', 400);
        }
    }
    if (updateData.DepartmentId) {
        const newDepartment = await departmentQueries.findDepartmentById(updateData.DepartmentId);
        if (!newDepartment || newDepartment.IsDelete) {
            logger.error(`PR update failed: Invalid or deleted DepartmentId ${updateData.DepartmentId}.`);
            throw new AppError('The provided Department ID is invalid.', 400);
        }
    }
    if (updateData.NatureOfEmploymentId) {
        const newNatureOfEmployment = await natureOfEmploymentQueries.findNatureOfEmploymentById(updateData.NatureOfEmploymentId);
        if (!newNatureOfEmployment || newNatureOfEmployment.IsDelete) {
            logger.error(`PR update failed: Invalid or deleted NatureOfEmploymentId ${updateData.NatureOfEmploymentId}.`);
            throw new AppError('The provided Nature of Employment ID is invalid.', 400);
        }
    }
    const oldRecruiterId = pr.RecruiterId.toString();
    for (const key in updateData) {
        if (allowedFields.includes(key)) {
            pr[key] = updateData[key];
        }
    }
    pr.ModifiedBy = updatingUser.RHubUserId;
    pr.ModifiedOn = Date.now();
    await pr.save();
    const newRecruiterId = updateData.RecruiterId;
    if (newRecruiterId && newRecruiterId !== oldRecruiterId) {
        logger.info(`Recruiter changed for PR ${pr.JobCode}. Sending notification.`);
        const populatedPR = await peopleRequisitionQueries.findByIdAndPopulateDetails(prId);
        if (populatedPR) {
            const emailData = {
                recruiterName: populatedPR.RecruiterId.Name,
                departmentName: populatedPR.DepartmentId.Department,
                positionName: populatedPR.JobId.JobPosition,
            };
            await emailService.sendEmail(
                populatedPR.RecruiterId.Email,
                `Reassignment: New Requirement Assigned - ${populatedPR.JobId.JobPosition}`,
                'prReassignmentEmail', 
                emailData
            );
        }
    }
    const updatedPR = await peopleRequisitionQueries.findByIdAndPopulateDetails(prId);
    logger.info(`People Requisition ${updatedPR.JobCode} details updated by ${userRole} ${updatingUser.RHubUserId}.`);

    return updatedPR;
};

/**
 * @description Soft-deletes a People Requisition.
 * @param {string} prId - The ID of the PR to delete.
 * @param {object} deletingUser - The user object of the HRBP performing the deletion.
 * @returns {Promise<void>}
 * @throws {AppError} Throws an error if the PR is not found, already deleted, or not in 'open' status.
 */
const deletePeopleRequisition = async (prId, deletingUser) => {
    const pr = await peopleRequisitionQueries.findById(prId);
    if (!pr) {
        throw new AppError('People Requisition not found.', 404);
    }
    if (pr.IsDelete) {
        throw new AppError('This People Requisition has already been deleted.', 409);
    }
    if (pr.Status !== 'open') {
        throw new AppError(`Cannot delete a requisition with status ${pr.Status}. Only open requisitions can be deleted.`, 409);
    }
    pr.IsDelete = true;
    pr.DeletedBy = deletingUser.RHubUserId;
    pr.DeletedOn = Date.now();

    await pr.save();
    logger.info(`People Requisition ${pr.JobCode} soft-deleted by HRBP ${deletingUser.RHubUserId}.`);
};

/**
 * @description Updates the status of a People Requisition based on role-specific rules.
 * @param {string} prId - The ID of the PR to update.
 * @param {string} newStatus - The desired new status.
 * @param {object} updatingUser - The user object of the person performing the update.
 * @returns {Promise<object>} The updated People Requisition document.
 * @throws {AppError} Throws an error for invalid status transitions or if the user is not authorized.
 */
const updatePeopleRequisitionStatus = async (prId, newStatus, updatingUser) => {
    const pr = await peopleRequisitionQueries.findById(prId);
    if (!pr) {
        throw new AppError('People Requisition not found.', 404);
    }
    if (pr.IsDelete) {
        throw new AppError('People Requisition not found.', 404);
    }
    const isAssignedHrbp = pr.HRBPId.toString() === updatingUser.id;
    const isAssignedRecruiter = pr.RecruiterId.toString() === updatingUser.id;
    if (!isAssignedHrbp && !isAssignedRecruiter) {
        throw new AppError('You do not have permission to update this People Requisition.', 403);
    }
    const userRole = updatingUser.RoleId.Role;
    const currentStatus = pr.Status;
    let isValidTransition = false;
    if (userRole === 'HRBP') {
        if (currentStatus === 'open' && newStatus === 'onhold') isValidTransition = true;
        if (currentStatus === 'completed' && newStatus === 'closed') isValidTransition = true;
        if (currentStatus === 'onhold' && newStatus === 'open') isValidTransition = true;
        if (currentStatus === 'closed' && ['open', 'onhold'].includes(newStatus)) isValidTransition = true;
    }
    if (userRole === 'Recruiter') {
        if (currentStatus === 'open' && newStatus === 'inprogress') isValidTransition = true;
        if (currentStatus === 'inprogress' && newStatus === 'completed') isValidTransition = true;
    }
    if (!isValidTransition) {
        logger.warn(`Invalid status transition attempted on PR ${pr.JobCode} by ${userRole} ${updatingUser.RHubUserId}: from ${currentStatus} to ${newStatus}.`);
        throw new AppError(`As a ${userRole}, you cannot change the status from ${currentStatus} to ${newStatus}.`, 400);
    }
    pr.Status = newStatus;
    pr.ModifiedBy = updatingUser.RHubUserId;
    pr.ModifiedOn = Date.now();
    const updatedPR = await pr.save();
    logger.info(`Status of PR ${updatedPR.JobCode} updated to ${newStatus} by ${userRole} ${updatingUser.RHubUserId}.`);
    if (userRole === 'Recruiter' && newStatus === 'completed') {
        const populatedPR = await peopleRequisitionQueries.findByIdAndPopulateDetails(prId);
        if (populatedPR) {
            const emailData = {
                hrbpName: populatedPR.HRBPId.Name,
                recruiterName: populatedPR.RecruiterId.Name,
                positionName: populatedPR.JobId.JobPosition,
                jobCode: populatedPR.JobCode,
            };

            await emailService.sendEmail(
                populatedPR.HRBPId.Email,
                `Process Completed: ${populatedPR.JobId.JobPosition} (${populatedPR.JobCode})`,
                'prCompletedEmail', 
                emailData
            );
        }
    }
    return updatedPR;
};

/**
 * @description Retrieves a single People Requisition by its ID, enforcing authorization.
 * @param {string} prId - The ID of the PR to retrieve.
 * @param {object} requestingUser - The user object of the person making the request.
 * @returns {Promise<object>} The populated People Requisition document.
 * @throws {AppError} Throws an error if the PR is not found or the user is not authorized.
 */
const getPeopleRequisitionById = async (prId, requestingUser) => {
    const pr = await peopleRequisitionQueries.findByIdAndPopulateDetails(prId);
    if (!pr || pr.IsDelete) {
        throw new AppError('People Requisition not found.', 404);
    }
    const isAssignedHrbp = pr.HRBPId._id.toString() === requestingUser.id;
    const isAssignedRecruiter = pr.RecruiterId._id.toString() === requestingUser.id;
    const userRole = requestingUser.RoleId.Role;
    if (userRole === 'Recruiter' && !pr.IsApprovedByHRBP) {
        logger.warn(`Recruiter ${requestingUser.RHubUserId} attempted to access unapproved PR ${pr.JobCode}.`);
        throw new AppError('People Requisition not found.', 404);
    }
    if (!isAssignedHrbp && !isAssignedRecruiter) {
        logger.warn(`Unauthorized attempt to access PR ${pr.JobCode} by user ${requestingUser.RHubUserId}.`);
        throw new AppError('You do not have permission to view this People Requisition.', 403);
    }
    return pr;
};

/**
 * @description Retrieves a paginated list of People Requisitions with role-based filtering.
 * @param {object} queryParams - The query parameters from the request (page, limit, search, etc.).
 * @param {object} requestingUser - The user object of the person making the request.
 * @returns {Promise<object>} An object containing the list of PRs and pagination details.
 * @throws {AppError} Throws an error if the user role is not authorized to view the list.
 */
const getAllPeopleRequisitions = async (queryParams, requestingUser) => {
    const filters = { IsDelete: false };
    const userRole = requestingUser.RoleId.Role;
    if ( userRole != 'Recruiter' && userRole!= 'HRBP' ) {
        logger.warn(`Unauthorized attempt to access People Requisition by ${requestingUser.RHubUserId}`)
        throw new AppError('You do not have permission to view this People Requisition.', 403);
    }
    if (userRole === 'Recruiter') {
        filters.RecruiterId = requestingUser.id;
        filters.IsApprovedByHRBP = true;
    }
    if (queryParams.status) {
        filters.Status = queryParams.status;
    }
    if (queryParams.departmentId) {
        filters.DepartmentId = queryParams.departmentId;
    }
    if (queryParams.search) {
        filters.JobCode = { $regex: queryParams.search.trim(), $options: 'i' };
    }
    const page = parseInt(queryParams.page, 10) || 1;
    const limit = parseInt(queryParams.limit, 10) || 10;
    const sortBy = queryParams.sortBy || 'CreatedOn';
    const orderBy = queryParams.orderBy === 'asc' ? 1 : -1;
    const sortOptions = { [sortBy]: orderBy };
    const { results, total } = await peopleRequisitionQueries.findAllPeopleRequisition(filters, sortOptions, page, limit);
    return {
        data: results,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    };
};

/**
 * @description Uploads a Job Description file for a specific PR.
 * @param {string} prId - The ID of the PR.
 * @param {object} file - The uploaded file object from multer.
 * @param {object} user - The user object of the person uploading the file.
 * @returns {Promise<void>}
 * @throws {AppError} Throws an error if the user is not an authorized recruiter or if the PR is not found.
 */
const uploadJobDescription = async (prId, file, user) => {
    if (!file) {
        throw new AppError('No file was uploaded.', 400);
    }
    if (user.RoleId.Role !== 'Recruiter') {
        if (file) {
            fs.unlinkSync(file.path);
        }
        logger.warn(`Non-recruiter user ${user.RHubUserId} attempted to upload a JD for PR ID ${prId}.`);
        throw new AppError('You do not have permission to perform this action.', 403);
    }
    const pr = await peopleRequisitionQueries.findById(prId);
    if (!pr) {
        fs.unlinkSync(file.path);
        throw new AppError('People Requisition not found.', 404);
    }
    if (!pr || pr.IsDelete) {
        fs.unlinkSync(file.path);
        throw new AppError('People Requisition not found or has been deleted.', 404);
    }
    if (pr.JdFilePath) {
        try {
            if (fs.existsSync(pr.JdFilePath)) {
                fs.unlinkSync(pr.JdFilePath);
                logger.info(`Old JD file ${pr.JdFilePath} deleted for PR ${pr.JobCode}.`);
            }
        } catch (err) {
            logger.error(`Failed to delete old JD file for PR ${pr.JobCode}: ${err.message}`);
        }
    }
    pr.JdFileName = file.originalname;
    pr.JdFilePath = file.path;
    pr.JdUploadedOn = Date.now();
    pr.ModifiedBy = user.RHubUserId;
    pr.ModifiedOn = Date.now();
    await pr.save();

    logger.info(`JD file uploaded for PR ${pr.JobCode} by user ${user.RHubUserId}.`);
    const populatedPR = await peopleRequisitionQueries.findByIdAndPopulateDetails(prId);
    if (populatedPR) {
        const emailData = {
            hrbpName: populatedPR.HRBPId.Name,
            positionName: populatedPR.JobId.JobPosition,
            jobCode: populatedPR.JobCode,
            uploaderName: user.RHubUserId,
        };

        await emailService.sendEmail(
            populatedPR.HRBPId.Email,
            `Job Description Uploaded for ${populatedPR.JobId.JobPosition} (${populatedPR.JobCode})`,
            'jdUploadedEmail',
            emailData
        );
    }
};

/**
 * @description Retrieves the file path and name for a JD download.
 * @param {string} prId - The ID of the PR.
 * @param {object} user - The user object of the person requesting the download.
 * @returns {Promise<object>} An object containing the filePath and fileName.
 * @throws {AppError} Throws an error if the file is not found or the user is not authorized.
 */
const downloadJobDescription = async (prId, user) => {
    const pr = await peopleRequisitionQueries.findById(prId);
    if (!pr || pr.IsDelete || !pr.JdFilePath) {
        throw new AppError('Job description not found for this requisition.', 404);
    }
    const isAssignedHrbp = pr.HRBPId.toString() === user.id;
    const isAssignedRecruiter = pr.RecruiterId.toString() === user.id;
    if (!isAssignedHrbp && !isAssignedRecruiter) {
        throw new AppError('You do not have permission to download this file.', 403);
    }
    return { filePath: pr.JdFilePath, fileName: pr.JdFileName };
};

export const peopleRequisitionService = {
    createPeopleRequisition,
    approvePeopleRequisition,
    updatePeopleRequisition,
    deletePeopleRequisition,
    updatePeopleRequisitionStatus,
    getPeopleRequisitionById,
    getAllPeopleRequisitions,
    uploadJobDescription,
    downloadJobDescription,
};

