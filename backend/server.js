const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));


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
    // Step 1: Get payment info
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

    // Step 2: Approve the payment only if not already approved
    if (!payment.status.developer_approved) {
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
      console.log("⚠️ Payment already approved");
      return res.json({ status: "already_approved" });
    }
  } catch (error) {
    console.error("❌ Error during approval process:", error);
    return res.status(500).json({ status: "error", message: error.message });
  }
});



// ✅ Use Render-compatible port binding
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`🚀 Backend server is running on port ${PORT}`);
});
