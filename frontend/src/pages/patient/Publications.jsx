import { useState, useEffect } from 'react';
import PublicationCard from '../../components/PublicationCard';
import { publications as publicationsApi, favorites as favoritesApi, ai } from '../../services/api';

const Publications = () => {
  const [publications, setPublications] = useState([]);
  const [filteredPublications, setFilteredPublications] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    year: '',
    journal: '',
  });
  const [savedPublications, setSavedPublications] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [useSmartSearch, setUseSmartSearch] = useState(false);
  const publicationsPerPage = 6;

  useEffect(() => {
    loadPublications();
    loadSavedPublications();
  }, []);

  useEffect(() => {
    filterPublications();
  }, [publications, searchTerm, filters]);

  const loadPublications = async () => {
    try {
      // Use live PubMed API with default search term
      const response = await publicationsApi.getAll({
        search: 'cancer OR diabetes OR cardiovascular',
        useLive: true
      });
      setPublications(response.data);
      setFilteredPublications(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error loading publications:', error);
      setLoading(false);
      setPublications([]);
      setFilteredPublications([]);
    }
  };

  const loadSavedPublications = async () => {
    try {
      const response = await favoritesApi.getAll();
      const pubFavorites = response.data
        .filter(fav => fav.item_type === 'publication')
        .map(fav => fav.item_id);
      setSavedPublications(pubFavorites);
    } catch (error) {
      console.error('Error loading saved publications:', error);
      setSavedPublications([]);
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      loadPublications();
      return;
    }

    setLoading(true);
    try {
      let searchQuery = searchTerm;

      // Use AI to extract keywords if Smart Search is enabled
      if (useSmartSearch) {
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

      // Use live PubMed search with optimized query
      const response = await publicationsApi.getAll({
        search: searchQuery,
        useLive: true
      });
      setPublications(response.data);
      setFilteredPublications(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error searching publications:', error);
      setLoading(false);
    }
  };

  const filterPublications = () => {
    let filtered = publications;

    // Apply year filter
    if (filters.year) {
      filtered = filtered.filter((pub) => {
        const pubYear = pub.publication_date || pub.year;
        return pubYear && pubYear.toString().includes(filters.year);
      });
    }

    // Apply journal filter
    if (filters.journal) {
      filtered = filtered.filter((pub) =>
        pub.journal && pub.journal.toLowerCase().includes(filters.journal.toLowerCase())
      );
    }

    setFilteredPublications(filtered);
    setCurrentPage(1);
  };

  const handleToggleSave = async (publicationId) => {
    try {
      if (savedPublications.includes(publicationId)) {
        await favoritesApi.remove('publication', publicationId);
        setSavedPublications(savedPublications.filter((id) => id !== publicationId));
      } else {
        await favoritesApi.add({
          item_type: 'publication',
          item_id: publicationId
        });
        setSavedPublications([...savedPublications, publicationId]);
      }
    } catch (error) {
      console.error('Error toggling save:', error);
    }
  };

  // Extract years from publication_date field (PubMed format)
  const uniqueYears = [...new Set(publications.map(p => {
    const date = p.publication_date || p.year;
    if (!date) return null;
    const year = date.toString().match(/\d{4}/)?.[0];
    return year;
  }).filter(Boolean))].sort((a, b) => b - a);

  const uniqueJournals = [...new Set(publications.map(p => p.journal).filter(Boolean))].sort();

  // Pagination
  const indexOfLastPublication = currentPage * publicationsPerPage;
  const indexOfFirstPublication = indexOfLastPublication - publicationsPerPage;
  const currentPublications = filteredPublications.slice(indexOfFirstPublication, indexOfLastPublication);
  const totalPages = Math.ceil(filteredPublications.length / publicationsPerPage);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Research Publications</h1>
          <p className="text-gray-600 text-lg">
            Explore the latest medical research and clinical studies
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
                  placeholder={useSmartSearch ? "Try: 'What are new treatments for my lung cancer?'" : "Search by title, authors, keywords, or topics..."}
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

              {/* Year Filter */}
              <div className="mb-6">
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Publication Year
                </label>
                <select
                  value={filters.year}
                  onChange={(e) => setFilters({ ...filters, year: e.target.value })}
                  className="w-full px-3 py-2 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1CB0F6] focus:border-[#1CB0F6]"
                >
                  <option value="">All Years</option>
                  {uniqueYears.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>

              {/* Journal Filter */}
              <div className="mb-6">
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Journal
                </label>
                <select
                  value={filters.journal}
                  onChange={(e) => setFilters({ ...filters, journal: e.target.value })}
                  className="w-full px-3 py-2 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1CB0F6] focus:border-[#1CB0F6]"
                >
                  <option value="">All Journals</option>
                  {uniqueJournals.map((journal) => (
                    <option key={journal} value={journal}>
                      {journal}
                    </option>
                  ))}
                </select>
              </div>

              {/* Clear Filters */}
              <button
                onClick={() => {
                  setFilters({ year: '', journal: '' });
                  setSearchTerm('');
                  loadPublications();
                }}
                className="w-full bg-gradient-to-r from-[#58CC02] to-[#46A302] hover:from-[#46A302] hover:to-[#58CC02] text-white font-bold py-3 px-4 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
              >
                Clear Filters
              </button>
            </div>
          </div>

          {/* Publications Grid */}
          <div className="lg:col-span-3">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#1CB0F6] mx-auto"></div>
                  <p className="mt-4 text-gray-600 font-semibold">Loading publications...</p>
                </div>
              </div>
            ) : currentPublications.length === 0 ? (
              <div className="bg-white rounded-xl shadow-lg p-12 text-center border-2 border-gray-100">
                <div className="w-20 h-20 bg-gradient-to-r from-[#1CB0F6]/20 to-[#58CC02]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">No publications found</h3>
                <p className="text-gray-600">Try adjusting your search criteria or filters</p>
              </div>
            ) : (
              <>
                <div className="space-y-6 mb-6">
                  {currentPublications.map((publication) => (
                    <PublicationCard
                      key={publication.id}
                      publication={publication}
                      onToggleSave={handleToggleSave}
                      isSaved={savedPublications.includes(publication.id)}
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
    </div>
  );
};

export default Publications;
