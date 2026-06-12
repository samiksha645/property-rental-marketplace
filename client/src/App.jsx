import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Header from './components/layout/Header';
import HomePage from './pages/HomePage';
import Login from './pages/Login';
import Register from './pages/Register';
import Properties from './pages/Properties';
import PropertyDetails from './pages/PropertyDetails';
import UserDashboard from './pages/user/UserDashboard';
import WishlistPage from './pages/user/WishlistPage';
import Dashboard from './pages/admin/Dashboard';
import Users from './pages/admin/Users';
import AdminProperties from './pages/admin/Properties';
import Bookings from './pages/admin/Bookings';
import AdminReviews from './pages/admin/Reviews';
import AdminCategories from './pages/admin/Categories';
import AdminCities from './pages/admin/Cities';
import AdminLayout from './components/admin/AdminLayout';
import './index.css';

// Scroll to hash element helper
const ScrollToHash = () => {
  const { hash, pathname } = useLocation();

  useEffect(() => {
    if (hash) {
      // Small timeout to allow element to render first
      setTimeout(() => {
        const element = document.getElementById(hash.substring(1));
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 200);
    } else {
      window.scrollTo(0, 0);
    }
  }, [hash, pathname]);

  return null;
};

// Protected Route
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <div className="loading-screen"><div className="spinner"></div></div>;
  return isAuthenticated ? children : <Navigate to="/login" />;
};

// Admin Route
const AdminRoute = ({ children }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  if (loading) return <div className="loading-screen"><div className="spinner"></div></div>;
  if (!isAuthenticated) return <Navigate to="/login" />;
  if (!isAdmin()) return <Navigate to="/" />;
  return <AdminLayout>{children}</AdminLayout>;
};

// Simple placeholder pages for sections that scroll to sections on homepage
const SectionRedirect = ({ section }) => {
  const navigate = useNavigate();
  useEffect(() => {
    navigate(`/#${section}`, { replace: true });
  }, [navigate, section]);
  return null;
};

const AppContent = () => {
  const { loading } = useAuth();
  if (loading) return <div className="loading-screen"><div className="spinner"></div><p>Loading...</p></div>;

  return (
    <div className="app">
      <Header />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/properties" element={<Properties />} />
        <Route path="/property/:id" element={<PropertyDetails />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Section anchor routes - redirect to homepage sections */}
        <Route path="/explore" element={<SectionRedirect section="explore" />} />
        <Route path="/services" element={<SectionRedirect section="services" />} />
        <Route path="/about" element={<SectionRedirect section="about" />} />
        <Route path="/contact" element={<SectionRedirect section="contact" />} />
        
        {/* User Routes */}
        <Route path="/dashboard" element={<ProtectedRoute><UserDashboard /></ProtectedRoute>} />
        <Route path="/wishlist" element={<ProtectedRoute><WishlistPage /></ProtectedRoute>} />

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminRoute><Dashboard /></AdminRoute>} />
        <Route path="/admin/users" element={<AdminRoute><Users /></AdminRoute>} />
        <Route path="/admin/properties" element={<AdminRoute><AdminProperties /></AdminRoute>} />
        <Route path="/admin/bookings" element={<AdminRoute><Bookings /></AdminRoute>} />
        <Route path="/admin/reviews" element={<AdminRoute><AdminReviews /></AdminRoute>} />
        <Route path="/admin/categories" element={<AdminRoute><AdminCategories /></AdminRoute>} />
        <Route path="/admin/cities" element={<AdminRoute><AdminCities /></AdminRoute>} />

        {/* 404 catch-all */}
        <Route path="*" element={
          <div style={{ textAlign: 'center', padding: '100px 20px' }}>
            <h1 style={{ fontSize: '4rem', color: '#0f172a', marginBottom: '12px' }}>404</h1>
            <p style={{ color: '#64748b', marginBottom: '24px', fontSize: '1.125rem' }}>Page not found</p>
            <a href="/" className="btn btn-primary">Go Home</a>
          </div>
        } />
      </Routes>
    </div>
  );
};

const App = () => (
  <Router>
    <AuthProvider>
      <ScrollToHash />
      <AppContent />
    </AuthProvider>
  </Router>
);

export default App;