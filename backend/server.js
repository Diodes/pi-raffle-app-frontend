const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
const pool = require("./db");


dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

app.post("/payments/approve", async (req, res) => {
  const { paymentId } = req.body;
  console.log("📥 /payments/approve HIT", paymentId);

  const PI_API_KEY = process.env.PI_API_KEY;
  if (!PI_API_KEY) {
    console.error("❌ PI_API_KEY is missing in environment variables");
    return res.status(500).json({ status: "error", message: "Missing API key" });
  }
  console.log("🔐 Using Pi API Key: Loaded ✅");

  const headers = {
    Authorization: `Key ${PI_API_KEY}`,
    "Content-Type": "application/json",
  };

  try {
    const paymentRes = await fetch(`https://api.minepi.com/v2/payments/${paymentId}`, {
      method: "GET",
      headers,
    });

    if (!paymentRes.ok) {
      const errorText = await paymentRes.text();
      console.error("❌ Pi API response not OK:", errorText);
      return res.status(500).json({ status: "error", message: "Failed to verify payment" });
    }

    const payment = await paymentRes.json();

    if (!payment.status.developer_approved && !payment.status.cancelled) {
      const approveRes = await fetch(`https://api.minepi.com/v2/payments/${paymentId}/approve`, {
        method: "POST",
        headers,
      });

      if (!approveRes.ok) {
        const errorText = await approveRes.text();
        console.error("❌ Pi API approval failed:", errorText);
        return res.status(500).json({ status: "error", message: "Approval failed", details: errorText });
      }

      console.log("✅ Payment approved on Pi Network");
      return res.json({ status: "approved" });
    } else {
      console.log("⚠️ Payment already approved or cancelled");
      return res.json({ status: "already_approved_or_cancelled" });
    }
  } catch (error) {
    console.error("❌ Error during approval process:", error);
    return res.status(500).json({ status: "error", message: error.message });
  }
});

app.post("/payments/complete", async (req, res) => {
  const { paymentId, txid } = req.body;
  console.log("📥 /payments/complete HIT", paymentId, txid);

  const PI_API_KEY = process.env.PI_API_KEY;
  if (!PI_API_KEY) {
    console.error("❌ PI_API_KEY is missing in environment variables");
    return res.status(500).json({ success: false, message: "Missing API key" });
  }

  const headers = {
    Authorization: `Key ${PI_API_KEY}`,
    "Content-Type": "application/json",
  };

  try {
    // Step 1: Tell Pi Network the payment is complete
    const completeRes = await fetch(`https://api.minepi.com/v2/payments/${paymentId}/complete`, {
      method: "POST",
      headers,
      body: JSON.stringify({ txid }),
    });

    if (!completeRes.ok) {
  const errorText = await completeRes.text();
  const fallback = `Status ${completeRes.status}`;
  console.error("❌ Error completing payment:", errorText || fallback);
  return res.status(500).json({ 
    success: false, 
    message: errorText || fallback 
  });
}


    // Step 2: Fetch payment info to extract user_uid
    const paymentInfoRes = await fetch(`https://api.minepi.com/v2/payments/${paymentId}`, {
      method: "GET",
      headers,
    });

    const paymentData = await paymentInfoRes.json();
    const user_uid = paymentData.user_uid;

    // Step 3: Insert ticket into the database
    await pool.query(
      `INSERT INTO tickets (user_uid, payment_id, txid) VALUES ($1, $2, $3)`,
      [user_uid, paymentId, txid]
    );

    console.log("✅ Payment marked complete & ticket stored 🎟️");
    res.json({ success: true });
  } catch (error) {
    console.error("❌ Completion Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`🚀 Backend server is running on port ${PORT}`);
});

