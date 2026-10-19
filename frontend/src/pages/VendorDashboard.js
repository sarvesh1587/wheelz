import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { vehicleAPI, bookingAPI } from "../services/api";
import toast from "react-hot-toast";
import {
  Truck as TruckIcon,
  Calendar as CalendarIcon,
  IndianRupee as CurrencyRupeeIcon,
  BarChart3 as ChartBarIcon,
  Plus as PlusIcon,
  Eye as EyeIcon,
  Pencil as PencilIcon,
  Trash2 as TrashIcon,
  CheckCircle2 as CheckCircleIcon,
  XCircle as XCircleIcon,
  Clock as ClockIcon,
  User as UserIcon,
  Phone as PhoneIcon,
  Mail as EnvelopeIcon,
  MapPin as MapPinIcon,
  FileText as DocumentTextIcon,
  X as XMarkIcon,
  FileDown as DocumentArrowDownIcon,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Reveal } from "../components/motion";
import { PageHeader, Panel, Stat, PageLoader } from "../components/ui";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import html2pdf from "html2pdf.js";

export default function VendorDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("vehicles");
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);

  useEffect(() => {
    fetchVendorData();
  }, []);

  const fetchVendorData = async () => {
    try {
      const [vehiclesRes, bookingsRes] = await Promise.all([
        vehicleAPI.getVendorVehicles(),
        bookingAPI.getVendorBookings(),
      ]);

      const vendorVehicles = vehiclesRes.data.vehicles || [];
      const vendorBookings = bookingsRes.data.bookings || [];

      console.log("Vendor Vehicles:", vendorVehicles);
      console.log("Vendor Bookings:", vendorBookings);

      setVehicles(vendorVehicles);
      setBookings(vendorBookings);

      const totalVehicles = vendorVehicles.length;
      const availableVehicles = vendorVehicles.filter(
        (v) => v.isAvailable,
      ).length;
      const totalBookings = vendorBookings.length;
      const completedBookings = vendorBookings.filter(
        (b) => b.status === "completed",
      ).length;
      const totalRevenue = vendorBookings.reduce(
        (sum, b) => sum + (b.totalAmount || 0),
        0,
      );
      const pendingAmount = vendorBookings
        .filter((b) => b.status === "pending")
        .reduce((sum, b) => sum + (b.totalAmount || 0), 0);

      setStats({
        totalVehicles,
        availableVehicles,
        totalBookings,
        completedBookings,
        totalRevenue,
        pendingAmount,
      });
    } catch (error) {
      console.error("Error fetching vendor data:", error);
      toast.error("Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  const toggleVehicleAvailability = async (vehicleId, currentStatus) => {
    try {
      await vehicleAPI.update(vehicleId, { isAvailable: !currentStatus });
      toast.success(
        `Vehicle ${!currentStatus ? "listed" : "unlisted"} successfully`,
      );
      fetchVendorData();
    } catch (error) {
      toast.error("Failed to update vehicle status");
    }
  };

  const deleteVehicle = async (vehicleId) => {
    if (
      window.confirm(
        "Are you sure you want to delete this vehicle? This action cannot be undone.",
      )
    ) {
      try {
        await vehicleAPI.delete(vehicleId);
        toast.success("Vehicle deleted successfully");
        fetchVendorData();
      } catch (error) {
        toast.error("Failed to delete vehicle");
      }
    }
  };

  const viewBookingDetails = (booking) => {
    setSelectedBooking(booking);
    setShowBookingModal(true);
  };

  // PDF Download Function
  const downloadBookingPDF = () => {
    if (!selectedBooking) return;

    // Create a temporary div for PDF content
    const pdfContent = document.createElement("div");
    pdfContent.style.padding = "20px";
    pdfContent.style.fontFamily = "Arial, sans-serif";
    pdfContent.style.backgroundColor = "white";

    pdfContent.innerHTML = `
      <div style="max-width: 800px; margin: 0 auto;">
        <!-- Header -->
        <div style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #FF4D00; padding-bottom: 20px;">
          <div style="display: flex; align-items: center; justify-content: center; gap: 10px;">
            <div style="width: 50px; height: 50px; background: linear-gradient(135deg, #FF4D00, #E04300); border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 24px; font-weight: bold; color: white;">W</div>
            <h1 style="color: #FF4D00; margin: 0;">WHEELZ</h1>
          </div>
          <h2 style="margin: 10px 0 5px; color: #333;">Booking Confirmation</h2>
          <p style="color: #666; margin: 0;">Booking ID: ${selectedBooking.bookingRef}</p>
          <p style="color: #666; margin: 5px 0 0;">Date: ${new Date().toLocaleDateString("en-IN")}</p>
        </div>

        <!-- Customer Details -->
        <div style="margin-bottom: 20px;">
          <h3 style="color: #FF4D00; margin-bottom: 10px; border-left: 3px solid #FF4D00; padding-left: 10px;">Customer Information</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr style="border-bottom: 1px solid #eee;">
              <td style="padding: 8px; font-weight: bold; width: 120px;">Full Name</td>
              <td style="padding: 8px;">${selectedBooking.user?.name || selectedBooking.customerDetails?.name || "N/A"}</td>
            </tr>
            <tr style="border-bottom: 1px solid #eee;">
              <td style="padding: 8px; font-weight: bold;">Email</td>
              <td style="padding: 8px;">${selectedBooking.user?.email || selectedBooking.customerDetails?.email || "N/A"}</td>
            </tr>
            <tr style="border-bottom: 1px solid #eee;">
              <td style="padding: 8px; font-weight: bold;">Phone</td>
              <td style="padding: 8px;">${selectedBooking.user?.phone || selectedBooking.customerDetails?.phone || "N/A"}</td>
            </tr>
            <tr style="border-bottom: 1px solid #eee;">
              <td style="padding: 8px; font-weight: bold;">Address</td>
              <td style="padding: 8px;">${selectedBooking.customerDetails?.address || "Not provided"}</td>
            </tr>
          </table>
        </div>

        <!-- Vehicle Details -->
        <div style="margin-bottom: 20px;">
          <h3 style="color: #FF4D00; margin-bottom: 10px; border-left: 3px solid #FF4D00; padding-left: 10px;">Vehicle Information</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr style="border-bottom: 1px solid #eee;">
              <td style="padding: 8px; font-weight: bold; width: 120px;">Vehicle Name</td>
              <td style="padding: 8px;">${selectedBooking.vehicle?.name || "N/A"}</td>
            </tr>
            <tr style="border-bottom: 1px solid #eee;">
              <td style="padding: 8px; font-weight: bold;">Brand</td>
              <td style="padding: 8px;">${selectedBooking.vehicle?.brand || "N/A"}</td>
            </tr>
            <tr style="border-bottom: 1px solid #eee;">
              <td style="padding: 8px; font-weight: bold;">Year</td>
              <td style="padding: 8px;">${selectedBooking.vehicle?.year || "N/A"}</td>
            </tr>
            <tr style="border-bottom: 1px solid #eee;">
              <td style="padding: 8px; font-weight: bold;">Price/Day</td>
              <td style="padding: 8px;">₹${selectedBooking.pricePerDay?.toLocaleString() || 0}</td>
            </tr>
          </table>
        </div>

        <!-- Booking Details -->
        <div style="margin-bottom: 20px;">
          <h3 style="color: #FF4D00; margin-bottom: 10px; border-left: 3px solid #FF4D00; padding-left: 10px;">Booking Information</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr style="border-bottom: 1px solid #eee;">
              <td style="padding: 8px; font-weight: bold; width: 120px;">Pickup Date</td>
              <td style="padding: 8px;">${new Date(selectedBooking.startDate).toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</td>
            </tr>
            <tr style="border-bottom: 1px solid #eee;">
              <td style="padding: 8px; font-weight: bold;">Return Date</td>
              <td style="padding: 8px;">${new Date(selectedBooking.endDate).toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</td>
            </tr>
            <tr style="border-bottom: 1px solid #eee;">
              <td style="padding: 8px; font-weight: bold;">Total Days</td>
              <td style="padding: 8px;">${selectedBooking.totalDays} days</td>
            </tr>
            <tr style="border-bottom: 1px solid #eee;">
              <td style="padding: 8px; font-weight: bold;">Pickup Location</td>
              <td style="padding: 8px;">${selectedBooking.pickupLocation || "N/A"}</td>
            </tr>
          </table>
        </div>

        <!-- Price Breakdown -->
        <div style="margin-bottom: 20px;">
          <h3 style="color: #FF4D00; margin-bottom: 10px; border-left: 3px solid #FF4D00; padding-left: 10px;">Price Breakdown</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr style="border-bottom: 1px solid #eee;">
              <td style="padding: 8px; font-weight: bold;">Price per day</td>
              <td style="padding: 8px;">₹${selectedBooking.pricePerDay?.toLocaleString()}</td>
            </tr>
            <tr style="border-bottom: 1px solid #eee;">
              <td style="padding: 8px; font-weight: bold;">Number of days</td>
              <td style="padding: 8px;">${selectedBooking.totalDays} days</td>
            </tr>
            ${
              selectedBooking.extras
                ? Object.entries(selectedBooking.extras)
                    .filter(([_, v]) => v)
                    .map(([key]) => {
                      const extraNames = {
                        insurance: "Zero Dep Insurance",
                        gps: "GPS Navigation",
                        childSeat: "Child Seat",
                        driver: "Professional Driver",
                      };
                      const extraPrices = {
                        insurance: 200,
                        gps: 100,
                        childSeat: 150,
                        driver: 500,
                      };
                      return `
                <tr style="border-bottom: 1px solid #eee;">
                  <td style="padding: 8px; padding-left: 20px; font-weight: bold;">• ${extraNames[key]}</td>
                  <td style="padding: 8px;">+₹${extraPrices[key]}/day</td>
                </tr>
              `;
                    })
                    .join("")
                : ""
            }
            <tr style="border-top: 2px solid #FF4D00;">
              <td style="padding: 12px 8px; font-weight: bold; font-size: 16px;">Total Amount</td>
              <td style="padding: 12px 8px; font-size: 20px; font-weight: bold; color: #FF4D00;">₹${selectedBooking.finalAmount?.toLocaleString() || selectedBooking.totalAmount?.toLocaleString()}</td>
            </tr>
          </table>
        </div>

        <!-- Status -->
        <div style="margin-bottom: 20px;">
          <h3 style="color: #FF4D00; margin-bottom: 10px; border-left: 3px solid #FF4D00; padding-left: 10px;">Status</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr style="border-bottom: 1px solid #eee;">
              <td style="padding: 8px; font-weight: bold; width: 120px;">Booking Status</td>
              <td style="padding: 8px;"><span style="background: #d1fae5; color: #065f46; padding: 4px 12px; border-radius: 20px;">${selectedBooking.status?.toUpperCase()}</span></td>
            </tr>
            <tr style="border-bottom: 1px solid #eee;">
              <td style="padding: 8px; font-weight: bold;">Payment Status</td>
              <td style="padding: 8px;"><span style="background: #fed7aa; color: #92400e; padding: 4px 12px; border-radius: 20px;">${selectedBooking.paymentStatus?.toUpperCase()}</span></td>
            </tr>
          </table>
        </div>

        <!-- Footer -->
        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #666; font-size: 12px;">
          <p>Thank you for choosing Wheelz!</p>
          <p>For any queries, contact us at support@wheelz.com | 9876543210</p>
          <p>This is a system generated document. No signature required.</p>
        </div>
      </div>
    `;

    // PDF options
    const opt = {
      margin: [0.5, 0.5, 0.5, 0.5],
      filename: `Booking_${selectedBooking.bookingRef}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: "in", format: "a4", orientation: "portrait" },
    };

    // Generate PDF
    html2pdf().set(opt).from(pdfContent).save();
    toast.success("PDF downloaded successfully!");
  };

  const statsCards = [
    {
      label: "Total Vehicles",
      value: stats?.totalVehicles || 0,
      icon: TruckIcon,
      color: "",
    },
    {
      label: "Available",
      value: stats?.availableVehicles || 0,
      icon: CheckCircleIcon,
      color: "",
    },
    {
      label: "Total Bookings",
      value: stats?.totalBookings || 0,
      icon: CalendarIcon,
      color: "",
    },
    {
      label: "Completed",
      value: stats?.completedBookings || 0,
      icon: ChartBarIcon,
      color: "",
    },
    {
      label: "Total Revenue",
      value: `₹${(stats?.totalRevenue || 0).toLocaleString()}`,
      icon: CurrencyRupeeIcon,
      color: "",
    },
    {
      label: "Pending Payout",
      value: `₹${(stats?.pendingAmount || 0).toLocaleString()}`,
      icon: ClockIcon,
      color: "",
    },
  ];

  const revenueData = [
    { month: "Jan", revenue: 25000 },
    { month: "Feb", revenue: 35000 },
    { month: "Mar", revenue: 45000 },
    { month: "Apr", revenue: 55000 },
    { month: "May", revenue: 65000 },
    { month: "Jun", revenue: 75000 },
  ];

  const getStatusBadge = (status) => {
    const badges = {
      confirmed: "bg-raised text-accent",
      pending: "bg-accent/10 text-accent",
      cancelled: "bg-accent/10 text-red-500",
      completed: "bg-raised text-accent",
    };
    return badges[status] || badges.pending;
  };

  const getPaymentStatusBadge = (status) => {
    const badges = {
      paid: "bg-raised text-accent",
      pending: "bg-accent/10 text-accent",
      refunded: "bg-accent/10 text-red-500",
      failed: "bg-accent/10 text-red-500",
    };
    return badges[status] || badges.pending;
  };

  if (loading) return <PageLoader label="Loading vendor dashboard" />;

  return (
    <div className="pb-24 pt-28 md:pt-32">
      <div className="container-x">
        <PageHeader
          index="01"
          eyebrow="Vendor"
          title={["Your fleet."]}
          lede="Manage your vehicles, track bookings, and monitor earnings."
          actions={
            <button onClick={() => navigate("/vendor/vehicles/add")} className="btn-primary">
              <PlusIcon className="h-4 w-4" /> Add new vehicle
            </button>
          }
        />

        {/* Stats Grid */}
        <div className="mb-14 grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-3 xl:grid-cols-6">
          {statsCards.map((stat, idx) => (
            <Reveal key={stat.label} delay={idx * 0.05}>
              <Stat label={stat.label} value={stat.value} />
            </Reveal>
          ))}
        </div>

        {/* Revenue Chart */}
        <Panel index="02" title="Revenue · last 6 months" className="mb-14">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenueData}>
              <CartesianGrid stroke="rgb(var(--line) / 0.08)" vertical={false} />
              <XAxis dataKey="month" stroke="rgb(var(--muted))" tickLine={false} axisLine={false} fontSize={12} />
              <YAxis stroke="rgb(var(--muted))" tickLine={false} axisLine={false} fontSize={12} />
              <Tooltip
                contentStyle={{ background: "rgb(var(--surface))", border: "1px solid rgb(var(--line) / 0.1)", borderRadius: 16, color: "rgb(var(--ink))" }}
              />
              <Line type="monotone" dataKey="revenue" stroke="rgb(var(--accent))" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </Panel>

        {/* Tabs */}
        <nav className="mb-10 flex gap-8 border-b border-line/10" aria-label="Vendor sections">
          {[
            { id: "vehicles", label: "My vehicles", count: vehicles.length },
            { id: "bookings", label: "Bookings", count: bookings.length },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              aria-current={activeTab === tab.id ? "page" : undefined}
              className={`relative flex items-center gap-2 py-4 text-sm font-medium transition-colors ${
                activeTab === tab.id ? "text-ink" : "text-muted hover:text-ink"
              }`}
            >
              {tab.label}
              <span className="font-mono text-[11px] text-muted">{String(tab.count).padStart(2, "0")}</span>
              {activeTab === tab.id && <motion.span layoutId="vendor-tab" className="absolute inset-x-0 -bottom-px h-px bg-accent" />}
            </button>
          ))}
        </nav>

        {/* Vehicles Tab */}
        {activeTab === "vehicles" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            {vehicles.length === 0 ? (
              <div className="text-center py-16 bg-surface rounded-[24px] border border-line/10">
                <TruckIcon className="w-16 h-16 text-muted mx-auto mb-4" />
                <h3 className="display-tight text-lg text-ink mb-2">
                  No Vehicles Listed
                </h3>
                <p className="text-muted mb-4">
                  Start earning by listing your first vehicle!
                </p>
                <button
                  onClick={() => navigate("/vendor/vehicles/add")}
                  className="btn-primary inline-flex"
                >
                  Add Vehicle
                </button>
              </div>
            ) : (
              vehicles.map((vehicle, idx) => (
                <motion.div
                  key={vehicle._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="bg-surface rounded-[24px] p-5 transition-all border border-line/10"
                >
                  <div className="flex flex-col sm:flex-row gap-4">
                    <img
                      src={vehicle.images?.[0]}
                      alt={vehicle.name}
                      className="w-24 h-24 rounded-xl object-cover"
                    />
                    <div className="flex-1">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div>
                          <h3 className="font-bold text-ink">
                            {vehicle.name}
                          </h3>
                          <p className="text-sm text-muted">
                            {vehicle.brand} • {vehicle.year}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span
                              className={`text-xs px-2 py-0.5 rounded-full ${vehicle.isAvailable ? "bg-raised text-accent" : "bg-accent/10 text-red-500"}`}
                            >
                              {vehicle.isAvailable
                                ? "Available"
                                : "Not Available"}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="display text-xl">
                            ₹{vehicle.currentPrice?.toLocaleString()}
                          </p>
                          <p className="text-xs text-muted">per day</p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-3 mt-3">
                        <button
                          onClick={() => navigate(`/vehicles/${vehicle._id}`)}
                          className="text-sm text-accent hover:text-accent flex items-center gap-1"
                        >
                          <EyeIcon className="w-4 h-4" /> View
                        </button>
                        <button
                          onClick={() =>
                            navigate(`/vendor/vehicles/edit/${vehicle._id}`)
                          }
                          className="text-sm text-accent hover:text-blue-600 flex items-center gap-1"
                        >
                          <PencilIcon className="w-4 h-4" /> Edit
                        </button>
                        <button
                          onClick={() =>
                            toggleVehicleAvailability(
                              vehicle._id,
                              vehicle.isAvailable,
                            )
                          }
                          className={`text-sm flex items-center gap-1 ${vehicle.isAvailable ? "text-red-500" : "text-accent"}`}
                        >
                          {vehicle.isAvailable ? (
                            <XCircleIcon className="w-4 h-4" />
                          ) : (
                            <CheckCircleIcon className="w-4 h-4" />
                          )}
                          {vehicle.isAvailable ? "Unlist" : "List"}
                        </button>
                        <button
                          onClick={() => deleteVehicle(vehicle._id)}
                          className="text-sm text-red-500 hover:text-red-600 flex items-center gap-1"
                        >
                          <TrashIcon className="w-4 h-4" /> Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </motion.div>
        )}

        {/* Bookings Tab */}
        {activeTab === "bookings" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            {bookings.length === 0 ? (
              <div className="text-center py-16 bg-surface rounded-[24px] border border-line/10">
                <CalendarIcon className="w-16 h-16 text-muted mx-auto mb-4" />
                <h3 className="display-tight text-lg text-ink mb-2">
                  No Bookings Yet
                </h3>
                <p className="text-muted">
                  When customers book your vehicles, they'll appear here.
                </p>
              </div>
            ) : (
              bookings.map((booking, idx) => (
                <motion.div
                  key={booking._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  onClick={() => viewBookingDetails(booking)}
                  className="bg-surface rounded-[24px] p-5 transition-all cursor-pointer group border border-line/10"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="flex gap-4">
                      <img
                        src={booking.vehicle?.images?.[0]}
                        alt={booking.vehicle?.name}
                        className="w-16 h-16 rounded-xl object-cover"
                      />
                      <div>
                        <h3 className="font-bold text-ink group-hover:text-amber-500 transition-colors">
                          {booking.vehicle?.name}
                        </h3>
                        <p className="text-sm text-muted">
                          {booking.vehicle?.brand} • {booking.vehicle?.year}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full ${getStatusBadge(booking.status)}`}
                          >
                            {booking.status?.toUpperCase()}
                          </span>
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full ${getPaymentStatusBadge(booking.paymentStatus)}`}
                          >
                            {booking.paymentStatus?.toUpperCase()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="display text-xl">
                        ₹{booking.totalAmount?.toLocaleString()}
                      </p>
                      <p className="text-xs text-muted flex items-center gap-1">
                        <EyeIcon className="w-3 h-3" /> Click to view details
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-4 mt-3 text-sm text-muted">
                    <div className="flex items-center gap-1">
                      <CalendarIcon className="w-4 h-4" />
                      {new Date(booking.startDate).toLocaleDateString()} -{" "}
                      {new Date(booking.endDate).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-1">
                      <UserIcon className="w-4 h-4" />
                      Customer:{" "}
                      {booking.user?.name ||
                        booking.customerDetails?.name ||
                        "Guest"}
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </motion.div>
        )}
      </div>

      {/* Booking Details Modal */}
      <AnimatePresence>
        {showBookingModal && selectedBooking && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowBookingModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            {/* Modal Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative w-full max-w-4xl max-h-[85vh] overflow-y-auto bg-surface rounded-[24px] border border-line/10"
            >
              {/* Modal Header */}
              <div className="sticky top-0 bg-surface border-b border-line/10 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
                <div>
                  <h2 className="display-tight text-xl text-ink">
                    Booking Details
                  </h2>
                  <p className="text-sm text-muted">
                    Booking ID: {selectedBooking.bookingRef}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {/* PDF Download Button */}
                  <button
                    onClick={downloadBookingPDF}
                    className="p-2 rounded-full bg-ink text-canvas hover:bg-accent hover:text-accent-ink transition-colors flex items-center gap-1"
                    title="Download PDF"
                  >
                    <DocumentArrowDownIcon className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setShowBookingModal(false)}
                    className="p-2 rounded-full hover:bg-raised transition-colors"
                  >
                    <XMarkIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="p-6">
                {/* Customer Details Section */}
                <div className="mb-6">
                  <h3 className="display-tight text-lg text-ink mb-4 flex items-center gap-2">
                    <UserIcon className="w-5 h-5 text-accent" />
                    Customer Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-raised/50 rounded-xl">
                      <div className="flex items-center gap-2 text-muted mb-1">
                        <UserIcon className="w-4 h-4" />
                        <span className="text-xs">Full Name</span>
                      </div>
                      <p className="font-medium text-ink">
                        {selectedBooking.user?.name ||
                          selectedBooking.customerDetails?.name ||
                          "N/A"}
                      </p>
                    </div>
                    <div className="p-4 bg-raised/50 rounded-xl">
                      <div className="flex items-center gap-2 text-muted mb-1">
                        <EnvelopeIcon className="w-4 h-4" />
                        <span className="text-xs">Email Address</span>
                      </div>
                      <p className="font-medium text-ink">
                        {selectedBooking.user?.email ||
                          selectedBooking.customerDetails?.email ||
                          "N/A"}
                      </p>
                    </div>
                    <div className="p-4 bg-raised/50 rounded-xl">
                      <div className="flex items-center gap-2 text-muted mb-1">
                        <PhoneIcon className="w-4 h-4" />
                        <span className="text-xs">Phone Number</span>
                      </div>
                      <p className="font-medium text-ink">
                        {selectedBooking.user?.phone ||
                          selectedBooking.customerDetails?.phone ||
                          "N/A"}
                      </p>
                    </div>
                    <div className="p-4 bg-raised/50 rounded-xl">
                      <div className="flex items-center gap-2 text-muted mb-1">
                        <MapPinIcon className="w-4 h-4" />
                        <span className="text-xs">Address</span>
                      </div>
                      <p className="font-medium text-ink">
                        {selectedBooking.customerDetails?.address ||
                          "Not provided"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Vehicle Details Section */}
                <div className="mb-6">
                  <h3 className="display-tight text-lg text-ink mb-4 flex items-center gap-2">
                    <TruckIcon className="w-5 h-5 text-accent" />
                    Vehicle Information
                  </h3>
                  <div className="flex gap-4 p-4 bg-raised/50 rounded-xl">
                    <img
                      src={selectedBooking.vehicle?.images?.[0]}
                      alt={selectedBooking.vehicle?.name}
                      className="w-24 h-24 rounded-xl object-cover"
                    />
                    <div className="flex-1">
                      <h4 className="font-bold text-ink">
                        {selectedBooking.vehicle?.name}
                      </h4>
                      <p className="text-sm text-muted">
                        {selectedBooking.vehicle?.brand} •{" "}
                        {selectedBooking.vehicle?.year}
                      </p>
                      <div className="flex flex-wrap gap-4 mt-2 text-sm">
                        <div className="flex items-center gap-1">
                          <span className="text-muted">Price:</span>
                          <span className="font-medium text-accent">
                            ₹{selectedBooking.pricePerDay?.toLocaleString()}/day
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Booking Details Section */}
                <div className="mb-6">
                  <h3 className="display-tight text-lg text-ink mb-4 flex items-center gap-2">
                    <CalendarIcon className="w-5 h-5 text-accent" />
                    Booking Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-raised/50 rounded-xl">
                      <p className="text-xs text-muted mb-1">Pickup Date</p>
                      <p className="font-medium">
                        {new Date(selectedBooking.startDate).toLocaleDateString(
                          "en-IN",
                          {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          },
                        )}
                      </p>
                    </div>
                    <div className="p-4 bg-raised/50 rounded-xl">
                      <p className="text-xs text-muted mb-1">Return Date</p>
                      <p className="font-medium">
                        {new Date(selectedBooking.endDate).toLocaleDateString(
                          "en-IN",
                          {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          },
                        )}
                      </p>
                    </div>
                    <div className="p-4 bg-raised/50 rounded-xl">
                      <p className="text-xs text-muted mb-1">
                        Pickup Location
                      </p>
                      <p className="font-medium">
                        {selectedBooking.pickupLocation}
                      </p>
                    </div>
                    <div className="p-4 bg-raised/50 rounded-xl">
                      <p className="text-xs text-muted mb-1">Total Days</p>
                      <p className="font-medium">
                        {selectedBooking.totalDays} days
                      </p>
                    </div>
                  </div>
                </div>

                {/* Price Breakdown Section */}
                <div className="mb-6">
                  <h3 className="display-tight text-lg text-ink mb-4 flex items-center gap-2">
                    <CurrencyRupeeIcon className="w-5 h-5 text-accent" />
                    Price Breakdown
                  </h3>
                  <div className="rounded-xl p-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted">
                          Price per day
                        </span>
                        <span className="font-medium">
                          ₹{selectedBooking.pricePerDay?.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted">
                          Number of days
                        </span>
                        <span className="font-medium">
                          {selectedBooking.totalDays} days
                        </span>
                      </div>
                      {selectedBooking.extras &&
                        Object.entries(selectedBooking.extras).map(
                          ([key, value]) => {
                            if (!value) return null;
                            const extraNames = {
                              insurance: "Zero Dep Insurance",
                              gps: "GPS Navigation",
                              childSeat: "Child Seat",
                              driver: "Professional Driver",
                            };
                            const extraPrices = {
                              insurance: 200,
                              gps: 100,
                              childSeat: 150,
                              driver: 500,
                            };
                            return (
                              <div
                                key={key}
                                className="flex justify-between pl-4"
                              >
                                <span className="text-muted text-sm">
                                  • {extraNames[key]}
                                </span>
                                <span className="text-muted text-sm">
                                  +₹{extraPrices[key]}/day
                                </span>
                              </div>
                            );
                          },
                        )}
                      <div className="border-t border-line/10 pt-3 mt-3">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-ink">
                            Total Amount
                          </span>
                          <span className="display text-2xl">
                            ₹
                            {selectedBooking.finalAmount?.toLocaleString() ||
                              selectedBooking.totalAmount?.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Status Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-raised/50 rounded-xl">
                    <p className="text-xs text-muted mb-1">Booking Status</p>
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusBadge(selectedBooking.status)}`}
                    >
                      {selectedBooking.status?.toUpperCase()}
                    </span>
                  </div>
                  <div className="p-4 bg-raised/50 rounded-xl">
                    <p className="text-xs text-muted mb-1">Payment Status</p>
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getPaymentStatusBadge(selectedBooking.paymentStatus)}`}
                    >
                      {selectedBooking.paymentStatus?.toUpperCase()}
                    </span>
                  </div>
                  {selectedBooking.notes && (
                    <div className="col-span-full p-4 bg-raised/50 rounded-xl">
                      <p className="text-xs text-muted mb-1">
                        Customer Notes
                      </p>
                      <p className="text-sm text-ink/80">
                        {selectedBooking.notes}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
