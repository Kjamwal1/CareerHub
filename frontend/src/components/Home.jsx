import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  DocumentIcon,
  PresentationChartLineIcon,
  ChatBubbleLeftRightIcon,
  ArrowUpRightIcon,
  UserCircleIcon,
  Bars3Icon,
  ChatBubbleLeftIcon,
  XMarkIcon,
} from "@heroicons/react/24/solid";

const Home = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [showDashboardDropdown, setShowDashboardDropdown] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);

  useEffect(() => {
    document.title = `Welcome, ${user?.name || "Kanika"}`;
  }, [user]);

  const handleFeatureClick = (title) => {
    console.log("Navigating to:", title);
    let destination;
    switch (title) {
      case "Resume Checker":
        destination = "/resume-checker";
        break;
      case "LinkedIn Optimizer":
        destination = "/linkedin-optimizer";
        break;
      case "AI Mentor":
        destination = "/chatbot";
        break;
      case "Job Tracker":
      case "Application Track":
        destination = "/job-tracker";
        break;
      case "Resume Analyse History":
        destination = "/resume-history";
        break;
      case "My Documents":
        destination = "/my-documents";
        break;
      default:
        destination = "/home";
        break;
    }
    if (!user?.industry) {
      navigate("/industry-selection", { state: { from: destination } });
    } else {
      navigate(destination);
    }
    setShowDashboardDropdown(false);
    setShowSidebar(false); // Close sidebar on mobile after navigation
  };

  const handleLogout = () => {
    logout();
    navigate("/");
    setShowProfileDropdown(false);
  };

  const handleChatbotClick = () => {
    if (!user?.industry) {
      navigate("/industry-selection", { state: { from: "/chatbot" } });
    } else {
      navigate("/chatbot");
    }
    setShowSidebar(false); // Close sidebar on mobile
  };

  const handleToolClick = (toolName) => {
    if (toolName === "LinkedIn Headline Generator") {
      if (!user?.industry) {
        navigate("/industry-selection", { state: { from: "/linkedin-headline-generator" } });
      } else {
        navigate("/linkedin-headline-generator");
      }
    }
    setShowSidebar(false); // Close sidebar on mobile
  };

  return (
    <div className="min-h-screen bg-white font-poppins text-gray-800 flex flex-col relative">
      {/* Navbar */}
      <div className="w-full bg-gray-100 p-2 sm:p-4 shadow-md flex justify-between items-center fixed top-0 z-20">
        <div className="flex items-center">
          <button
            className="md:hidden mr-2 sm:mr-3 text-gray-600 hover:text-gray-900"
            onClick={() => setShowSidebar(!showSidebar)}
            aria-label="Toggle Sidebar"
          >
            <Bars3Icon className="h-6 sm:h-8 w-6 sm:w-8" />
          </button>
          <h1
            className="text-2xl sm:text-3xl md:text-4xl font-bold"
            style={{ fontFamily: "'Lobster', cursive" }}
          >
            CareerHub
          </h1>
        </div>
        <div className="relative">
          <button
            onClick={() => setShowProfileDropdown(!showProfileDropdown)}
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <UserCircleIcon className="h-6 sm:h-8 w-6 sm:w-8 mr-1 sm:mr-2" />
            <span className="text-sm sm:text-base">
              {user?.name} {user?.surname}
            </span>
          </button>
          {showProfileDropdown && (
            <div className="absolute right-0 top-full mt-1 sm:mt-2 w-40 sm:w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-[100]">
              <p className="px-3 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm text-gray-700">
                Plan: <span className="font-medium">{user?.plan || "Free"}</span>
              </p>
              <button className="w-full text-left px-3 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm text-gray-700 hover:bg-gray-100">
                Edit Profile
              </button>
              <button
                onClick={handleLogout}
                className="w-full text-left px-3 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm text-red-600 hover:bg-gray-100"
              >
                Log Out
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Left Sidebar */}
      <div
        className={`fixed top-[3.5rem] sm:top-[4rem] bottom-0 w-64 sm:w-72 bg-gray-100 p-3 sm:p-6 shadow-md h-screen overflow-y-auto z-30 transform transition-transform duration-300 ${
          showSidebar ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 md:w-[13rem]`}
      >
        <div className="flex justify-between items-center mb-4 md:hidden">
          <h2 className="text-lg font-semibold text-gray-800">Menu</h2>
          <button
            onClick={() => setShowSidebar(false)}
            className="text-gray-600 hover:text-gray-900"
            aria-label="Close Sidebar"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
        <nav className="space-y-2 flex-1">
          <button
            onClick={() => setShowDashboardDropdown(!showDashboardDropdown)}
            className="w-full text-left px-3 sm:px-4 py-1 sm:py-2 bg-gray-800 text-white rounded flex items-center justify-between hover:bg-gray-700"
          >
            <span className="text-sm sm:text-base">Dashboard</span>
            <Bars3Icon className="h-4 sm:h-5 w-4 sm:w-5" />
          </button>
          {showDashboardDropdown && (
            <div className="ml-2 sm:ml-4 mt-1 sm:mt-2 w-40 sm:w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-[50]">
              <button
                onClick={() => handleFeatureClick("Resume Analyse History")}
                className="w-full text-left px-3 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm text-gray-700 hover:bg-gray-100"
              >
                Resume Analyse History
              </button>
              <button
                onClick={() => handleFeatureClick("Application Track")}
                className="w-full text-left px-3 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm text-gray-700 hover:bg-gray-100"
              >
                Application Track
              </button>
            </div>
          )}
          <button
            onClick={() => handleFeatureClick("My Documents")}
            className="w-full text-left px-3 sm:px-4 py-1 sm:py-2 text-gray-600 hover:bg-gray-200"
          >
            My Documents
          </button>
          <button className="w-full text-left px-3 sm:px-4 py-1 sm:py-2 text-gray-600 hover:bg-gray-200">
            Career Map
          </button>
          <button className="w-full text-left px-3 sm:px-4 py-1 sm:py-2 text-gray-600 hover:bg-gray-200">
            Job Interviews
          </button>
          <button className="w-full text-left px-3 sm:px-4 py-1 sm:py-2 text-gray-600 hover:bg-gray-200">
            Find Jobs
          </button>
        </nav>
        <div className="mt-8 sm:mt-[12rem] bg-white p-3 sm:p-4 rounded-lg shadow-md border border-gray-200">
          <p className="text-xs sm:text-sm text-gray-500 mb-1 sm:mb-2">Current plan: FREE</p>
          <button className="w-full bg-purple-600 text-white px-3 sm:px-4 py-1 sm:py-2 rounded hover:bg-purple-700 text-xs sm:text-sm">
            Upgrade
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="ml-0 md:ml-[13rem] pt-[3.5rem] sm:pt-[8rem] p-3 sm:p-6 flex-1 relative z-0">
        <h2 className="text-xl sm:text-2xl md:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">
          Welcome back, {user?.name || "Kanika"}!
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-12">
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
              className={`rounded-xl p-3 sm:p-4 text-white shadow-lg transition transform hover:scale-[1.03] cursor-pointer ${bg} hover:opacity-90`}
              onClick={() => handleFeatureClick(title)}
              data-aos="fade-up"
            >
              <Icon className="h-6 sm:h-8 w-6 sm:w-8 mb-2 sm:mb-4" />
              <h3 className="text-lg sm:text-xl font-semibold mb-1 sm:mb-2">{title}</h3>
              <p className="text-xs sm:text-sm opacity-90">{desc}</p>
            </div>
          ))}
        </div>

        {/* More Tools */}
        <div className="mt-6 sm:mt-12">
          <h2 className="text-xl sm:text-2xl md:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">More Tools</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {[
              { name: "LinkedIn Headline Generator", icon: "/icons/linkedin.svg" },
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
                className="bg-white rounded-xl p-2 sm:p-3 border hover:shadow-lg transition z-[10]"
                data-aos="fade-up"
                onClick={() => handleToolClick(tool.name)}
              >
                <img src={tool.icon} alt={tool.name} className="h-6 sm:h-8 w-6 sm:w-8 mb-1 sm:mb-2" />
                <h4 className="text-gray-800 font-medium text-sm sm:text-lg mb-0.5 sm:mb-1">
                  {tool.name}
                </h4>
                <p className="text-xs sm:text-sm text-gray-500">
                  Launch this tool to boost your productivity
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Floating AI Chatbot Icon */}
      <div
        className="fixed bottom-4 sm:bottom-6 right-4 sm:right-6 bg-blue-600 text-white rounded-full p-2 sm:p-3 cursor-pointer shadow-lg hover:bg-blue-700 transition z-[1000]"
        onClick={handleChatbotClick}
        style={{ zIndex: 1000 }}
      >
        <ChatBubbleLeftIcon className="h-5 sm:h-6 w-5 sm:w-6" />
      </div>
    </div>
  );
};

export default Home;