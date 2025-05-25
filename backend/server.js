require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Pi Raffle Backend Running");
});

// ✅ Simplified Pi payment approval endpoint
app.post("/payments/approve", (req, res) => {
  const { paymentId } = req.body;
  console.log("📥 /payments/approve HIT", paymentId);

  // Respond with approval — let Pi handle the rest
  res.json({ status: "approved" });
});

// ✅ Simplified Pi payment completion endpoint
app.post("/payments/complete", (req, res) => {
  const { paymentId, txid } = req.body;
  console.log("📥 /payments/complete HIT", paymentId, txid);

  // Acknowledge completion — again, let Pi handle confirmation
  res.json({ success: true });
});

app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});
