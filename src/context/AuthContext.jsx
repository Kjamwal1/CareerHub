import { createContext, useState, useEffect, useContext } from "react";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [industry, setIndustry] = useState(null); // New industry state

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");
    const storedIndustry = localStorage.getItem("industry");
    if (token && userData) {
      try {
        setUser(JSON.parse(userData));
        if (storedIndustry) setIndustry(storedIndustry);
      } catch (error) {
        console.error("Error parsing user data from localStorage:", error.message);
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        localStorage.removeItem("industry");
      }
    }
  }, []);

  const login = (userInfo, token) => {
    setUser(userInfo);
    localStorage.setItem("user", JSON.stringify(userInfo));
    localStorage.setItem("token", token);
  };

  const logout = () => {
    setUser(null);
    setIndustry(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("industry");
  };

  const updateIndustry = (newIndustry) => {
    setIndustry(newIndustry);
    localStorage.setItem("industry", newIndustry);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, industry, updateIndustry }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
export default AuthProvider;
