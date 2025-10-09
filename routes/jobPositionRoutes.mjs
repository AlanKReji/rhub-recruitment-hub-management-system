import express from 'express';
import { jobPositionController } from '../controllers/jobPositionController.mjs';
import { protect, hrbpOnly } from '../middlewares/authMiddleware.mjs';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Job Positions
 *     description: API for managing master job positions
 */

router.route('/')
  /**
   * @swagger
   * /api/master/job-positions:
   *   get:
   *     summary: Get a paginated list of job positions with optional search
   *     tags: [Job Positions]
   *     security:
   *       - BearerAuth: []
   *     parameters:
   *       - in: query
   *         name: search
   *         schema:
   *           type: string
   *         description: Search for job positions by name.
   *       - in: query
   *         name: page
   *         schema:
   *           type: integer
   *           default: 1
   *         description: Page Number.
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *           default: 10
   *         description: Limit per page.
   *     responses:
   *       200:
   *         description: A paginated list of job positions.
   *       401:
   *         description: Unauthorized
   */
  .get(protect, hrbpOnly, jobPositionController.getJobPositions)

  /**
   * @swagger
   * /api/master/job-positions:
   *   post:
   *     summary: Add a new job position
   *     tags: [Job Positions]
   *     security:
   *       - BearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               JobPosition:
   *                 type: string
   *                 example: "Software Engineer"
   *     responses:
   *       201:
   *         description: Job Position created
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Forbidden
   *       409:
   *         description: Conflict - job position already exists
   */
  .post(protect, hrbpOnly, jobPositionController.addJobPosition);

router.route('/:id')
  /**
   * @swagger
   * /api/master/job-positions/{id}:
   *   get:
   *     summary: Get a job position by ID
   *     tags:
   *       - Job Positions
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: The ID of the job position to retrieve.
   *     responses:
   *       200:
   *         description: Job Position details.
   *       404:
   *         description: Job Position not found.
   */
  .get(protect, hrbpOnly, jobPositionController.getJobPosition)

  /**
   * @swagger
   * /api/master/job-positions/{id}:
   *   put:
   *     summary: Update a job position
   *     tags: [Job Positions]
   *     security:
   *       - BearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Job Position ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               JobPosition:
   *                 type: string
   *                 example: "Senior Software Engineer"
   *     responses:
   *       200:
   *         description: Job Position updated
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Forbidden
   *       404:
   *         description: Job Position not found
   *       409:
   *         description: Cannot update - job position in use
   */
  .put(protect, hrbpOnly, jobPositionController.updateJobPosition)

  /**
   * @swagger
   * /api/master/job-positions/{id}:
   *   delete:
   *     summary: Delete a job position
   *     tags: [Job Positions]
   *     security:
   *       - BearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Job Position ID
   *     responses:
   *       200:
   *         description: Job Position deleted
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Forbidden
   *       404:
   *         description: Job Position not found
   *       409:
   *         description: Cannot delete - job position in use
   */
  .delete(protect, hrbpOnly, jobPositionController.deleteJobPosition);

export default router;
