import React, { useState, useEffect, useContext, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { User, Bot, History } from "lucide-react";

const Chatbot = () => {
  const { state } = useLocation();
  const { user } = useContext(AuthContext);
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

      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);
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
    <div className="flex items-center justify-center min-h-screen relative">
      <div className="p-6 w-screen h-screen bg-white rounded-none shadow-2xl border border-gray-200 relative">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-gray-800 flex items-center">
            <Bot className="mr-2 text-blue-500" size={24} />
            AI Mentor Chat
          </h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-all"
            >
              <History className="text-gray-600" size={24} />
            </button>
            <button
              onClick={handleClose}
              className="p-2 bg-gray-600 text-white rounded-full hover:bg-gray-700 transition-colors"
              aria-label="Close"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
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
          <div className="absolute top-16 right-6 w-80 bg-white border border-gray-200 rounded-lg shadow-lg p-4 max-h-96 overflow-y-auto z-10">
            <h3 className="text-lg font-semibold mb-2">Chat History</h3>
            {pastChats.length === 0 ? (
              <p className="text-gray-500">No chat history available.</p>
            ) : (
              pastChats.map((msg, index) => (
                <div
                  key={index}
                  className={`p-2 mb-2 rounded-lg ${
                    msg.role === "user"
                      ? "bg-green-100 text-green-800"
                      : "bg-blue-100 text-blue-800"
                  }`}
                >
                  <div className="text-xs text-gray-500">
                    {msg.timestamp
                      ? new Date(msg.timestamp).toLocaleString()
                      : "No timestamp"}
                  </div>
                  <div>{msg.content}</div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Chat Messages */}
        <div className="mb-6 h-[calc(100%-140px)] overflow-y-auto bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-4">
          {chatHistory.map((msg, index) => (
            <div
              key={index}
              className={`flex items-start ${
                msg.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              {msg.role === "system" && (
                <Bot
                  className="mr-2 text-blue-500 flex-shrink-0"
                  size={20}
                />
              )}
              {msg.role === "user" && (
                <User
                  className="ml-2 text-green-500 flex-shrink-0"
                  size={20}
                />
              )}
              <div
                className={`p-3 rounded-lg max-w-[80%] ${
                  msg.role === "user"
                    ? "bg-green-100 text-green-800"
                    : "bg-blue-100 text-blue-800"
                } shadow-md`}
              >
                {msg.content}
              </div>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>

        {/* Message Input */}
        <div className="flex gap-3">
          <input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Ask about resume, LinkedIn, or job strategies..."
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            className={`px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 ${
              isLoading ? "opacity-70 cursor-not-allowed" : ""
            }`}
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
