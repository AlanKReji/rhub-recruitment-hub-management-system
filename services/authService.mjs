import bcrypt from 'bcrypt';
import generateTokens from '../utils/generateToken.mjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { AppError } from '../utils/appError.mjs';
import { userQueries } from '../dbqueries/userQueries.mjs';
import { emailService } from './emailService.mjs';
import { isPasswordComplex } from '../validators/passwordValidator.mjs';
import logger from '../config/logger.mjs';
/**
 * @description Authenticates a user and returns tokens and user data.
 * @param {string} email - The user's email.
 * @param {string} password - The user's plain text password.
 * @returns {Promise<object>} An object containing accessToken, refreshToken, and user details.
 * @throws {AppError} Throws an error for invalid credentials or inactive user.
 */
const login = async (email, password) => {
  const user = await userQueries.findByEmail(email);
  if (!user) {
    throw new AppError('Invalid email or password', 401);
  }

  const isMatch = await bcrypt.compare(password, user.Password);
  if (!isMatch) {
    throw new AppError('Invalid email or password', 401);
  }

  if (!user.IsActive || user.IsDelete) {
    logger.info(`${user.id} tried to login, the account is deleted or inactive`)
    throw new AppError('Invalid email or password.', 401);
  }

  const { accessToken, refreshToken } = generateTokens(user._id, user.RoleId.Role);

  return {
    accessToken,
    refreshToken,
    user: {
      name: user.Name,
      email: user.Email,
      role: user.RoleId.Role,
    },
  };
};

/**
 * @description Generates a password reset token and sends it to the user's email.
 * @param {string} email - The user's email address.
 * @returns {Promise<void>}
 */
const forgotPassword = async (email) => {
  const user = await userQueries.findByEmail(email);
  
  if (user.IsDelete){
    logger.info(`${user.id} this users account is deleted but tried to use resetpassword`)
  }
  if (!user || user.IsDelete) {
    console.log("no user exist for that mail")
    return;
  } 
  const resetToken = crypto.randomBytes(20).toString('hex');
  user.resetPasswordToken = resetToken;
  user.resetPasswordExpires = Date.now() + 10 * 60 * 1000;
  await userQueries.save(user);
  const resetUrl = `http://localhost:3000/reset-password/${resetToken}`;

    await emailService.sendEmail(
        user.Email,
        'RHub Password Reset Request',
        'passwordResetEmail',
        { resetUrl: resetUrl }
    );
};

/**
 * @description Resets a user's password using a valid token.
 * @param {string} token - The password reset token from the email link.
 * @param {string} password - The new password.
 * @returns {Promise<void>}
 * @throws {AppError} Throws an error if the password is not complex, or if the token is invalid/expired.
 */
const resetPassword = async (token, password) => {
    if (!isPasswordComplex(password)) {
    throw new AppError(
      'Password must be at least 8 characters long and contain an uppercase letter, a lowercase letter, a number, and a special character (@#$%&*).',
      400
    );
    }
    const user = await userQueries.findByResetToken(token);
    if (!user) {
    throw new AppError('Password reset token is invalid or has expired.', 400);
    }
    user.Password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await userQueries.save(user);
};

/**
 * @description Generates a new access token from a valid refresh token.
 * @param {string} token - The refresh token from the request body.
 * @returns {Promise<object>} An object containing the new accessToken.
 * @throws {AppError} Throws an error if the token is missing, invalid, or expired.
 */
const refreshToken = async (token) => {
    if (!token) {
        throw new AppError('Refresh token is required.', 401);
        }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await userQueries.findUserById(decoded.userId);
        if (!user || user.IsDelete) {
            logger.info(`${user.id} access token request came from this user but the account is deleted`)
            throw new AppError('User belonging to this token no longer exists.', 401);
        }
        const newAccessToken = jwt.sign(
            { userId: user._id, role: user.RoleId.Role },
            process.env.JWT_SECRET,
            { expiresIn: '15m' }
          );
        return { accessToken: newAccessToken };
    } catch (error) {
        throw new AppError(error, 403);
    }
};

export const authService = {
  login,
  forgotPassword,
  resetPassword,
  refreshToken,
};

