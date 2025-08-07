import React, { useEffect, useState, useRef } from "react";

const SignupModal = ({ onClose, switchToLogin, onSignupSuccess }) => {
  const [showAnim, setShowAnim] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const nameRef = useRef(null);

  useEffect(() => {
    setTimeout(() => setShowAnim(true), 10);
    nameRef.current?.focus();
  }, []);

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("http://localhost:5000/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: e.target.name.value,
          email: e.target.email.value,
          password: e.target.password.value,
        }),
      });

      const data = await response.json();
      console.log("Signup response:", data);
      if (response.ok) {
        localStorage.setItem("token", data.token);
        onSignupSuccess(data.user, data.token);
        onClose();
      } else {
        setError(data.error || "Signup failed. Please try again.");
      }
    } catch (err) {
      setError("Unable to connect to the server. Please try again later.");
      console.error("Signup error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div
        className={`transform transition-all duration-500 ease-out ${
          showAnim
            ? "opacity-100 translate-y-0 scale-100"
            : "opacity-0 translate-y-10 scale-95"
        } bg-white/10 backdrop-blur-xl border border-white/30 rounded-xl shadow-2xl w-full max-w-md overflow-hidden relative`}
      >
        <button
          onClick={onClose}
          aria-label="Close signup modal"
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 p-1 rounded-full"
        >
          <i className="fas fa-times text-xl"></i>
        </button>

        <div className="p-6">
          <div className="flex flex-col items-center mb-6 mt-2">
            <img
              src="src/assets/logo.png"
              alt="Logo"
              className="h-20 w-20 mb-2"
            />
            <h3 className="text-2xl font-bold text-white">Join Career Hub</h3>
          </div>

          {error && (
            <div className="text-red-500 text-sm mb-4 text-center">{error}</div>
          )}

          <form className="space-y-4" onSubmit={handleSignup}>
            <label className="block mb-2">
              <span className="text-sm font-medium text-white">
                Name <span className="text-red-500">*</span>
              </span>
              <input
                ref={nameRef}
                required
                name="name"
                type="text"
                className="mt-1 block w-full rounded-md bg-gray-800 border border-gray-600 p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Your Name"
              />
            </label>

            <label className="block mb-2">
              <span className="text-sm font-medium text-white">
                Email <span className="text-red-500">*</span>
              </span>
              <input
                required
                name="email"
                type="email"
                className="mt-1 block w-full rounded-md bg-gray-800 border border-gray-600 p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="you@example.com"
              />
            </label>

            <label className="block mb-4">
              <span className="text-sm font-medium text-white">
                Password <span className="text-red-500">*</span>
              </span>
              <input
                required
                name="password"
                type="password"
                className="mt-1 block w-full rounded-md bg-gray-800 border border-gray-600 p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="••••••••"
              />
            </label>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 px-4 rounded-full font-medium tracking-wide text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 transition-all duration-300 border border-white/20 backdrop-blur-sm ${
                loading
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:shadow-[0_0_20px_rgba(99,102,241,0.8)]"
              }`}
            >
              {loading ? (
                "Creating account..."
              ) : (
                <>
                  <i className="fas fa-user-plus mr-2" /> Create Account
                </>
              )}
            </button>

            <div className="text-center text-sm text-gray-600">
              Already have an account?
              <button
                type="button"
                onClick={switchToLogin}
                className="text-blue-600 hover:text-blue-800 font-medium ml-1"
              >
                Log in
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SignupModal;