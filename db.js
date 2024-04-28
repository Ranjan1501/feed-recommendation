const { Pool } = require("pg");
require("dotenv").config();
const pool = new Pool({
  host: "db",
  port: 5432,
  user: "postgres",
  password: "",
  database: "leaguex",
});

module.exports = pool;
