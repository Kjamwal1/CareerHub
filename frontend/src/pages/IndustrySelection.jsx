import { useState, useContext, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";

const IndustrySelection = () => {
  const { user, login } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [industry, setIndustry] = useState(user?.industry || "");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user?.industry) {
      // Redirect to origin page or /home if no origin
      const redirectTo = location.state?.from || "/home";
      navigate(redirectTo, { replace: true });
    }
  }, [user, navigate, location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!industry) {
      setError("Please select an industry");
      return;
    }
    setError("");
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("No authentication token found. Please log in again.");
        navigate("/login");
        return;
      }
      console.log("Token used:", token ? "Present" : "Missing", token);
      const response = await fetch('https://careerhub25.onrender.com/api/user/industry', {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ industry }),
      });
      console.log("Response status:", response.status);
      const text = await response.text();
      console.log("Raw response:", text);
      let data;
      try {
        data = text ? JSON.parse(text) : {};
      } catch (parseError) {
        throw new Error(`Invalid JSON response: ${text || "Empty response"}`);
      }
      if (!response.ok) {
        throw new Error(data.error || `Failed to update industry (Status: ${response.status})`);
      }
      console.log("Parsed response data:", data);
      const updatedUser = { ...user, industry };
      login(updatedUser, token);
      // Redirect to origin page or /home if no origin
      const redirectTo = location.state?.from || "/home";
      navigate(redirectTo, { replace: true });
    } catch (err) {
      console.error("Error in handleSubmit:", err.message, err.stack);
      setError(`Failed to save industry: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const industries = [
    "Technology",
    "Finance",
    "Healthcare",
    "Education",
    "Marketing",
    "Engineering",
    "Retail",
    "Manufacturing",
    "Hospitality",
    "Other",
  ];

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-2 sm:p-4">
      <div className="p-4 sm:p-6 w-full max-w-md bg-white rounded-lg shadow-2xl border border-gray-200">
        <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-gray-800 text-center">
          Select Your Industry
        </h2>
        {error && <p className="text-red-500 text-xs sm:text-sm mb-2 sm:mb-4 text-center">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
          <select
            value={industry}
            onChange={(e) => setIndustry(e.target.value)}
            className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm"
            required
            disabled={isLoading}
          >
            <option value="">Select an industry</option>
            {industries.map((ind) => (
              <option key={ind} value={ind}>
                {ind}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className={`w-full px-4 sm:px-6 py-2 sm:py-3 rounded-lg transition-all duration-200 ${
              isLoading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
            } text-white text-xs sm:text-sm`}
            disabled={isLoading}
          >
            {isLoading ? 'Saving...' : 'Save and Continue'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default IndustrySelection;