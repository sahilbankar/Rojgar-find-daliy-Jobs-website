import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Building,
  MapPin,
  Mail,
  Phone,
  Globe,
  Loader2,
  ArrowLeft,
  User as UserIcon,
  Info
} from 'lucide-react';
import { employersAPI } from '../services/employers.service';

export const CompanyProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) {
      setLoading(true);
      employersAPI.getEmployerById(id)
        .then(res => {
          const profileData = res?.data?.data || res?.data || res;
          setProfile(profileData);
          setLoading(false);
        })
        .catch(err => {
          setError(err?.response?.data?.message || 'Failed to load company profile.');
          setLoading(false);
        });
    }
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
          <Info className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-red-800 mb-2">Profile Not Found</h2>
          <p className="text-red-600 mb-6">{error || 'This company profile could not be found or has been removed.'}</p>
          <button 
            onClick={() => navigate(-1)}
            className="px-6 py-2.5 bg-white text-red-700 font-bold text-sm rounded-xl border border-red-200 hover:bg-red-50 transition-colors inline-flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const logoSrc = profile.logoUrl 
    ? (profile.logoUrl.startsWith('http') ? profile.logoUrl : `http://localhost:5000${profile.logoUrl}`)
    : null;

  return (
    <div className="bg-gray-50/50 min-h-screen py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Back button */}
        <button 
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center space-x-2 text-gray-500 hover:text-blue-600 font-medium text-sm transition-colors w-fit group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Back</span>
        </button>

        <div className="max-w-4xl mx-auto space-y-6">
          
          {/* Header Card */}
          <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="h-32 sm:h-40 bg-gradient-to-r from-blue-600 to-indigo-700"></div>
            
            <div className="px-6 sm:px-10 pb-8">
              <div className="relative flex flex-col sm:flex-row items-center sm:items-end gap-6 -mt-12 sm:-mt-16 mb-6">
                <div className="w-24 h-24 sm:w-32 sm:h-32 bg-white rounded-2xl shadow-lg border-4 border-white flex items-center justify-center shrink-0 overflow-hidden">
                  {logoSrc ? (
                    <img src={logoSrc} alt={profile.companyName} className="w-full h-full object-cover" />
                  ) : (
                    <Building className="w-12 h-12 text-gray-300" />
                  )}
                </div>
                
                <div className="text-center sm:text-left flex-1 pb-2">
                  <h1 className="text-3xl font-black text-gray-900 leading-tight">
                    {profile.companyName || 'Company Name'}
                  </h1>
                  {profile.location && (
                    <p className="text-gray-500 font-medium flex items-center justify-center sm:justify-start gap-1.5 mt-1.5">
                      <MapPin className="w-4 h-4" />
                      {profile.location}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mt-4">
                {profile.website && (
                  <a 
                    href={profile.website.startsWith('http') ? profile.website : `https://${profile.website}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-xl font-bold text-sm transition-colors"
                  >
                    <Globe className="w-4 h-4" />
                    Visit Website
                  </a>
                )}
                {profile.userId?.name && (
                  <span className="inline-flex items-center gap-2 px-4 py-2 bg-gray-50 text-gray-700 rounded-xl font-semibold text-sm border border-gray-100">
                    <UserIcon className="w-4 h-4 text-gray-400" />
                    Employer: {profile.userId.name}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* About Company */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6 sm:p-8">
                <h2 className="text-lg font-black text-gray-900 mb-4 flex items-center gap-2">
                  About the Company
                </h2>
                
                {(profile.companyDescription || profile.description || profile.about) ? (
                  <div className="prose prose-blue max-w-none text-gray-600">
                    <p className="whitespace-pre-wrap leading-relaxed">{profile.companyDescription || profile.description || profile.about}</p>
                  </div>
                ) : (
                  <div className="text-center py-8 bg-gray-50 rounded-2xl border border-gray-100 border-dashed">
                    <p className="text-gray-500">No company description provided.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Contact Details */}
            <div className="space-y-6">
              <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6 sm:p-8">
                <h2 className="text-lg font-black text-gray-900 mb-6 flex items-center gap-2">
                  <UserIcon className="w-5 h-5 text-indigo-500" />
                  Contact Information
                </h2>
                
                <div className="space-y-5">
                  {profile.website && (
                    <div className="flex items-start gap-3">
                      <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl shrink-0">
                        <Globe className="w-5 h-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Company Website</p>
                        <a 
                          href={profile.website.startsWith('http') ? profile.website : `https://${profile.website}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-sm font-semibold text-gray-900 hover:text-blue-600 mt-0.5 block truncate"
                        >
                          {profile.website}
                        </a>
                      </div>
                    </div>
                  )}

                  {profile.userId?.email && (
                    <div className="flex items-start gap-3">
                      <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl shrink-0">
                        <Mail className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Email Address</p>
                        <a href={`mailto:${profile.userId.email}`} className="text-sm font-semibold text-gray-900 hover:text-blue-600 mt-0.5 break-all">
                          {profile.userId.email}
                        </a>
                      </div>
                    </div>
                  )}

                  {profile.phone && (
                    <div className="flex items-start gap-3">
                      <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl shrink-0">
                        <Phone className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Phone Number</p>
                        <a href={`tel:${profile.phone}`} className="text-sm font-semibold text-gray-900 hover:text-emerald-600 mt-0.5">
                          {profile.phone}
                        </a>
                      </div>
                    </div>
                  )}

                  {profile.address && (
                    <div className="flex items-start gap-3">
                      <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl shrink-0">
                        <MapPin className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Company Address</p>
                        <p className="text-sm font-medium text-gray-900 mt-0.5 leading-relaxed">
                          {profile.address}
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {!profile.userId?.email && !profile.phone && !profile.address && (
                    <p className="text-sm text-gray-500 italic">No contact information provided.</p>
                  )}
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};
