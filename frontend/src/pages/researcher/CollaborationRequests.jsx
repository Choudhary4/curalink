import { useState, useEffect } from 'react';
import { meetings as meetingsApi } from '../../services/api';

const CollaborationRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');
  const userId = parseInt(localStorage.getItem('userId'));

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      setLoading(true);
      // Load all requests without status filter to get accurate counts for all tabs
      const response = await meetingsApi.getCollaborations({});
      setRequests(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error loading collaboration requests:', error);
      setRequests([]);
      setLoading(false);
    }
  };

  const handleAccept = async (requestId) => {
    try {
      await meetingsApi.updateCollaborationStatus(requestId, 'active');
      alert('Collaboration request accepted!');
      loadRequests();
    } catch (error) {
      console.error('Error accepting request:', error);
      alert('Failed to accept request. Please try again.');
    }
  };

  const handleDecline = async (requestId) => {
    try {
      await meetingsApi.updateCollaborationStatus(requestId, 'declined');
      alert('Collaboration request declined.');
      loadRequests();
    } catch (error) {
      console.error('Error declining request:', error);
      alert('Failed to decline request. Please try again.');
    }
  };

  const filteredRequests = requests.filter(req => req.status === activeTab);

  // Calculate counts for each status from all requests
  const pendingCount = requests.filter(r => r.status === 'pending').length;
  const activeCount = requests.filter(r => r.status === 'active').length;
  const declinedCount = requests.filter(r => r.status === 'declined').length;

  const tabs = [
    { id: 'pending', label: 'Pending Requests', count: pendingCount },
    { id: 'active', label: 'Active Collaborations', count: activeCount },
    { id: 'declined', label: 'Declined', count: declinedCount },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Collaboration Requests</h1>
          <p className="text-gray-600 text-lg">
            Manage your collaboration invitations and partnerships
          </p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-md border-2 border-gray-100 p-2 mb-6">
          <div className="flex flex-wrap gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 min-w-[150px] flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold transition-all transform hover:scale-105 ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg'
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border-2 border-gray-200'
                }`}
              >
                <span>{tab.label}</span>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                  activeTab === tab.id
                    ? 'bg-white text-blue-600'
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
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500 mx-auto"></div>
              <p className="mt-4 text-gray-600 font-semibold">Loading requests...</p>
            </div>
          </div>
        ) : (
          <div>
            {filteredRequests.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-md border-2 border-gray-100 p-12 text-center">
                <h3 className="text-2xl font-bold text-gray-800 mb-2">
                  {activeTab === 'pending' && 'No pending requests'}
                  {activeTab === 'active' && 'No active collaborations'}
                  {activeTab === 'declined' && 'No declined requests'}
                </h3>
                <p className="text-gray-600">
                  {activeTab === 'pending' && 'You have no pending collaboration requests at the moment.'}
                  {activeTab === 'active' && 'You have no active collaborations yet.'}
                  {activeTab === 'declined' && 'You have not declined any requests.'}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredRequests.map((request) => {
                  // Determine if current user is the sender or receiver
                  const isReceiver = request.researcher2_id === userId;
                  const otherResearcherName = isReceiver ? request.researcher1_name : request.researcher2_name;
                  const otherResearcherEmail = isReceiver ? request.researcher1_email : request.researcher2_email;

                  return (
                    <div key={request.id} className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 p-6 border-2 border-gray-100 hover:border-blue-300">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4 flex-1">
                          <div className="w-14 h-14 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center text-white text-xl font-bold shadow-lg">
                            {otherResearcherName.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="text-lg font-bold text-gray-900">{otherResearcherName}</h3>
                              {isReceiver && request.status === 'pending' && (
                                <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-semibold rounded-full">
                                  Incoming Request
                                </span>
                              )}
                              {!isReceiver && request.status === 'pending' && (
                                <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
                                  Sent Request
                                </span>
                              )}
                              {request.status === 'active' && (
                                <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                                  Active
                                </span>
                              )}
                              {request.status === 'declined' && (
                                <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded-full">
                                  Declined
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 mb-3">{otherResearcherEmail}</p>

                            {request.project_title && (
                              <div className="mb-2">
                                <p className="text-sm font-semibold text-gray-700">Project Title:</p>
                                <p className="text-sm text-gray-900">{request.project_title}</p>
                              </div>
                            )}

                            {request.description && (
                              <div className="mb-2">
                                <p className="text-sm font-semibold text-gray-700">Description:</p>
                                <p className="text-sm text-gray-600">{request.description}</p>
                              </div>
                            )}

                            <p className="text-xs text-gray-500 mt-2">
                              {isReceiver ? 'Received' : 'Sent'} on {new Date(request.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>

                        {/* Action buttons - only show for incoming pending requests */}
                        {isReceiver && request.status === 'pending' && (
                          <div className="flex gap-2 ml-4">
                            <button
                              onClick={() => handleAccept(request.id)}
                              className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold rounded-xl transition-all transform hover:scale-105 shadow-md"
                              title="Accept collaboration request"
                            >
                              Accept
                            </button>
                            <button
                              onClick={() => handleDecline(request.id)}
                              className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl transition-all transform hover:scale-105 shadow-md"
                              title="Decline collaboration request"
                            >
                              Decline
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
    </div>
  );
};

export default CollaborationRequests;
