import express from 'express';
const router = express.Router();
import { userController } from '../controllers/userController.mjs';
import { protect } from '../middlewares/authMiddleware.mjs';
import { hrbpOnly } from '../middlewares/authMiddleware.mjs';

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management and actions
 */

/**
 * @swagger
 * /api/users/change-password:
 *   put:
 *     summary: Change password for a logged-in user
 *     tags:
 *       - Users
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *               - confirmPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *                 example: Password123!
 *               newPassword:
 *                 type: string
 *                 example: NewSecurePassword456!
 *               confirmPassword:
 *                 type: string
 *                 example: NewSecurePassword456!
 *     responses:
 *       '200':
 *         description: Password changed successfully.
 *       '400':
 *         description: New passwords do not match or the new password is not complex enough.
 *       '401':
 *         description: Not authorized (invalid/missing token) or incorrect current password.
 */
router.put('/change-password', protect, userController.changePassword);

router.route('/')
    /**
   * @swagger
   * /api/users:
   *   get:
   *     summary: Get a paginated list of users (view depends on role)
   *     tags: [Users]
   *     security:
   *       - BearerAuth: []
   *     parameters:
   *       - in: query
   *         name: search
   *         schema:
   *           type: string
   *         description: Search for users by name or email.
   *       - in: query
   *         name: role
   *         schema:
   *           type: string
   *         description: "(HRBP only) Filter users by role name."
   *       - in: query
   *         name: department
   *         schema:
   *           type: string
   *         description: "(Recruiter only) Filter users by department name."
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
   *       '200':
   *         description: A paginated list of users.
   *       '401':
   *         description: Unauthorized.
   *       '403':
   *         description: Forbidden.
   */
  .get(protect, userController.getUsers)

  /**
   * @swagger
   * /api/users:
   *   post:
   *     summary: Add a new user
   *     tags: [Users]
   *     security:
   *       - BearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               Name:
   *                 type: string
   *                 example: "Ashin Sunny"
   *               Email:
   *                 type: string
   *                 example: "leedons9585+1@gmail.com"
   *               DepartmentId:
   *                 type: string
   *                 example: "60d0fe4f5311236168a109ca"
   *               RoleId:
   *                 type: string
   *                 example: "60d0fe4f5311236168a109cb"
   *               JobPositionId:
   *                 type: string
   *                 example: "60d0fe4f5311236168a109cb"
   *     responses:
   *       201:
   *         description: User created
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Forbidden
   *       409:
   *         description: Conflict - user already exists
   */
  .post(protect, hrbpOnly, userController.addUser);

router.route('/:id')
  /**
   * @swagger
   * /api/users/{id}:
   *   get:
   *     summary: Get a user by ID
   *     tags: [Users]
   *     security:
   *       - BearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: The ID of the user to retrieve.
   *     responses:
   *       200:
   *         description: User details.
   *       404:
   *         description: User not found.
   */
  .get(protect, userController.getUser)

  /**
   * @swagger
   * /api/users/{id}:
   *   put:
   *     summary: Update a user
   *     tags: [Users]
   *     security:
   *       - BearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: User ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               Name:
   *                 type: string
   *                 example: "Ashin"
   *               Email:
   *                 type: string
   *                 example: "leedons9585+2@gmail.com"
   *               DepartmentId:
   *                 type: string
   *                 example: "60d0fe4f5311236168a109ca"
   *               RoleId:
   *                 type: string
   *                 example: "60d0fe4f5311236168a109cb"
   *               JobPositionId:
   *                 type: string
   *                 example: "60d0fe4f5311236168a109cb"
   *     responses:
   *       200:
   *         description: User updated
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Forbidden
   *       404:
   *         description: User not found
   *       409:
   *         description: Cannot update - user in use or email exists
   */
  .put(protect, hrbpOnly, userController.updateUser)

  /**
   * @swagger
   * /api/users/{id}:
   *   delete:
   *     summary: Soft delete a user
   *     tags: [Users]
   *     security:
   *       - BearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: User ID
   *     responses:
   *       200:
   *         description: User deleted
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Forbidden
   *       404:
   *         description: User not found
   *       409:
   *         description: Cannot delete - user in use
   */
  .delete(protect, hrbpOnly, userController.deleteUser);

export default router;