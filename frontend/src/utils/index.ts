// Utility helper functions

export const formatDate = (date: string | Date | undefined) => {
  if (!date) return 'N/A';
  return new Date(date).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export const getAvatarUrl = (avatarUrl?: string | null): string => {
  if (!avatarUrl) return '';
  if (avatarUrl.startsWith('http')) return avatarUrl;
  
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  // Remove /api from base url for images if needed, assuming backend serves images at root
  const baseUrl = API_BASE_URL.replace(/\/api$/, '');
  return `${baseUrl}${avatarUrl.startsWith('/') ? '' : '/'}${avatarUrl}`;
};

export const formatSalary = (min?: number, max?: number, fallback?: string): string => {
  if (min && max) {
    return `₹${min.toLocaleString()} - ₹${max.toLocaleString()}`;
  }
  if (min) return `From ₹${min.toLocaleString()}`;
  if (max) return `Up to ₹${max.toLocaleString()}`;
  return fallback || 'Not Specified';
};
