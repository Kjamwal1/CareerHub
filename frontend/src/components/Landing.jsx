import React, { useState, useEffect, useRef } from "react";
import Header from "../components/Header";
import Hero from "../components/Hero";
import Spline from "@splinetool/react-spline";

const Landing = ({ onLoginClick, onSignupClick, onGetStartedClick }) => {
  const fileInputRef = useRef(null);
  const [jobDescription, setJobDescription] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [analysisResult, setAnalysisResult] = useState(null);
  const [error, setError] = useState(null);

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowedTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    const maxSize = 2 * 1024 * 1024;

    const isValidType = allowedTypes.includes(file.type);
    const isValidSize = file.size <= maxSize;

    if (!isValidType) {
      alert("Only PDF and DOCX files are allowed.");
      e.target.value = null;
      return;
    }

    if (!isValidSize) {
      alert("File size must be less than 2MB.");
      e.target.value = null;
      return;
    }

    try {
      const formData = new FormData();
      formData.append("resume", file);
      formData.append("jobDescription", jobDescription);

      const token = localStorage.getItem("token");
      if (!token) throw new Error("Please log in to analyze your resume.");

      console.log("Sending resume analysis request to:", `${import.meta.env.VITE_API_URL}/check-resume`);
      const response = await fetch(`${import.meta.env.VITE_API_URL}/check-resume`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      console.log("Response Status:", response.status, "Headers:", Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const responseText = await response.text();
        console.log("Response Body:", responseText);
        throw new Error(`Failed to analyze resume: ${response.status} ${responseText}`);
      }

      const data = await response.json();
      if (data.error) throw new Error(data.error);
      setAnalysisResult(data);
      setError(null);
    } catch (err) {
      console.error("Resume analysis error:", err.message, err.stack);
      setError(err.message);
      alert(`Error analyzing resume: ${err.message}`);
    } finally {
      e.target.value = null;
    }
  };

  const validateLinkedInUrl = (url) => {
    const regex = /^https?:\/\/(www\.)?linkedin\.com\/in\/[a-zA-Z0-9-_]+\/?$/;
    return regex.test(url.trim());
  };

  const handleLinkedInAnalyse = async () => {
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = ".pdf";
    fileInput.style.display = "none";
    document.body.appendChild(fileInput);

    fileInput.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) {
        document.body.removeChild(fileInput);
        return;
      }

      const maxSize = 2 * 1024 * 1024;
      if (file.size > maxSize) {
        alert("File size must be less than 2MB.");
        document.body.removeChild(fileInput);
        return;
      }

      try {
        const formData = new FormData();
        formData.append("linkedinPdf", file);
        formData.append("jobDescription", jobDescription);

        const token = localStorage.getItem("token");
        if (!token) throw new Error("Please log in to analyze your LinkedIn profile.");

        console.log("Sending LinkedIn analysis request to:", `${import.meta.env.VITE_API_URL}/api/linkedin-analyze`);
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/linkedin-analyze`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        });

        console.log("Response Status:", response.status, "Headers:", Object.fromEntries(response.headers.entries()));

        if (!response.ok) {
          const responseText = await response.text();
          console.log("Response Body:", responseText);
          throw new Error(`Failed to analyze LinkedIn PDF: ${response.status} ${responseText}`);
        }

        const data = await response.json();
        if (data.error) throw new Error(data.error);
        setAnalysisResult(data);
        setError(null);
      } catch (err) {
        console.error("LinkedIn analysis error:", err.message, err.stack);
        setError(err.message);
        alert(`Error analyzing LinkedIn PDF: ${err.message}`);
      } finally {
        document.body.removeChild(fileInput);
        setLinkedinUrl("");
        onLoginClick?.();
      }
    };

    fileInput.click();
  };

  const [showScrollTop, setShowScrollTop] = useState(false);
  const footerRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      const footerTop = footerRef.current?.getBoundingClientRect().top || 0;
      const windowHeight = window.innerHeight;

      if (footerTop <= windowHeight - 100) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <div className="min-h-screen overflow-x-hidden">
        <Header onLoginClick={onLoginClick} onSignupClick={onSignupClick} />
        <Hero onGetStartedClick={onGetStartedClick} />

        {/* Resume Checker Section */}
        <section
          className="min-h-screen bg-gray-100 text-black flex items-center justify-center px-4 sm:px-6 lg:px-20 py-16 overflow-x-hidden"
          data-aos="fade-up"
          data-aos-duration="1000"
        >
          <div className="flex flex-col lg:flex-row items-center justify-center w-full max-w-7xl gap-8 sm:gap-12">
            {/* Left Image */}
            <div
              className="w-full lg:w-1/2 flex justify-center"
              data-aos="fade-right"
              data-aos-delay="200"
            >
              <img
                src="/resume-preview.gif"
                alt="Resume preview"
                className="rounded-3xl shadow-2xl w-full max-w-[300px] sm:max-w-[400px] md:max-w-[500px]"
              />
            </div>

            {/* Right Content */}
            <div
              className="w-full lg:w-1/2 space-y-6 sm:space-y-8"
              data-aos="fade-left"
              data-aos-delay="400"
            >
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 leading-tight text-center lg:text-left">
                Will Your Resume Beat the Bots?
              </h2>
              <p className="text-gray-700 text-base sm:text-lg leading-relaxed text-center lg:text-left">
                Your resume has to impress both recruiters and algorithms. Our
                AI checks design, keywords, and structure to help you beat ATS
                filters and land more interviews.
                <br />
                Start strong. Apply smarter. Get hired faster.
              </p>

              {/* Upload Box */}
              <div className="flex justify-center lg:justify-start">
                <div className="rounded-2xl p-4 sm:p-6 text-center bg-white/60 backdrop-blur-xl border border-gray-300 shadow-2xl max-w-xs sm:max-w-sm md:max-w-md w-full transition-all hover:shadow-2xl">
                  <div className="flex flex-col items-center justify-center space-y-3 sm:space-y-4">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 sm:h-8 w-6 sm:w-8 text-gray-700"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1M12 12V4m0 0l-4 4m4-4l4 4"
                      />
                    </svg>
                    <p className="font-semibold text-sm sm:text-base text-gray-800">
                      Drop your resume here or{" "}
                      <span className="font-bold underline cursor-pointer">
                        choose a file
                      </span>
                    </p>
                    <p className="text-xs sm:text-sm text-gray-600">
                      PDF & DOCX only. Max 2MB file size.
                    </p>

                    {/* Job Description Input */}
                    <input
                      type="text"
                      value={jobDescription}
                      onChange={(e) => setJobDescription(e.target.value)}
                      placeholder="Enter job description"
                      className="w-full px-4 py-2 rounded-xl bg-white/80 border border-gray-300 placeholder-gray-500 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#0e132a] focus:bg-white transition"
                    />

                    {/* Hidden File Input */}
                    <div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".pdf,.docx"
                        id="resumeUpload"
                        style={{ display: "none" }}
                        onChange={handleFileSelect}
                      />

                      {/* Upload Button */}
                      <button
                        type="button"
                        onClick={() => {
                          if (fileInputRef.current) {
                            fileInputRef.current.value = null;
                            fileInputRef.current.click();
                          }
                        }}
                        aria-label="Upload your resume"
                        className="cursor-pointer border border-[#2a2a2a] py-2 sm:py-3 px-6 sm:px-10 rounded-full relative overflow-hidden bg-[#0e132a] text-white text-sm sm:text-lg font-semibold transition-all duration-500 hover:bg-gradient-to-r hover:from-blue-500 hover:to-purple-600"
                      >
                        <span className="relative z-10">Upload your resume</span>
                      </button>
                    </div>
                    {error && <p className="text-red-500 text-sm">{error}</p>}
                    {analysisResult && (
                      <div className="text-sm text-green-500">
                        Analysis: Match Score {analysisResult.matchScore}%
                      </div>
                    )}
                    <p className="text-xs sm:text-sm text-gray-600 mt-1 flex items-center justify-center gap-1">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-3 sm:h-4 w-3 sm:w-4 text-red-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M12 11c1.104 0 2-.896 2-2V7a2 2 0 00-4 0v2c0 1.104.896 2 2 2zm6 2H6a2 2 0 00-2 2v5h16v-5a2 2 0 00-2-2z"
                        />
                      </svg>
                      Privacy guaranteed
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* LinkedIn Checker Section */}
        <section
          className="relative min-h-screen text-white flex items-center justify-center px-4 sm:px-6 lg:px-20 py-16 backdrop-blur-xl transition-all duration-700 z-0 overflow-x-hidden"
          data-aos="fade-up"
          data-aos-duration="1000"
        >
          <img
            className="absolute top-0 left-1/2 transform -translate-x-1/2 w-full h-full object-cover opacity-60 -z-10"
            src="/gradient.png"
            alt="Gradient Background"
          />
          <div className="h-0 w-[40rem] absolute top-[20%] right-1/2 transform translate-x-1/2 shadow-[0_0_900px_20px_#1D4ED8] -rotate-[30deg] -z-10"></div>

          <div className="flex flex-col-reverse lg:flex-row items-center justify-center gap-8 sm:gap-12 w-full max-w-7xl">
            {/* Text Content */}
            <div
              data-aos="fade-right"
              data-aos-offset="300"
              data-aos-easing="ease-in-sine"
              data-aos-duration="1000"
              className="text-center lg:text-left max-w-xs sm:max-w-md md:max-w-xl"
            >
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-tight">
                Fix Your LinkedIn. Impress Recruiters. Get Hired.
              </h2>
              <p className="mt-4 sm:mt-6 text-white/90 text-base sm:text-lg">
                Get Seen. Get Chosen.
                <br />
                AI transforms your LinkedIn into a recruiter magnet—optimized,
                keyword-rich, and built to get you hired.
              </p>

              <div className="mt-6 sm:mt-10 flex justify-center lg:justify-start">
                <div className="rounded-2xl p-4 sm:p-6 bg-white/60 backdrop-blur-xl border border-white/30 shadow-xl max-w-xs sm:max-w-sm md:max-w-md w-full transition-all hover:shadow-2xl">
                  <div className="space-y-4 sm:space-y-5">
                    <div className="flex items-center justify-center gap-2 sm:gap-3 text-[#0A66C2]">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 sm:h-7 w-5 sm:w-7"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={1.5}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M16 12a4 4 0 01-8 0m8 0V6a2 2 0 00-2-2H8a2 2 0 00-2 2v6m12 0h.01M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1"
                        />
                      </svg>
                      <h3 className="font-semibold text-lg sm:text-xl text-gray-800">
                        LinkedIn Profile Checker
                      </h3>
                    </div>

                    <input
                      type="text"
                      value={linkedinUrl}
                      onChange={(e) => setLinkedinUrl(e.target.value)}
                      placeholder="https://linkedin.com/in/your-profile (optional)"
                      className="w-full px-4 sm:px-5 py-2 sm:py-3 rounded-xl bg-white/80 border border-gray-300 placeholder-gray-500 text-sm sm:text-base text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#0A66C2] focus:bg-white transition"
                    />

                    <input
                      type="text"
                      value={jobDescription}
                      onChange={(e) => setJobDescription(e.target.value)}
                      placeholder="Enter job description"
                      className="w-full px-4 sm:px-5 py-2 sm:py-3 rounded-xl bg-white/80 border border-gray-300 placeholder-gray-500 text-sm sm:text-base text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#0A66C2] focus:bg-white transition mt-2"
                    />

                    <button
                      onClick={handleLinkedInAnalyse}
                      className="w-full bg-[#0A66C2] text-white py-2 sm:py-2.5 rounded-xl font-semibold transition-all duration-500 hover:bg-gradient-to-r hover:from-blue-500 hover:to-purple-600"
                    >
                      Analyze LinkedIn Profile
                    </button>
                  </div>
                </div>
              </div>
              {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
              {analysisResult && (
                <div className="text-sm text-green-500 mt-2">
                  Analysis: Match Score {analysisResult.matchScore}%
                </div>
              )}
            </div>

            {/* Right Image */}
            <div
              className="w-full max-w-xs sm:max-w-sm md:max-w-xl flex justify-center"
              data-aos="fade-left"
              data-aos-offset="300"
              data-aos-easing="ease-in-sine"
            >
              <img
                src="/linkedin.gif"
                alt="LinkedIn illustration"
                className="w-full rounded-xl shadow-lg"
              />
            </div>
          </div>
        </section>

        {/* Job Application Tracker Section */}
        <section
          className="min-h-screen bg-white text-black flex items-center justify-center px-4 sm:px-6 lg:px-20 py-16 overflow-x-hidden"
          data-aos="fade-up"
          data-aos-duration="1000"
        >
          <div className="flex flex-col lg:flex-row items-center justify-center w-full max-w-7xl gap-8 sm:gap-12">
            {/* Text Content */}
            <div
              className="w-full lg:w-1/2 space-y-6 sm:space-y-8"
              data-aos="fade-right"
              data-aos-delay="200"
            >
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 leading-tight text-center lg:text-left">
                Track, Discover & Optimize Your Job Hunt — All from One Smart AI
                Dashboard.
              </h2>
              <p className="text-gray-700 text-base sm:text-lg leading-relaxed text-center lg:text-left">
                Stay on Top of Your Job Hunt — Effortlessly.
                <br />
                Track every job you’ve applied to, organize resumes and cover
                letters, get real-time interview updates, and discover new
                opportunities — all from one smart AI-powered dashboard.
                <br />
                Less chaos. More clarity. Faster offers.
              </p>

              <div className="flex justify-center lg:justify-start">
                <button
                  onClick={onLoginClick}
                  className="px-4 sm:px-6 py-2 sm:py-3 rounded-xl bg-white text-[#0e132a] font-medium shadow-md transition-all duration-500 hover:text-white hover:bg-gradient-to-r hover:from-blue-500 hover:to-purple-600"
                >
                  Start Tracking Jobs
                </button>
              </div>
            </div>

            {/* Right Image */}
            <div
              className="w-full lg:w-1/2 flex justify-center"
              data-aos="fade-left"
              data-aos-delay="400"
            >
              <img
                src="/job-tracker-preview.gif"
                alt="Job Tracker Illustration"
                className="rounded-3xl shadow-2xl w-full max-w-[300px] sm:max-w-[400px] md:max-w-[500px]"
              />
            </div>
          </div>
        </section>

        {/* AI Mentor Chatbot Section */}
        <section
          className="relative min-h-screen text-white flex items-center justify-center px-4 sm:px-6 lg:px-20 py-16 backdrop-blur-xl transition-all duration-700 z-0 overflow-x-hidden"
          data-aos="fade-up"
          data-aos-duration="1000"
        >
          <img
            className="absolute top-0 left-1/2 transform -translate-x-1/2 w-full h-full object-cover opacity-60 -z-10"
            src="/gradient.png"
            alt="Gradient Background"
          />
          <div className="h-0 w-[40rem] absolute top-[20%] right-1/2 transform translate-x-1/2 shadow-[0_0_900px_20px_#1D4ED8] -rotate-[30deg] -z-10"></div>

          <div className="flex flex-col-reverse lg:flex-row items-center justify-center gap-8 sm:gap-12 w-full max-w-7xl">
            {/* Text Content */}
            <div
              className="text-center lg:text-left max-w-xs sm:max-w-md md:max-w-xl"
              data-aos="fade-right"
              data-aos-offset="300"
              data-aos-easing="ease-in-sine"
            >
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-tight">
                Your Personal AI Mentor. Career Advice, Anytime.
              </h2>
              <p className="mt-4 sm:mt-6 text-white/90 text-base sm:text-lg">
                Confused about your career path, resume tone, or next steps?
                <br />
                Get instant, personalized guidance from your AI career mentor—
                available 24/7 to coach, review, and inspire.
              </p>

              <div className="mt-6 sm:mt-10 flex justify-center lg:justify-start">
                <button
                  onClick={onLoginClick}
                  className="group px-4 sm:px-6 py-2 sm:py-3 rounded-xl bg-white text-[#0e132a] font-medium shadow-md transition-all duration-500 hover:text-white hover:bg-gradient-to-r hover:from-blue-500 hover:to-purple-600"
                >
                  Talk to Your AI Mentor
                </button>
              </div>
            </div>

            {/* Right Spline Model */}
            <div className="absolute right-0 top-0 h-full w-full flex items-center justify-end overflow-visible pointer-events-none z-0">
              <Spline
                scene="https://prod.spline.design/o4HEAHymKMdBSmzs/scene.splinecode"
                className="w-[1200px] sm:w-[1500px] lg:w-[1800px] h-[1200px] sm:h-[1500px] lg:h-[1800px] -mr-40 sm:-mr-60 lg:-mr-80 -mt-20 sm:-mt-30 lg:-mt-40"
                data-aos="fade-zoom-in"
                data-aos-easing="ease-in-back"
                data-aos-delay="300"
                data-aos-offset="0"
                data-aos-duration="3000"
              />
            </div>
          </div>
        </section>

        {/* Seamless Carousel */}
        <section className="bg-gray-100 py-12 sm:py-16 overflow-x-hidden">
          <div
            className="max-w-7xl mx-auto mb-6 sm:mb-8 text-center"
            data-aos="fade-up"
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-2 sm:mb-4 text-gray-900">
              How Career Hub Works
            </h2>
            <p className="text-base sm:text-lg text-gray-600">
              See Career Hub in action — quick walkthroughs to help you get
              started.
            </p>
          </div>

          <div className="relative w-full overflow-hidden">
            <div
              className="flex gap-4 sm:gap-6 animate-circular-carousel"
              style={{ animation: "circularScroll 20s linear infinite" }}
            >
              {[
                "/resume_video.mp4",
                "/linkedin_video.mp4",
                "/linkedin.mp4",
                "/chatbot.mp4",
                "/job_tracker.mp4",
                "/resume_video.mp4",
                "/linkedin_video.mp4",
                "/linkedin.mp4",
                "/chatbot.mp4",
                "/job_tracker.mp4",
              ].map((src, i) => (
                <div
                  key={i}
                  className="flex-shrink-0 w-[250px] sm:w-[300px] md:w-[350px] lg:w-[400px]"
                >
                  <video
                    src={src}
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="h-[150px] sm:h-[200px] md:h-[250px] lg:h-[300px] w-full object-cover rounded-xl shadow-md"
                  />
                </div>
              ))}
            </div>
          </div>

          <style>{`
            @keyframes circularScroll {
              0% { transform: translateX(0); }
              100% { transform: translateX(-50%); }
            }
            .animate-circular-carousel {
              display: flex;
              width: 200%;
            }
            .animate-circular-carousel video {
              pointer-events: none;
            }
            .animate-circular-carousel:hover {
              animation-play-state: paused;
            }
          `}</style>
        </section>

        {/* More Features */}
        <section
          id="more-features"
          className="bg-white py-12 sm:py-16 px-4 sm:px-8 lg:px-20 relative overflow-x-hidden"
        >
          <div
            className="max-w-7xl mx-auto text-center mb-6 sm:mb-12"
            data-aos="fade-up"
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-2 sm:mb-4 text-gray-900">
              More Features of Career Hub
            </h2>
            <p className="text-base sm:text-lg text-gray-600">
              Discover all the tools you need to build and optimize your job
              applications.
            </p>
          </div>

          <div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 max-w-6xl mx-auto"
            data-aos="fade-up"
            data-aos-delay="100"
          >
            {[
              {
                title: "Resume Builder",
                desc: "Create stunning resumes using our AI-powered builder.",
                icon: "bxs-file",
                color: "text-blue-500",
              },
              {
                title: "AI Cover Letter Builder",
                desc: "Let AI help you write the perfect cover letter in seconds.",
                icon: "bxs-file-find",
                color: "text-purple-500",
              },
              {
                title: "Professional Resume Templates",
                desc: "Choose from 40+ customizable templates designed by experts.",
                icon: "bxs-layout",
                color: "text-green-500",
              },
              {
                title: "ATS Resume Checker",
                desc: "Ensure your resume gets past Applicant Tracking Systems.",
                icon: "bxs-check-circle",
                color: "text-yellow-500",
              },
              {
                title: "Website Resume Builder",
                desc: "Turn your resume into a personal portfolio website in 1 click.",
                icon: "bxs-globe",
                color: "text-red-500",
              },
              {
                title: "Proofreading Assistant",
                desc: "Fix grammar, spelling and phrasing automatically.",
                icon: "bxs-edit-alt",
                color: "text-indigo-500",
              },
              {
                title: "Job Application Tracker",
                desc: "Manage and organize all your job applications in one place.",
                icon: "bxs-briefcase-alt",
                color: "text-cyan-500",
              },
              {
                title: "LinkedIn Profile Checker",
                desc: "Optimize your profile to increase recruiter visibility.",
                icon: "bxl-linkedin-square",
                color: "text-blue-700",
              },
              {
                title: "AI Career Mentor",
                desc: "Chat with an AI mentor to get career guidance and tips.",
                icon: "bxs-bot",
                color: "text-pink-500",
              },
            ].map((feature, index) => (
              <div
                key={index}
                data-aos="zoom-in"
                data-aos-delay={index * 50}
                tabIndex={0}
                className="bg-gray-50 rounded-2xl p-4 sm:p-6 shadow-md transition duration-300 transform hover:scale-[1.03] focus:outline-none text-center hover:shadow-[0_0_20px_5px_rgba(59,130,246,0.5),0_0_40px_10px_rgba(147,51,234,0.4)] focus:shadow-[0_0_20px_5px_rgba(59,130,246,0.5),0_0_40px_10px_rgba(147,51,234,0.4)]"
              >
                <div
                  className={`text-3xl sm:text-4xl mb-2 sm:mb-4 mx-auto ${feature.color}`}
                >
                  <i className={`bx ${feature.icon}`}></i>
                </div>
                <h3 className="font-semibold text-lg sm:text-xl mb-1 sm:mb-2 text-black">
                  {feature.title}
                </h3>
                <p className="text-gray-600 text-sm sm:text-base">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>

          {/* CTA Block */}
          <div
            className="text-center mt-8 sm:mt-12"
            data-aos="fade-up"
            data-aos-delay="200"
          >
            <p className="text-base sm:text-lg text-gray-700 mb-2 sm:mb-4">
              And that's just the beginning...
            </p>
            <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-4 sm:mb-6">
              Log in to explore all Career Hub has to offer!
            </h3>
            <button
              onClick={onLoginClick}
              className="px-6 sm:px-8 py-2 sm:py-3 bg-black text-white font-medium rounded-full shadow-md transition duration-300 hover:scale-105 hover:shadow-xl hover:bg-gradient-to-r hover:from-blue-500 hover:to-purple-600"
            >
              Log In to Explore More
            </button>
          </div>

          <a
            href="#more-features"
            className="hidden sm:flex items-center justify-center w-12 sm:w-14 h-12 sm:h-14 bg-black text-white border border-black rounded-full shadow-md fixed bottom-4 sm:bottom-10 right-4 sm:right-6 z-50 transition-all duration-300 hover:bg-gradient-to-r hover:from-blue-500 hover:to-purple-600 hover:text-white hover:shadow-[0_0_20px_5px_rgba(59,130,246,0.4),0_0_30px_8px_rgba(147,51,234,0.3)]"
            data-aos="fade-left"
            title="See More Features"
          >
            <i className="bx bx-chevrons-down text-xl sm:text-2xl"></i>
          </a>
        </section>

        {/* Unified Footer */}
        <footer
          ref={footerRef}
          className="relative bg-black text-white pt-12 sm:pt-16 px-4 sm:px-6 overflow-x-hidden"
        >
          <video
            className="absolute top-0 left-1/2 transform -translate-x-1/2 w-full h-full object-cover opacity-60 z-0"
            autoPlay
            muted
            loop
            playsInline
          >
            <source src="/videos/footer-bg.mp4" type="video/mp4" />
          </video>

          <div className="relative z-10 max-w-4xl mx-auto text-center">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 sm:mb-4">
              Ready to Land Your Dream Job?
            </h2>
            <p className="text-base sm:text-lg text-white/80 mb-4 sm:mb-8">
              Let Career Hub supercharge your applications — resume to
              interview.
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-6 mb-8 sm:mb-12">
              <button
                onClick={onSignupClick}
                className="px-4 sm:px-6 py-2 sm:py-3 rounded-full bg-white text-black font-semibold hover:bg-gradient-to-r hover:from-blue-500 hover:to-purple-600 hover:text-white transition-all"
              >
                Get Started
              </button>
              <button
                onClick={onLoginClick}
                className="px-4 sm:px-6 py-2 sm:py-3 rounded-full border border-white font-semibold hover:bg-white hover:text-black transition-all"
              >
                Log In
              </button>
            </div>
          </div>

          <div className="relative z-10 border-t border-white/20 pt-6 sm:pt-8 pb-4 sm:pb-6 px-4">
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-6 text-center sm:text-left">
              <div>
                <h4 className="text-lg sm:text-xl font-semibold mb-1 sm:mb-2">
                  Career Hub
                </h4>
                <p className="text-sm text-white/80">
                  Empowering your career journey with smart AI tools.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4">
                <a
                  href="/privacy-policy"
                  className="text-sm text-white/70 hover:text-white transition"
                >
                  Privacy Policy
                </a>
                <a
                  href="/terms"
                  className="text-sm text-white/70 hover:text-white transition"
                >
                  Terms of Service
                </a>
                <a
                  href="/contact"
                  className="text-sm text-white/70 hover:text-white transition"
                >
                  Contact Us
                </a>
              </div>
              <div className="text-sm text-white/60">
                © {new Date().getFullYear()} Career Hub. All rights reserved.
              </div>
            </div>
          </div>
        </footer>

        {/* Floating Scroll Button */}
        <button
          onClick={() => {
            if (showScrollTop) {
              window.scrollTo({ top: 0, behavior: "smooth" });
            } else {
              const moreSection = document.getElementById("more-features");
              if (moreSection) {
                moreSection.scrollIntoView({ behavior: "smooth" });
              }
            }
          }}
          className="fixed bottom-4 sm:bottom-10 right-4 sm:right-6 z-50 w-12 sm:w-14 h-12 sm:h-14 bg-black text-white border border-black rounded-full shadow-md transition-all duration-300 hover:bg-gradient-to-r hover:from-blue-500 hover:to-purple-600 hover:text-white hover:shadow-[0_0_20px_5px_rgba(59,130,246,0.4),0_0_30px_8px_rgba(147,51,234,0.3)] flex items-center justify-center"
          title={showScrollTop ? "Back to Top" : "See More Features"}
        >
          <i
            className={`bx ${
              showScrollTop ? "bx-chevron-up" : "bx-chevrons-down"
            } text-xl sm:text-2xl`}
          />
        </button>
      </div>
    </>
  );
};

export default Landing;