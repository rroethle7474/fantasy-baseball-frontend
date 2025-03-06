import { useState } from 'react';
import { Link } from 'react-router-dom';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="header">
      <div className="header-container">
        <div className="flex items-center justify-between w-full">
          <Link to="/" className="header-logo">
            Fantasy Baseball
          </Link>
          
          {/* Desktop navigation - CSS media query handles visibility */}
          <nav className="header-nav">
            <Link 
              to="/" 
              className="header-link flex items-center"
            >
              <svg 
                className="w-5 h-5 mr-2" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" 
                />
              </svg>
              Home
            </Link>
            <Link 
              to="/hitters" 
              className="header-link"
            >
              Hitters
            </Link>
            <Link 
              to="/pitchers" 
              className="header-link"
            >
              Pitchers
            </Link>
            <Link 
              to="/teams" 
              className="header-link"
            >
              Teams
            </Link>
          </nav>
          
          {/* Mobile menu button - only visible on mobile */}
          <button 
            className="md:hidden p-2 rounded-md hover:bg-blue-700 focus:outline-none" 
            onClick={toggleMenu}
            aria-label="Toggle menu"
          >
            <svg 
              className="w-6 h-6" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24" 
              xmlns="http://www.w3.org/2000/svg"
            >
              {isMenuOpen ? (
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M6 18L18 6M6 6l12 12" 
                />
              ) : (
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M4 6h16M4 12h16M4 18h16" 
                />
              )}
            </svg>
          </button>
        </div>
      </div>
      
      {/* Mobile navigation - dropdown menu */}
      {isMenuOpen && (
        <nav className="md:hidden mt-4 pb-3 border-t border-blue-500 pt-3">
          <div className="flex flex-col space-y-4">
            <Link 
              to="/" 
              className="flex items-center text-lg py-2 px-3 rounded-md hover:bg-blue-700"
              onClick={() => setIsMenuOpen(false)}
            >
              <svg 
                className="w-5 h-5 mr-2" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" 
                />
              </svg>
              Home
            </Link>
            <Link 
              to="/hitters" 
              className="text-lg py-2 px-3 rounded-md hover:bg-blue-700"
              onClick={() => setIsMenuOpen(false)}
            >
              Hitters
            </Link>
            <Link 
              to="/pitchers" 
              className="text-lg py-2 px-3 rounded-md hover:bg-blue-700"
              onClick={() => setIsMenuOpen(false)}
            >
              Pitchers
            </Link>
            <Link 
              to="/teams" 
              className="text-lg py-2 px-3 rounded-md hover:bg-blue-700"
              onClick={() => setIsMenuOpen(false)}
            >
              Teams
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
};

export default Header; 