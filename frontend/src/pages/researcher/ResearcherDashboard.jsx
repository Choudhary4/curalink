import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { forums as forumsApi, meetings as meetingsApi, researchers } from '../../services/api';

const ResearcherDashboard = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState({
    publications: 0,
    collaborators: 0,
    trialsManaged: 0,
    citations: 0,
  });
  const [recentPosts, setRecentPosts] = useState([]);
  const [meetingRequests, setMeetingRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load profile and data from backend
    loadProfile();
    loadStats();
    loadRecentPosts();
    loadMeetingRequests();
  }, [navigate]);

  const loadProfile = async () => {
    try {
      const response = await researchers.getProfile();
      const profileData = response.data;

      // Check if profile is incomplete
      if (!profileData.specialties && !profileData.institution) {
        navigate('/researcher/onboarding');
        return;
      }

      setProfile(profileData);
    } catch (error) {
      console.error('Error loading profile:', error);
      // If profile doesn't exist or error, redirect to onboarding
      navigate('/researcher/onboarding');
    }
  };

  const loadStats = () => {
    // TODO: Connect to backend stats API when available
    // For now, showing zeros until backend provides data
    setStats({
      publications: 0,
      collaborators: 0,
      trialsManaged: 0,
      citations: 0,
    });
  };

  const loadRecentPosts = async () => {
    try {
      const response = await forumsApi.getAll();
      const allPosts = [];

      // Get posts for each forum (limit to first 4 for dashboard)
      for (const forum of response.data.slice(0, 4)) {
        try {
          const postsResponse = await forumsApi.getPosts(forum.id);
          allPosts.push(...postsResponse.data.map(post => ({
            ...post,
            forum_id: forum.id,
            category: forum.name,
            needsResponse: true // Can be determined by logic
          })));
        } catch (error) {
          console.error(`Error loading posts for forum ${forum.id}:`, error);
        }
      }

      setRecentPosts(allPosts.slice(0, 4));
      setLoading(false);
    } catch (error) {
      console.error('Error loading recent posts:', error);
      setRecentPosts([]);
      setLoading(false);
    }
  };

  const loadMeetingRequests = async () => {
    try {
      const response = await meetingsApi.getRequests();
      setMeetingRequests(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error loading meeting requests:', error);
      setMeetingRequests([]);
      setLoading(false);
    }
  };

  const handleMeetingRequest = async (requestId, action) => {
    try {
      await meetingsApi.updateStatus(requestId, action);
      setMeetingRequests(prev =>
        prev.map(req =>
          req.id === requestId ? { ...req, status: action } : req
        )
      );
    } catch (error) {
      console.error('Error updating meeting request:', error);
    }
  };

  const quickActions = [
    { title: 'Find Collaborators', color: 'from-blue-400 to-blue-600', path: '/researcher/collaborators' },
    { title: 'Manage Trials', color: 'from-green-400 to-green-600', path: '/patient/trials' },
    { title: 'Browse Forums', color: 'from-purple-400 to-purple-600', path: '/researcher/forums' },
    { title: 'View Publications', color: 'from-pink-400 to-pink-600', path: '/patient/publications' },
  ];

  if (loading || !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-white">
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg mx-auto mb-4 animate-pulse">
              <svg className="w-10 h-10 text-white animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
            </div>
            <p className="text-lg font-bold text-gray-700">Loading your dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="bg-white rounded-2xl shadow-md border-2 border-gray-100 p-6 mb-8">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-4xl font-heading font-extrabold text-gray-800 mb-2">
                Welcome back, {profile.name}!
              </h1>
              <p className="text-gray-600 text-lg font-medium">
                Here's your research dashboard overview
              </p>
              <div className="mt-4 flex flex-wrap gap-4 text-sm">
                <div className="flex items-center bg-blue-100 text-blue-700 px-4 py-2 rounded-xl font-bold border-2 border-blue-200">
                  <span>Specialty: {profile.researchArea}</span>
                </div>
                <div className="flex items-center bg-green-100 text-green-700 px-4 py-2 rounded-xl font-bold border-2 border-green-200">
                  <span>Institution: {profile.institution}</span>
                </div>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center text-white text-5xl font-bold shadow-lg">
                {profile.name.charAt(0).toUpperCase()}
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-md border-2 border-gray-100 p-6 hover:shadow-xl transition-all hover:scale-105">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-bold text-gray-800">Publications</h3>
            </div>
            <p className="text-5xl font-extrabold mb-1 text-blue-600">{stats.publications}</p>
            <p className="text-gray-600 text-sm font-medium">Total published</p>
          </div>

          <div className="bg-white rounded-2xl shadow-md border-2 border-gray-100 p-6 hover:shadow-xl transition-all hover:scale-105">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-bold text-gray-800">Collaborators</h3>
            </div>
            <p className="text-5xl font-extrabold mb-1 text-green-600">{stats.collaborators}</p>
            <p className="text-gray-600 text-sm font-medium">Active connections</p>
          </div>

          <div className="bg-white rounded-2xl shadow-md border-2 border-gray-100 p-6 hover:shadow-xl transition-all hover:scale-105">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-bold text-gray-800">Trials Managed</h3>
            </div>
            <p className="text-5xl font-extrabold mb-1 text-purple-600">{stats.trialsManaged}</p>
            <p className="text-gray-600 text-sm font-medium">Currently active</p>
          </div>

          <div className="bg-white rounded-2xl shadow-md border-2 border-gray-100 p-6 hover:shadow-xl transition-all hover:scale-105">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-bold text-gray-800">Citations</h3>
            </div>
            <p className="text-5xl font-extrabold mb-1 text-yellow-600">{stats.citations}</p>
            <p className="text-gray-600 text-sm font-medium">Total citations</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {quickActions.map((action, index) => (
            <button
              key={index}
              onClick={() => navigate(action.path)}
              className={`bg-gradient-to-br ${action.color} text-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-all duration-300 transform hover:scale-105 active:scale-95`}
            >
              <h3 className="font-bold text-lg">{action.title}</h3>
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Forum Posts */}
          <div className="bg-white rounded-2xl shadow-md border-2 border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-heading font-bold text-gray-800">Recent Forum Posts</h2>
            </div>
            <p className="text-gray-600 text-sm font-medium mb-4">Posts where you can provide insights</p>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {recentPosts.length > 0 ? (
                recentPosts.map((post) => (
                  <div key={post.id} className={`border-l-4 ${post.needsResponse ? 'border-yellow-400' : 'border-gray-300'} pl-4 pr-3 py-3 ${post.needsResponse ? 'bg-yellow-50' : 'bg-gray-50'} hover:shadow-md rounded-xl transition-all`}>
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-bold text-gray-900 text-sm flex-1">{post.title}</h3>
                      {post.needsResponse && (
                        <span className="ml-2 px-3 py-1 bg-yellow-400 text-gray-900 text-xs font-bold rounded-full shadow-sm">
                          Needs Response
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-600 font-medium mb-2">
                      <span>Posted by {post.author}</span>
                      <span>•</span>
                      <span>{post.timestamp}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="px-3 py-1 bg-purple-100 text-purple-700 text-xs font-bold rounded-full border border-purple-200">
                        {post.category}
                      </span>
                      <span className="text-xs text-gray-500 font-bold">{post.replies} replies</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p className="text-sm font-medium">No recent posts</p>
                  <p className="text-xs mt-1">Check back later for community discussions</p>
                </div>
              )}
            </div>
            <button
              onClick={() => navigate('/researcher/forums')}
              className="w-full mt-4 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-2 px-4 rounded-xl transition-all hover:scale-105"
            >
              View All Forums
            </button>
          </div>

          {/* Meeting Requests */}
          <div className="bg-white rounded-2xl shadow-md border-2 border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-heading font-bold text-gray-800">Meeting Requests</h2>
            </div>
            <p className="text-gray-600 text-sm font-medium mb-4">Pending consultation requests</p>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {meetingRequests.length > 0 ? (
                meetingRequests.map((request) => (
                  <div key={request.id} className="bg-gray-50 border-2 border-gray-200 rounded-2xl p-4 hover:shadow-md transition-all">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center text-white font-bold shadow-lg">
                          {request.from.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900">{request.from}</h3>
                          <span className={`px-3 py-1 ${request.type === 'patient' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-blue-100 text-blue-700 border-blue-200'} text-xs font-bold rounded-full border shadow-sm`}>
                            {request.type}
                          </span>
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-gray-700 font-medium mb-2">{request.subject}</p>
                    <p className="text-xs text-gray-500 font-medium mb-3">{request.timestamp}</p>
                    {request.status === 'pending' ? (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleMeetingRequest(request.id, 'accepted')}
                          className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white text-sm font-bold py-2.5 px-3 rounded-xl transition-all transform hover:scale-105 active:scale-95 shadow-md"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => handleMeetingRequest(request.id, 'declined')}
                          className="flex-1 bg-red-500 hover:bg-red-600 text-white text-sm font-bold py-2.5 px-3 rounded-xl transition-all transform hover:scale-105 active:scale-95 shadow-md"
                        >
                          Decline
                        </button>
                      </div>
                    ) : (
                      <div className={`text-center py-3 rounded-xl font-bold shadow-sm ${request.status === 'accepted' ? 'bg-green-100 text-green-700 border-2 border-green-200' : 'bg-red-100 text-red-700 border-2 border-red-200'}`}>
                        <span className="text-sm capitalize">{request.status}</span>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p className="text-sm font-medium">No pending meeting requests</p>
                  <p className="text-xs mt-1">New requests will appear here</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResearcherDashboard;
