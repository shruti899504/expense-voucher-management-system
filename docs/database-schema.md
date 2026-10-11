## 1. Overview

The application uses MongoDB through Mongoose. The schema definitions are maintained in:

* `backend/src/models/User.js`
* `backend/src/models/Voucher.js`

Mongoose creates collections when documents are saved. This project does not use SQL migration files.

## 2. Users Collection

**Model:** `User`

| Field        | Type     | Description                               |
| ------------ | -------- | ----------------------------------------- |
| `_id`        | ObjectId | Unique MongoDB document identifier        |
| `name`       | String   | Required, trimmed user name               |
| `email`      | String   | Required, unique, lowercase email         |
| `password`   | String   | Required password stored as a bcrypt hash |
| `role`       | String   | `EMPLOYEE`, `DIRECTOR`, or `ACCOUNTS`     |
| `employeeId` | String   | Optional employee identifier              |
| `department` | String   | Optional department name                  |
| `createdAt`  | Date     | Creation timestamp                        |
| `updatedAt`  | Date     | Last update timestamp                     |

### Constraints

* Email addresses must be unique.
* Passwords are hashed before saving.
* Password hashes are excluded from normal query results.
* Public registration creates an Employee account only.
* Privileged roles must be assigned through a trusted administrative process.

## 3. Vouchers Collection

**Model:** `Voucher`

| Field               | Type             | Description                            |
| ------------------- | ---------------- | -------------------------------------- |
| `_id`               | ObjectId         | Unique MongoDB document identifier     |
| `voucherNumber`     | String           | Unique voucher identifier              |
| `voucherDate`       | Date             | Voucher date; defaults to current date |
| `expenseDate`       | Date             | Date the expense occurred              |
| `department`        | String           | Department associated with the expense |
| `expenseTitle`      | String           | Short expense title                    |
| `category`          | String           | Expense category                       |
| `description`       | String           | Optional additional information        |
| `amount`            | Number           | Required amount; minimum 0.01          |
| `employee`          | ObjectId         | Reference to the owning User           |
| `employeeName`      | String           | Employee name snapshot                 |
| `employeeId`        | String           | Employee identifier snapshot           |
| `employeeSignature` | String           | Path or URL for employee signature     |
| `directorSignature` | String           | Path or URL for director signature     |
| `status`            | String           | Current workflow status                |
| `approvalDate`      | Date or null     | Approval timestamp                     |
| `approvedBy`        | ObjectId or null | Reference to approving User            |
| `rejectedBy`        | ObjectId or null | Reference to rejecting User            |
| `rejectionReason`   | String           | Reason for rejection                   |
| `createdAt`         | Date             | Creation timestamp                     |
| `updatedAt`         | Date             | Last update timestamp                  |

### Allowed status values

* `DRAFT`
* `PENDING_APPROVAL`
* `APPROVED`
* `REJECTED`

## 4. Relationships

* One user can create multiple vouchers.
* `Voucher.employee` references the employee who owns the voucher.
* `Voucher.approvedBy` references the user who approved the voucher.
* `Voucher.rejectedBy` references the user who rejected the voucher.
* Employee name and ID are stored as snapshots to preserve the details recorded when the voucher was created.

## 5. Indexes and Validation

* `users.email`: unique index.
* `vouchers.voucherNumber`: unique index.
* `vouchers.employee`: index for employee-based queries.
* `vouchers.status`: index for status-based queries.
* Mongoose timestamps maintain `createdAt` and `updatedAt`.
* Required fields and positive amounts are validated by the model and route handlers.

## 6. Workflow

```text
DRAFT -> PENDING_APPROVAL -> APPROVED
                         \-> REJECTED
```

A voucher can be edited or deleted only while it is in `DRAFT`.

Submission requires an employee signature. Approval requires a director signature. Rejection requires a reason.

The current implementation does not support resubmission of rejected vouchers.

## 7. Example User Document

The password below is a placeholder. The actual database stores a bcrypt hash.

```json
{
  "_id": "<userObjectId>",
  "name": "Demo Employee",
  "email": "employee@example.com",
  "password": "<bcrypt-hash>",
  "role": "EMPLOYEE",
  "employeeId": "EMP001",
  "department": "Technology"
}
```

## 8. Example Voucher Document

The IDs and signature path below are illustrative.

```json
{
  "_id": "<voucherObjectId>",
  "voucherNumber": "EV-2026-00001",
  "voucherDate": "2026-10-12T00:00:00.000Z",
  "expenseDate": "2026-10-10T00:00:00.000Z",
  "department": "Technology",
  "expenseTitle": "Travel to client office",
  "category": "Travel",
  "description": "Local transport",
  "amount": 450,
  "employee": "<userObjectId>",
  "employeeName": "Demo Employee",
  "employeeId": "EMP001",
  "employeeSignature": "/uploads/<signature-file>.png",
  "directorSignature": "",
  "status": "PENDING_APPROVAL",
  "approvalDate": null,
  "approvedBy": null,
  "rejectedBy": null,
  "rejectionReason": ""
}
```

## 9. Migration Strategy

This project uses Mongoose schemas rather than SQL migrations. For future schema changes, update the corresponding Mongoose model and validate the changes against existing documents. Any data transformation required for an existing deployment should be handled with a dedicated migration script and a database backup.
