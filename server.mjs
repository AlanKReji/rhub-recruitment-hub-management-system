import express from 'express';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import swaggerJSDoc from 'swagger-jsdoc';
import connectDB from './config/rhubdb.mjs';
import logger from './config/logger.mjs';
import authRoutes from './routes/authRoutes.mjs';
import departmentRoutes from './routes/departmentRoutes.mjs';
import userRoutes from './routes/userRoutes.mjs';
import peopleRequisitionRoutes from './routes/peopleRequisitionRoutes.mjs';
import natureOfEmploymentRoutes from './routes/natureOfEmploymentRoutes.mjs';
import roleRoutes from './routes/roleRoutes.mjs';
import jobPositionRoutes from './routes/jobPositionRoutes.mjs';
import { errorHandler } from './middlewares/errorMiddleware.mjs';

dotenv.config();
const port = process.env.PORT || 5000;
connectDB();
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'RHub API',
    version: '1.0.0',
    description: 'API documentation for the RHub application.'
  },
  servers: [{ url: `http://localhost:${port}` }],
  components: {
    securitySchemes: {
      BearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT'
      }
    }
  },
  security: [
    {
      BearerAuth: []
    }
  ]
};
const swaggerSpec = swaggerJSDoc({
  swaggerDefinition,
  apis: ['./routes/*.mjs']
});
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get('/', (req, res) => {
  res.send('API is running...');
});
app.use('/api/auth', authRoutes);
app.use('/api/master/departments', departmentRoutes);
app.use('/api/master/nature-of-employments', natureOfEmploymentRoutes);
app.use('/api/master/roles', roleRoutes);
app.use('/api/master/job-positions', jobPositionRoutes);
app.use('/api/users', userRoutes);
app.use('/api/people-requisitions', peopleRequisitionRoutes);
app.use(errorHandler);

app.listen(port, () => logger.info(`Server running on port ${port}`));