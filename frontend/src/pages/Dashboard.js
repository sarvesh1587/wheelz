/**
 * User Dashboard — Complete Working Version with Accurate City Coordinates
 * File: frontend/src/pages/Dashboard.js
 */

import React, { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  bookingAPI,
  wishlistAPI,
  vehicleAPI,
  paymentAPI,
  rideShareAPI,
} from "../services/api";
import toast from "react-hot-toast";
import {
  AlertTriangle,
  ArrowRight,
  ArrowUpRight,
  Calendar,
  Check,
  Clock,
  CreditCard,
  Eye,
  FileDown,
  MapPin,
  MessageSquare,
  Navigation,
  Send,
  ShieldCheck,
  Star,
  Users,
} from "lucide-react";
import { motion } from "framer-motion";
import { Reveal } from "../components/motion";
import { PageHeader, Stat, StatusPill, Segmented, Spinner, Notice, Empty, Modal, Row } from "../components/ui";
import PaymentReceipt from "../components/PaymentReceipt";
import { useConfetti } from "../hooks/useConfetti";
import { DashboardSkeleton } from "../components/common/Skeleton";
import TrackingMap from "../components/TrackingMap";

// ─── City Coordinates Map (22 Indian Cities) ────────────────────────────────
const CITY_COORDS = {
  "Mumbai": [19.0760, 72.8777],
  "Delhi": [28.6139, 77.2090],
  "Bangalore": [12.9716, 77.5946],
  "Chennai": [13.0827, 80.2707],
  "Hyderabad": [17.3850, 78.4867],
  "Pune": [18.5204, 73.8567],
  "Kolkata": [22.5726, 88.3639],
  "Ahmedabad": [23.0225, 72.5714],
  "Jaipur": [26.9124, 75.7873],
  "Goa": [15.2993, 74.1240],
  "Manali": [32.2396, 77.1887],
  "Shimla": [31.1048, 77.1734],
  "Ooty": [11.4102, 76.6950],
  "Coorg": [12.4244, 75.7382],
  "Mysore": [12.2958, 76.6394],
  "Agra": [27.1767, 78.0081],
  "Chandigarh": [30.7333, 76.7794],
  "Pondicherry": [11.9416, 79.8083],
  "Nashik": [19.9975, 73.7898],
  "Aurangabad": [19.8762, 75.3433],
  "Surat": [21.1702, 72.8311],
  "Lucknow": [26.8467, 80.9462],
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { fireBookingConfetti, firePaymentConfetti } = useConfetti();

  const [bookings, setBookings] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("bookings");
  const [rideFilter, setRideFilter] = useState("upcoming");
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [showPassengerModal, setShowPassengerModal] = useState(false);
  const [selectedPassenger, setSelectedPassenger] = useState(null);
  const [myTrips, setMyTrips] = useState([]);
  const [myRides, setMyRides] = useState([]);
  const [cancellingTrip, setCancellingTrip] = useState(null);
  const [cancellingRide, setCancellingRide] = useState(null);
  const [processingRidePayment, setProcessingRidePayment] = useState(null);
  const [showChat, setShowChat] = useState(false);
  const [chatRide, setChatRide] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);
  const chatEndRef = useRef(null);
  const [showRating, setShowRating] = useState(false);
  const [ratingRide, setRatingRide] = useState(null);
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState("");
  const [submittingRating, setSubmittingRating] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [reportRide, setReportRide] = useState(null);
  const [reportReason, setReportReason] = useState("");
  const [submittingReport, setSubmittingReport] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [receiptBooking, setReceiptBooking] = useState(null);
  const [trackingRide, setTrackingRide] = useState(null);
  const [driverCoords, setDriverCoords] = useState(null);
  const [pickupCoords, setPickupCoords] = useState(null);
  const [dropCoords, setDropCoords] = useState(null);
  const [trackingInterval, setTrackingInterval] = useState(null);
  
  const [sharingTrips, setSharingTrips] = useState({});
  const [shareIntervals, setShareIntervals] = useState({});

  useEffect(() => { fetchDashboardData(); fetchRideShareData(); }, []);
  useEffect(() => { if (chatEndRef.current) chatEndRef.current.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const viewPassengerDetails = (request) => { setSelectedPassenger(request); setShowPassengerModal(true); };

  const fetchDashboardData = async () => {
    try {
      const [bookingsRes, wishlistRes, statsRes] = await Promise.all([bookingAPI.getAll(), wishlistAPI.get(), bookingAPI.getMyStats()]);
      setBookings(bookingsRes.data.bookings || []);
      setWishlist(wishlistRes.data.wishlist || []);
      setStats(statsRes.data);
    } catch (error) { toast.error("Failed to load dashboard data"); }
    finally { setLoading(false); }
  };

  const fetchRideShareData = async () => {
    try {
      const [tripsRes, ridesRes] = await Promise.all([rideShareAPI.getMyTrips(), rideShareAPI.getMyRides()]);
      setMyTrips(tripsRes.data.trips || []);
      setMyRides(ridesRes.data.rides || []);
    } catch (err) { console.error("Rideshare data error:", err); }
  };

  const cancelTrip = async (tripId) => {
    if (!window.confirm("Cancel this trip?")) return;
    setCancellingTrip(tripId);
    try { await rideShareAPI.cancelTrip(tripId, "Cancelled by driver"); toast.success("Trip cancelled"); fetchRideShareData(); }
    catch (error) { toast.error(error.response?.data?.message || "Failed to cancel trip"); }
    finally { setCancellingTrip(null); }
  };

  const cancelRideRequest = async (requestId) => {
    if (!window.confirm("Cancel this ride request?")) return;
    setCancellingRide(requestId);
    try { await rideShareAPI.cancelRequest(requestId); toast.success("Ride request cancelled"); fetchRideShareData(); }
    catch (error) { toast.error(error.response?.data?.message || "Failed to cancel"); }
    finally { setCancellingRide(null); }
  };

  const initiateRidePayment = async (ride) => {
    setProcessingRidePayment(ride._id);
    try {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = async () => {
        try {
          const orderRes = await rideShareAPI.createPayment(ride._id);
          const orderData = orderRes.data;
          const options = {
            key: orderData.keyId, amount: orderData.amount, currency: orderData.currency,
            name: "Wheelz", description: `Ride: ${ride.trip?.fromCity} → ${ride.trip?.toCity}`,
            order_id: orderData.orderId,
            handler: async (response) => {
              try {
                await rideShareAPI.verifyPayment({ requestId: ride._id, razorpayOrderId: response.razorpay_order_id, razorpayPaymentId: response.razorpay_payment_id, razorpaySignature: response.razorpay_signature });
                toast.success("Payment successful! Ride confirmed.");
                firePaymentConfetti();
                fetchRideShareData();
              } catch (error) { toast.error("Payment verification failed"); }
            },
            prefill: { name: user?.name, email: user?.email, contact: user?.phone },
            theme: { color: "#FF4D00" },
            modal: { ondismiss: () => { toast.error("Payment cancelled"); setProcessingRidePayment(null); } },
          };
          new window.Razorpay(options).open();
        } catch (error) { toast.error("Failed to create payment"); }
      };
      document.body.appendChild(script);
    } catch (error) { toast.error("Payment failed"); }
    finally { setProcessingRidePayment(null); }
  };

  const startSharingLocation = async (trip) => {
    if (!navigator.geolocation) { toast.error("Geolocation not supported"); return; }
    setSharingTrips(prev => ({ ...prev, [trip._id]: true }));
    toast.success("Sharing your location live!");
    const shareLocation = () => {
      navigator.geolocation.getCurrentPosition(async (pos) => {
        try {
          const token = localStorage.getItem("wheelz_token");
          const API = process.env.REACT_APP_API_URL || "https://wheelz-ldq2.onrender.com/api";
          const res = await fetch(`${API}/rideshare/${trip._id}/requests`, { headers: { Authorization: `Bearer ${token}` } });
          const data = await res.json();
          const activePassengers = (data.requests || []).filter(r => r.status === "approved" && r.paymentStatus === "paid");
          for (const req of activePassengers) {
            await fetch(`${API}/tracking/update`, {
              method: "POST",
              headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
              body: JSON.stringify({ requestId: req._id, latitude: pos.coords.latitude, longitude: pos.coords.longitude, speed: pos.coords.speed || 0, heading: pos.coords.heading || 0, accuracy: pos.coords.accuracy }),
            });
          }
        } catch (err) { console.log("Location update failed:", err.message); }
      }, (err) => console.log("GPS error:", err.message), { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 });
    };
    shareLocation();
    const interval = setInterval(shareLocation, 10000);
    setShareIntervals(prev => ({ ...prev, [trip._id]: interval }));
  };

  const stopSharingLocation = (tripId) => {
    const interval = shareIntervals[tripId];
    if (interval) clearInterval(interval);
    setSharingTrips(prev => ({ ...prev, [tripId]: false }));
    setShareIntervals(prev => { const newI = { ...prev }; delete newI[tripId]; return newI; });
    toast.success("Location sharing stopped");
  };

  const openChat = async (ride) => {
    setChatRide(ride); setShowChat(true);
    try { const res = await rideShareAPI.getMessages(ride._id); setMessages(res.data.messages || []); }
    catch (error) { setMessages([]); }
  };

  // FIXED: Use real city coordinates instead of hardcoded Mumbai
  const openTracking = async (ride) => {
    const trip = ride.trip;
    setTrackingRide(ride);
    
    // Use actual city coordinates from the lookup table
    const fromCoords = CITY_COORDS[trip?.fromCity] || [19.0760, 72.8777];
    const toCoords = CITY_COORDS[trip?.toCity] || [15.2993, 74.1240];
    
    setPickupCoords(fromCoords);
    setDropCoords(toCoords);
    
    try {
      const token = localStorage.getItem("wheelz_token");
      const API = process.env.REACT_APP_API_URL || "https://wheelz-ldq2.onrender.com/api";
      const res = await fetch(`${API}/tracking/${ride._id}`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (data.success && data.location) setDriverCoords([data.location.latitude, data.location.longitude]);
    } catch (err) {}
    const interval = setInterval(async () => {
      try {
        const token = localStorage.getItem("wheelz_token");
        const API = process.env.REACT_APP_API_URL || "https://wheelz-ldq2.onrender.com/api";
        const res = await fetch(`${API}/tracking/${ride._id}`, { headers: { Authorization: `Bearer ${token}` } });
        const data = await res.json();
        if (data.success && data.location) setDriverCoords([data.location.latitude, data.location.longitude]);
      } catch (err) {}
    }, 10000);
    setTrackingInterval(interval);
  };

  const closeTracking = () => { if (trackingInterval) clearInterval(trackingInterval); setTrackingRide(null); setTrackingInterval(null); };

  const sendMessage = async () => {
    if (!newMessage.trim() || !chatRide) return;
    setSendingMessage(true);
    try { const res = await rideShareAPI.sendMessage(chatRide._id, { text: newMessage }); setMessages(prev => [...prev, res.data.message]); setNewMessage(""); }
    catch (error) { toast.error("Failed to send message"); }
    finally { setSendingMessage(false); }
  };

  const handleChatKeyPress = (e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } };
  const openRating = (ride) => { setRatingRide(ride); setRating(0); setReview(""); setShowRating(true); };

  const submitRating = async () => {
    if (!rating) { toast.error("Please select a rating"); return; }
    setSubmittingRating(true);
    try { await rideShareAPI.rateUser(ratingRide._id, { rating, review, rateWho: "driver" }); toast.success("Thank you for your rating!"); setShowRating(false); fetchRideShareData(); }
    catch (error) { toast.error(error.response?.data?.message || "Failed to submit rating"); }
    finally { setSubmittingRating(false); }
  };

  const openReport = (ride) => { setReportRide(ride); setReportReason(""); setShowReport(true); };

  const submitReport = async () => {
    if (!reportReason.trim()) { toast.error("Please describe the issue"); return; }
    setSubmittingReport(true);
    try { await rideShareAPI.reportRide(reportRide._id, { reason: reportReason }); toast.success("Report submitted."); setShowReport(false); }
    catch (error) { toast.error("Failed to submit report"); }
    finally { setSubmittingReport(false); }
  };

  const cancelBooking = async (bookingId) => {
    if (window.confirm("Cancel this booking?")) {
      try { await bookingAPI.cancel(bookingId); toast.success("Booking cancelled"); fetchDashboardData(); }
      catch (error) { toast.error("Failed to cancel booking"); }
    }
  };

  const viewBookingDetails = (booking) => { setSelectedBooking(booking); setShowBookingModal(true); };

  const processPayment = async (booking) => {
    setProcessingPayment(true);
    try {
      if (!window.Razorpay) { toast.error("Payment system loading..."); setProcessingPayment(false); return; }
      const orderResponse = await paymentAPI.createOrder(booking._id);
      if (!orderResponse.data.orderId) { toast.error("Failed to create payment order"); setProcessingPayment(false); return; }
      const options = {
        key: orderResponse.data.keyId, amount: orderResponse.data.amount, currency: orderResponse.data.currency,
        name: "Wheelz", description: `Booking: ${booking.bookingRef}`, order_id: orderResponse.data.orderId,
        handler: async (paymentResponse) => {
          try {
            const verifyResponse = await paymentAPI.verifyPayment({ bookingId: booking._id, razorpayOrderId: paymentResponse.razorpay_order_id, razorpayPaymentId: paymentResponse.razorpay_payment_id, razorpaySignature: paymentResponse.razorpay_signature });
            if (verifyResponse.data.success) { toast.success("Payment successful!"); fireBookingConfetti(); fetchDashboardData(); setShowBookingModal(false); }
            else { toast.error("Payment verification failed"); }
          } catch (error) { toast.error("Payment verification failed"); }
        },
        prefill: { name: user?.name, email: user?.email, contact: user?.phone },
        theme: { color: "#FF4D00" },
        modal: { ondismiss: () => { setProcessingPayment(false); } },
      };
      new window.Razorpay(options).open();
    } catch (error) { toast.error(error.response?.data?.message || "Payment failed"); }
    finally { setProcessingPayment(false); }
  };

  const getRideStatusBadge = (status, paymentStatus) => {
    if (status === "pending") return { tone: "pending", label: "Pending approval" };
    if (status === "approved" && paymentStatus !== "paid") return { tone: "pending", label: "Pay now" };
    if (status === "approved" && paymentStatus === "paid") return { tone: "positive", label: "Confirmed" };
    if (status === "rejected") return { tone: "negative", label: "Rejected" };
    if (status === "cancelled") return { tone: "neutral", label: "Cancelled" };
    if (status === "completed") return { tone: "positive", label: "Completed" };
    return { tone: "neutral", label: status };
  };

  const upcomingRides = myRides.filter(r => ["pending", "approved"].includes(r.status) || (r.status === "approved" && r.paymentStatus === "paid"));
  const pastRides = myRides.filter(r => ["completed", "cancelled", "rejected"].includes(r.status));
  const visibleRides = rideFilter === "upcoming" ? upcomingRides : rideFilter === "past" ? pastRides : myRides;

  const statsCards = [
    { label: "Total bookings", value: stats?.totalBookings || 0 },
    { label: "Active bookings", value: stats?.activeBookings || 0 },
    { label: "Total spent", value: `₹${stats?.totalSpent?.toLocaleString() || 0}` },
    { label: "Wishlist", value: wishlist.length },
  ];

  const tabs = [
    { id: "bookings", label: "Bookings", count: bookings.length },
    { id: "wishlist", label: "Wishlist", count: wishlist.length },
    { id: "myrides", label: "My rides", count: myRides.length },
    { id: "mytrips", label: "Shared trips", count: myTrips.length },
    { id: "profile", label: "Profile" },
  ];

  if (loading) return <DashboardSkeleton />;

  const isMine = (msg) => msg.sender?._id === user?._id || msg.sender === user?._id;

  return (
    <div className="container-x pb-24 pt-28 md:pt-32">
      <PageHeader
        index="01"
        eyebrow="Dashboard"
        title={[`Hey, ${user?.name?.split(" ")[0] || "there"}.`]}
        lede="Track your bookings, rides, and more."
        actions={
          <Link to="/vehicles" className="btn-primary">
            Book a ride <ArrowUpRight size={16} />
          </Link>
        }
      />

      <div className="mb-14 grid grid-cols-2 gap-x-6 gap-y-10 lg:grid-cols-4">
        {statsCards.map((stat, idx) => (
          <Reveal key={stat.label} delay={idx * 0.06}>
            <Stat label={stat.label} value={stat.value} />
          </Reveal>
        ))}
      </div>

      <div className="sticky top-16 z-30 -mx-5 mb-10 overflow-x-auto border-y border-line/10 bg-canvas/85 px-5 backdrop-blur-xl sm:-mx-8 sm:px-8 md:top-20 lg:-mx-12 lg:px-12">
        <nav className="flex gap-8" aria-label="Dashboard sections">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              aria-current={activeTab === tab.id ? "page" : undefined}
              className={`relative flex items-center gap-2 whitespace-nowrap py-4 text-sm font-medium transition-colors ${
                activeTab === tab.id ? "text-ink" : "text-muted hover:text-ink"
              }`}
            >
              {tab.label}
              {tab.count > 0 && <span className="font-mono text-[11px] text-muted">{String(tab.count).padStart(2, "0")}</span>}
              {activeTab === tab.id && (
                <motion.span layoutId="dash-tab" className="absolute inset-x-0 -bottom-px h-px bg-accent" />
              )}
            </button>
          ))}
        </nav>
      </div>

      {activeTab === "bookings" && (
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="border-t border-line/10">
          {bookings.length === 0 ? <EmptyState title="No bookings yet." description="Start your first adventure with Wheelz." action="Browse vehicles" onAction={() => navigate("/vehicles")} /> : bookings.map((booking) => (<BookingCard key={booking._id} booking={booking} user={user} onViewDetails={viewBookingDetails} onProcessPayment={processPayment} onCancelBooking={cancelBooking} processingPayment={processingPayment} setReceiptBooking={setReceiptBooking} setShowReceipt={setShowReceipt} />))}
        </motion.div>
      )}

      {activeTab === "wishlist" && (
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {wishlist.length === 0 ? <div className="col-span-full"><EmptyState title="Nothing saved yet." description="Save your favourite vehicles here." action="Explore vehicles" onAction={() => navigate("/vehicles")} /></div> : wishlist.map((item) => (<WishlistCard key={item._id} item={item} navigate={navigate} />))}
        </motion.div>
      )}

      {activeTab === "profile" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid gap-10 lg:grid-cols-12">
          <div className="flex items-center gap-6 lg:col-span-5">
            <span className="display grid h-24 w-24 shrink-0 place-items-center rounded-full bg-accent text-4xl text-accent-ink">{user?.name?.[0]?.toUpperCase()}</span>
            <div className="min-w-0">
              <h2 className="display-tight text-3xl">{user?.name}</h2>
              <p className="mt-1 truncate text-muted">{user?.email}</p>
              <p className="eyebrow mt-3">Member since {new Date(user?.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
          <div className="lg:col-span-7">
            <dl className="grid grid-cols-2 border-t border-line/10">
              <div className="border-b border-line/10 py-5 pr-4"><dt className="eyebrow">Phone</dt><dd className="display-tight mt-2 text-xl">{user?.phone || "Not added"}</dd></div>
              <div className="border-b border-line/10 py-5 pr-4"><dt className="eyebrow">Location</dt><dd className="display-tight mt-2 text-xl">{user?.city || "Not added"}</dd></div>
            </dl>
            <button onClick={() => navigate("/profile")} className="btn-ghost mt-8">Edit profile <ArrowUpRight size={16} /></button>
          </div>
        </motion.div>
      )}

      {activeTab === "mytrips" && (
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="border-t border-line/10">
          {myTrips.length === 0 ? <EmptyState title="No trips offered." description="Share your journey and split costs." action="Offer a trip" onAction={() => navigate("/offer-trip")} /> : myTrips.map((trip) => (<TripCard key={trip._id} trip={trip} navigate={navigate} onCancel={cancelTrip} cancellingTrip={cancellingTrip} isSharing={sharingTrips[trip._id] || false} startSharingLocation={startSharingLocation} stopSharingLocation={() => stopSharingLocation(trip._id)} onViewPassengers={async (trip) => { try { const res = await rideShareAPI.getTripRequests(trip._id); const requests = res.data.requests || []; if (requests.length > 0) viewPassengerDetails(requests[0]); else toast.error("No passenger requests found"); } catch (error) { toast.error("Failed to load passenger details"); } }} />))}
        </motion.div>
      )}

      {activeTab === "myrides" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <Segmented
            value={rideFilter}
            onChange={setRideFilter}
            className="mb-8"
            options={[
              { value: "upcoming", label: `Upcoming (${upcomingRides.length})` },
              { value: "past", label: `Past (${pastRides.length})` },
              { value: "all", label: `All (${myRides.length})` },
            ]}
          />
          {myRides.length === 0 ? <EmptyState title="No rides found." description="Find a trip and request a seat." action="Find a trip" onAction={() => navigate("/find-trip")} /> : (
            <motion.div variants={containerVariants} initial="hidden" animate="visible" className="border-t border-line/10">
              {visibleRides.map((ride) => {
                const trip = ride.trip;
                const statusBadge = getRideStatusBadge(ride.status, ride.paymentStatus);
                return (
                  <motion.article key={ride._id} variants={itemVariants} className="border-b border-line/10 py-8">
                    <div className="flex flex-wrap items-start justify-between gap-6">
                      <div className="min-w-0 flex-1">
                        <h3 className="display-tight flex flex-wrap items-center gap-3 text-2xl md:text-3xl">
                          <span>{trip?.fromCity}</span>
                          <ArrowRight size={20} className="text-accent" />
                          <span>{trip?.toCity}</span>
                        </h3>
                        <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted">
                          <span className="flex items-center gap-1.5"><Calendar size={14} />{trip ? new Date(trip.departureDate).toLocaleDateString() : "N/A"}</span>
                          <span className="flex items-center gap-1.5"><Clock size={14} />{trip?.departureTime || "N/A"}</span>
                          <span className="flex items-center gap-1.5"><Users size={14} />{ride.seatsRequested} seat(s)</span>
                          <span className="font-mono text-ink">₹{ride.totalAmount}</span>
                        </div>
                        <div className="mt-5 flex items-center gap-3">
                          <span className="grid h-9 w-9 place-items-center rounded-full bg-raised text-sm font-semibold">{trip?.driver?.name?.[0]?.toUpperCase() || "D"}</span>
                          <div><p className="text-sm font-medium">{trip?.driver?.name || "Driver"}</p><p className="eyebrow">Driver</p></div>
                          {ride.status === "approved" && ride.paymentStatus === "paid" && (<span className="ml-4 flex items-center gap-1.5 text-xs text-muted"><ShieldCheck size={14} className="text-accent" />Contact shared</span>)}
                        </div>
                      </div>
                      <div className="flex flex-col items-start gap-4 sm:items-end">
                        <StatusPill tone={statusBadge.tone}>{statusBadge.label}</StatusPill>
                        <div className="flex flex-wrap gap-2 sm:justify-end">
                          {ride.status === "pending" && (<button onClick={() => cancelRideRequest(ride._id)} disabled={cancellingRide === ride._id} className="chip hover:!border-red-500 hover:!text-red-500">{cancellingRide === ride._id ? "Cancelling…" : "Cancel"}</button>)}
                          {ride.status === "approved" && ride.paymentStatus !== "paid" && (<button onClick={() => initiateRidePayment(ride)} disabled={processingRidePayment === ride._id} className="btn-primary !px-4 !py-2 !text-xs">{processingRidePayment === ride._id ? <Spinner className="!h-3 !w-3" /> : <><CreditCard size={13} />Pay ₹{ride.totalAmount}</>}</button>)}
                          {ride.paymentStatus === "paid" && ride.status === "approved" && (<button onClick={() => openTracking(ride)} className="chip"><MapPin size={13} /> Track</button>)}
                          {(ride.paymentStatus === "paid" || ride.status === "completed") && (<><button onClick={() => openChat(ride)} className="chip"><MessageSquare size={13} /> Chat</button><button onClick={() => navigate(`/rideshare/${trip?._id}`)} className="chip"><Eye size={13} /> View</button></>)}
                          {ride.status === "completed" && !ride.driverRatedByPassenger && (<button onClick={() => openRating(ride)} className="chip"><Star size={13} /> Rate</button>)}
                          {["approved", "completed"].includes(ride.status) && (<button onClick={() => openReport(ride)} className="chip"><AlertTriangle size={13} /> Report</button>)}
                        </div>
                      </div>
                    </div>
                    {ride.paymentStatus === "paid" && ride.status === "approved" && (
                      <Notice tone="positive" className="mt-6">
                        <span className="flex items-center justify-between gap-4"><span>Payment confirmed. Your seat is booked.</span><span className="font-mono text-ink">₹{ride.totalAmount}</span></span>
                      </Notice>
                    )}
                  </motion.article>
                );
              })}
            </motion.div>
          )}
        </motion.div>
      )}

      {/* CHAT MODAL */}
      <Modal open={showChat && !!chatRide} onClose={() => setShowChat(false)} eyebrow={chatRide ? `${chatRide.trip?.fromCity} → ${chatRide.trip?.toCity}` : ""} title={chatRide?.trip?.driver?.name || "Chat"}>
        <div className="-mx-2 h-80 space-y-3 overflow-y-auto px-2" data-lenis-prevent>
          {messages.length === 0 ? (
            <div className="grid h-full place-items-center text-center">
              <div><MessageSquare size={22} className="mx-auto mb-3 text-muted" /><p className="text-sm text-muted">Start the conversation with your driver</p></div>
            </div>
          ) : (
            messages.map((msg, idx) => (
              <div key={idx} className={`flex ${isMine(msg) ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${isMine(msg) ? "rounded-br-md bg-accent text-accent-ink" : "rounded-bl-md bg-raised text-ink"}`}>
                  <p className="text-sm">{msg.text}</p>
                  <p className="mt-1 font-mono text-[10px] opacity-70">{new Date(msg.timestamp).toLocaleTimeString()}</p>
                </div>
              </div>
            ))
          )}
          <div ref={chatEndRef} />
        </div>
        <div className="mt-6 flex items-center gap-2 rounded-full border border-line/15 p-1.5 pl-5 focus-within:border-ink">
          <input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} onKeyPress={handleChatKeyPress} placeholder="Type a message…" className="min-w-0 flex-1 bg-transparent py-2 text-sm outline-none placeholder:text-muted" />
          <button onClick={sendMessage} disabled={sendingMessage || !newMessage.trim()} aria-label="Send message" className="btn-primary !px-4 !py-2.5"><Send size={15} /></button>
        </div>
      </Modal>

      {/* PASSENGER DETAIL MODAL */}
      <Modal open={showPassengerModal && !!selectedPassenger} onClose={() => setShowPassengerModal(false)} eyebrow="Passenger details" title={selectedPassenger?.passenger?.name || "Passenger"}>
        {selectedPassenger && (
          <>
            <p className="-mt-3 mb-6 text-sm text-muted">{selectedPassenger.passenger?.email}</p>
            <Row label="Phone">{selectedPassenger.passenger?.phone || "Not shared yet"}</Row>
            <Row label="Seats requested">{selectedPassenger.seatsRequested}</Row>
            <Row label="Status"><StatusPill status={selectedPassenger.status} /></Row>
            <Row label="Payment"><StatusPill status={selectedPassenger.paymentStatus || "pending"} /></Row>
            <Row label="Amount" strong>₹{selectedPassenger.totalAmount}</Row>
            {selectedPassenger.message && (<blockquote className="mt-6 border-l-2 border-accent pl-4 text-sm italic text-muted">“{selectedPassenger.message}”</blockquote>)}
            {selectedPassenger.status === "pending" && (
              <div className="mt-8 flex gap-3">
                <button onClick={async () => { await rideShareAPI.respondToRequest(selectedPassenger._id, { action: "approve" }); toast.success("Passenger approved!"); setShowPassengerModal(false); fetchRideShareData(); }} className="btn-primary flex-1"><Check size={16} /> Approve</button>
                <button onClick={async () => { await rideShareAPI.respondToRequest(selectedPassenger._id, { action: "reject" }); toast.success("Passenger rejected"); setShowPassengerModal(false); fetchRideShareData(); }} className="btn-ghost flex-1">Reject</button>
              </div>
            )}
            {selectedPassenger.status === "approved" && selectedPassenger.paymentStatus === "paid" && (
              <button onClick={() => { setShowPassengerModal(false); openChat(selectedPassenger); }} className="btn-primary mt-8 w-full"><MessageSquare size={16} /> Chat with passenger</button>
            )}
          </>
        )}
      </Modal>

      {/* RATING MODAL */}
      <Modal open={showRating && !!ratingRide} onClose={() => setShowRating(false)} eyebrow="Your trip" title="Rate your driver" size="sm">
        <div className="mb-6 flex gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button key={star} onClick={() => setRating(star)} aria-label={`${star} star${star > 1 ? "s" : ""}`} className="transition-transform hover:scale-110">
              <Star size={32} strokeWidth={1.5} className={star <= rating ? "fill-accent text-accent" : "text-line/25"} />
            </button>
          ))}
        </div>
        <label className="field-label">Review (optional)</label>
        <textarea value={review} onChange={(e) => setReview(e.target.value)} placeholder="How was the ride?" rows={3} className="field resize-none" />
        <div className="mt-8 flex gap-3">
          <button onClick={() => setShowRating(false)} className="btn-ghost flex-1">Cancel</button>
          <button onClick={submitRating} disabled={submittingRating || !rating} className="btn-primary flex-1">{submittingRating ? "Submitting…" : "Submit rating"}</button>
        </div>
      </Modal>

      {/* RECEIPT MODAL */}
      {showReceipt && receiptBooking && (<PaymentReceipt booking={receiptBooking} onClose={() => { setShowReceipt(false); setReceiptBooking(null); }} />)}

      {/* TRACKING MODAL */}
      <Modal open={!!trackingRide} onClose={closeTracking} eyebrow="Live" title="Tracking" size="lg">
        {trackingRide && (
          <div className="overflow-hidden rounded-[20px] border border-line/10">
            <TrackingMap driverLocation={driverCoords} pickup={pickupCoords} drop={dropCoords} onCallDriver={() => window.location.href = `tel:${trackingRide?.trip?.driver?.phone}`} />
          </div>
        )}
      </Modal>

      {/* REPORT MODAL */}
      <Modal open={showReport && !!reportRide} onClose={() => setShowReport(false)} eyebrow="Safety" title="Report an issue" size="sm">
        <p className="mb-6 text-sm text-muted">Report an issue with driver <strong className="text-ink">{reportRide?.trip?.driver?.name}</strong>.</p>
        <label className="field-label">What happened?</label>
        <textarea value={reportReason} onChange={(e) => setReportReason(e.target.value)} placeholder="Describe the issue…" rows={4} className="field resize-none" />
        <div className="mt-8 flex gap-3">
          <button onClick={() => setShowReport(false)} className="btn-ghost flex-1">Cancel</button>
          <button onClick={submitReport} disabled={submittingReport || !reportReason.trim()} className="btn-primary flex-1">{submittingReport ? "Submitting…" : "Submit report"}</button>
        </div>
      </Modal>
    </div>
  );
}

// ─── SUB-COMPONENTS ──────────────────────────────────────────────────────────

function EmptyState({ title, description, action, onAction }) {
  return (
    <Empty
      title={title}
      action={action && onAction && (<button onClick={onAction} className="btn-primary">{action} <ArrowUpRight size={16} /></button>)}
    >
      {description}
    </Empty>
  );
}

function BookingCard({ booking, onViewDetails, onProcessPayment, onCancelBooking, processingPayment, setReceiptBooking, setShowReceipt }) {
  return (
    <motion.article variants={itemVariants} className="group grid gap-5 border-b border-line/10 py-6 sm:grid-cols-[8rem_1fr_auto] sm:items-center sm:gap-8">
      <img src={booking.vehicle?.images?.[0]} alt={booking.vehicle?.name} className="aspect-[4/3] w-full rounded-2xl bg-raised object-cover sm:w-32" />
      <div className="min-w-0">
        <p className="eyebrow mb-2">{booking.vehicle?.brand} · {booking.vehicle?.year}</p>
        <h3 className="display-tight text-2xl">{booking.vehicle?.name}</h3>
        <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted">
          <span className="flex items-center gap-1.5"><Calendar size={14} /> {new Date(booking.startDate).toLocaleDateString()} – {new Date(booking.endDate).toLocaleDateString()}</span>
          <span className="flex items-center gap-1.5"><MapPin size={14} /> {booking.pickupLocation}</span>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <StatusPill status={booking.status} />
          <StatusPill status={booking.paymentStatus} />
        </div>
      </div>
      <div className="flex flex-col gap-3 sm:items-end">
        <p className="display text-3xl">₹{booking.totalAmount?.toLocaleString()}</p>
        <div className="flex flex-wrap gap-2">
          {booking.paymentStatus !== "paid" && booking.status !== "confirmed" ? (
            <button onClick={() => onProcessPayment(booking)} disabled={processingPayment} className="btn-primary !px-4 !py-2 !text-xs">{processingPayment ? "Processing…" : "Pay now"}</button>
          ) : (
            <button onClick={() => { setReceiptBooking(booking); setShowReceipt(true); }} className="chip"><FileDown size={13} /> Receipt</button>
          )}
          <Link to={`/bookings/${booking._id}`} onClick={() => onViewDetails(booking)} className="chip"><Eye size={13} /> View</Link>
        </div>
        {booking.status === "pending" && booking.paymentStatus !== "paid" && (
          <button onClick={() => onCancelBooking(booking._id)} className="link-underline text-xs text-muted hover:text-red-500">Cancel booking</button>
        )}
      </div>
    </motion.article>
  );
}

function WishlistCard({ item, navigate }) {
  return (
    <motion.article variants={itemVariants} className="group">
      <button onClick={() => navigate(`/vehicles/${item.vehicle?._id}`)} className="block w-full overflow-hidden rounded-[20px] bg-raised text-left">
        <img src={item.vehicle?.images?.[0]} alt={item.vehicle?.name} className="aspect-[4/3] w-full object-cover transition-transform duration-700 ease-out-expo group-hover:scale-105" />
      </button>
      <div className="mt-4 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="display-tight truncate text-xl">{item.vehicle?.name}</h3>
          <p className="mt-1 flex items-center gap-2 text-sm text-muted">
            {item.vehicle?.brand}
            <span className="flex items-center gap-1 text-ink"><Star size={12} className="fill-accent text-accent" />{item.vehicle?.averageRating || 0}</span>
            <span className="text-xs">({item.vehicle?.totalReviews || 0})</span>
          </p>
        </div>
        <p className="text-right font-mono text-sm">₹{item.vehicle?.currentPrice?.toLocaleString()}<span className="block text-[11px] text-muted">per day</span></p>
      </div>
      <button onClick={() => navigate(`/vehicles/${item.vehicle?._id}`)} className="btn-ghost mt-4 w-full !py-2.5">Book now <ArrowUpRight size={14} /></button>
    </motion.article>
  );
}

function TripCard({ trip, navigate, onCancel, cancellingTrip, onViewPassengers, isSharing, startSharingLocation, stopSharingLocation }) {
  return (
    <motion.article variants={itemVariants} className="flex flex-wrap items-start justify-between gap-6 border-b border-line/10 py-8">
      <div className="min-w-0 flex-1">
        <h3 className="display-tight flex flex-wrap items-center gap-3 text-2xl md:text-3xl"><span>{trip.fromCity}</span><ArrowRight size={20} className="text-accent" /><span>{trip.toCity}</span></h3>
        <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted">
          <span className="flex items-center gap-1.5"><Calendar size={14} /> {new Date(trip.departureDate).toLocaleDateString()} at {trip.departureTime}</span>
          <span className="flex items-center gap-1.5"><Users size={14} /> {trip.availableSeats}/{trip.totalSeats} seats</span>
          <span className="font-mono text-ink">₹{trip.pricePerSeat}/seat</span>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <StatusPill status={trip.status} />
          {trip.pendingRequests > 0 && (<StatusPill tone="pending">{trip.pendingRequests} pending</StatusPill>)}
          {trip.approvedPassengers > 0 && (<StatusPill tone="positive">{trip.approvedPassengers} approved</StatusPill>)}
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {(trip.pendingRequests > 0 || trip.approvedPassengers > 0) && (<button onClick={() => onViewPassengers(trip)} className="chip"><Users size={13} /> Passengers</button>)}
        <button onClick={() => navigate(`/rideshare/${trip._id}`)} className="chip"><Eye size={13} /> View trip</button>
        {trip.status === "active" && (
          isSharing ? (
            <button onClick={stopSharingLocation} className="chip !border-accent !text-accent"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" /> Stop sharing</button>
          ) : (
            <button onClick={() => startSharingLocation(trip)} className="chip"><Navigation size={13} /> Share location</button>
          )
        )}
        {(trip.status === "active" || trip.status === "full") && (<button onClick={() => onCancel(trip._id)} disabled={cancellingTrip === trip._id} className="chip hover:!border-red-500 hover:!text-red-500">{cancellingTrip === trip._id ? "Cancelling…" : "Cancel"}</button>)}
      </div>
    </motion.article>
  );
}
