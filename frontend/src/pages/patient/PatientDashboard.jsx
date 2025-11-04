import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { patients } from '../../services/api';

const PatientDashboard = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [recommendations, setRecommendations] = useState({
    trials: [],
    experts: [],
    publications: [],
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load profile and recommendations from backend
    loadProfile();
    loadRecommendations();
    loadRecentActivity();
  }, [navigate]);

  const loadProfile = async () => {
    try {
      const response = await patients.getProfile();
      const profileData = response.data;

      // Check if profile is incomplete (no condition set)
      if (!profileData.condition && !profileData.location) {
        navigate('/patient/onboarding');
        return;
      }

      setProfile(profileData);
    } catch (error) {
      console.error('Error loading profile:', error);
      // If profile doesn't exist or error, redirect to onboarding
      navigate('/patient/onboarding');
    }
  };

  const loadRecommendations = async () => {
    try {
      const response = await patients.getRecommendations();
      setRecommendations(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error loading recommendations:', error);
      setRecommendations({
        trials: [],
        experts: [],
        publications: [],
      });
      setLoading(false);
    }
  };

  const loadRecentActivity = () => {
    // TODO: Connect to backend activity API when available
    // For now, showing empty activity
    setRecentActivity([]);
  };

  const quickActions = [
    {
      title: 'Search Clinical Trials',
      icon: <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>,
      color: 'from-[#1CB0F6] to-[#1899D6]',
      path: '/patient/trials'
    },
    {
      title: 'Find Health Experts',
      icon: <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>,
      color: 'from-[#58CC02] to-[#46A302]',
      path: '/patient/experts'
    },
    {
      title: 'Browse Publications',
      icon: <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>,
      color: 'from-[#1CB0F6] to-[#58CC02]',
      path: '/patient/publications'
    },
    {
      title: 'Join Forums',
      icon: <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" /></svg>,
      color: 'from-[#58CC02] to-[#1CB0F6]',
      path: '/patient/forums'
    },
  ];

  if (loading || !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
        <div className="flex items-center justify-center h-screen">
          <div className="text-center animate-fade-in">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#1CB0F6] mx-auto mb-4"></div>
            <p className="text-lg font-bold text-gray-700">Loading your dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border-2 border-gray-100 mb-8 animate-fade-in-up">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-4xl font-heading font-bold text-gray-900 mb-2">
                Welcome back, {profile.name}!
              </h1>
              <p className="text-gray-600 text-lg">
                Here are your personalized recommendations and updates
              </p>
              <div className="mt-4 flex flex-wrap gap-4 text-sm">
                {profile.condition && (
                  <div className="flex items-center bg-gradient-to-r from-[#1CB0F6]/10 to-[#1CB0F6]/5 text-[#1CB0F6] px-4 py-2 rounded-xl font-bold border-2 border-[#1CB0F6]/30">
                    <div className="w-5 h-5 bg-[#1CB0F6] rounded flex items-center justify-center mr-2">
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                    <span>Condition: {profile.condition}</span>
                  </div>
                )}
                {profile.location && (
                  <div className="flex items-center bg-gradient-to-r from-[#58CC02]/10 to-[#58CC02]/5 text-[#58CC02] px-4 py-2 rounded-xl font-bold border-2 border-[#58CC02]/30">
                    <div className="w-5 h-5 bg-[#58CC02] rounded flex items-center justify-center mr-2">
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <span>{profile.location}, {profile.country}</span>
                  </div>
                )}
              </div>
            </div>
            <div className="hidden md:block">
              <div className="w-24 h-24 bg-gradient-to-br from-[#1CB0F6] to-[#58CC02] rounded-2xl flex items-center justify-center text-white text-5xl font-bold shadow-lg">
                {profile.name.charAt(0).toUpperCase()}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {quickActions.map((action, index) => (
            <button
              key={index}
              onClick={() => navigate(action.path)}
              className={`bg-gradient-to-br ${action.color} text-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 active:scale-95 animate-fade-in-up`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="mb-3">{action.icon}</div>
              <h3 className="font-bold text-lg">{action.title}</h3>
            </button>
          ))}
        </div>

        {/* Recommendations Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Clinical Trials */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-gray-100 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-heading font-bold text-gray-900">Clinical Trials</h2>
              <div className="w-10 h-10 bg-[#1CB0F6] rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
            </div>
            <p className="text-gray-600 text-sm mb-4">Trials matching your profile</p>
            <div className="space-y-3">
              {recommendations.trials.length > 0 ? (
                recommendations.trials.map((trial) => (
                  <div key={trial.id} className="bg-gradient-to-r from-[#1CB0F6]/10 to-[#1CB0F6]/5 border-l-4 border-[#1CB0F6] rounded-xl pl-4 pr-3 py-3 hover:shadow-lg transition-all">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900 text-sm mb-1">{trial.title}</h3>
                        <p className="text-xs text-gray-600">{trial.location}</p>
                        <div className="flex items-center mt-2">
                          <span className="text-xs bg-[#1CB0F6] text-white px-2 py-1 rounded-lg font-bold shadow-lg">
                            {trial.status}
                          </span>
                        </div>
                      </div>
                      <div className="ml-2 text-right bg-white rounded-xl px-3 py-2 shadow-lg">
                        <span className="text-lg font-bold text-[#1CB0F6]">{trial.matchScore}%</span>
                        <p className="text-xs text-gray-500 font-bold">match</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p className="text-sm">No recommendations yet</p>
                  <p className="text-xs mt-1">Complete your profile to see personalized trials</p>
                </div>
              )}
            </div>
            <button
              onClick={() => navigate('/patient/trials')}
              className="w-full mt-4 py-3 px-4 bg-gradient-to-r from-[#1CB0F6] to-[#1899D6] hover:from-[#1899D6] hover:to-[#1CB0F6] text-white font-bold rounded-xl transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg text-sm"
            >
              View All Trials
            </button>
          </div>

          {/* Health Experts */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-gray-100 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-heading font-bold text-gray-900">Health Experts</h2>
              <div className="w-10 h-10 bg-[#58CC02] rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
            <p className="text-gray-600 text-sm mb-4">Top specialists for you</p>
            <div className="space-y-3">
              {recommendations.experts.length > 0 ? (
                recommendations.experts.map((expert) => (
                  <div key={expert.id} className="bg-gradient-to-r from-[#58CC02]/10 to-[#58CC02]/5 border-l-4 border-[#58CC02] rounded-xl pl-4 pr-3 py-3 hover:shadow-soft transition-all">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900 text-sm mb-1">{expert.name}</h3>
                        <p className="text-xs text-gray-600 font-medium">{expert.specialty}</p>
                        <div className="flex items-center mt-2">
                          <svg className="w-4 h-4 text-[#FFC800]" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                          </svg>
                          <span className="text-xs font-bold text-gray-700 ml-1">{expert.rating}</span>
                          <span className="text-xs text-gray-500 ml-1">({expert.reviewCount})</span>
                        </div>
                      </div>
                      <div className="ml-2 text-right bg-white rounded-xl px-3 py-2 shadow-duo">
                        <span className="text-lg font-extrabold text-[#58CC02]">{expert.matchScore}%</span>
                        <p className="text-xs text-gray-500 font-bold">match</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p className="text-sm font-medium">No recommendations yet</p>
                  <p className="text-xs mt-1">Complete your profile to see personalized experts</p>
                </div>
              )}
            </div>
            <button
              onClick={() => navigate('/patient/experts')}
              className="w-full mt-4 py-3 px-4 bg-gradient-to-r from-[#58CC02] to-[#46A302] hover:from-[#46A302] hover:to-[#58CC02] text-white font-bold rounded-xl transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg text-sm"
            >
              Find Experts
            </button>
          </div>

          {/* Publications */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-gray-100 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-heading font-bold text-gray-900">Publications</h2>
              <div className="w-10 h-10 bg-gradient-to-br from-[#1CB0F6] to-[#58CC02] rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
            </div>
            <p className="text-gray-600 text-sm font-medium mb-4">Recent research articles</p>
            <div className="space-y-3">
              {recommendations.publications.length > 0 ? (
                recommendations.publications.map((pub) => (
                  <div key={pub.id} className="bg-gradient-to-r from-[#1CB0F6]/10 via-white to-[#58CC02]/10 border-l-4 border-[#1CB0F6] rounded-xl pl-4 pr-3 py-3 hover:shadow-soft transition-all">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900 text-sm mb-1 line-clamp-2">{pub.title}</h3>
                        <p className="text-xs text-gray-600 font-medium">{pub.journal}, {pub.year}</p>
                        <p className="text-xs text-gray-500 mt-1 line-clamp-1">{pub.authors}</p>
                      </div>
                      <div className="ml-2 text-right bg-white rounded-xl px-3 py-2 shadow-duo">
                        <span className="text-lg font-extrabold text-[#1CB0F6]">{pub.relevanceScore}%</span>
                        <p className="text-xs text-gray-500 font-bold">relevant</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p className="text-sm font-medium">No recommendations yet</p>
                  <p className="text-xs mt-1">Complete your profile to see relevant publications</p>
                </div>
              )}
            </div>
            <button
              onClick={() => navigate('/patient/publications')}
              className="w-full mt-4 py-3 px-4 bg-gradient-to-r from-[#1CB0F6] to-[#58CC02] hover:from-[#1899D6] hover:to-[#46A302] text-white font-bold rounded-xl transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg text-sm"
            >
              Browse Publications
            </button>
          </div>
        </div>

        {/* Recent Activity */}
        {recentActivity.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-gray-100 animate-fade-in-up" style={{ animationDelay: '400ms' }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-heading font-bold text-gray-900">Recent Activity</h2>
              <div className="w-10 h-10 bg-gradient-to-br from-[#1CB0F6] to-[#58CC02] rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
            <div className="space-y-3">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center p-4 bg-gradient-to-r from-blue-50 to-green-50 hover:from-blue-100 hover:to-green-100 rounded-xl transition-all border-2 border-gray-200">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#1CB0F6] to-[#58CC02] rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-900 font-medium">
                      <span className="font-bold">{activity.action}</span> {activity.title}
                    </p>
                    <p className="text-sm text-gray-500 font-medium">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientDashboard;
