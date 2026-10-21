import React from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, Phone } from "lucide-react";
import { Modal, Row } from "./ui";

export default function BookingConfirmationModal({ booking, onClose }) {
  if (!booking) return null;

  const vendorDetails = booking.vendorDetails;
  const vehicle = booking.vehicle;

  return (
    <Modal open onClose={onClose} eyebrow="Booking confirmed" title="You're all set." size="lg">
      <p className="-mt-2 mb-8 text-sm text-muted">
        Your booking has been confirmed. A confirmation email has been sent to your inbox.
      </p>

      <div className="mb-8 flex items-end justify-between rounded-[20px] border border-line/10 p-5">
        <div>
          <p className="eyebrow">Reference</p>
          <p className="mt-2 font-mono text-lg">{booking.bookingRef}</p>
        </div>
        <span className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.14em] text-muted">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Paid
        </span>
      </div>

      <div className="grid gap-x-10 md:grid-cols-2">
        <div>
          <p className="eyebrow mb-2">Vehicle</p>
          <Row label="Name">{vehicle?.name}</Row>
          <Row label="Brand">{vehicle?.brand}</Row>
          <Row label="Year">{vehicle?.year}</Row>
          <Row label="Fuel"><span className="capitalize">{vehicle?.fuelType}</span></Row>
        </div>
        <div className="mt-6 md:mt-0">
          <p className="eyebrow mb-2">Rental period</p>
          <Row label="Pickup">{new Date(booking.startDate).toLocaleDateString()}</Row>
          <Row label="Return">{new Date(booking.endDate).toLocaleDateString()}</Row>
          <Row label="Duration">{booking.totalDays} days</Row>
          <Row label="Location">{booking.pickupLocation}</Row>
        </div>
      </div>

      {vendorDetails && (
        <div className="mt-8">
          <p className="eyebrow mb-2">Vendor contact</p>
          <Row label="Vendor">{vendorDetails.businessName || vendorDetails.name}</Row>
          <Row label="Phone">
            <a href={`tel:${vendorDetails.phone}`} className="link-underline inline-flex items-center gap-1.5">
              <Phone size={12} /> {vendorDetails.phone}
            </a>
          </Row>
          <Row label="Address">{vendorDetails.address}</Row>
        </div>
      )}

      <div className="mt-8 flex items-end justify-between border-t border-line/10 pt-6">
        <span className="eyebrow">Total paid</span>
        <span className="display text-5xl">₹{booking.finalAmount?.toLocaleString()}</span>
      </div>

      <div className="mt-8 flex gap-3">
        <Link to="/dashboard" onClick={onClose} className="btn-primary flex-1">
          View my bookings <ArrowUpRight size={16} />
        </Link>
        <button onClick={onClose} className="btn-ghost flex-1">
          Close
        </button>
      </div>

      <p className="mt-6 text-center text-xs text-muted">
        Need help? Contact support at support@wheelz.com
      </p>
    </Modal>
  );
}
