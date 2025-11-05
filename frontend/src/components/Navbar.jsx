import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { profile as profileApi } from '../services/api';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [userType, setUserType] = useState(null);
  const [profile, setProfile] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      const type = localStorage.getItem('userType');
      setUserType(type);

      if (type) {
        try {
          const response = await profileApi.get();
          setProfile({
            name: response.data.name,
            profilePicture: response.data.profile_picture
          });
        } catch (error) {
          console.error('Error loading profile:', error);
        }
      }
    };

    loadProfile();
  }, [location]);

  const handleLogout = () => {
    localStorage.removeItem('userType');
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    navigate('/');
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const patientLinks = [
    { path: '/patient/dashboard', label: 'Dashboard' },
    { path: '/patient/experts', label: 'Experts' },
    { path: '/patient/trials', label: 'Trials' },
    { path: '/patient/publications', label: 'Publications' },
    { path: '/patient/forums', label: 'Forums' },
  ];

  const researcherLinks = [
    { path: '/researcher/dashboard', label: 'Dashboard' },
    { path: '/researcher/collaborators', label: 'Collaborators' },
    { path: '/researcher/requests', label: 'Requests' },
    { path: '/patient/trials', label: 'Trials' },
    { path: '/patient/publications', label: 'Publications' },
    { path: '/researcher/forums', label: 'Forums' },
  ];

  const getSecondaryLinks = () => {
    const links = [
      { path: userType === 'patient' ? '/patient/favorites' : '/researcher/favorites', label: 'Favorites' },
      { path: '/profile', label: 'Profile' },
    ];

    // Add Meetings for all users
    links.unshift({ path: '/meetings', label: 'Meetings' });

    // Add Messages only for researchers
    if (userType === 'researcher') {
      links.unshift({ path: '/messages', label: 'Messages' });
    }

    return links;
  };

  const primaryLinks = userType === 'patient' ? patientLinks : researcherLinks;
  const secondaryLinks = getSecondaryLinks();
  const accentColor = userType === 'patient' ? 'primary' : 'accent';

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to={userType ? `/${userType}/dashboard` : '/'} className="flex items-center space-x-2 flex-shrink-0">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
              userType === 'patient'
                ? 'bg-primary-500'
                : userType === 'researcher'
                ? 'bg-accent-500'
                : 'bg-gradient-to-br from-primary-500 to-accent-500'
            }`}>
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <span className="text-xl font-heading font-bold text-gray-900">CuraLink</span>
          </Link>

          {/* Desktop Primary Navigation */}
          {userType && (
            <>
              <div className="hidden lg:flex items-center space-x-1 flex-1 justify-center max-w-2xl mx-8">
                {primaryLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                      isActive(link.path)
                        ? `text-${accentColor}-600 bg-${accentColor}-50`
                        : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>

              {/* Desktop Right Menu */}
              <div className="hidden lg:flex items-center space-x-3">
                {secondaryLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`p-2 rounded-lg transition-colors ${
                      isActive(link.path)
                        ? `text-${accentColor}-600 bg-${accentColor}-50`
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                    }`}
                    title={link.label}
                  >
                    {link.label === 'Messages' && (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                    )}
                    {link.label === 'Meetings' && (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    )}
                    {link.label === 'Favorites' && (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                      </svg>
                    )}
                    {link.label === 'Profile' && (
                      <>
                        {profile?.profilePicture ? (
                          <img
                            src={profile.profilePicture}
                            alt={profile.name}
                            className="w-8 h-8 rounded-lg object-cover"
                          />
                        ) : (
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white ${
                            userType === 'patient' ? 'bg-primary-500' : 'bg-accent-500'
                          }`}>
                            {profile?.name?.charAt(0).toUpperCase() || 'U'}
                          </div>
                        )}
                      </>
                    )}
                  </Link>
                ))}
                <button
                  onClick={handleLogout}
                  className="ml-2 px-4 py-2 text-sm font-semibold text-gray-700 hover:text-gray-900 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Logout
                </button>
              </div>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {mobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Mobile Menu */}
      {userType && mobileMenuOpen && (
        <div className="lg:hidden border-t border-gray-200 bg-white">
          <div className="px-4 py-4 space-y-1">
            {/* User Info */}
            {profile && (
              <div className="flex items-center space-x-3 px-3 py-3 mb-3 bg-gray-50 rounded-lg">
                {profile.profilePicture ? (
                  <img
                    src={profile.profilePicture}
                    alt={profile.name}
                    className="w-10 h-10 rounded-lg object-cover"
                  />
                ) : (
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold text-white ${
                    userType === 'patient' ? 'bg-primary-500' : 'bg-accent-500'
                  }`}>
                    {profile.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                )}
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900">{profile.name}</p>
                  <p className={`text-xs capitalize ${
                    userType === 'patient' ? 'text-primary-600' : 'text-accent-600'
                  }`}>
                    {userType}
                  </p>
                </div>
              </div>
            )}

            {/* Mobile Navigation Links */}
            {[...primaryLinks, ...secondaryLinks].map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                  isActive(link.path)
                    ? `text-${accentColor}-600 bg-${accentColor}-50`
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                {link.label}
              </Link>
            ))}

            {/* Mobile Logout */}
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                handleLogout();
              }}
              className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
