 import { createContext, useState, useEffect, useContext } from "react";
  import { jwtDecode } from "jwt-decode"; // Updated import

  export const AuthContext = createContext();

  export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [industry, setIndustry] = useState(null);

    useEffect(() => {
      const token = localStorage.getItem("token");
      const userData = localStorage.getItem("user");
      const storedIndustry = localStorage.getItem("industry");

      if (token && userData) {
        try {
          const decodedToken = jwtDecode(token);
          const currentTime = Date.now() / 1000; // Convert to seconds
          if (decodedToken.exp < currentTime) {
            // Token expired
            localStorage.removeItem("user");
            localStorage.removeItem("token");
            localStorage.removeItem("industry");
            setUser(null);
            setIndustry(null);
            console.warn("Token expired, please log in again");
            return;
          }
          setUser(JSON.parse(userData));
          if (storedIndustry) setIndustry(storedIndustry);
        } catch (error) {
          console.error("Error parsing user data or token:", error.message);
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