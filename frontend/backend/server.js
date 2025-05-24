const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 5050;

// ✅ Complete CORS setup
app.use(cors({
  origin: "http://localhost:5173",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());

// Optional: log requests
app.use((req, res, next) => {
  console.log(`Incoming request: ${req.method} ${req.url}`);
  next();
});

app.get("/", (req, res) => {
  res.send("Pi Raffle Backend Running");
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});