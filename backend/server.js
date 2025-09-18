const express = require("express");
const app = express();
app.use(express.json());

// בדיקה בסיסית
app.get("/", (req, res) => {
  res.send("Backend is running!");
});

// auth endpoints (נמלא בהמשך)
app.post("/auth/register", (req, res) => {
  res.send("Register endpoint");
});

app.post("/auth/login", (req, res) => {
  res.send("Login endpoint");
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
