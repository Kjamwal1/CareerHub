import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const LinkedInHeadlineGenerator = () => {
  const navigate = useNavigate();
  const [jobTitle, setJobTitle] = useState("");
  const [keywords, setKeywords] = useState("");
  const [profileType, setProfileType] = useState("resume");
  const [file, setFile] = useState(null);
  const [result, setResult] = useState("");

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulate AI generation (replace with actual API call)
    setResult("Generated Headline: [Your AI-generated headline will appear here]");
  };

  return (
    <div className="w-full h-screen bg-gradient-to-br from-gray-100 via-gray-200 to-gray-300 font-poppins text-gray-800 flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-auto">
      <div className="w-full max-w-6xl h-full bg-white/90 backdrop-blur-md rounded-xl shadow-2xl border border-gray-200 p-4 sm:p-6 md:p-8 flex flex-col md:flex-row gap-4 sm:gap-6">
        <div className="w-full md:w-1/2">
          <h2 className="text-2xl sm:text-3xl md:text-3xl font-bold mb-4 sm:mb-6 text-gray-900 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            AI Headline Generator
          </h2>
          <button
            onClick={() => navigate("/resume-history")}
            className="mb-4 sm:mb-6 px-4 sm:px-6 py-2 sm:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-300 transform hover:scale-105 text-sm sm:text-base"
          >
            View History
          </button>
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700">
                Target Job Title*
              </label>
              <input
                type="text"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg mt-1 sm:mt-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base"
                placeholder="Enter Job Title"
                required
              />
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700">
                Keywords to Include
              </label>
              <input
                type="text"
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg mt-1 sm:mt-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base"
                placeholder="Press enter after each word"
              />
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700">
                Your Profile
              </label>
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 mt-1 sm:mt-2">
                <label className="flex items-center text-gray-700">
                  <input
                    type="radio"
                    name="profileType"
                    value="resume"
                    checked={profileType === "resume"}
                    onChange={() => setProfileType("resume")}
                    className="mr-1 sm:mr-2 accent-blue-600"
                  />
                  Resume Upload
                </label>
                <label className="flex items-center text-gray-700">
                  <input
                    type="radio"
                    name="profileType"
                    value="linkedin"
                    checked={profileType === "linkedin"}
                    onChange={() => setProfileType("linkedin")}
                    className="mr-1 sm:mr-2 accent-blue-600"
                  />
                  Use LinkedIn Profile
                </label>
              </div>
            </div>
            {profileType === "resume" && (
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700">
                  Upload Your Resume
                </label>
                <input
                  type="file"
                  onChange={handleFileChange}
                  className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg mt-1 sm:mt-2 file:mr-2 sm:file:mr-4 file:py-1 sm:file:py-2 file:px-3 sm:file:px-4 file:rounded-full file:border-0 file:text-xs sm:file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition-all duration-200"
                />
                <p className="text-xs sm:text-sm text-gray-500 mt-1 sm:mt-2">
                  File names cannot contain spaces or underscores and should be
                  in either .doc, .docx, or .pdf.
                </p>
              </div>
            )}
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white p-2 sm:p-3 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 text-sm sm:text-base"
            >
              Generate
            </button>
          </form>
        </div>
        <div className="w-full md:w-1/2 bg-gray-50/90 backdrop-blur-md rounded-lg border border-gray-200 p-4 sm:p-6 flex flex-col justify-center">
          <h3 className="text-lg sm:text-xl md:text-xl font-semibold mb-2 sm:mb-4 text-gray-900">Result</h3>
          <div className="h-40 sm:h-64 bg-white rounded-lg p-2 sm:p-4 border border-gray-300 flex items-center justify-center">
            <p className="text-gray-500 text-center text-sm sm:text-base">{result || "Your AI generated content will show here"}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LinkedInHeadlineGenerator;