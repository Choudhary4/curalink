import { useState } from 'react';
import { ai as aiApi } from '../services/api';

const ForumPostCard = ({ post, onReply, userType, canReply = true }) => {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [showAllReplies, setShowAllReplies] = useState(false);
  const [isLoadingAI, setIsLoadingAI] = useState(false);

  const handleSubmitReply = () => {
    if (replyText.trim()) {
      onReply(post.id, replyText);
      setReplyText('');
      setShowReplyForm(false);
    }
  };

  const handleAISuggest = async () => {
    setIsLoadingAI(true);
    try {
      const response = await aiApi.generateForumResponse({
        postTitle: post.title,
        postContent: post.content,
        postAuthor: post.author_name || post.author || ''
      });

      setReplyText(response.data.response);
    } catch (error) {
      console.error('Error generating AI response:', error);
      alert('Failed to generate AI suggestion. Please try again.');
    } finally {
      setIsLoadingAI(false);
    }
  };

  const getAuthorBadge = (authorType) => {
    if (authorType === 'researcher') {
      return (
        <span className="px-3 py-1 bg-gradient-to-r from-[#58CC02]/20 to-[#58CC02]/10 text-[#58CC02] text-xs font-bold rounded-full border-2 border-[#58CC02]/30">
          Researcher
        </span>
      );
    } else if (authorType === 'patient') {
      return (
        <span className="px-3 py-1 bg-gradient-to-r from-[#1CB0F6]/20 to-[#1CB0F6]/10 text-[#1CB0F6] text-xs font-bold rounded-full border-2 border-[#1CB0F6]/30">
          Patient
        </span>
      );
    }
    return null;
  };

  const displayedReplies = showAllReplies ? post.replies : post.replies?.slice(0, 2) || [];

  // Handle author field from backend (author_name or author)
  const authorName = post.author_name || post.author || 'Anonymous';
  const authorType = post.user_type || post.authorType || 'patient';
  const timestamp = post.timestamp || new Date(post.created_at).toLocaleString();

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-gray-100 hover:shadow-xl transition-all duration-200 animate-fade-in-up group">
      {/* Post Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3 flex-1">
          <div className={`w-12 h-12 bg-gradient-to-br ${
            authorType === 'researcher'
              ? 'from-[#58CC02] to-[#46A302]'
              : 'from-[#1CB0F6] to-[#1899D6]'
          } rounded-xl flex items-center justify-center text-white font-bold shadow-lg group-hover:scale-110 transition-transform duration-300 flex-shrink-0`}>
            {authorName.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-bold text-gray-900">{authorName}</p>
              {getAuthorBadge(authorType)}
            </div>
            <p className="text-xs text-gray-500 font-medium mt-1">{timestamp}</p>
          </div>
        </div>
        {post.category && (
          <span className="px-3 py-1 bg-gradient-to-r from-[#FFC800]/20 to-[#FFC800]/10 text-[#FFC800] text-xs font-bold rounded-full border-2 border-[#FFC800]/30 flex-shrink-0 ml-2">
            {post.category}
          </span>
        )}
      </div>

      {/* Post Title */}
      <h3 className="text-xl font-heading font-bold text-gray-900 mb-3 group-hover:text-[#1CB0F6] transition-colors">
        {post.title}
      </h3>

      {/* Post Content */}
      <p className="text-gray-700 text-sm leading-relaxed mb-4">{post.content}</p>

      {/* Post Tags */}
      {post.tags && post.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {post.tags.map((tag, index) => (
            <span
              key={index}
              className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-bold rounded-full border-2 border-gray-300 hover:bg-gray-200 transition-colors"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Post Stats */}
      <div className="flex items-center gap-4 mb-4 text-sm font-bold">
        <div className="flex items-center text-[#1CB0F6]">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <span>{post.replies?.length || 0} replies</span>
        </div>
       
      </div>

      {/* Replies Section */}
      {post.replies && post.replies.length > 0 && (
        <div className="border-t-2 border-gray-200 pt-4 mt-4">
          <h4 className="font-heading font-bold text-gray-900 mb-3 flex items-center">
            <svg className="w-5 h-5 mr-2 text-[#1CB0F6]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            Replies
          </h4>
          <div className="space-y-3">
            {displayedReplies.map((reply, index) => {
              const replyAuthorName = reply.author_name || reply.author || 'Anonymous';
              const replyAuthorType = reply.user_type || reply.authorType || 'patient';
              const replyTimestamp = reply.timestamp || new Date(reply.created_at).toLocaleString();

              return (
                <div key={index} className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 border-2 border-gray-200 hover:border-gray-300 transition-all">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2 flex-1">
                      <div className={`w-10 h-10 bg-gradient-to-br ${
                        replyAuthorType === 'researcher'
                          ? 'from-[#58CC02] to-[#46A302]'
                          : 'from-[#1CB0F6] to-[#1899D6]'
                      } rounded-xl flex items-center justify-center text-white text-sm font-bold shadow-lg`}>
                        {replyAuthorName.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-bold text-sm text-gray-900">{replyAuthorName}</p>
                          {getAuthorBadge(replyAuthorType)}
                        </div>
                        <p className="text-xs text-gray-500 font-medium">{replyTimestamp}</p>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 ml-12 leading-relaxed">{reply.content}</p>
                </div>
              );
            })}
          </div>
          {post.replies.length > 2 && (
            <button
              onClick={() => setShowAllReplies(!showAllReplies)}
              className="mt-3 text-sm text-[#1CB0F6] hover:text-[#1899D6] font-bold transition-colors flex items-center"
            >
              {showAllReplies ? (
                <>
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                  </svg>
                  Show Less
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                  View {post.replies.length - 2} more replies
                </>
              )}
            </button>
          )}
        </div>
      )}

      {/* Reply Button/Form */}
      {canReply && (
        <div className="border-t-2 border-gray-200 pt-4 mt-4">
          {!showReplyForm ? (
            <button
              onClick={() => setShowReplyForm(true)}
              className={`w-full ${
                userType === 'researcher'
                  ? 'bg-gradient-to-r from-[#58CC02] to-[#46A302] hover:from-[#46A302] hover:to-[#58CC02]'
                  : 'bg-gradient-to-r from-[#1CB0F6] to-[#1899D6] hover:from-[#1899D6] hover:to-[#1CB0F6]'
              } text-white font-bold py-3 px-6 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg text-sm flex items-center justify-center`}
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              Reply to Post
            </button>
          ) : (
            <div className="space-y-3 animate-fade-in">
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Write your reply..."
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1CB0F6] focus:border-[#1CB0F6] font-medium text-sm transition-all resize-none"
                rows="4"
              />
              <div className="flex flex-wrap gap-2">
                {userType === 'researcher' && (
                  <button
                    onClick={handleAISuggest}
                    disabled={isLoadingAI}
                    className="px-4 py-2.5 bg-gradient-to-r from-[#FFC800]/20 to-[#FFC800]/10 hover:from-[#FFC800]/30 hover:to-[#FFC800]/20 disabled:from-gray-50 disabled:to-gray-100 text-[#FFC800] font-bold rounded-xl transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed border-2 border-[#FFC800]/30 flex items-center gap-2 shadow-lg"
                    title="Generate AI-assisted response draft"
                  >
                    {isLoadingAI ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-[#FFC800] border-t-transparent"></div>
                        <span>Generating...</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                        <span>AI Suggest</span>
                      </>
                    )}
                  </button>
                )}
                <button
                  onClick={handleSubmitReply}
                  className={`flex-1 ${
                    userType === 'researcher'
                      ? 'bg-gradient-to-r from-[#58CC02] to-[#46A302] hover:from-[#46A302] hover:to-[#58CC02]'
                      : 'bg-gradient-to-r from-[#1CB0F6] to-[#1899D6] hover:from-[#1899D6] hover:to-[#1CB0F6]'
                  } text-white font-bold py-2.5 px-4 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg text-sm`}
                >
                  Submit Reply
                </button>
                <button
                  onClick={() => {
                    setShowReplyForm(false);
                    setReplyText('');
                  }}
                  className="px-4 py-2.5 bg-white border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 text-gray-700 font-bold rounded-xl transition-all duration-200"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ForumPostCard;
