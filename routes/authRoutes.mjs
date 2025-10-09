import express from 'express';
const router = express.Router();
import { authController } from '../controllers/authController.mjs';
import { protect } from '../middlewares/authMiddleware.mjs';

/**
 * @swagger
 * tags:
 *   - name: Authentication
 *     description: User authentication and token management
 */

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Authenticate a user and receive tokens
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: leedons9585@gmail.com
 *               password:
 *                 type: string
 *                 example: Password@123!
 *     responses:
 *       '200':
 *         description: Successful authentication
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *                 refreshToken:
 *                   type: string
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *                 user:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                       example: Chandran
 *                     email:
 *                       type: string
 *                       example: hrbp@rhub.com
 *                     role:
 *                       type: string
 *                       example: HRBP
 *       '401':
 *         description: Invalid email or password
 *       '403':
 *         description: User account is inactive or deleted
 *       '500':
 *         description: Server error
 */

router.post('/login', authController.loginUser);

/**
 * @swagger
 * /api/auth/forgot-password:
 *   post:
 *     summary: Request a password reset email
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 example: leedons9585@gmail.com
 *     responses:
 *       '200':
 *         description: prevent email enumeration attacks.
 */
router.post('/forgot-password', authController.forgotPassword);

/**
 * @swagger
 * /api/auth/reset-password/{token}:
 *   post:
 *     summary: Reset password using a token
 *     tags:
 *       - Authentication
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: The password reset token from the email link.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - password
 *               - confirmPassword
 *             properties:
 *               password:
 *                 type: string
 *                 description: The user's new password.
 *                 example: NewSecurePassword123!
 *               confirmPassword:
 *                 type: string
 *                 description: Confirmation of the new password.
 *                 example: NewSecurePassword123!
 *     responses:
 *       '200':
 *         description: Password has been reset successfully.
 *       '400':
 *         description: Token is invalid, password complexity is not met, or passwords do not match.
 */
router.post('/reset-password/:token', authController.resetPassword );

/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     summary: Get a new access token using a refresh token
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *     responses:
 *       '200':
 *         description: Successfully generated a new access token.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *       '401':
 *         description: Refresh token is missing.
 *       '403':
 *         description: Refresh token is invalid or has expired.
 */
router.post('/refresh', authController.refreshToken);

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Log out the current user
 *     description: In a JWT-based system, this endpoint is used to formally log out. The client should delete its stored tokens upon receiving a successful response.
 *     tags:
 *       - Authentication
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       '200':
 *         description: Successfully logged out.
 *       '401':
 *         description: Not authorized (invalid/missing token).
 */
router.post('/logout', protect, authController.logoutUser);

export default router;