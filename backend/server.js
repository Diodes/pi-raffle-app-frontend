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

  try {
    const response = await fetch(`https://api.minepi.com/payments/${paymentId}`, {
      headers: {
        Authorization: `Key ${process.env.PI_API_KEY}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      console.error("❌ Pi API response not OK");
      return res.status(500).json({ status: "error", message: "Failed to verify payment" });
    }

    const data = await response.json();

    // ✅ Only approve if the payment is in the 'pending' state
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
