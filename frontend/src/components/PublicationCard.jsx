import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ai } from '../services/api';

const PublicationCard = ({ publication, onToggleSave, isSaved = false }) => {
  const navigate = useNavigate();
  const [showFullAbstract, setShowFullAbstract] = useState(false);
  const [simplified, setSimplified] = useState(null);
  const [simplifying, setSimplifying] = useState(false);

  const handleViewFullPaper = () => {
    // Store publication data in sessionStorage for the detail page
    sessionStorage.setItem(`publication_${publication.id}`, JSON.stringify(publication));
    // Navigate to the detail page
    navigate(`/publication/${publication.id}`);
  };

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

  return (
    <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border-2 border-gray-100 hover:border-[#1CB0F6]/30 group animate-fade-in-up">
      {/* Header with Title and Save Button */}
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xl font-heading font-bold text-gray-900 flex-1 pr-2 group-hover:text-[#1CB0F6] transition-colors leading-snug">
          {publication.title}
        </h3>
        <button
          onClick={() => onToggleSave(publication.pubmed_id || publication.id)}
          className="flex-shrink-0 transition-all duration-200 hover:scale-110 transform"
          aria-label={isSaved ? 'Unsave' : 'Save'}
        >
          {isSaved ? (
            <svg className="w-7 h-7 text-[#FFC800]" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
            </svg>
          ) : (
            <svg className="w-7 h-7 text-gray-400 hover:text-[#FFC800]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
          )}
        </button>
      </div>

      {/* Authors */}
      {publication.authors && (
        <p className="text-sm text-gray-600 mb-3">
          <span className="font-bold">By:</span> {publication.authors}
        </p>
      )}

      {/* Metadata */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-4">
        {publication.journal && (
          <div className="flex items-center text-sm text-gray-700">
            <div className="w-5 h-5 bg-[#1CB0F6] rounded flex items-center justify-center mr-2">
              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <span className="font-medium">{publication.journal}</span>
          </div>
        )}
        {(publication.publication_date || publication.year) && (
          <div className="flex items-center text-sm text-gray-700">
            <div className="w-5 h-5 bg-[#58CC02] rounded flex items-center justify-center mr-2">
              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <span className="font-medium">{publication.publication_date || publication.year}</span>
          </div>
        )}
        {publication.pubmed_id && (
          <div className="flex items-center text-sm text-gray-700">
            <div className="w-5 h-5 bg-gradient-to-r from-[#1CB0F6] to-[#58CC02] rounded flex items-center justify-center mr-2">
              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <span className="font-mono font-medium text-xs">{publication.pubmed_id}</span>
          </div>
        )}
        {publication.citations && (
          <div className="flex items-center text-sm text-gray-700">
            <div className="w-5 h-5 bg-[#58CC02] rounded flex items-center justify-center mr-2">
              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <span className="font-medium">{publication.citations} citations</span>
          </div>
        )}
      </div>

      {/* Topics/Keywords */}
      {publication.topics && publication.topics.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {publication.topics.map((topic, index) => (
            <span
              key={index}
              className="px-3 py-1 bg-gradient-to-r from-[#1CB0F6] to-[#58CC02] text-white font-bold rounded-full text-xs"
            >
              {topic}
            </span>
          ))}
        </div>
      )}

      {/* Abstract */}
      {publication.abstract && (
        <div className="mb-4">
          <p className="text-sm text-gray-700 leading-relaxed">
            <span className="font-bold">Abstract: </span>
            {showFullAbstract
              ? publication.abstract
              : `${publication.abstract.substring(0, 250)}${publication.abstract.length > 250 ? '...' : ''}`}
          </p>
          {publication.abstract.length > 250 && (
            <button
              onClick={() => setShowFullAbstract(!showFullAbstract)}
              className="text-sm text-[#1CB0F6] hover:text-[#1899D6] font-bold mt-2 transition-colors"
            >
              {showFullAbstract ? 'Show Less' : 'Read More'}
            </button>
          )}
        </div>
      )}

      {/* Simplified Version */}
      {simplified && (
        <div className="mb-4 p-4 bg-gradient-to-r from-[#58CC02]/10 to-[#1CB0F6]/10 rounded-xl border-2 border-[#58CC02] animate-fade-in">
          <div className="flex items-center mb-2">
            <div className="w-6 h-6 bg-gradient-to-r from-[#58CC02] to-[#1CB0F6] rounded-lg flex items-center justify-center mr-2">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <p className="text-xs font-bold text-[#58CC02] uppercase tracking-wide">Simple Explanation</p>
          </div>
          <p className="text-sm text-gray-800 leading-relaxed">{simplified}</p>
        </div>
      )}

      {/* AI Summary if available */}
      {publication.aiSummary && (
        <div className="mb-4 p-4 bg-gradient-to-r from-[#1CB0F6]/10 to-[#58CC02]/10 rounded-xl border-2 border-[#1CB0F6]">
          <div className="flex items-center mb-2">
            <div className="w-6 h-6 bg-gradient-to-r from-[#1CB0F6] to-[#58CC02] rounded-lg flex items-center justify-center mr-2">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <p className="text-xs font-bold text-[#1CB0F6] uppercase tracking-wide">AI Summary</p>
          </div>
          <p className="text-sm text-gray-800 leading-relaxed">{publication.aiSummary}</p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col gap-2.5">
        {publication.abstract && (
          <button
            onClick={handleSimplify}
            disabled={simplifying}
            className="w-full py-3 px-4 bg-gradient-to-r from-[#58CC02] to-[#46A302] hover:from-[#46A302] hover:to-[#58CC02] text-white font-bold rounded-xl transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed border-2 border-[#58CC02]/20"
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

        <div className="flex gap-2.5">
          {(publication.url || publication.link) && (
            <button
              onClick={handleViewFullPaper}
              className="flex-1 py-3 px-4 bg-[#1CB0F6] hover:bg-[#1899D6] text-white font-bold rounded-xl transition-all duration-200 hover:scale-105 active:scale-95 text-sm text-center"
            >
              View Full Paper
            </button>
          )}
          {publication.doi && (
            <a
              href={`https://doi.org/${publication.doi}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-3 px-4 border-2 border-[#1CB0F6] hover:border-[#58CC02] hover:bg-[#58CC02]/10 rounded-xl font-bold text-[#1CB0F6] hover:text-[#58CC02] transition-all duration-200 hover:scale-105 active:scale-95 text-sm text-center"
            >
              DOI
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default PublicationCard;
