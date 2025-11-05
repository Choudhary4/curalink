import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ExpertCard from '../../components/ExpertCard';
import { researchers, favorites as favoritesApi, meetings as meetingsApi, publications } from '../../services/api';

const HealthExperts = () => {
  const navigate = useNavigate();
  const [experts, setExperts] = useState([]);
  const [filteredExperts, setFilteredExperts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    specialty: '',
    location: '',
    availability: false,
  });
  const [followedExperts, setFollowedExperts] = useState([]);
  const [showMeetingModal, setShowMeetingModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [selectedExpert, setSelectedExpert] = useState(null);
  const [meetingForm, setMeetingForm] = useState({
    reason: '',
    preferredDate: '',
    preferredTime: '',
    additionalNotes: '',
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [searchMode, setSearchMode] = useState('local'); // 'local' or 'orcid'
  const [orcidResearchers, setOrcidResearchers] = useState([]);
  const [orcidSearchTerm, setOrcidSearchTerm] = useState('');
  const [searchingOrcid, setSearchingOrcid] = useState(false);
  const expertsPerPage = 6;

  useEffect(() => {
    loadExperts();
    loadFollowedExperts();
  }, []);

  useEffect(() => {
    filterExperts();
  }, [experts, searchTerm, filters]);

  const loadExperts = async () => {
    try {
      // Don't filter by user_type to show all researchers and health experts
      const response = await researchers.findExperts({});
      setExperts(response.data);
      setFilteredExperts(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error loading experts:', error);
      setLoading(false);
      setExperts([]);
      setFilteredExperts([]);
    }
  };

  const loadFollowedExperts = async () => {
    try {
      const response = await favoritesApi.getAll();
      const expertFavorites = response.data
        .filter(fav => fav.item_type === 'expert' || fav.item_type === 'researcher')
        .map(fav => fav.item_id);
      setFollowedExperts(expertFavorites);
    } catch (error) {
      console.error('Error loading followed experts:', error);
      setFollowedExperts([]);
    }
  };

  const filterExperts = () => {
    let filtered = experts;

    if (searchTerm) {
      filtered = filtered.filter(
        (expert) =>
          expert.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          expert.specialty.toLowerCase().includes(searchTerm.toLowerCase()) ||
          expert.specializations.some(spec => spec.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (filters.specialty) {
      filtered = filtered.filter((expert) => expert.specialty === filters.specialty);
    }

    if (filters.location) {
      filtered = filtered.filter((expert) =>
        expert.location.toLowerCase().includes(filters.location.toLowerCase())
      );
    }

    if (filters.availability) {
      filtered = filtered.filter((expert) => expert.availability);
    }

    setFilteredExperts(filtered);
    setCurrentPage(1);
  };

  const handleOrcidSearch = async () => {
    if (!orcidSearchTerm.trim()) return;

    setSearchingOrcid(true);
    try {
      const response = await publications.searchOrcid({
        query: orcidSearchTerm,
        maxResults: 20
      });
      setOrcidResearchers(response.data);
    } catch (error) {
      console.error('Error searching ORCID:', error);
      alert('Unable to search ORCID. Please try again later.');
    } finally {
      setSearchingOrcid(false);
    }
  };

  const handleToggleFollow = async (expertId) => {
    try {
      if (followedExperts.includes(expertId)) {
        // Remove from favorites
        await favoritesApi.remove('expert', expertId);
        setFollowedExperts(followedExperts.filter((id) => id !== expertId));
      } else {
        // Add to favorites
        try {
          await favoritesApi.add({
            item_type: 'expert',
            item_id: expertId
          });
          setFollowedExperts([...followedExperts, expertId]);
        } catch (addError) {
          // If already in favorites, try to remove instead
          if (addError.response?.data?.error?.includes('already in favorites')) {
            await favoritesApi.remove('expert', expertId);
            // Reload the favorites to sync state
            await loadFollowedExperts();
          } else {
            throw addError;
          }
        }
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
      alert('Error updating favorites. Please try again.');
    }
  };

  const handleRequestMeeting = (expert) => {
    setSelectedExpert(expert);
    setShowMeetingModal(true);
  };

  const handleViewProfile = (expert) => {
    setSelectedExpert(expert);
    setShowProfileModal(true);
  };

  const handleSubmitMeetingRequest = async (e) => {
    e.preventDefault();
    try {
      await meetingsApi.request({
        expert_id: selectedExpert.id,
        reason: meetingForm.reason,
        preferred_date: meetingForm.preferredDate,
        preferred_time: meetingForm.preferredTime,
        additional_notes: meetingForm.additionalNotes
      });

      // Reset and close
      setMeetingForm({
        reason: '',
        preferredDate: '',
        preferredTime: '',
        additionalNotes: '',
      });
      setShowMeetingModal(false);
      setSelectedExpert(null);

      alert('Meeting request sent successfully!');
    } catch (error) {
      console.error('Error submitting meeting request:', error);
      alert('Error sending meeting request. Please try again.');
    }
  };

  const specialties = [...new Set(experts.map((e) => e.specialty))];

  // Pagination
  const indexOfLastExpert = currentPage * expertsPerPage;
  const indexOfFirstExpert = indexOfLastExpert - expertsPerPage;
  const currentExperts = filteredExperts.slice(indexOfFirstExpert, indexOfLastExpert);
  const totalPages = Math.ceil(filteredExperts.length / expertsPerPage);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Find Health Experts</h1>
          <p className="text-gray-600 text-lg">Connect with leading specialists and researchers</p>
        </div>

        {/* Mode Toggle */}
        <div className="flex justify-center mb-6">
          <div className="bg-white rounded-xl shadow-lg p-2 inline-flex gap-2 border-2 border-gray-100">
            <button
              onClick={() => setSearchMode('local')}
              className={`px-6 py-2 rounded-xl font-bold transition-all duration-200 ${
                searchMode === 'local'
                  ? 'bg-gradient-to-r from-[#1CB0F6] to-[#58CC02] text-white shadow-lg'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Local Experts
            </button>
            <button
              onClick={() => setSearchMode('orcid')}
              className={`px-6 py-2 rounded-xl font-bold transition-all duration-200 ${
                searchMode === 'orcid'
                  ? 'bg-gradient-to-r from-[#1CB0F6] to-[#58CC02] text-white shadow-lg'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              ORCID Search
            </button>
          </div>
        </div>

        {/* Search Bar */}
        {searchMode === 'local' ? (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border-2 border-gray-100">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Search by name, specialty, or expertise..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1CB0F6] focus:border-[#1CB0F6]"
                />
              </div>
              <button
                onClick={filterExperts}
                className="bg-gradient-to-r from-[#1CB0F6] to-[#1899D6] hover:from-[#1899D6] hover:to-[#1CB0F6] text-white font-bold px-8 py-3 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg"
              >
                Search
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border-2 border-gray-100">
            <div className="mb-4">
              <p className="text-sm text-gray-600 font-medium">
                Search for researchers worldwide using ORCID database
              </p>
            </div>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Search by researcher name, ORCID ID, or keywords..."
                  value={orcidSearchTerm}
                  onChange={(e) => setOrcidSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleOrcidSearch()}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1CB0F6] focus:border-[#1CB0F6]"
                />
              </div>
              <button
                onClick={handleOrcidSearch}
                disabled={searchingOrcid}
                className="bg-gradient-to-r from-[#1CB0F6] to-[#1899D6] hover:from-[#1899D6] hover:to-[#1CB0F6] text-white font-bold px-8 py-3 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {searchingOrcid ? 'Searching...' : 'Search ORCID'}
              </button>
            </div>
          </div>
        )}

        {searchMode === 'local' ? (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Filter Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-lg p-6 sticky top-4 border-2 border-gray-100">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Filters</h3>

                {/* Specialty Filter */}
                <div className="mb-6">
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Specialty
                  </label>
                  <select
                    value={filters.specialty}
                    onChange={(e) => setFilters({ ...filters, specialty: e.target.value })}
                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1CB0F6] focus:border-[#1CB0F6]"
                  >
                    <option value="">All Specialties</option>
                    {specialties.map((specialty) => (
                      <option key={specialty} value={specialty}>
                        {specialty}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Location Filter */}
                <div className="mb-6">
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Location
                  </label>
                  <input
                    type="text"
                    placeholder="Enter city or state"
                    value={filters.location}
                    onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1CB0F6] focus:border-[#1CB0F6]"
                  />
                </div>

                {/* Availability Filter */}
                <div className="mb-6">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.availability}
                      onChange={(e) => setFilters({ ...filters, availability: e.target.checked })}
                      className="w-4 h-4 text-[#58CC02] border-gray-300 rounded focus:ring-[#58CC02]"
                    />
                    <span className="ml-2 text-sm text-gray-700 font-medium">Available for consultations</span>
                  </label>
                </div>

                {/* Clear Filters */}
                <button
                  onClick={() => {
                    setFilters({ specialty: '', location: '', availability: false });
                    setSearchTerm('');
                  }}
                  className="w-full bg-gradient-to-r from-[#58CC02] to-[#46A302] hover:from-[#46A302] hover:to-[#58CC02] text-white font-bold py-3 px-4 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
                >
                  Clear Filters
                </button>
              </div>
            </div>

            {/* Experts Grid */}
            <div className="lg:col-span-3">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#1CB0F6] mx-auto"></div>
                  <p className="mt-4 text-gray-600 font-semibold">Loading experts...</p>
                </div>
              </div>
            ) : currentExperts.length === 0 ? (
              <div className="bg-white rounded-xl shadow-lg p-12 text-center border-2 border-gray-100">
                <div className="w-20 h-20 bg-gradient-to-r from-[#1CB0F6]/20 to-[#58CC02]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">No experts found</h3>
                <p className="text-gray-600">Try adjusting your search criteria or filters</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  {currentExperts.map((expert) => (
                    <ExpertCard
                      key={expert.id}
                      expert={expert}
                      onRequestMeeting={handleRequestMeeting}
                      onToggleFollow={handleToggleFollow}
                      onViewProfile={handleViewProfile}
                      isFollowing={followedExperts.includes(expert.id)}
                    />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-2">
                    <button
                      onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="px-4 py-2 bg-white border-2 border-gray-300 rounded-xl hover:border-[#1CB0F6] hover:bg-[#1CB0F6]/10 disabled:opacity-50 disabled:cursor-not-allowed font-bold transition-all duration-200"
                    >
                      Previous
                    </button>
                    {[...Array(totalPages)].map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentPage(index + 1)}
                        className={`px-4 py-2 rounded-xl font-bold transition-all duration-200 ${
                          currentPage === index + 1
                            ? 'bg-gradient-to-r from-[#1CB0F6] to-[#58CC02] text-white shadow-lg'
                            : 'bg-white border-2 border-gray-300 hover:border-[#1CB0F6] hover:bg-[#1CB0F6]/10'
                        }`}
                      >
                        {index + 1}
                      </button>
                    ))}
                    <button
                      onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 bg-white border-2 border-gray-300 rounded-xl hover:border-[#1CB0F6] hover:bg-[#1CB0F6]/10 disabled:opacity-50 disabled:cursor-not-allowed font-bold transition-all duration-200"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
            </div>
          </div>
        ) : (
          /* ORCID Search Results */
          <div className="w-full">
            {searchingOrcid ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#1CB0F6] mx-auto"></div>
                  <p className="mt-4 text-gray-600 font-semibold">Searching ORCID database...</p>
                </div>
              </div>
            ) : orcidResearchers.length === 0 ? (
              <div className="bg-white rounded-xl shadow-lg p-12 text-center border-2 border-gray-100">
                <div className="w-20 h-20 bg-gradient-to-r from-[#1CB0F6]/20 to-[#58CC02]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">No researchers found</h3>
                <p className="text-gray-600">Try searching with different keywords or a researcher name</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {orcidResearchers.map((researcher) => (
                  <div
                    key={researcher.orcid}
                    className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border-2 border-gray-100 hover:border-[#1CB0F6] group"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-[#1CB0F6] transition-colors">{researcher.name}</h3>
                        <p className="text-sm text-gray-600 mb-2 font-mono">ORCID: {researcher.orcid}</p>
                      </div>
                    </div>

                    {researcher.affiliation && (
                      <div className="mb-3">
                        <div className="flex items-center text-sm text-gray-600">
                          <svg className="w-5 h-5 text-[#58CC02] mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                          <span className="font-medium">{researcher.affiliation}</span>
                        </div>
                      </div>
                    )}

                    {researcher.publicationCount && (
                      <div className="mb-3">
                        <div className="flex items-center text-sm text-gray-600">
                          <svg className="w-5 h-5 text-[#1CB0F6] mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                          </svg>
                          <span className="font-medium">{researcher.publicationCount} publications</span>
                        </div>
                      </div>
                    )}

                    {researcher.keywords && researcher.keywords.length > 0 && (
                      <div className="mb-4">
                        <div className="flex flex-wrap gap-2">
                          {researcher.keywords.slice(0, 3).map((keyword, index) => (
                            <span
                              key={index}
                              className="px-3 py-1 bg-gradient-to-r from-[#1CB0F6]/20 to-[#1CB0F6]/10 text-[#1CB0F6] rounded-full text-xs font-bold border-2 border-[#1CB0F6]/30"
                            >
                              {keyword}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <a
                        href={`https://orcid.org/${researcher.orcid}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 bg-gradient-to-r from-[#1CB0F6] to-[#1899D6] hover:from-[#1899D6] hover:to-[#1CB0F6] text-white font-bold py-2 px-4 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg text-center text-sm"
                      >
                        View ORCID Profile
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Meeting Request Modal */}
      {showMeetingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">Request Meeting</h2>
              <p className="text-gray-600 mt-1">
                Send a consultation request to {selectedExpert?.name}
              </p>
            </div>

            <form onSubmit={handleSubmitMeetingRequest} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Reason for Consultation *
                  </label>
                  <textarea
                    required
                    value={meetingForm.reason}
                    onChange={(e) => setMeetingForm({ ...meetingForm, reason: e.target.value })}
                    placeholder="Briefly describe why you'd like to consult with this expert..."
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1CB0F6] focus:border-[#1CB0F6]"
                    rows="4"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Preferred Date
                    </label>
                    <input
                      type="date"
                      value={meetingForm.preferredDate}
                      onChange={(e) => setMeetingForm({ ...meetingForm, preferredDate: e.target.value })}
                      className="w-full px-4 py-2 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1CB0F6] focus:border-[#1CB0F6]"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Preferred Time
                    </label>
                    <input
                      type="time"
                      value={meetingForm.preferredTime}
                      onChange={(e) => setMeetingForm({ ...meetingForm, preferredTime: e.target.value })}
                      className="w-full px-4 py-2 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1CB0F6] focus:border-[#1CB0F6]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Additional Notes
                  </label>
                  <textarea
                    value={meetingForm.additionalNotes}
                    onChange={(e) => setMeetingForm({ ...meetingForm, additionalNotes: e.target.value })}
                    placeholder="Any additional information or questions..."
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1CB0F6] focus:border-[#1CB0F6]"
                    rows="3"
                  />
                </div>
              </div>

              <div className="flex gap-4 mt-6">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-[#1CB0F6] to-[#1899D6] hover:scale-105 active:scale-95 text-white font-bold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg"
                >
                  Send Request
                </button>
                <button
                  type="button"
                  onClick={() => setShowMeetingModal(false)}
                  className="flex-1 bg-white border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 text-gray-700 font-bold py-3 px-6 rounded-xl transition-all duration-200"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Profile Modal */}
      {showProfileModal && selectedExpert && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-start justify-between">
                <div className="flex items-start">
                  {selectedExpert.profile_picture ? (
                    <img
                      src={selectedExpert.profile_picture}
                      alt={selectedExpert.name}
                      className="w-16 h-16 rounded-2xl object-cover mr-4"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-gradient-to-br from-primary-400 via-accent-400 to-accent-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold mr-4">
                      {selectedExpert.name?.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{selectedExpert.name}</h2>
                    <p className="text-primary-600 font-bold uppercase tracking-wide mt-1">
                      {selectedExpert.specialty || 'Researcher'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowProfileModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6">
              {/* Contact Information */}
              <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-900 mb-3">Contact Information</h3>
                <div className="space-y-2">
                  {selectedExpert.email && (
                    <div className="flex items-center text-gray-700">
                      <svg className="w-5 h-5 text-primary-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <span>{selectedExpert.email}</span>
                    </div>
                  )}
                  {selectedExpert.location && (
                    <div className="flex items-center text-gray-700">
                      <svg className="w-5 h-5 text-primary-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span>{selectedExpert.location}</span>
                    </div>
                  )}
                  {selectedExpert.institution && (
                    <div className="flex items-center text-gray-700">
                      <svg className="w-5 h-5 text-primary-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      <span>{selectedExpert.institution}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Bio */}
              {selectedExpert.bio && (
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-3">About</h3>
                  <p className="text-gray-700 leading-relaxed">{selectedExpert.bio}</p>
                </div>
              )}

              {/* Experience */}
              {selectedExpert.years_experience && (
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-3">Experience</h3>
                  <p className="text-gray-700">{selectedExpert.years_experience} years of research experience</p>
                </div>
              )}

              {/* Specializations */}
              {selectedExpert.specialties && selectedExpert.specialties.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-3">Specialties</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedExpert.specialties.map((spec, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-semibold border-2 border-primary-200"
                      >
                        {spec}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Research Interests */}
              {selectedExpert.research_interests && selectedExpert.research_interests.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-3">Research Interests</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedExpert.research_interests.map((interest, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-accent-100 text-accent-700 rounded-full text-sm font-semibold border-2 border-accent-200"
                      >
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Availability Status */}
              {selectedExpert.availability && (
                <div className="mb-6">
                  <div className="p-4 bg-gradient-to-r from-primary-50 to-primary-100 rounded-xl border-2 border-primary-300">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-primary-500 rounded-full mr-2 animate-pulse"></div>
                      <p className="text-primary-700 font-bold">Available for consultations</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowProfileModal(false);
                    handleRequestMeeting(selectedExpert);
                  }}
                  className="flex-1 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-bold py-3 px-6 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg"
                >
                  Request Meeting
                </button>
                <button
                  onClick={() => setShowProfileModal(false)}
                  className="flex-1 bg-white border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 text-gray-700 font-bold py-3 px-6 rounded-xl transition-all duration-200"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HealthExperts;
