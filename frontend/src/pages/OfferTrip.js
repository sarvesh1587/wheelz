import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { rideShareAPI, bookingAPI } from "../services/api";
import toast from "react-hot-toast";
import { ArrowRight, ArrowUpRight, Check, ShieldCheck, Sparkles } from "lucide-react";
import { EASE } from "../components/motion";
import { PageHeader, Empty, Row, PageLoader } from "../components/ui";

export default function OfferTrip() {
  const navigate = useNavigate();
  const [confirmedBookings, setConfirmedBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    bookingId: "",
    from: "",
    to: "",
    departureDate: "",
    departureTime: "",
    totalSeats: 2,
    pricePerSeat: "",
    womenOnly: false,
    allowPets: false,
    musicPreference: "conversation",
    luggageSpace: "medium",
  });

  useEffect(() => {
    fetchConfirmedBookings();
  }, []);

  const fetchConfirmedBookings = async () => {
    try {
      const res = await bookingAPI.getAll();
      const confirmed = (res.data.bookings || []).filter(
        (booking) =>
          booking.status === "confirmed" && booking.paymentStatus === "paid",
      );
      setConfirmedBookings(confirmed);
      if (confirmed.length === 0) {
        toast.error("You need a confirmed booking before you can offer a trip");
      }
    } catch (error) {
      console.error("Error fetching bookings:", error);
      toast.error("Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  const calculateAutoPrice = () => {
    if (formData.from && formData.to && formData.totalSeats) {
      const basePrice = 200;
      const estimatedPrice = Math.ceil((basePrice * 2) / formData.totalSeats);
      setFormData({ ...formData, pricePerSeat: estimatedPrice });
      toast.success(`Suggested price: ₹${estimatedPrice} per seat`);
    } else {
      toast.error("Please enter route details first");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.bookingId) {
      toast.error("Please select a confirmed booking");
      return;
    }
    if (!formData.from || !formData.to) {
      toast.error("Please enter departure and destination cities");
      return;
    }
    if (!formData.departureDate) {
      toast.error("Please select departure date");
      return;
    }

    try {
      await rideShareAPI.create({
        bookingId: formData.bookingId,
        fromCity: formData.from, // renamed
        toCity: formData.to, // renamed
        departureDate: formData.departureDate, // separate field
        departureTime: formData.departureTime || "10:00", // separate field
        totalSeats: formData.totalSeats,
        pricePerSeat: formData.pricePerSeat || null,
        useAutoPrice: !formData.pricePerSeat,
        womenOnly: formData.womenOnly,
        petsAllowed: formData.allowPets, // renamed
        luggageAllowed: formData.luggageSpace, // renamed
        disclaimerAccepted: true, // added
      });
      toast.success("Trip offered successfully!");
      navigate("/dashboard");
    } catch (error) {
      console.error("Offer trip error:", error);
      toast.error(error.response?.data?.message || "Failed to offer trip");
    }
  };

  if (loading) return <PageLoader label="Loading bookings" />;

  const set = (patch) => setFormData({ ...formData, ...patch });

  return (
    <div className="container-x pb-24 pt-28 md:pt-32">
      <PageHeader
        index="01"
        eyebrow="Share your journey"
        title={["Offer a trip."]}
        lede="Share empty seats from your confirmed booking and earn back rental cost."
      />

      {confirmedBookings.length === 0 ? (
        <Empty
          title="No confirmed bookings."
          action={
            <button onClick={() => navigate("/vehicles")} className="btn-primary">
              Book a vehicle first <ArrowUpRight size={16} />
            </button>
          }
        >
          You need to book and confirm a vehicle before you can offer shared trips.
        </Empty>
      ) : (
        <motion.form
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: EASE }}
          onSubmit={handleSubmit}
          className="grid gap-12 lg:grid-cols-12"
        >
          <div className="space-y-12 lg:col-span-8">
            <section>
              <p className="eyebrow mb-6 flex items-center gap-3"><span className="text-accent">(01)</span> Booking</p>
              <label className="field-label">Confirmed booking</label>
              <select
                value={formData.bookingId}
                onChange={(e) => set({ bookingId: e.target.value })}
                className="field [&>option]:bg-surface"
                required
              >
                <option value="">Select a confirmed booking</option>
                {confirmedBookings.map((booking) => (
                  <option key={booking._id} value={booking._id}>
                    {booking.vehicle?.name} - {booking.pickupLocation} (
                    {new Date(booking.startDate).toLocaleDateString()})
                  </option>
                ))}
              </select>
              <p className="mt-2 flex items-center gap-1.5 text-xs text-muted">
                <ShieldCheck size={12} className="text-accent" /> Only confirmed bookings can be shared
              </p>
            </section>

            <section>
              <p className="eyebrow mb-6 flex items-center gap-3"><span className="text-accent">(02)</span> Route</p>
              <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
                <div>
                  <label className="field-label">From</label>
                  <input
                    type="text"
                    value={formData.from}
                    onChange={(e) => set({ from: e.target.value })}
                    className="field display-tight !text-2xl"
                    placeholder="Mumbai"
                    required
                  />
                </div>
                <div>
                  <label className="field-label">To</label>
                  <input
                    type="text"
                    value={formData.to}
                    onChange={(e) => set({ to: e.target.value })}
                    className="field display-tight !text-2xl"
                    placeholder="Goa"
                    required
                  />
                </div>
                <div>
                  <label className="field-label">Departure date</label>
                  <input
                    type="date"
                    value={formData.departureDate}
                    onChange={(e) => set({ departureDate: e.target.value })}
                    className="field"
                    required
                  />
                </div>
                <div>
                  <label className="field-label">Departure time</label>
                  <input
                    type="time"
                    value={formData.departureTime}
                    onChange={(e) => set({ departureTime: e.target.value })}
                    className="field"
                  />
                </div>
              </div>
            </section>

            <section>
              <p className="eyebrow mb-6 flex items-center gap-3"><span className="text-accent">(03)</span> Seats & price</p>
              <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
                <div>
                  <label className="field-label">Total seats</label>
                  <input
                    type="number"
                    min="1"
                    max="7"
                    value={formData.totalSeats}
                    onChange={(e) => set({ totalSeats: parseInt(e.target.value) })}
                    className="field"
                    required
                  />
                </div>
                <div>
                  <label className="field-label">Price per seat (₹)</label>
                  <div className="flex items-end gap-3">
                    <input
                      type="number"
                      value={formData.pricePerSeat}
                      onChange={(e) => set({ pricePerSeat: parseInt(e.target.value) })}
                      className="field flex-1"
                      placeholder="Auto"
                    />
                    <button type="button" onClick={calculateAutoPrice} className="chip">
                      <Sparkles size={13} /> Auto
                    </button>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <p className="eyebrow mb-6 flex items-center gap-3"><span className="text-accent">(04)</span> Travel preferences</p>
              <div className="mb-8 flex flex-wrap gap-2">
                {[
                  ["womenOnly", "Women only"],
                  ["allowPets", "Pets allowed"],
                ].map(([key, label]) => (
                  <button
                    key={key}
                    type="button"
                    aria-pressed={formData[key]}
                    onClick={() => set({ [key]: !formData[key] })}
                    className={`chip ${formData[key] ? "!border-accent !bg-accent !text-accent-ink" : ""}`}
                  >
                    {formData[key] && <Check size={13} />} {label}
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
                <div>
                  <label className="field-label">On the road</label>
                  <select
                    value={formData.musicPreference}
                    onChange={(e) => set({ musicPreference: e.target.value })}
                    className="field [&>option]:bg-surface"
                  >
                    <option value="silence">Silence preferred</option>
                    <option value="conversation">Conversation</option>
                    <option value="music">Music</option>
                  </select>
                </div>
                <div>
                  <label className="field-label">Luggage space</label>
                  <select
                    value={formData.luggageSpace}
                    onChange={(e) => set({ luggageSpace: e.target.value })}
                    className="field [&>option]:bg-surface"
                  >
                    <option value="none">No luggage space</option>
                    <option value="small">Small (backpack)</option>
                    <option value="medium">Medium (1 suitcase)</option>
                    <option value="large">Large (2+ suitcases)</option>
                  </select>
                </div>
              </div>
            </section>
          </div>

          <aside className="lg:col-span-4">
            <div className="sticky top-28 rounded-[24px] border border-line/10 bg-surface p-6 md:p-8">
              <p className="eyebrow mb-4">Summary</p>
              <p className="display-tight flex flex-wrap items-center gap-2 text-2xl">
                <span>{formData.from || "From"}</span>
                <ArrowRight size={18} className="text-accent" />
                <span>{formData.to || "To"}</span>
              </p>
              <div className="mt-6">
                <Row label="Date">{formData.departureDate || "—"}</Row>
                <Row label="Time">{formData.departureTime || "10:00"}</Row>
                <Row label="Seats">{formData.totalSeats || "—"}</Row>
                <Row label="Per seat">{formData.pricePerSeat ? `₹${formData.pricePerSeat}` : "Auto"}</Row>
              </div>
              <button type="submit" className="btn-primary mt-8 w-full !py-4">
                Offer trip <ArrowUpRight size={16} />
              </button>
            </div>
          </aside>
        </motion.form>
      )}
    </div>
  );
}
