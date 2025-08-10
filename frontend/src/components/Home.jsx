import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  DocumentIcon,
  PresentationChartLineIcon,
  ChatBubbleLeftRightIcon,
  ClockIcon,
  ArrowUpRightIcon,
  UserCircleIcon,
  CogIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  ChatBubbleLeftIcon,
} from "@heroicons/react/24/solid";

const Home = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  // Mock data for Resume History (replace with API call if needed)
  const [resumeHistory, setResumeHistory] = useState([
    { id: 1, name: "Resume_2023.pdf", date: "2025-08-04", score: 85 },
    { id: 2, name: "JobApp_Resume.docx", date: "2025-08-03", score: 65 },
    { id: 3, name: "TechResume.png", date: "2025-08-02", score: 45 },
  ]);
  const [showDashboardDropdown, setShowDashboardDropdown] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  useEffect(() => {
    document.title = `Welcome, ${user?.name || "Kanika"}`;
    // Simulate fetching resume history from an API
    // Replace with actual fetch call: e.g., fetch('/api/resume-history')
  }, [user]);

  const handleFeatureClick = (title) => {
    console.log("Navigating to:", title);
    switch (title) {
      case "Resume Checker":
        navigate("/resume-checker");
        break;
      case "LinkedIn Optimizer":
        navigate("/linkedin-optimizer");
        break;
      case "AI Mentor":
        navigate("/chatbot");
        break;
      case "Job Tracker": // Match card title
      case "Application Track": // Match sidebar title
        navigate("/job-tracker");
        break;
      case "Resume Analyse History":
        navigate("/resume-history");
        break;
      default:
        break;
    }
    setShowDashboardDropdown(false);
  };

  const handleLogout = () => {
    logout();
    navigate("/");
    setShowProfileDropdown(false);
  };

  const handleChatbotClick = () => {
    navigate("/chatbot");
  };

  return (
    <div className="min-h-screen bg-white font-poppins text-gray-800 flex flex-col">
      {/* Navbar */}
      <div className="w-full bg-gray-100 p-4 shadow-md flex justify-between items-center fixed top-0 z-10">
        <h1
          className="text-4xl font-bold"
          style={{ fontFamily: "'Lobster', cursive" }}
        >
          CareerHub
        </h1>
        <div className="relative" inline-block>
          <button
            onClick={() => setShowProfileDropdown(!showProfileDropdown)}
            className="flex items-center text-gray-600 hover:text-gray-900 w-full"
          >
            <UserCircleIcon className="h-8 w-8 mr-2" />
            <span>
              {user?.name} {user?.surname}
            </span>
          </button>
          {showProfileDropdown && (
            <div className="absolute right-full top-0 mt-10 mr-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
              <p className="px-4 py-2 text-sm text-gray-700">
                Plan:{" "}
                <span className="font-medium">{user?.plan || "Free"}</span>
              </p>
              <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                Edit Profile
              </button>
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
              >
                Log Out
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Left Sidebar */}
      <div className="w-[13rem] bg-gray-100 p-6 shadow-md h-screen overflow-y-auto fixed top-[4rem] bottom-0">
        <nav className="space-y-2 flex-1">
          <button
            onClick={() => setShowDashboardDropdown(!showDashboardDropdown)}
            className="w-full text-left px-4 py-2 bg-gray-800 text-white rounded flex items-center justify-between hover:bg-gray-700"
          >
            <span>Dashboard</span>
            <Bars3Icon className="h-5 w-5" />
          </button>
          {showDashboardDropdown && (
            <div className="ml-4 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
              <button
                onClick={() => handleFeatureClick("Resume Analyse History")}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                Resume Analyse History
              </button>
              <button
                onClick={() => handleFeatureClick("Application Track")}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                Application Track
              </button>
            </div>
          )}
          <button className="w-full text-left px-4 py-2 text-gray-600 hover:bg-gray-200">
            My Documents
          </button>
          <button className="w-full text-left px-4 py-2 text-gray-600 hover:bg-gray-200">
            Career Map
          </button>
          <button className="w-full text-left px-4 py-2 text-gray-600 hover:bg-gray-200">
            Job Interviews
          </button>
          <button className="w-full text-left px-4 py-2 text-gray-600 hover:bg-gray-200">
            Find Jobs
          </button>
        </nav>
        <div className="mt-[12rem] bg-white p-4 rounded-lg shadow-md border border-gray-200">
          <p className="text-sm text-gray-500 mb-2">Current plan: FREE</p>
          <button className="w-full bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700">
            Upgrade
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="ml-[13rem] mt-[4rem] p-6 flex-1">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Welcome back, {user?.name || "Kanika"}!
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {[
            {
              title: "Resume Checker",
              desc: "Get instant expert feedback",
              icon: DocumentIcon,
              bg: "bg-gradient-to-br from-pink-500 to-purple-600",
            },
            {
              title: "LinkedIn Optimizer",
              desc: "Review and improve your LinkedIn",
              icon: PresentationChartLineIcon,
              bg: "bg-gradient-to-br from-blue-500 to-indigo-600",
            },
            {
              title: "AI Mentor",
              desc: "Ask career and job prep questions",
              icon: ChatBubbleLeftRightIcon,
              bg: "bg-gradient-to-br from-emerald-500 to-teal-600",
            },
            {
              title: "Job Tracker",
              desc: "Keep track of all your applications",
              icon: ArrowUpRightIcon,
              bg: "bg-gradient-to-br from-yellow-400 to-orange-500",
            },
          ].map(({ title, desc, icon: Icon, bg }) => (
            <div
              key={title}
              className={`rounded-xl p-6 text-white shadow-lg transition transform hover:scale-[1.03] cursor-pointer ${bg} hover:opacity-90 z-10`}
              onClick={() => {
                console.log("Clicked card:", title);
                handleFeatureClick(title);
              }}
              data-aos="fade-up"
            >
              <Icon className="h-8 w-8 mb-4" />
              <h3 className="text-xl font-semibold mb-2">{title}</h3>
              <p className="text-sm opacity-90">{desc}</p>
            </div>
          ))}
        </div>

        {/* More Tools */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">More Tools</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                name: "LinkedIn Headline Generator",
                icon: "/icons/linkedin.svg",
              },
              { name: "Linkedin About", icon: "/icons/pdf.svg" },
               { name: "Linkedin Post", icon: "/icons/website.svg" },
              { name: "Cover Letter Builder", icon: "/icons/coverletter.svg" },
              { name: "Interview Prep", icon: "/icons/interview.svg" },
              { name: "Resume Templates", icon: "/icons/examples.svg" },
              { name: "Proofreading", icon: "/icons/proofreading.svg" },
            
              { name: "Chrome Extension", icon: "/icons/extension.svg" },
            ].map((tool) => (
              <div
                key={tool.name}
                className="bg-white rounded-xl p-5 border hover:shadow-lg transition"
                data-aos="fade-up"
                onClick={() => {
                  if (tool.name === "LinkedIn Headline Generator") {
                    navigate("/linkedin-headline-generator");
                  }
                }}
              >
                <img src={tool.icon} alt={tool.name} className="h-8 w-8 mb-3" />
                <h4 className="text-gray-800 font-medium text-lg mb-1">
                  {tool.name}
                </h4>
                <p className="text-sm text-gray-500">
                  Launch this tool to boost your productivity
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Floating AI Chatbot Icon */}
      <div
        className="fixed bottom-6 right-6 bg-blue-600 text-white rounded-full p-4 cursor-pointer shadow-lg hover:bg-blue-700 transition"
        onClick={handleChatbotClick}
        style={{ zIndex: 1000 }}
      >
        <ChatBubbleLeftIcon className="h-6 w-6" />
      </div>
    </div>
  );
};

export default Home;
