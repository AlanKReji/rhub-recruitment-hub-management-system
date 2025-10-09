<div align="center">
  <h1>🚀 RHub - Recruitment Hub Management System</h1>
  <p><strong>The fast, robust Node.js/Express backbone for seamless recruitment 🧑‍💻</strong></p>
  <p>
    <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js">
    <img src="https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express.js">
    <img src="https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB">
    <img src="https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white" alt="JWT">
  </p>
</div>

---

## ✨ Key Features

RHub is the central hub for managing hiring workflows, ensuring every step from requisition to final approval is tracked efficiently.

* **Smooth PR Management:** Handle new **People Requisitions (PR)** with detailed job and department tracking.
* **Secure Access (RBAC):** **Role-Based Access Control** secures workflows for HRBPs and Recruiters, especially during approval processes.
* **Smart Email Alerts:** Automated **email notifications** for JD uploads, approvals, and status changes.
* **Document Handling:** Securely **upload and download** job descriptions (JDs) and other files.
* **Ironclad Security:** **JWT-based authentication** and role-based permissions throughout the API.
* **API Docs:** Comprehensive **Swagger UI documentation** available for all endpoints.
* **Data Power Tools:** Built-in **pagination, filtering, and sorting** for efficient data retrieval.

---

## 🛠️ Tech Stack

Built on a modern, scalable MERN-adjacent stack.

| Category | Key Technologies |
| :--- | :--- |
| **Backend** | **Node.js**, **Express.js** |
| **Database** | **MongoDB**, Mongoose |
| **Authentication** | **JWT** (JSON Web Tokens), bcrypt |
| **Other Tools** | Multer, Nodemailer, Winston (Logging), Swagger |

---

## 🚀 Getting Started (Local Setup)

### Prerequisites

You must have **Node.js (v14+)** and a running **MongoDB** instance (or connection string).

### Installation

1.  **Clone the repo:**
    ```bash
    git clone <repository-url>
    cd RHub-Recruitment-Hub-Management-System
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Configure Environment:**
    Create a `.env` file and set the necessary variables (e.g., `PORT`, `MONGO_URI`, `JWT_SECRET`, `EMAIL_USER`, `EMAIL_PASS`).

4.  **Start the server:**
    ```bash
    npm start
    ```

### Access Points

* **API Base URL:** `http://localhost:5000`
* **API Documentation (Swagger):** `http://localhost:5000/api-docs`

---

## 📁 Project Structure

The project uses a modular architecture for clarity and maintenance:

```
RHub-Recruitment-Hub-Management-System/
├── config/           # App, DB, Logger, and Mailer configurations
├── controllers/      # Route handlers (Request logic)
├── dbqueries/        # Database query abstractions
├── middlewares/      # Auth, Error Handling, and Upload middlewares
├── models/           # Mongoose Data Schemas
├── routes/           # Express Route Definitions
├── services/         # Core Business Logic (Application layer)
├── utils/            # Helper and utility functions
├── server.mjs        # Main application entry point
└── package.json

```
---

## 🤝 Contributing

We welcome contributions! Please fork the repository, create a feature branch, and open a **Pull Request** to the `main` branch.

---

## 📄 License

This project is licensed under the **ISC License**.
