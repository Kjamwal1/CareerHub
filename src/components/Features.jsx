const Features = () => {
  return (
    <div className="max-w-4xl mx-auto text-center">
      <h2 className="text-3xl lg:text-4xl font-bold mb-6">Why Choose Caryo?</h2>
      <p className="text-gray-600 text-lg mb-10">
        Caryo empowers your job hunt by combining resume checks, LinkedIn optimization, AI-driven feedback, and real-time mentorship in one place.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-gray-100 p-6 rounded-xl shadow-md">
          <i className="bx bx-check-shield text-3xl text-blue-700 mb-4"></i>
          <h3 className="text-xl font-semibold mb-2">ATS Resume Checker</h3>
          <p className="text-gray-600">Ensure your resume gets past applicant tracking systems.</p>
        </div>

        <div className="bg-gray-100 p-6 rounded-xl shadow-md">
          <i className="bx bx-network-chart text-3xl text-blue-700 mb-4"></i>
          <h3 className="text-xl font-semibold mb-2">LinkedIn Analyzer</h3>
          <p className="text-gray-600">Boost visibility and professionalism on LinkedIn.</p>
        </div>

        <div className="bg-gray-100 p-6 rounded-xl shadow-md">
          <i className="bx bx-bot text-3xl text-blue-700 mb-4"></i>
          <h3 className="text-xl font-semibold mb-2">AI Mentor</h3>
          <p className="text-gray-600">Get tailored advice on applications, interviews, and more.</p>
        </div>
      </div>
    </div>
  );
};

export default Features;
