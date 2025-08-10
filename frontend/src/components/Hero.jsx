import "boxicons/css/boxicons.min.css";
import Spline from "@splinetool/react-spline";

const Hero = ({ onGetStartedClick }) => {
  return (
    <main className="flex min-h-[calc(100vh-6rem)] flex-col items-center justify-center font-poppins">
      {/* Centered Content */}
      <div className="flex w-full h-full justify-center items-center">
        <div
          data-aos="fade-right"
          data-aos-offset="300"
          data-aos-easing="ease-in-sine"
          className="max-w-4xl w-full text-center px-4 z-10"
        >
          {/* Badge */}
          <div className="relative w-[95%] sm:w-48 h-10 mx-auto bg-gradient-to-r from-[#656565] to-[#1D4ED8] shadow-[0_0_20px_rgba(255,255,255,0.4)] rounded-full">
            <div className="absolute inset-[3px] bg-black rounded-full flex items-center justify-center gap-1 text-white text-sm font-medium">
              <i className="bx bx-diamond"></i>
              INTRODUCING
            </div>
          </div>

          {/* Heading */}
          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-[4.3rem] font-extrabold tracking-tight leading-tight my-10">
            <span className="block text-white">Your AI Career Wingman</span>
            <span className="block bg-gradient-to-r from-[#00cfff] to-[#007bff] text-transparent bg-clip-text">
              — From Resume to Recruiter
            </span>
          </h1>

          {/* Subheading */}
          <p className="text-lg sm:text-xl tracking-wide text-gray-400 max-w-2xl mx-auto">
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
          <div className="flex justify-center mt-10">
            <a
              onClick={onGetStartedClick}
             className="cursor-pointer border border-[#2a2a2a] py-3 px-10 rounded-full text-lg font-semibold tracking-wider transition-colors duration-300 bg-gray-300 text-black hover:text-white hover:bg-gradient-to-r hover:from-blue-500 hover:to-purple-600"
>
              Get Started <i className="bx bx-link-external"></i>
            </a>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Hero;
