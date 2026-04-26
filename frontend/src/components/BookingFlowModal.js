import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  XMarkIcon,
  CalendarIcon,
  MapPinIcon,
  ShieldCheckIcon,
  DevicePhoneMobileIcon,
  UserGroupIcon,
  CreditCardIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CheckCircleIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";
import DatePicker from "react-datepicker";
import { bookingAPI } from "../services/api";
import toast from "react-hot-toast";
import "react-datepicker/dist/react-datepicker.css";

// Step Indicator
const StepIndicator = ({ currentStep, steps }) => {
  return (
    <div className="mb-8 px-6 pt-6">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={index} className="flex-1 relative">
            {index < steps.length - 1 && (
              <div
                className={`absolute top-5 left-1/2 w-full h-0.5 transition-all duration-500 ${
                  index < currentStep
                    ? "bg-gradient-to-r from-amber-500 to-amber-600"
                    : "bg-gray-200 dark:bg-gray-700"
                }`}
                style={{ transform: "translateX(-50%)" }}
              />
            )}
            <div className="relative flex flex-col items-center">
              <motion.div
                animate={{
                  scale: index === currentStep ? 1.1 : 1,
                }}
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 z-10 ${
                  index < currentStep
                    ? "bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-lg"
                    : index === currentStep
                      ? "bg-gradient-to-r from-amber-500 to-amber-600 text-white ring-4 ring-amber-500/30"
                      : "bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
                }`}
              >
                {index < currentStep ? (
                  <CheckCircleIcon className="w-5 h-5" />
                ) : (
                  index + 1
                )}
              </motion.div>
              <span className="text-xs mt-2 font-medium text-gray-600 dark:text-gray-400 hidden sm:block">
                {step.title}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Step 1: Date Selection
const StepDates = ({
  startDate,
  endDate,
  setStartDate,
  setEndDate,
  vehicle,
  onNext,
}) => {
  const handleContinue = () => {
    if (!startDate || !endDate) {
      toast.error("Please select both pickup and return dates");
      return;
    }
    onNext();
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
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
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
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

      {/* Vehicle Summary Card */}
      {startDate && endDate && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-xl border border-amber-200 dark:border-amber-800"
        >
          <div className="flex items-center gap-4">
            <img
              src={vehicle?.images?.[0]}
              alt={vehicle?.name}
              className="w-16 h-16 rounded-lg object-cover"
            />
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900 dark:text-white">
                {vehicle?.name}
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {vehicle?.brand} • {vehicle?.year}
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                ₹{vehicle?.currentPrice || vehicle?.basePrice}
              </p>
              <p className="text-xs text-gray-500">per day</p>
            </div>
          </div>
        </motion.div>
      )}

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleContinue}
        className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-semibold rounded-xl shadow-lg shadow-amber-500/30 hover:shadow-xl transition-all"
      >
        Continue to Extras →
      </motion.button>
    </motion.div>
  );
};

// Step 2: Extras Selection
const StepExtras = ({ extras, setExtras, onNext, onBack }) => {
  const extrasList = [
    {
      key: "insurance",
      label: "Zero Dep Insurance",
      price: 200,
      description: "Full coverage with zero deductible",
      icon: ShieldCheckIcon,
      popular: true,
    },
    {
      key: "gps",
      label: "GPS Navigation",
      price: 100,
      description: "Never get lost with real-time navigation",
      icon: MapPinIcon,
      popular: false,
    },
    {
      key: "childSeat",
      label: "Child Safety Seat",
      price: 150,
      description: "Safe travel for your little ones",
      icon: UserGroupIcon,
      popular: false,
    },
    {
      key: "driver",
      label: "Professional Driver",
      price: 500,
      description: "Experienced driver at your service",
      icon: UserGroupIcon,
      popular: false,
    },
  ];

  const totalExtrasCost = Object.entries(extras).reduce(
    (sum, [key, selected]) => {
      if (selected) {
        const extra = extrasList.find((e) => e.key === key);
        return sum + (extra?.price || 0);
      }
      return sum;
    },
    0,
  );

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-4"
    >
      <div className="space-y-3">
        {extrasList.map((extra) => {
          const isSelected = extras[extra.key];
          const Icon = extra.icon;

          return (
            <motion.div
              key={extra.key}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => setExtras({ ...extras, [extra.key]: !isSelected })}
              className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 ${
                isSelected
                  ? "border-amber-500 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20"
                  : "border-gray-200 dark:border-gray-700 hover:border-amber-300"
              }`}
            >
              {extra.popular && (
                <div className="absolute -top-2 -right-2">
                  <span className="px-2 py-0.5 text-xs font-bold bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-full">
                    Popular
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                      isSelected
                        ? "bg-gradient-to-r from-amber-500 to-amber-600 text-white"
                        : "bg-gray-100 dark:bg-gray-800 text-gray-500"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">
                      {extra.label}
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {extra.description}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-amber-600 dark:text-amber-400">
                    +₹{extra.price}
                  </p>
                  <p className="text-xs text-gray-400">per day</p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {totalExtrasCost > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg"
        >
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Extras total:{" "}
            <span className="font-bold text-amber-600">
              +₹{totalExtrasCost}/day
            </span>
          </p>
        </motion.div>
      )}

      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="flex-1 py-3 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
        >
          Back
        </button>
        <button
          onClick={onNext}
          className="flex-1 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-semibold rounded-xl shadow-lg shadow-amber-500/30 hover:shadow-xl transition-all"
        >
          Continue to Payment →
        </button>
      </div>
    </motion.div>
  );
};

// Step 3: Payment & Confirmation
const StepPayment = ({
  startDate,
  endDate,
  extras,
  vehicle,
  totalPrice,
  totalDays,
  onCreateBooking,
  isCreating,
}) => {
  const [paymentMethod, setPaymentMethod] = useState("card");

  const pricePerDay = vehicle?.currentPrice || vehicle?.basePrice || 0;
  const extrasPerDay = Object.entries(extras).reduce((sum, [key, selected]) => {
    if (selected) {
      const prices = { insurance: 200, gps: 100, childSeat: 150, driver: 500 };
      return sum + (prices[key] || 0);
    }
    return sum;
  }, 0);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      {/* Price Breakdown */}
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-900/50 rounded-xl p-5 space-y-3">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
          <SparklesIcon className="w-4 h-4 text-amber-500" />
          Price Breakdown
        </h3>

        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">
              Rental Days
            </span>
            <span className="font-medium">{totalDays} days</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">
              Price per day
            </span>
            <span className="font-medium">₹{pricePerDay.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">
              Extras per day
            </span>
            <span className="font-medium">
              +₹{extrasPerDay.toLocaleString()}
            </span>
          </div>

          {Object.entries(extras).map(([key, selected]) => {
            if (!selected) return null;
            const labels = {
              insurance: "Zero Dep Insurance",
              gps: "GPS Navigation",
              childSeat: "Child Seat",
              driver: "Professional Driver",
            };
            const prices = {
              insurance: 200,
              gps: 100,
              childSeat: 150,
              driver: 500,
            };
            return (
              <div key={key} className="flex justify-between pl-4">
                <span className="text-gray-500 text-xs">• {labels[key]}</span>
                <span className="text-gray-500 text-xs">
                  +₹{prices[key]}/day
                </span>
              </div>
            );
          })}

          <div className="border-t border-gray-200 dark:border-gray-700 pt-3 mt-3">
            <div className="flex justify-between items-center">
              <span className="font-bold text-gray-900 dark:text-white">
                Total Amount
              </span>
              <div className="text-right">
                <span className="text-2xl font-bold bg-gradient-to-r from-amber-500 to-amber-600 bg-clip-text text-transparent">
                  ₹{totalPrice.toLocaleString()}
                </span>
                <p className="text-xs text-gray-500">incl. all taxes</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Methods */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
          Select Payment Method
        </label>
        <div className="space-y-3">
          {[
            {
              id: "card",
              name: "Credit/Debit Card",
              icon: CreditCardIcon,
              description: "Visa, Mastercard, RuPay",
            },
            {
              id: "upi",
              name: "UPI",
              icon: DevicePhoneMobileIcon,
              description: "Google Pay, PhonePe, Paytm",
            },
          ].map((method) => {
            const Icon = method.icon;
            return (
              <label
                key={method.id}
                className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 ${
                  paymentMethod === method.id
                    ? "border-amber-500 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20"
                    : "border-gray-200 dark:border-gray-700 hover:border-amber-300"
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value={method.id}
                  checked={paymentMethod === method.id}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-4 h-4 text-amber-500"
                />
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    paymentMethod === method.id
                      ? "bg-gradient-to-r from-amber-500 to-amber-600 text-white"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-500"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {method.name}
                  </p>
                  <p className="text-xs text-gray-500">{method.description}</p>
                </div>
                {paymentMethod === method.id && (
                  <CheckCircleIcon className="w-5 h-5 text-amber-500" />
                )}
              </label>
            );
          })}
        </div>
      </div>

      {/* Confirm Button */}
      <button
        onClick={onCreateBooking}
        disabled={isCreating}
        className="w-full py-4 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-bold rounded-xl shadow-lg shadow-amber-500/30 hover:shadow-xl transition-all disabled:opacity-50"
      >
        {isCreating ? (
          <div className="flex items-center justify-center gap-2">
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Processing...
          </div>
        ) : (
          `Confirm & Pay ₹${totalPrice.toLocaleString()}`
        )}
      </button>

      <p className="text-xs text-center text-gray-500">
        By confirming, you agree to our Terms of Service and Cancellation Policy
      </p>
    </motion.div>
  );
};

// Main Modal Component
export default function BookingFlowModal({ isOpen, onClose, vehicle }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [extras, setExtras] = useState({
    insurance: false,
    gps: false,
    childSeat: false,
    driver: false,
  });
  const [isCreating, setIsCreating] = useState(false);

  const steps = [
    { title: "Select Dates", component: StepDates },
    { title: "Add Extras", component: StepExtras },
    { title: "Payment", component: StepPayment },
  ];

  const CurrentStepComponent = steps[currentStep].component;

  const totalDays =
    startDate && endDate
      ? Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24))
      : 0;

  const pricePerDay = vehicle?.currentPrice || vehicle?.basePrice || 0;

  const extrasPerDay = Object.entries(extras).reduce((sum, [key, selected]) => {
    if (selected) {
      const prices = { insurance: 200, gps: 100, childSeat: 150, driver: 500 };
      return sum + (prices[key] || 0);
    }
    return sum;
  }, 0);

  const totalPrice = (pricePerDay + extrasPerDay) * totalDays;

  const handleNext = () => {
    setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const handleCreateBooking = async () => {
    setIsCreating(true);
    try {
      const bookingData = {
        vehicleId: vehicle._id,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        pickupLocation: vehicle?.locationName || vehicle?.city,
        extras: extras,
      };

      const res = await bookingAPI.create(bookingData);

      toast.success("Booking confirmed successfully! 🎉");
      onClose();

      // Reset form
      setCurrentStep(0);
      setStartDate(null);
      setEndDate(null);
      setExtras({
        insurance: false,
        gps: false,
        childSeat: false,
        driver: false,
      });

      // Navigate to dashboard after 1 second
      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 1500);
    } catch (err) {
      console.error("Booking error:", err);
      toast.error(
        err.response?.data?.message || "Booking failed. Please try again.",
      );
    } finally {
      setIsCreating(false);
    }
  };

  const handleClose = () => {
    setCurrentStep(0);
    setStartDate(null);
    setEndDate(null);
    setExtras({
      insurance: false,
      gps: false,
      childSeat: false,
      driver: false,
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-x-4 top-1/2 -translate-y-1/2 max-w-2xl mx-auto bg-white dark:bg-gray-900 rounded-2xl shadow-2xl z-50 max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 px-6 py-4 flex items-center justify-between rounded-t-2xl">
              <div>
                <h2 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent">
                  Book {vehicle?.name}
                </h2>
                <p className="text-sm text-gray-500">
                  Complete your booking in 3 easy steps
                </p>
              </div>
              <button
                onClick={handleClose}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Step Indicator */}
            <StepIndicator currentStep={currentStep} steps={steps} />

            {/* Form Content */}
            <div className="px-6 py-4">
              <CurrentStepComponent
                startDate={startDate}
                endDate={endDate}
                setStartDate={setStartDate}
                setEndDate={setEndDate}
                extras={extras}
                setExtras={setExtras}
                vehicle={vehicle}
                totalPrice={totalPrice}
                totalDays={totalDays}
                onCreateBooking={handleCreateBooking}
                isCreating={isCreating}
                onNext={handleNext}
                onBack={handleBack}
              />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
