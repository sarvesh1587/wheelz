/**
 * TripDetail Page — View trip, request seat, chat
 * File: frontend/src/pages/TripDetail.js
 */

import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

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

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-400">
        Loading trip...
      </div>
    );
  if (!trip) return null;

  const depDate = new Date(trip.departureDate);
  const isDriver = me._id === trip.driver?._id;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-8">
      <div className="max-w-3xl mx-auto px-4 space-y-5">
        {/* Trip Header */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {trip.departureTime}
                </p>
                <p className="text-sm text-gray-500">{trip.fromCity}</p>
                {trip.fromAddress && (
                  <p className="text-xs text-gray-400">{trip.fromAddress}</p>
                )}
              </div>
              <div className="flex-1 px-4 text-center">
                <div className="flex items-center gap-2">
                  <div className="flex-1 border-t-2 border-dashed border-gray-200 dark:border-gray-700" />
                  <span className="text-xs text-gray-400 whitespace-nowrap">
                    {trip.estimatedDuration || trip.totalDistanceKm + " km"}
                  </span>
                  <div className="flex-1 border-t-2 border-dashed border-gray-200 dark:border-gray-700" />
                </div>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {trip.estimatedArrival || "—"}
                </p>
                <p className="text-sm text-gray-500">{trip.toCity}</p>
                {trip.toAddress && (
                  <p className="text-xs text-gray-400">{trip.toAddress}</p>
                )}
              </div>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                ₹{trip.pricePerSeat?.toLocaleString()}
              </p>
              <p className="text-xs text-gray-400">per seat</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 text-xs">
            <span className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-3 py-1.5 rounded-lg">
              📅 {depDate.toDateString()}
            </span>
            <span className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-3 py-1.5 rounded-lg">
              💺 {trip.availableSeats}/{trip.totalSeats} seats available
            </span>
            {trip.womenOnly && (
              <span className="bg-pink-50 dark:bg-pink-900/20 text-pink-600 px-3 py-1.5 rounded-lg border border-pink-100">
                👩 Women only
              </span>
            )}
            {trip.acAvailable && (
              <span className="bg-blue-50 dark:bg-blue-900/20 text-blue-600 px-3 py-1.5 rounded-lg">
                ❄️ AC
              </span>
            )}
            {trip.instantBook && (
              <span className="bg-green-50 text-green-600 px-3 py-1.5 rounded-lg">
                ⚡ Instant book
              </span>
            )}
            <span className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-3 py-1.5 rounded-lg capitalize">
              🧳 {trip.luggageAllowed} luggage
            </span>
            {!trip.smokingAllowed && (
              <span className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-3 py-1.5 rounded-lg">
                🚭 No smoking
              </span>
            )}
          </div>
        </div>

        {/* Driver Card */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5">
          <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase mb-3 tracking-wide">
            Your Driver
          </h3>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-amber-400 to-amber-500 rounded-full flex items-center justify-center text-xl font-bold text-white">
              {trip.driver?.name?.[0]?.toUpperCase()}
            </div>
            <div className="flex-1">
              <p className="font-semibold text-gray-900 dark:text-white">
                {trip.driver?.name}
              </p>
              <p className="text-xs text-gray-500">
                Member since {new Date(trip.driver?.createdAt).getFullYear()}
              </p>
              <div className="flex gap-2 mt-1">
                <span className="text-xs bg-green-50 dark:bg-green-900/20 text-green-600 px-2 py-0.5 rounded-full">
                  ✅ Verified
                </span>
                <span className="text-xs bg-blue-50 dark:bg-blue-900/20 text-blue-600 px-2 py-0.5 rounded-full">
                  🚗 {trip.driver?.ridesCompleted || 0} rides
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Vehicle */}
        {trip.vehicleInfo?.name && (
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5">
            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase mb-3 tracking-wide">
              Vehicle
            </h3>
            <div className="flex items-center gap-4">
              {trip.vehicleInfo.images?.[0] ? (
                <img
                  src={trip.vehicleInfo.images[0]}
                  alt="vehicle"
                  className="w-20 h-14 object-cover rounded-xl"
                />
              ) : (
                <div className="w-20 h-14 bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center text-2xl">
                  🚗
                </div>
              )}
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">
                  {trip.vehicleInfo.name}
                </p>
                <p className="text-xs text-gray-500 capitalize">
                  {trip.vehicleInfo.fuelType} • {trip.vehicleInfo.transmission}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Request / Chat Section */}
        {!isDriver && (
          <>
            {!myRequest ? (
              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                  Request a Seat
                </h3>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1.5">
                      Seats needed
                    </label>
                    <select
                      value={seats}
                      onChange={(e) => setSeats(parseInt(e.target.value))}
                      className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500"
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
                  </div>
                  <div className="flex items-end">
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-xl px-4 py-2.5 w-full">
                      <p className="text-xs text-gray-400">Total</p>
                      <p className="text-lg font-bold text-green-600">
                        ₹{(trip.pricePerSeat * seats).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
                <textarea
                  rows={2}
                  placeholder="Message for driver (optional)"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500 resize-none mb-4"
                />
                <button
                  onClick={handleRequest}
                  disabled={requesting || trip.availableSeats === 0}
                  className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white font-semibold py-3 rounded-xl transition-colors"
                >
                  {requesting
                    ? "Sending..."
                    : trip.instantBook
                      ? "⚡ Book Instantly"
                      : "Send Seat Request"}
                </button>
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    Your Request
                  </h3>
                  <span
                    className={`text-xs font-semibold px-3 py-1 rounded-full ${
                      myRequest.status === "approved"
                        ? "bg-green-100 text-green-700"
                        : myRequest.status === "pending"
                          ? "bg-amber-100 text-amber-700"
                          : "bg-red-100 text-red-700"
                    }`}
                  >
                    {myRequest.status === "approved"
                      ? "✅ Approved"
                      : myRequest.status === "pending"
                        ? "⏳ Pending"
                        : "❌ " + myRequest.status}
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  {myRequest.seatsRequested} seat
                  {myRequest.seatsRequested > 1 ? "s" : ""} • ₹
                  {myRequest.totalAmount?.toLocaleString()} total
                </p>

                {myRequest.status === "approved" &&
                  myRequest.paymentStatus === "pending" && (
                    <button
                      onClick={() =>
                        navigate(`/rideshare/pay/${myRequest._id}`)
                      }
                      className="mt-3 w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-xl transition-colors text-sm"
                    >
                      💳 Pay Now
                    </button>
                  )}

                {myRequest.status === "approved" && (
                  <button
                    onClick={() => setChatOpen((o) => !o)}
                    className="mt-3 w-full border border-green-400 text-green-600 dark:text-green-400 font-semibold py-2.5 rounded-xl hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors text-sm"
                  >
                    💬 {chatOpen ? "Close Chat" : "Chat with Driver"}
                  </button>
                )}

                {/* Chat */}
                {chatOpen && myRequest.status === "approved" && (
                  <div className="mt-4 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
                    <div className="h-48 overflow-y-auto p-3 space-y-2 bg-gray-50 dark:bg-gray-800">
                      {messages.length === 0 && (
                        <p className="text-xs text-center text-gray-400 mt-8">
                          No messages yet. Say hi!
                        </p>
                      )}
                      {messages.map((m, i) => (
                        <div
                          key={i}
                          className={`flex ${m.sender?._id === me._id || m.sender === me._id ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-xs px-3 py-2 rounded-xl text-xs ${m.sender?._id === me._id || m.sender === me._id ? "bg-green-600 text-white" : "bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-600"}`}
                          >
                            {m.text}
                          </div>
                        </div>
                      ))}
                      <div ref={chatRef} />
                    </div>
                    <div className="flex gap-2 p-2 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
                      <input
                        value={chatText}
                        onChange={(e) => setChatText(e.target.value)}
                        onKeyDown={(e) =>
                          e.key === "Enter" && handleSendMessage()
                        }
                        placeholder="Type a message..."
                        className="flex-1 text-sm px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-green-500"
                      />
                      <button
                        onClick={handleSendMessage}
                        className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg text-sm transition-colors"
                      >
                        →
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* Driver view — manage requests */}
        {isDriver && (
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Manage Requests
              </h3>
              {trip.status === "active" && (
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
                  className="text-xs bg-green-600 text-white px-3 py-1.5 rounded-lg"
                >
                  ✅ Mark Complete
                </button>
              )}
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Go to your{" "}
              <button
                onClick={() => navigate("/dashboard")}
                className="text-green-600 underline"
              >
                Dashboard
              </button>{" "}
              to approve/reject passenger requests.
            </p>
          </div>
        )}

        {/* Disclaimer */}
        <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-xl p-4 text-xs text-amber-700 dark:text-amber-400">
          ⚠️ <strong>Disclaimer:</strong> This is a cost-sharing arrangement
          between private individuals. Wheelz is a platform only and is not
          liable for incidents during the trip. Verify driver identity before
          boarding.
        </div>
      </div>
    </div>
  );
}
