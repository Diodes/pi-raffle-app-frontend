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
    window.Pi.init({ version: "2.0" }); // NO sandbox

    const scopes = ["username", "payments"];
    const authResult = await window.Pi.authenticate(scopes, onIncompletePaymentFound);
    console.log("🔐 Pi.authenticate result:", authResult);

    const actualUser = authResult?.user || authResult; // Fallback to entire object if not nested
    if (!actualUser?.username) {
      setLogMessage("❌ No username found in auth result");
    } else {
      setUser(actualUser);
      setLogMessage(`✅ Logged in as ${actualUser.username}`);
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
     

     onReadyForServerCompletion: async (paymentId, txid) => {
  try {
    const res = await fetch("https://pi-raffle-backend.onrender.com/payments/complete", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ paymentId, txid }),
    });

    const result = await res.json();
    if (result.success) {
      setPaymentLog("✅ Payment completed (backend confirmed)!");
    } else {
      setPaymentLog("⚠️ Backend responded, but not successful: " + JSON.stringify(result));
    }
  } catch (err) {
    console.error("❌ Completion error:", err);
    setPaymentLog("❌ Completion error: " + err.message);
  }
},

onCancel: (paymentId) => {
  setPaymentLog("⚠️ Payment was cancelled.");
},

onError: (err) => {
  setPaymentLog("❌ Payment error: " + err.message);
},


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
          <p>Welcome, <strong>{user?.username || "Mystery Pioneer"}</strong>!</p>

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
