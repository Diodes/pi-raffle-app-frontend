import { useEffect, useState } from "react";

function App() {
  const [user, setUser] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState("");
  const [log, setLog] = useState("");

  useEffect(() => {
    // Initialize Pi SDK in sandbox mode
    if (window.Pi) {
      window.Pi.init({ version: "2.0", sandbox: true });
      setLog("✅ Pi SDK initialized (sandbox mode)");
    } else {
      setLog("❌ Pi SDK not found");
    }
  }, []);

  const onIncompletePaymentFound = (payment) => {
    console.log("⚠️ Incomplete payment found", payment);
    setPaymentStatus("⚠️ Incomplete payment found");
  };

  const handleLogin = async () => {
    if (!window.Pi) {
      setLog("❌ Pi SDK not loaded");
      return;
    }

    try {
      setLog("🔐 Attempting Pi.authenticate...");
      const scopes = ["username", "payments"];
      const user = await window.Pi.authenticate(scopes, onIncompletePaymentFound);
      console.log("✅ Authenticated user:", user);
      setUser(user);
      setLog(`✅ Logged in as ${user.username}`);
    } catch (err) {
      console.error("❌ Login failed:", err);
      setLog("❌ Login failed: " + (err.message || err));
    }
  };

  const handlePayment = async () => {
    if (!user) {
      setPaymentStatus("❌ You must login first");
      return;
    }

    try {
      const paymentData = {
        amount: 0.001,
        memo: "Demo Payment",
        metadata: { type: "demo" },
      };

      const payment = await window.Pi.createPayment(paymentData, {
        onReadyForServerApproval: (paymentId) => {
          setPaymentStatus("🟡 Ready for server approval: " + paymentId);
        },
        onReadyForServerCompletion: (paymentId, txid) => {
          setPaymentStatus("✅ Payment complete! TXID: " + txid);
        },
        onCancel: (paymentId) => {
          setPaymentStatus("⚠️ Payment cancelled: " + paymentId);
        },
        onError: (error, payment) => {
          setPaymentStatus("❌ Payment error: " + error.message || error);
        },
      });

      console.log("Payment response:", payment);
    } catch (err) {
      console.error("❌ Payment failed:", err);
      setPaymentStatus("❌ Payment failed: " + (err.message || err));
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Pi Demo App</h1>

      <p className="text-sm text-gray-700 mb-2">{log}</p>
      <p className="text-sm text-blue-600 mb-4">{paymentStatus}</p>

      {!user ? (
        <button
          className="bg-purple-600 text-white px-4 py-2 rounded"
          onClick={handleLogin}
        >
          Login with Pi
        </button>
      ) : (
        <div>
          <p className="mb-2">Welcome, <strong>{user.username}</strong></p>
          <button
            className="bg-green-600 text-white px-4 py-2 rounded"
            onClick={handlePayment}
          >
            Test Pi Payment
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
