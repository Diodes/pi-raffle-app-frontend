import { useState, useEffect } from "react";

function App() {
  const [logMessage, setLogMessage] = useState("");
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (window.Pi) {
      window.Pi.init({ version: "2.0", sandbox: true });
      setLogMessage("✅ Pi SDK loaded (sandbox)");
    } else {
      setLogMessage("❌ Pi SDK not found");
    }
  }, []);

  const handleLogin = async () => {
    try {
      const scopes = ["username", "payments"];
      setLogMessage("🚀 Calling Pi.authenticate...");

      const user = await window.Pi.authenticate(scopes, () => {});
      setUser(user);
      setLogMessage(`✅ Logged in as ${user.username}`);
    } catch (err) {
      setLogMessage(`❌ Login failed: ${err.message || err}`);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-white text-center p-4">
      <h1 className="text-3xl font-bold mb-4">🎟️ RaffleRun</h1>
      <p className="text-lg mb-2">Welcome to our Pi raffle demo!</p>
      <p className="text-gray-600 mb-4">
        This app is in sandbox mode for testing Pi integration.
      </p>
      <button
        className="px-6 py-3 bg-purple-600 text-white rounded text-lg"
        onClick={handleLogin}
      >
        Login with Pi
      </button>
      <p className="text-sm text-gray-500 mt-6">{logMessage}</p>
    </div>
  );
}

export default App;
