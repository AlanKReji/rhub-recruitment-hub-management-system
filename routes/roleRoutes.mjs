import express from 'express';
import { roleController } from '../controllers/roleController.mjs';
import { protect, hrbpOnly } from '../middlewares/authMiddleware.mjs';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Roles
 *     description: API for managing master roles
 */

router.route('/')
  /**
   * @swagger
   * /api/master/roles:
   *   get:
   *     summary: Get a paginated list of roles 
   *     tags: [Roles]
   *     security:
   *       - BearerAuth: []
   *     parameters:
   *       - in: query
   *         name: search
   *         schema:
   *           type: string
   *         description: Search for roles by name.
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
   *         description: A paginated list of roles.
   *       401:
   *         description: Unauthorized
   */
  .get(protect, hrbpOnly, roleController.getRoles)

  /**
   * @swagger
   * /api/master/roles:
   *   post:
   *     summary: Add a new role
   *     tags: [Roles]
   *     security:
   *       - BearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               Role:
   *                 type: string
   *                 example: "Human Resource Business Partner"
   *     responses:
   *       201:
   *         description: Role created
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Conflict - role already exists
   */
  .post(protect, hrbpOnly, roleController.addRole);

router.route('/:id')
  /**
   * @swagger
   * /api/master/roles/{id}:
   *   get:
   *     summary: Get a role by ID
   *     tags:
   *       - Roles
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: The ID of the role to retrieve.
   *     responses:
   *       200:
   *         description: Role details.
   *       404:
   *         description: Role not found.
   */
  .get(protect, hrbpOnly, roleController.getRole)

  /**
   * @swagger
   * /api/master/roles/{id}:
   *   put:
   *     summary: Update a role
   *     tags: [Roles]
   *     security:
   *       - BearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Role ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               Role:
   *                 type: string
   *                 example: "HRBP"
   *     responses:
   *       200:
   *         description: Role updated
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Conflict - role already exists
   *       404:
   *         description: Role not found
   *       409:
   *         description: Cannot update - role in use
   */
  .put(protect, hrbpOnly, roleController.updateRole)

  /**
   * @swagger
   * /api/master/roles/{id}:
   *   delete:
   *     summary: Delete a role
   *     tags: [Roles]
   *     security:
   *       - BearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Role ID
   *     responses:
   *       200:
   *         description: Role deleted
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Forbidden
   *       404:
   *         description: Role not found
   *       409:
   *         description: Cannot delete - role in use
   */
  .delete(protect, hrbpOnly, roleController.deleteRole);


export default router;
