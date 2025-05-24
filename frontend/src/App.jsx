import { useState, useEffect } from "react";

function App() {
  const [user, setUser] = useState(null);
  const [sdkStatus, setSdkStatus] = useState("");

  const onIncompletePaymentFound = (payment) => {
    console.log("⚠️ Incomplete payment found:", payment);
    // You can handle this on the backend if needed
  };

  const handleLogin = async () => {
    alert("Login button was clicked!");
    try {
      const scopes = ["username", "payments"];

      console.log("💡 Pi SDK object:", window.Pi);
      window.Pi.init({ version: "2.0", sandbox: true });

      const user = await window.Pi.authenticate(scopes, onIncompletePaymentFound);
      setUser(user);
      console.log("✅ Pi user:", user);
    } catch (error) {
      console.error("❌ Pi login failed:", error);
      alert("Login failed. Check console.");
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

      {user ? (
        <div>
          <p>Welcome, <strong>{user.username}</strong>!</p>
        </div>
      ) : (
        <button
          className="px-4 py-2 bg-purple-600 text-white rounded"
          onClick={handleLogin}
        >
          Login with Pi
        </button>
      )}
    </div>
  );
}

export default App;
