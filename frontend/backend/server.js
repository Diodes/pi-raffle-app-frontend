require("dotenv").config();
const express = require("express");
const cors = require("cors");

// ✅ Required to make Pi Platform API calls
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

const app = express();
const PORT = process.env.PORT || 5050;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Pi Raffle Backend Running");
});

// ✅ Real Pi payment approval endpoint
app.post("/payments/approve", async (req, res) => {
  const { paymentId } = req.body;

  try {
    const response = await fetch(`https://api.minepi.com/v2/payments/${paymentId}/approve`, {
      method: "POST",
      headers: {
        "Authorization": `Key ${process.env.PI_API_KEY}`,
        "Content-Type": "application/json",
      },
    });

    const result = await response.json();
    console.log("✅ Approved payment:", result);
    res.json(result);
  } catch (error) {
    console.error("❌ Error approving payment:", error);
    res.status(500).json({ error: "Approval failed" });
  }
});

// ✅ Real Pi payment completion endpoint
app.post("/payments/complete", async (req, res) => {
  const { paymentId, txid } = req.body;

  try {
    const response = await fetch(`https://api.minepi.com/v2/payments/${paymentId}/complete`, {
      method: "POST",
      headers: {
        "Authorization": `Key ${process.env.PI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ txid }),
    });

    const result = await response.json();
    console.log("✅ Completed payment:", result);
    res.json(result);
  } catch (error) {
    console.error("❌ Error completing payment:", error);
    res.status(500).json({ error: "Completion failed" });
  }
});

app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});
