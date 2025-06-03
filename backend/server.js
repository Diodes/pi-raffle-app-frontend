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

  // ✅ Check if API key is loaded
  if (!process.env.PI_API_KEY) {
    console.error("❌ PI_API_KEY is missing in environment variables");
    return res.status(500).json({ status: "error", message: "Missing API key" });
  } else {
    console.log("🔐 Using Pi API Key: Loaded ✅");
  }

  try {
    const response = await fetch(`https://api.minepi.com/payments/${paymentId}`, {
      headers: {
        Authorization: `Key ${process.env.PI_API_KEY}`,
        "Content-Type": "application/json",
      },
    });

    // ✅ Log raw response for debugging
    if (!response.ok) {
      const errorText = await response.text();  // This gives us the actual Pi API error
      console.error("❌ Pi API response not OK:", errorText);
      return res.status(500).json({ status: "error", message: "Failed to verify payment" });
    }

    const data = await response.json();

    // ✅ Only approve if the payment is pending
    if (data && data.transaction && data.transaction.status === "pending") {
      console.log("✅ Payment verified with Pi Network");
      res.json({ status: "approved" });
    } else {
      console.warn("⚠️ Payment not pending or invalid response:", data);
      res.status(400).json({ status: "not_approved" });
    }
  } catch (error) {
    console.error("❌ Error verifying payment:", error);
    res.status(500).json({ status: "error", message: error.message });
  }
});


// ✅ Use Render-compatible port binding
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`🚀 Backend server is running on port ${PORT}`);
});
