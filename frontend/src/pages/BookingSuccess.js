import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { bookingAPI } from "../services/api";
import LoadingSpinner from "../components/common/LoadingSpinner";
import PaymentReceipt from "../components/PaymentReceipt";
import { ArrowUpRight, Check, Download } from "lucide-react";
import { motion } from "framer-motion";
import { SplitText, Magnetic, Reveal, EASE } from "../components/motion";
import { Empty } from "../components/ui";

export default function BookingSuccess() {
  const { id } = useParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showReceipt, setShowReceipt] = useState(false);

  useEffect(() => {
    bookingAPI
      .getOne(id)
      .then((res) => setBooking(res.data.booking))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <LoadingSpinner />;
  if (!booking)
    return (
      <div className="container-x pt-28">
        <Empty
          title="Booking not found."
          action={
            <Link to="/dashboard" className="btn-ghost">
              Go to dashboard
            </Link>
          }
        />
      </div>
    );

  const details = [
    ["Pickup", new Date(booking.startDate).toLocaleDateString()],
    ["Return", new Date(booking.endDate).toLocaleDateString()],
    ["Location", booking.pickupLocation],
    ["Total", `₹${booking.finalAmount.toLocaleString()}`],
  ];

  return (
    <div className="container-x flex min-h-screen flex-col justify-center pb-20 pt-28">
      <motion.span
        initial={{ scale: 0, rotate: -90 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ duration: 0.9, ease: EASE }}
        className="mb-8 grid h-14 w-14 place-items-center rounded-full bg-accent text-accent-ink"
      >
        <Check size={26} strokeWidth={2.5} />
      </motion.span>

      <p className="eyebrow mb-6">Booking confirmed</p>
      <h1 className="display text-6xl md:text-8xl lg:text-9xl">
        <SplitText lines={["You're", "all set."]} lineClassName="[&:last-child]:text-muted" delay={0.15} />
      </h1>
      <p className="mt-6 max-w-lg text-muted">
        Your booking has been confirmed. A confirmation email has been sent to your inbox.
      </p>

      <Reveal delay={0.3} className="mt-14 grid gap-px overflow-hidden rounded-[24px] border border-line/10 bg-line/10 md:grid-cols-5">
        <div className="bg-surface p-6 md:col-span-1">
          <p className="eyebrow">Reference</p>
          <p className="mt-3 break-all font-mono text-lg">{booking.bookingRef}</p>
        </div>
        {details.map(([label, value]) => (
          <div key={label} className="bg-surface p-6">
            <p className="eyebrow">{label}</p>
            <p className={`mt-3 ${label === "Total" ? "display text-3xl" : "display-tight text-xl"}`}>{value}</p>
          </div>
        ))}
      </Reveal>

      <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
        <Magnetic>
          <Link to="/dashboard" className="btn-primary">
            View my bookings <ArrowUpRight size={16} />
          </Link>
        </Magnetic>
        <button onClick={() => setShowReceipt(true)} className="btn-ghost">
          <Download size={16} /> Download receipt
        </button>
        <Link to="/vehicles" className="link-underline text-sm text-muted hover:text-ink sm:ml-4">
          Browse more vehicles
        </Link>
      </div>

      <p className="mt-12 border-t border-line/10 pt-6 text-xs text-muted">
        Need help? Contact our 24/7 support at support@wheelz.com
      </p>

      {/* Payment Receipt Modal */}
      {showReceipt && (
        <PaymentReceipt
          booking={booking}
          onClose={() => setShowReceipt(false)}
        />
      )}
    </div>
  );
}
