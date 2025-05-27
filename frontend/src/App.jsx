import { useState, useEffect } from "react";

function App() {
  const [user, setUser] = useState(null);
  const [sdkStatus, setSdkStatus] = useState("");
  const [logMessage, setLogMessage] = useState("");
  const [paymentLog, setPaymentLog] = useState("");

  const onIncompletePaymentFound = (payment) => {
    console.warn("⚠️ Incomplete payment found:", payment);
    setPaymentLog(prev => prev + "\n⚠️ Incomplete payment found: " + JSON.stringify(payment));
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
          console.log("🟡 onReadyForServerApproval:", paymentId);
          setPaymentLog(prev => prev + `\n🟡 Approving payment: ${paymentId}`);

          try {
            const res = await fetch("https://pi-raffle-backend.onrender.com/payments/approve", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ paymentId }),
            });

            const result = await res.json();
            console.log("✅ Server approved payment:", result);
            setPaymentLog(prev => prev + `\n✅ Server response: ${JSON.stringify(result)}`);

            if (result.status === "approved") {
              await payment.approve();
              console.log("✅ Called payment.approve()");
              setPaymentLog(prev => prev + "\n✅ Called payment.approve()");
            } else {
              setPaymentLog(prev => prev + "\n❌ Server did not approve the payment");
            }
          } catch (err) {
            console.error("❌ Approval failed:", err);
            setPaymentLog(prev => prev + "\n❌ Approval error: " + err.message);
          }
        },

        onReadyForServerCompletion: async (paymentId, txid) => {
          console.log("🟢 onReadyForServerCompletion:", paymentId, txid);
          setPaymentLog(prev => prev + `\n🔄 Completing payment: ${paymentId} (TXID: ${txid})`);

          try {
            const res = await fetch("https://pi-raffle-backend.onrender.com/payments/complete", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ paymentId, txid }),
            });

            const result = await res.json();
            console.log("✅ Server completed payment:", result);
            setPaymentLog(prev => prev + `\n✅ Server response: ${JSON.stringify(result)}`);

            if (result.success) {
              await payment.complete();
              console.log("✅ Called payment.complete()");
              setPaymentLog(prev => prev + "\n✅ Payment completed!");
            } else {
              setPaymentLog(prev => prev + "\n❌ Server did not complete the payment");
            }
          } catch (err) {
            console.error("❌ Completion failed:", err);
            setPaymentLog(prev => prev + "\n❌ Completion error: " + err.message);
          }
        },

        onCancel: (paymentId) => {
          console.warn("⚠️ Payment cancelled:", paymentId);
          setPaymentLog(prev => prev + "\n⚠️ Payment was cancelled.");
        },

        onError: (err) => {
          console.error("❌ Payment error:", err);
          setPaymentLog(prev => prev + "\n❌ Payment error: " + err.message);
        },
      });

      console.log("🧾 Payment object returned:", payment);
      setPaymentLog(prev => prev + "\n🧾 Payment object created.");
    } catch (err) {
      console.error("❌ Failed to create payment:", err);
      setPaymentLog(prev => prev + "\n❌ Failed to create payment: " + err.message);
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
      <p className="text-sm mt-1 text-red-600 whitespace-pre-line">{logMessage}</p>
      <p className="text-sm mt-1 text-blue-600 whitespace-pre-line">{paymentLog}</p>

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