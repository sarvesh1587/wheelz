// import React, { useState } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import {
//   XMarkIcon,
//   MapPinIcon,
//   ShieldCheckIcon,
//   DevicePhoneMobileIcon,
//   UserGroupIcon,
//   CreditCardIcon,
//   ChevronLeftIcon,
//   ChevronRightIcon,
//   CheckCircleIcon,
//   SparklesIcon,
// } from "@heroicons/react/24/outline";
// import DatePicker from "react-datepicker";
// import { bookingAPI } from "../services/api";
// import toast from "react-hot-toast";
// import "react-datepicker/dist/react-datepicker.css";

// // Step Indicator
// const StepIndicator = ({ currentStep, steps }) => {
//   return (
//     <div className="mb-6 px-4 pt-4">
//       <div className="flex items-center justify-between">
//         {steps.map((step, index) => (
//           <div key={index} className="flex-1 relative">
//             {index < steps.length - 1 && (
//               <div
//                 className={`absolute top-4 left-1/2 w-full h-0.5 transition-all duration-500 ${
//                   index < currentStep
//                     ? "bg-amber-500"
//                     : "bg-gray-200 dark:bg-gray-700"
//                 }`}
//                 style={{ transform: "translateX(-50%)" }}
//               />
//             )}
//             <div className="relative flex flex-col items-center">
//               <div
//                 className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 z-10 ${
//                   index < currentStep
//                     ? "bg-amber-500 text-white"
//                     : index === currentStep
//                       ? "bg-amber-500 text-white ring-4 ring-amber-500/30"
//                       : "bg-gray-200 dark:bg-gray-700 text-gray-500"
//                 }`}
//               >
//                 {index < currentStep ? (
//                   <CheckCircleIcon className="w-4 h-4" />
//                 ) : (
//                   index + 1
//                 )}
//               </div>
//               <span className="text-xs mt-1 font-medium text-gray-600 dark:text-gray-400 hidden sm:block">
//                 {step.title}
//               </span>
//             </div>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// };

// // Step 1: Date Selection
// const StepDates = ({
//   startDate,
//   endDate,
//   setStartDate,
//   setEndDate,
//   vehicle,
//   onNext,
// }) => {
//   const handleContinue = () => {
//     if (!startDate || !endDate) {
//       toast.error("Please select both pickup and return dates");
//       return;
//     }
//     onNext();
//   };

//   return (
//     <div className="space-y-5">
//       <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//         <div>
//           <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
//             Pickup Date
//           </label>
//           <DatePicker
//             selected={startDate}
//             onChange={setStartDate}
//             selectsStart
//             startDate={startDate}
//             endDate={endDate}
//             minDate={new Date()}
//             className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-amber-500"
//             dateFormat="dd/MM/yyyy"
//             placeholderText="Select pickup date"
//           />
//         </div>
//         <div>
//           <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
//             Return Date
//           </label>
//           <DatePicker
//             selected={endDate}
//             onChange={setEndDate}
//             selectsEnd
//             startDate={startDate}
//             endDate={endDate}
//             minDate={startDate || new Date()}
//             className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-amber-500"
//             dateFormat="dd/MM/yyyy"
//             placeholderText="Select return date"
//           />
//         </div>
//       </div>

//       {startDate && endDate && (
//         <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
//           <div className="flex items-center gap-3">
//             <img
//               src={vehicle?.images?.[0]}
//               alt={vehicle?.name}
//               className="w-12 h-12 rounded-lg object-cover"
//             />
//             <div className="flex-1">
//               <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
//                 {vehicle?.name}
//               </h4>
//               <p className="text-xs text-gray-600 dark:text-gray-400">
//                 ₹{vehicle?.currentPrice || vehicle?.basePrice}/day
//               </p>
//             </div>
//           </div>
//         </div>
//       )}

//       <button
//         onClick={handleContinue}
//         className="w-full py-2.5 bg-amber-500 text-white font-semibold rounded-lg hover:bg-amber-600 transition-all"
//       >
//         Continue →
//       </button>
//     </div>
//   );
// };

// // Step 2: Extras
// const StepExtras = ({ extras, setExtras, onNext, onBack }) => {
//   const extrasList = [
//     {
//       key: "insurance",
//       label: "Zero Dep Insurance",
//       price: 200,
//       description: "Full coverage",
//     },
//     {
//       key: "gps",
//       label: "GPS Navigation",
//       price: 100,
//       description: "Real-time navigation",
//     },
//     {
//       key: "childSeat",
//       label: "Child Seat",
//       price: 150,
//       description: "For kids",
//     },
//     {
//       key: "driver",
//       label: "Professional Driver",
//       price: 500,
//       description: "Experienced driver",
//     },
//   ];

//   return (
//     <div className="space-y-3">
//       {extrasList.map((extra) => {
//         const isSelected = extras[extra.key];
//         return (
//           <div
//             key={extra.key}
//             onClick={() => setExtras({ ...extras, [extra.key]: !isSelected })}
//             className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
//               isSelected
//                 ? "border-amber-500 bg-amber-50 dark:bg-amber-900/20"
//                 : "border-gray-200 dark:border-gray-700 hover:border-amber-300"
//             }`}
//           >
//             <div className="flex items-center justify-between">
//               <div>
//                 <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
//                   {extra.label}
//                 </h4>
//                 <p className="text-xs text-gray-500">{extra.description}</p>
//               </div>
//               <div className="text-right">
//                 <p className="font-bold text-amber-600">+₹{extra.price}</p>
//                 <p className="text-xs text-gray-400">/day</p>
//               </div>
//             </div>
//           </div>
//         );
//       })}

//       <div className="flex gap-3 mt-4">
//         <button
//           onClick={onBack}
//           className="flex-1 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 font-semibold"
//         >
//           Back
//         </button>
//         <button
//           onClick={onNext}
//           className="flex-1 py-2 bg-amber-500 text-white font-semibold rounded-lg"
//         >
//           Continue →
//         </button>
//       </div>
//     </div>
//   );
// };

// // Step 3: Payment
// const StepPayment = ({
//   totalPrice,
//   totalDays,
//   onCreateBooking,
//   isCreating,
// }) => {
//   return (
//     <div className="space-y-4">
//       <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 space-y-2">
//         <h3 className="font-semibold text-gray-900 dark:text-white">
//           Price Breakdown
//         </h3>
//         <div className="space-y-1 text-sm">
//           <div className="flex justify-between">
//             <span className="text-gray-600">Total Days</span>
//             <span>{totalDays} days</span>
//           </div>
//           <div className="border-t pt-2 mt-2">
//             <div className="flex justify-between font-bold">
//               <span>Total Amount</span>
//               <span className="text-amber-600 text-lg">
//                 ₹{totalPrice.toLocaleString()}
//               </span>
//             </div>
//           </div>
//         </div>
//       </div>

//       <button
//         onClick={onCreateBooking}
//         disabled={isCreating}
//         className="w-full py-3 bg-amber-500 text-white font-bold rounded-lg disabled:opacity-50"
//       >
//         {isCreating
//           ? "Processing..."
//           : `Confirm & Pay ₹${totalPrice.toLocaleString()}`}
//       </button>

//       <p className="text-xs text-center text-gray-500">
//         By confirming, you agree to our Terms of Service
//       </p>
//     </div>
//   );
// };

// // Main Modal Component
// export default function BookingFlowModal({ isOpen, onClose, vehicle }) {
//   const [currentStep, setCurrentStep] = useState(0);
//   const [startDate, setStartDate] = useState(null);
//   const [endDate, setEndDate] = useState(null);
//   const [extras, setExtras] = useState({
//     insurance: false,
//     gps: false,
//     childSeat: false,
//     driver: false,
//   });
//   const [isCreating, setIsCreating] = useState(false);

//   const steps = [
//     { title: "Dates", component: StepDates },
//     { title: "Extras", component: StepExtras },
//     { title: "Pay", component: StepPayment },
//   ];

//   const CurrentStepComponent = steps[currentStep].component;

//   const totalDays =
//     startDate && endDate
//       ? Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24))
//       : 0;

//   const pricePerDay = vehicle?.currentPrice || vehicle?.basePrice || 0;

//   const extrasPerDay = Object.entries(extras).reduce((sum, [key, selected]) => {
//     if (selected) {
//       const prices = { insurance: 200, gps: 100, childSeat: 150, driver: 500 };
//       return sum + (prices[key] || 0);
//     }
//     return sum;
//   }, 0);

//   const totalPrice = (pricePerDay + extrasPerDay) * totalDays;

//   const handleNext = () =>
//     setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
//   const handleBack = () => setCurrentStep((prev) => Math.max(prev - 1, 0));

//   const handleCreateBooking = async () => {
//     setIsCreating(true);
//     try {
//       await bookingAPI.create({
//         vehicleId: vehicle._id,
//         startDate: startDate.toISOString(),
//         endDate: endDate.toISOString(),
//         pickupLocation: vehicle?.locationName || vehicle?.city,
//         extras: extras,
//       });

//       toast.success("Booking confirmed! 🎉");
//       onClose();
//       setTimeout(() => {
//         window.location.href = "/dashboard";
//       }, 1500);
//     } catch (err) {
//       toast.error(err.response?.data?.message || "Booking failed");
//     } finally {
//       setIsCreating(false);
//     }
//   };

//   if (!isOpen) return null;

//   return (
//     // <>
//       {/* Backdrop */}
//       <div className="fixed inset-0 bg-black/50 z-50" onClick={onClose} />

//       {/* Modal */}
//       <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
//         <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
//           {/* Header */}
//           <div className="sticky top-0 bg-white dark:bg-gray-900 border-b px-5 py-3 flex items-center justify-between">
//             <div>
//               <h2 className="text-lg font-bold">Book {vehicle?.name}</h2>
//               <p className="text-xs text-gray-500">
//                 Step {currentStep + 1} of 3
//               </p>
//             </div>
//             <button
//               onClick={onClose}
//               className="p-1 rounded-full hover:bg-gray-100"
//             >
//               <XMarkIcon className="w-5 h-5" />
//             </button>
//           </div>

//           {/* Steps */}
//           <StepIndicator currentStep={currentStep} steps={steps} />

//           {/* Content */}
//           <div className="p-5">
//             <CurrentStepComponent
//               startDate={startDate}
//               endDate={endDate}
//               setStartDate={setStartDate}
//               setEndDate={setEndDate}
//               extras={extras}
//               setExtras={setExtras}
//               vehicle={vehicle}
//               totalPrice={totalPrice}
//               totalDays={totalDays}
//               onCreateBooking={handleCreateBooking}
//               isCreating={isCreating}
//               onNext={handleNext}
//               onBack={handleBack}
//             />
//           </div>
//         </div>
//       </div>
//     </>
//   );
// }
