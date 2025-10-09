import logger from '../config/logger.mjs';
const errorHandler = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';
    logger.error(`${err.statusCode} - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`, {
        stack: err.stack,
    });
    res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
    });
};
export { errorHandler };