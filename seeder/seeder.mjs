
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import logger from '../config/logger.mjs';
import User from '../models/userModel.mjs';
import Role from '../models/roleModel.mjs';
import Department from '../models/departmentModel.mjs';
import JobPosition from '../models/jobPositionModel.mjs';
import connectDB from '../config/rhubdb.mjs';
import PrefixCounter from '../models/prefixCounterModel.mjs';
import NatureOfEmployment from '../models/natureOfEmploymentModel.mjs';

dotenv.config();

connectDB();

const importData = async () => {
  try {
    await Role.collection.drop().catch(() => logger.warn('Role collection did not exist.'));
    await Department.collection.drop().catch(() => logger.warn('Department collection did not exist.'));
    await PrefixCounter.collection.drop().catch(() => logger.warn('Prefix Counter collection did not exist.'));
    await User.collection.drop().catch(() => logger.warn('User collection did not exist.'));
    await User.collection.drop().catch(() => logger.warn('User collection did not exist.'));
    await JobPosition.collection.drop().catch(() => logger.warn('JobPosition collection did not exist.'));
    logger.info('Collections dropped.');

    const roles = await Role.insertMany([
      { Role: 'HRBP' },
      { Role: 'Recruiter' },
      { Role: 'Interview Panel' },
    ]);
    logger.info('Roles imported.');

    const departments = await Department.insertMany([
      { Department: 'Engineering' },
      { Department: 'Human Resources' },
      { Department: 'Marketing' },
    ]);
    logger.info('Departments imported.');

    const hrbpUser = {
      RHubUserId: 'RHUB-001',
      Name: 'Chandran',
      Email: 'leedons9585@gmail.com',
      Password: 'Password@123!',
      RoleId: roles.find((r) => r.Role === 'HRBP')._id,
      DepartmentId: departments.find((d) => d.Department === 'Human Resources')._id,
      CreatedBy: 'SYSTEM',
    };
    await PrefixCounter.create([
      { prefix: 'RHUB-' ,
       count: 1 },
    ]);
    logger.info('Prefix Counter imported.');
    await JobPosition.insertMany([
        { JobPosition: 'Senior Software Engineer' },
        { JobPosition: 'Junior Software Engineer' },
        { JobPosition: 'Associate HRBP' },
        { JobPosition: 'Technical Recruiter' },
        { JobPosition: 'Quality Assurance Engineer' },
    ]);
    logger.info('Job Positions imported.');

    await NatureOfEmployment.insertMany([
        { NatureOfEmployment: 'Full-Time' },
        { NatureOfEmployment: 'Part-Time' },
        { NatureOfEmployment: 'Contract' },
        { NatureOfEmployment: 'Internship' },
    ]);
    logger.info('Nature of Employment imported.');

    await User.create(hrbpUser);

    logger.info('Users imported successfully.');
    logger.info('Data Imported Successfully!');
    process.exit();
  } catch (error) {
    logger.error(`Error with data import: ${error.message}`);
    process.exit(1);
  }
};
const destroyData = async () => {
    try {
      await Role.collection.drop().catch(() => {});
      await Department.collection.drop().catch(() => {});
      await PrefixCounter.collection.drop().catch(() => {});
      await User.collection.drop().catch(() => {});
  
      logger.info('Data Destroyed Successfully!');
      process.exit();
    } catch (error) {
      logger.error(`Error with data destruction: ${error.message}`);
      process.exit(1);
    }
  };
if (process.argv[2] === '-d') {
  destroyData();
} else {
  importData();
}