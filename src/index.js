const express = require("express");
const app = express();
const cors = require("cors");
app.use(express.json()); 
app.use(cors {
  origin: "*",
  methods: ["GET", "POST"],
  credentials: true,
});
app.use(express.json());

module.exports = app;
