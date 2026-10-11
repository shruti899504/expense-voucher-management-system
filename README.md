# Expense Voucher Management System

A MERN full-stack application for employee expense vouchers, Director approvals/rejections, and Accounts monitoring.

## Technology
- React + Vite
- Node.js + Express
- MongoDB + Mongoose
- JWT authentication
- Multer image uploads for signatures

## Requirements
- Node.js 18+
- MongoDB running locally or a MongoDB Atlas connection string

## Setup

### 1. Backend
```bash
cd backend
npm install
cp .env.example .env
npm run dev
```
On Windows Command Prompt, create `.env` by copying `.env.example` manually if `cp` is unavailable. Update `MONGO_URI` and `JWT_SECRET`.

### 2. Create initial users
With the backend running, register users through the API or use the frontend Register page. Registration intentionally creates Employee accounts only. To create Director or Accounts users, use the protected admin seed script after setting credentials in `.env`:
```bash
npm run seed:users
```
The script creates demo accounts only if they do not already exist:
- director@example.com / Director@123
- accounts@example.com / Accounts@123
- employee@example.com / Employee@123

Change these passwords before using the application beyond local assessment.

### 3. Frontend
Open a second terminal:
```bash
cd frontend
npm install
npm run dev
```
Open the URL printed by Vite (usually http://localhost:5173).

## Roles
- Employee: create/save drafts, edit/delete drafts, submit signed vouchers, view own vouchers.
- Director: view all vouchers, approve with signature, reject with reason.
- Accounts: read-only access to all vouchers.

## Voucher statuses
`DRAFT` → `PENDING_APPROVAL` → `APPROVED` or `REJECTED`.

The source assignment lists both “Submitted” and “Pending Approval.” This implementation records a submitted voucher as `PENDING_APPROVAL` immediately to keep the approval workflow simple.

## API overview
All routes are prefixed with `/api`.
- `POST /auth/register` — register an Employee
- `POST /auth/login` — log in
- `GET /auth/me` — current user
- `GET /vouchers` — list permitted vouchers; supports `search`, `status`, `department`, `category`, `from`, `to`, `minAmount`, `maxAmount`, `sort`
- `POST /vouchers` — create draft
- `GET /vouchers/:id` — view voucher details
- `PUT /vouchers/:id` — update own draft
- `DELETE /vouchers/:id` — delete own draft
- `POST /vouchers/:id/submit` — submit own draft
- `POST /vouchers/:id/approve` — Director approval with signature
- `POST /vouchers/:id/reject` — Director rejection with reason
- `GET /dashboard` — role-specific dashboard summary

Signature upload fields are sent as multipart form fields named `employeeSignature` or `directorSignature`.

## Database schema
- `User`: name, email, password hash, role, employeeId, department
- `Voucher`: voucherNumber, dates, department, expense details, amount, employee reference and snapshot, signatures, status, approval/rejection details, timestamps

## Assumptions
- Public registration is limited to Employee role to prevent users assigning themselves privileged roles.
- Director and Accounts users are created by the seed script or trusted database administration.
- Approval/rejection decisions are final in this version; rejected vouchers are not editable, matching the supplied business rules.
- Uploaded signature images are stored locally under `backend/uploads` for assessment/demo use. For production, use private object storage and stricter deployment controls.
- This is an assessment starter project. Review secrets, logging, file storage, rate limiting, and deployment security before production use.
