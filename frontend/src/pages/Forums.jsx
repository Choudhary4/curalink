import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import ForumPostCard from '../components/ForumPostCard';
import { forums as forumsApi } from '../services/api';

const Forums = () => {
  const location = useLocation();
  const [userType, setUserType] = useState('patient');
  const [profile, setProfile] = useState(null);
  const [communities, setCommunities] = useState([]);
  const [selectedCommunity, setSelectedCommunity] = useState(null);
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [showCreateCommunity, setShowCreateCommunity] = useState(false);
  const [newPost, setNewPost] = useState({
    title: '',
    content: '',
    category: '',
    tags: '',
  });
  const [newCommunity, setNewCommunity] = useState({
    name: '',
    description: '',
    category: '',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const type = localStorage.getItem('userType');
    setUserType(type);

    if (type === 'patient') {
      const patientProfile = JSON.parse(localStorage.getItem('patientProfile') || '{}');
      setProfile(patientProfile);
    } else if (type === 'researcher') {
      const researcherProfile = JSON.parse(localStorage.getItem('researcherProfile') || '{}');
      setProfile(researcherProfile);
    }

    loadCommunities();
    loadPosts();
    setLoading(false);
  }, []);

  useEffect(() => {
    if (selectedCommunity) {
      const filtered = posts.filter(post => post.forum_id === selectedCommunity);
      setFilteredPosts(filtered);
    } else {
      setFilteredPosts(posts);
    }
  }, [selectedCommunity, posts]);

  const loadCommunities = async () => {
    try {
      const response = await forumsApi.getAll();
      setCommunities(response.data);
    } catch (error) {
      console.error('Error loading communities:', error);
      setCommunities([]);
    }
  };

  const loadPosts = async () => {
    try {
      // Load all posts from all forums
      const response = await forumsApi.getAll();
      const allPosts = [];

      // Get posts for each forum
      for (const forum of response.data) {
        try {
          const postsResponse = await forumsApi.getPosts(forum.id);

          // Fetch each post individually to get replies
          for (const post of postsResponse.data) {
            try {
              const postWithReplies = await forumsApi.getPost(post.id);
              allPosts.push({ ...postWithReplies.data, forum_id: forum.id });
            } catch (error) {
              console.error(`Error loading post ${post.id}:`, error);
              // Add post without replies if fetch fails
              allPosts.push({ ...post, forum_id: forum.id, replies: [] });
            }
          }
        } catch (error) {
          console.error(`Error loading posts for forum ${forum.id}:`, error);
        }
      }

      setPosts(allPosts);
      setFilteredPosts(allPosts);
    } catch (error) {
      console.error('Error loading posts:', error);
      setPosts([]);
      setFilteredPosts([]);
    }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    try {
      // Find the forum ID for the selected category
      const selectedForum = communities.find(c => c.name === newPost.category);
      if (!selectedForum) {
        console.error('Please select a valid community');
        return;
      }

      await forumsApi.createPost(selectedForum.id, {
        title: newPost.title,
        content: newPost.content
      });

      // Reload posts after creating
      await loadPosts();
      setNewPost({ title: '', content: '', category: '', tags: '' });
      setShowCreatePost(false);
    } catch (error) {
      console.error('Error creating post:', error);
    }
  };

  const handleCreateCommunity = async (e) => {
    e.preventDefault();
    try {
      await forumsApi.create({
        name: newCommunity.name,
        description: newCommunity.description,
        category: newCommunity.category
      });

      // Reload communities after creating
      await loadCommunities();
      setNewCommunity({ name: '', description: '', category: '' });
      setShowCreateCommunity(false);
    } catch (error) {
      console.error('Error creating community:', error);
    }
  };

  const handleReply = async (postId, replyContent) => {
    try {
      await forumsApi.createReply(postId, {
        content: replyContent
      });

      // Reload posts after replying
      await loadPosts();
    } catch (error) {
      console.error('Error creating reply:', error);
    }
  };

  const canReply = (post) => {
    // Researchers can reply to all posts
    if (userType === 'researcher') return true;
    // Patients cannot reply to other patient posts, only to researcher posts
    if (userType === 'patient' && post.authorType === 'researcher') return true;
    return false;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Community Forums</h1>
          <p className="text-gray-600 text-lg">
            Connect, share experiences, and learn from the community
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Communities Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-4 border-2 border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900">Communities</h3>
                {userType === 'researcher' && (
                  <button
                    onClick={() => setShowCreateCommunity(true)}
                    className="text-[#1CB0F6] hover:text-[#1899D6] font-bold text-sm transition-colors"
                  >
                    + New
                  </button>
                )}
              </div>

              <button
                onClick={() => setSelectedCommunity(null)}
                className={`w-full text-left px-4 py-3 rounded-xl mb-2 transition-all duration-200 ${
                  !selectedCommunity
                    ? 'bg-gradient-to-r from-[#1CB0F6] to-[#58CC02] text-white font-bold shadow-lg'
                    : 'hover:bg-gray-100 font-medium'
                }`}
              >
                All Communities
              </button>

              <div className="space-y-2">
                {communities.map((community) => (
                  <button
                    key={community.id}
                    onClick={() => setSelectedCommunity(community.name)}
                    className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-200 ${
                      selectedCommunity === community.name
                        ? 'bg-gradient-to-r from-[#1CB0F6] to-[#58CC02] text-white font-bold shadow-lg'
                        : 'hover:bg-gray-100 font-medium'
                    }`}
                  >
                    <div className="font-bold text-sm">{community.name}</div>
                    <div className={`text-xs mt-1 ${selectedCommunity === community.name ? 'text-white/90' : 'text-gray-500'}`}>
                      {community.members} members • {community.posts} posts
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Posts Section */}
          <div className="lg:col-span-3">
            {/* Create Post Button */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border-2 border-gray-100">
              <button
                onClick={() => setShowCreatePost(true)}
                className="w-full bg-gradient-to-r from-[#1CB0F6] to-[#1899D6] hover:from-[#1899D6] hover:to-[#1CB0F6] text-white font-bold py-3 px-6 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg"
              >
                Create New Post
              </button>
            </div>

            {/* Posts List */}
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#1CB0F6] mx-auto"></div>
                  <p className="mt-4 text-gray-600 font-semibold">Loading posts...</p>
                </div>
              </div>
            ) : filteredPosts.length === 0 ? (
              <div className="bg-white rounded-xl shadow-lg p-12 text-center border-2 border-gray-100">
                <div className="w-20 h-20 bg-gradient-to-r from-[#1CB0F6]/20 to-[#58CC02]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">No posts yet</h3>
                <p className="text-gray-600">Be the first to start a discussion!</p>
              </div>
            ) : (
              <div className="space-y-6">
                {filteredPosts.map((post) => (
                  <ForumPostCard
                    key={post.id}
                    post={post}
                    onReply={handleReply}
                    userType={userType}
                    canReply={canReply(post)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create Post Modal */}
      {showCreatePost && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">Create New Post</h2>
              <p className="text-gray-600 mt-1">Share your thoughts with the community</p>
            </div>

            <form onSubmit={handleCreatePost} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={newPost.title}
                    onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                    placeholder="Enter post title..."
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1CB0F6] focus:border-[#1CB0F6]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                    required
                    value={newPost.category}
                    onChange={(e) => setNewPost({ ...newPost, category: e.target.value })}
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1CB0F6] focus:border-[#1CB0F6]"
                  >
                    <option value="">Select a category</option>
                    {communities.map((community) => (
                      <option key={community.id} value={community.name}>
                        {community.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Content *
                  </label>
                  <textarea
                    required
                    value={newPost.content}
                    onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                    placeholder="Share your thoughts, questions, or experiences..."
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1CB0F6] focus:border-[#1CB0F6]"
                    rows="6"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Tags (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={newPost.tags}
                    onChange={(e) => setNewPost({ ...newPost, tags: e.target.value })}
                    placeholder="e.g., immunotherapy, clinical-trials, research"
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1CB0F6] focus:border-[#1CB0F6]"
                  />
                </div>
              </div>

              <div className="flex gap-4 mt-6">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-[#1CB0F6] to-[#1899D6] hover:scale-105 active:scale-95 text-white font-bold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg"
                >
                  Post
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreatePost(false)}
                  className="flex-1 bg-white border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 text-gray-700 font-bold py-3 px-6 rounded-xl transition-all duration-200"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Community Modal */}
      {showCreateCommunity && userType === 'researcher' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">Create New Community</h2>
              <p className="text-gray-600 mt-1">Start a new discussion community</p>
            </div>

            <form onSubmit={handleCreateCommunity} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Community Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={newCommunity.name}
                    onChange={(e) => setNewCommunity({ ...newCommunity, name: e.target.value })}
                    placeholder="Enter community name..."
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1CB0F6] focus:border-[#1CB0F6]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    required
                    value={newCommunity.description}
                    onChange={(e) =>
                      setNewCommunity({ ...newCommunity, description: e.target.value })
                    }
                    placeholder="Describe what this community is about..."
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1CB0F6] focus:border-[#1CB0F6]"
                    rows="4"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Category *
                  </label>
                  <input
                    type="text"
                    required
                    value={newCommunity.category}
                    onChange={(e) => setNewCommunity({ ...newCommunity, category: e.target.value })}
                    placeholder="e.g., Research, Treatment, Support"
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1CB0F6] focus:border-[#1CB0F6]"
                  />
                </div>
              </div>

              <div className="flex gap-4 mt-6">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-[#58CC02] to-[#46A302] hover:from-[#46A302] hover:to-[#58CC02] text-white font-bold py-3 px-6 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg"
                >
                  Create Community
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateCommunity(false)}
                  className="flex-1 bg-white border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 text-gray-700 font-bold py-3 px-6 rounded-xl transition-all duration-200"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Forums;
