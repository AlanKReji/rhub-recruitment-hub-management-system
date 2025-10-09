import express from 'express';
const router = express.Router();
import { peopleRequisitionController } from '../controllers/peopleRequisitionController.mjs';
import { protect, hrbpOnly } from '../middlewares/authMiddleware.mjs';
import { upload } from '../middlewares/uploadMiddleware.mjs';

/**
 * @swagger
 * tags:
 *   - name: People Requisitions
 *     description: Manage job requisitions
 */

/**
 * @swagger
 * /api/people-requisitions:
 *   post:
 *     summary: Create a new People Requisition (HRBP only)
 *     tags: [People Requisitions]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - jobId
 *               - departmentId
 *               - recruiterId
 *               - natureOfEmploymentId
 *             properties:
 *               jobId:
 *                 type: string
 *                 description: The ID of the Job Position.
 *               departmentId:
 *                 type: string
 *                 description: The ID of the Department.
 *               recruiterId:
 *                 type: string
 *                 description: The ID of the assigned Recruiter.
 *               natureOfEmploymentId:
 *                 type: string
 *                 description: The ID of the Nature of Employment.
 *               jobDescription:
 *                 type: string
 *                 description: Description of the job role.
 *               PRFNumber:
 *                 type: string
 *                 description: PRF reference number.
 *               PRFLink:
 *                 type: string
 *                 description: Link to the PRF document.
 *               closingDate:
 *                 type: string
 *                 format: date
 *                 description: Application closing date.
 *     responses:
 *       '201':
 *         description: People Requisition created successfully.
 *       '400':
 *         description: One or more provided fields are invalid.
 *       '401':
 *         description: Not authorized (invalid/missing token).
 *       '403':
 *         description: Forbidden (user is not an HRBP).
 */

// Route definition
router.post('/', protect, hrbpOnly, peopleRequisitionController.createPeopleRequisition);

/**
 * @swagger
 * /api/people-requisitions/{id}/approve:
 *   put:
 *     summary: Approve a People Requisition (HRBP only)
 *     tags:
 *       - People Requisitions
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the People Requisition to approve.
 *     responses:
 *       '200':
 *         description: Successfully approved and notification sent.
 *       '404':
 *         description: People Requisition not found.
 *       '409':
 *         description: The requisition is already approved or has been deleted.
 */
router.put('/:id/approve', protect, hrbpOnly, peopleRequisitionController.approvePeopleRequisition);

/**
 * @swagger
 * /api/people-requisitions/{id}:
 *   put:
 *     summary: Update the core details of a PR (HRBP or Recruiter)
 *     description: >
 *       This endpoint is for editing core details like PRF Number, assigned recruiter, department, Job description.  
 *       The PR must be in 'open' or 'onhold' status.  
 *       To change the status, use the PATCH `/api/people-requisitions/{id}/status` endpoint.
 *     tags:
 *       - People Requisitions
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the People Requisition to update.
 *     requestBody:
 *       description: Provide the fields to update. Fields vary based on user role. Status field will be ignored.
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               PRFNumber:
 *                 type: string
 *               PRFLink:
 *                 type: string
 *               RecruiterId:
 *                 type: string
 *               DepartmentId:
 *                 type: string
 *               NatureOfEmploymentId:
 *                 type: string
 *               JobDescription:
 *                 type: string
 *     responses:
 *       '200':
 *         description: Successfully updated.
 *       '403':
 *         description: User is not authorized to edit this PR.
 *       '404':
 *         description: People Requisition not found.
 *       '409':
 *         description: The requisition is locked for editing due to its status.
 */
router.put('/:id', protect, peopleRequisitionController.updatePeopleRequisition);

/**
 * @swagger
 * /api/people-requisitions/{id}:
 *   delete:
 *     summary: Soft-delete a People Requisition (HRBP only)
 *     description: > 
 *       It can only be performed on a PR with an 'open' status.
 *     tags:
 *       - People Requisitions
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the People Requisition to delete.
 *     responses:
 *       '200':
 *         description: People Requisition deleted successfully.
 *       '404':
 *         description: People Requisition not found.
 *       '409':
 *         description: The requisition is not in an 'open' state or has already been deleted.
 */
router.delete('/:id', protect, hrbpOnly, peopleRequisitionController.deletePeopleRequisition);

/**
 * @swagger
 * /api/people-requisitions/{id}/status:
 *   patch:
 *     summary: Update the status of a People Requisition
 *     tags:
 *       - People Requisitions
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the People Requisition.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [open, inprogress, onhold, completed, closed]
 *     responses:
 *       '200':
 *         description: Status updated successfully.
 *       '400':
 *         description: Invalid status transition for the user's role.
 *       '403':
 *         description: User is not authorized to update this PR.
 *       '404':
 *         description: People Requisition not found.
 */
router.patch('/:id/status', protect, peopleRequisitionController.updatePeopleRequisitionStatus);

/**
 * @swagger
 * /api/people-requisitions/{id}:
 *   get:
 *     summary: Get details of a single People Requisition
 *     description: Retrieves a single PR. Access is restricted to the assigned HRBP and Recruiter.
 *     tags:
 *       - People Requisitions
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the People Requisition to retrieve.
 *     responses:
 *       '200':
 *         description: Successfully retrieved the People Requisition.
 *       '403':
 *         description: User is not authorized to view this PR.
 *       '404':
 *         description: People Requisition not found.
 */
router.get('/:id', protect, peopleRequisitionController.getPeopleRequisitionById);

/**
 * @swagger
 * /api/people-requisitions:
 *   get:
 *     summary: Get a list of People Requisitions
 *     description: Retrieves a paginated list of PRs. HRBPs see all PRs, while Recruiters only see PRs assigned to them. Soft-deleted records are always excluded.
 *     tags:
 *       - People Requisitions
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: The page number for pagination.
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: The number of items to return per page.
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           default: CreatedOn
 *         description: The field to sort the results by.
 *       - in: query
 *         name: orderBy
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: The order to sort the results in (ascending or descending).
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [open, inprogress, onhold, completed, closed]
 *         description: Filter the results by status.
 *       - in: query
 *         name: departmentId
 *         schema:
 *           type: string
 *         description: Filter the results by a specific Department ID.
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Provide a search term to filter by JobCode (case-insensitive).
 *     responses:
 *       '200':
 *         description: A list of People Requisitions with pagination details.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     total:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *       '401':
 *         description: Not authorized (invalid/missing token).
 */
router.get('/', protect, peopleRequisitionController.getAllPeopleRequisitions);

/**
 * @swagger
 * /api/people-requisitions/{id}/upload-jd:
 *   post:
 *     summary: Upload a Job Description for a PR
 *     tags:
 *       - People Requisitions
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the People Requisition.
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               jobDescription:
 *                 type: string
 *                 format: binary
 *                 description: The JD file (.pdf, .doc, .docx).
 *     responses:
 *       '200':
 *         description: File uploaded successfully.
 */
router.post('/:id/upload-jd', protect, upload.single('jobDescription'), peopleRequisitionController.uploadJobDescription);

/**
 * @swagger
 * /api/people-requisitions/{id}/download-jd:
 *   get:
 *     summary: Download the Job Description for a PR
 *     tags:
 *       - People Requisitions
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the People Requisition.
 *     responses:
 *       '200':
 *         description: File download initiated.
 *       '403':
 *         description: User is not authorized to download this file.
 *       '404':
 *         description: Job description not found.
 */
router.get('/:id/download-jd', protect, peopleRequisitionController.downloadJobDescription);

export default router;