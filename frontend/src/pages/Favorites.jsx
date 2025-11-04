import { useState, useEffect } from 'react';
import TrialCard from '../components/TrialCard';
import ExpertCard from '../components/ExpertCard';
import PublicationCard from '../components/PublicationCard';
import { favorites as favoritesApi } from '../services/api';

const Favorites = () => {
  const [userType, setUserType] = useState('patient');
  const [activeTab, setActiveTab] = useState('trials');
  const [favoriteTrials, setFavoriteTrials] = useState([]);
  const [favoriteExperts, setFavoriteExperts] = useState([]);
  const [favoritePublications, setFavoritePublications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const type = localStorage.getItem('userType');
    setUserType(type);
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      // Load all favorites from backend
      const response = await favoritesApi.getAll();
      const allFavorites = response.data;

      // Separate by type and extract details
      const trials = allFavorites
        .filter(fav => fav.item_type === 'trial' && fav.details)
        .map(fav => ({ ...fav.details, item_type: fav.item_type, item_id: fav.item_id, favoriteId: fav.id }));

      const experts = allFavorites
        .filter(fav => (fav.item_type === 'expert' || fav.item_type === 'researcher') && fav.details)
        .map(fav => ({ ...fav.details, item_type: fav.item_type, item_id: fav.item_id, favoriteId: fav.id }));

      const publications = allFavorites
        .filter(fav => fav.item_type === 'publication' && fav.details)
        .map(fav => ({ ...fav.details, item_type: fav.item_type, item_id: fav.item_id, favoriteId: fav.id }));

      setFavoriteTrials(trials);
      setFavoriteExperts(experts);
      setFavoritePublications(publications);
      setLoading(false);
    } catch (error) {
      console.error('Error loading favorites:', error);
      setFavoriteTrials([]);
      setFavoriteExperts([]);
      setFavoritePublications([]);
      setLoading(false);
    }
  };

  const handleRemoveTrial = async (trial) => {
    try {
      await favoritesApi.remove(trial.item_type, trial.item_id);
      setFavoriteTrials(prev => prev.filter(item => item.favoriteId !== trial.favoriteId));
    } catch (error) {
      console.error('Error removing trial from favorites:', error);
    }
  };

  const handleRemoveExpert = async (expert) => {
    try {
      await favoritesApi.remove(expert.item_type, expert.item_id);
      setFavoriteExperts(prev => prev.filter(item => item.favoriteId !== expert.favoriteId));
    } catch (error) {
      console.error('Error removing expert from favorites:', error);
    }
  };

  const handleRemovePublication = async (publication) => {
    try {
      await favoritesApi.remove(publication.item_type, publication.item_id);
      setFavoritePublications(prev => prev.filter(item => item.favoriteId !== publication.favoriteId));
    } catch (error) {
      console.error('Error removing publication from favorites:', error);
    }
  };

  const tabs = [
    { id: 'trials', label: 'Clinical Trials', icon: '🔬', count: favoriteTrials.length },
    { id: 'publications', label: 'Publications', icon: '📚', count: favoritePublications.length },
    {
      id: 'experts',
      label: userType === 'patient' ? 'Health Experts' : 'Collaborators',
      icon: userType === 'patient' ? '👨‍⚕️' : '👥',
      count: favoriteExperts.length
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">My Favorites</h1>
          <p className="text-gray-600 text-lg">
            Items you've saved for quick access
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
                    ? userType === 'patient'
                      ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg'
                      : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg'
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border-2 border-gray-200'
                }`}
              >
                <span className="text-xl">{tab.icon}</span>
                <span>{tab.label}</span>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                  activeTab === tab.id
                    ? userType === 'patient'
                      ? 'bg-white text-green-600'
                      : 'bg-white text-blue-600'
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
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-green-500 mx-auto"></div>
              <p className="mt-4 text-gray-600 font-semibold">Loading favorites...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Clinical Trials Tab */}
            {activeTab === 'trials' && (
              <div>
                {favoriteTrials.length === 0 ? (
                  <div className="bg-white rounded-2xl shadow-md border-2 border-gray-100 p-12 text-center">
                    <div className="text-6xl mb-4">🔬</div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-2">
                      No favorite trials yet
                    </h3>
                    <p className="text-gray-600 mb-6">
                      Start exploring clinical trials and save the ones that interest you
                    </p>
                    <a
                      href="/patient/trials"
                      className="inline-block bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-3 px-8 rounded-xl transition-all transform hover:scale-105 shadow-lg"
                    >
                      Browse Clinical Trials
                    </a>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-6">
                    {favoriteTrials.map((trial) => (
                      <div key={trial.favoriteId || trial.id} className="relative">
                        <button
                          onClick={() => handleRemoveTrial(trial)}
                          className="absolute top-4 right-4 z-10 bg-red-500 hover:bg-red-600 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold transition-all transform hover:scale-110 shadow-md"
                          title="Remove from favorites"
                        >
                          ×
                        </button>
                        <TrialCard
                          trial={trial}
                          onViewDetails={() => {}}
                          onToggleFavorite={handleRemoveTrial}
                          isFavorite={true}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Publications Tab */}
            {activeTab === 'publications' && (
              <div>
                {favoritePublications.length === 0 ? (
                  <div className="bg-white rounded-2xl shadow-md border-2 border-gray-100 p-12 text-center">
                    <div className="text-6xl mb-4">📚</div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-2">
                      No saved publications yet
                    </h3>
                    <p className="text-gray-600 mb-6">
                      Discover research publications and save the ones you want to read later
                    </p>
                    <a
                      href="/patient/publications"
                      className="inline-block bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold py-3 px-8 rounded-xl transition-all transform hover:scale-105 shadow-lg"
                    >
                      Browse Publications
                    </a>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {favoritePublications.map((publication) => (
                      <div key={publication.favoriteId || publication.id} className="relative">
                        <button
                          onClick={() => handleRemovePublication(publication)}
                          className="absolute top-4 right-4 z-10 bg-red-500 hover:bg-red-600 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold transition-all transform hover:scale-110 shadow-md"
                          title="Remove from saved"
                        >
                          ×
                        </button>
                        <PublicationCard
                          publication={publication}
                          onToggleSave={handleRemovePublication}
                          isSaved={true}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Experts/Collaborators Tab */}
            {activeTab === 'experts' && (
              <div>
                {favoriteExperts.length === 0 ? (
                  <div className="bg-white rounded-2xl shadow-md border-2 border-gray-100 p-12 text-center">
                    <div className="text-6xl mb-4">
                      {userType === 'patient' ? '👨‍⚕️' : '👥'}
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-2">
                      No {userType === 'patient' ? 'followed experts' : 'saved collaborators'} yet
                    </h3>
                    <p className="text-gray-600 mb-6">
                      {userType === 'patient'
                        ? 'Find and follow health experts to stay connected'
                        : 'Connect with researchers and save potential collaborators'}
                    </p>
                    <a
                      href={userType === 'patient' ? '/patient/experts' : '/researcher/collaborators'}
                      className={`inline-block ${
                        userType === 'patient'
                          ? 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700'
                          : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700'
                      } text-white font-bold py-3 px-8 rounded-xl transition-all transform hover:scale-105 shadow-lg`}
                    >
                      {userType === 'patient' ? 'Find Health Experts' : 'Find Collaborators'}
                    </a>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {favoriteExperts.map((expert) => (
                      <div key={expert.favoriteId || expert.id} className="relative">
                        <button
                          onClick={() => handleRemoveExpert(expert)}
                          className="absolute top-4 right-4 z-10 bg-red-500 hover:bg-red-600 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold transition-all transform hover:scale-110 shadow-md"
                          title="Remove from favorites"
                        >
                          ×
                        </button>
                        <ExpertCard
                          expert={expert}
                          onRequestMeeting={() => {}}
                          onToggleFollow={handleRemoveExpert}
                          isFollowing={true}
                          userType={userType}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Favorites;
