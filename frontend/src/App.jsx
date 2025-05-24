import { useState, useEffect } from "react";

function App() {
  const [user, setUser] = useState(null);
  const [sdkStatus, setSdkStatus] = useState("");
  const [logMessage, setLogMessage] = useState("");

  const onIncompletePaymentFound = (payment) => {
    setLogMessage("⚠️ Incomplete payment found: " + JSON.stringify(payment));
  };

  const handleLogin = async () => {
    alert("Login button was clicked!");
    try {
      const scopes = ["username", "payments"];
      setLogMessage("💡 Pi SDK object: " + JSON.stringify(window.Pi));

      window.Pi.init({ version: "2.0", sandbox: true });
      setLogMessage("🚀 Calling Pi.authenticate...");

      const user = await window.Pi.authenticate(scopes, onIncompletePaymentFound);
      setUser(user);
      setLogMessage(`✅ Pi user: ${user.username}`);
    } catch (error) {
      setLogMessage(`❌ Pi login failed: ${error?.message || error}`);
      alert("Login failed. Check the screen for details.");
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
        onReadyForServerApproval: (paymentId) => {
          console.log("Ready for server approval", paymentId);
        },
        onReadyForServerCompletion: (paymentId, txid) => {
          console.log("Ready for server completion", paymentId, txid);
        },
        onCancel: (paymentId) => {
          console.log("Payment cancelled", paymentId);
        },
        onError: (error, payment) => {
          console.error("Payment error", error);
        },
      });

      console.log("Payment object returned:", payment);
    } catch (err) {
      console.error("Failed to create payment:", err);
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
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">🚀 Pi Raffle App</h1>
      <p className="text-sm mt-2">{sdkStatus}</p>
      <p className="text-sm mt-2 text-red-600">{logMessage}</p>

      {user ? (
        <div>
          <p>Welcome, <strong>{user.username}</strong>!</p>
        </div>
      ) : (
        <div>
          <button
            className="px-4 py-2 bg-purple-600 text-white rounded mr-2"
            onClick={handleLogin}
          >
            Login with Pi
          </button>
          <button
            className="px-4 py-2 bg-green-600 text-white rounded mt-2"
            onClick={handleTestPayment}
          >
            Test Pi Payment
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
