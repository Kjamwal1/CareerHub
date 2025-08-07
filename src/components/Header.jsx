import "boxicons/css/boxicons.min.css";
import logo from "../assets/logo.png";

const Header = ({ onLoginClick, onSignupClick }) => {
  const toggleMobileMenu = () => {
    const mobileMenu = document.getElementById("mobileMenu");
    if (mobileMenu.classList.contains("hidden")) {
      mobileMenu.classList.remove("hidden");
    } else {
      mobileMenu.classList.add("hidden");
    }
  };

  return (
    <header className="flex justify-between items-center py-3 px-3 lg:px-20">
      {/* Logo and Name */}
      <div className="flex items-center gap-0">
        <img
          src={logo}
          alt="Caryo Logo"
          className="h-12 md:h-16 lg:h-20 w-auto object-contain mt-2"
        />
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-light m-0">
          CAREER HUB
        </h1>
      </div>

      {/* Desktop Navigation */}
      <nav className="hidden md:flex items-center gap-12">
        <a
          data-aos="fade-down"
          data-aos-easing="linear"
          data-aos-duration="400"
          className="flex items-center gap-1 text-base tracking-wider transition-colors hover:text-gray-300 z-50 cursor-pointer"
          href="#"
        >
          CHECKER
          <i className="bx bx-chevron-down text-lg mt-1"></i>
        </a>
        <a
          data-aos="fade-down"
          data-aos-easing="linear"
          data-aos-duration="500"
          className="flex items-center gap-1 text-base tracking-wider transition-colors hover:text-gray-300 z-50 cursor-pointer"
          href="#"
        >
          BUILDER
          <i className="bx bx-chevron-down text-lg mt-1"></i>
        </a>
        <a
          data-aos="fade-down"
          data-aos-easing="linear"
          data-aos-duration="600"
          className="flex items-center gap-1 text-base tracking-wider transition-colors hover:text-gray-300 z-50 cursor-pointer"
          href="#"
        >
          RESOURCES
          <i className="bx bx-chevron-down text-lg mt-1"></i>
        </a>
        <a
          data-aos="fade-down"
          data-aos-easing="linear"
          data-aos-duration="700"
          className="flex items-center gap-1 text-base tracking-wider transition-colors hover:text-gray-300 z-50 cursor-pointer"
          href="#"
        >
          FEATURES
          <i className="bx bx-chevron-down text-lg mt-1"></i>
        </a>
      </nav>

      {/* Buttons - Desktop */}
      <div className="hidden md:flex items-center gap-2 z-50">
        <button
          onClick={onLoginClick}
          className="bg-[#a7a7a7] text-black py-3 px-8 rounded-full border-none font-medium transition-all duration-500 hover:bg-white cursor-pointer z-50"
        >
          SIGN IN
        </button>

        <button
          onClick={onSignupClick}
          className="bg-gradient-to-r from-[#3B82F6] via-[#5F6EF8] to-[#7C3AED] text-white py-3 px-8 rounded-full border-none font-medium transition-all duration-500 hover:from-white hover:to-white hover:text-black cursor-pointer z-50"
        >
          CREATE AN ACCOUNT
        </button>
      </div>

      {/* Mobile Menu Toggle */}
      <button
        onClick={toggleMobileMenu}
        className="md:hidden text-3xl p-2 z-50"
      >
        <i className="bx bx-menu"></i>
      </button>

      {/* Mobile Menu */}
      <div
        id="mobileMenu"
        className="hidden fixed top-16 bottom-0 right-0 left-0 p-5 md:hidden z-40 bg-black bg-opacity-70 backdrop-blur-md"
      >
        <nav className="flex flex-col gap-6 items-center">
          <a
            className="text-base tracking-wider transition-colors hover:text-gray-300 z-50"
            href="#"
          >
            CHECKER
          </a>
          <a
            className="text-base tracking-wider transition-colors hover:text-gray-300 z-50"
            href="#"
          >
            BUILDER
          </a>
          <a
            className="text-base tracking-wider transition-colors hover:text-gray-300 z-50"
            href="#"
          >
            RESOURCES
          </a>
          <a
            className="text-base tracking-wider transition-colors hover:text-gray-300 z-50"
            href="#"
          >
            FEATURES
          </a>
        </nav>
      </div>
    </header>
  );
};

export default Header;
