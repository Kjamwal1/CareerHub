import "boxicons/css/boxicons.min.css";

const Features = () => {
  return (
    <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
      <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 sm:mb-6">Why Choose Caryo?</h2>
      <p className="text-gray-600 text-base sm:text-lg mb-6 sm:mb-10">
        Caryo empowers your job hunt by combining resume checks, LinkedIn optimization, AI-driven feedback, and real-time mentorship in one place.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="bg-gray-100 p-4 sm:p-6 rounded-xl shadow-md">
          <i className="bx bx-check-shield text-2xl sm:text-3xl text-blue-700 mb-2 sm:mb-4"></i>
          <h3 className="text-lg sm:text-xl font-semibold mb-1 sm:mb-2">ATS Resume Checker</h3>
          <p className="text-gray-600 text-sm sm:text-base">Ensure your resume gets past applicant tracking systems.</p>
        </div>

        <div className="bg-gray-100 p-4 sm:p-6 rounded-xl shadow-md">
          <i className="bx bx-network-chart text-2xl sm:text-3xl text-blue-700 mb-2 sm:mb-4"></i>
          <h3 className="text-lg sm:text-xl font-semibold mb-1 sm:mb-2">LinkedIn Analyzer</h3>
          <p className="text-gray-600 text-sm sm:text-base">Boost visibility and professionalism on LinkedIn.</p>
        </div>

        <div className="bg-gray-100 p-4 sm:p-6 rounded-xl shadow-md">
          <i className="bx bx-bot text-2xl sm:text-3xl text-blue-700 mb-2 sm:mb-4"></i>
          <h3 className="text-lg sm:text-xl font-semibold mb-1 sm:mb-2">AI Mentor</h3>
          <p className="text-gray-600 text-sm sm:text-base">Get tailored advice on applications, interviews, and more.</p>
        </div>
      </div>
    </div>
  );
};

export default Features;