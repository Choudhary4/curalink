import { useState, useEffect } from 'react';
import { meetings as meetingsApi } from '../services/api';

const MeetingRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [meetingLink, setMeetingLink] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const userId = parseInt(localStorage.getItem('userId'));
  const userType = localStorage.getItem('userType');

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      setLoading(true);
      // Load all requests without status filter to get accurate counts for all tabs
      const response = await meetingsApi.getRequests({});
      setRequests(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error loading meeting requests:', error);
      setRequests([]);
      setLoading(false);
    }
  };

  const handleAccept = (request) => {
    setSelectedRequest(request);
    setMeetingLink('');
    setNotes('');
    setShowAcceptModal(true);
  };

  const handleAcceptSubmit = async () => {
    if (!meetingLink.trim()) {
      alert('Please provide a meeting link');
      return;
    }

    try {
      setSubmitting(true);
      await meetingsApi.updateStatus(selectedRequest.id, 'accepted', {
        meeting_link: meetingLink.trim(),
        notes: notes.trim()
      });
      alert('Meeting request accepted!');
      setShowAcceptModal(false);
      setSelectedRequest(null);
      setMeetingLink('');
      setNotes('');
      loadRequests();
    } catch (error) {
      console.error('Error accepting request:', error);
      alert('Failed to accept request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDecline = async (requestId) => {
    if (!confirm('Are you sure you want to decline this meeting request?')) {
      return;
    }

    try {
      await meetingsApi.updateStatus(requestId, 'declined');
      alert('Meeting request declined.');
      loadRequests();
    } catch (error) {
      console.error('Error declining request:', error);
      alert('Failed to decline request. Please try again.');
    }
  };

  const handleComplete = async (requestId) => {
    if (!confirm('Mark this meeting as completed?')) {
      return;
    }

    try {
      await meetingsApi.updateStatus(requestId, 'completed');
      alert('Meeting marked as completed.');
      loadRequests();
    } catch (error) {
      console.error('Error completing request:', error);
      alert('Failed to complete request. Please try again.');
    }
  };

  const filteredRequests = requests.filter(req => req.status === activeTab);

  // Calculate counts for each status from all requests
  const pendingCount = requests.filter(r => r.status === 'pending').length;
  const acceptedCount = requests.filter(r => r.status === 'accepted').length;
  const declinedCount = requests.filter(r => r.status === 'declined').length;
  const completedCount = requests.filter(r => r.status === 'completed').length;

  const tabs = [
    { id: 'pending', label: 'Pending', count: pendingCount },
    { id: 'accepted', label: 'Accepted', count: acceptedCount },
    { id: 'declined', label: 'Declined', count: declinedCount },
    { id: 'completed', label: 'Completed', count: completedCount },
  ];

  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified';
    const date = new Date(dateString);
    return date.toLocaleString([], {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Meeting Requests</h1>
          <p className="text-gray-600 text-lg">
            {userType === 'patient'
              ? 'Manage your meeting requests with health experts'
              : 'Manage meeting requests from patients'}
          </p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-md border-2 border-gray-100 p-2 mb-6">
          <div className="flex flex-wrap gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 min-w-[120px] flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold transition-all transform hover:scale-105 ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg'
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border-2 border-gray-200'
                }`}
              >
                <span>{tab.label}</span>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                  activeTab === tab.id
                    ? 'bg-white text-purple-600'
                    : 'bg-white text-gray-700 border border-gray-300'
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-500 mx-auto"></div>
              <p className="mt-4 text-gray-600 font-semibold">Loading requests...</p>
            </div>
          </div>
        ) : (
          <div>
            {filteredRequests.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-md border-2 border-gray-100 p-12 text-center">
                <h3 className="text-2xl font-bold text-gray-800 mb-2">
                  {activeTab === 'pending' && 'No pending requests'}
                  {activeTab === 'accepted' && 'No accepted meetings'}
                  {activeTab === 'declined' && 'No declined requests'}
                  {activeTab === 'completed' && 'No completed meetings'}
                </h3>
                <p className="text-gray-600">
                  {activeTab === 'pending' && 'You have no pending meeting requests at the moment.'}
                  {activeTab === 'accepted' && 'You have no accepted meetings scheduled.'}
                  {activeTab === 'declined' && 'You have not declined any requests.'}
                  {activeTab === 'completed' && 'You have no completed meetings.'}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredRequests.map((request) => {
                  // Determine if current user is the requester or expert
                  const isExpert = request.expert_id === userId;
                  const otherPersonName = isExpert ? request.requester_name : request.expert_name;
                  const otherPersonEmail = isExpert ? request.requester_email : request.expert_email;

                  return (
                    <div key={request.id} className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 p-6 border-2 border-gray-100 hover:border-purple-300">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4 flex-1">
                          <div className="w-14 h-14 bg-gradient-to-br from-purple-400 to-pink-600 rounded-2xl flex items-center justify-center text-white text-xl font-bold shadow-lg">
                            {otherPersonName.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="text-lg font-bold text-gray-900">{otherPersonName}</h3>
                              {isExpert && request.status === 'pending' && (
                                <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-semibold rounded-full">
                                  Incoming Request
                                </span>
                              )}
                              {!isExpert && request.status === 'pending' && (
                                <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
                                  Sent Request
                                </span>
                              )}
                              {request.status === 'accepted' && (
                                <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                                  Accepted
                                </span>
                              )}
                              {request.status === 'declined' && (
                                <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded-full">
                                  Declined
                                </span>
                              )}
                              {request.status === 'completed' && (
                                <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-semibold rounded-full">
                                  Completed
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 mb-3">{otherPersonEmail}</p>

                            {request.message && (
                              <div className="mb-3">
                                <p className="text-sm font-semibold text-gray-700">Message:</p>
                                <p className="text-sm text-gray-600">{request.message}</p>
                              </div>
                            )}

                            {request.preferred_date && (
                              <div className="mb-2">
                                <p className="text-sm font-semibold text-gray-700">Preferred Date:</p>
                                <p className="text-sm text-gray-900">{formatDate(request.preferred_date)}</p>
                              </div>
                            )}

                            {request.meeting_link && (
                              <div className="mb-2">
                                <p className="text-sm font-semibold text-gray-700">Meeting Link:</p>
                                <a
                                  href={request.meeting_link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-sm text-purple-600 hover:text-purple-800 underline"
                                >
                                  {request.meeting_link}
                                </a>
                              </div>
                            )}

                            {request.notes && (
                              <div className="mb-2">
                                <p className="text-sm font-semibold text-gray-700">Notes:</p>
                                <p className="text-sm text-gray-600">{request.notes}</p>
                              </div>
                            )}

                            <p className="text-xs text-gray-500 mt-2">
                              {isExpert ? 'Received' : 'Sent'} on {new Date(request.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>

                        {/* Action buttons - only show for experts with pending requests */}
                        {isExpert && request.status === 'pending' && (
                          <div className="flex gap-2 ml-4">
                            <button
                              onClick={() => handleAccept(request)}
                              className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold rounded-xl transition-all transform hover:scale-105 shadow-md"
                              title="Accept meeting request"
                            >
                              Accept
                            </button>
                            <button
                              onClick={() => handleDecline(request.id)}
                              className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl transition-all transform hover:scale-105 shadow-md"
                              title="Decline meeting request"
                            >
                              Decline
                            </button>
                          </div>
                        )}

                        {/* Complete button for accepted meetings */}
                        {request.status === 'accepted' && (
                          <div className="ml-4">
                            <button
                              onClick={() => handleComplete(request.id)}
                              className="px-4 py-2 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-bold rounded-xl transition-all transform hover:scale-105 shadow-md"
                              title="Mark as completed"
                            >
                              Mark Complete
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Accept Meeting Modal */}
      {showAcceptModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Accept Meeting Request</h2>
            <p className="text-gray-600 mb-4">
              Provide meeting details for {selectedRequest?.requester_name}
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Meeting Link (required)
                </label>
                <input
                  type="url"
                  value={meetingLink}
                  onChange={(e) => setMeetingLink(e.target.value)}
                  placeholder="https://zoom.us/j/123456789"
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Notes (optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add any additional information..."
                  rows="3"
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowAcceptModal(false);
                  setSelectedRequest(null);
                  setMeetingLink('');
                  setNotes('');
                }}
                className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold rounded-xl transition-all"
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                onClick={handleAcceptSubmit}
                disabled={submitting || !meetingLink.trim()}
                className={`flex-1 px-4 py-2 font-bold rounded-xl transition-all ${
                  submitting || !meetingLink.trim()
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white'
                }`}
              >
                {submitting ? 'Accepting...' : 'Accept Meeting'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MeetingRequests;
