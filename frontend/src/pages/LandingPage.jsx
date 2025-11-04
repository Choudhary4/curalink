import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

const LandingPage = () => {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-green-50 via-blue-50 to-white">
      {/* Header */}
      <header className="bg-white border-b-4 border-green-400 sticky top-0 z-50 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2 group cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center transform group-hover:rotate-12 transition-transform duration-300 shadow-lg">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <h1 className="text-3xl font-heading font-bold text-gray-800">CuraLink</h1>
          </div>
          <button
            onClick={() => navigate('/login')}
            className="px-6 py-3 bg-white border-2 border-blue-400 hover:bg-blue-50 text-blue-600 hover:text-blue-700 font-bold rounded-xl transition-all duration-200 hover:scale-105 active:scale-95 shadow-md"
          >
            LOGIN
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-6xl w-full">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Side - Text Content */}
            <div className={`space-y-8 ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}>
              <div className="space-y-4">
                <h2 className="text-5xl md:text-6xl font-heading font-extrabold text-gray-900 leading-tight">
                  The free, fun, and effective way to
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-blue-500 block mt-2">learn about health!</span>
                </h2>
                <p className="text-xl text-gray-600 leading-relaxed">
                  Connect patients with researchers. Discover clinical trials, publications, and health experts. Your journey to better healthcare starts here.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => navigate('/patient/onboarding')}
                  className="px-8 py-4 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold rounded-xl shadow-lg transition-all duration-200 hover:scale-105 active:scale-95 text-lg group"
                >
                  GET STARTED
                  <svg className="w-5 h-5 ml-2 inline-block group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
                <button
                  onClick={() => navigate('/login')}
                  className="px-8 py-4 bg-white border-2 border-green-500 hover:bg-green-50 text-green-600 font-bold rounded-xl shadow-md transition-all duration-200 hover:scale-105 active:scale-95 text-lg"
                >
                  I ALREADY HAVE AN ACCOUNT
                </button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-6 pt-8">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-500">10K+</div>
                  <div className="text-sm text-gray-600 mt-1">Clinical Trials</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-500">5K+</div>
                  <div className="text-sm text-gray-600 mt-1">Health Experts</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-500">50K+</div>
                  <div className="text-sm text-gray-600 mt-1">Publications</div>
                </div>
              </div>
            </div>

            {/* Right Side - User Type Cards with Floating Illustrations */}
            <div className={`space-y-6 ${isVisible ? 'animate-fade-in-down' : 'opacity-0'}`}>
              {/* Floating medical illustration */}
              <div className="relative">
                <div className="absolute -top-20 -right-10 w-32 h-32 bg-green-200 rounded-full blur-3xl opacity-60 animate-pulse-slow"></div>
                <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-blue-200 rounded-full blur-3xl opacity-60 animate-pulse-slow delay-1000"></div>

                {/* Patient Card */}
                <div className="relative mb-6 group">
                  <div className="bg-white border-2 border-gray-200 hover:border-green-400 rounded-2xl shadow-md hover:shadow-xl p-8 transition-all duration-300 hover:scale-105">
                    <div className="flex items-center space-x-6">
                      <div className="flex-shrink-0">
                        <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                          <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">I'm a Patient</h3>
                        <p className="text-gray-600 mb-4">
                          Find clinical trials, health experts, and research relevant to your condition
                        </p>
                        <button
                          onClick={() => navigate('/patient/onboarding')}
                          className="inline-flex items-center text-green-600 font-bold group-hover:text-green-700 transition-colors"
                        >
                          Get Started
                          <svg className="w-5 h-5 ml-2 group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Researcher Card */}
                <div className="relative group">
                  <div className="bg-white border-2 border-gray-200 hover:border-blue-400 rounded-2xl shadow-md hover:shadow-xl p-8 transition-all duration-300 hover:scale-105">
                    <div className="flex items-center space-x-6">
                      <div className="flex-shrink-0">
                        <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                          <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                          </svg>
                        </div>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">I'm a Researcher</h3>
                        <p className="text-gray-600 mb-4">
                          Connect with collaborators, manage trials, and share your research
                        </p>
                        <button
                          onClick={() => navigate('/researcher/onboarding')}
                          className="inline-flex items-center text-blue-600 font-bold group-hover:text-blue-700 transition-colors"
                        >
                          Get Started
                          <svg className="w-5 h-5 ml-2 group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Features Section */}
          <div className={`mt-24 ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`} style={{ animationDelay: '0.3s' }}>
            <h3 className="text-3xl font-heading font-bold text-center text-gray-900 mb-12">
              Why choose <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-blue-500">CuraLink</span>?
            </h3>
            <div className="grid md:grid-cols-4 gap-6">
              {[
                { icon: '🎯', title: 'Personalized', desc: 'AI-powered recommendations' },
                { icon: '🔬', title: 'Evidence-Based', desc: 'PubMed & clinical trials' },
                { icon: '👥', title: 'Connect', desc: 'Verified health experts' },
                { icon: '🚀', title: 'Free Forever', desc: 'No hidden costs' },
              ].map((feature, index) => (
                <div key={index} className="bg-white rounded-2xl shadow-md border-2 border-gray-100 p-6 text-center group hover:scale-105 hover:shadow-xl hover:border-green-300 transition-all duration-300" style={{ animationDelay: `${index * 0.1}s` }}>
                  <div className="text-5xl mb-4 transform group-hover:scale-125 transition-transform duration-300">{feature.icon}</div>
                  <h4 className="text-lg font-bold text-gray-900 mb-2">{feature.title}</h4>
                  <p className="text-gray-600 text-sm">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t-2 border-gray-200 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-gray-600 text-sm">
              © 2025 CuraLink. Empowering healthcare through AI and connection.
            </p>
            <div className="flex items-center space-x-6">
              <a href="#" className="text-gray-600 hover:text-green-500 transition-colors text-sm font-medium">Privacy</a>
              <a href="#" className="text-gray-600 hover:text-green-500 transition-colors text-sm font-medium">Terms</a>
              <a href="#" className="text-gray-600 hover:text-green-500 transition-colors text-sm font-medium">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
