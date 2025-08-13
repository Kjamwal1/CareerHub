import "boxicons/css/boxicons.min.css";
import Spline from "@splinetool/react-spline";

const Hero = ({ onGetStartedClick }) => {
  return (
    <main className="flex min-h-[calc(100vh-6rem)] sm:min-h-[calc(100vh-7rem)] flex-col items-center justify-center font-poppins">
      {/* Centered Content */}
      <div className="flex w-full h-full justify-center items-center">
        <div
          data-aos="fade-right"
          data-aos-offset="300"
          data-aos-easing="ease-in-sine"
          className="max-w-4xl w-full text-center px-4 sm:px-6 lg:px-8 z-10"
        >
          {/* Badge */}
          <div className="relative w-[70%] sm:w-40 h-6 sm:h-8 mx-auto bg-gradient-to-r from-[#656565] to-[#1D4ED8] shadow-[0_0_20px_rgba(255,255,255,0.4)] rounded-full">
            <div className="absolute inset-[1px] sm:inset-[2px] bg-black rounded-full flex items-center justify-center gap-1 text-xs sm:text-sm font-medium">
              <i className="bx bx-diamond text-xs sm:text-sm"></i>
              INTRODUCING
            </div>
          </div>

          {/* Heading */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-extrabold tracking-tight leading-tight my-6 sm:my-8">
            <span className="block text-white">Your AI Career Wingman</span>
            <span className="block bg-gradient-to-r from-[#00cfff] to-[#007bff] text-transparent bg-clip-text">
              — From Resume to Recruiter
            </span>
          </h1>

          {/* Subheading */}
          <p className="text-sm sm:text-lg md:text-xl tracking-wide text-gray-400 max-w-xl sm:max-w-2xl mx-auto">
            <span className="text-gray-300 font-medium">
              All-In-One Platform. Zero Guesswork.
            </span>
            <br />
            AI That Fixes Your Resume, Optimizes LinkedIn,
            <br />
            Real-Time Application Tracking & AI Career Guidance.
            <br />— All the Way to ‘You’re Hired.’
          </p>

          {/* Button */}
          <div className="flex justify-center mt-6 sm:mt-8">
            <a
              onClick={onGetStartedClick}
              className="cursor-pointer border border-[#2a2a2a] py-2 sm:py-3 px-6 sm:px-10 rounded-full text-base sm:text-lg font-semibold tracking-wider transition-colors duration-300 bg-gray-300 text-black hover:text-white hover:bg-gradient-to-r hover:from-blue-500 hover:to-purple-600"
            >
              Get Started <i className="bx bx-link-external text-base sm:text-lg"></i>
            </a>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Hero;