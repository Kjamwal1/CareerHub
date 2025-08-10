import React, { useState, useContext } from "react";
import { CloudUpload } from "lucide-react";
import { AuthContext } from "../context/AuthContext"; // Import AuthContext
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const LinkedInOptimizer = () => {
  const { user } = useContext(AuthContext); // Use AuthContext for user authentication
  const navigate = useNavigate();
  const [selectedFile, setSelectedFile] = useState(null); // Renamed from pdfFile for clarity
  const [jobDescription, setJobDescription] = useState(""); // Added for job description input
  const [error, setError] = useState("");
  const [analysis, setAnalysis] = useState(null); // Changed from result to analysis for consistency
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false); // Added for drag-and-drop

  const handleFile = (file) => {
    if (!file || file.type !== "application/pdf") {
      setError("Please upload a valid PDF file.");
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

  const handlePdfUpload = async (e) => {
    e.preventDefault();

    if (!user) {
      setError("Please log in to analyze your LinkedIn profile.");
      toast.error("Please log in to analyze your LinkedIn profile.");
      return;
    }
    if (!selectedFile) {
      setError("Please select a PDF file.");
      toast.error("Please select a PDF file.");
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
    formData.append("pdf", selectedFile);
    formData.append("jobDescription", jobDescription);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/check-resume`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Error analyzing LinkedIn profile.");
      }
      setAnalysis(data);
    } catch (err) {
      console.error("PDF upload error:", err);
      setError(err.message || "Error analyzing LinkedIn profile.");
      toast.error(err.message || "Error analyzing LinkedIn profile.");
    } finally {
      setLoading(false);
    }
  };

  const getMatchLevel = (score) => {
    if (score <= 25) return { label: "Poor", color: "text-red-400" };
    if (score <= 50) return { label: "Fair", color: "text-yellow-400" };
    if (score <= 75) return { label: "Good", color: "text-blue-400" };
    return { label: "Excellent", color: "text-green-400" };
  };

  const handleMentorClick = () => {
    if (analysis) {
      navigate("/chatbot", { state: { analysis } });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0a23] to-[#12123a] text-white px-6 py-12 font-poppins">
      <div className="max-w-2xl mx-auto grid grid-cols-1 gap-12">
        {/* PDF Upload Section */}
        <div className="bg-[#10102b] rounded-2xl p-6 shadow-lg border border-[#2d2d51] flex flex-col justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-4">
              Upload your LinkedIn Profile PDF
            </h2>
            <p className="text-sm text-gray-300 mb-4 leading-relaxed">
              1. Go to your public{" "}
              <a href="https://linkedin.com" className="text-blue-400 underline">
                LinkedIn profile
              </a>
              <br />
              2. Click on "More..." → "Save to PDF"
              <br />
              3. Upload the PDF below and provide a job description to get AI insights.
              <br />
              Works best on English profiles. Max size: 2MB.
            </p>
          </div>

          <div>
            <label
              className={`flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-4 text-center transition-colors duration-200 ${
                dragActive
                  ? "border-blue-400 bg-blue-900/20"
                  : "border-gray-500 bg-[#1a1a40]"
              } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              aria-label="Upload LinkedIn profile PDF"
            >
              <CloudUpload size={32} />
              <p className="mt-2 text-sm text-gray-400">
                {selectedFile
                  ? selectedFile.name
                  : "Drag and drop your PDF here or click to browse"}
              </p>
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                className="hidden"
                disabled={loading}
              />
              <p className="text-xs text-gray-500 mt-1">Max file size: 2MB</p>
            </label>

            {selectedFile && (
              <p className="mt-2 text-sm text-green-400 font-medium">
                ✅ Selected: {selectedFile.name}
              </p>
            )}
          </div>

          <div className="mt-4">
            <label className="block text-gray-300 mb-2">Job Description:</label>
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste or type the job description here..."
              className="w-full p-2 border border-gray-600 rounded-lg bg-[#1a1a40] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows="3"
              disabled={loading}
            />
          </div>

          <button
            onClick={handlePdfUpload}
            disabled={!selectedFile || !jobDescription || loading}
            className={`mt-4 w-full py-2 rounded-lg transition font-semibold ${
              selectedFile && jobDescription && !loading
                ? "bg-blue-600 hover:bg-blue-700"
                : "bg-blue-400 cursor-not-allowed"
            }`}
          >
            {loading ? "Analyzing..." : "Analyze PDF"}
          </button>
        </div>
      </div>

      {/* Analysis Results */}
      {analysis && (
        <div className="mt-8 bg-[#12123a] p-4 rounded-xl border border-blue-700 max-w-2xl mx-auto">
          <h3 className="text-xl font-bold text-blue-400 mb-3 text-center">
            LinkedIn Profile Analysis Results
          </h3>
          <div className="mb-4">
            <h4 className="text-lg font-semibold text-gray-300">Match Score:</h4>
            <p
              className={`text-2xl font-bold ${
                getMatchLevel(analysis.matchScore).color
              }`}
            >
              {analysis.matchScore}%
            </p>
            <div className="w-full bg-gray-600 rounded-full h-2 mt-1">
              <div
                className={`h-2 rounded-full ${
                  getMatchLevel(analysis.matchScore).label === "Poor"
                    ? "bg-red-400"
                    : getMatchLevel(analysis.matchScore).label === "Fair"
                    ? "bg-yellow-400"
                    : getMatchLevel(analysis.matchScore).label === "Good"
                    ? "bg-blue-400"
                    : "bg-green-400"
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
          <div className="mb-4">
            <h4 className="text-lg font-semibold text-gray-300">💪 Strengths:</h4>
            <ul className="text-base text-green-400 list-disc pl-5 space-y-1">
              {analysis.strengths.map((strength, index) => (
                <li key={index}>{strength}</li>
              ))}
            </ul>
          </div>
          <div className="mb-4">
            <h4 className="text-lg font-semibold text-gray-300">🧱 Gaps:</h4>
            <ul className="text-base text-red-400 list-disc pl-5 space-y-1">
              {analysis.gaps.map((gap, index) => (
                <li key={index}>{gap}</li>
              ))}
            </ul>
          </div>
          <div className="mb-4">
            <h4 className="text-lg font-semibold text-gray-300">
              🛠 Improvements:
            </h4>
            <ul className="text-base text-blue-400 list-disc pl-5 space-y-1">
              {analysis.improvements.map((improvement, index) => (
                <li key={index}>{improvement}</li>
              ))}
            </ul>
          </div>
          <div className="mb-4">
            <h4 className="text-lg font-semibold text-gray-300">
              📝 Optimized Profile Section:
            </h4>
            <p className="text-base text-green-400 bg-[#1a1a40] p-2 rounded">
              {analysis.optimizedSection}
            </p>
          </div>
          <div className="mb-4">
            <h4 className="text-lg font-semibold text-gray-300">
              🔄 Before-After Comparison:
            </h4>
            <p className="text-base text-gray-200 bg-[#1a1a40] p-2 rounded">
              {analysis.beforeAfterComparison}
            </p>
          </div>
          <div className="mb-4">
            <h4 className="text-lg font-semibold text-gray-300">
              🔑 Keyword Match Score:
            </h4>
            <p className={`text-2xl font-bold ${getMatchLevel(analysis.keywordMatchScore).color}`}>
              {analysis.keywordMatchScore}%
            </p>
            <div className="w-full bg-gray-600 rounded-full h-2 mt-1">
              <div
                className={`h-2 rounded-full ${
                  getMatchLevel(analysis.keywordMatchScore).label === "Poor"
                    ? "bg-red-400"
                    : getMatchLevel(analysis.keywordMatchScore).label === "Fair"
                    ? "bg-yellow-400"
                    : getMatchLevel(analysis.keywordMatchScore).label === "Good"
                    ? "bg-blue-400"
                    : "bg-green-400"
                }`}
                style={{ width: `${analysis.keywordMatchScore}%` }}
              ></div>
            </div>
            <p
              className={`text-sm font-medium ${getMatchLevel(analysis.keywordMatchScore).color} mt-1`}
            >
              Match Level: {getMatchLevel(analysis.keywordMatchScore).label}
            </p>
          </div>
        </div>
      )}

      {analysis && (
        <div
          className="fixed bottom-6 right-6 bg-blue-600 text-white rounded-full p-3 cursor-pointer shadow-lg hover:bg-blue-700 transition"
          onClick={handleMentorClick}
          style={{ zIndex: 1000 }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-2-13h4v2h-4V7zm0 4h4v6h-4v-6z"
            />
            <circle cx="12" cy="10" r="2" fill="#3B82F6" />
            <line
              x1="12"
              y1="10"
              x2="12"
              y2="6"
              stroke="#3B82F6"
              strokeWidth={1}
            />
          </svg>
        </div>
      )}
    </div>
  );
};

export default LinkedInOptimizer;