import React from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, Mail, Phone, MapPin, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-gray-300 pt-12 pb-8 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Grid Container */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          
          {/* Brand Info */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="bg-blue-600 p-2 rounded-xl text-white group-hover:bg-blue-500 transition-colors">
                <Briefcase className="w-6 h-6" />
              </div>
              <span className="text-2xl font-black text-white tracking-tight">
                ROJGAR <span className="text-blue-500">.</span>
              </span>
            </Link>
            <p className="text-sm text-gray-400 leading-relaxed">
              ROJGAR is a trusted employment platform connecting skilled workers, professionals, and contractors.
            </p>
            <div className="text-xs text-gray-500">
              <p>100% Verified Job Postings & Candidates</p>
            </div>
          </div>

          {/* Popular Categories */}
          <div>
            <h3 className="text-white text-base font-bold mb-4 border-l-4 border-blue-500 pl-2">
              Popular Job Categories
            </h3>
            <ul className="space-y-2.5 text-sm text-gray-400">
              <li><Link to="/jobs?category=trades" className="hover:text-blue-400 transition-colors">Electrician & Plumber</Link></li>
              <li><Link to="/jobs?category=logistics" className="hover:text-blue-400 transition-colors">Driver & Delivery</Link></li>
              <li><Link to="/jobs?category=office" className="hover:text-blue-400 transition-colors">Office Assistant & Accountant</Link></li>
              <li><Link to="/jobs?category=tech" className="hover:text-blue-400 transition-colors">Software & IT</Link></li>
              <li><Link to="/jobs?category=healthcare" className="hover:text-blue-400 transition-colors">Nurse & Healthcare</Link></li>
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white text-base font-bold mb-4 border-l-4 border-blue-500 pl-2">
              Quick Links
            </h3>
            <ul className="space-y-2.5 text-sm text-gray-400">
              <li><Link to="/jobs" className="hover:text-blue-400 transition-colors">Find Jobs</Link></li>
              <li><Link to="/register?role=employer" className="hover:text-blue-400 transition-colors">Post a Job</Link></li>
              <li><Link to="/about" className="hover:text-blue-400 transition-colors">About Us</Link></li>
              <li><Link to="/contact" className="hover:text-blue-400 transition-colors">Contact Us</Link></li>
              <li><Link to="/login" className="hover:text-blue-400 transition-colors">Login / Register</Link></li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h3 className="text-white text-base font-bold mb-4 border-l-4 border-blue-500 pl-2">
              Contact Information
            </h3>
            <ul className="space-y-3 text-sm text-gray-400">
              <li className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                <span>Mumbai, Maharashtra, India - 400001</span>
              </li>
              <li className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-blue-500 shrink-0" />
                <span>+91 98765 43210</span>
              </li>
              <li className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-blue-500 shrink-0" />
                <span>support@rojgar.com</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500 space-y-4 sm:space-y-0">
          <p>© {new Date().getFullYear()} ROJGAR Platform. All rights reserved.</p>
          <div className="flex items-center space-x-1">
            <span>Made with</span>
            <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" />
            <span>for job seekers and employers in India.</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
