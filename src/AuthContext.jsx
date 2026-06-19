import { createContext, useContext, useState } from "react";
import { ACCOUNTS } from "./data";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [registeredUsers, setRegisteredUsers] = useState([...ACCOUNTS]);

  const login = (email, password) => {
    const found = registeredUsers.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );
    if (found) {
      setUser(found);
      return { success: true };
    }
    return { success: false, error: "Invalid credentials. Please try again." };
  };

  const signup = (name, email, password, role) => {
    const exists = registeredUsers.find(
      (u) => u.email.toLowerCase() === email.toLowerCase()
    );
    if (exists) return { success: false, error: "An account with this email already exists." };

    const newUser = {
      id: registeredUsers.length + 1,
      name,
      email,
      password,
      role: role || "Operations Analyst",
      badge: `OA-${String(registeredUsers.length + 100).padStart(3, "0")}`,
      avatar: name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase(),
    };
    setRegisteredUsers((prev) => [...prev, newUser]);
    setUser(newUser);
    return { success: true };
  };

  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
