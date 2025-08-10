import { useState, useContext, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const IndustrySelection = () => {
  const { user, login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [industry, setIndustry] = useState(user?.industry || "");
  const [error, setError] = useState("");

  useEffect(() => {
    if (user?.industry) {
      navigate("/home");
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!industry) {
      setError("Please select an industry");
      return;
    }
    setError(""); // Clear previous errors
    try {
      const token = localStorage.getItem("token");
      console.log("Token used:", token ? "Present" : "Missing", token);
      const response = await fetch(process.env.NODE_ENV === "development" ? "https://careerhub25.onrender.com/api/user/industry" : "/api/user/industry", {
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
        data = JSON.parse(text);
      } catch (parseError) {
        throw new Error("Invalid JSON response: " + text);
      }
      if (!response.ok) {
        throw new Error(data.error || "Failed to update industry");
      }
      console.log("Parsed response data:", data);
      const updatedUser = { ...user, industry };
      login(updatedUser, token);
      navigate("/home");
    } catch (err) {
      console.error("Error in handleSubmit:", err.message, err.stack);
      setError(`Failed to save industry: ${err.message}`);
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
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="p-6 w-full max-w-md bg-white rounded-lg shadow-2xl border border-gray-200">
        <h2 className="text-3xl font-bold mb-6 text-gray-800 text-center">
          Select Your Industry
        </h2>
        {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <select
            value={industry}
            onChange={(e) => setIndustry(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
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
            className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200"
          >
            Save and Continue
          </button>
        </form>
      </div>
    </div>
  );
};

export default IndustrySelection;