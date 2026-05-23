# DevPulse — Issue Tracking API

DevPulse is a RESTful API built with Node.js, Express, TypeScript, and PostgreSQL (Neon.tech) for managing software project issues. It supports user authentication (signup/login) and full CRUD operations on issues with role-based access control (Contributor / Maintainer).

---

## Live URL

**Base URL:** [https://devpulse-bice-nu.vercel.app/](https://devpulse-bice-nu.vercel.app/)

---

## Features

- **User Authentication** — Register and login with hashed passwords (bcrypt) and JWT tokens.
- **Issue Management** — Create, read, update, and delete issues.
- **Role-Based Access Control** — Two roles: `contributor` and `maintainer`.
  - Contributors can only update/delete their own issues and only while the issue is `open`.
  - Maintainers have full access to all issues.
- **Filtering & Sorting** — Query issues by `type` (bug, feature_request), `status` (open, in_progress, resolved), and `sort` (newest/oldest).
- **Auto-populated Reporter** — Each issue response includes the reporter's name and role.
- **Database Migration on Startup** — Tables are created automatically when the server starts.

---

## Tech Stack

| Technology  | Purpose                        |
| ----------- | ------------------------------ |
| Node.js     | JavaScript runtime             |
| Express.js  | Web framework                  |
| TypeScript  | Type safety & developer experience |
| PostgreSQL  | Database (via Neon.tech)       |
| pg          | PostgreSQL client              |
| bcrypt      | Password hashing               |
| jsonwebtoken| JWT generation & verification  |
| tsup        | TypeScript bundler             |
| Vercel      | Hosting / deployment           |

---

## Setup Instructions (Local Development)

### Prerequisites

- Node.js (v18 or higher)
- npm
- A PostgreSQL database (I recommend using [Neon.tech](https://neon.tech) for a free serverless instance)

### Steps

```bash
# 1. Clone the repository
git clone https://github.com/rakibul263/devpulse.git
cd devpulse

# 2. Install dependencies
npm install

# 3. Create a .env file in the root directory
touch .env

# 4. Add the following environment variables to .env
PORT=3000
DATABASE_URL=your_postgresql_connection_string
JWT_SECRET=your_jwt_secret_key

# 5. Run the development server
npm run dev
```

The server will start at `http://localhost:3000`. The database tables (`users` and `issues`) are created automatically on startup.

### Build for Production

```bash
npm run build
npm start
```

---

## API Endpoints

### Authentication (`/api/auth`)

| Method | Endpoint       | Auth Required | Description                          |
| ------ | -------------- | ------------- | ------------------------------------ |
| POST   | `/api/auth/signup` | No        | Register a new user                  |
| POST   | `/api/auth/login`  | No        | Login and receive a JWT token        |

#### POST `/api/auth/signup`

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword",
  "role": "contributor"
}
```

> `role` is optional, defaults to `contributor`. Accepted values: `contributor`, `maintainer`.

**Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "contributor",
    "created_at": "2026-05-23T10:00:00.000Z",
    "updated_at": "2026-05-23T10:00:00.000Z"
  }
}
```

---

#### POST `/api/auth/login`

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "securepassword"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "role": "contributor",
      "created_at": "2026-05-23T10:00:00.000Z",
      "updated_at": "2026-05-23T10:00:00.000Z"
    }
  }
}
```

> Use the returned `token` in the `Authorization` header (`Bearer <token>`) for protected endpoints.

---

### Issues (`/api/issues`)

| Method | Endpoint                | Auth Required | Description                      |
| ------ | ----------------------- | ------------- | -------------------------------- |
| GET    | `/api/issues`           | No            | Get all issues (with filters)    |
| GET    | `/api/issues/:id`       | No            | Get a single issue by ID         |
| POST   | `/api/issues`           | No            | Create a new issue               |
| PATCH  | `/api/issues/:id`       | Yes (JWT)     | Update an issue                  |
| DELETE | `/api/issues/:id`       | Yes (JWT)     | Delete an issue                  |

---

#### GET `/api/issues`

**Query Parameters (all optional):**
- `type` — `bug` or `feature_request`
- `status` — `open`, `in_progress`, or `resolved`
- `sort` — `newest` (default) or `oldest`

**Example:** `/api/issues?type=bug&status=open&sort=oldest`

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "Login button broken",
      "description": "The login button does not respond on mobile",
      "type": "bug",
      "status": "open",
      "created_at": "2026-05-23T10:00:00.000Z",
      "updated_at": "2026-05-23T10:00:00.000Z",
      "reporter": {
        "id": 1,
        "name": "John Doe",
        "role": "contributor"
      }
    }
  ]
}
```

---

#### GET `/api/issues/:id`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "Login button broken",
    "description": "The login button does not respond on mobile",
    "type": "bug",
    "status": "open",
    "created_at": "2026-05-23T10:00:00.000Z",
    "updated_at": "2026-05-23T10:00:00.000Z",
    "reporter": {
      "id": 1,
      "name": "John Doe",
      "role": "contributor"
    }
  }
}
```

**Response (404):**
```json
{
  "success": false,
  "message": "Issue not found"
}
```

---

#### POST `/api/issues`

**Request Body:**
```json
{
  "title": "Add dark mode support",
  "description": "Users should be able to toggle dark mode in settings",
  "type": "feature_request"
}
```

> `type` must be either `bug` or `feature_request`.

**Response (201):**
```json
{
  "success": true,
  "message": "Issue created successfully",
  "data": {
    "id": 2,
    "title": "Add dark mode support",
    "description": "Users should be able to toggle dark mode in settings",
    "type": "feature_request",
    "status": "open",
    "reporter_id": 1,
    "created_at": "2026-05-23T10:05:00.000Z",
    "updated_at": "2026-05-23T10:05:00.000Z"
  }
}
```

---

#### PATCH `/api/issues/:id`

**Headers:**
```
Authorization: Bearer <your_jwt_token>
```

**Request Body (all fields optional):**
```json
{
  "title": "Updated title",
  "description": "Updated description",
  "type": "bug",
  "status": "in_progress"
}
```

**Access Rules:**
- **Maintainer:** can update any field of any issue.
- **Contributor:** can only update their own issues; can only edit when status is `open`; cannot change the `status` field.

**Response (200):**
```json
{
  "success": true,
  "message": "Issue updated successfully",
  "data": {
    "id": 1,
    "title": "Updated title",
    "description": "Updated description",
    "type": "bug",
    "status": "in_progress",
    "reporter_id": 1,
    "created_at": "2026-05-23T10:00:00.000Z",
    "updated_at": "2026-05-23T10:10:00.000Z"
  }
}
```

---

#### DELETE `/api/issues/:id`

**Headers:**
```
Authorization: Bearer <your_jwt_token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Issue deleted successfully"
}
```

---

## Database Schema Summary

### Table: `users`

| Column       | Type         | Constraints                          |
| ------------ | ------------ | ------------------------------------ |
| id           | SERIAL       | PRIMARY KEY                          |
| name         | VARCHAR(255) | NOT NULL                             |
| email        | VARCHAR(255) | UNIQUE, NOT NULL                     |
| password     | VARCHAR(255) | NOT NULL                             |
| role         | VARCHAR(50)  | DEFAULT 'contributor', CHECK (IN ('contributor', 'maintainer')) |
| created_at   | TIMESTAMP    | DEFAULT CURRENT_TIMESTAMP            |
| updated_at   | TIMESTAMP    | DEFAULT CURRENT_TIMESTAMP            |

### Table: `issues`

| Column       | Type         | Constraints                          |
| ------------ | ------------ | ------------------------------------ |
| id           | SERIAL       | PRIMARY KEY                          |
| title        | VARCHAR(150) | NOT NULL                             |
| description  | TEXT         | NOT NULL                             |
| type         | VARCHAR(50)  | NOT NULL, CHECK (IN ('bug', 'feature_request')) |
| status       | VARCHAR(50)  | DEFAULT 'open', CHECK (IN ('open', 'in_progress', 'resolved')) |
| reporter_id  | INT          | NOT NULL (FK → users.id)             |
| created_at   | TIMESTAMP    | DEFAULT CURRENT_TIMESTAMP            |
| updated_at   | TIMESTAMP    | DEFAULT CURRENT_TIMESTAMP            |

---

## How to Test with Postman

### Step-by-step guide:

1. **Open Postman** and create a new collection called "DevPulse".

2. **Register a user:**
   - Method: `POST`
   - URL: `https://devpulse-bice-nu.vercel.app/api/auth/signup`
   - Body (raw JSON):
     ```json
     {
       "name": "Test User",
       "email": "test@example.com",
       "password": "123456",
       "role": "contributor"
     }
     ```
   - Click **Send**. Save the response.

3. **Login to get a token:**
   - Method: `POST`
   - URL: `https://devpulse-bice-nu.vercel.app/api/auth/login`
   - Body (raw JSON):
     ```json
     {
       "email": "test@example.com",
       "password": "123456"
     }
     ```
   - Click **Send**. Copy the `token` value from the response.

4. **Set the token globally (Postman):**
   - In the collection settings, add a variable `token` with the copied value.
   - Under the **Authorization** tab of a request, select **Bearer Token** and paste `{{token}}`.

5. **Create an issue:**
   - Method: `POST`
   - URL: `https://devpulse-bice-nu.vercel.app/api/issues`
   - Body (raw JSON):
     ```json
     {
       "title": "Fix navbar alignment",
       "description": "Navbar items are misaligned on tablet view",
       "type": "bug"
     }
     ```
   - Click **Send**. Note the returned `id`.

6. **Get all issues:**
   - Method: `GET`
   - URL: `https://devpulse-bice-nu.vercel.app/api/issues`
   - Click **Send**.

7. **Get a single issue:**
   - Method: `GET`
   - URL: `https://devpulse-bice-nu.vercel.app/api/issues/1`
   - Click **Send**.

8. **Update an issue (requires JWT):**
   - Method: `PATCH`
   - URL: `https://devpulse-bice-nu.vercel.app/api/issues/1`
   - Headers: `Authorization: Bearer {{token}}`
   - Body (raw JSON):
     ```json
     {
       "status": "in_progress"
     }
     ```
   - Click **Send**.

9. **Delete an issue (requires JWT):**
   - Method: `DELETE`
   - URL: `https://devpulse-bice-nu.vercel.app/api/issues/1`
   - Headers: `Authorization: Bearer {{token}}`
   - Click **Send**.

> **Tip:** To test role-based restrictions, register a second user with `role: "contributor"` and try updating or deleting an issue created by a different user.

---

## Author

**Md Rakibul Hasan**

- LinkedIn: [https://www.linkedin.com/in/rakibul263/](https://www.linkedin.com/in/rakibul263/)
- GitHub: [https://github.com/rakibul263](https://github.com/rakibul263)

---

## License

This project is for educational purposes as part of the **Mission-2: Be a Node Express Expert** program.
