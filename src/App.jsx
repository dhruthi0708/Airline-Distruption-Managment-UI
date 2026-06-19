import { useState } from "react";
import { AuthProvider, useAuth } from "./AuthContext";
import Login from "./Login";
import Signup from "./Signup";
import Home from "./Home";

function AppInner() {
  const { user } = useAuth();
  const [page, setPage] = useState("login");

  if (user) return <Home />;
  if (page === "signup") return <Signup onGoLogin={() => setPage("login")} />;
  return <Login onGoSignup={() => setPage("signup")} />;
}

export default function App() {
  return (
    <AuthProvider>
      <AppInner />
    </AuthProvider>
  );
}
