import { useEffect, useState } from "react";

function App() {
  const [user, setUser] = useState(null);

  const handleLogin = async () => {
    try {
      const scopes = ["username", "payments"];
      window.Pi.init({ version: "2.0" });

      const user = await window.Pi.authenticate(scopes, onIncompletePaymentFound);
      setUser(user);
      console.log("User info:", user);
    } catch (error) {
      console.error("Pi login failed:", error);
    }
  };

  const onIncompletePaymentFound = (payment) => {
    console.log("Handle unfinished payment:", payment);
    // You could mark it complete on the server if needed
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold">🚀 Pi Raffle App</h1>

      {user ? (
        <div>
          <p>Welcome, {user.username}!</p>
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