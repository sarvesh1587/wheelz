import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { vehicleAPI, bookingAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";
import LoadingSpinner from "../components/common/LoadingSpinner";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import toast from "react-hot-toast";
import {
  CalendarIcon,
  ShieldCheckIcon,
  MapPinIcon,
  WifiIcon,
  UserGroupIcon,
  CreditCardIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";

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
  const [creatingBooking, setCreatingBooking] = useState(false);
  const [checkingAvailability, setCheckingAvailability] = useState(false);

  // Fetch vehicle details
  useEffect(() => {
    vehicleAPI
      .getOne(id)
      .then((res) => setVehicle(res.data.vehicle))
      .catch(() => navigate("/vehicles"))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  // Check availability when dates change
  const checkAvailability = async () => {
    if (!startDate || !endDate) return;

    setCheckingAvailability(true);
    try {
      // Format dates properly for API
      const formattedStartDate = startDate.toISOString().split("T")[0];
      const formattedEndDate = endDate.toISOString().split("T")[0];

      console.log("Checking availability for:", {
        formattedStartDate,
        formattedEndDate,
      });

      const res = await vehicleAPI.checkAvailability(id, {
        startDate: formattedStartDate,
        endDate: formattedEndDate,
      });
      setAvailability(res.data);

      if (!res.data.isAvailable) {
        toast.error(
          "Vehicle not available for selected dates. Please try different dates.",
        );
      }
    } catch (error) {
      console.error("Availability check error:", error);
      toast.error("Could not check availability. Please try again.");
    } finally {
      setCheckingAvailability(false);
    }
  };

  useEffect(() => {
    if (startDate && endDate) {
      checkAvailability();
    }
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
      ? Math.max(1, Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)))
      : 0;

  const pricePerDay = vehicle?.currentPrice || vehicle?.basePrice || 0;
  const extrasPerDay = calculateExtrasCost();
  const subtotal = pricePerDay * totalDays;
  const extrasTotal = extrasPerDay * totalDays;
  const total = subtotal + extrasTotal;

  const handleCreateBooking = async () => {
    if (!startDate || !endDate) {
      toast.error("Please select both pickup and return dates");
      return;
    }

    if (availability && !availability.isAvailable) {
      toast.error("Vehicle not available for selected dates");
      return;
    }

    setCreatingBooking(true);

    // ✅ Show loading toast
    const loadingToast = toast.loading("Creating booking... Please wait");

    try {
      const bookingData = {
        vehicleId: id,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        pickupLocation: vehicle?.locationName || vehicle?.city,
        extras: extras,
      };

      console.log("Creating booking:", bookingData);

      // ✅ Add timeout promise
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error("Request timeout")), 45000);
      });

      const bookingPromise = bookingAPI.create(bookingData);
      const res = await Promise.race([bookingPromise, timeoutPromise]);

      toast.dismiss(loadingToast);
      toast.success("Booking created successfully! 🎉");

      // Navigate to payment or success page
      setTimeout(() => {
        navigate("/dashboard");
      }, 1500);
    } catch (err) {
      toast.dismiss(loadingToast);
      console.error("Booking error:", err);

      if (err.message === "Request timeout") {
        toast.error("Server is taking too long. Please try again.");
      } else {
        toast.error(
          err.response?.data?.message || "Booking failed. Please try again.",
        );
      }
    } finally {
      setCreatingBooking(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!vehicle) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 py-8 pt-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent">
            Complete Your Booking
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            Fill in the details to rent your dream ride
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Booking Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Vehicle Summary Card */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
              <div className="flex gap-4">
                <img
                  src={vehicle.images?.[0]}
                  alt={vehicle.name}
                  className="w-24 h-24 rounded-xl object-cover"
                />
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    {vehicle.name}
                  </h2>
                  <p className="text-gray-500 text-sm">
                    {vehicle.brand} • {vehicle.year} • {vehicle.city}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-full">
                      {vehicle.isAvailable ? "Available" : "Booked"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Date Selection Card */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-amber-500" />
                Select Dates
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Pickup Date
                  </label>
                  <DatePicker
                    selected={startDate}
                    onChange={setStartDate}
                    selectsStart
                    startDate={startDate}
                    endDate={endDate}
                    minDate={new Date()}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    dateFormat="dd/MM/yyyy"
                    placeholderText="Select pickup date"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Return Date
                  </label>
                  <DatePicker
                    selected={endDate}
                    onChange={setEndDate}
                    selectsEnd
                    startDate={startDate}
                    endDate={endDate}
                    minDate={startDate || new Date()}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    dateFormat="dd/MM/yyyy"
                    placeholderText="Select return date"
                  />
                </div>
              </div>

              {checkingAvailability && (
                <div className="mt-4 flex items-center justify-center gap-2 text-amber-500">
                  <div className="w-4 h-4 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
                  <span className="text-sm">Checking availability...</span>
                </div>
              )}

              {availability && availability.isAvailable === false && (
                <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg text-red-600 dark:text-red-400 text-sm text-center">
                  ⚠️ Vehicle not available for selected dates. Please choose
                  different dates.
                </div>
              )}

              {availability && availability.isAvailable === true && (
                <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg text-green-600 dark:text-green-400 text-sm text-center">
                  ✅ Vehicle available! You can proceed with booking.
                </div>
              )}
            </div>

            {/* Extras Card */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <SparklesIcon className="w-5 h-5 text-amber-500" />
                Add Extras
              </h3>
              <div className="space-y-3">
                {[
                  {
                    key: "insurance",
                    label: "Zero Dep Insurance",
                    price: 200,
                    icon: ShieldCheckIcon,
                    description: "Full coverage",
                  },
                  {
                    key: "gps",
                    label: "GPS Navigation",
                    price: 100,
                    icon: MapPinIcon,
                    description: "Never get lost",
                  },
                  {
                    key: "childSeat",
                    label: "Child Seat",
                    price: 150,
                    icon: UserGroupIcon,
                    description: "Safe for kids",
                  },
                  {
                    key: "driver",
                    label: "Professional Driver",
                    price: 500,
                    icon: UserGroupIcon,
                    description: "Experienced driver",
                  },
                ].map((extra) => (
                  <label
                    key={extra.key}
                    className={`flex items-center justify-between p-4 rounded-xl cursor-pointer transition-all duration-200 ${
                      extras[extra.key]
                        ? "bg-amber-50 dark:bg-amber-900/20 border-2 border-amber-500"
                        : "bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 hover:border-amber-300"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <extra.icon className="w-5 h-5 text-amber-500" />
                      <div>
                        <div className="font-medium text-sm text-gray-900 dark:text-white">
                          {extra.label}
                        </div>
                        <div className="text-xs text-gray-500">
                          {extra.description}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="font-bold text-amber-600 dark:text-amber-400">
                          +₹{extra.price}
                        </div>
                        <div className="text-xs text-gray-400">/day</div>
                      </div>
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
          </div>

          {/* Right Column - Price Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
              <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-4">
                Price Summary
              </h3>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    Rental Days
                  </span>
                  <span className="font-medium">
                    {totalDays} {totalDays === 1 ? "day" : "days"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    Price per day
                  </span>
                  <span className="font-medium">
                    ₹{pricePerDay.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    Subtotal
                  </span>
                  <span className="font-medium">
                    ₹{subtotal.toLocaleString()}
                  </span>
                </div>

                {extrasPerDay > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">
                      Extras ({totalDays} days)
                    </span>
                    <span className="font-medium text-amber-600">
                      +₹{extrasTotal.toLocaleString()}
                    </span>
                  </div>
                )}

                <div className="border-t border-gray-200 dark:border-gray-700 pt-3 mt-3">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-gray-900 dark:text-white">
                      Total
                    </span>
                    <div className="text-right">
                      <span className="text-2xl font-bold text-amber-500">
                        ₹{total.toLocaleString()}
                      </span>
                      <p className="text-xs text-gray-500">incl. all taxes</p>
                    </div>
                  </div>
                </div>
              </div>

              <button
                onClick={handleCreateBooking}
                disabled={
                  creatingBooking ||
                  !startDate ||
                  !endDate ||
                  (availability && !availability.isAvailable)
                }
                className="w-full btn-primary mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {creatingBooking ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Processing...
                  </div>
                ) : (
                  `Confirm Booking • ₹${total.toLocaleString()}`
                )}
              </button>

              <p className="text-xs text-center text-gray-500 mt-4">
                You won't be charged yet. Payment will be collected at pickup.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
