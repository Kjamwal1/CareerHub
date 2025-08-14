import React, { useState, useContext } from "react";
import { CloudUpload } from "lucide-react";
import { AuthContext } from "../context/AuthContext";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const LinkedInOptimizer = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [selectedFile, setSelectedFile] = useState(null);
  const [jobDescription, setJobDescription] = useState("");
  const [error, setError] = useState("");
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

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
    formData.append("linkedinPdf", selectedFile);
    formData.append("jobDescription", jobDescription);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/linkedin-analyze`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        let errorMsg = "Error analyzing LinkedIn profile.";
        try {
          const data = await response.text();
          const parsedData = data ? JSON.parse(data) : {};
          errorMsg = parsedData.error || `Server responded with status ${response.status}`;
        } catch (parseErr) {
          errorMsg = `Server error: ${response.status} ${response.statusText}`;
        }
        throw new Error(errorMsg);
      }

      const data = await response.json();
      setAnalysis(data);
      toast.success("LinkedIn profile analyzed successfully!");
    } catch (err) {
      console.error("PDF upload error:", err.message, err.stack);
      const errorMsg = err.message || "Error analyzing LinkedIn profile.";
      setError(errorMsg);
      toast.error(errorMsg);
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

  const handleClose = () => {
    navigate("/home");
  };

  const handleReset = () => {
    setSelectedFile(null);
    setJobDescription("");
    setError("");
    setAnalysis(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0a23] to-[#12123a] text-white px-2 sm:px-4 md:px-6 py-4 sm:py-8 md:py-12 font-poppins relative flex items-center justify-center">
      <button
        onClick={handleClose}
        className="absolute top-2 sm:top-4 left-2 sm:left-4 bg-gray-600 text-white rounded-full p-1 sm:p-2 hover:bg-gray-700 transition-colors z-10"
        aria-label="Close"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 sm:h-6 w-5 sm:w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>

      <div className="max-w-6xl w-full grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
        <div className="bg-[#10102b] rounded-2xl p-2 sm:p-4 md:p-6 shadow-lg border border-[#2d2d51] flex flex-col justify-between h-full">
          <div>
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold mb-2 sm:mb-3 md:mb-4">
              Upload your LinkedIn Profile PDF
            </h2>
            <p className="text-xs sm:text-sm md:text-base text-gray-300 mb-2 sm:mb-3 md:mb-4 leading-relaxed">
              1. Go to your public{" "}
              <a href="https://linkedin.com" className="text-blue-400 underline">
                LinkedIn profile
              </a>
              <br />
              2. Click on "More..." → "Save to PDF"
              <br />
              3. Upload the PDF below and provide a job description to get AI
              insights.
              <br />
              Works best on English profiles. Max size: 2MB.
            </p>
          </div>

          <div>
            <label
              className={`flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-2 sm:p-3 md:p-4 text-center transition-colors duration-200 ${
                dragActive
                  ? "border-blue-400 bg-blue-900/20"
                  : "border-gray-500 bg-[#1a1a40]"
              } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              aria-label="Upload LinkedIn profile PDF"
            >
              <CloudUpload size={24} sm:size={28} md:size={32} />
              <p className="mt-1 sm:mt-2 text-xs sm:text-sm md:text-base text-gray-400">
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
              <p className="text-xs sm:text-sm mt-1">Max file size: 2MB</p>
            </label>

            {selectedFile && (
              <p className="mt-1 sm:mt-2 text-sm text-green-400 font-medium">
                ✅ Selected: {selectedFile.name}
              </p>
            )}
          </div>

          <div className="mt-2 sm:mt-3 md:mt-4">
            <label className="block text-gray-300 text-xs sm:text-sm mb-1 sm:mb-2">
              Job Description:
            </label>
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste or type the job description here..."
              className="w-full p-1 sm:p-2 md:p-2 border border-gray-600 rounded-lg bg-[#1a1a40] text-white placeholder-gray-400 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows="3"
              disabled={loading}
            />
          </div>

          <div className="flex gap-2 mt-2 sm:mt-3 md:mt-4">
            <button
              onClick={handlePdfUpload}
              disabled={!selectedFile || !jobDescription || loading}
              className={`flex-1 py-1 sm:py-2 md:py-2 rounded-lg transition font-semibold ${
                selectedFile && jobDescription && !loading
                  ? "bg-blue-600 hover:bg-blue-700"
                  : "bg-blue-400 cursor-not-allowed"
              } text-xs sm:text-sm`}
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin h-4 w-4 mr-2"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Analyzing...
                </span>
              ) : (
                "Analyze PDF"
              )}
            </button>
            <button
              onClick={handleReset}
              className="flex-1 py-1 sm:py-2 md:py-2 rounded-lg bg-gray-600 hover:bg-gray-700 transition font-semibold text-xs sm:text-sm"
            >
              Clear
            </button>
          </div>
        </div>

        <div className="bg-[#10102b] rounded-2xl p-2 sm:p-4 md:p-6 shadow-lg border border-[#2d2d51] flex items-center justify-center h-full">
          <div className="w-full">
            <p className="text-center text-white text-sm sm:text-base md:text-lg font-semibold mb-2 sm:mb-4">
              Here's the demo of how to download the LinkedIn's profile PDF
            </p>
            <div className="relative w-full" style={{ paddingTop: "56.25%" }}>
              <video
                className="absolute top-0 left-0 w-full h-full rounded-lg"
                src="/linkedin_vid.mp4"
                title="LinkedIn's Profile Pdf Download Tutorial"
                controls
                autoPlay
                muted
                loop
              ></video>
            </div>
          </div>
        </div>
      </div>

      {analysis && (
        <div className="mt-4 sm:mt-6 md:mt-8 bg-[#12123a] p-2 sm:p-3 md:p-4 rounded-xl border border-blue-700 max-w-sm sm:max-w-md md:max-w-2xl mx-auto">
          <h3 className="text-lg sm:text-xl md:text-xl font-bold text-blue-400 mb-1 sm:mb-2 md:mb-3 text-center">
            LinkedIn Profile Analysis Results
          </h3>
          <div className="mb-1 sm:mb-2 md:mb-4">
            <h4 className="text-base sm:text-lg md:text-lg font-semibold text-gray-300">
              Match Score:
            </h4>
            <p
              className={`text-xl sm:text-2xl md:text-2xl font-bold ${
                getMatchLevel(analysis.matchScore).color
              }`}
            >
              {analysis.matchScore}%
            </p>
            <div className="w-full bg-gray-600 rounded-full h-1.5 sm:h-2 md:h-2 mt-0.5 sm:mt-1">
              <div
                className={`h-1.5 sm:h-2 md:h-2 rounded-full ${
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
              className={`text-xs sm:text-sm md:text-sm font-medium ${
                getMatchLevel(analysis.matchScore).color
              } mt-0.5 sm:mt-1`}
            >
              Match Level: {getMatchLevel(analysis.matchScore).label}
            </p>
          </div>
          <div className="mb-1 sm:mb-2 md:mb-4">
            <h4 className="text-base sm:text-lg md:text-lg font-semibold text-gray-300">
              Profile Completeness:
            </h4>
            <p
              className={`text-xl sm:text-2xl md:text-2xl font-bold ${
                getMatchLevel(analysis.profileCompleteness).color
              }`}
            >
              {analysis.profileCompleteness}%
            </p>
            <div className="w-full bg-gray-600 rounded-full h-1.5 sm:h-2 md:h-2 mt-0.5 sm:mt-1">
              <div
                className={`h-1.5 sm:h-2 md:h-2 rounded-full ${
                  getMatchLevel(analysis.profileCompleteness).label === "Poor"
                    ? "bg-red-400"
                    : getMatchLevel(analysis.profileCompleteness).label === "Fair"
                    ? "bg-yellow-400"
                    : getMatchLevel(analysis.profileCompleteness).label === "Good"
                    ? "bg-blue-400"
                    : "bg-green-400"
                }`}
                style={{ width: `${analysis.profileCompleteness}%` }}
              ></div>
            </div>
            <p
              className={`text-xs sm:text-sm md:text-sm font-medium ${
                getMatchLevel(analysis.profileCompleteness).color
              } mt-0.5 sm:mt-1`}
            >
              Completeness Level: {getMatchLevel(analysis.profileCompleteness).label}
            </p>
          </div>
          <div className="mb-1 sm:mb-2 md:mb-4">
            <h4 className="text-base sm:text-lg md:text-lg font-semibold text-gray-300">
              💪 Strengths:
            </h4>
            <ul className="text-sm sm:text-base md:text-base text-green-400 list-disc pl-3 sm:pl-4 md:pl-5 space-y-0.5 sm:space-y-1">
              {analysis.strengths.map((strength, index) => (
                <li key={index}>{strength}</li>
              ))}
            </ul>
          </div>
          <div className="mb-1 sm:mb-2 md:mb-4">
            <h4 className="text-base sm:text-lg md:text-lg font-semibold text-gray-300">
              🧱 Gaps:
            </h4>
            <ul className="text-sm sm:text-base md:text-base text-red-400 list-disc pl-3 sm:pl-4 md:pl-5 space-y-0.5 sm:space-y-1">
              {analysis.gaps.map((gap, index) => (
                <li key={index}>{gap}</li>
              ))}
            </ul>
          </div>
          <div className="mb-1 sm:mb-2 md:mb-4">
            <h4 className="text-base sm:text-lg md:text-lg font-semibold text-gray-300">
              🛠 Improvements:
            </h4>
            <ul className="text-sm sm:text-base md:text-base text-blue-400 list-disc pl-3 sm:pl-4 md:pl-5 space-y-0.5 sm:space-y-1">
              {analysis.improvements.map((improvement, index) => (
                <li key={index}>{improvement}</li>
              ))}
            </ul>
          </div>
          <div className="mb-1 sm:mb-2 md:mb-4">
            <h4 className="text-base sm:text-lg md:text-lg font-semibold text-gray-300">
              📝 Optimized Profile Section:
            </h4>
            <p className="text-sm sm:text-base md:text-base text-green-400 bg-[#1a1a40] p-1 sm:p-2 rounded">
              {analysis.optimizedSection}
            </p>
          </div>
          <div className="mb-1 sm:mb-2 md:mb-4">
            <h4 className="text-base sm:text-lg md:text-lg font-semibold text-gray-300">
              🔄 Before-After Comparison:
            </h4>
            <p className="text-sm sm:text-base md:text-base text-gray-200 bg-[#1a1a40] p-1 sm:p-2 rounded">
              {analysis.beforeAfterComparison}
            </p>
          </div>
          <div className="mb-1 sm:mb-2 md:mb-4">
            <h4 className="text-base sm:text-lg md:text-lg font-semibold text-gray-300">
              🔑 Keyword Match Score:
            </h4>
            <p
              className={`text-xl sm:text-2xl md:text-2xl font-bold ${
                getMatchLevel(analysis.keywordMatchScore).color
              }`}
            >
              {analysis.keywordMatchScore}%
            </p>
            <div className="w-full bg-gray-600 rounded-full h-1.5 sm:h-2 md:h-2 mt-0.5 sm:mt-1">
              <div
                className={`h-1.5 sm:h-2 md:h-2 rounded-full ${
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
              className={`text-xs sm:text-sm md:text-sm font-medium ${
                getMatchLevel(analysis.keywordMatchScore).color
              } mt-0.5 sm:mt-1`}
            >
              Match Level: {getMatchLevel(analysis.keywordMatchScore).label}
            </p>
          </div>
        </div>
      )}

      {analysis && (
        <div
          className="fixed bottom-2 sm:bottom-4 right-2 sm:right-4 bg-blue-600 text-white rounded-full p-1 sm:p-2 md:p-3 cursor-pointer shadow-lg hover:bg-blue-700 transition"
          onClick={handleMentorClick}
          style={{ zIndex: 1000 }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 sm:h-5 md:h-5 w-4 sm:w-5 md:w-5"
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