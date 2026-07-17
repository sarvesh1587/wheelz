import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { rideShareAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import {
  MapPinIcon,
  CalendarIcon,
  UserGroupIcon,
  CurrencyRupeeIcon,
  SparklesIcon,
  ShieldCheckIcon,
  UserCircleIcon,
  CheckCircleIcon,
  XCircleIcon,
  EnvelopeIcon,
  ArrowLeftIcon,
  PhoneIcon,
  CreditCardIcon,
  EyeIcon,
  ChatBubbleLeftRightIcon,
  StarIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

export default function RideShareDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [trip, setTrip] = useState(null);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [showDriverModal, setShowDriverModal] = useState(false);
  const [offerPrice, setOfferPrice] = useState("");
  const [showOffer, setShowOffer] = useState(false);

  useEffect(() => {
    fetchTripDetails();
  }, [id]);

  const fetchTripDetails = async () => {
    try {
      const tripRes = await rideShareAPI.getOne(id);
      setTrip(tripRes.data.trip);
      const isDriver = tripRes.data.trip?.driver?._id === user?._id;
      if (isDriver) {
        try {
          const requestsRes = await rideShareAPI.getTripRequests(id);
          setRequests(requestsRes.data.requests || []);
        } catch (err) {
          setRequests([]);
        }
      } else {
        try {
          const ridesRes = await rideShareAPI.getMyRides();
          const myRides = ridesRes.data.rides || [];
          const myReq = myRides.find(
            (r) => r.trip?._id === id || r.trip === id,
          );
          if (myReq) setRequests([myReq]);
          else setRequests([]);
        } catch (err) {
          setRequests([]);
        }
      }
    } catch (error) {
      toast.error("Failed to load trip details");
    } finally {
      setLoading(false);
    }
  };

  const handleRequestSeat = async () => {
    try {
      const response = await rideShareAPI.requestSeat({
        tripId: id,
        seatsRequested: 1,
        message: offerPrice ? `Offered: ₹${offerPrice}/seat` : "",
        offerPrice: offerPrice || null,
      });
      if (response.data.success) {
        toast.success(
          offerPrice ? "Negotiation request sent!" : "Request sent!",
        );
        setShowOffer(false);
        setOfferPrice("");
        fetchTripDetails();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed");
    }
  };

  const handleApprove = async (requestId, acceptOffer = false) => {
    setProcessingId(requestId);
    try {
      await rideShareAPI.respondToRequest(requestId, {
        action: "approve",
        acceptOffer,
      });
      toast.success(
        acceptOffer ? "Approved at negotiated price!" : "Approved!",
      );
      fetchTripDetails();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed");
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (requestId) => {
    setProcessingId(requestId);
    try {
      await rideShareAPI.respondToRequest(requestId, { action: "reject" });
      toast.success("Rejected");
      fetchTripDetails();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed");
    } finally {
      setProcessingId(null);
    }
  };

  const initiatePayment = async (requestId, amount) => {
    setProcessingPayment(true);
    try {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = async () => {
        try {
          const orderRes = await rideShareAPI.createPayment(requestId);
          const options = {
            key: orderRes.data.keyId,
            amount: orderRes.data.amount,
            currency: orderRes.data.currency,
            name: "Wheelz",
            description: "Ride Share",
            order_id: orderRes.data.orderId,
            handler: async (r) => {
              try {
                await rideShareAPI.verifyPayment({
                  requestId,
                  razorpayOrderId: r.razorpay_order_id,
                  razorpayPaymentId: r.razorpay_payment_id,
                  razorpaySignature: r.razorpay_signature,
                });
                toast.success("Paid! 🎉");
                fetchTripDetails();
              } catch (e) {
                toast.error("Verification failed");
              }
            },
            prefill: {
              name: user?.name,
              email: user?.email,
              contact: user?.phone,
            },
            theme: { color: "#f59e0b" },
            modal: {
              ondismiss: () => {
                toast.error("Cancelled");
                setProcessingPayment(false);
              },
            },
          };
          new window.Razorpay(options).open();
        } catch (e) {
          toast.error("Order failed");
        }
      };
      document.body.appendChild(script);
    } catch (e) {
      toast.error("Payment failed");
    } finally {
      setProcessingPayment(false);
    }
  };

  const isDriver = user?._id === trip?.driver?._id;
  const pendingRequests = requests.filter(
    (r) => r.status === "pending" || r.status === "negotiating",
  );
  const approvedRequests = requests.filter((r) => r.status === "approved");
  const myRequest = requests.find((r) => r.passenger?._id === user?._id);
  const isApproved = myRequest?.status === "approved";
  const isPaid = myRequest?.paymentStatus === "paid";
  const isPending =
    myRequest?.status === "pending" || myRequest?.status === "negotiating";

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  if (!trip)
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <div className="text-center">
          <p className="text-gray-500">Trip not found</p>
          <button
            onClick={() => navigate("/find-trip")}
            className="mt-4 text-amber-500"
          >
            Go back
          </button>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 pt-24 pb-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-amber-500 mb-6"
        >
          <ArrowLeftIcon className="w-5 h-5" /> Back
        </button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 mb-6 border border-gray-100 dark:border-gray-700"
        >
          <div className="flex flex-wrap justify-between items-start gap-4">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <MapPinIcon className="w-5 h-5 text-amber-500" />
                <span className="text-xl font-semibold">{trip.fromCity}</span>
                <span className="text-gray-400">→</span>
                <MapPinIcon className="w-5 h-5 text-green-500" />
                <span className="text-xl font-semibold">{trip.toCity}</span>
              </div>
              <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <CalendarIcon className="w-4 h-4" />{" "}
                  {new Date(trip.departureDate).toLocaleDateString()} at{" "}
                  {trip.departureTime}
                </span>
                <span className="flex items-center gap-1">
                  <UserGroupIcon className="w-4 h-4" /> {trip.availableSeats}/
                  {trip.totalSeats}
                </span>
                <span className="flex items-center gap-1">
                  <CurrencyRupeeIcon className="w-4 h-4" /> ₹{trip.pricePerSeat}
                  /seat
                </span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-amber-500">
                ₹{trip.pricePerSeat}
              </div>
              <div className="text-xs text-gray-400">per seat</div>
            </div>
          </div>
        </motion.div>

        {!isDriver && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 mb-6 border border-gray-100 dark:border-gray-700"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <UserCircleIcon className="w-5 h-5 text-amber-500" /> Driver
                Details
              </h2>
              <button
                onClick={() => setShowDriverModal(true)}
                className="text-sm text-amber-500 hover:text-amber-600 flex items-center gap-1"
              >
                <EyeIcon className="w-4 h-4" /> View Full Profile
              </button>
            </div>
            <div className="flex items-center gap-4">
              <div
                className="w-16 h-16 bg-gradient-to-r from-amber-500 to-amber-600 rounded-full flex items-center justify-center text-white font-bold text-xl cursor-pointer"
                onClick={() => setShowDriverModal(true)}
              >
                {trip.driver?.name?.[0]?.toUpperCase() || "D"}
              </div>
              <div>
                <h3 className="font-semibold text-lg">{trip.driver?.name}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                    ✅ Verified
                  </span>
                  <span className="text-xs text-gray-400">
                    {trip.driver?.ridesCompleted || 0} rides
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {!isDriver && (
          <>
            {isPending && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-yellow-50 dark:bg-yellow-900/20 rounded-2xl shadow-xl p-6 mb-6 border border-yellow-300"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center text-white text-xl">
                    ⏳
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-yellow-800">
                      Request Pending
                    </h2>
                    <p className="text-yellow-700">
                      Waiting for driver approval
                    </p>
                  </div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                  <p className="text-sm">{myRequest?.seatsRequested} seat(s)</p>
                  {myRequest?.message && (
                    <p className="text-sm text-gray-500 italic mt-1">
                      "{myRequest.message}"
                    </p>
                  )}
                </div>
              </motion.div>
            )}

            {isApproved && !isPaid && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-amber-50 dark:bg-amber-900/20 rounded-2xl shadow-xl p-6 mb-6 border-2 border-amber-500"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white text-xl">
                    ✅
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-green-800">
                      Request Approved!
                    </h2>
                    <p className="text-green-700">
                      Complete payment to confirm.
                    </p>
                  </div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-xl p-4 mb-4">
                  <div className="flex justify-between items-center">
                    <span>Amount:</span>
                    <span className="text-2xl font-bold text-amber-600">
                      ₹{myRequest?.totalAmount}
                    </span>
                  </div>
                  {myRequest?.isNegotiated && (
                    <p className="text-xs text-green-600 mt-1">
                      💰 Negotiated (Original: ₹{trip.pricePerSeat})
                    </p>
                  )}
                  <div className="flex justify-between items-center mt-2">
                    <span>Seats:</span>
                    <span>{myRequest?.seatsRequested}</span>
                  </div>
                </div>
                <button
                  onClick={() =>
                    initiatePayment(myRequest?._id, myRequest?.totalAmount)
                  }
                  disabled={processingPayment}
                  className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-xl font-semibold"
                >
                  {processingPayment ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" />
                  ) : (
                    `Pay ₹${myRequest?.totalAmount}`
                  )}
                </button>
              </motion.div>
            )}

            {isPaid && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-green-50 dark:bg-green-900/20 rounded-2xl shadow-xl p-6 mb-6 border-2 border-green-500"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white text-xl">
                    🎉
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-green-800">
                      Trip Confirmed!
                    </h2>
                    <p className="text-green-700">Payment successful!</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-white rounded-lg">
                    <p className="text-xs text-gray-500">Contact</p>
                    <p className="font-medium flex items-center gap-2">
                      <PhoneIcon className="w-4 h-4" />{" "}
                      {trip.driver?.phone || "Shared soon"}
                    </p>
                  </div>
                  <div className="p-3 bg-white rounded-lg">
                    <p className="text-xs text-gray-500">Pickup</p>
                    <p className="font-medium">
                      {trip.fromAddress || trip.fromCity}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {!isPending &&
              !isApproved &&
              !isPaid &&
              trip.availableSeats > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border"
                >
                  <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <SparklesIcon className="w-5 h-5 text-amber-500" /> Request
                    a Seat
                  </h2>
                  <div className="mb-4">
                    <button
                      onClick={() => setShowOffer(!showOffer)}
                      className="text-sm text-amber-500 underline"
                    >
                      {showOffer ? "✕ Cancel" : "💰 Offer different price"}
                    </button>
                    {showOffer && (
                      <div className="flex gap-2 mt-2">
                        <div className="flex-1 relative">
                          <span className="absolute left-3 top-2.5 text-gray-400">
                            ₹
                          </span>
                          <input
                            type="number"
                            value={offerPrice}
                            onChange={(e) => setOfferPrice(e.target.value)}
                            placeholder={`Listed: ₹${trip.pricePerSeat}`}
                            className="w-full pl-7 pr-3 py-2 text-sm rounded-lg border"
                          />
                        </div>
                        {offerPrice < trip.pricePerSeat && (
                          <span className="text-xs text-amber-600 self-center">
                            Min: ₹{Math.round(trip.pricePerSeat * 0.6)}
                          </span>
                        )}
                      </div>
                    )}
                    {offerPrice < trip.pricePerSeat && (
                      <p className="text-xs text-green-600 mt-2">
                        Save ₹{trip.pricePerSeat - offerPrice}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={handleRequestSeat}
                    className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-xl font-semibold"
                  >
                    {offerPrice
                      ? `Offer ₹${offerPrice}/seat`
                      : `Request • ₹${trip.pricePerSeat}`}
                  </button>
                  <p className="text-xs text-amber-700 mt-4">
                    <ShieldCheckIcon className="w-4 h-4 inline" /> ⚠️ Verify
                    driver before boarding.
                  </p>
                </motion.div>
              )}
          </>
        )}

        {isDriver && (
          <>
            {pendingRequests.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 mb-6 border"
              >
                <h2 className="text-lg font-semibold mb-4 text-amber-600">
                  <UserGroupIcon className="w-5 h-5 inline" /> Pending (
                  {pendingRequests.length})
                </h2>
                {pendingRequests.map((req) => (
                  <div key={req._id} className="border rounded-xl p-4 mb-3">
                    <div className="flex flex-wrap justify-between items-start gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center text-amber-600 font-bold">
                            {req.passenger?.name?.[0] || "P"}
                          </div>
                          <div>
                            <p className="font-semibold">
                              {req.passenger?.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {req.passenger?.email}
                            </p>
                          </div>
                        </div>
                        <div className="mt-2">
                          <p className="text-sm">
                            🎫 {req.seatsRequested} seat(s) • ₹{req.totalAmount}
                          </p>
                          {req.offerPrice && (
                            <p className="text-sm text-amber-600 font-medium">
                              💰 Offered: ₹{req.offerPrice}/seat
                            </p>
                          )}
                          {req.message && (
                            <p className="text-sm italic">💬 "{req.message}"</p>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() =>
                            handleApprove(req._id, !!req.offerPrice)
                          }
                          disabled={processingId === req._id}
                          className="px-4 py-1.5 bg-green-500 text-white rounded-lg text-sm"
                        >
                          {req.offerPrice
                            ? `Approve ₹${req.offerPrice}`
                            : "Approve"}
                        </button>
                        <button
                          onClick={() => handleReject(req._id)}
                          disabled={processingId === req._id}
                          className="px-4 py-1.5 bg-red-500 text-white rounded-lg text-sm"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </motion.div>
            )}

            {approvedRequests.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 mb-6 border"
              >
                <h2 className="text-lg font-semibold mb-4 text-green-600">
                  <CheckCircleIcon className="w-5 h-5 inline" /> Confirmed (
                  {approvedRequests.length})
                </h2>
                {approvedRequests.map((req) => (
                  <div key={req._id} className="border rounded-xl p-4 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-bold">
                        {req.passenger?.name?.[0] || "P"}
                      </div>
                      <div>
                        <p className="font-semibold">{req.passenger?.name}</p>
                        <p className="text-xs text-gray-500">
                          {req.passenger?.phone || "N/A"}
                        </p>
                      </div>
                      <div className="ml-auto text-right">
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full ${req.paymentStatus === "paid" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}
                        >
                          {req.paymentStatus === "paid"
                            ? "Paid ✅"
                            : "Pending ⏳"}
                        </span>
                        <p className="text-xs mt-1">
                          {req.seatsRequested} seat(s) • ₹{req.totalAmount}
                          {req.isNegotiated ? " (Neg)" : ""}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </motion.div>
            )}

            {pendingRequests.length === 0 && approvedRequests.length === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 mb-6 text-center border"
              >
                <UserGroupIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <h3 className="text-lg font-semibold">No Requests Yet</h3>
                <p className="text-gray-500">Share this trip link</p>
              </motion.div>
            )}
          </>
        )}
      </div>

      {showDriverModal && trip?.driver && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={() => setShowDriverModal(false)}
            className="absolute inset-0 bg-black/60"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative w-full max-w-lg bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto"
          >
            <div className="bg-gradient-to-r from-amber-500 to-amber-600 p-6 text-center">
              <button
                onClick={() => setShowDriverModal(false)}
                className="absolute top-4 right-4 p-1.5 bg-white/20 rounded-full"
              >
                <XMarkIcon className="w-5 h-5 text-white" />
              </button>
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-3xl font-bold text-amber-600 mx-auto mb-3">
                {trip.driver?.name?.[0] || "D"}
              </div>
              <h2 className="text-xl font-bold text-white">
                {trip.driver?.name}
              </h2>
              <p className="text-amber-100 text-sm">
                <ShieldCheckIcon className="w-4 h-4 inline" /> Verified Driver
              </p>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-4">
                <h3 className="font-semibold text-amber-800 mb-3">
                  <PhoneIcon className="w-5 h-5 inline" /> Contact
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Phone</span>
                    <a
                      href={`tel:${trip.driver?.phone}`}
                      className="text-amber-600 font-bold"
                    >
                      {trip.driver?.phone || "N/A"}
                    </a>
                  </div>
                  <div className="flex justify-between">
                    <span>Email</span>
                    <a
                      href={`mailto:${trip.driver?.email}`}
                      className="text-blue-600"
                    >
                      {trip.driver?.email || "N/A"}
                    </a>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-gray-50 rounded-xl p-3 text-center">
                  <p className="text-2xl font-bold text-amber-500">
                    {trip.totalRidesDone || 0}
                  </p>
                  <p className="text-xs">Rides</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3 text-center">
                  <p className="text-2xl font-bold text-green-500">
                    {trip.driverRating || "N/A"}
                  </p>
                  <p className="text-xs">Rating</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3 text-center">
                  <p className="text-2xl font-bold text-blue-500">
                    {trip.driver?.createdAt
                      ? Math.floor(
                          (Date.now() - new Date(trip.driver.createdAt)) /
                            (365 * 24 * 60 * 60 * 1000),
                        )
                      : "N/A"}
                  </p>
                  <p className="text-xs">Years</p>
                </div>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <h3 className="font-semibold mb-3">Trip Info</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Route</span>
                    <span className="font-medium">
                      {trip.fromCity} → {trip.toCity}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Date</span>
                    <span className="font-medium">
                      {new Date(trip.departureDate).toLocaleDateString()} at{" "}
                      {trip.departureTime}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Price</span>
                    <span className="font-bold text-amber-500">
                      ₹{trip.pricePerSeat}/seat
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Seats</span>
                    <span className="font-medium">
                      {trip.availableSeats}/{trip.totalSeats}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {trip.womenOnly && (
                  <span className="text-xs bg-pink-100 text-pink-700 px-2 py-1 rounded-full">
                    👩 Women Only
                  </span>
                )}
                {trip.petsAllowed && (
                  <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                    🐾 Pets
                  </span>
                )}
                {trip.acAvailable && (
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                    ❄️ AC
                  </span>
                )}
                <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                  🧳 {trip.luggageAllowed}
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
