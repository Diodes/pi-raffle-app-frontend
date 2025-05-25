import { useState, useEffect } from "react";

function App() {
  const [user, setUser] = useState(null);
  const [sdkStatus, setSdkStatus] = useState("");
  const [logMessage, setLogMessage] = useState("");
  const [paymentLog, setPaymentLog] = useState("");

  const onIncompletePaymentFound = (payment) => {
    console.warn("⚠️ Incomplete payment found:", payment);
  };

  const handleLogin = async () => {
    try {
      setLogMessage("🟢 Pi.init + calling authenticate...");

      window.Pi.init({ version: "2.0" });

      const scopes = ["username", "payments"];
      const user = await window.Pi.authenticate(scopes, onIncompletePaymentFound);
      if (!user) {
        setLogMessage("❌ No user returned");
      } else {
        setUser(user);
        setLogMessage(`✅ Logged in as ${user.username}`);
      }
    } catch (error) {
      setLogMessage(`❌ Login error: ${error.message || error}`);
    }
  };

  const handleTestPayment = async () => {
    try {
      const paymentData = {
        amount: 0.001,
        memo: "Test Raffle Ticket",
        metadata: { test: true },
      };

      const payment = await window.Pi.createPayment(paymentData, {
        onReadyForServerApproval: async (paymentId) => {
          setPaymentLog(`🟡 Approving payment: ${paymentId}`);
          try {
            const res = await fetch("https://3e93-2607-fea8-4e61-6e00-ad3d-85-4253-acc6.ngrok-free.app/payments/approve", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ paymentId }),
            });
            const result = await res.json();
            console.log("✅ Server approved payment:", result);
          } catch (err) {
            console.error("❌ Approval failed:", err);
            setPaymentLog("❌ Approval error: " + err.message);
          }
        },
        onReadyForServerCompletion: async (paymentId, txid) => {
          setPaymentLog(`🔄 Completing payment: ${paymentId} (TXID: ${txid})`);
          try {
            const res = await fetch("https://3e93-2607-fea8-4e61-6e00-ad3d-85-4253-acc6.ngrok-free.app/payments/complete", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ paymentId, txid }),
            });
            const result = await res.json();
            console.log("✅ Server completed payment:", result);
            setPaymentLog("✅ Payment completed!");
          } catch (err) {
            console.error("❌ Completion failed:", err);
            setPaymentLog("❌ Completion error: " + err.message);
          }
        },
        onCancel: (paymentId) => {
          console.warn("⚠️ Payment cancelled:", paymentId);
          setPaymentLog("⚠️ Payment was cancelled.");
        },
        onError: (err) => {
          console.error("❌ Payment error:", err);
          setPaymentLog("❌ Payment error: " + err.message);
        },
      });

      console.log("Payment object returned:", payment);
    } catch (err) {
      console.error("❌ Failed to create payment:", err);
      setPaymentLog("❌ Failed to create payment: " + err.message);
    }
  };

  useEffect(() => {
    if (typeof window.Pi === "undefined") {
      setSdkStatus("❌ Pi SDK not loaded");
    } else {
      setSdkStatus("✅ Pi SDK loaded");
    }
  }, []);

  return (
    <div className="p-4 max-w-lg mx-auto">
      <h1 className="text-xl font-bold mb-2">🚀 Pi Raffle App</h1>
      <p className="text-sm text-gray-600">{sdkStatus}</p>
      <p className="text-sm mt-1 text-red-600">{logMessage}</p>
      <p className="text-sm mt-1 text-blue-600">{paymentLog}</p>

      {user ? (
        <div className="mt-4">
          <p>Welcome, <strong>{user.username}</strong>!</p>
          <button
            className="mt-4 px-4 py-2 bg-green-600 text-white rounded"
            onClick={handleTestPayment}
          >
            Test Pi Payment
          </button>
        </div>
      ) : (
        <button
          className="mt-4 px-4 py-2 bg-purple-600 text-white rounded"
          onClick={handleLogin}
        >
          Login with Pi
        </button>
      )}
    </div>
  );
}

export default App;
