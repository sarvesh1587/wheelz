import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { vehicleAPI, bookingAPI, paymentAPI } from "../services/api";
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
  const [step, setStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState("card"); // 'card' or 'upi_qr'

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
  const subtotal = (pricePerDay + extrasPerDay) * totalDays;
  const total = subtotal;

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
      setStep(2);
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
    setStep(1);
    toast.error("Payment cancelled. You can try again.");
  };

  if (loading) return <LoadingSpinner />;
  if (!vehicle) return null;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8 pt-24">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        Complete Your Booking
      </h1>

      {/* Step Indicator */}
      <div className="flex items-center justify-center mb-8">
        <div className="flex items-center gap-4">
          <div
            className={`flex items-center gap-2 ${step >= 1 ? "text-amber-500" : "text-gray-400"}`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? "bg-amber-500 text-white" : "bg-gray-200 dark:bg-gray-700 text-gray-500"}`}
            >
              1
            </div>
            <span className="text-sm font-medium">Booking Details</span>
          </div>
          <div className="w-12 h-0.5 bg-gray-200 dark:bg-gray-700"></div>
          <div
            className={`flex items-center gap-2 ${step >= 2 ? "text-amber-500" : "text-gray-400"}`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? "bg-amber-500 text-white" : "bg-gray-200 dark:bg-gray-700 text-gray-500"}`}
            >
              2
            </div>
            <span className="text-sm font-medium">Payment</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
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
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-lg">
                    {vehicle.transmission}
                  </span>
                  <span className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-lg">
                    {vehicle.fuelType}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {step === 1 ? (
            <>
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
                {availability && !availability.isAvailable && (
                  <p className="text-red-500 text-sm mt-3">
                    ❌ Vehicle not available for selected dates
                  </p>
                )}
                {availability?.isPeakPricing && (
                  <p className="text-amber-500 text-sm mt-3">
                    🔥 Peak pricing applied due to high demand
                  </p>
                )}
              </div>

              {/* Extras */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                  Add Extras
                </h3>
                <div className="space-y-3">
                  {[
                    {
                      key: "insurance",
                      label: "Zero Dep Insurance",
                      price: 200,
                      desc: "Full coverage insurance",
                    },
                    {
                      key: "gps",
                      label: "GPS Navigation",
                      price: 100,
                      desc: "Real-time navigation",
                    },
                    {
                      key: "childSeat",
                      label: "Child Seat",
                      price: 150,
                      desc: "Safety for kids",
                    },
                    {
                      key: "driver",
                      label: "Professional Driver",
                      price: 500,
                      desc: "Chauffeur service",
                    },
                  ].map((extra) => (
                    <label
                      key={extra.key}
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl cursor-pointer"
                    >
                      <div className="flex-1">
                        <div className="font-medium text-gray-900 dark:text-white text-sm">
                          {extra.label}
                        </div>
                        <div className="text-xs text-gray-500">
                          {extra.desc}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">
                          +₹{extra.price}/day
                        </span>
                        <input
                          type="checkbox"
                          checked={extras[extra.key]}
                          onChange={(e) =>
                            setExtras({
                              ...extras,
                              [extra.key]: e.target.checked,
                            })
                          }
                          className="w-5 h-5 rounded border-gray-300 text-amber-500 focus:ring-amber-500"
                        />
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </>
          ) : (
            // Payment Step - Show booking summary and payment options
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                Booking Summary
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Vehicle</span>
                  <span className="font-medium">{vehicle.name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Dates</span>
                  <span className="font-medium">
                    {new Date(startDate).toLocaleDateString()} -{" "}
                    {new Date(endDate).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Duration</span>
                  <span className="font-medium">{totalDays} days</span>
                </div>
                {Object.entries(extras).filter(([_, v]) => v).length > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Extras</span>
                    <span className="font-medium">
                      {Object.entries(extras)
                        .filter(([_, v]) => v)
                        .map(([key]) => key)
                        .join(", ")}
                    </span>
                  </div>
                )}
              </div>

              {/* Payment Method Selector */}
              <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Select Payment Method
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("card")}
                    className={`py-2 px-4 rounded-xl text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
                      paymentMethod === "card"
                        ? "bg-amber-500 text-white shadow-md"
                        : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                    }`}
                  >
                    💳 Credit/Debit Card
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("upi_qr")}
                    className={`py-2 px-4 rounded-xl text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
                      paymentMethod === "upi_qr"
                        ? "bg-amber-500 text-white shadow-md"
                        : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                    }`}
                  >
                    📱 UPI / QR Code
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Price Summary & Payment */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 sticky top-24">
            <h3 className="font-semibold text-gray-900 dark:text-white text-lg mb-4">
              Price Summary
            </h3>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">
                  Rental Days
                </span>
                <span className="font-medium">
                  {totalDays} day{totalDays !== 1 ? "s" : ""}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">
                  Price per day
                </span>
                <span>₹{pricePerDay.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">
                  Extras per day
                </span>
                <span>+₹{extrasPerDay.toLocaleString()}</span>
              </div>
              <div className="border-t border-gray-100 dark:border-gray-700 my-3 pt-3">
                <div className="flex justify-between font-semibold text-gray-900 dark:text-white">
                  <span>Total Amount</span>
                  <span className="text-xl text-amber-500">
                    ₹{total.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {step === 1 ? (
              <button
                onClick={handleCreateBooking}
                disabled={
                  !startDate ||
                  !endDate ||
                  !availability?.isAvailable ||
                  creatingBooking
                }
                className="w-full btn-primary mt-6 flex items-center justify-center gap-2"
              >
                {creatingBooking ? (
                  <div className="w-5 h-5 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
                ) : (
                  "Proceed to Payment"
                )}
              </button>
            ) : (
              createdBooking && (
                <div className="mt-4">
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
              )
            )}

            <p className="text-xs text-gray-500 text-center mt-4">
              Free cancellation up to 24 hours before pickup
            </p>
            {step === 2 && (
              <p className="text-xs text-green-600 text-center mt-2">
                ✅ Booking created! Complete payment to confirm.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
