import express from 'express';
import { departmentController } from '../controllers/departmentController.mjs';
import { protect, hrbpOnly } from '../middlewares/authMiddleware.mjs';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Departments
 *     description: API for managing master departments
 */

router.route('/')
  /**
   * @swagger
   * /api/master/departments:
   *   get:
   *     summary: Get a paginated list of departments with optional search
   *     tags: [Departments]
   *     security:
   *       - BearerAuth: []
   *     parameters:
   *       - in: query
   *         name: search
   *         schema:
   *           type: string
   *         description: Search for departments by name.
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
   *         description: A paginated list of departments.
   *       401:
   *         description: Unauthorized
   */
  .get(protect, hrbpOnly, departmentController.getDepartments)

  /**
   * @swagger
   * /api/master/departments:
   *   post:
   *     summary: Add a new department
   *     tags: [Departments]
   *     security:
   *       - BearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               Department:
   *                 type: string
   *                 example: "Quality Assurance"
   *     responses:
   *       201:
   *         description: Department created
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Forbidden
   *       409:
   *         description: Conflict - department already exists
   */
  .post(protect, hrbpOnly, departmentController.addDepartment);

router.route('/:id')
  /**
   * @swagger
   * /api/master/departments/{id}:
   *   get:
   *     summary: Get a department by ID
   *     tags:
   *       - Departments
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: The ID of the department to retrieve.
   *     responses:
   *       200:
   *         description: Department details.
   *       404:
   *         description: Department not found.
   */
  .get(protect, hrbpOnly, departmentController.getDepartment)

  /**
   * @swagger
   * /api/master/departments/{id}:
   *   put:
   *     summary: Update a department
   *     tags: [Departments]
   *     security:
   *       - BearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Department ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               Department:
   *                 type: string
   *                 example: "Quality Assurance & Testing"
   *     responses:
   *       200:
   *         description: Department updated
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Forbidden
   *       404:
   *         description: Department not found
   *       409:
   *         description: Cannot update - department in use
   */
  .put(protect, hrbpOnly, departmentController.updateDepartment)

  /**
   * @swagger
   * /api/master/departments/{id}:
   *   delete:
   *     summary: Soft delete a department
   *     tags: [Departments]
   *     security:
   *       - BearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Department ID
   *     responses:
   *       200:
   *         description: Department deleted
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Forbidden
   *       404:
   *         description: Department not found
   *       409:
   *         description: Cannot delete - department in use
   */
  .delete(protect, hrbpOnly, departmentController.deleteDepartment);


export default router;
