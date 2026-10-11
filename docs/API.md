# API Documentation

## 1. Overview

Base URL:

```text
http://localhost:5000/api
```

JSON requests should use:

```http
Content-Type: application/json
```

Protected routes require:

```http
Authorization: Bearer <JWT_TOKEN>
```

JWT tokens expire after eight hours.

Signature-upload endpoints use `multipart/form-data`.

## 2. Common HTTP Status Codes

| Status | Meaning                                     |
| ------ | ------------------------------------------- |
| 200    | Request successful                          |
| 201    | Resource created                            |
| 400    | Invalid input or workflow transition        |
| 401    | Missing, invalid, or expired authentication |
| 403    | Role or ownership restriction               |
| 404    | Resource not found                          |
| 409    | Duplicate registration email                |
| 500    | Unexpected server error                     |

Errors generally return a JSON message, for example:

```json
{
  "message": "An error occurred."
}
```

The exact message depends on the failure.

## 3. Health Check

### GET `/health`

**Access:** Public

Checks whether the API is responding.

Example response:

```json
{
  "status": "ok"
}
```

## 4. Authentication

### POST `/auth/register`

**Access:** Public

Creates an Employee account.

Request:

```json
{
  "name": "Asha Patil",
  "email": "asha@example.com",
  "password": "Example@123",
  "employeeId": "EMP002",
  "department": "Finance"
}
```

Required fields: `name`, `email`, and `password`.

The password must contain at least eight characters. Employee ID and department are optional.

Example response:

```json
{
  "token": "<jwt>",
  "user": {
    "id": "<userId>",
    "name": "Asha Patil",
    "email": "asha@example.com",
    "role": "EMPLOYEE",
    "employeeId": "EMP002",
    "department": "Finance"
  }
}
```

Possible errors: `400` for invalid input and `409` when the email is already registered.

### POST `/auth/login`

**Access:** Public

Authenticates a user.

Request:

```json
{
  "email": "employee@example.com",
  "password": "Employee@123"
}
```

Example response:

```json
{
  "token": "<jwt>",
  "user": {
    "id": "<userId>",
    "name": "Demo Employee",
    "email": "employee@example.com",
    "role": "EMPLOYEE",
    "employeeId": "EMP001",
    "department": "Technology"
  }
}
```

Invalid credentials return `401`.

### GET `/auth/me`

**Access:** Authenticated users

Returns the current user's public profile.

Example response:

```json
{
  "user": {
    "id": "<userId>",
    "name": "Demo Employee",
    "email": "employee@example.com",
    "role": "EMPLOYEE",
    "employeeId": "EMP001",
    "department": "Technology"
  }
}
```

## 5. Voucher APIs

All voucher endpoints require authentication.

Employees can access only their own vouchers. Directors and Accounts users can view all vouchers. Only Directors can approve or reject vouchers.

### GET `/vouchers`

**Access:** Authenticated users

Returns vouchers accessible to the current user.

Optional query parameters:

| Parameter    | Description                                              |
| ------------ | -------------------------------------------------------- |
| `search`     | Searches voucher number, employee name, or expense title |
| `status`     | Filters by status                                        |
| `department` | Filters by department                                    |
| `category`   | Filters by category                                      |
| `from`       | Start of expense-date range                              |
| `to`         | End of expense-date range                                |
| `minAmount`  | Minimum amount                                           |
| `maxAmount`  | Maximum amount                                           |
| `sort`       | `amount`, `oldest`, or default newest-first sorting      |

Example:

```http
GET /api/vouchers?status=PENDING_APPROVAL&department=Technology&minAmount=100&sort=oldest
```

Example response:

```json
{
  "vouchers": []
}
```

### POST `/vouchers`

**Access:** Employee only

Creates a draft voucher.

Request:

```json
{
  "voucherDate": "2026-10-12",
  "expenseDate": "2026-10-10",
  "department": "Technology",
  "expenseTitle": "Travel to client office",
  "category": "Travel",
  "description": "Local transport",
  "amount": 450
}
```

Required fields: `expenseDate`, `department`, `expenseTitle`, `category`, and a positive numeric `amount`.

`voucherDate` defaults to the current date. `description` is optional.

Example response:

```json
{
  "voucher": {
    "_id": "<voucherId>",
    "voucherNumber": "EV-2026-00001",
    "status": "DRAFT",
    "amount": 450
  }
}
```

The response is illustrative; the application may return additional fields.

### GET `/vouchers/:id`

**Access:** Authenticated users

Retrieves one voucher.

Employees can access only vouchers they own. Directors and Accounts users can access vouchers across employees.

### PUT `/vouchers/:id`

**Access:** Owning Employee; draft vouchers only

Updates one or more draft fields.

Example request:

```json
{
  "amount": 520,
  "description": "Updated transport total"
}
```

Editable fields include voucher date, expense date, department, title, category, description, and amount.

Non-draft vouchers cannot be edited.

### DELETE `/vouchers/:id`

**Access:** Owning Employee; draft vouchers only

Deletes a draft voucher.

Example response:

```json
{
  "message": "Draft voucher deleted."
}
```

### POST `/vouchers/:id/submit`

**Access:** Owning Employee; draft vouchers only

Submits the voucher for approval.

Content type:

```http
Content-Type: multipart/form-data
```

Required file field:

```text
employeeSignature
```

Accepted file types: PNG, JPEG/JPG, and WEBP.

Maximum file size: 2 MB.

After submission, the voucher status becomes `PENDING_APPROVAL`.

### POST `/vouchers/:id/approve`

**Access:** Director only; pending vouchers only

Approves a pending voucher.

Content type: `multipart/form-data`.

Required file field:

```text
directorSignature
```

Accepted file types: PNG, JPEG/JPG, and WEBP, up to 2 MB.

After approval, the voucher status becomes `APPROVED`.

### POST `/vouchers/:id/reject`

**Access:** Director only; pending vouchers only

Rejects a pending voucher.

Request:

```json
{
  "reason": "Receipt details are incomplete."
}
```

The rejection reason must not be empty.

After rejection, the voucher status becomes `REJECTED`.

## 6. Dashboard

### GET `/dashboard`

**Access:** Authenticated users

Returns dashboard statistics and recent vouchers.

Example response:

```json
{
  "stats": {
    "total": 0,
    "drafts": 0,
    "pending": 0,
    "approved": 0,
    "rejected": 0,
    "totalClaimed": 0,
    "approvedToday": 0,
    "rejectedToday": 0,
    "pendingAmount": 0,
    "approvedAmount": 0
  },
  "recent": []
}
```

The numbers above are examples, not live database values. Employee statistics are scoped to that employee for the primary counts and total claimed. Director and Accounts users see global counts. Pending and approved amount aggregates are calculated globally in the current implementation.

## 7. Authorization Summary

| Action                  | Employee        | Director    | Accounts    |
| ----------------------- | --------------- | ----------- | ----------- |
| Register / log in       | Yes             | Yes         | Yes         |
| View own vouchers       | Yes             | Yes         | Yes         |
| View all vouchers       | No              | Yes         | Yes         |
| Create a voucher        | Yes             | No          | No          |
| Edit own draft          | Yes             | No          | No          |
| Delete own draft        | Yes             | No          | No          |
| Submit own draft        | Yes             | No          | No          |
| Approve pending voucher | No              | Yes         | No          |
| Reject pending voucher  | No              | Yes         | No          |
| View dashboard          | Own-scoped data | Global data | Global data |

## 8. Workflow Rules

```text
DRAFT -> PENDING_APPROVAL -> APPROVED
                         \-> REJECTED
```

* Employees can edit or delete draft vouchers only.
* Submission requires an employee signature.
* Approval requires a director signature.
* Rejection requires a reason.
* Rejected vouchers cannot be resubmitted in the current version.

## 9. Authentication Notes

After successful login, the client receives a JWT token. Include that token in the Authorization header for protected requests.

Do not expose tokens, password hashes, or environment secrets in logs or public repositories.
