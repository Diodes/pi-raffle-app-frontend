console.log("🔥 Starting backend server...");
require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Pi Raffle Backend Running");
});

app.post("/payments/approve", (req, res) => {
  const { paymentId } = req.body;
  console.log("📥 /payments/approve HIT", paymentId);
  res.json({ status: "approved" });
});

app.post("/payments/complete", (req, res) => {
  const { paymentId, txid } = req.body;
  console.log("📥 /payments/complete HIT", paymentId, txid);
  res.json({ success: true });
});

app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});