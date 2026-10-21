import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { bookingAPI } from "../services/api";
import LoadingSpinner from "../components/common/LoadingSpinner";
import RazorpayButton from "../components/RazorpayButton";
import { ArrowLeft, ArrowUpRight, Mail, MapPin, Phone, Store, User } from "lucide-react";
import { Magnetic } from "../components/motion";
import { PageHeader, Panel, Row, StatusPill, Modal } from "../components/ui";
import toast from "react-hot-toast";

export default function BookingDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  useEffect(() => {
    fetchBooking();
  }, [id]);

  const fetchBooking = async () => {
    try {
      const res = await bookingAPI.getOne(id);
      setBooking(res.data.booking);
    } catch (error) {
      console.error("Error fetching booking:", error);
      toast.error("Failed to load booking details");
      navigate("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentClick = () => {
    setShowPaymentModal(true);
  };

  const handlePaymentSuccess = () => {
    setShowPaymentModal(false);
    toast.success("Payment successful! Booking confirmed.");
    fetchBooking(); // Refresh booking details
  };

  const handlePaymentCancel = () => {
    setShowPaymentModal(false);
    toast.error("Payment cancelled");
  };

  if (loading) return <LoadingSpinner />;
  if (!booking) return null;

  const vendorDetails = booking.vendorDetails;
  const customerDetails = booking.customerDetails;

  return (
    <div className="container-x pb-24 pt-28 md:pt-32">
      <Link
        to="/dashboard"
        className="link-underline mb-8 inline-flex items-center gap-2 text-sm text-muted hover:text-ink"
      >
        <ArrowLeft size={14} /> Back to dashboard
      </Link>

      <PageHeader
        index="01"
        eyebrow={`Booking · ${booking.bookingRef}`}
        title={[booking.vehicle?.name || "Booking details"]}
        size="md"
        actions={
          <>
            <StatusPill status={booking.status} />
            <StatusPill status={booking.paymentStatus === "paid" ? "paid" : "pending"}>
              {booking.paymentStatus === "paid" ? "Paid" : "Payment pending"}
            </StatusPill>
          </>
        }
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel index="01" title="Booking">
          <Row label="Vehicle">{booking.vehicle?.name}</Row>
          <Row label="Status"><StatusPill status={booking.status} /></Row>
          <Row label="Payment">{booking.paymentStatus === "paid" ? "Paid" : "Pending"}</Row>
          <div className="mt-6 flex items-end justify-between border-t border-line/10 pt-6">
            <span className="eyebrow">Total</span>
            <span className="display text-5xl">₹{booking.finalAmount?.toLocaleString()}</span>
          </div>
        </Panel>

        <Panel index="02" title="Rental period">
          <Row label="Pickup date">{new Date(booking.startDate).toLocaleDateString()}</Row>
          <Row label="Return date">{new Date(booking.endDate).toLocaleDateString()}</Row>
          <Row label="Duration">{booking.totalDays} days</Row>
          <Row label="Pickup location">{booking.pickupLocation}</Row>
        </Panel>

        {/* Vendor Details (Customer View) */}
        {vendorDetails && (
          <Panel index="03" title="Vendor · for pickup">
            <p className="display-tight flex items-center gap-3 text-2xl">
              <Store size={18} className="text-accent" />
              {vendorDetails.businessName || vendorDetails.name}
            </p>
            <div className="mt-5 space-y-3 text-sm">
              <a href={`tel:${vendorDetails.phone}`} className="link-underline inline-flex items-center gap-3">
                <Phone size={14} className="text-muted" /> {vendorDetails.phone}
              </a>
              <p className="flex items-start gap-3 text-muted">
                <MapPin size={14} className="mt-0.5 shrink-0" /> {vendorDetails.address}
              </p>
            </div>
            <p className="mt-6 border-t border-line/10 pt-4 text-xs text-muted">
              Please call vendor to coordinate pickup time
            </p>
          </Panel>
        )}

        {/* Customer Details (Vendor View - only if admin or vendor) */}
        {customerDetails && booking.user?._id !== customerDetails.userId && (
          <Panel index="04" title="Customer">
            <p className="display-tight flex items-center gap-3 text-2xl">
              <User size={18} className="text-accent" />
              {customerDetails.name}
            </p>
            <div className="mt-5 space-y-3 text-sm">
              <a href={`tel:${customerDetails.phone}`} className="link-underline inline-flex items-center gap-3">
                <Phone size={14} className="text-muted" /> {customerDetails.phone}
              </a>
              <p className="flex items-center gap-3 text-muted">
                <Mail size={14} /> {customerDetails.email}
              </p>
              <p className="flex items-start gap-3 text-muted">
                <MapPin size={14} className="mt-0.5 shrink-0" /> {customerDetails.address}
              </p>
            </div>
          </Panel>
        )}
      </div>

      {/* Action Buttons */}
      <div className="mt-10 flex flex-wrap gap-3">
        {booking.paymentStatus !== "paid" && (
          <Magnetic>
            <button onClick={handlePaymentClick} className="btn-primary">
              Complete payment <ArrowUpRight size={16} />
            </button>
          </Magnetic>
        )}
        <Link to="/dashboard" className="btn-ghost">
          Back to dashboard
        </Link>
      </div>

      {booking.paymentStatus !== "paid" && (
        <Modal open={showPaymentModal} onClose={() => setShowPaymentModal(false)} eyebrow="Checkout" title="Complete payment" size="sm">
          <Row label="Vehicle">{booking.vehicle?.name}</Row>
          <Row label="Duration">{booking.totalDays} days</Row>
          <div className="mb-8 mt-4 flex items-end justify-between border-t border-line/10 pt-5">
            <span className="eyebrow">Amount</span>
            <span className="display text-4xl">₹{booking.finalAmount?.toLocaleString()}</span>
          </div>
          <RazorpayButton
            bookingId={booking._id}
            amount={booking.finalAmount}
            onSuccess={handlePaymentSuccess}
            onCancel={handlePaymentCancel}
          />
          <button
            onClick={() => setShowPaymentModal(false)}
            className="link-underline mx-auto mt-4 block text-sm text-muted hover:text-ink"
          >
            Cancel
          </button>
        </Modal>
      )}
    </div>
  );
}
