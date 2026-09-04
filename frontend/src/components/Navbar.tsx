import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Briefcase, Menu, X, LogOut, LayoutDashboard, Sun, Moon } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../context/ThemeContext';

export const Navbar: React.FC = () => {
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    setIsMobileMenuOpen(false);
    navigate('/login');
  };

  const getDashboardPath = () => {
    if (!user) return '/dashboard';
    switch (user.role) {
      case 'admin':
        return '/dashboard/admin';
      case 'employer':
        return '/dashboard/employer';
      case 'jobseeker':
      default:
        return '/dashboard/jobseeker';
    }
  };

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `text-sm font-medium transition-colors hover:text-blue-600 ${
      isActive ? 'text-blue-600 font-semibold border-b-2 border-blue-600 pb-1' : 'text-gray-700'
    }`;

  const mobileNavLinkClass = ({ isActive }: { isActive: boolean }) =>
    `block px-4 py-3 rounded-lg text-base font-medium transition-colors ${
      isActive ? 'bg-blue-50 text-blue-600 font-semibold' : 'text-gray-700 hover:bg-gray-100'
    }`;

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Brand Logo */}
          <Link to="/" className="flex items-center space-x-2 sm:space-x-3 group">
            <div className="bg-blue-600 p-2 rounded-xl text-white shadow-md group-hover:bg-blue-700 transition-colors">
              <Briefcase className="w-6 h-6 sm:w-7 sm:h-7" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl sm:text-2xl font-black tracking-tight text-gray-900 leading-tight">
                ROJGAR <span className="text-blue-600">.</span>
              </span>
              <span className="text-[10px] sm:text-xs text-gray-500 font-medium tracking-wide">
                Job & Employment Platform
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex flex-1 justify-center items-center space-x-6 lg:space-x-8">
            <NavLink to="/" className={navLinkClass} end>
              Home
            </NavLink>
            <NavLink to="/jobs" className={navLinkClass}>
              All Jobs
            </NavLink>
            <NavLink to="/about" className={navLinkClass}>
              About
            </NavLink>
            <NavLink to="/contact" className={navLinkClass}>
              Contact
            </NavLink>
            {!isAuthenticated && (
              <>
                <NavLink to="/login" className={navLinkClass}>
                  Login
                </NavLink>
                <NavLink to="/register" className={navLinkClass}>
                  Register
                </NavLink>
                <NavLink to="/login?role=admin" className={navLinkClass}>
                  Admin
                </NavLink>
              </>
            )}
          </nav>

          {/* Desktop Right Auth / User Menu & Dark Mode Toggle */}
          <div className="hidden md:flex items-center space-x-3">
            {isAuthenticated && user && (
              <div className="flex items-center space-x-3">
                <Link
                  to={getDashboardPath()}
                  className="flex items-center space-x-2 px-4 py-2 text-sm font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors border border-blue-200"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Dashboard</span>
                  <span className="capitalize px-1.5 py-0.5 text-[10px] bg-blue-200 text-blue-800 rounded font-bold ml-1">
                    {user.role}
                  </span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1.5 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            )}
            <button
              onClick={toggleTheme}
              className="p-2.5 text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 bg-gray-100 dark:bg-slate-800 rounded-xl transition-all shadow-sm flex items-center justify-center border border-gray-200 dark:border-slate-700"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label="Toggle Dark Mode"
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5 text-amber-400" />
              ) : (
                <Moon className="w-5 h-5 text-slate-700" />
              )}
            </button>
          </div>

          {/* Mobile Controls & Hamburger Toggle */}
          <div className="flex md:hidden items-center space-x-2">
            <button
              onClick={toggleTheme}
              className="p-2 text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-slate-800 rounded-lg transition-colors border border-gray-200 dark:border-slate-700"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label="Toggle Dark Mode"
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5 text-amber-400" />
              ) : (
                <Moon className="w-5 h-5 text-slate-700" />
              )}
            </button>

            {isAuthenticated && (
              <Link
                to={getDashboardPath()}
                className="p-2 text-blue-600 bg-blue-50 rounded-lg"
                title="Dashboard"
              >
                <LayoutDashboard className="w-5 h-5" />
              </Link>
            )}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Toggle Navigation Menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white px-4 pt-3 pb-6 space-y-3 shadow-lg">
          <div className="space-y-1">
            <NavLink
              to="/"
              className={mobileNavLinkClass}
              onClick={() => setIsMobileMenuOpen(false)}
              end
            >
              Home
            </NavLink>
            <NavLink
              to="/jobs"
              className={mobileNavLinkClass}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              All Jobs
            </NavLink>
            <NavLink
              to="/about"
              className={mobileNavLinkClass}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              About
            </NavLink>
            <NavLink
              to="/contact"
              className={mobileNavLinkClass}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Contact
            </NavLink>
            {!isAuthenticated && (
              <>
                <NavLink
                  to="/login"
                  className={mobileNavLinkClass}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Login
                </NavLink>
                <NavLink
                  to="/register"
                  className={mobileNavLinkClass}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Register
                </NavLink>
                <NavLink
                  to="/login?role=admin"
                  className={mobileNavLinkClass}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Admin
                </NavLink>
              </>
            )}
          </div>

          <div className="pt-4 border-t border-gray-200">
            {isAuthenticated && user && (
              <div className="space-y-3">
                <div className="px-4 py-2 bg-gray-50 rounded-lg flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{user.name}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                  <span className="capitalize px-2 py-0.5 text-xs bg-blue-100 text-blue-700 font-bold rounded">
                    {user.role}
                  </span>
                </div>
                <Link
                  to={getDashboardPath()}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 text-sm font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors border border-blue-200"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Go to Dashboard</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 text-sm font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
