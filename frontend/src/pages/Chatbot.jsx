import React, { useState, useEffect, useContext, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { User, Bot, History } from "lucide-react";

const Chatbot = () => {
  const { state } = useLocation();
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [chatHistory, setChatHistory] = useState([]);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [pastChats, setPastChats] = useState([]);
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (state?.analysis) {
      const initialContext = [
        {
          role: "system",
          content: `You are an AI career mentor with expertise in resume optimization, LinkedIn profiling, and job matching. Use the following resume analysis to provide context: Match Score ${state.analysis.matchScore}%, Strengths: ${state.analysis.strengths.join(", ")}, Gaps: ${state.analysis.gaps.join(", ")}, Keyword Match Score: ${state.analysis.keywordMatchScore}%, Optimized Section: "${state.analysis.optimizedSection}". Provide career advice, job search strategies, or profile optimization tips based on this data and the user's queries. Incorporate industry-specific keywords from the job description: ${state.analysis.jobDescription}. Unless specified, limit responses to 1-2 lines. If the user requests a specific number of lines, adjust the answer accordingly to fit that length.`,
          timestamp: new Date(),
        },
      ];
      setChatHistory(initialContext);
      saveChatHistory(initialContext);
    }
  }, [state]);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("No token found");
        const response = await fetch(
          "https://careerhub25.onrender.com/api/chat/history",
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (!response.ok)
          throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        setPastChats(data.history || []);
      } catch (error) {
        console.error("Fetch history error:", error.message);
      }
    };
    if (user) fetchHistory();
  }, [user]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory]);

  const saveChatHistory = async (history) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token found");
      const response = await fetch(
        "https://careerhub25.onrender.com/api/chat/save",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ history }),
        }
      );
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);
    } catch (error) {
      console.error("Save chat history error:", error.message);
    }
  };

  const handleSend = async () => {
    if (!message.trim() || isLoading) return;

    const newHistory = [
      ...chatHistory,
      { role: "user", content: message, timestamp: new Date() },
    ];
    setChatHistory(newHistory);
    setMessage("");
    setIsLoading(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token found");
      const response = await fetch(
        "https://careerhub25.onrender.com/api/chat",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ history: newHistory }),
        }
      );

      if (!response.ok) {
        if (response.status === 403) {
          alert("Session expired. Please log in again.");
          logout();
          navigate("/login");
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      const updatedHistory = [
        ...newHistory,
        {
          role: "system",
          content: data.response,
          timestamp: new Date(),
        },
      ];
      setChatHistory(updatedHistory);
      setPastChats(updatedHistory);
      await saveChatHistory(updatedHistory);
    } catch (error) {
      console.error("Chatbot Error:", error.message);
      setChatHistory((prev) => [
        ...prev,
        {
          role: "system",
          content: `Error: ${error.message}`,
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    navigate("/home");
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-2 sm:p-4 relative">
      <div className="p-2 sm:p-4 w-full h-screen bg-white rounded-none shadow-2xl border border-gray-200 relative max-w-2xl sm:max-w-3xl md:max-w-4xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-2 sm:mb-4">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 flex items-center">
            <Bot className="mr-1 sm:mr-2 text-blue-500" size={20} sm={24} />
            AI Mentor Chat
          </h2>
          <div className="flex items-center space-x-1 sm:space-x-2">
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="p-1 sm:p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-all"
            >
              <History className="text-gray-600" size={20} sm={24} />
            </button>
            <button
              onClick={handleClose}
              className="p-1 sm:p-2 bg-gray-600 text-white rounded-full hover:bg-gray-700 transition-colors"
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
          </div>
        </div>

        {showHistory && (
          <div className="absolute top-12 sm:top-16 right-2 sm:right-4 w-64 sm:w-80 bg-white border border-gray-200 rounded-lg shadow-lg p-2 sm:p-4 max-h-60 sm:max-h-96 overflow-y-auto z-10">
            <h3 className="text-sm sm:text-lg font-semibold mb-1 sm:mb-2">Chat History</h3>
            {pastChats.length === 0 ? (
              <p className="text-gray-500 text-xs sm:text-sm">No chat history available.</p>
            ) : (
              pastChats.map((msg, index) => (
                <div
                  key={index}
                  className={`p-1 sm:p-2 mb-1 sm:mb-2 rounded-lg ${
                    msg.role === "user"
                      ? "bg-green-100 text-green-800"
                      : "bg-blue-100 text-blue-800"
                  }`}
                >
                  <div className="text-xs sm:text-sm text-gray-500">
                    {msg.timestamp
                      ? new Date(msg.timestamp).toLocaleString()
                      : "No timestamp"}
                  </div>
                  <div className="text-xs sm:text-sm">{msg.content}</div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Chat Messages */}
        <div className="mb-2 sm:mb-4 h-[calc(100%-120px)] sm:h-[calc(100%-140px)] overflow-y-auto bg-gray-50 p-2 sm:p-4 rounded-xl border border-gray-200 space-y-2 sm:space-y-4">
          {chatHistory.map((msg, index) => (
            <div
              key={index}
              className={`flex items-start ${
                msg.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              {msg.role === "system" && (
                <Bot
                  className="mr-1 sm:mr-2 text-blue-500 flex-shrink-0"
                  size={16} sm={20}
                />
              )}
              {msg.role === "user" && (
                <User
                  className="ml-1 sm:ml-2 text-green-500 flex-shrink-0"
                  size={16} sm={20}
                />
              )}
              <div
                className={`p-1 sm:p-2 rounded-lg max-w-[75%] sm:max-w-[80%] ${
                  msg.role === "user"
                    ? "bg-green-100 text-green-800"
                    : "bg-blue-100 text-blue-800"
                } shadow-md text-xs sm:text-sm`}
              >
                {msg.content}
              </div>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>

        {/* Message Input */}
        <div className="flex gap-2 sm:gap-3">
          <input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full p-1 sm:p-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs sm:text-sm"
            placeholder="Ask about resume, LinkedIn, or job strategies..."
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            className={`px-2 sm:px-4 py-1 sm:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 ${
              isLoading ? "opacity-70 cursor-not-allowed" : ""
            } text-xs sm:text-sm`}
            disabled={isLoading}
          >
            {isLoading ? "Sending..." : "Send"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;