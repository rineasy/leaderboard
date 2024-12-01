import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navbar: React.FC = () => {
  const location = useLocation();
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleLoginClick = () => {
    setIsLoggingIn(true);
    // Reset state after 2 seconds if redirect hasn't happened
    setTimeout(() => setIsLoggingIn(false), 2000);
  };

  return (
    <div className="navbar bg-base-100 fixed top-0 z-50 shadow-md">
      <div className="navbar-start">
        <div className="dropdown">
          <label tabIndex={0} className="btn btn-ghost lg:hidden">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h8m-8 6h16" />
            </svg>
          </label>
          <ul tabIndex={0} className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52">
            <li>
              <Link to="/" className={location.pathname === '/' ? 'active' : ''}>
                🏆 Leaderboard
              </Link>
            </li>
            <li>
              <Link to="/apply" className={location.pathname === '/apply' ? 'active' : ''}>
                📝 Daftar
              </Link>
            </li>
          </ul>
        </div>
        <Link to="/" className="btn btn-ghost normal-case text-xl">
          LAPAKTOTO
        </Link>
      </div>
      <div className="navbar-center hidden lg:flex">
        <ul className="menu menu-horizontal px-1">
          <li>
            <Link to="/" className={location.pathname === '/' ? 'active' : ''}>
              🏆 Leaderboard
            </Link>
          </li>
          <li>
            <Link to="/apply" className={location.pathname === '/apply' ? 'active' : ''}>
              📝 Daftar
            </Link>
          </li>
        </ul>
      </div>
      <div className="navbar-end">
        <a 
          href="https://japin.xyz/gass" 
          target="_blank" 
          rel="noopener noreferrer"
          onClick={handleLoginClick}
          className={`btn btn-primary ${isLoggingIn ? 'loading' : ''}`}
        >
          {isLoggingIn ? 'Loading...' : '🔐 Login'}
        </a>
      </div>
    </div>
  );
};

export default Navbar;
