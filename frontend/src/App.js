import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import './App.css';

// Auth pages
import { LoginPage, SubscribePage } from './pages/AuthPages';

// Registration pages
import { RegisterPage, AdminSetupPage } from './pages/RegisterPages';

// User pages
import { UserDashboard, WeatherPage, AskAIPage } from './pages/UserPages';

// Consultancy pages
import {
  CultivationPage, NutrientsPage, ProtectionPage,
  CostingPage, PhotoGalleryPage,
} from './pages/ConsultancyPages';

// Data pages
import {
  DataEntryPage, MyDataPage, EcommercePage, MyOrdersPage,
} from './pages/DataPages';

// Admin pages
import {
  AdminDashboard, AdminUsersPage, AdminPlacesPage,
  AdminCultivationPage, AdminNutrientsPage, AdminProtectionPage,
  AdminCostingPage, AdminFieldDataPage, AdminPhotosPage,
  AdminFormQueriesPage, AdminAILogPage, AdminOrdersPage,
} from './pages/AdminPages';

/* ── Route Guards ──────────────────────────────────────────── */
function ProtectedRoute({ children, adminOnly = false }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div style={{
      display:'flex', alignItems:'center', justifyContent:'center',
      minHeight:'100vh', background:'var(--cream)', flexDirection:'column', gap:16,
    }}>
      <div style={{ fontSize:'4rem' }}>🌾</div>
      <div className="spinner" style={{ margin:0 }} />
      <p style={{ color:'var(--earth)', fontFamily:'var(--font-display)', fontSize:'1.1rem' }}>
        Loading KrishiSeva…
      </p>
    </div>
  );
  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && user.role !== 'admin') return <Navigate to="/dashboard" replace />;
  return children;
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} replace />;
  return children;
}

/* ── Routes ────────────────────────────────────────────────── */
function AppRoutes() {
  return (
    <Routes>
      {/* ── Public ── */}
      <Route path="/"         element={<Navigate to="/login" replace />} />
      <Route path="/login"    element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
      <Route path="/admin-setup" element={<AdminSetupPage />} />

      {/* ── Farmer ── */}
      <Route path="/dashboard"             element={<ProtectedRoute><UserDashboard /></ProtectedRoute>} />
      <Route path="/subscribe"             element={<ProtectedRoute><SubscribePage /></ProtectedRoute>} />
      <Route path="/cultivation"           element={<ProtectedRoute><CultivationPage /></ProtectedRoute>} />
      <Route path="/nutrients"             element={<ProtectedRoute><NutrientsPage /></ProtectedRoute>} />
      <Route path="/protection"            element={<ProtectedRoute><ProtectionPage /></ProtectedRoute>} />
      <Route path="/costing"               element={<ProtectedRoute><CostingPage /></ProtectedRoute>} />
      <Route path="/ecommerce"             element={<ProtectedRoute><EcommercePage /></ProtectedRoute>} />
      <Route path="/data-entry"            element={<ProtectedRoute><DataEntryPage /></ProtectedRoute>} />
      <Route path="/my-data"               element={<ProtectedRoute><MyDataPage /></ProtectedRoute>} />
      <Route path="/photos"                element={<ProtectedRoute><PhotoGalleryPage /></ProtectedRoute>} />
      <Route path="/weather"               element={<ProtectedRoute><WeatherPage /></ProtectedRoute>} />
      <Route path="/ask-ai"                element={<ProtectedRoute><AskAIPage /></ProtectedRoute>} />
      <Route path="/orders"                element={<ProtectedRoute><MyOrdersPage /></ProtectedRoute>} />

      {/* ── Admin ── */}
      <Route path="/admin"                 element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/users"           element={<ProtectedRoute adminOnly><AdminUsersPage /></ProtectedRoute>} />
      <Route path="/admin/places"          element={<ProtectedRoute adminOnly><AdminPlacesPage /></ProtectedRoute>} />
      <Route path="/admin/cultivation"     element={<ProtectedRoute adminOnly><AdminCultivationPage /></ProtectedRoute>} />
      <Route path="/admin/nutrients"       element={<ProtectedRoute adminOnly><AdminNutrientsPage /></ProtectedRoute>} />
      <Route path="/admin/protection"      element={<ProtectedRoute adminOnly><AdminProtectionPage /></ProtectedRoute>} />
      <Route path="/admin/costing"         element={<ProtectedRoute adminOnly><AdminCostingPage /></ProtectedRoute>} />
      <Route path="/admin/field-data"      element={<ProtectedRoute adminOnly><AdminFieldDataPage /></ProtectedRoute>} />
      <Route path="/admin/photos"          element={<ProtectedRoute adminOnly><AdminPhotosPage /></ProtectedRoute>} />
      <Route path="/admin/form-queries"    element={<ProtectedRoute adminOnly><AdminFormQueriesPage /></ProtectedRoute>} />
      <Route path="/admin/ai-log"          element={<ProtectedRoute adminOnly><AdminAILogPage /></ProtectedRoute>} />
      <Route path="/admin/orders"          element={<ProtectedRoute adminOnly><AdminOrdersPage /></ProtectedRoute>} />

      {/* ── Fallback ── */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
