import React from 'react';
import { Link } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import CommonLayout from '../components/layout/CommonLayout';

const ProfilePage = () => {
  const { user, loading } = useUser();

  if (loading) {
    return (
      <CommonLayout>
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="max-w-md mx-auto bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <div className="animate-pulse space-y-3">
              <div className="h-6 bg-gray-200 rounded w-1/3" />
              <div className="h-4 bg-gray-200 rounded w-2/3" />
              <div className="h-4 bg-gray-200 rounded w-1/2" />
            </div>
          </div>
        </div>
      </CommonLayout>
    );
  }

  if (!user) {
    return (
      <CommonLayout>
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="max-w-md mx-auto bg-white border border-gray-200 rounded-lg p-6 shadow-sm text-center">
            <h1 className="text-2xl font-semibold text-gray-900 mb-2">You're not logged in</h1>
            <p className="text-sm text-gray-600 mb-4">Please log in to view your profile.</p>
            <div className="flex items-center justify-center gap-3">
              <Link to="/login" className="bg-primary hover:bg-primary-600 text-white px-4 py-2 rounded font-medium text-sm transition-colors">Log In</Link>
              <Link to="/signup" className="text-primary font-medium text-sm">Create account</Link>
            </div>
          </div>
        </div>
      </CommonLayout>
    );
  }

  return (
    <CommonLayout>
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="max-w-md mx-auto bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <h1 className="text-2xl font-semibold text-gray-900 mb-1">My Profile</h1>
          <p className="text-sm text-gray-600 mb-6">Manage your account details.</p>

          <div className="space-y-3">
            <div>
              <div className="text-xs text-gray-500">Name</div>
              <div className="text-sm text-gray-900 font-medium">{user.name || '-'}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Email</div>
              <div className="text-sm text-gray-900 font-medium">{user.email || '-'}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Phone</div>
              <div className="text-sm text-gray-900 font-medium">{user.phone || '-'}</div>
            </div>
          </div>
        </div>
      </div>
    </CommonLayout>
  );
};

export default ProfilePage;


