import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, researchers } from '../../services/api';

const ResearcherOnboarding = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    specialties: [],
    researchInterests: [],
    institution: '',
    orcid: '',
    researchGate: '',
    availableForMeetings: false
  });

  const commonSpecialties = ['Oncology', 'Neurology', 'Immunology', 'Cardiology', 'Genetics', 'Pharmacology'];
  const commonInterests = ['Immunotherapy', 'Clinical AI', 'Gene Therapy', 'Drug Development', 'Clinical Trials', 'Precision Medicine'];

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const toggleSpecialty = (specialty) => {
    setFormData(prev => ({
      ...prev,
      specialties: prev.specialties.includes(specialty)
        ? prev.specialties.filter(s => s !== specialty)
        : [...prev.specialties, specialty]
    }));
  };

  const toggleInterest = (interest) => {
    setFormData(prev => ({
      ...prev,
      researchInterests: prev.researchInterests.includes(interest)
        ? prev.researchInterests.filter(i => i !== interest)
        : [...prev.researchInterests, interest]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Step 1: Register user account
      const registerResponse = await auth.register({
        email: formData.email,
        password: formData.password,
        name: formData.name,
        user_type: 'researcher'
      });

      // Store token and user info in localStorage
      localStorage.setItem('token', registerResponse.data.token);
      localStorage.setItem('userId', registerResponse.data.user.id);
      localStorage.setItem('userType', 'researcher');

      // Step 2: Update researcher profile with additional details
      await researchers.updateProfile({
        specialties: formData.specialties,
        research_interests: formData.researchInterests,
        institution: formData.institution,
        orcid: formData.orcid,
        researchgate: formData.researchGate,
        availability: formData.availableForMeetings ? 'available' : 'limited'
      });

      // Store profile data locally for quick access
      localStorage.setItem('researcherProfile', JSON.stringify({
        ...formData,
        id: registerResponse.data.user.id,
        researchArea: formData.specialties[0] || 'Research'
      }));

      navigate('/profile');
    } catch (error) {
      console.error('Registration error:', error);
      setError(error.response?.data?.error || 'Registration failed. Please try again.');
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Researcher Profile Setup</h1>
          <p className="text-gray-600">Share your expertise and research interests</p>
        </div>

        {/* ORCID Login Option */}
        
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">Step {step} of 3</span>
            <span className="text-sm text-gray-500">{Math.round((step / 3) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-cyan-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(step / 3) * 100}%` }}
            />
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Step 1: Basic Information */}
            {step === 1 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Basic Information</h2>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    placeholder="Dr. John Doe"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    placeholder="researcher@university.edu"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    minLength="6"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    placeholder="Create a password (min 6 characters)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Institution
                  </label>
                  <input
                    type="text"
                    name="institution"
                    value={formData.institution}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    placeholder="Harvard Medical School"
                  />
                </div>
              </div>
            )}

            {/* Step 2: Specialties & Interests */}
            {step === 2 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Expertise & Interests</h2>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Specialties
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {commonSpecialties.map(specialty => (
                      <button
                        key={specialty}
                        type="button"
                        onClick={() => toggleSpecialty(specialty)}
                        className={`px-4 py-3 rounded-lg border-2 transition-all ${
                          formData.specialties.includes(specialty)
                            ? 'border-cyan-500 bg-cyan-50 text-cyan-700'
                            : 'border-gray-200 hover:border-cyan-300'
                        }`}
                      >
                        {specialty}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Research Interests
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {commonInterests.map(interest => (
                      <button
                        key={interest}
                        type="button"
                        onClick={() => toggleInterest(interest)}
                        className={`px-4 py-3 rounded-lg border-2 transition-all text-sm ${
                          formData.researchInterests.includes(interest)
                            ? 'border-cyan-500 bg-cyan-50 text-cyan-700'
                            : 'border-gray-200 hover:border-cyan-300'
                        }`}
                      >
                        {interest}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Integration & Availability */}
            {step === 3 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Integration & Availability</h2>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ORCID ID (Optional)
                  </label>
                  <p className="text-sm text-gray-500 mb-3">
                    Connect your ORCID to automatically import publications
                  </p>
                  <input
                    type="text"
                    name="orcid"
                    value={formData.orcid}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    placeholder="0000-0000-0000-0000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ResearchGate Profile (Optional)
                  </label>
                  <p className="text-sm text-gray-500 mb-3">
                    Link your ResearchGate to showcase your academic contributions
                  </p>
                  <input
                    type="url"
                    name="researchGate"
                    value={formData.researchGate}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    placeholder="https://www.researchgate.net/profile/..."
                  />
                </div>

                <div className="flex items-start">
                  <div className="flex items-center h-5 mt-1">
                    <input
                      id="availableForMeetings"
                      name="availableForMeetings"
                      type="checkbox"
                      checked={formData.availableForMeetings}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-cyan-600 border-gray-300 rounded focus:ring-cyan-500"
                    />
                  </div>
                  <div className="ml-3">
                    <label htmlFor="availableForMeetings" className="font-medium text-gray-700">
                      Available for meetings
                    </label>
                    <p className="text-sm text-gray-500">
                      Allow patients and other researchers to request meetings with you
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={handleBack}
                  className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
                >
                  Back
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => navigate('/')}
                  className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
                >
                  Cancel
                </button>
              )}

              {step < 3 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={
                    (step === 1 && (!formData.name || !formData.email || !formData.password || !formData.institution)) ||
                    (step === 2 && (formData.specialties.length === 0 || formData.researchInterests.length === 0))
                  }
                  className="px-6 py-3 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 font-medium disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-3 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 font-medium disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  {loading ? 'Creating Account...' : 'Complete Setup'}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResearcherOnboarding;
