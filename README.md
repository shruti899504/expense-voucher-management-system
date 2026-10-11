# Expense Voucher Management System 

1. Project Overview

The Expense Voucher Management System is a role-based web application that simplifies the process of creating, submitting, reviewing, approving, and rejecting employee expense vouchers.

The application provides a centralized system where employees can record business expenses, directors can review and approve or reject requests, and the accounts department can monitor vouchers.

2. Objectives

* Digitize the expense voucher process.
* Reduce manual paperwork and approval delays.
* Provide role-based access control.
* Maintain expense records in a centralized database.
* Track voucher statuses and approval decisions.
* Display expense summaries through a dashboard.

3. Features

Employee

* Register and log in.
* Create expense vouchers as drafts.
* Edit or delete draft vouchers.
* Submit vouchers with an employee signature.
* View personal vouchers and their statuses.

Director

* View vouchers submitted by employees.
* Approve pending vouchers with a director signature.
* Reject pending vouchers with a reason.
* Track approval and rejection details.

Accounts

* View vouchers across employees.
* Monitor voucher statuses and expense records.

General Features

* JWT-based authentication.
* Password hashing using bcrypt.
* Search and filter vouchers.
* Dashboard statistics.
* Signature-image uploads.
* Role-based authorization.

4. Technology Stack

| Component         | Technology                |
| ----------------- | ------------------------- |
| Frontend          | React, Vite, React Router |
| API communication | Axios                     |
| Backend           | Node.js, Express.js       |
| Database          | MongoDB                   |
| ODM               | Mongoose                  |
| Authentication    | JSON Web Token (JWT)      |
| Password security | bcryptjs                  |
| File uploads      | Multer                    |
| Version control   | Git and GitHub            |

5. Project Structure

```text
expense-voucher-management-system/
├── backend/
│   ├── scripts/
│   │   └── seedUsers.js
│   ├── src/
│   │   ├── middleware/
│   │   │   ├── authMiddleware.js
│   │   │   ├── errorMiddleware.js
│   │   │   └── upload.js
│   │   ├── models/
│   │   │   ├── User.js
│   │   │   └── Voucher.js
│   │   └── routes/
│   │       ├── authRoutes.js
│   │       ├── dashboardRoutes.js
│   │       └── voucherRoutes.js
│   ├── .env.example
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── api.js
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── .env.example
│   ├── index.html
│   └── package.json
├── docs/
│   ├── API.md
│   └── database-schema.md
├── .env.example
├── .gitignore
└── README.md
```

6. Prerequisites

Install the following before running the project:

* Node.js 18 or later; Node.js 20 or later is recommended.
* npm.
* MongoDB Community Server or a MongoDB Atlas database.
* Git.
* Visual Studio Code or another code editor.

7. Project Setup Instructions

### Step 1: Configure MongoDB

Start your local MongoDB service, or create a MongoDB Atlas database.

For a local database, the connection string used in this project is:

```text
mongodb://127.0.0.1:27017/expense_voucher_db
```

Step 2: Configure the backend

Open a terminal in the project root and execute:

```bash
cd backend
npm install
```

Create a `.env` file inside the `backend` directory by copying `.env.example`.

On Windows Command Prompt:

```bat
copy .env.example .env
```

On PowerShell:

```powershell
Copy-Item .env.example .env
```

Configure the backend environment variables:

```dotenv
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/expense_voucher_db
JWT_SECRET=replace_this_with_a_long_random_secret
CLIENT_URL=http://localhost:5173
```

Generate a strong private value for `JWT_SECRET`. Do not publish your actual secret.

Start the backend:

```bash
npm run dev
```

The API should run at:

```text
http://localhost:5000
```

Health-check endpoint:

```text
http://localhost:5000/api/health
```

Step 3: Create demonstration accounts

Open another terminal and run:

```bash
cd backend
npm run seed:users
```

The seed script creates demonstration accounts if they do not already exist. It does not reset existing passwords.

| Role     | Email                                               | Password     |
| -------- | --------------------------------------------------- | ------------ |
| Employee | [employee@example.com](mailto:employee@example.com) | Employee@123 |
| Director | [director@example.com](mailto:director@example.com) | Director@123 |
| Accounts | [accounts@example.com](mailto:accounts@example.com) | Accounts@123 |

Use these credentials only for local demonstration. Do not use them for a production deployment.

Step 4: Configure the frontend

Open another terminal from the project root:

```bash
cd frontend
npm install
```

Create a `.env` file inside the `frontend` directory by copying `.env.example`.

Configure the API URL:

```dotenv
VITE_API_URL=http://localhost:5000/api
```

Start the frontend:

```bash
npm run dev
```

Open the local URL printed by Vite, usually:

```text
http://localhost:5173
```

Step 5: Build the frontend

From the `frontend` directory, execute:

```bash
npm run build
```

Vite generates the production build in the `dist` directory.

8. Database Schema

The application uses MongoDB with Mongoose models.

### User collection

Stores user profile and authentication information.

Important fields:

* `name`: user's name.
* `email`: unique email address.
* `password`: bcrypt-hashed password.
* `role`: `EMPLOYEE`, `DIRECTOR`, or `ACCOUNTS`.
* `employeeId`: employee identifier.
* `department`: department name.
* `createdAt` and `updatedAt`: timestamps.

Voucher collection

Stores employee expense claims and their approval information.

Important fields:

* `voucherNumber`: unique voucher number.
* `voucherDate`: voucher creation date.
* `expenseDate`: date on which the expense occurred.
* `department`: department associated with the expense.
* `expenseTitle`: expense title.
* `category`: expense category.
* `description`: optional expense details.
* `amount`: claimed amount.
* `employee`: reference to the owning user.
* `employeeName` and `employeeId`: employee snapshots.
* `employeeSignature`: employee signature image path.
* `directorSignature`: director signature image path.
* `status`: current voucher status.
* `approvedBy` and `rejectedBy`: user references for decisions.
* `approvalDate`: approval timestamp.
* `rejectionReason`: explanation for rejection.
* `createdAt` and `updatedAt`: timestamps.

The full schema documentation is available in `docs/database-schema.md`.

9. API Documentation

The API base URL is:

```text
http://localhost:5000/api
```

Protected endpoints require a JWT token in the request header:

```http
Authorization: Bearer <JWT_TOKEN>
```

Main endpoints:

| Method | Endpoint                | Purpose                       |
| ------ | ----------------------- | ----------------------------- |
| GET    | `/health`               | Check API availability        |
| POST   | `/auth/register`        | Register an employee          |
| POST   | `/auth/login`           | Authenticate a user           |
| GET    | `/auth/me`              | Get the current user          |
| GET    | `/vouchers`             | List and filter vouchers      |
| POST   | `/vouchers`             | Create a draft voucher        |
| GET    | `/vouchers/:id`         | Get a voucher                 |
| PUT    | `/vouchers/:id`         | Update a draft voucher        |
| DELETE | `/vouchers/:id`         | Delete a draft voucher        |
| POST   | `/vouchers/:id/submit`  | Submit a voucher for approval |
| POST   | `/vouchers/:id/approve` | Approve a pending voucher     |
| POST   | `/vouchers/:id/reject`  | Reject a pending voucher      |
| GET    | `/dashboard`            | Retrieve dashboard statistics |

Detailed request examples, parameters, permissions, and response formats are documented in `docs/API.md`.

10. Voucher Workflow

```text
DRAFT
  |
  v
PENDING_APPROVAL
  |          |
  v          v
APPROVED   REJECTED
```

* Employees can edit or delete vouchers only while they are drafts.
* Submission requires an employee signature.
* Approval requires a director signature.
* Rejection requires a non-empty reason.
* Rejected vouchers cannot be resubmitted in the current implementation.

11. Assumptions and Limitations

1. Public registration creates an Employee account only.
2. Director and Accounts accounts are created through the seed script or trusted database administration.
3. Voucher title, expense date, department, category, and a positive amount are required.
4. Employees can view only their own vouchers.
5. Directors and Accounts users can view all vouchers.
6. Only Directors can approve or reject pending vouchers.
7. Only draft vouchers can be edited or deleted.
8. Rejected vouchers cannot be edited and resubmitted in the current version.
9. Signature uploads accept PNG, JPEG/JPG, and WEBP images up to 2 MB.
10. Signature images are stored on the backend's local disk. Production deployment would require suitable persistent or cloud file storage.
11. Voucher numbering is suitable for a demonstration project but would need a concurrency-safe sequence generator for high-volume production use.
12. The project is an academic/demo implementation and requires additional security hardening, audit logging, automated tests, and deployment configuration before production use.

12. Security Considerations

* Passwords are hashed before storage.
* JWT authentication protects private API routes.
* Role-based middleware restricts privileged actions.
* Registration does not allow users to assign themselves privileged roles.
* Environment secrets should be stored in `.env` files and excluded from Git.
* Uploaded files should be validated and stored securely.

13. Future Enhancements

* Email notifications for voucher decisions.
* Export approved vouchers to Excel or PDF.
* Receipt attachments and receipt verification.
* Multi-level approval workflows.
* Audit trail and approval history.
* Automated testing and CI/CD.
* Cloud storage for uploaded signatures.
* Reporting by employee, department, and month.

14. GitHub Submission

From the project root:

```bash
git init
git add .
git commit -m "Submit Expense Voucher Management System"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/expense-voucher-management-system.git
git push -u origin main
```

Replace the repository URL with your actual GitHub repository URL.

Before pushing, ensure that real `.env` files, `node_modules`, build output, and private or real signature images are not committed. Keep `.env.example` files in the repository.

15. Author

Developed as an academic project to demonstrate full-stack web development, database modelling, authentication, role-based authorization, and expense approval workflows.
