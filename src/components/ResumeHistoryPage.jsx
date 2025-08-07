import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { toast } from "react-toastify";

const ResumeHistoryPage = () => {
  const { user } = useContext(AuthContext);
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchAnalyses = async () => {
      if (!user) return;

      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const response = await fetch("http://localhost:5000/api/resume-analyses", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || "Error fetching analyses");
        }
        setAnalyses(data);
      } catch (error) {
        console.error("Fetch error:", error);
        toast.error("Failed to load analysis history.");
      } finally {
        setLoading(false);
      }
    };

    fetchAnalyses();
  }, [user]);

  const getMatchLevel = (score) => {
    if (score <= 25) return { label: "Poor", color: "text-red-600" };
    if (score <= 50) return { label: "Fair", color: "text-yellow-600" };
    if (score <= 75) return { label: "Good", color: "text-blue-600" };
    return { label: "Excellent", color: "text-green-600" };
  };

  return (
    <div className="min-h-screen p-6 bg-gradient-to-b from-[#0a0a23] to-[#12123a] font-poppins flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-2xl w-full border border-gray-200">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
          Resume Analysis History
        </h2>

        {loading && (
          <div className="text-center text-gray-600">Loading analyses...</div>
        )}

        {!loading && analyses.length === 0 && (
          <div className="text-center text-gray-600">
            No analyses found. Try checking a resume!
          </div>
        )}

        {!loading && analyses.length > 0 && (
          <div className="space-y-6">
            {analyses.map((analysis, index) => (
              <div
                key={index}
                className="p-4 bg-gray-50 rounded-xl border border-gray-200"
              >
                <p className="text-sm text-gray-500 mb-2">
                  Analyzed on: {new Date(analysis.createdAt).toLocaleString()}
                </p>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  Job Description:
                </h3>
                <p className="text-sm text-gray-600 mb-4 whitespace-pre-wrap">
                  {analysis.jobDescription.substring(0, 200)}
                  {analysis.jobDescription.length > 200 ? "..." : ""}
                </p>
                <div className="mb-4">
                  <h4 className="text-lg font-semibold text-gray-800">
                    Match Score:
                  </h4>
                  <p className={`text-2xl font-bold ${getMatchLevel(analysis.analysis.matchScore).color}`}>
                    {analysis.analysis.matchScore}%
                  </p>
                  <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                    <div
                      className={`h-2.5 rounded-full ${
                        getMatchLevel(analysis.analysis.matchScore).label === "Poor"
                          ? "bg-red-600"
                          : getMatchLevel(analysis.analysis.matchScore).label === "Fair"
                          ? "bg-yellow-600"
                          : getMatchLevel(analysis.analysis.matchScore).label === "Good"
                          ? "bg-blue-600"
                          : "bg-green-600"
                      }`}
                      style={{ width: `${analysis.analysis.matchScore}%` }}
                    ></div>
                  </div>
                  <p className={`text-sm font-medium ${getMatchLevel(analysis.analysis.matchScore).color} mt-1`}>
                    Match Level: {getMatchLevel(analysis.analysis.matchScore).label}
                  </p>
                </div>
                <div className="mb-4">
                  <h4 className="text-lg font-semibold text-gray-800">
                    💪 Strengths:
                  </h4>
                  <ul className="text-md text-green-700 list-disc pl-5 space-y-1">
                    {analysis.analysis.strengths.map((strength, i) => (
                      <li key={i}>{strength}</li>
                    ))}
                  </ul>
                </div>
                <div className="mb-4">
                  <h4 className="text-lg font-semibold text-gray-800">
                    🧱 Gaps:
                  </h4>
                  <ul className="text-md text-red-700 list-disc pl-5 space-y-1">
                    {analysis.analysis.gaps.map((gap, i) => (
                      <li key={i}>{gap}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-800">
                    🛠 Improvements:
                  </h4>
                  <ul className="text-md text-purple-700 list-disc pl-5 space-y-1">
                    {analysis.analysis.improvements.map((improvement, i) => (
                      <li key={i}>{improvement}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ResumeHistoryPage;