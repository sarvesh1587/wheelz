/**
 * TripDetail Page — View trip, request seat, chat
 * File: frontend/src/pages/TripDetail.js
 */

import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { ArrowLeft, ArrowUpRight, Car, Check, MessageSquare, Send, ShieldAlert } from "lucide-react";
import { SplitText } from "../components/motion";
import { Panel, StatusPill, Notice, PageLoader } from "../components/ui";

const API =
  process.env.REACT_APP_API_URL || "https://wheelz-ldq2.onrender.com/api";

export default function TripDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [trip, setTrip] = useState(null);
  const [myRequest, setMyRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [requesting, setRequesting] = useState(false);
  const [seats, setSeats] = useState(1);
  const [message, setMessage] = useState("");
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [chatText, setChatText] = useState("");
  const chatRef = useRef(null);

  const token = localStorage.getItem("wheelz_token");
  const me = JSON.parse(localStorage.getItem("wheelz_user") || "{}");

  useEffect(() => {
    fetchTrip();
  }, [id]);
  useEffect(() => {
    if (chatOpen && myRequest) fetchMessages();
  }, [chatOpen]);

  const fetchTrip = async () => {
    try {
      const res = await axios.get(`${API}/rideshare/${id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      setTrip(res.data.trip);
      // check if current user already has a request
      if (me._id) {
        const reqs = await axios.get(`${API}/rideshare/my/rides`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const existing = reqs.data.rides?.find((r) => r.trip?._id === id);
        setMyRequest(existing || null);
      }
    } catch {
      toast.error("Trip not found");
      navigate("/find-trip");
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async () => {
    if (!myRequest) return;
    try {
      const res = await axios.get(
        `${API}/rideshare/request/${myRequest._id}/messages`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setMessages(res.data.messages || []);
      setTimeout(
        () => chatRef.current?.scrollIntoView({ behavior: "smooth" }),
        100,
      );
    } catch {}
  };

  const handleRequest = async () => {
    if (!token) return navigate("/login");
    setRequesting(true);
    try {
      const res = await axios.post(
        `${API}/rideshare/request`,
        { tripId: id, seatsRequested: seats, message },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      toast.success(res.data.message);
      setMyRequest(res.data.request);
    } catch (err) {
      toast.error(err.response?.data?.message || "Request failed");
    } finally {
      setRequesting(false);
    }
  };

  const handleSendMessage = async () => {
    if (!chatText.trim() || !myRequest) return;
    try {
      const res = await axios.post(
        `${API}/rideshare/request/${myRequest._id}/message`,
        { text: chatText },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setMessages((prev) => [...prev, res.data.message]);
      setChatText("");
      setTimeout(
        () => chatRef.current?.scrollIntoView({ behavior: "smooth" }),
        100,
      );
    } catch {
      toast.error("Message failed");
    }
  };

  if (loading) return <PageLoader label="Loading trip" />;
  if (!trip) return null;

  const depDate = new Date(trip.departureDate);
  const isDriver = me._id === trip.driver?._id;
  const isMine = (m) => m.sender?._id === me._id || m.sender === me._id;

  const tags = [
    depDate.toDateString(),
    `${trip.availableSeats}/${trip.totalSeats} seats available`,
    trip.womenOnly && "Women only",
    trip.acAvailable && "AC",
    trip.instantBook && "Instant book",
    trip.luggageAllowed && `${trip.luggageAllowed} luggage`,
    !trip.smokingAllowed && "No smoking",
  ].filter(Boolean);

  return (
    <div className="container-x pb-24 pt-28 md:pt-32">
      <button
        onClick={() => navigate(-1)}
        className="link-underline mb-8 inline-flex items-center gap-2 text-sm text-muted hover:text-ink"
      >
        <ArrowLeft size={14} /> Back
      </button>

      {/* Trip Header */}
      <header className="mb-14 border-b border-line/10 pb-10">
        <p className="eyebrow mb-6 flex items-center gap-3"><span className="text-accent">(01)</span> Shared trip</p>
        <h1 className="display text-5xl md:text-7xl lg:text-8xl">
          <SplitText lines={[trip.fromCity, `to ${trip.toCity}.`]} lineClassName="[&:last-child]:text-muted" />
        </h1>
        <div className="mt-10 grid gap-8 md:grid-cols-12 md:items-end">
          <div className="flex items-center gap-6 md:col-span-8">
            <div>
              <p className="display-tight text-3xl">{trip.departureTime}</p>
              <p className="eyebrow mt-1">{trip.fromAddress || trip.fromCity}</p>
            </div>
            <div className="flex flex-1 items-center gap-3">
              <span className="h-2 w-2 rounded-full bg-accent" />
              <span className="h-px flex-1 bg-line/20" />
              <span className="whitespace-nowrap font-mono text-xs text-muted">
                {trip.estimatedDuration || trip.totalDistanceKm + " km"}
              </span>
              <span className="h-px flex-1 bg-line/20" />
              <span className="h-2 w-2 rounded-full border border-ink" />
            </div>
            <div className="text-right">
              <p className="display-tight text-3xl">{trip.estimatedArrival || "—"}</p>
              <p className="eyebrow mt-1">{trip.toAddress || trip.toCity}</p>
            </div>
          </div>
          <div className="md:col-span-4 md:text-right">
            <p className="display text-5xl">₹{trip.pricePerSeat?.toLocaleString()}</p>
            <p className="eyebrow mt-1">per seat</p>
          </div>
        </div>
        <div className="mt-8 flex flex-wrap gap-2">
          {tags.map((t) => (
            <span key={t} className="chip capitalize">{t}</span>
          ))}
        </div>
      </header>

      <div className="grid gap-10 lg:grid-cols-12">
        <div className="space-y-6 lg:col-span-7">
          {/* Driver Card */}
          <Panel index="02" title="Your driver">
            <div className="flex items-center gap-5">
              <span className="display grid h-16 w-16 shrink-0 place-items-center rounded-full bg-accent text-2xl text-accent-ink">
                {trip.driver?.name?.[0]?.toUpperCase()}
              </span>
              <div className="min-w-0 flex-1">
                <p className="display-tight text-2xl">{trip.driver?.name}</p>
                <p className="mt-1 text-sm text-muted">
                  Member since {new Date(trip.driver?.createdAt).getFullYear()}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <StatusPill tone="positive">Verified</StatusPill>
                  <StatusPill tone="neutral">{trip.driver?.ridesCompleted || 0} rides</StatusPill>
                </div>
              </div>
            </div>
          </Panel>

          {/* Vehicle */}
          {trip.vehicleInfo?.name && (
            <Panel index="03" title="Vehicle">
              <div className="flex items-center gap-5">
                {trip.vehicleInfo.images?.[0] ? (
                  <img
                    src={trip.vehicleInfo.images[0]}
                    alt="vehicle"
                    className="h-20 w-28 rounded-2xl bg-raised object-cover"
                  />
                ) : (
                  <span className="grid h-20 w-28 place-items-center rounded-2xl bg-raised text-muted">
                    <Car size={22} strokeWidth={1.5} />
                  </span>
                )}
                <div>
                  <p className="display-tight text-2xl">{trip.vehicleInfo.name}</p>
                  <p className="mt-1 text-sm capitalize text-muted">
                    {trip.vehicleInfo.fuelType} · {trip.vehicleInfo.transmission}
                  </p>
                </div>
              </div>
            </Panel>
          )}

          {/* Disclaimer */}
          <Notice icon={ShieldAlert} title="Disclaimer">
            This is a cost-sharing arrangement between private individuals. Wheelz is a platform only and is not
            liable for incidents during the trip. Verify driver identity before boarding.
          </Notice>
        </div>

        <aside className="lg:col-span-5">
          <div className="sticky top-28">
            {/* Request / Chat Section */}
            {!isDriver && (
              <>
                {!myRequest ? (
                  <Panel title="Request a seat">
                    <label className="field-label">Seats needed</label>
                    <select
                      value={seats}
                      onChange={(e) => setSeats(parseInt(e.target.value))}
                      className="field [&>option]:bg-surface"
                    >
                      {Array.from(
                        { length: trip.availableSeats },
                        (_, i) => i + 1,
                      ).map((n) => (
                        <option key={n} value={n}>
                          {n}
                        </option>
                      ))}
                    </select>
                    <label className="field-label mt-8">Message for driver (optional)</label>
                    <textarea
                      rows={2}
                      placeholder="Hi! I'll be at the pickup on time."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="field resize-none"
                    />
                    <div className="mt-8 flex items-end justify-between border-t border-line/10 pt-6">
                      <span className="eyebrow">Total</span>
                      <span className="display text-5xl">₹{(trip.pricePerSeat * seats).toLocaleString()}</span>
                    </div>
                    <button
                      onClick={handleRequest}
                      disabled={requesting || trip.availableSeats === 0}
                      className="btn-primary mt-8 w-full !py-4"
                    >
                      {requesting
                        ? "Sending…"
                        : trip.instantBook
                          ? "Book instantly"
                          : "Send seat request"}
                      {!requesting && <ArrowUpRight size={16} />}
                    </button>
                  </Panel>
                ) : (
                  <Panel
                    title="Your request"
                    action={
                      <StatusPill status={myRequest.status}>
                        {myRequest.status === "approved"
                          ? "Approved"
                          : myRequest.status === "pending"
                            ? "Pending"
                            : "" + myRequest.status}
                      </StatusPill>
                    }
                  >
                    <p className="display-tight text-2xl">
                      {myRequest.seatsRequested} seat
                      {myRequest.seatsRequested > 1 ? "s" : ""} · ₹
                      {myRequest.totalAmount?.toLocaleString()}
                    </p>

                    <div className="mt-6 space-y-3">
                      {myRequest.status === "approved" &&
                        myRequest.paymentStatus === "pending" && (
                          <button
                            onClick={() =>
                              navigate(`/rideshare/pay/${myRequest._id}`)
                            }
                            className="btn-primary w-full"
                          >
                            Pay now <ArrowUpRight size={16} />
                          </button>
                        )}

                      {myRequest.status === "approved" && (
                        <button onClick={() => setChatOpen((o) => !o)} className="btn-ghost w-full">
                          <MessageSquare size={16} /> {chatOpen ? "Close chat" : "Chat with driver"}
                        </button>
                      )}
                    </div>

                    {/* Chat */}
                    {chatOpen && myRequest.status === "approved" && (
                      <div className="mt-6 border-t border-line/10 pt-6">
                        <div className="h-56 space-y-2 overflow-y-auto pr-1" data-lenis-prevent>
                          {messages.length === 0 && (
                            <p className="mt-16 text-center text-xs text-muted">
                              No messages yet. Say hi!
                            </p>
                          )}
                          {messages.map((m, i) => (
                            <div key={i} className={`flex ${isMine(m) ? "justify-end" : "justify-start"}`}>
                              <div
                                className={`max-w-xs rounded-2xl px-3.5 py-2 text-sm ${
                                  isMine(m) ? "rounded-br-md bg-accent text-accent-ink" : "rounded-bl-md bg-raised text-ink"
                                }`}
                              >
                                {m.text}
                              </div>
                            </div>
                          ))}
                          <div ref={chatRef} />
                        </div>
                        <div className="mt-4 flex items-center gap-2 rounded-full border border-line/15 p-1.5 pl-5 focus-within:border-ink">
                          <input
                            value={chatText}
                            onChange={(e) => setChatText(e.target.value)}
                            onKeyDown={(e) =>
                              e.key === "Enter" && handleSendMessage()
                            }
                            placeholder="Type a message…"
                            className="min-w-0 flex-1 bg-transparent py-2 text-sm outline-none placeholder:text-muted"
                          />
                          <button onClick={handleSendMessage} aria-label="Send message" className="btn-primary !px-4 !py-2.5">
                            <Send size={15} />
                          </button>
                        </div>
                      </div>
                    )}
                  </Panel>
                )}
              </>
            )}

            {/* Driver view — manage requests */}
            {isDriver && (
              <Panel
                title="Manage requests"
                action={
                  trip.status === "active" && (
                    <button
                      onClick={async () => {
                        const token = localStorage.getItem("wheelz_token");
                        await axios.put(
                          `${API}/rideshare/${id}/complete`,
                          {},
                          { headers: { Authorization: `Bearer ${token}` } },
                        );
                        toast.success("Trip marked complete!");
                        fetchTrip();
                      }}
                      className="chip"
                    >
                      <Check size={13} /> Mark complete
                    </button>
                  )
                }
              >
                <p className="text-sm text-muted">
                  Go to your{" "}
                  <button
                    onClick={() => navigate("/dashboard")}
                    className="link-underline text-ink"
                  >
                    dashboard
                  </button>{" "}
                  to approve or reject passenger requests.
                </p>
              </Panel>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
