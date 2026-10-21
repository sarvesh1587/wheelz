import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { rideShareAPI } from "../services/api";
import toast from "react-hot-toast";
import { ArrowRight, ArrowUpRight, Calendar, Eye, Users } from "lucide-react";
import { EASE } from "../components/motion";
import { PageHeader, StatusPill, Empty, PageLoader } from "../components/ui";

export default function MyTrips() {
  const navigate = useNavigate();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTrips();
  }, []);

  const fetchTrips = async () => {
    try {
      const res = await rideShareAPI.getMyTrips();
      setTrips(res.data.trips || []);
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to load trips");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <PageLoader label="Loading trips" />;

  return (
    <div className="container-x pb-24 pt-28 md:pt-32">
      <PageHeader
        index="01"
        eyebrow="Your shared trips"
        title={["My trips."]}
        lede="Manage your offered trips and passenger requests."
        actions={
          <Link to="/offer-trip" className="btn-primary">
            Offer a trip <ArrowUpRight size={16} />
          </Link>
        }
      />

      {trips.length === 0 ? (
        <Empty
          title="No trips offered yet."
          action={
            <button onClick={() => navigate("/offer-trip")} className="btn-primary">
              Offer a trip <ArrowUpRight size={16} />
            </button>
          }
        >
          Share your journey and earn back rental cost.
        </Empty>
      ) : (
        <div className="border-t border-line/10">
          {trips.map((trip, idx) => (
            <motion.article
              key={trip._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05, duration: 0.6, ease: EASE }}
              className="flex flex-wrap items-center justify-between gap-6 border-b border-line/10 py-8"
            >
              <div className="min-w-0 flex-1">
                <h3 className="display-tight flex flex-wrap items-center gap-3 text-2xl md:text-4xl">
                  <span>{trip.fromCity}</span>
                  <ArrowRight size={22} className="text-accent" />
                  <span>{trip.toCity}</span>
                </h3>
                <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted">
                  <span className="flex items-center gap-1.5">
                    <Calendar size={14} /> {new Date(trip.departureDate).toLocaleDateString()}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Users size={14} /> {trip.availableSeats}/{trip.totalSeats} seats
                  </span>
                  <span className="font-mono text-ink">₹{trip.pricePerSeat}/seat</span>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <StatusPill status={trip.status} />
                  {trip.pendingRequests > 0 && (
                    <StatusPill tone="pending">{trip.pendingRequests} pending request(s)</StatusPill>
                  )}
                </div>
              </div>
              <button onClick={() => navigate("/trip-requests")} className="btn-ghost">
                <Eye size={16} /> Manage
              </button>
            </motion.article>
          ))}
        </div>
      )}
    </div>
  );
}
