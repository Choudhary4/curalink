import { useState, useEffect } from 'react';
import TrialCard from '../../components/TrialCard';
import { trials as trialsApi, favorites as favoritesApi, ai } from '../../services/api';

const ClinicalTrials = () => {
  const [trials, setTrials] = useState([]);
  const [filteredTrials, setFilteredTrials] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    phase: '',
    status: '',
    location: '',
    condition: '',
  });
  const [favorites, setFavorites] = useState([]);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedTrial, setSelectedTrial] = useState(null);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailForm, setEmailForm] = useState({
    subject: '',
    message: '',
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [useSmartSearch, setUseSmartSearch] = useState(false);
  const trialsPerPage = 6;

  useEffect(() => {
    loadTrials();
    loadFavorites();
  }, []);

  useEffect(() => {
    filterTrials();
  }, [trials, searchTerm, filters]);

  const loadTrials = async () => {
    try {
      // Use live ClinicalTrials.gov API with default search term
      const response = await trialsApi.getAll({
        condition: 'cancer OR diabetes OR cardiovascular',
        useLive: true
      });
      setTrials(response.data);
      setFilteredTrials(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error loading trials:', error);
      setLoading(false);
      // Show error message to user
      setTrials([]);
      setFilteredTrials([]);
    }
  };

  const loadFavorites = async () => {
    try {
      const response = await favoritesApi.getAll();
      const trialFavorites = response.data
        .filter(fav => fav.item_type === 'trial')
        .map(fav => fav.item_id);
      setFavorites(trialFavorites);
    } catch (error) {
      console.error('Error loading favorites:', error);
      setFavorites([]);
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim() && !filters.condition) {
      loadTrials();
      return;
    }

    setLoading(true);
    try {
      let searchQuery = searchTerm || filters.condition;

      // Use AI to extract keywords if Smart Search is enabled
      if (useSmartSearch && searchTerm) {
        try {
          const keywordResponse = await ai.extractKeywords({ input: searchTerm });
          const { condition, keywords } = keywordResponse.data;
          // Build optimized search query from extracted keywords
          searchQuery = condition || keywords.join(' ') || searchTerm;
          console.log('Smart Search:', { original: searchTerm, optimized: searchQuery });
        } catch (aiError) {
          console.error('AI keyword extraction failed, using original search:', aiError);
          // Fall back to original search if AI fails
        }
      }

      // Use live ClinicalTrials.gov search with optimized query
      const params = {
        condition: searchQuery,
        useLive: true
      };

      if (filters.phase) params.phase = filters.phase;
      if (filters.status) params.status = filters.status;
      if (filters.location) params.country = filters.location;

      const response = await trialsApi.getAll(params);
      setTrials(response.data);
      setFilteredTrials(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error searching trials:', error);
      setLoading(false);
    }
  };

  const filterTrials = () => {
    let filtered = trials;

    // Apply phase filter (ClinicalTrials.gov uses different phase format)
    if (filters.phase) {
      filtered = filtered.filter((trial) =>
        trial.phase && trial.phase.toLowerCase().includes(filters.phase.toLowerCase().replace(' ', ''))
      );
    }

    // Apply status filter
    if (filters.status) {
      filtered = filtered.filter((trial) =>
        trial.status && trial.status.toUpperCase() === filters.status.toUpperCase()
      );
    }

    // Apply location filter (searches in locations array)
    if (filters.location) {
      filtered = filtered.filter((trial) => {
        if (Array.isArray(trial.locations)) {
          return trial.locations.some(loc =>
            loc.toLowerCase().includes(filters.location.toLowerCase())
          );
        }
        return trial.location && trial.location.toLowerCase().includes(filters.location.toLowerCase());
      });
    }

    setFilteredTrials(filtered);
    setCurrentPage(1);
  };

  const handleToggleFavorite = async (trialId) => {
    try {
      if (favorites.includes(trialId)) {
        await favoritesApi.remove('trial', trialId);
        setFavorites(favorites.filter((id) => id !== trialId));
      } else {
        await favoritesApi.add({
          item_type: 'trial',
          item_id: trialId
        });
        setFavorites([...favorites, trialId]);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const handleViewDetails = (trial) => {
    setSelectedTrial(trial);
    setShowDetailsModal(true);
  };

  const handleContactTrial = (trial) => {
    setSelectedTrial(trial);
    setEmailForm({
      subject: `Inquiry about ${trial.title}`,
      message: `Hello,\n\nI am interested in learning more about the clinical trial "${trial.title}" (${trial.nctId}).\n\nI would like to discuss eligibility criteria and the enrollment process.\n\nThank you.`,
    });
    setShowEmailModal(true);
  };

  const handleSendEmail = (e) => {
    e.preventDefault();
    alert(`Email sent to ${selectedTrial.contactEmail}!`);
    setShowEmailModal(false);
  };

  // Pagination
  const indexOfLastTrial = currentPage * trialsPerPage;
  const indexOfFirstTrial = indexOfLastTrial - trialsPerPage;
  const currentTrials = filteredTrials.slice(indexOfFirstTrial, indexOfLastTrial);
  const totalPages = Math.ceil(filteredTrials.length / trialsPerPage);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Clinical Trials</h1>
          <p className="text-gray-600 text-lg">
            Discover clinical trials that match your condition and interests
          </p>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border-2 border-gray-100">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3 mb-2">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={useSmartSearch}
                  onChange={(e) => setUseSmartSearch(e.target.checked)}
                  className="mr-2 h-4 w-4 text-[#58CC02] focus:ring-[#58CC02] border-gray-300 rounded"
                />
                <span className="text-sm font-bold text-gray-700 flex items-center">
                  <div className="w-5 h-5 bg-gradient-to-r from-[#58CC02] to-[#1CB0F6] rounded flex items-center justify-center mr-2">
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  Smart Search
                </span>
              </label>
              <span className="text-xs text-gray-500">
                (AI understands your natural language questions)
              </span>
            </div>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder={useSmartSearch ? "Try: 'I have breast cancer and want to find trials near me'" : "Search by condition, treatment, or keywords..."}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1CB0F6] focus:border-[#1CB0F6]"
                />
              </div>
              <button
                onClick={handleSearch}
                className="bg-gradient-to-r from-[#1CB0F6] to-[#1899D6] hover:from-[#1899D6] hover:to-[#1CB0F6] text-white font-bold px-8 py-3 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg"
              >
                Search
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filter Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-4 border-2 border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Filters</h3>

              {/* Phase Filter */}
              <div className="mb-6">
                <label className="block text-sm font-bold text-gray-700 mb-2">Phase</label>
                <select
                  value={filters.phase}
                  onChange={(e) => setFilters({ ...filters, phase: e.target.value })}
                  className="w-full px-3 py-2 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1CB0F6] focus:border-[#1CB0F6]"
                >
                  <option value="">All Phases</option>
                  <option value="Phase 1">Phase 1</option>
                  <option value="Phase 2">Phase 2</option>
                  <option value="Phase 3">Phase 3</option>
                  <option value="Phase 4">Phase 4</option>
                </select>
              </div>

              {/* Status Filter */}
              <div className="mb-6">
                <label className="block text-sm font-bold text-gray-700 mb-2">Status</label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                  className="w-full px-3 py-2 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1CB0F6] focus:border-[#1CB0F6]"
                >
                  <option value="">All Statuses</option>
                  <option value="Recruiting">Recruiting</option>
                  <option value="Active">Active</option>
                  <option value="Completed">Completed</option>
                  <option value="Suspended">Suspended</option>
                </select>
              </div>

              {/* Location Filter */}
              <div className="mb-6">
                <label className="block text-sm font-bold text-gray-700 mb-2">Location</label>
                <input
                  type="text"
                  placeholder="Enter city or state"
                  value={filters.location}
                  onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                  className="w-full px-3 py-2 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1CB0F6] focus:border-[#1CB0F6]"
                />
              </div>

              {/* Condition Filter */}
              <div className="mb-6">
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Condition
                </label>
                <input
                  type="text"
                  placeholder="Enter condition"
                  value={filters.condition}
                  onChange={(e) => setFilters({ ...filters, condition: e.target.value })}
                  className="w-full px-3 py-2 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1CB0F6] focus:border-[#1CB0F6]"
                />
              </div>

              {/* Clear Filters */}
              <button
                onClick={() => {
                  setFilters({ phase: '', status: '', location: '', condition: '' });
                  setSearchTerm('');
                  loadTrials();
                }}
                className="w-full bg-gradient-to-r from-[#58CC02] to-[#46A302] hover:from-[#46A302] hover:to-[#58CC02] text-white font-bold py-3 px-4 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
              >
                Clear Filters
              </button>
            </div>
          </div>

          {/* Trials Grid */}
          <div className="lg:col-span-3">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#1CB0F6] mx-auto"></div>
                  <p className="mt-4 text-gray-600 font-semibold">Loading trials...</p>
                </div>
              </div>
            ) : currentTrials.length === 0 ? (
              <div className="bg-white rounded-xl shadow-lg p-12 text-center border-2 border-gray-100">
                <div className="w-20 h-20 bg-gradient-to-r from-[#1CB0F6]/20 to-[#58CC02]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">No trials found</h3>
                <p className="text-gray-600">Try adjusting your search criteria or filters</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 gap-6 mb-6">
                  {currentTrials.map((trial) => (
                    <TrialCard
                      key={trial.id}
                      trial={trial}
                      onViewDetails={handleViewDetails}
                      onToggleFavorite={handleToggleFavorite}
                      isFavorite={favorites.includes(trial.nct_id || trial.id)}
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
      </div>

      {/* Trial Details Modal */}
      {showDetailsModal && selectedTrial && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 sticky top-0 bg-white">
              <div className="flex justify-between items-start">
                <div className="flex-1 pr-4">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    {selectedTrial.title}
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1 bg-[#1CB0F6]/20 text-[#1CB0F6] rounded-full text-sm font-bold border border-[#1CB0F6]/30">
                      {selectedTrial.phase}
                    </span>
                    <span className="px-3 py-1 bg-[#58CC02]/20 text-[#58CC02] rounded-full text-sm font-bold border border-[#58CC02]/30">
                      {selectedTrial.status}
                    </span>
                    <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-bold border border-gray-200">
                      {selectedTrial.nctId}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* AI Summary */}
              <div className="bg-gradient-to-r from-[#1CB0F6]/10 to-[#58CC02]/10 rounded-xl p-4 border-2 border-[#1CB0F6]/30">
                <div className="flex items-center mb-2">
                  <div className="w-6 h-6 bg-gradient-to-r from-[#58CC02] to-[#1CB0F6] rounded-lg flex items-center justify-center mr-2">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <h3 className="font-bold text-gray-900">AI Summary</h3>
                </div>
                <p className="text-gray-700">{selectedTrial.aiSummary}</p>
              </div>

              {/* Trial Information */}
              <div>
                <h3 className="font-bold text-gray-900 mb-2">Overview</h3>
                <p className="text-gray-700">{selectedTrial.fullDescription}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-bold text-gray-900 mb-2">Location</h3>
                  <p className="text-gray-700">{selectedTrial.location}</p>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-2">Sponsor</h3>
                  <p className="text-gray-700">{selectedTrial.sponsor}</p>
                </div>
              </div>

              {/* Eligibility */}
              <div>
                <h3 className="font-bold text-gray-900 mb-2">Eligibility Criteria</h3>
                {Array.isArray(selectedTrial.eligibility) ? (
                  <ul className="space-y-2">
                    {selectedTrial.eligibility.map((criteria, index) => (
                      <li key={index} className="flex items-start text-gray-700">
                        <svg className="w-5 h-5 text-[#58CC02] mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>{criteria}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-gray-700 whitespace-pre-wrap">
                    {selectedTrial.eligibility || 'No eligibility criteria available'}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => handleContactTrial(selectedTrial)}
                  className="flex-1 bg-gradient-to-r from-[#1CB0F6] to-[#1899D6] hover:scale-105 active:scale-95 text-white font-bold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg"
                >
                  Contact Trial Coordinator
                </button>
                <a
                  href={selectedTrial.externalLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 bg-white border-2 border-gray-300 hover:border-[#1CB0F6] hover:bg-[#1CB0F6]/10 text-gray-700 font-bold py-3 px-6 rounded-xl transition-all duration-200 text-center"
                >
                  View on ClinicalTrials.gov
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Email Modal */}
      {showEmailModal && selectedTrial && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">Contact Trial Coordinator</h2>
              <p className="text-gray-600 mt-1">Send inquiry to {selectedTrial.contactEmail}</p>
            </div>

            <form onSubmit={handleSendEmail} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Subject
                  </label>
                  <input
                    type="text"
                    value={emailForm.subject}
                    onChange={(e) => setEmailForm({ ...emailForm, subject: e.target.value })}
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1CB0F6] focus:border-[#1CB0F6]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Message
                  </label>
                  <textarea
                    value={emailForm.message}
                    onChange={(e) => setEmailForm({ ...emailForm, message: e.target.value })}
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1CB0F6] focus:border-[#1CB0F6]"
                    rows="8"
                    required
                  />
                </div>
              </div>

              <div className="flex gap-4 mt-6">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-[#1CB0F6] to-[#1899D6] hover:scale-105 active:scale-95 text-white font-bold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg"
                >
                  Send Email
                </button>
                <button
                  type="button"
                  onClick={() => setShowEmailModal(false)}
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

export default ClinicalTrials;
