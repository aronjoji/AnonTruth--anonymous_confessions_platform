import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ScrollProgress from './components/ScrollProgress';
import FloatingPostButton from './components/FloatingPostButton';
import ParticleField from './components/ParticleField';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import CreateConfession from './pages/CreateConfession';
import AdminDashboard from './pages/AdminDashboard';
import ConfessionDetail from './pages/ConfessionDetail';
import Profile from './pages/Profile';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import CommunityGuidelines from './pages/CommunityGuidelines';
import ContentPolicy from './pages/ContentPolicy';
import Disclaimer from './pages/Disclaimer';
import Contact from './pages/Contact';
import AnonChat from './pages/AnonChat';
import { AuthProvider, useAuth } from './hooks/useAuth';
import AuthModal from './components/AuthModal';

const ProtectedRoute = ({ children, role }) => {
  const { user, loading } = useAuth();
  
  if (loading) return null;
  if (!user || (role && user.role !== role)) {
    return <Navigate to="/" replace />;
  }
  return children;
};

const GuestRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) return null;
  if (user) return <Navigate to="/home" replace />;
  return children;
};

const AppContent = () => {
  const location = useLocation();

  return (
    <div className="relative min-h-screen animated-gradient-bg flex flex-col">
      <ScrollProgress />
      <Navbar />
      <AuthModal />
      <FloatingPostButton />
      
      {/* Neural Particle Field */}
      <ParticleField />

      {/* Animated Background Orbs */}
      <div className="fixed inset-0 pointer-events-none z-[1] overflow-hidden">
        <div className="absolute top-[-15%] left-[-10%] w-[50vw] h-[50vw] bg-accent-cyan/5 blur-[150px] rounded-full animate-[floating_8s_ease-in-out_infinite]" />
        <div className="absolute bottom-[-15%] right-[-10%] w-[50vw] h-[50vw] bg-accent-violet/5 blur-[150px] rounded-full animate-[floating_10s_ease-in-out_infinite_1s]" />
        <div className="absolute top-[40%] left-[50%] w-[30vw] h-[30vw] bg-accent-cyan/3 blur-[120px] rounded-full animate-[floating_12s_ease-in-out_infinite_2s]" />
      </div>

      <main className="relative z-10 flex-1">
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<Landing />} />
            <Route path="/home" element={<Home />} />
            <Route path="/nearby" element={<Home />} />
            <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
            <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />
            <Route path="/post" element={<CreateConfession />} />
            <Route path="/admin" element={
              <ProtectedRoute role="admin">
                <AdminDashboard />
              </ProtectedRoute>
            } />
            <Route path="/confession/:id" element={<ConfessionDetail />} />
            <Route path="/chat/:id" element={
              <ProtectedRoute>
                <AnonChat />
              </ProtectedRoute>
            } />
            <Route path="/profile" element={<Profile />} />
            {/* Legal & Compliance Pages */}
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<TermsOfService />} />
            <Route path="/guidelines" element={<CommunityGuidelines />} />
            <Route path="/content-policy" element={<ContentPolicy />} />
            <Route path="/disclaimer" element={<Disclaimer />} />
            <Route path="/contact" element={<Contact />} />
          </Routes>
        </AnimatePresence>
      </main>

      <Footer />
    </div>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
};

export default App;
