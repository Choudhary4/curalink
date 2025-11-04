import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ai } from '../services/api';

const PublicationDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [publication, setPublication] = useState(null);
  const [simplified, setSimplified] = useState(null);
  const [simplifying, setSimplifying] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get publication from sessionStorage (passed from Publications page)
    const storedPub = sessionStorage.getItem(`publication_${id}`);
    if (storedPub) {
      setPublication(JSON.parse(storedPub));
      setLoading(false);
    } else {
      // If not in storage, redirect back to publications
      navigate('/patient/publications');
    }
  }, [id, navigate]);

  const handleSimplify = async () => {
    if (simplified) {
      setSimplified(null);
      return;
    }

    setSimplifying(true);
    try {
      const response = await ai.simplifyAbstract({
        title: publication.title,
        abstract: publication.abstract
      });
      setSimplified(response.data.simplified);
    } catch (error) {
      console.error('Error simplifying abstract:', error);
      alert('Unable to simplify. Please try again later.');
    } finally {
      setSimplifying(false);
    }
  };

  if (loading || !publication) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="spinner mx-auto mb-4"></div>
          <p className="text-gray-600">Loading publication...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Link
          to="/patient/publications"
          className="inline-flex items-center text-[#1CB0F6] hover:text-[#1899D6] font-bold mb-6 transition-colors"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Publications
        </Link>

        {/* Main Content Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6 animate-fade-in-up border-2 border-gray-100">
          {/* Title */}
          <h1 className="text-4xl font-heading font-bold text-gray-900 mb-6 leading-tight">
            {publication.title}
          </h1>

          {/* Authors */}
          {publication.authors && (
            <div className="mb-6">
              <p className="text-lg text-gray-700">
                <span className="font-bold text-gray-900">Authors:</span> {publication.authors}
              </p>
            </div>
          )}

          {/* Metadata Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {publication.journal && (
              <div className="flex items-start p-4 bg-gradient-to-br from-[#1CB0F6]/10 to-[#1CB0F6]/5 rounded-xl border-2 border-[#1CB0F6]/30">
                <div className="flex-shrink-0 w-10 h-10 bg-[#1CB0F6] rounded-lg flex items-center justify-center mr-3">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs font-bold text-[#1CB0F6] uppercase tracking-wide mb-1">Journal</p>
                  <p className="text-sm font-semibold text-gray-800">{publication.journal}</p>
                </div>
              </div>
            )}
            {(publication.publication_date || publication.year) && (
              <div className="flex items-start p-4 bg-gradient-to-br from-[#58CC02]/10 to-[#58CC02]/5 rounded-xl border-2 border-[#58CC02]/30">
                <div className="flex-shrink-0 w-10 h-10 bg-[#58CC02] rounded-lg flex items-center justify-center mr-3">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs font-bold text-[#58CC02] uppercase tracking-wide mb-1">Published</p>
                  <p className="text-sm font-semibold text-gray-800">{publication.publication_date || publication.year}</p>
                </div>
              </div>
            )}
            {publication.pubmed_id && (
              <div className="flex items-start p-4 bg-gradient-to-br from-[#1CB0F6]/10 to-[#58CC02]/10 rounded-xl border-2 border-[#1CB0F6]/30">
                <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-r from-[#1CB0F6] to-[#58CC02] rounded-lg flex items-center justify-center mr-3">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs font-bold text-[#1CB0F6] uppercase tracking-wide mb-1">PubMed ID</p>
                  <p className="text-sm font-mono font-semibold text-gray-800">{publication.pubmed_id}</p>
                </div>
              </div>
            )}
            {publication.doi && (
              <div className="flex items-start p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border-2 border-gray-300">
                <div className="flex-shrink-0 w-10 h-10 bg-gray-600 rounded-lg flex items-center justify-center mr-3">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-1">DOI</p>
                  <p className="text-sm font-mono font-semibold text-gray-800 break-all">{publication.doi}</p>
                </div>
              </div>
            )}
            {publication.citations && (
              <div className="flex items-start p-4 bg-gradient-to-br from-[#58CC02]/10 to-[#58CC02]/5 rounded-xl border-2 border-[#58CC02]/30">
                <div className="flex-shrink-0 w-10 h-10 bg-[#58CC02] rounded-lg flex items-center justify-center mr-3">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs font-bold text-[#58CC02] uppercase tracking-wide mb-1">Citations</p>
                  <p className="text-sm font-semibold text-gray-800">{publication.citations}</p>
                </div>
              </div>
            )}
          </div>

          {/* Topics/Keywords */}
          {publication.topics && publication.topics.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-heading font-bold text-gray-900 mb-3">Topics</h2>
              <div className="flex flex-wrap gap-2">
                {publication.topics.map((topic, index) => (
                  <span
                    key={index}
                    className="px-4 py-2 bg-gradient-to-r from-[#1CB0F6] to-[#58CC02] text-white font-bold rounded-full text-sm"
                  >
                    {topic}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Abstract */}
          {publication.abstract && publication.abstract !== 'No abstract available' && (
            <div className="mb-8">
              <h2 className="text-2xl font-heading font-bold text-gray-900 mb-4">Abstract</h2>
              <div className="p-6 bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl border-2 border-[#1CB0F6]/20">
                <p className="text-gray-800 leading-relaxed text-lg whitespace-pre-line">
                  {publication.abstract}
                </p>
              </div>
            </div>
          )}

          {/* Simplified Version */}
          {simplified && (
            <div className="mb-8 animate-fade-in">
              <h2 className="text-2xl font-heading font-bold text-gray-900 mb-4">Simple Explanation</h2>
              <div className="p-6 bg-gradient-to-r from-[#58CC02]/10 to-[#1CB0F6]/10 rounded-xl border-2 border-[#58CC02]">
                <div className="flex items-center mb-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-[#58CC02] to-[#1CB0F6] rounded-lg flex items-center justify-center mr-3">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <p className="text-sm font-bold text-[#58CC02] uppercase tracking-wide">AI-Simplified</p>
                </div>
                <p className="text-gray-800 leading-relaxed text-lg">{simplified}</p>
              </div>
            </div>
          )}

          {/* AI Summary if available */}
          {publication.aiSummary && (
            <div className="mb-8">
              <h2 className="text-2xl font-heading font-bold text-gray-900 mb-4">AI Summary</h2>
              <div className="p-6 bg-gradient-to-r from-[#1CB0F6]/10 to-[#58CC02]/10 rounded-xl border-2 border-[#1CB0F6]">
                <div className="flex items-center mb-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-[#1CB0F6] to-[#58CC02] rounded-lg flex items-center justify-center mr-3">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <p className="text-sm font-bold text-[#1CB0F6] uppercase tracking-wide">Key Insights</p>
                </div>
                <p className="text-gray-800 leading-relaxed text-lg">{publication.aiSummary}</p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            {publication.abstract && publication.abstract !== 'No abstract available' && (
              <button
                onClick={handleSimplify}
                disabled={simplifying}
                className="flex-1 py-4 px-6 bg-gradient-to-r from-[#58CC02] to-[#46A302] hover:from-[#46A302] hover:to-[#58CC02] text-white font-bold rounded-xl transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg text-lg"
              >
                {simplifying ? (
                  <span className="flex items-center justify-center">
                    <div className="spinner mr-2"></div>
                    Simplifying...
                  </span>
                ) : simplified ? (
                  'Hide Simple Version'
                ) : (
                  'Simplify for Me'
                )}
              </button>
            )}
            <a
              href={publication.url || publication.link || `https://pubmed.ncbi.nlm.nih.gov/${publication.pubmed_id}/`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-4 px-6 bg-gradient-to-r from-[#1CB0F6] to-[#1899D6] hover:from-[#1899D6] hover:to-[#1CB0F6] text-white font-bold rounded-xl transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg text-center text-lg"
            >
              View on PubMed
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicationDetail;
