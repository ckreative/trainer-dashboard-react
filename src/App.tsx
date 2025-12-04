import { BrowserRouter, Routes, Route, Navigate, useSearchParams } from 'react-router-dom';
import { Toaster } from './components/ui/sonner';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AuthContainer } from './components/auth/AuthContainer';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AppLayout } from './components/AppLayout';
import { NotFound } from './components/NotFound';

// Pages
import { EventTypesPage } from './pages/EventTypesPage';
import { EventTypeEditPage } from './pages/EventTypeEditPage';
import { BookingsPage } from './pages/BookingsPage';
import { AvailabilityPage } from './pages/AvailabilityPage';
import { AvailabilityEditPage } from './pages/AvailabilityEditPage';
import { BookingDetailPage } from './pages/BookingDetailPage';
import { ProfilePage } from './pages/ProfilePage';

// Auth flow wrapper component
function AuthFlow() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  // Determine initial view based on URL
  let initialView: 'login' | 'reset-password' = 'login';
  if (token) {
    initialView = 'reset-password';
  }

  return <AuthContainer initialView={initialView} resetToken={token || ''} />;
}

// App content with routing
function AppContent() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-gray-300 border-t-gray-900"></div>
          <p className="text-sm text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Public routes */}
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/event-types" replace /> : <AuthFlow />}
      />
      <Route
        path="/forgot-password"
        element={isAuthenticated ? <Navigate to="/event-types" replace /> : <AuthFlow />}
      />
      <Route
        path="/reset-password"
        element={isAuthenticated ? <Navigate to="/event-types" replace /> : <AuthFlow />}
      />
      <Route
        path="/invalid-token"
        element={isAuthenticated ? <Navigate to="/event-types" replace /> : <AuthFlow />}
      />

      {/* Protected routes with AppLayout */}
      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        {/* Default route redirects to event-types */}
        <Route path="/" element={<Navigate to="/event-types" replace />} />

        {/* Main pages */}
        <Route path="/event-types" element={<EventTypesPage />} />
        <Route path="/bookings" element={<BookingsPage />} />
        <Route path="/availability" element={<AvailabilityPage />} />
        <Route path="/availability/new" element={<div>New Availability - Coming Soon</div>} />
        <Route path="/availability/:id" element={<AvailabilityEditPage />} />
      </Route>

      {/* Booking Detail - standalone without AppLayout */}
      <Route
        path="/bookings/:id"
        element={
          <ProtectedRoute>
            <BookingDetailPage />
          </ProtectedRoute>
        }
      />

      {/* Event Type Edit - standalone without AppLayout */}
      <Route
        path="/event-types/:id"
        element={
          <ProtectedRoute>
            <EventTypeEditPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/event-types/:id/:section"
        element={
          <ProtectedRoute>
            <EventTypeEditPage />
          </ProtectedRoute>
        }
      />

      {/* Profile page - standalone without AppLayout */}
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile/:section"
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />

      {/* 404 catch-all */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
        <Toaster />
      </AuthProvider>
    </BrowserRouter>
  );
}
