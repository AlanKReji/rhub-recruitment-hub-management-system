import express from "express";
import {natureOfEmploymentController} from "../controllers/natureOfEmploymentController.mjs";
import { protect, hrbpOnly } from "../middlewares/authMiddleware.mjs";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Nature of Employments
 *     description: API for managing master nature of employments
 */

router
  .route("/")
  /**
   * @swagger
   * /api/master/nature-of-employments:
   *   get:
   *     summary: Get a paginated list of nature of employments with optional search
   *     tags: [Nature of Employments]
   *     security:
   *       - BearerAuth: []
   *     parameters:
   *       - in: query
   *         name: search
   *         schema:
   *           type: string
   *         description: Search for nature of employments by name.
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
   *         description: A paginated list of nature of employments.
   *       401:
   *         description: Unauthorized
   */
  .get(protect, hrbpOnly, natureOfEmploymentController.getNatureOfEmployments)

  /**
   * @swagger
   * /api/master/nature-of-employments:
   *   post:
   *     summary: Add a new nature of employment
   *     tags: [Nature of Employments]
   *     security:
   *       - BearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               NatureOfEmployment:
   *                 type: string
   *                 example: "Internship"
   *     responses:
   *       201:
   *         description: Nature of Employment created
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Forbidden
   *       409:
   *         description: Conflict - nature of employment already exists
   */
  .post(protect, hrbpOnly, natureOfEmploymentController.addNatureOfEmployment);

router
  .route("/:id")
  /**
   * @swagger
   * /api/master/nature-of-employments/{id}:
   *   get:
   *     summary: Get a nature of employment by ID
   *     tags:
   *       - Nature of Employments
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: The ID of the nature of employment to retrieve.
   *     responses:
   *       200:
   *         description: Nature of Employment details.
   *       404:
   *         description: Nature of Employment not found.
   */
  .get(protect, hrbpOnly, natureOfEmploymentController.getNatureOfEmployment)

  /**
   * @swagger
   * /api/master/nature-of-employments/{id}:
   *   put:
   *     summary: Update a nature of employment
   *     tags: [Nature of Employments]
   *     security:
   *       - BearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Nature of Employment ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               NatureOfEmployment:
   *                 type: string
   *                 example: "Intern"
   *     responses:
   *       200:
   *         description: Nature of Employment updated
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Forbidden
   *       404:
   *         description: Nature of Employment not found
   *       409:
   *         description: Cannot update - nature of employment in use
   */
  .put(protect, hrbpOnly, natureOfEmploymentController.updateNatureOfEmployment)

  /**
   * @swagger
   * /api/master/nature-of-employments/{id}:
   *   delete:
   *     summary: Soft delete a nature of employment
   *     tags: [Nature of Employments]
   *     security:
   *       - BearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Nature of Employment ID
   *     responses:
   *       200:
   *         description: Nature of Employment deleted
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Forbidden
   *       404:
   *         description: Nature of Employment not found
   *       409:
   *         description: Cannot delete - nature of employment in use
   */
  .delete(protect, hrbpOnly, natureOfEmploymentController.deleteNatureOfEmployment);

export default router;
