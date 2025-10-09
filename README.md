<div align="center">
  <h1>🚀 RHub - Recruitment Hub Management System</h1>
  <p><strong>A robust Node.js/Express backend for streamlined recruitment workflows</strong></p>
  <p>
    <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js">
    <img src="https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express.js">
    <img src="https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB">
    <img src="https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white" alt="JWT">
  </p>
</div>

---

## ✨ Features

<table>
  <tr>
    <td>📋 <strong>People Requisitions Management</strong></td>
    <td>Manage job requisitions with detailed job and department information</td>
  </tr>
  <tr>
    <td>🔐 <strong>Role-Based Access Control</strong></td>
    <td>Secure workflows for HRBP and Recruiters with approval processes</td>
  </tr>
  <tr>
    <td>📧 <strong>Email Notifications</strong></td>
    <td>Automated emails for job description uploads, approvals, and updates</td>
  </tr>
  <tr>
    <td>📁 <strong>Document Management</strong></td>
    <td>Upload and download job descriptions with secure file handling</td>
  </tr>
  <tr>
    <td>🔒 <strong>Authentication & Authorization</strong></td>
    <td>JWT-based secure authentication and role-based permissions</td>
  </tr>
  <tr>
    <td>📚 <strong>API Documentation</strong></td>
    <td>Comprehensive Swagger UI documentation for all endpoints</td>
  </tr>
  <tr>
    <td>🔍 <strong>Advanced Querying</strong></td>
    <td>Pagination, filtering, and sorting for efficient data retrieval</td>
  </tr>
</table>

## 🛠️ Tech Stack

<div align="center">
  <table>
    <tr>
      <th>Backend</th>
      <th>Database</th>
      <th>Authentication</th>
      <th>Other</th>
    </tr>
    <tr>
      <td>
        <img src="https://img.shields.io/badge/Node.js-339933?style=flat&logo=nodedotjs&logoColor=white"><br>
        <img src="https://img.shields.io/badge/Express.js-000000?style=flat&logo=express&logoColor=white">
      </td>
      <td>
        <img src="https://img.shields.io/badge/MongoDB-47A248?style=flat&logo=mongodb&logoColor=white"><br>
        <img src="https://img.shields.io/badge/Mongoose-880000?style=flat&logo=mongoose&logoColor=white">
      </td>
      <td>
        <img src="https://img.shields.io/badge/JWT-000000?style=flat&logo=jsonwebtokens&logoColor=white"><br>
        <img src="https://img.shields.io/badge/bcrypt-000000?style=flat&logo=bcrypt&logoColor=white">
      </td>
      <td>
        <img src="https://img.shields.io/badge/Multer-FF6B35?style=flat&logo=multer&logoColor=white"><br>
        <img src="https://img.shields.io/badge/Nodemailer-339933?style=flat&logo=nodemailer&logoColor=white"><br>
        <img src="https://img.shields.io/badge/Swagger-85EA2D?style=flat&logo=swagger&logoColor=black"><br>
        <img src="https://img.shields.io/badge/Winston-000000?style=flat&logo=winston&logoColor=white">
      </td>
    </tr>
  </table>
</div>

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd RHub-Recruitment-Hub-Management-System
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   - Create a `.env` file in the root directory
   - Configure environment variables:
     ```
     PORT=5000
     MONGO_URI=your_mongodb_connection_string
     JWT_SECRET=your_jwt_secret
     EMAIL_USER=your_email@example.com
     EMAIL_PASS=your_email_password
     ```

4. **Start the server**
   ```bash
   npm start
   ```

5. **Access the application**
   - API Base URL: `http://localhost:5000`
   - API Documentation: `http://localhost:5000/api-docs`

## 📁 Project Structure

```
RHub-Recruitment-Hub-Management-System/
├── config/           # Database, logger, and mailer configurations
├── controllers/      # Route handlers and business logic
├── dbqueries/        # Database query abstractions
├── emailTemplates/   # Email notification templates
├── middlewares/      # Authentication, error handling, and upload middlewares
├── models/           # Mongoose data models
├── routes/           # Express route definitions
├── services/         # Business logic services
├── seeder/           # Database seeding scripts
├── utils/            # Utility functions and helpers
├── validators/       # Input validation logic
├── server.mjs        # Main application entry point
└── package.json      # Project dependencies and scripts
```

## 🤝 Contributing

We welcome contributions! Here's how you can help:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

---

<div align="center">
  <p>Made with ❤️ by the RHub Team</p>
</div>
