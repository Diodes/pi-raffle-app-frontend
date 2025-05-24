const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 5050;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Pi Raffle Backend Running");
});

// 💰 Step 1: Handle payment approval
app.post("/payments/approve", (req, res) => {
  const { paymentId } = req.body;

  console.log("Received approval request for payment:", paymentId);

  // For now, approve every payment
  res.json({ status: "approved" });
});

// ✅ Step 2: Handle payment completion (optional logging)
app.post("/payments/complete", (req, res) => {
  const { paymentId, txid } = req.body;

  console.log("Payment completed:", paymentId, "TXID:", txid);

  res.json({ success: true });
});

app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});
