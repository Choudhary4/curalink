import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { researchers, favorites as favoritesApi, meetings as meetingsApi, messages as messagesApi } from '../../services/api';

const Collaborators = () => {
  const navigate = useNavigate();
  const [collaborators, setCollaborators] = useState([]);
  const [filteredCollaborators, setFilteredCollaborators] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    specialty: '',
    researchInterests: '',
  });
  const [connections, setConnections] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [showChatModal, setShowChatModal] = useState(false);
  const [selectedCollaborator, setSelectedCollaborator] = useState(null);
  const [chatMessage, setChatMessage] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const collaboratorsPerPage = 6;

  useEffect(() => {
    loadCollaborators();
    loadConnections();
  }, []);

  useEffect(() => {
    filterCollaborators();
  }, [collaborators, searchTerm, filters]);

  const loadCollaborators = async () => {
    try {
      const response = await researchers.findCollaborators();
      setCollaborators(response.data);
      setFilteredCollaborators(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error loading collaborators:', error);
      setLoading(false);
      setCollaborators([]);
      setFilteredCollaborators([]);
    }
  };

  const loadConnections = async () => {
    try {
      const userId = parseInt(localStorage.getItem('userId'));
      console.log('=== Loading Connections ===');
      console.log('Current User ID:', userId);

      // Load all collaboration requests and active collaborations
      const requestsResponse = await meetingsApi.getCollaborations();
      const allRequests = requestsResponse.data;
      console.log('All Requests:', allRequests);

      // Load active collaborations (accepted requests)
      const activeCollaborations = allRequests
        .filter(req => req.status === 'active')
        .map(req => {
          // Get the other researcher's ID
          return req.researcher1_id === userId ? req.researcher2_id : req.researcher1_id;
        });

      console.log('Active Collaborations:', activeCollaborations);
      setConnections(activeCollaborations);

      // Load pending collaboration requests
      const pendingRequests = allRequests.filter(req => req.status === 'pending');
      console.log('Pending Requests:', pendingRequests);

      // Separate outgoing and incoming requests
      const outgoing = pendingRequests
        .filter(req => req.researcher1_id === userId)
        .map(req => req.researcher2_id);

      const incoming = pendingRequests
        .filter(req => req.researcher2_id === userId)
        .map(req => ({
          id: req.id,
          researcherId: req.researcher1_id
        }));

      console.log('Outgoing Requests (researcher IDs):', outgoing);
      console.log('Incoming Requests:', incoming);

      setPendingRequests(outgoing);
      setIncomingRequests(incoming);
    } catch (error) {
      console.error('Error loading connections:', error);
      setConnections([]);
      setPendingRequests([]);
      setIncomingRequests([]);
    }
  };

  const filterCollaborators = () => {
    let filtered = collaborators;

    if (searchTerm) {
      filtered = filtered.filter(
        (collab) =>
          collab.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          collab.specialty?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (Array.isArray(collab.researchInterests) && collab.researchInterests.some(interest =>
            interest.toLowerCase().includes(searchTerm.toLowerCase())
          ))
      );
    }

    if (filters.specialty) {
      filtered = filtered.filter((collab) =>
        collab.specialty?.toLowerCase().includes(filters.specialty.toLowerCase())
      );
    }

    if (filters.researchInterests) {
      filtered = filtered.filter((collab) =>
        Array.isArray(collab.researchInterests) && collab.researchInterests.some(interest =>
          interest.toLowerCase().includes(filters.researchInterests.toLowerCase())
        )
      );
    }

    setFilteredCollaborators(filtered);
    setCurrentPage(1);
  };

  const getConnectionStatus = (collabId) => {
    if (connections.includes(collabId)) return 'connected';
    if (pendingRequests.includes(collabId)) return 'pending_sent';
    const incoming = incomingRequests.find(req => req.researcherId === collabId);
    if (incoming) return 'pending_received';
    return 'none';
  };

  const getIncomingRequestId = (collabId) => {
    const incoming = incomingRequests.find(req => req.researcherId === collabId);
    return incoming ? incoming.id : null;
  };

  const handleSendRequest = async (collabId) => {
    try {
      await meetingsApi.requestCollaboration({
        researcher2_id: collabId,
        project_title: 'Research Collaboration',
        description: 'I would like to collaborate on research projects.'
      });

      setPendingRequests([...pendingRequests, collabId]);
      alert('Connection request sent!');
    } catch (error) {
      console.error('Error sending request:', error);
      alert('Error sending connection request. Please try again.');
    }
  };

  const handleAcceptRequest = async (requestId, collabId) => {
    try {
      await meetingsApi.updateCollaborationStatus(requestId, 'active');
      setIncomingRequests(incomingRequests.filter(req => req.id !== requestId));
      setConnections([...connections, collabId]);
      alert('Collaboration request accepted!');
    } catch (error) {
      console.error('Error accepting request:', error);
      alert('Failed to accept request. Please try again.');
    }
  };

  const handleDeclineRequest = async (requestId) => {
    try {
      await meetingsApi.updateCollaborationStatus(requestId, 'declined');
      setIncomingRequests(incomingRequests.filter(req => req.id !== requestId));
      alert('Collaboration request declined.');
    } catch (error) {
      console.error('Error declining request:', error);
      alert('Failed to decline request. Please try again.');
    }
  };

  const handleChat = (collaborator) => {
    setSelectedCollaborator(collaborator);
    setShowChatModal(true);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();

    try {
      await messagesApi.send({
        receiver_id: selectedCollaborator.id,
        subject: `Message from Collaborator`,
        content: chatMessage
      });

      alert(`Message sent to ${selectedCollaborator.name}!`);
      setChatMessage('');
      setShowChatModal(false);
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
    }
  };

  const specialties = [...new Set(collaborators.map((c) => c.specialty))];

  // Pagination
  const indexOfLastCollaborator = currentPage * collaboratorsPerPage;
  const indexOfFirstCollaborator = indexOfLastCollaborator - collaboratorsPerPage;
  const currentCollaborators = filteredCollaborators.slice(
    indexOfFirstCollaborator,
    indexOfLastCollaborator
  );
  const totalPages = Math.ceil(filteredCollaborators.length / collaboratorsPerPage);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Find Collaborators</h1>
          <p className="text-gray-600 text-lg">
            Connect with fellow researchers and build your network
          </p>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-2xl shadow-md border-2 border-gray-100 p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search by name, specialty, or research interests..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              />
            </div>
            <button
              onClick={filterCollaborators}
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold px-8 py-3 rounded-xl transition-all transform hover:scale-105 shadow-md"
            >
              Search
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filter Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-md border-2 border-gray-100 p-6 sticky top-4">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Filters</h3>

              {/* Specialty Filter */}
              <div className="mb-6">
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Specialty
                </label>
                <select
                  value={filters.specialty}
                  onChange={(e) => setFilters({ ...filters, specialty: e.target.value })}
                  className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                >
                  <option value="">All Specialties</option>
                  {specialties.map((specialty) => (
                    <option key={specialty} value={specialty}>
                      {specialty}
                    </option>
                  ))}
                </select>
              </div>

              {/* Research Interests Filter */}
              <div className="mb-6">
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Research Interests
                </label>
                <input
                  type="text"
                  placeholder="Enter research area"
                  value={filters.researchInterests}
                  onChange={(e) =>
                    setFilters({ ...filters, researchInterests: e.target.value })
                  }
                  className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                />
              </div>

              {/* Clear Filters */}
              <button
                onClick={() => {
                  setFilters({ specialty: '', researchInterests: '' });
                  setSearchTerm('');
                }}
                className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-2 px-4 rounded-xl transition-all hover:scale-105"
              >
                Clear Filters
              </button>
            </div>
          </div>

          {/* Collaborators Grid */}
          <div className="lg:col-span-3">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500 mx-auto"></div>
                  <p className="mt-4 text-gray-600 font-semibold">Loading collaborators...</p>
                </div>
              </div>
            ) : currentCollaborators.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-md border-2 border-gray-100 p-12 text-center">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">
                  No collaborators found
                </h3>
                <p className="text-gray-600">Try adjusting your search criteria or filters</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  {currentCollaborators.map((collaborator) => {
                    const status = getConnectionStatus(collaborator.id);
                    return (
                      <div
                        key={collaborator.id}
                        className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 p-6 border-2 border-gray-100 hover:border-blue-300"
                      >
                        <div className="flex items-start mb-4">
                          <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold mr-4 shadow-lg">
                            {collaborator.name.charAt(0)}
                          </div>
                          <div className="flex-1">
                            <h3 className="text-lg font-bold text-gray-900">
                              {collaborator.name}
                            </h3>
                            <p className="text-sm text-blue-600 font-bold">
                              {collaborator.specialty}
                            </p>
                            <p className="text-xs text-gray-600 mt-1">
                              {collaborator.institution}
                            </p>
                          </div>
                        </div>

                        <div className="space-y-2 mb-4">
                          <div className="flex items-center text-sm text-gray-600">
                            <span className="mr-2">📍</span>
                            <span>{collaborator.location}</span>
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <span className="mr-2">📊</span>
                            <span>
                              {collaborator.publications} publications • h-index:{' '}
                              {collaborator.hIndex}
                            </span>
                          </div>
                        </div>

                        {/* Research Interests */}
                        {Array.isArray(collaborator.researchInterests) && collaborator.researchInterests.length > 0 && (
                          <div className="mb-4">
                            <p className="text-xs font-semibold text-gray-700 mb-2">
                              Research Interests:
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {collaborator.researchInterests.map((interest, index) => (
                                <span
                                  key={index}
                                  className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold"
                                >
                                  {interest}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Recent Publications */}
                        {Array.isArray(collaborator.recentPublications) && collaborator.recentPublications.length > 0 && (
                          <div className="mb-4">
                            <p className="text-xs font-semibold text-gray-700 mb-2">
                              Recent Publications:
                            </p>
                            <ul className="space-y-1">
                              {collaborator.recentPublications.slice(0, 2).map((pub, index) => (
                                <li key={index} className="text-xs text-gray-600 flex items-start">
                                  <span className="mr-1">•</span>
                                  <span className="line-clamp-1">{pub}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex gap-2">
                          {status === 'none' && (
                            <>
                              <button
                                onClick={() => handleSendRequest(collaborator.id)}
                                className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold py-2 px-4 rounded-xl transition-all transform hover:scale-105 shadow-md"
                              >
                                Send Request
                              </button>
                              <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-2 px-4 rounded-xl transition-all hover:scale-105">
                                View Profile
                              </button>
                            </>
                          )}
                          {status === 'pending_received' && (
                            <div className="flex gap-2 w-full">
                              <button
                                onClick={() => handleAcceptRequest(getIncomingRequestId(collaborator.id), collaborator.id)}
                                className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-2 px-4 rounded-xl transition-all transform hover:scale-105 shadow-md"
                              >
                                ✓ Accept
                              </button>
                              <button
                                onClick={() => handleDeclineRequest(getIncomingRequestId(collaborator.id))}
                                className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-xl transition-all transform hover:scale-105 shadow-md"
                              >
                                ✕ Decline
                              </button>
                            </div>
                          )}
                          {status === 'pending_sent' && (
                            <button
                              disabled
                              className="flex-1 bg-yellow-100 text-yellow-700 font-bold py-2 px-4 rounded-xl cursor-not-allowed"
                            >
                              Request Pending
                            </button>
                          )}
                          {status === 'connected' && (
                            <>
                              <button
                                onClick={() => handleChat(collaborator)}
                                className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold py-2 px-4 rounded-xl transition-all transform hover:scale-105 shadow-md"
                              >
                                Send Message
                              </button>
                              <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-2 px-4 rounded-xl transition-all hover:scale-105">
                                View Profile
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-2">
                    <button
                      onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="px-4 py-2 bg-white border-2 border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed font-bold transition-all hover:scale-105"
                    >
                      Previous
                    </button>
                    {[...Array(totalPages)].map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentPage(index + 1)}
                        className={`px-4 py-2 rounded-xl font-bold transition-all hover:scale-105 ${
                          currentPage === index + 1
                            ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md'
                            : 'bg-white border-2 border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        {index + 1}
                      </button>
                    ))}
                    <button
                      onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 bg-white border-2 border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed font-bold transition-all hover:scale-105"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Chat Modal */}
      {showChatModal && selectedCollaborator && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full border-2 border-gray-100">
            <div className="p-6 border-b-2 border-gray-100">
              <h2 className="text-2xl font-bold text-gray-800">
                Send Message to {selectedCollaborator.name}
              </h2>
              <p className="text-gray-600 mt-1">{selectedCollaborator.email}</p>
            </div>

            <form onSubmit={handleSendMessage} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Message
                  </label>
                  <textarea
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    placeholder="Write your message..."
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    rows="6"
                    required
                  />
                </div>
              </div>

              <div className="flex gap-4 mt-6">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold py-3 px-6 rounded-xl transition-all transform hover:scale-105 shadow-md"
                >
                  Send Message
                </button>
                <button
                  type="button"
                  onClick={() => setShowChatModal(false)}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-3 px-6 rounded-xl transition-all hover:scale-105"
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

export default Collaborators;
