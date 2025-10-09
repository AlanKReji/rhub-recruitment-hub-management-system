import mongoose from "mongoose";
import logger from "./logger.mjs"; 

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URL);
    logger.info(`Database connected: ${conn.connection.host}`);
  } catch (error) {
    logger.error(`Database connection error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;