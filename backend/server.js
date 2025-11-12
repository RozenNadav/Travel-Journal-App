require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const { randomUUID } = require("crypto");
const pool = require("./db");

const app = express();
app.use(cors());
app.use(express.json());

const initializeDatabase = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY,
      username TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      email TEXT UNIQUE,
      full_name TEXT,
      avatar TEXT DEFAULT '/placeholder.svg',
      location TEXT DEFAULT '',
      join_date TIMESTAMPTZ DEFAULT NOW(),
      bio TEXT DEFAULT '',
      is_placeholder BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);

  await pool.query(`
    CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email_unique
      ON users(email) WHERE email IS NOT NULL;
  `);
};

initializeDatabase()
  .then(() =>
    console.log("Connected to PostgreSQL and ensured user schema")
  )
  .catch((err) => {
    console.error("Failed to initialize PostgreSQL", err);
    process.exit(1);
  });

const formatUser = (row) => ({
  id: row.id,
  username: row.username,
  email: row.email || "",
  fullName: row.full_name || "",
  avatar: row.avatar || "/placeholder.svg",
  location: row.location || "",
  joinDate: row.join_date
    ? row.join_date.toISOString()
    : new Date().toISOString(),
  bio: row.bio || "",
});

app.get("/", (req, res) =>
  res.send("Backend is running with PostgreSQL!")
);

const API_PREFIX = "/api";

app.post(`${API_PREFIX}/auth/register`, async (req, res) => {
  const { username, password, email, fullName } = req.body;

  if (!username || !password || !email || !fullName) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const existingResult = await pool.query(
      `SELECT * FROM users WHERE username = $1 OR email = $2 LIMIT 1`,
      [username, email]
    );
    const existingUser = existingResult.rows[0];
    const hashedPassword = await bcrypt.hash(password, 10);

    if (existingUser) {
      if (existingUser.is_placeholder) {
        const updatedResult = await pool.query(
          `
            UPDATE users
            SET password = $1,
                email = $2,
                full_name = $3,
                is_placeholder = false,
                join_date = COALESCE(join_date, NOW()),
                updated_at = NOW()
            WHERE id = $4
            RETURNING *
          `,
          [hashedPassword, email, fullName, existingUser.id]
        );

        return res.json(formatUser(updatedResult.rows[0]));
      }

      return res
        .status(400)
        .json({ error: "Username or email already exists" });
    }

    const newUserId = randomUUID();
    const createResult = await pool.query(
      `
        INSERT INTO users (id, username, password, email, full_name)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
      `,
      [newUserId, username, hashedPassword, email, fullName]
    );

    res.json(formatUser(createResult.rows[0]));
  } catch (err) {
    console.error(err);
    if (err.code === "23505") {
      return res
        .status(400)
        .json({ error: "Username or email already exists" });
    }
    res.status(500).json({ error: "Registration failed" });
  }
});

app.post(`${API_PREFIX}/auth/login`, async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: "Missing credentials" });
  }

  try {
    const userResult = await pool.query(
      `SELECT * FROM users WHERE username = $1 LIMIT 1`,
      [username]
    );
    const user = userResult.rows[0];

    if (!user) {
      const hashedPassword = await bcrypt.hash(password, 10);
      const placeholderId = randomUUID();
      const placeholderResult = await pool.query(
        `
          INSERT INTO users (id, username, password, is_placeholder)
          VALUES ($1, $2, $3, true)
          RETURNING *
        `,
        [placeholderId, username, hashedPassword]
      );

      return res.status(409).json({
        error: "User not registered. Please complete the sign-up process.",
        redirectTo: "/signup",
        user: formatUser(placeholderResult.rows[0]),
      });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(400).json({ error: "Invalid password" });
    }

    if (user.is_placeholder) {
      return res.status(409).json({
        error: "Please complete the sign-up process.",
        redirectTo: "/signup",
        user: formatUser(user),
      });
    }

    res.json(formatUser(user));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Login failed" });
  }
});

app.get(`${API_PREFIX}/auth/user/:id`, async (req, res) => {
  const { id } = req.params;
  try {
    const userResult = await pool.query(
      `SELECT * FROM users WHERE id = $1 LIMIT 1`,
      [id]
    );
    const user = userResult.rows[0];

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(formatUser(user));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch user" });
  }
});

app.put(`${API_PREFIX}/auth/user/:id`, async (req, res) => {
  const { id } = req.params;
  const { fullName, username, email, bio, location, avatar } = req.body;

  try {
    const columnMap = {
      fullName: ["full_name", fullName],
      username: ["username", username],
      email: ["email", email],
      bio: ["bio", bio],
      location: ["location", location],
      avatar: ["avatar", avatar],
    };

    const setClauses = [];
    const values = [];
    let index = 1;

    Object.values(columnMap).forEach(([column, value]) => {
      if (value !== undefined) {
        setClauses.push(`${column} = $${index}`);
        values.push(value);
        index += 1;
      }
    });

    setClauses.push(`is_placeholder = false`);
    setClauses.push(`updated_at = NOW()`);
    setClauses.push(`join_date = COALESCE(join_date, NOW())`);

    const query = `
      UPDATE users
      SET ${setClauses.join(", ")}
      WHERE id = $${index}
      RETURNING *
    `;

    const updatedResult = await pool.query(query, [...values, id]);
    const updatedUser = updatedResult.rows[0];

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(formatUser(updatedUser));
  } catch (err) {
    console.error(err);
    if (err.code === "23505") {
      return res
        .status(400)
        .json({ error: "Username or email already exists" });
    }
    res.status(500).json({ error: "Failed to update user" });
  }
});

const PORT = process.env.BACKEND_PORT || 5001;
app.listen(PORT, "0.0.0.0", () =>
  console.log(`Server running on port ${PORT}`)
);
