require("dotenv").config();
// Provide a fetch function for older Node versions that don't have global fetch.
let fetchFn = global.fetch;
if (!fetchFn) {
  try {
    // Try node-fetch v2 (CommonJS)
    fetchFn = require('node-fetch');
  } catch (err) {
    try {
      // Try dynamic import (node-fetch v3 ESM)
      fetchFn = (...args) => import('node-fetch').then(m => m.default(...args));
    } catch (err2) {
      console.warn('No global fetch and node-fetch not installed. OpenAI calls will fail.');
    }
  }
}
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
  
  await pool.query(`
    CREATE TABLE IF NOT EXISTS journals (
      id UUID PRIMARY KEY,
      name TEXT NOT NULL,
      locations JSONB DEFAULT '[]'::jsonb,
      start_date DATE,
      end_date DATE,
      summary TEXT DEFAULT '',
      ai_summary TEXT DEFAULT '',
      cover_image TEXT DEFAULT '/placeholder.svg',
      rating INTEGER,
      companions JSONB DEFAULT '[]'::jsonb,
      highlights JSONB DEFAULT '[]'::jsonb,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
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

// AI summarization endpoint
// Helper to generate AI summary via OpenAI
async function generateAISummary(payload) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OpenAI API key not configured');
  }

  const {
    name,
    locations,
    startDate,
    endDate,
    summary,
    highlights,
    companions,
  } = payload || {};

  const contentParts = [];
  if (name) contentParts.push(`Title: ${name}`);
  if (locations && Array.isArray(locations)) contentParts.push(`Locations: ${locations.join(', ')}`);
  if (startDate || endDate) contentParts.push(`Dates: ${startDate || ''} - ${endDate || ''}`);
  if (companions && companions.length) contentParts.push(`Companions: ${companions.join(', ')}`);
  if (highlights && highlights.length) contentParts.push(`Highlights: ${highlights.join('; ')}`);
  if (summary) contentParts.push(`User Summary: ${summary}`);

  const userPrompt = `Please generate a concise, engaging AI-written summary (2-4 sentences) for the following travel journal entry. Keep it positive and highlight memorable moments. Use natural language suitable for displaying in a UI.\n\n${contentParts.join('\n')}`;

  const model = process.env.OPENAI_MODEL || 'gpt-3.5-turbo';

  if (!fetchFn) {
    throw new Error('No fetch available. Install node-fetch or run on Node 18+.');
  }

  const resp = await fetchFn('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: 'You are a helpful assistant that writes short travel summaries.' },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 200,
    }),
  });

  if (!resp.ok) {
    const text = await resp.text();
    const err = new Error(`OpenAI response ${resp.status}: ${text}`);
    err.status = resp.status;
    throw err;
  }

  const data = await resp.json();
  const aiSummary = data?.choices?.[0]?.message?.content?.trim() || '';
  return aiSummary;
}

// Summarize-only endpoint (keeps backwards compatibility)
app.post(`${API_PREFIX}/summarize`, async (req, res) => {
  try {
    const aiSummary = await generateAISummary(req.body || {});
    res.json({ aiSummary });
  } catch (err) {
    console.error('Summarize error', err);
    res.status(500).json({ error: 'Failed to generate summary' });
  }
});

// Create a journal (generates AI summary and stores it)
app.post(`${API_PREFIX}/journals`, async (req, res) => {
  try {
    const {
      name,
      locations = [],
      startDate,
      endDate,
      summary = '',
      highlights = [],
      companions = [],
      coverImage = '/placeholder.svg',
      rating,
    } = req.body || {};

    const aiSummary = await generateAISummary({ name, locations, startDate, endDate, summary, highlights, companions });

    const id = randomUUID();
    const insert = await pool.query(
      `INSERT INTO journals (id, name, locations, start_date, end_date, summary, ai_summary, cover_image, rating, companions, highlights)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *`,
      [id, name, JSON.stringify(locations), startDate || null, endDate || null, summary, aiSummary, coverImage, rating || null, JSON.stringify(companions), JSON.stringify(highlights)]
    );

    res.json({ journal: insert.rows[0] });
  } catch (err) {
    console.error('Create journal error', err);
    res.status(500).json({ error: 'Failed to create journal' });
  }
});

// List journals
app.get(`${API_PREFIX}/journals`, async (req, res) => {
  try {
    const result = await pool.query(`SELECT * FROM journals ORDER BY created_at DESC`);
    res.json({ journals: result.rows });
  } catch (err) {
    console.error('List journals error', err);
    res.status(500).json({ error: 'Failed to list journals' });
  }
});

// Update journal (optionally regenerates AI summary)
app.put(`${API_PREFIX}/journals/:id`, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      locations,
      startDate,
      endDate,
      summary,
      highlights,
      companions,
      coverImage,
      rating,
      regenerateAI,
    } = req.body || {};

    let aiSummary = undefined;
    if (regenerateAI) {
      aiSummary = await generateAISummary({ name, locations, startDate, endDate, summary, highlights, companions });
    }

    const setClauses = [];
    const values = [];
    let idx = 1;
    if (name !== undefined) { setClauses.push(`name = $${idx++}`); values.push(name); }
    if (locations !== undefined) { setClauses.push(`locations = $${idx++}`); values.push(JSON.stringify(locations)); }
    if (startDate !== undefined) { setClauses.push(`start_date = $${idx++}`); values.push(startDate || null); }
    if (endDate !== undefined) { setClauses.push(`end_date = $${idx++}`); values.push(endDate || null); }
    if (summary !== undefined) { setClauses.push(`summary = $${idx++}`); values.push(summary); }
    if (aiSummary !== undefined) { setClauses.push(`ai_summary = $${idx++}`); values.push(aiSummary); }
    if (coverImage !== undefined) { setClauses.push(`cover_image = $${idx++}`); values.push(coverImage); }
    if (rating !== undefined) { setClauses.push(`rating = $${idx++}`); values.push(rating); }
    if (companions !== undefined) { setClauses.push(`companions = $${idx++}`); values.push(JSON.stringify(companions)); }
    if (highlights !== undefined) { setClauses.push(`highlights = $${idx++}`); values.push(JSON.stringify(highlights)); }

    setClauses.push(`updated_at = NOW()`);

    if (setClauses.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    const query = `UPDATE journals SET ${setClauses.join(', ')} WHERE id = $${idx} RETURNING *`;
    values.push(id);

    const updated = await pool.query(query, values);
    if (!updated.rows[0]) return res.status(404).json({ error: 'Journal not found' });
    res.json({ journal: updated.rows[0] });
  } catch (err) {
    console.error('Update journal error', err);
    res.status(500).json({ error: 'Failed to update journal' });
  }
});

// Delete journal
app.delete(`${API_PREFIX}/journals/:id`, async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await pool.query(`DELETE FROM journals WHERE id = $1 RETURNING *`, [id]);
    if (!deleted.rows[0]) return res.status(404).json({ error: 'Journal not found' });
    res.json({ journal: deleted.rows[0] });
  } catch (err) {
    console.error('Delete journal error', err);
    res.status(500).json({ error: 'Failed to delete journal' });
  }
});

const PORT = process.env.BACKEND_PORT || 5001;
app.listen(PORT, "0.0.0.0", () =>
  console.log(`Server running on port ${PORT}`)
);
