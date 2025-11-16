require("dotenv").config();
const { Pool } = require("pg");

const {
  DATABASE_URL,
  PGHOST,
  PGPORT,
  PGDATABASE,
  PGUSER,
  PGPASSWORD,
  PGSSL,
  NODE_ENV,
} = process.env;

const parseBoolean = (value) => {
  if (value === undefined || value === null || value === "") return false;
  return ["1", "true", "yes", "on"].includes(String(value).toLowerCase());
};

const shouldUseSSL = parseBoolean(PGSSL) || NODE_ENV === "production";

const baseConfig = DATABASE_URL
  ? { connectionString: DATABASE_URL }
  : {
      host: PGHOST || "127.0.0.1",
      port: PGPORT ? Number(PGPORT) : 5432,
      database: PGDATABASE || "travel_journal",
      user: PGUSER || "postgres",
      password: PGPASSWORD || "postgres",
    };

const pool = new Pool(
  shouldUseSSL
    ? {
        ...baseConfig,
        ssl: { rejectUnauthorized: false },
      }
    : baseConfig
);

pool.on("error", (err) => {
  console.error("Unexpected PostgreSQL client error", err);
});

module.exports = pool;
