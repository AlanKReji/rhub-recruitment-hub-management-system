import jwt from 'jsonwebtoken';
import User from '../models/userModel.mjs';
import { AppError } from '../utils/appError.mjs';

const protect = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    if (!token) {
      return next(
        new AppError('You are not logged in! Please log in to get access.', 401)
      );
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const currentUser = await User.findById(decoded.userId).populate('RoleId', 'Role');
    if (!currentUser) {
      return next(
        new AppError(
          'The user belonging to this token does no longer exist.',
          401
        )
      );
    }
    req.user = currentUser;
    req.tokenPayload = decoded; 
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
       return next(new AppError('Your session is invalid or has expired. Please log in again.', 401));
    }
    next(error);
  }
};

const hrbpOnly = (req, res, next) => {
  if (req.tokenPayload && req.tokenPayload.role === 'HRBP') {
    return next();
  }  
  next(new AppError('You do not have permission to perform this action.', 403));
};

export { protect, hrbpOnly };