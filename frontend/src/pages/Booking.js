import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { vehicleAPI, bookingAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";
import LoadingSpinner from "../components/common/LoadingSpinner";
import DatePicker from "react-datepicker";
import RazorpayButton from "../components/RazorpayButton";
import UPIQRPayment from "../components/UPIQRPayment";
import "react-datepicker/dist/react-datepicker.css";
import toast from "react-hot-toast";

export default function Booking() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [availability, setAvailability] = useState(null);
  const [extras, setExtras] = useState({
    insurance: false,
    gps: false,
    childSeat: false,
    driver: false,
  });
  const [createdBooking, setCreatedBooking] = useState(null);
  const [creatingBooking, setCreatingBooking] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("card");

  useEffect(() => {
    vehicleAPI
      .getOne(id)
      .then((res) => setVehicle(res.data.vehicle))
      .catch(() => navigate("/vehicles"))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const checkAvailability = async () => {
    if (!startDate || !endDate) return;
    const res = await vehicleAPI.checkAvailability(id, {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    });
    setAvailability(res.data);
  };

  useEffect(() => {
    if (startDate && endDate) checkAvailability();
  }, [startDate, endDate]);

  const calculateExtrasCost = () => {
    let cost = 0;
    if (extras.insurance) cost += 200;
    if (extras.gps) cost += 100;
    if (extras.childSeat) cost += 150;
    if (extras.driver) cost += 500;
    return cost;
  };

  const totalDays =
    startDate && endDate
      ? Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24))
      : 0;

  const pricePerDay = availability?.pricePerDay || vehicle?.basePrice || 0;
  const extrasPerDay = calculateExtrasCost();
  const total = (pricePerDay + extrasPerDay) * totalDays;

  const handleCreateBooking = async () => {
    if (!startDate || !endDate) {
      toast.error("Please select dates");
      return;
    }
    if (!availability?.isAvailable) {
      toast.error("Vehicle not available for selected dates");
      return;
    }

    setCreatingBooking(true);
    try {
      const res = await bookingAPI.create({
        vehicleId: id,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        pickupLocation: vehicle.locationName,
        extras,
      });

      setCreatedBooking(res.data.booking);
      setShowPayment(true);
      toast.success("Booking created! Please complete payment.");
    } catch (err) {
      toast.error(err.response?.data?.message || "Booking failed");
    } finally {
      setCreatingBooking(false);
    }
  };

  const handlePaymentSuccess = () => {
    toast.success("Payment successful! Booking confirmed");
    navigate(`/booking/success/${createdBooking._id}`);
  };

  const handlePaymentCancel = () => {
    setShowPayment(false);
    toast.error("Payment cancelled. You can try again.");
  };

  if (loading) return <LoadingSpinner />;
  if (!vehicle) return null;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8 pt-24">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        Complete Your Booking
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Booking Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Vehicle Summary */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700">
            <div className="flex gap-4">
              <img
                src={vehicle.images?.[0]}
                alt={vehicle.name}
                className="w-24 h-24 rounded-xl object-cover"
              />
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {vehicle.name}
                </h2>
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  {vehicle.brand} • {vehicle.year} • {vehicle.city}
                </p>
              </div>
            </div>
          </div>

          {/* Date Selection */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
              Select Dates
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Pickup Date
                </label>
                <DatePicker
                  selected={startDate}
                  onChange={setStartDate}
                  selectsStart
                  startDate={startDate}
                  endDate={endDate}
                  minDate={new Date()}
                  className="input-field"
                  placeholderText="Select start date"
                  dateFormat="dd/MM/yyyy"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Return Date
                </label>
                <DatePicker
                  selected={endDate}
                  onChange={setEndDate}
                  selectsEnd
                  startDate={startDate}
                  endDate={endDate}
                  minDate={startDate || new Date()}
                  className="input-field"
                  placeholderText="Select end date"
                  dateFormat="dd/MM/yyyy"
                />
              </div>
            </div>
          </div>

          {/* Extras */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
              Add Extras
            </h3>
            <div className="space-y-3">
              {[
                { key: "insurance", label: "Zero Dep Insurance", price: 200 },
                { key: "gps", label: "GPS Navigation", price: 100 },
                { key: "childSeat", label: "Child Seat", price: 150 },
                { key: "driver", label: "Professional Driver", price: 500 },
              ].map((extra) => (
                <label
                  key={extra.key}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl cursor-pointer"
                >
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white text-sm">
                      {extra.label}
                    </div>
                    <div className="text-xs text-gray-500">
                      +₹{extra.price}/day
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={extras[extra.key]}
                    onChange={(e) =>
                      setExtras({ ...extras, [extra.key]: e.target.checked })
                    }
                    className="w-5 h-5 rounded border-gray-300 text-amber-500"
                  />
                </label>
              ))}
            </div>
          </div>

          {/* Payment Section (shown after booking is created) */}
          {showPayment && createdBooking && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                Payment Method
              </h3>

              <div className="grid grid-cols-2 gap-3 mb-6">
                <button
                  onClick={() => setPaymentMethod("card")}
                  className={`py-3 rounded-xl font-medium transition ${
                    paymentMethod === "card"
                      ? "bg-amber-500 text-white"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                  }`}
                >
                  💳 Credit/Debit Card
                </button>
                <button
                  onClick={() => setPaymentMethod("upi_qr")}
                  className={`py-3 rounded-xl font-medium transition ${
                    paymentMethod === "upi_qr"
                      ? "bg-amber-500 text-white"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                  }`}
                >
                  📱 UPI / QR Code
                </button>
              </div>

              {paymentMethod === "card" ? (
                <RazorpayButton
                  bookingId={createdBooking._id}
                  amount={total}
                  onSuccess={handlePaymentSuccess}
                  onCancel={handlePaymentCancel}
                />
              ) : (
                <UPIQRPayment
                  bookingId={createdBooking._id}
                  amount={total}
                  onSuccess={handlePaymentSuccess}
                  onCancel={handlePaymentCancel}
                />
              )}
            </div>
          )}
        </div>

        {/* Right Column - Price Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 sticky top-24">
            <h3 className="font-semibold text-gray-900 dark:text-white text-lg mb-4">
              Price Summary
            </h3>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span>Rental Days</span>
                <span>
                  {totalDays} day{totalDays !== 1 ? "s" : ""}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Price per day</span>
                <span>₹{pricePerDay.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Extras per day</span>
                <span>+₹{extrasPerDay.toLocaleString()}</span>
              </div>
              <div className="border-t pt-3 mt-3">
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span className="text-amber-500">
                    ₹{total.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {!showPayment && (
              <button
                onClick={handleCreateBooking}
                disabled={
                  !startDate ||
                  !endDate ||
                  !availability?.isAvailable ||
                  creatingBooking
                }
                className="w-full btn-primary mt-6"
              >
                {creatingBooking ? "Creating Booking..." : "Proceed to Payment"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
