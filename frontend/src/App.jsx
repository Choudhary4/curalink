import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Chatbot from './components/Chatbot';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import PatientOnboarding from './pages/patient/PatientOnboarding';
import ResearcherOnboarding from './pages/researcher/ResearcherOnboarding';
import PatientDashboard from './pages/patient/PatientDashboard';
import ResearcherDashboard from './pages/researcher/ResearcherDashboard';
import HealthExperts from './pages/patient/HealthExperts';
import ClinicalTrials from './pages/patient/ClinicalTrials';
import Publications from './pages/patient/Publications';
import PublicationDetail from './pages/PublicationDetail';
import Forums from './pages/Forums';
import Favorites from './pages/Favorites';
import Messages from './pages/Messages';
import Profile from './pages/Profile';
import Collaborators from './pages/researcher/Collaborators';
import CollaborationRequests from './pages/researcher/CollaborationRequests';
import MeetingRequests from './pages/MeetingRequests';
import OrcidCallback from './pages/OrcidCallback';

const Layout = ({ children }) => {
  const location = useLocation();
  const hideNavbar = ['/', '/login', '/patient/onboarding', '/researcher/onboarding', '/auth/orcid/callback'].includes(location.pathname);
  const showChatbot = !['/login', '/patient/onboarding', '/researcher/onboarding', '/auth/orcid/callback'].includes(location.pathname);

  return (
    <>
      {!hideNavbar && <Navbar />}
      {children}
      {showChatbot && <Chatbot />}
    </>
  );
};

function App() {
  return (
    <Router>
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/auth/orcid/callback" element={<OrcidCallback />} />

            {/* Patient Routes */}
            <Route path="/patient/onboarding" element={<PatientOnboarding />} />
            <Route path="/patient/dashboard" element={<PatientDashboard />} />
            <Route path="/patient/experts" element={<HealthExperts />} />
            <Route path="/patient/trials" element={<ClinicalTrials />} />
            <Route path="/patient/publications" element={<Publications />} />
            <Route path="/publication/:id" element={<PublicationDetail />} />
            <Route path="/patient/forums" element={<Forums userType="patient" />} />
            <Route path="/patient/favorites" element={<Favorites userType="patient" />} />

            {/* Researcher Routes */}
            <Route path="/researcher/onboarding" element={<ResearcherOnboarding />} />
            <Route path="/researcher/dashboard" element={<ResearcherDashboard />} />
            <Route path="/researcher/collaborators" element={<Collaborators />} />
            <Route path="/researcher/requests" element={<CollaborationRequests />} />
            <Route path="/researcher/forums" element={<Forums userType="researcher" />} />
            <Route path="/researcher/favorites" element={<Favorites userType="researcher" />} />

            {/* Shared Routes */}
            <Route path="/meetings" element={<MeetingRequests />} />
            <Route path="/messages" element={<Messages />} />
            <Route path="/profile" element={<Profile />} />
          </Routes>
        </div>
      </Layout>
    </Router>
  );
}

export default App;
