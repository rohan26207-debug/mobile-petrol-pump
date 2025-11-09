import React from "react";
import "./App.css";
import { HashRouter, Routes, Route } from "react-router-dom";
import ZAPTRStyleCalculator from "./components/ZAPTRStyleCalculator";
import LoginScreen from "./components/LoginScreen";
import { Toaster } from "./components/ui/toaster";
import { AuthProvider, useAuth } from "./contexts/AuthContext";

// Protected route wrapper
function ProtectedApp() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginScreen />;
  }

  return <ZAPTRStyleCalculator />;
}

function App() {
  return (
    <AuthProvider>
      <div className="App">
        <HashRouter>
          <Routes>
            <Route path="/" element={<ProtectedApp />} />
          </Routes>
          <Toaster />
        </HashRouter>
      </div>
    </AuthProvider>
  );
}

export default App;