import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { rideShareAPI } from "../services/api";
import toast from "react-hot-toast";
import { ArrowLeft, ArrowRight, Calendar, Check, Mail, Users, X } from "lucide-react";
import { EASE } from "../components/motion";
import { PageHeader, Empty, PageLoader } from "../components/ui";

export default function TripRequests() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const res = await rideShareAPI.getDriverRequests();
      setRequests(res.data.requests || []);
    } catch (error) {
      console.error("Error fetching requests:", error);
      toast.error("Failed to load requests");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (requestId) => {
    setProcessingId(requestId);
    try {
      await rideShareAPI.respondToRequest(requestId, { action: "approve" });
      toast.success("Request approved! Passenger notified.");
      fetchRequests();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to approve");
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (requestId) => {
    setProcessingId(requestId);
    try {
      await rideShareAPI.respondToRequest(requestId, { action: "reject" });
      toast.success("Request rejected");
      fetchRequests();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to reject");
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) return <PageLoader label="Loading requests" />;

  return (
    <div className="container-x pb-24 pt-28 md:pt-32">
      <button
        onClick={() => navigate("/dashboard")}
        className="link-underline mb-8 inline-flex items-center gap-2 text-sm text-muted hover:text-ink"
      >
        <ArrowLeft size={14} /> Back to dashboard
      </button>

      <PageHeader
        index="01"
        eyebrow="Passenger requests"
        title={["Trip requests."]}
        lede="Approve or reject passengers who want to join your trip."
      />

      {requests.length === 0 ? (
        <Empty title="No pending requests.">
          When passengers request to join your trips, they'll appear here.
        </Empty>
      ) : (
        <div className="border-t border-line/10">
          {requests.map((req, idx) => (
            <motion.article
              key={req._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05, duration: 0.6, ease: EASE }}
              className="grid gap-6 border-b border-line/10 py-8 lg:grid-cols-12 lg:items-center"
            >
              <div className="lg:col-span-4">
                <h3 className="display-tight flex flex-wrap items-center gap-3 text-2xl">
                  <span>{req.trip?.fromCity}</span>
                  <ArrowRight size={18} className="text-accent" />
                  <span>{req.trip?.toCity}</span>
                </h3>
                <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm text-muted">
                  <span className="flex items-center gap-1.5">
                    <Calendar size={14} /> {new Date(req.trip?.departureDate).toLocaleDateString()}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Users size={14} /> {req.seatsRequested} seat(s)
                  </span>
                </div>
              </div>

              <div className="flex gap-4 lg:col-span-5">
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-raised font-semibold">
                  {req.passenger?.name?.[0]?.toUpperCase() || "P"}
                </span>
                <div className="min-w-0">
                  <p className="font-medium">{req.passenger?.name || "Passenger"}</p>
                  <p className="mt-0.5 flex items-center gap-1.5 truncate text-sm text-muted">
                    <Mail size={13} /> {req.passenger?.email || "Email not available"}
                  </p>
                  {req.message && (
                    <blockquote className="mt-3 border-l-2 border-accent pl-3 text-sm italic text-muted">
                      “{req.message}”
                    </blockquote>
                  )}
                </div>
              </div>

              <div className="flex gap-2 lg:col-span-3 lg:justify-end">
                <button
                  onClick={() => handleApprove(req._id)}
                  disabled={processingId === req._id}
                  className="btn-primary !px-5 !py-2.5"
                >
                  <Check size={15} /> Approve
                </button>
                <button
                  onClick={() => handleReject(req._id)}
                  disabled={processingId === req._id}
                  className="btn-ghost !px-5 !py-2.5 hover:!border-red-500 hover:!bg-transparent hover:!text-red-500"
                >
                  <X size={15} /> Reject
                </button>
              </div>
            </motion.article>
          ))}
        </div>
      )}
    </div>
  );
}
