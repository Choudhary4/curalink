import { useState } from 'react';

const ExpertCard = ({ expert, onRequestMeeting, onToggleFollow, isFollowing = false, userType = 'patient' }) => {
  const renderStars = (rating) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    return '⭐'.repeat(fullStars) + (hasHalfStar ? '½' : '');
  };

  return (
    <div className="card-hover group animate-fade-in-up">
      {/* Header Section */}
      <div className="flex items-start mb-5">
        {/* Avatar */}
        <div className="w-20 h-20 bg-gradient-to-br from-primary-400 via-accent-400 to-accent-600 rounded-2xl flex items-center justify-center text-white text-3xl font-bold mr-4 shadow-duo group-hover:scale-110 transition-transform duration-300 flex-shrink-0">
          {expert.name.charAt(0).toUpperCase()}
        </div>

        {/* Name and Specialty */}
        <div className="flex-1 min-w-0">
          <h3 className="text-xl font-heading font-bold text-gray-900 group-hover:text-primary-600 transition-colors truncate">
            {expert.name}
          </h3>
          <p className="text-sm text-primary-600 font-bold uppercase tracking-wide mt-1">
            {expert.specialty}
          </p>
          {(expert.rating || expert.reviewCount) && (
            <div className="flex items-center mt-2">
              <span className="text-yellow-500 text-base">{renderStars(expert.rating || 5)}</span>
              {expert.reviewCount && (
                <span className="text-gray-600 text-xs ml-2 font-medium">
                  ({expert.reviewCount} reviews)
                </span>
              )}
            </div>
          )}
        </div>

        {/* Follow Button */}
        <button
          onClick={() => onToggleFollow(expert.id)}
          className="flex-shrink-0 text-3xl transition-all duration-200 hover:scale-125 transform ml-2"
          aria-label={isFollowing ? 'Unfollow' : 'Follow'}
        >
          {isFollowing ? '⭐' : <span className="hover:opacity-70">⭐</span>}
        </button>
      </div>

      {/* Info Section */}
      <div className="space-y-2.5 mb-4">
        {expert.location && (
          <div className="flex items-start text-sm text-gray-700">
            <span className="mr-3 text-lg flex-shrink-0">📍</span>
            <span className="font-medium">{expert.location}</span>
          </div>
        )}
        {expert.institution && (
          <div className="flex items-start text-sm text-gray-700">
            <span className="mr-3 text-lg flex-shrink-0">🏥</span>
            <span className="font-medium">{expert.institution}</span>
          </div>
        )}
        {expert.experience && (
          <div className="flex items-start text-sm text-gray-700">
            <span className="mr-3 text-lg flex-shrink-0">📅</span>
            <span className="font-medium">{expert.experience} years experience</span>
          </div>
        )}
      </div>

      {/* Specializations */}
      {expert.specializations && expert.specializations.length > 0 && (
        <div className="mb-4">
          <div className="flex flex-wrap gap-2">
            {expert.specializations.slice(0, 3).map((spec, index) => (
              <span
                key={index}
                className="badge bg-primary-100 text-primary-700 border-2 border-primary-200"
              >
                {spec}
              </span>
            ))}
            {expert.specializations.length > 3 && (
              <span className="badge bg-gray-100 text-gray-700 border-2 border-gray-200">
                +{expert.specializations.length - 3} more
              </span>
            )}
          </div>
        </div>
      )}

      {/* Availability Badge */}
      {expert.availability && (
        <div className="mb-4 p-3 bg-gradient-to-r from-primary-50 to-primary-100 rounded-xl border-2 border-primary-300 animate-pulse-slow">
          <div className="flex items-center">
            <div className="w-2 h-2 bg-primary-500 rounded-full mr-2 animate-pulse"></div>
            <p className="text-sm text-primary-700 font-bold">Available for consultations</p>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2.5">
        <button
          onClick={() => onRequestMeeting(expert)}
          className={`flex-1 ${userType === 'patient' ? 'btn-primary' : 'btn-secondary'} text-sm`}
        >
          {userType === 'patient' ? 'Request Meeting' : 'Connect'}
        </button>
        <button className="flex-1 py-3 px-4 border-2 border-gray-300 hover:border-primary-500 rounded-xl font-bold text-gray-700 hover:text-primary-600 transition-all duration-200 hover:scale-105 active:scale-95 text-sm">
          View Profile
        </button>
      </div>
    </div>
  );
};

export default ExpertCard;
