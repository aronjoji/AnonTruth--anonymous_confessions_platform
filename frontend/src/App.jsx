import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import { AuthProvider, useAuth } from './hooks/useAuth';
import AuthModal from './components/AuthModal';
import { HelmetProvider } from 'react-helmet-async';

// Lazy-loaded pages for code splitting
const CreateConfession = lazy(() => import('./pages/CreateConfession'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const ConfessionDetail = lazy(() => import('./pages/ConfessionDetail'));
const Profile = lazy(() => import('./pages/Profile'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const TermsOfService = lazy(() => import('./pages/TermsOfService'));
const CommunityGuidelines = lazy(() => import('./pages/CommunityGuidelines'));
const ContentPolicy = lazy(() => import('./pages/ContentPolicy'));
const Disclaimer = lazy(() => import('./pages/Disclaimer'));
const Contact = lazy(() => import('./pages/Contact'));
const AnonChat = lazy(() => import('./pages/AnonChat'));

const LazyFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-[#0e1113]">
    <Loader2 className="w-8 h-8 text-[#FF4500] animate-spin" />
  </div>
);

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
    <div className="relative min-h-screen bg-[#0e1113] flex flex-col">
      <ScrollToTop />
      <Navbar />
      <AuthModal />

      <main className="relative flex-1">
        <Suspense fallback={<LazyFallback />}>
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
            <Route path="/post/:id" element={<ConfessionDetail />} />
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
        </Suspense>
      </main>

      <Footer />
    </div>
  );
};

const App = () => {
  return (
    <HelmetProvider>
      <AuthProvider>
        <Router>
          <AppContent />
        </Router>
      </AuthProvider>
    </HelmetProvider>
  );
};

export default App;
