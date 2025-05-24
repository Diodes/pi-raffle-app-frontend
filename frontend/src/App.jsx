import { useState, useEffect } from "react";

function App() {
  const [user, setUser] = useState(null);
  const [sdkStatus, setSdkStatus] = useState("");
  const [logMessage, setLogMessage] = useState("");
  const [paymentLog, setPaymentLog] = useState("");

  const onIncompletePaymentFound = (payment) => {
    setLogMessage("⚠️ Incomplete payment found: " + JSON.stringify(payment));
  };

  const handleLogin = async () => {
  try {
    const scopes = ["username", "payments"];
    setLogMessage("🟢 Pi.init + calling authenticate...");

    window.Pi.init({ version: "2.0", sandbox: true });

    if (!window.Pi.authenticate) {
      setLogMessage("❌ Pi.authenticate is not defined.");
      return;
    }

    const user = await window.Pi.authenticate(scopes, onIncompletePaymentFound);

    if (!user) {
      setLogMessage("❌ No user returned.");
    } else {
      setUser(user);
      setLogMessage(`✅ Logged in as ${user.username}`);
    }
  } catch (error) {
    setLogMessage(`❌ Login error: ${error.message || "unknown"}`);
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
        setPaymentLog(`🟡 Ready for server approval: ${paymentId}`);
      },
      onReadyForServerCompletion: (paymentId, txid) => {
        setPaymentLog(`✅ Payment complete! ID: ${paymentId}, TXID: ${txid}`);
      },
      onCancel: (paymentId) => {
        setPaymentLog(`⚠️ Payment cancelled: ${paymentId}`);
      },
      onError: (error) => {
        setPaymentLog(`❌ Payment error: ${error.message || error}`);
      },
    });

    console.log("Payment object returned:", payment);
  } catch (err) {
    setPaymentLog(`❌ Failed to create payment: ${err.message || err}`);
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
      <p className="text-sm mt-2 text-blue-600">{paymentLog}</p>

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
