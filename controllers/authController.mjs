import { authService } from '../services/authService.mjs';
// @desc    Auth user & get tokens
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    res.status(200).json({
      message: 'Login successful',
      data: result
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message || 'Server error' });
  }
};

// @desc    Send password reset link to user's email
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        await authService.forgotPassword(email);
        res.status(200).json({ message: 'If a user with that email exists, a password reset link has been sent.' });
    } catch (error) {
        res.status(error.statusCode || 500).json({ message: error.message || 'Server error' });
    }
};

// @desc    Reset user password using reset token
// @route   POST /api/auth/reset-password/:token
// @access  Public
const resetPassword = async (req, res) => {
    try {
        const { token } = req.params;
        const { password, confirmPassword } = req.body;
        if (password !== confirmPassword) {
            return res.status(400).json({ message: 'Passwords do not match.' });
        }
        await authService.resetPassword(token, password);
        res.status(200).json({ message: 'Password has been reset successfully.' });
    } catch (error) {
        res.status(error.statusCode || 500).json({ message: error.message || 'Server error' });
    }
};

// @desc    Refresh access token using refresh token
// @route   POST /api/auth/refresh-token
// @access  Public
const refreshToken = async (req, res, next) => {
    try {
        const { refreshToken } = req.body;
        const result = await authService.refreshToken(refreshToken);
        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
};

// @desc    Log out the current user
// @route   POST /api/auth/logout
// @access  Private
const logoutUser = (req, res) => {
    res.status(200).json({ message: 'Logged out successfully' });
};
export const authController = { 
    loginUser, 
    forgotPassword, 
    resetPassword, 
    refreshToken, 
    logoutUser
};