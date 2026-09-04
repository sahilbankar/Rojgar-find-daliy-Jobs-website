import React from 'react';
import { ShieldCheck, Target, Award } from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl sm:text-5xl font-black text-gray-900">
          About ROJGAR
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto text-base">
          ROJGAR is a modern, transparent platform connecting skilled and unskilled workers, contractors, and employers across India.
        </p>
      </div>

      {/* Values Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="p-6 bg-white rounded-2xl border border-gray-200 shadow-sm space-y-3">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-gray-900">Zero Mock Policy</h3>
          <p className="text-sm text-gray-600">
            All job postings and application statistics are strictly driven by real database operations. No fake data.
          </p>
        </div>

        <div className="p-6 bg-white rounded-2xl border border-gray-200 shadow-sm space-y-3">
          <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center">
            <Target className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-gray-900">Dynamic Vacancies</h3>
          <p className="text-sm text-gray-600">
            Remaining vacancies update automatically upon candidate selection, closing listings once filled.
          </p>
        </div>

        <div className="p-6 bg-white rounded-2xl border border-gray-200 shadow-sm space-y-3">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
            <Award className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-gray-900">Secure & Transparent</h3>
          <p className="text-sm text-gray-600">
            Role-based authentication ensures a secure experience for both job seekers and employers.
          </p>
        </div>
      </div>

    </div>
  );
};
