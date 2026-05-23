
        import { createRequire } from 'module';
        const require = createRequire(import.meta.url);
  
"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// src/app.ts
var import_express3 = __toESM(require("express"));

// src/modules/auth/auth.router.ts
var import_express = require("express");

// src/modules/auth/auth.controller.ts
var import_http_status_codes = require("http-status-codes");

// src/modules/auth/auth.services.ts
var import_bcrypt = __toESM(require("bcrypt"));

// src/database/db.ts
var import_pg = require("pg");

// src/config/index.ts
var import_dotenv = __toESM(require("dotenv"));
import_dotenv.default.config();
var config_default = {
  port: Number(process.env.PORT) || 3e3,
  database_url: process.env.DATABASE_URL,
  jwt_secret: process.env.JWT_SECRET || "fallback_secret"
};

// src/database/db.ts
var pool = new import_pg.Pool({ connectionString: config_default.database_url });
var initDatabase = async () => {
  try {
    const createUsersTable = `
            CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            email VARCHAR(255) UNIQUE NOT NULL,
            password VARCHAR(255) NOT NULL,
            role VARCHAR(50) DEFAULT 'contributor' CHECK (role IN ('contributor', 'maintainer')),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
  `;
    const createIssuesTable = `
            CREATE TABLE IF NOT EXISTS issues (
            id SERIAL PRIMARY KEY,
            title VARCHAR(150) NOT NULL,
            description TEXT NOT NULL,
            type VARCHAR(50) NOT NULL CHECK (type IN ('bug', 'feature_request')),
            status VARCHAR(50) DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved')),
            reporter_id INT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
  `;
    await pool.query(createUsersTable);
    await pool.query(createIssuesTable);
    console.log("Database tables create successfully.");
  } catch (error) {
    console.error("Error initializing database tables:", error);
  }
};
var db_default = pool;

// src/utils/jwt.ts
var import_jsonwebtoken = __toESM(require("jsonwebtoken"));
var generateToken = (payload) => {
  return import_jsonwebtoken.default.sign(payload, config_default.jwt_secret, { expiresIn: "1d" });
};

// src/modules/auth/auth.services.ts
var signUpIntoDB = async (payload) => {
  const { name, email, password, role } = payload;
  const userRole = role === "maintainer" ? "maintainer" : "contributor";
  const existingUser = await db_default.query(
    "SELECT * FROM users WHERE email = $1",
    [email]
  );
  if (existingUser.rows.length > 0) {
    throw new Error("Email already exists");
  }
  const hashedPassword = await import_bcrypt.default.hash(password, 10);
  const insertQuery = `
    INSERT INTO users (name, email, password, role)
    VALUES ($1, $2, $3, $4)
    RETURNING id, name, email, role, created_at, updated_at
  `;
  const result = await db_default.query(insertQuery, [
    name,
    email,
    hashedPassword,
    userRole
  ]);
  return result.rows[0];
};
var loginUserIntoDB = async (payload) => {
  const { email, password } = payload;
  const result = await db_default.query(
    "SELECT * FROM users WHERE email = $1",
    [email]
  );
  if (result.rows.length === 0) {
    throw new Error("Invalid email or password");
  }
  const user = result.rows[0];
  const isPasswordValid = await import_bcrypt.default.compare(password, user.password);
  if (!isPasswordValid) {
    throw new Error("Invalid email or password");
  }
  const token = generateToken({
    id: user.id,
    name: user.name,
    role: user.role
  });
  const { password: _, ...userWithoutPassword } = user;
  return {
    token,
    user: userWithoutPassword
  };
};

// src/modules/auth/auth.controller.ts
var signupController = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) {
      return res.status(import_http_status_codes.StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "Name, email, and password are required"
      });
    }
    const newUser = await signUpIntoDB({ name, email, password, role });
    return res.status(import_http_status_codes.StatusCodes.CREATED).json({
      success: true,
      message: "User registered successfully",
      data: newUser
    });
  } catch (error) {
    return res.status(import_http_status_codes.StatusCodes.BAD_REQUEST).json({
      success: false,
      message: error.message
    });
  }
};
var loginController = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(import_http_status_codes.StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "Email and password are required"
      });
    }
    const data = await loginUserIntoDB({ email, password });
    return res.status(import_http_status_codes.StatusCodes.OK).json({
      success: true,
      message: "Login successful",
      data
    });
  } catch (error) {
    return res.status(import_http_status_codes.StatusCodes.UNAUTHORIZED).json({
      success: false,
      message: error.message
    });
  }
};

// src/modules/auth/auth.router.ts
var router = (0, import_express.Router)();
router.post("/signup", signupController);
router.post("/login", loginController);
var auth_router_default = router;

// src/modules/issues/issues.routes.ts
var import_express2 = require("express");

// src/middlewares/auth.middleware.ts
var import_jsonwebtoken2 = __toESM(require("jsonwebtoken"));
var import_http_status_codes2 = require("http-status-codes");
var authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(import_http_status_codes2.StatusCodes.UNAUTHORIZED).json({
      success: false,
      message: "Missing token, Authorization header required"
    });
  }
  const token = authHeader.replace("Bearer ", "").trim();
  try {
    const decoded = import_jsonwebtoken2.default.verify(token, config_default.jwt_secret);
    req.user = {
      id: decoded.id,
      name: decoded.name,
      role: decoded.role
    };
    next();
  } catch (error) {
    return res.status(import_http_status_codes2.StatusCodes.UNAUTHORIZED).json({
      success: false,
      message: "Invalid or expired token"
    });
  }
};

// src/modules/issues/issues.controller.ts
var import_http_status_codes3 = require("http-status-codes");

// src/modules/issues/issues.services.ts
var createIssuesIntoDB = async (payload) => {
  if (!payload.title || !payload.description || !payload.type || !payload.reporter_id) {
    throw new Error("Missing required fields: title, description, type, and reporter_id are required");
  }
  const validTypes = ["bug", "feature_request"];
  if (!validTypes.includes(payload.type)) {
    throw new Error("Invalid type. Must be 'bug' or 'feature_request'");
  }
  try {
    const result = await db_default.query(
      `
        INSERT INTO issues 
        (title, description, type, status, reporter_id)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
      `,
      [
        payload.title,
        payload.description,
        payload.type,
        "open",
        payload.reporter_id
      ]
    );
    return result.rows[0];
  } catch (error) {
    if (error.code === "23503") {
      throw new Error("Invalid reporter_id: user does not exist");
    }
    if (error.code === "23505") {
      throw new Error("Duplicate entry detected");
    }
    throw new Error(`Database error: ${error.message}`);
  }
};
var getAllIssuesIntoDb = async (payload) => {
  const { sort, type, status } = payload;
  let queryText = "SELECT * FROM issues WHERE 1=1";
  const queryParams = [];
  let paramIndex = 1;
  if (type === "bug" || type === "feature_request") {
    queryText += ` AND type = $${paramIndex}`;
    queryParams.push(type);
    paramIndex++;
  }
  if (status === "open" || status === "in_progress" || status === "resolved") {
    queryText += ` AND status = $${paramIndex}`;
    queryParams.push(status);
    paramIndex++;
  }
  queryText += sort === "oldest" ? " ORDER BY created_at ASC" : " ORDER BY created_at DESC";
  const issuesResult = await db_default.query(queryText, queryParams);
  const issues = issuesResult.rows;
  if (issues.length === 0) {
    return [];
  }
  const reporterIds = Array.from(
    new Set(issues.map((issue) => issue.reporter_id))
  );
  const usersResult = await db_default.query(
    `SELECT id, name, role FROM users WHERE id = ANY($1)`,
    [reporterIds]
  );
  const userMap = {};
  usersResult.rows.forEach((user) => {
    userMap[user.id] = user;
  });
  const finalIssues = issues.map((issue) => {
    const { reporter_id, ...rest } = issue;
    return {
      ...rest,
      reporter: userMap[reporter_id] || null
    };
  });
  return finalIssues;
};
var getSingleIssueIntoDB = async (id) => {
  const issueResult = await db_default.query(
    "SELECT * FROM issues WHERE id = $1",
    [id]
  );
  if (issueResult.rows.length === 0) {
    return null;
  }
  const issue = issueResult.rows[0];
  const userResult = await db_default.query(
    "SELECT id, name, role FROM users WHERE id = $1",
    [issue.reporter_id]
  );
  const reporter = userResult.rows[0] || null;
  const { reporter_id, ...issueData } = issue;
  return {
    ...issueData,
    reporter
  };
};
var updateIssueIntoDB = async (params) => {
  const { id, title, description, type, status, currentUser } = params;
  const issueResult = await db_default.query(
    "SELECT * FROM issues WHERE id = $1",
    [id]
  );
  if (issueResult.rows.length === 0) {
    return { notFound: true };
  }
  const issue = issueResult.rows[0];
  if (currentUser.role !== "maintainer") {
    if (issue.reporter_id !== currentUser.id) {
      return {
        forbidden: true,
        message: "You can only update your own issues"
      };
    }
    if (issue.status !== "open") {
      return {
        conflict: true,
        message: "Contributors cannot edit non-open issues"
      };
    }
    if (status && status !== issue.status) {
      return {
        forbidden: true,
        message: "Contributors cannot change workflow status"
      };
    }
  }
  const updatedTitle = title ?? issue.title;
  const updatedDescription = description ?? issue.description;
  const updatedType = type ?? issue.type;
  const updatedStatus = status ?? issue.status;
  const updateQuery = `
    UPDATE issues 
    SET title = $1,
        description = $2,
        type = $3,
        status = $4,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = $5
    RETURNING *
  `;
  const result = await db_default.query(updateQuery, [
    updatedTitle,
    updatedDescription,
    updatedType,
    updatedStatus,
    id
  ]);
  return {
    success: true,
    data: result.rows[0]
  };
};
var deleteIssueIntoDB = async (id) => {
  const checkResult = await db_default.query(
    "SELECT * FROM issues WHERE id = $1",
    [id]
  );
  if (checkResult.rows.length === 0) {
    return { notFound: true };
  }
  await db_default.query("DELETE FROM issues WHERE id = $1", [id]);
  return { success: true };
};

// src/modules/issues/issues.controller.ts
var createIssuesController = async (req, res) => {
  try {
    const { title, description, type } = req.body;
    if (!title || !description || !type) {
      return res.status(import_http_status_codes3.StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "Title, description, and type are required"
      });
    }
    const data = await createIssuesIntoDB({
      title,
      description,
      type,
      reporter_id: 1
    });
    return res.status(import_http_status_codes3.StatusCodes.CREATED).json({
      success: true,
      message: "Issue created successfully",
      data
    });
  } catch (error) {
    return res.status(import_http_status_codes3.StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Cannot Create Issues.",
      error: error.message
    });
  }
};
var getAllIssuesController = async (req, res) => {
  try {
    const { sort, type, status } = req.query;
    const data = await getAllIssuesIntoDb({
      sort,
      type,
      status
    });
    res.status(import_http_status_codes3.StatusCodes.OK).json({
      success: true,
      data
    });
  } catch (error) {
    res.status(import_http_status_codes3.StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Cannot Create Issues.",
      error: error.message
    });
  }
};
var getSingleController = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await getSingleIssueIntoDB(String(id));
    if (!data) {
      return res.status(import_http_status_codes3.StatusCodes.NOT_FOUND).json({
        success: false,
        message: "Issue not found"
      });
    }
    return res.status(import_http_status_codes3.StatusCodes.OK).json({
      success: true,
      data
    });
  } catch (error) {
    return res.status(import_http_status_codes3.StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Server error",
      errors: error.message
    });
  }
};
var updateIssueController = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, type, status } = req.body;
    const currentUser = req.user;
    if (!currentUser) {
      return res.status(import_http_status_codes3.StatusCodes.UNAUTHORIZED).json({
        success: false,
        message: "Unauthorized"
      });
    }
    const result = await updateIssueIntoDB({
      id: String(id),
      title,
      description,
      type,
      status,
      currentUser
    });
    if (result.notFound) {
      return res.status(import_http_status_codes3.StatusCodes.NOT_FOUND).json({
        success: false,
        message: "Issue not found"
      });
    }
    if (result.forbidden) {
      return res.status(import_http_status_codes3.StatusCodes.FORBIDDEN).json({
        success: false,
        message: result.message
      });
    }
    if (result.conflict) {
      return res.status(import_http_status_codes3.StatusCodes.CONFLICT).json({
        success: false,
        message: result.message
      });
    }
    return res.status(import_http_status_codes3.StatusCodes.OK).json({
      success: true,
      message: "Issue updated successfully",
      data: result.data
    });
  } catch (error) {
    return res.status(import_http_status_codes3.StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Server error",
      errors: error.message
    });
  }
};
var deleteIssueController = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await deleteIssueIntoDB(String(id));
    if (result.notFound) {
      return res.status(import_http_status_codes3.StatusCodes.NOT_FOUND).json({
        success: false,
        message: "Issue not found"
      });
    }
    return res.status(import_http_status_codes3.StatusCodes.OK).json({
      success: true,
      message: "Issue deleted successfully"
    });
  } catch (error) {
    return res.status(import_http_status_codes3.StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Server error",
      errors: error.message
    });
  }
};

// src/modules/issues/issues.routes.ts
var router2 = (0, import_express2.Router)();
router2.get("/", getAllIssuesController);
router2.get("/:id", getSingleController);
router2.post("/", createIssuesController);
router2.patch("/:id", authenticateJWT, updateIssueController);
router2.delete("/:id", authenticateJWT, deleteIssueController);
var issues_routes_default = router2;

// src/app.ts
var app = (0, import_express3.default)();
app.use(import_express3.default.json());
app.use("/api/auth", auth_router_default);
app.use("/api/issues", issues_routes_default);
var app_default = app;

// src/server.ts
async function main() {
  await initDatabase();
  app_default.listen(config_default.port, () => {
    console.log(`server is running at port ${config_default.port}`);
  });
}
main();
//# sourceMappingURL=server.js.map