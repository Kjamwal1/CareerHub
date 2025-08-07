import React, { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const ResumeCheckerPage = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [selectedFile, setSelectedFile] = useState(null);
  const [jobDescription, setJobDescription] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState("");
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);

  const allowedTypes = [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "image/jpeg",
    "image/png",
  ];

  const handleFile = (file) => {
    if (!allowedTypes.includes(file.type)) {
      setError("Only PDF, DOCX, JPG, and PNG files are allowed.");
      setSelectedFile(null);
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setError("File must be under 2MB.");
      setSelectedFile(null);
      return;
    }
    setSelectedFile(file);
    setError("");
    setAnalysis(null);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = () => setDragActive(false);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) handleFile(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      setError("Please log in to check your resume.");
      toast.error("Please log in to check your resume.");
      return;
    }
    if (!selectedFile) {
      setError("Please select a file.");
      toast.error("Please select a file.");
      return;
    }
    if (!jobDescription) {
      setError("Please enter a job description.");
      toast.error("Please enter a job description.");
      return;
    }

    setLoading(true);
    setError("");
    setAnalysis(null);

    const formData = new FormData();
    formData.append("resume", selectedFile);
    formData.append("jobDescription", jobDescription);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/check-resume", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) {
        setError(data.error || "Error analyzing resume.");
        toast.error(data.error || "Error analyzing resume.");
      } else {
        setAnalysis(data);
      }
    } catch (error) {
      console.error("Fetch error:", error);
      setError("Failed to connect to the server. Please try again.");
      toast.error("Failed to connect to the server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getMatchLevel = (score) => {
    if (score <= 25) return { label: "Poor", color: "text-red-600" };
    if (score <= 50) return { label: "Fair", color: "text-yellow-600" };
    if (score <= 75) return { label: "Good", color: "text-blue-600" };
    return { label: "Excellent", color: "text-green-600" };
  };

  const handleMentorClick = () => {
    if (analysis) {
      navigate("/chatbot", { state: { analysis } });
    }
  };

  return (
    <div className="min-h-screen p-6 bg-gradient-to-b from-[#0a0a23] to-[#12123a] font-poppins flex items-center justify-center relative">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-xl w-full border border-gray-200">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
          Upload Resume for ATS Check
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-gray-700 mb-2">Job Description:</label>
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste or type the job description here..."
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-600 text-black"
              rows="5"
              style={{ color: "black" }}
            />
          </div>

          <div
            className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors duration-200 ${
              dragActive
                ? "border-purple-600 bg-purple-50"
                : "border-gray-300 bg-gray-100"
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <p className="text-gray-700 mb-2">
              Drag and drop your <strong>PDF</strong>, <strong>DOCX</strong>,{" "}
              <strong>JPG</strong>, or <strong>PNG</strong> file here, or{" "}
              <label
                htmlFor="file-upload"
                className="text-purple-600 underline cursor-pointer"
              >
                browse
              </label>
            </p>
            <input
              id="file-upload"
              type="file"
              accept=".pdf,.docx,.jpg,.png"
              onChange={handleFileChange}
              className="hidden"
            />
            <p className="text-sm text-gray-500">Max file size: 2MB</p>
          </div>

          {selectedFile && (
            <div className="text-sm text-green-600 font-medium">
              ✅ Selected: {selectedFile.name}
            </div>
          )}

          {error && (
            <div className="text-sm text-red-500 font-medium">⚠️ {error}</div>
          )}

          <button
            type="submit"
            disabled={!selectedFile || !jobDescription || loading}
            className={`w-full py-2 px-4 rounded-md text-white font-semibold transition ${
              selectedFile && jobDescription && !loading
                ? "bg-[#A259FF] hover:bg-[#8A42E8]"
                : "bg-gray-400 cursor-not-allowed"
            }`}
          >
            {loading ? "Analyzing..." : "Check Resume"}
          </button>
        </form>

        {analysis && (
          <div className="mt-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
            <h3 className="text-2xl font-bold text-green-700 mb-4 text-center">
              Resume Analysis Results
            </h3>
            <div className="mb-6">
              <h4 className="text-xl font-semibold text-gray-800">
                Match Score:
              </h4>
              <p
                className={`text-3xl font-bold ${
                  getMatchLevel(analysis.matchScore).color
                }`}
              >
                {analysis.matchScore}%
              </p>
              <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                <div
                  className={`h-2.5 rounded-full ${
                    getMatchLevel(analysis.matchScore).label === "Poor"
                      ? "bg-red-600"
                      : getMatchLevel(analysis.matchScore).label === "Fair"
                      ? "bg-yellow-600"
                      : getMatchLevel(analysis.matchScore).label === "Good"
                      ? "bg-blue-600"
                      : "bg-green-600"
                  }`}
                  style={{ width: `${analysis.matchScore}%` }}
                ></div>
              </div>
              <p
                className={`text-sm font-medium ${
                  getMatchLevel(analysis.matchScore).color
                } mt-1`}
              >
                Match Level: {getMatchLevel(analysis.matchScore).label}
              </p>
            </div>
            <div className="mb-6">
              <h4 className="text-xl font-semibold text-gray-800">
                💪 Strengths:
              </h4>
              <ul className="text-lg text-green-700 list-disc pl-5 space-y-2">
                {analysis.strengths.map((strength, index) => (
                  <li key={index}>{strength}</li>
                ))}
              </ul>
            </div>
            <div className="mb-6">
              <h4 className="text-xl font-semibold text-gray-800">🧱 Gaps:</h4>
              <ul className="text-lg text-red-700 list-disc pl-5 space-y-2">
                {analysis.gaps.map((gap, index) => (
                  <li key={index}>{gap}</li>
                ))}
              </ul>
            </div>
            <div className="mb-6">
              <h4 className="text-xl font-semibold text-gray-800">
                🛠 Improvements:
              </h4>
              <ul className="text-lg text-purple-700 list-disc pl-5 space-y-2">
                {analysis.improvements.map((improvement, index) => (
                  <li key={index}>{improvement}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {analysis && (
          <div
            className="fixed bottom-6 right-6 bg-blue-600 text-white rounded-full p-4 cursor-pointer shadow-lg hover:bg-blue-700 transition"
            onClick={handleMentorClick}
            style={{ zIndex: 1000 }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {/* Modern chatbot icon placeholder - adjust based on your image */}
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-2-13h4v2h-4V7zm0 4h4v6h-4v-6z"
              />
              <circle cx="12" cy="10" r="2" fill="#3B82F6" /> {/* Blue head */}
              <line
                x1="12"
                y1="10"
                x2="12"
                y2="6"
                stroke="#3B82F6"
                strokeWidth={1}
              />{" "}
              {/* Antenna */}
            </svg>
          </div>
        )}

        {analysis && (
          <div className="mt-6 p-4 bg-yellow-100 rounded-xl border-2 border-yellow-400">
            <h4 className="text-2xl font-bold text-yellow-800 mb-4 text-center">
              Job Matching Suggestions
            </h4>
            <ul className="text-lg text-blue-600 list-disc pl-5 space-y-2">
              <li>
                <a
                  href="https://www.jobscan.co"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline"
                >
                  Jobscan - Optimize your resume for ATS
                </a>
              </li>
              <li>
                <a
                  href="https://www.careerflow.ai"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline"
                >
                  Careerflow - AI Resume and LinkedIn Optimization
                </a>
              </li>
              <li>
                <a
                  href="https://www.firstresume.ai"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline"
                >
                  FirstResume - AI Job Matching
                </a>
              </li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResumeCheckerPage;
