import { peopleRequisitionService } from "../services/peopleRequisitionService.mjs"; 
import logger from '../config/logger.mjs';
import { natureOfEmploymentController } from "./natureOfEmploymentController.mjs";
import PeopleRequisition from "../models/peopleRequisitionModel.mjs";

// @desc    Add a new people requisitions
// @route   POST /api/people-requisitions
// @access  Private/HRBP
const createPeopleRequisition = async (req, res, next) => {
    try {
        const prData = req.body;
        console.log(prData)
        const creatingUser = req.user; 
        console.log("reached here")
        const newPR = await peopleRequisitionService.createPeopleRequisition(prData,creatingUser);
        console.log("reached here2")
        res.status(201).json({
            message: 'People Requisition created successfully.',
            data: newPR,
        });
    }
    catch (error) {
        next(error);
    }
};

// @desc    Approve a people requisitions by HRBP
// @route   POST /api/people-requisitions/:id/approve
// @access  Private/HRBP
const approvePeopleRequisition = async (req, res, next) => {
    try {
        const { id } = req.params;
        const approvingUser = req.user;

        const approvedPR = await peopleRequisitionService.approvePeopleRequisition(id, approvingUser);

        res.status(200).json({
            status: 'success',
            message: 'People Requisition approved successfully. Notification sent to recruiter.',
            data: approvedPR,
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update a people requisition
// @route   PUT /api/people-requisitions/:id
// @access  Private/HRBP or Private/Recruiter
const updatePeopleRequisition = async (req, res, next) => {
    try {
        const { id } = req.params;
        const updateData = req.body;
        const updatingUser = req.user;

        const updatedPR = await peopleRequisitionService.updatePeopleRequisition(id, updateData, updatingUser);

        res.status(200).json({
            status: 'success',
            message: 'People Requisition updated successfully.',
            data: updatedPR,
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete a people requisition
// @route   DELETE /api/people-requisitions/:id
// @access  Private/HRBP
const deletePeopleRequisition = async (req, res, next) => {
    try {
        const { id } = req.params;
        const deletingUser = req.user;

        await peopleRequisitionService.deletePeopleRequisition(id, deletingUser);

        res.status(200).json({
            status: 'success',
            message: 'People Requisition deleted successfully.',
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update the status of a people requisition
// @route   PATCH /api/people-requisitions/:id/status
// @access  Private/HRBP or Private/Recruiter
const updatePeopleRequisitionStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const updatingUser = req.user;

        if (!status) {
            return res.status(400).json({ message: 'Status is a required field.' });
        }

        const updatedPR = await peopleRequisitionService.updatePeopleRequisitionStatus(id, status, updatingUser);

        res.status(200).json({
            status: 'success',
            message: `People Requisition status updated to ${status}.`,
            data: updatedPR,
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get a specific people requisition
// @route   GET /api/people-requisitions/:id
// @access  Private/HRBP or Private/Recruiter
const getPeopleRequisitionById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const requestingUser = req.user;
        const pr = await peopleRequisitionService.getPeopleRequisitionById(id, requestingUser);
        res.status(200).json({
            status: 'success',
            data: pr,
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get all people requisitions
// @route   GET /api/people-requisitions
// @access  Private/HRBP or Private/Recruiter
const getAllPeopleRequisitions = async (req, res, next) => {
    try {
        const queryParams = req.query;
        const requestingUser = req.user;
        const result = await peopleRequisitionService.getAllPeopleRequisitions(queryParams, requestingUser);
        res.status(200).json({
            status: 'success',
            ...result,
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Upload a job description for a people requisition
// @route   POST /api/people-requisitions/:id/upload-jd
// @access  Private/Recruiter
const uploadJobDescription = async (req, res, next) => {
    try {
        const { id } = req.params;
        const file = req.file;
        const user = req.user;
        await peopleRequisitionService.uploadJobDescription(id, file, user);
        res.status(200).json({
            status: 'success',
            message: 'Job description uploaded successfully.',
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Download a job description for a people requisition
// @route   GET /api/people-requisitions/:id/download-jd
// @access  Private/HRBP or Private/Recruiter
const downloadJobDescription = async (req, res, next) => {
    try {
        const { id } = req.params;
        const user = req.user;
        const { filePath, fileName } = await peopleRequisitionService.downloadJobDescription(id, user);
        res.download(filePath, fileName);
    } catch (error) {
        next(error);
    }
};

export const peopleRequisitionController = {
    createPeopleRequisition,
    approvePeopleRequisition, 
    updatePeopleRequisition, 
    deletePeopleRequisition, 
    updatePeopleRequisitionStatus, 
    getPeopleRequisitionById, 
    getAllPeopleRequisitions, 
    uploadJobDescription, 
    downloadJobDescription
}