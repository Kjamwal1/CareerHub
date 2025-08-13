import React, { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { toast } from "react-toastify";

const CoverLetterBuilder = () => {
  const { user } = useContext(AuthContext);
  const [content, setContent] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [company, setCompany] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error("Please log in.");
      return;
    }
    if (!content) {
      toast.error("Please enter cover letter content.");
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("https://careerhub25.onrender.com/api/cover-letter", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content, jobTitle, company }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Error saving cover letter");
      toast.success("Cover letter saved!");
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to save cover letter.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-3 sm:p-6 bg-gradient-to-b from-[#0a0a23] to-[#12123a] font-poppins flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6 md:p-8 max-w-md sm:max-w-lg md:max-w-xl w-full border border-gray-200">
        <h2 className="text-xl sm:text-2xl md:text-2xl font-semibold text-gray-800 mb-4 sm:mb-6 text-center">
          Cover Letter Builder
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          <div>
            <label className="block text-gray-700 text-sm sm:text-base mb-2">Job Title:</label>
            <input
              type="text"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              className="w-full p-2 sm:p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-600 text-sm sm:text-base"
            />
          </div>
          <div>
            <label className="block text-gray-700 text-sm sm:text-base mb-2">Company:</label>
            <input
              type="text"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              className="w-full p-2 sm:p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-600 text-sm sm:text-base"
            />
          </div>
          <div>
            <label className="block text-gray-700 text-sm sm:text-base mb-2">Content:</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your cover letter here..."
              className="w-full p-2 sm:p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-600 text-sm sm:text-base"
              rows="4 sm:rows-6"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !content}
            className={`w-full py-1.5 sm:py-2 px-4 rounded-md text-white font-semibold transition ${
              loading || !content ? "bg-gray-400 cursor-not-allowed" : "bg-[#A259FF] hover:bg-[#8A42E8]"
            } text-sm sm:text-base`}
          >
            {loading ? "Saving..." : "Save Cover Letter"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CoverLetterBuilder;