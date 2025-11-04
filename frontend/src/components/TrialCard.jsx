import { useState } from 'react';
import { ai } from '../services/api';

const TrialCard = ({ trial, onViewDetails, onToggleFavorite, isFavorite = false }) => {
  const [simplified, setSimplified] = useState(null);
  const [simplifying, setSimplifying] = useState(false);

  const getPhaseColor = (phase) => {
    const colors = {
      'Phase 1': 'bg-[#1CB0F6]/20 text-[#1CB0F6] border-[#1CB0F6]/30',
      'Phase 2': 'bg-[#58CC02]/20 text-[#58CC02] border-[#58CC02]/30',
      'Phase 3': 'bg-[#FFC800]/20 text-[#FFC800] border-[#FFC800]/30',
      'Phase 4': 'bg-[#1CB0F6]/20 text-[#1CB0F6] border-[#1CB0F6]/30',
    };
    return colors[phase] || 'bg-gray-100 text-gray-700 border-gray-300';
  };

  const getStatusColor = (status) => {
    if (!status) return 'bg-gray-100 text-gray-700 border-gray-300';
    const upperStatus = status.toUpperCase();
    const colors = {
      'RECRUITING': 'bg-[#58CC02]/20 text-[#58CC02] border-[#58CC02]/30',
      'NOT_YET_RECRUITING': 'bg-[#FFC800]/20 text-[#FFC800] border-[#FFC800]/30',
      'ACTIVE': 'bg-[#1CB0F6]/20 text-[#1CB0F6] border-[#1CB0F6]/30',
      'COMPLETED': 'bg-gray-100 text-gray-700 border-gray-300',
      'SUSPENDED': 'bg-red-100 text-red-700 border-red-300',
      'TERMINATED': 'bg-red-100 text-red-700 border-red-300',
      'WITHDRAWN': 'bg-orange-100 text-orange-700 border-orange-300',
    };
    return colors[upperStatus] || 'bg-gray-100 text-gray-700 border-gray-300';
  };

  const handleSimplify = async () => {
    if (simplified) {
      setSimplified(null);
      return;
    }

    setSimplifying(true);
    try {
      const response = await ai.simplifyTrial({
        title: trial.title,
        description: trial.description,
        phase: trial.phase,
        eligibility: trial.eligibility
      });
      setSimplified(response.data.simplified);
    } catch (error) {
      console.error('Error simplifying trial:', error);
      alert('Unable to simplify. Please try again later.');
    } finally {
      setSimplifying(false);
    }
  };

  return (
    <div className="card-hover group animate-fade-in-up">
      {/* Header with Title and Favorite */}
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xl font-heading font-bold text-gray-900 flex-1 pr-2 group-hover:text-[#1CB0F6] transition-colors">
          {trial.title}
        </h3>
        <button
          onClick={() => onToggleFavorite(trial.nct_id || trial.id)}
          className="flex-shrink-0 transition-all duration-200 hover:scale-125 transform"
          aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          <svg className={`w-7 h-7 ${isFavorite ? 'text-[#FFC800] fill-current' : 'text-gray-400'}`} fill={isFavorite ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
          </svg>
        </button>
      </div>

      {/* Badges */}
      <div className="flex flex-wrap gap-2 mb-4">
        {trial.phase && (
          <span className={`badge border-2 ${getPhaseColor(trial.phase)}`}>
            {trial.phase}
          </span>
        )}
        {trial.status && (
          <span className={`badge border-2 ${getStatusColor(trial.status)}`}>
            {trial.status.replace(/_/g, ' ')}
          </span>
        )}
      </div>

      {/* Info Grid */}
      <div className="space-y-2.5 mb-4">
        {(trial.location || (Array.isArray(trial.locations) && trial.locations.length > 0)) && (
          <div className="flex items-start text-sm text-gray-700">
            <svg className="w-5 h-5 text-[#1CB0F6] mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="font-medium">
              {Array.isArray(trial.locations)
                ? trial.locations.slice(0, 2).join(', ') + (trial.locations.length > 2 ? ` +${trial.locations.length - 2} more` : '')
                : trial.location}
            </span>
          </div>
        )}
        {trial.sponsor && (
          <div className="flex items-start text-sm text-gray-700">
            <svg className="w-5 h-5 text-[#58CC02] mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <span className="font-medium">{trial.sponsor}</span>
          </div>
        )}
        {(trial.conditions || trial.condition) && (
          <div className="flex items-start text-sm text-gray-700">
            <svg className="w-5 h-5 text-[#1CB0F6] mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className="font-medium">{trial.conditions || trial.condition}</span>
          </div>
        )}
        {trial.nct_id && (
          <div className="flex items-start text-sm text-gray-700">
            <svg className="w-5 h-5 text-[#58CC02] mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
            <span className="font-mono font-medium">{trial.nct_id}</span>
          </div>
        )}
      </div>

      {/* Description */}
      <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-3">
        {trial.description}
      </p>

      {/* Simplified Version */}
      {simplified && (
        <div className="mb-4 p-4 bg-gradient-to-r from-[#1CB0F6]/10 to-[#58CC02]/10 rounded-2xl border-2 border-[#1CB0F6]/30 animate-fade-in">
          <div className="flex items-center mb-2">
            <div className="w-6 h-6 bg-gradient-to-r from-[#58CC02] to-[#1CB0F6] rounded-lg flex items-center justify-center mr-2">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <p className="text-xs font-bold text-gray-900 uppercase tracking-wide">Simple Explanation</p>
          </div>
          <p className="text-sm text-gray-800 leading-relaxed">{simplified}</p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col gap-2.5">
        <button
          onClick={handleSimplify}
          disabled={simplifying}
          className="w-full py-3 px-4 bg-gradient-to-r from-[#58CC02]/20 to-[#1CB0F6]/20 hover:from-[#58CC02]/30 hover:to-[#1CB0F6]/30 text-gray-900 font-bold rounded-xl transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed border-2 border-[#1CB0F6]/30"
        >
          {simplifying ? (
            <span className="flex items-center justify-center">
              <div className="w-4 h-4 border-2 border-[#1CB0F6] border-t-transparent rounded-full animate-spin mr-2"></div>
              Simplifying...
            </span>
          ) : simplified ? (
            <span className="flex items-center justify-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
              </svg>
              Hide Simple Version
            </span>
          ) : (
            <span className="flex items-center justify-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              Simplify for Me
            </span>
          )}
        </button>

        <div className="flex gap-2.5">
          <button
            onClick={() => onViewDetails(trial)}
            className="flex-1 bg-gradient-to-r from-[#1CB0F6] to-[#1899D6] hover:scale-105 active:scale-95 text-white font-bold py-3 px-4 rounded-xl transition-all duration-200 shadow-lg text-sm"
          >
            View Details
          </button>
          {(trial.url || trial.externalLink) && (
            <a
              href={trial.url || trial.externalLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center bg-white border-2 border-gray-300 hover:border-[#1CB0F6] hover:bg-[#1CB0F6]/10 text-gray-700 font-bold py-3 px-4 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
              aria-label="View external link"
            >
              <svg className="w-5 h-5 text-[#1CB0F6]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default TrialCard;
