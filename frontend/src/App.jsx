import { useState, useEffect, useContext } from "react";
import { useAuth, AuthContext } from "./context/AuthContext.jsx";
import { Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import LoginModal from "./components/LoginModal";
import SignupModal from "./components/SignupModal";
import AOS from "aos";
import "aos/dist/aos.css";
import Landing from "./components/Landing";
import Home from "./components/Home";
import ResumeCheckerPage from "./pages/ResumeCheckerPage";
import MyDocumentsPage from "./components/MyDocumentsPage";
import ResumeHistoryPage from "./components/ResumeHistoryPage";
import LinkedInOptimizer from "./pages/LinkedInOptimizer";
import Chatbot from "./pages/Chatbot";
import JobTracker from "./pages/JobTracker";
import IndustrySelection from "./pages/IndustrySelection"; // New import
import ErrorBoundary from "./components/ErrorBoundary";
import LinkedInHeadlineGenerator from "./components/LinkedinHeadlineGenerator.jsx";
import CoverLetterBuilder from "./components/CoverLetterBuilder";
import { library } from "@fortawesome/fontawesome-svg-core";
import { fas } from "@fortawesome/free-solid-svg-icons";
library.add(fas);

const ProtectedRoute = ({ children }) => {
  const { user } = useContext(AuthContext);
  if (!user) return <Navigate to="/" />;
  if (!user.industry) return <Navigate to="/industry-selection" />;
  return children;
};

export default function App() {
  const { user, login, logout } = useAuth();
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);

  useEffect(() => {
    AOS.init({
      duration: 800,
      once: true,
      throttleDelay: 99,
      debounceDelay: 50,
    });
  }, []);

  const openLogin = () => {
    setShowLogin(true);
    setShowSignup(false);
  };

  const openSignup = () => {
    setShowSignup(true);
    setShowLogin(false);
  };

  const closeModals = () => {
    setShowLogin(false);
    setShowSignup(false);
  };

  return (
    <main className="relative">
      <ToastContainer />
      {!user && (
        <>
          <div className="absolute top-0 right-0 h-[calc(90vh-6rem+80px)] w-full bg-gradient-radial opacity-50 -z-10" />
          <div className="h-0 w-[40rem] absolute top-[20%] right-[-5%] shadow-[0_0_200px_50px_#1D4ED8] -rotate-[30deg] -z-10"></div>
        </>
      )}
      <ErrorBoundary>
        <Routes>
          <Route
            path="/"
            element={
              !user ? (
                <>
                  <Landing
                    onLoginClick={openLogin}
                    onSignupClick={openSignup}
                    onGetStartedClick={openLogin}
                  />
                  {showLogin && (
                    <LoginModal
                      onClose={closeModals}
                      onLoginSuccess={(userInfo, token) => {
                        console.log("Login success:", userInfo, token);
                        login(userInfo, token);
                        closeModals();
                      }}
                      switchToSignup={() => {
                        setShowLogin(false);
                        setShowSignup(true);
                      }}
                    />
                  )}
                  {showSignup && (
                    <SignupModal
                      onClose={closeModals}
                      onSignupSuccess={(userInfo, token) => {
                        login(userInfo, token);
                        closeModals();
                      }}
                      switchToLogin={() => {
                        setShowSignup(false);
                        setShowLogin(true);
                      }}
                    />
                  )}
                </>
              ) : (
                <Home />
              )
            }
          />
          <Route
            path="/industry-selection"
            element={<IndustrySelection />}
          />
          <Route
            path="/home"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />
          <Route
            path="/resume-checker"
            element={
              <ProtectedRoute>
                <ResumeCheckerPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/resume-history"
            element={
              <ProtectedRoute>
                <ResumeHistoryPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/linkedin-optimizer"
            element={
              <ProtectedRoute>
                <LinkedInOptimizer />
              </ProtectedRoute>
            }
          />
          <Route
            path="/chatbot"
            element={
              <ProtectedRoute>
                <Chatbot />
              </ProtectedRoute>
            }
          />
          <Route
            path="/cover-letter-builder"
            element={
              <ProtectedRoute>
                <CoverLetterBuilder />
              </ProtectedRoute>
            }
          />
          <Route
            path="/job-tracker"
            element={
              <ProtectedRoute>
                <JobTracker />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-documents"
            element={
              <ProtectedRoute>
                <MyDocumentsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/linkedin-headline-generator"
            element={<LinkedInHeadlineGenerator />}
          />
        </Routes>
      </ErrorBoundary>
    </main>
  );
}