import React, { Suspense, lazy } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import Navbar from "./components/common/Navbar";
import Footer from "./components/common/Footer";
import LoadingSpinner from "./components/common/LoadingSpinner";
import ChatBot from "./components/common/ChatBot";

// Pages
import About from "./pages/About";
import Contact from "./pages/Contact";
import Offers from "./pages/Offers";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import NotFound from "./pages/NotFound";
import KYCUpload from "./pages/KYCUpload";

// Lazy load pages
const Home = lazy(() => import("./pages/Home"));
const Vehicles = lazy(() => import("./pages/Vehicles"));
const VehicleDetail = lazy(() => import("./pages/VehicleDetail"));
const Booking = lazy(() => import("./pages/Booking"));
const BookingSuccess = lazy(() => import("./pages/BookingSuccess"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Profile = lazy(() => import("./pages/Profile"));
const Wishlist = lazy(() => import("./pages/Wishlist"));
const BookingDetails = lazy(() => import("./pages/BookingDetails"));

// Admin Pages
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const AdminVehicles = lazy(() => import("./pages/AdminVehicles"));
const AdminVendors = lazy(() => import("./pages/AdminVendors"));
const AdminReports = lazy(() => import("./pages/AdminReports"));
const AdminVendorDetails = lazy(() => import("./pages/AdminVendorDetails"));
const AddVehicle = lazy(() => import("./pages/AddVehicle"));
const EditVehicle = lazy(() => import("./pages/EditVehicle"));

// Vendor Pages
const VendorDashboard = lazy(() => import("./pages/VendorDashboard"));
const VendorVehicles = lazy(() => import("./pages/VendorVehicles"));
const VendorAddVehicle = lazy(() => import("./pages/VendorAddVehicle"));
const VendorEditVehicle = lazy(() => import("./pages/VendorEditVehicle"));
const VendorBookings = lazy(() => import("./pages/VendorBookings"));
const VendorRegister = lazy(() => import("./pages/VendorRegister"));
const VendorPending = lazy(() => import("./pages/VendorPending"));

// ========== ROUTE GUARDS ==========

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  console.log(
    "🔒 PrivateRoute - isAuthenticated:",
    isAuthenticated,
    "loading:",
    loading,
  );

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    console.log("🔒 Not authenticated, redirecting to login");
    return <Navigate to="/login" replace />;
  }

  return children;
};

const AdminRoute = ({ children }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  if (loading) return <LoadingSpinner />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/dashboard" replace />;
  return children;
};

// ✅ KEEP ONLY THIS ONE PublicRoute
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <LoadingSpinner />;
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return children;
};

// ========== APP ROUTES ==========

function AppRoutes() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors duration-300 flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/vehicles" element={<Vehicles />} />
            <Route path="/vehicles/:id" element={<VehicleDetail />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/offers" element={<Offers />} />

            {/* Auth Routes */}
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              }
            />
            <Route
              path="/register"
              element={
                <PublicRoute>
                  <Register />
                </PublicRoute>
              }
            />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
            <Route
              path="/kyc"
              element={
                <PrivateRoute>
                  <KYCUpload />
                </PrivateRoute>
              }
            />

            {/* Vendor Registration */}
            <Route path="/vendor/register" element={<VendorRegister />} />
            <Route path="/vendor-pending" element={<VendorPending />} />

            {/* Customer Routes */}
            <Route
              path="/dashboard"
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <PrivateRoute>
                  <Profile />
                </PrivateRoute>
              }
            />
            <Route
              path="/wishlist"
              element={
                <PrivateRoute>
                  <Wishlist />
                </PrivateRoute>
              }
            />
            <Route
              path="/book/:id"
              element={
                <PrivateRoute>
                  <Booking />
                </PrivateRoute>
              }
            />
            <Route
              path="/booking/success/:id"
              element={
                <PrivateRoute>
                  <BookingSuccess />
                </PrivateRoute>
              }
            />
            <Route
              path="/bookings/:id"
              element={
                <PrivateRoute>
                  <BookingDetails />
                </PrivateRoute>
              }
            />

            {/* Vendor Routes */}
            <Route
              path="/vendor/dashboard"
              element={
                <PrivateRoute>
                  <VendorDashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/vendor/vehicles"
              element={
                <PrivateRoute>
                  <VendorVehicles />
                </PrivateRoute>
              }
            />
            <Route
              path="/vendor/vehicles/add"
              element={
                <PrivateRoute>
                  <VendorAddVehicle />
                </PrivateRoute>
              }
            />
            <Route
              path="/vendor/vehicles/edit/:id"
              element={
                <PrivateRoute>
                  <VendorEditVehicle />
                </PrivateRoute>
              }
            />
            <Route
              path="/vendor/bookings"
              element={
                <PrivateRoute>
                  <VendorBookings />
                </PrivateRoute>
              }
            />

            {/* Admin Routes */}
            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/vehicles"
              element={
                <AdminRoute>
                  <AdminVehicles />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/vehicles/add"
              element={
                <AdminRoute>
                  <AddVehicle />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/vehicles/edit/:id"
              element={
                <AdminRoute>
                  <EditVehicle />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/vendors"
              element={
                <AdminRoute>
                  <AdminVendors />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/vendors/:id"
              element={
                <AdminRoute>
                  <AdminVendorDetails />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/reports"
              element={
                <AdminRoute>
                  <AdminReports />
                </AdminRoute>
              }
            />

            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </main>
      <Footer />
      <ChatBot />
      <Toaster position="top-right" />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <AppRoutes />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}
