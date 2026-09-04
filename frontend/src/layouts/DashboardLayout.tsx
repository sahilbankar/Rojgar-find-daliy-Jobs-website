import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';

export const DashboardLayout: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 text-gray-900">
      <Navbar />
      <div className="flex-grow w-full">
        {/* The individual dashboards will handle their own responsive layouts (Sidebar + Content) */}
        <Outlet />
      </div>
      <Footer />
    </div>
  );
};
