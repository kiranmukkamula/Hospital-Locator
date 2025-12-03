import { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export default function AuthProvider({ children }) {
  const [isLoggedin, setLogged] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) setLogged(true);
  }, []);

  return (
    <AuthContext.Provider value={{ isLoggedin, setLogged }}>
      {children}
    </AuthContext.Provider>
  );
}
