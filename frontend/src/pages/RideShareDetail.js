import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { rideShareAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import { ArrowLeft, ArrowUpRight, Calendar, Check, CreditCard, Eye, Phone, ShieldCheck, Users } from "lucide-react";
import { SplitText } from "../components/motion";
import { Panel, Row, StatusPill, Notice, Empty, Modal, Spinner, PageLoader } from "../components/ui";

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
                toast.success("Paid!");
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
            theme: { color: "#FF4D00" },
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

  if (loading) return <PageLoader label="Loading trip" />;
  if (!trip)
    return (
      <div className="container-x pt-28">
        <Empty
          title="Trip not found."
          action={
            <button onClick={() => navigate("/find-trip")} className="btn-ghost">
              Go back
            </button>
          }
        />
      </div>
    );

  const passengerRow = (req, right) => (
    <div key={req._id} className="flex flex-wrap items-start justify-between gap-4 border-b border-line/10 py-5 last:border-0">
      <div className="flex min-w-0 flex-1 gap-4">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-raised text-sm font-semibold">
          {req.passenger?.name?.[0] || "P"}
        </span>
        <div className="min-w-0">
          <p className="font-medium">{req.passenger?.name}</p>
          <p className="truncate text-xs text-muted">{req.passenger?.email || req.passenger?.phone || "N/A"}</p>
          <p className="mt-2 font-mono text-xs text-ink">
            {req.seatsRequested} seat(s) · ₹{req.totalAmount}
            {req.isNegotiated ? " (Neg)" : ""}
          </p>
          {req.offerPrice && (
            <p className="mt-1 text-xs text-accent">Offered: ₹{req.offerPrice}/seat</p>
          )}
          {req.message && (
            <p className="mt-2 border-l-2 border-accent pl-3 text-sm italic text-muted">“{req.message}”</p>
          )}
        </div>
      </div>
      {right}
    </div>
  );

  return (
    <div className="container-x pb-24 pt-28 md:pt-32">
      <button
        onClick={() => navigate(-1)}
        className="link-underline mb-8 inline-flex items-center gap-2 text-sm text-muted hover:text-ink"
      >
        <ArrowLeft size={14} /> Back
      </button>

      <header className="mb-14 grid gap-8 border-b border-line/10 pb-10 md:grid-cols-12 md:items-end">
        <div className="md:col-span-8">
          <p className="eyebrow mb-6 flex items-center gap-3"><span className="text-accent">(01)</span> Shared trip</p>
          <h1 className="display text-5xl md:text-7xl lg:text-8xl">
            <SplitText lines={[trip.fromCity, `to ${trip.toCity}.`]} lineClassName="[&:last-child]:text-muted" />
          </h1>
          <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted">
            <span className="flex items-center gap-1.5">
              <Calendar size={14} /> {new Date(trip.departureDate).toLocaleDateString()} at {trip.departureTime}
            </span>
            <span className="flex items-center gap-1.5">
              <Users size={14} /> {trip.availableSeats}/{trip.totalSeats} seats
            </span>
          </div>
        </div>
        <div className="md:col-span-4 md:text-right">
          <p className="display text-5xl md:text-6xl">₹{trip.pricePerSeat}</p>
          <p className="eyebrow mt-1">per seat</p>
        </div>
      </header>

      <div className="grid gap-10 lg:grid-cols-12">
        <div className="space-y-6 lg:col-span-7">
          {!isDriver && (
            <Panel
              index="02"
              title="Driver"
              action={
                <button onClick={() => setShowDriverModal(true)} className="chip">
                  <Eye size={13} /> Full profile
                </button>
              }
            >
              <button onClick={() => setShowDriverModal(true)} className="flex items-center gap-5 text-left">
                <span className="display grid h-16 w-16 shrink-0 place-items-center rounded-full bg-accent text-2xl text-accent-ink">
                  {trip.driver?.name?.[0]?.toUpperCase() || "D"}
                </span>
                <span>
                  <span className="display-tight block text-2xl">{trip.driver?.name}</span>
                  <span className="mt-2 flex items-center gap-2">
                    <StatusPill tone="positive">Verified</StatusPill>
                    <span className="text-xs text-muted">{trip.driver?.ridesCompleted || 0} rides</span>
                  </span>
                </span>
              </button>
            </Panel>
          )}

          {isDriver && (
            <>
              {pendingRequests.length > 0 && (
                <Panel index="02" title={`Pending (${pendingRequests.length})`}>
                  {pendingRequests.map((req) =>
                    passengerRow(
                      req,
                      <div className="flex gap-2">
                        <button
                          onClick={() =>
                            handleApprove(req._id, !!req.offerPrice)
                          }
                          disabled={processingId === req._id}
                          className="btn-primary !px-4 !py-2 !text-xs"
                        >
                          <Check size={13} />
                          {req.offerPrice
                            ? `Approve ₹${req.offerPrice}`
                            : "Approve"}
                        </button>
                        <button
                          onClick={() => handleReject(req._id)}
                          disabled={processingId === req._id}
                          className="chip hover:!border-red-500 hover:!text-red-500"
                        >
                          Reject
                        </button>
                      </div>,
                    ),
                  )}
                </Panel>
              )}

              {approvedRequests.length > 0 && (
                <Panel index="03" title={`Confirmed (${approvedRequests.length})`}>
                  {approvedRequests.map((req) =>
                    passengerRow(
                      req,
                      <StatusPill status={req.paymentStatus === "paid" ? "paid" : "pending"}>
                        {req.paymentStatus === "paid" ? "Paid" : "Pending"}
                      </StatusPill>,
                    ),
                  )}
                </Panel>
              )}

              {pendingRequests.length === 0 && approvedRequests.length === 0 && (
                <Empty title="No requests yet.">Share this trip link.</Empty>
              )}
            </>
          )}

          <Notice icon={ShieldCheck}>Verify driver identity before boarding.</Notice>
        </div>

        {!isDriver && (
          <aside className="lg:col-span-5">
            <div className="sticky top-28 space-y-6">
              {isPending && (
                <Panel title="Request pending" action={<StatusPill tone="pending">Waiting</StatusPill>}>
                  <p className="text-muted">Waiting for driver approval.</p>
                  <p className="display-tight mt-4 text-2xl">{myRequest?.seatsRequested} seat(s)</p>
                  {myRequest?.message && (
                    <p className="mt-3 border-l-2 border-accent pl-3 text-sm italic text-muted">“{myRequest.message}”</p>
                  )}
                </Panel>
              )}

              {isApproved && !isPaid && (
                <Panel title="Request approved" action={<StatusPill tone="positive">Approved</StatusPill>}>
                  <p className="text-muted">Complete payment to confirm.</p>
                  <div className="mt-6">
                    <Row label="Seats">{myRequest?.seatsRequested}</Row>
                    {myRequest?.isNegotiated && (
                      <Row label="Original price">₹{trip.pricePerSeat}/seat</Row>
                    )}
                  </div>
                  <div className="mt-6 flex items-end justify-between border-t border-line/10 pt-6">
                    <span className="eyebrow">Amount</span>
                    <span className="display text-5xl">₹{myRequest?.totalAmount}</span>
                  </div>
                  <button
                    onClick={() =>
                      initiatePayment(myRequest?._id, myRequest?.totalAmount)
                    }
                    disabled={processingPayment}
                    className="btn-primary mt-8 w-full !py-4"
                  >
                    {processingPayment ? (
                      <Spinner />
                    ) : (
                      <>
                        <CreditCard size={16} /> Pay ₹{myRequest?.totalAmount}
                      </>
                    )}
                  </button>
                </Panel>
              )}

              {isPaid && (
                <Panel title="Trip confirmed" action={<StatusPill tone="positive">Paid</StatusPill>}>
                  <p className="text-muted">Payment successful.</p>
                  <div className="mt-6">
                    <Row label="Contact">
                      <span className="inline-flex items-center gap-1.5">
                        <Phone size={12} /> {trip.driver?.phone || "Shared soon"}
                      </span>
                    </Row>
                    <Row label="Pickup">{trip.fromAddress || trip.fromCity}</Row>
                  </div>
                </Panel>
              )}

              {!isPending &&
                !isApproved &&
                !isPaid &&
                trip.availableSeats > 0 && (
                  <Panel title="Request a seat">
                    <button
                      onClick={() => setShowOffer(!showOffer)}
                      className="link-underline text-sm text-muted hover:text-ink"
                    >
                      {showOffer ? "Cancel offer" : "Offer a different price"}
                    </button>
                    {showOffer && (
                      <div className="mt-6">
                        <label className="field-label">Your price per seat (₹)</label>
                        <input
                          type="number"
                          value={offerPrice}
                          onChange={(e) => setOfferPrice(e.target.value)}
                          placeholder={`Listed: ₹${trip.pricePerSeat}`}
                          className="field"
                        />
                        {offerPrice < trip.pricePerSeat && (
                          <p className="mt-2 flex justify-between text-xs text-muted">
                            <span>Min: ₹{Math.round(trip.pricePerSeat * 0.6)}</span>
                            <span className="text-accent">Save ₹{trip.pricePerSeat - offerPrice}</span>
                          </p>
                        )}
                      </div>
                    )}
                    <button onClick={handleRequestSeat} className="btn-primary mt-8 w-full !py-4">
                      {offerPrice
                        ? `Offer ₹${offerPrice}/seat`
                        : `Request · ₹${trip.pricePerSeat}`}
                      <ArrowUpRight size={16} />
                    </button>
                  </Panel>
                )}
            </div>
          </aside>
        )}
      </div>

      <Modal
        open={showDriverModal && !!trip?.driver}
        onClose={() => setShowDriverModal(false)}
        eyebrow="Verified driver"
        title={trip.driver?.name}
      >
        <div className="mb-8 grid grid-cols-3 gap-px overflow-hidden rounded-[20px] border border-line/10 bg-line/10">
          {[
            ["Rides", trip.totalRidesDone || 0],
            ["Rating", trip.driverRating || "N/A"],
            [
              "Years",
              trip.driver?.createdAt
                ? Math.floor(
                    (Date.now() - new Date(trip.driver.createdAt)) /
                      (365 * 24 * 60 * 60 * 1000),
                  )
                : "N/A",
            ],
          ].map(([label, value]) => (
            <div key={label} className="bg-surface p-4">
              <p className="eyebrow">{label}</p>
              <p className="display mt-2 text-3xl">{value}</p>
            </div>
          ))}
        </div>

        <p className="eyebrow mb-2">Contact</p>
        <Row label="Phone">
          <a href={`tel:${trip.driver?.phone}`} className="link-underline">
            {trip.driver?.phone || "N/A"}
          </a>
        </Row>
        <Row label="Email">
          <a href={`mailto:${trip.driver?.email}`} className="link-underline">
            {trip.driver?.email || "N/A"}
          </a>
        </Row>

        <p className="eyebrow mb-2 mt-8">Trip info</p>
        <Row label="Route">{trip.fromCity} → {trip.toCity}</Row>
        <Row label="Date">
          {new Date(trip.departureDate).toLocaleDateString()} at {trip.departureTime}
        </Row>
        <Row label="Price" strong>₹{trip.pricePerSeat}/seat</Row>
        <Row label="Seats">{trip.availableSeats}/{trip.totalSeats}</Row>

        <div className="mt-6 flex flex-wrap gap-2">
          {trip.womenOnly && <span className="chip">Women only</span>}
          {trip.petsAllowed && <span className="chip">Pets</span>}
          {trip.acAvailable && <span className="chip">AC</span>}
          {trip.luggageAllowed && <span className="chip capitalize">{trip.luggageAllowed}</span>}
        </div>
      </Modal>
    </div>
  );
}
