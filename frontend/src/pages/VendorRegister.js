import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  UserIcon,
  EnvelopeIcon,
  LockClosedIcon,
  PhoneIcon,
  BuildingStorefrontIcon,
  DocumentTextIcon,
  MapPinIcon,
  BanknotesIcon,
  CreditCardIcon,
  EyeIcon,
  EyeSlashIcon,
  CheckBadgeIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
  IdentificationIcon,
} from "@heroicons/react/24/outline";

export default function VendorRegister() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [vendorType, setVendorType] = useState(null);

  // Common Information
  const [commonInfo, setCommonInfo] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
  });

  // Individual Vendor Details
  const [individualDetails, setIndividualDetails] = useState({
    aadharNumber: "",
    panNumber: "",
    address: "",
  });

  // Business Vendor Details
  const [businessDetails, setBusinessDetails] = useState({
    businessName: "",
    gstNumber: "",
    panNumber: "",
    businessAddress: "",
    website: "",
  });

  // Bank Details
  const [bankDetails, setBankDetails] = useState({
    accountHolderName: "",
    accountNumber: "",
    ifscCode: "",
    bankName: "",
  });

  const handleCommonChange = (e) => {
    setCommonInfo({ ...commonInfo, [e.target.name]: e.target.value });
  };

  const handleIndividualChange = (e) => {
    setIndividualDetails({
      ...individualDetails,
      [e.target.name]: e.target.value,
    });
  };

  const handleBusinessChange = (e) => {
    setBusinessDetails({ ...businessDetails, [e.target.name]: e.target.value });
  };

  const handleBankChange = (e) => {
    setBankDetails({ ...bankDetails, [e.target.name]: e.target.value });
  };

  const validateCommonInfo = () => {
    if (!commonInfo.name.trim()) {
      toast.error("Please enter your full name");
      return false;
    }
    if (!commonInfo.email.trim()) {
      toast.error("Please enter email address");
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(commonInfo.email)) {
      toast.error("Please enter a valid email address");
      return false;
    }
    if (!commonInfo.phone.trim()) {
      toast.error("Please enter phone number");
      return false;
    }
    if (!/^[0-9]{10}$/.test(commonInfo.phone)) {
      toast.error("Please enter a valid 10-digit phone number");
      return false;
    }
    if (!commonInfo.password) {
      toast.error("Please enter a password");
      return false;
    }
    if (commonInfo.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return false;
    }
    if (commonInfo.password !== commonInfo.confirmPassword) {
      toast.error("Passwords do not match");
      return false;
    }
    return true;
  };

  const validateIndividualInfo = () => {
    if (!individualDetails.aadharNumber) {
      toast.error("Please enter Aadhar number");
      return false;
    }
    if (!/^[0-9]{12}$/.test(individualDetails.aadharNumber)) {
      toast.error("Please enter valid 12-digit Aadhar number");
      return false;
    }
    if (!individualDetails.panNumber) {
      toast.error("Please enter PAN number");
      return false;
    }
    if (
      !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(
        individualDetails.panNumber.toUpperCase(),
      )
    ) {
      toast.error("Please enter valid PAN number");
      return false;
    }
    if (!individualDetails.address) {
      toast.error("Please enter address");
      return false;
    }
    return true;
  };

  const validateBusinessInfo = () => {
    if (!businessDetails.businessName) {
      toast.error("Please enter business name");
      return false;
    }
    if (!businessDetails.gstNumber) {
      toast.error("Please enter GST number");
      return false;
    }
    if (businessDetails.gstNumber.length !== 15) {
      toast.error("GST number must be 15 characters");
      return false;
    }
    if (!businessDetails.panNumber) {
      toast.error("Please enter PAN number");
      return false;
    }
    if (businessDetails.panNumber.length !== 10) {
      toast.error("PAN number must be 10 characters");
      return false;
    }
    if (!businessDetails.businessAddress) {
      toast.error("Please enter business address");
      return false;
    }
    return true;
  };

  const validateBankInfo = () => {
    if (!bankDetails.accountHolderName) {
      toast.error("Please enter account holder name");
      return false;
    }
    if (!bankDetails.accountNumber) {
      toast.error("Please enter bank account number");
      return false;
    }
    if (!/^[0-9]{9,18}$/.test(bankDetails.accountNumber)) {
      toast.error("Please enter valid account number (9-18 digits)");
      return false;
    }
    if (!bankDetails.ifscCode) {
      toast.error("Please enter IFSC code");
      return false;
    }
    if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(bankDetails.ifscCode.toUpperCase())) {
      toast.error("Please enter valid IFSC code");
      return false;
    }
    if (!bankDetails.bankName) {
      toast.error("Please enter bank name");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!vendorType) {
      toast.error("Please select vendor type");
      return;
    }
    if (!validateCommonInfo()) return;
    if (vendorType === "individual" && !validateIndividualInfo()) return;
    if (vendorType === "business" && !validateBusinessInfo()) return;
    if (!validateBankInfo()) return;

    setLoading(true);

    const vendorData = {
      vendorType,
      ...commonInfo,
      ...(vendorType === "individual"
        ? { individualDetails }
        : { businessDetails }),
      bankDetails,
    };

    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL || "https://wheelz-ldq2.onrender.com/api"}/vendor/register`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(vendorData),
        },
      );
      const data = await response.json();
      if (data.success) {
        toast.success(data.message || "Registration submitted for approval!");
        navigate("/vendor-pending");
      } else {
        toast.error(data.message || "Registration failed");
      }
    } catch (error) {
      console.error("Registration error:", error);
      toast.error("Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (step === 1 && vendorType && validateCommonInfo()) setStep(2);
    else if (step === 2) {
      if (vendorType === "individual" && validateIndividualInfo()) setStep(3);
      else if (vendorType === "business" && validateBusinessInfo()) setStep(3);
    } else if (step === 3 && validateBankInfo()) setStep(4);
  };

  const prevStep = () => setStep(step - 1);

  // Vendor Type Selection Screen
  if (!vendorType) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-20 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900">
        <div className="max-w-4xl w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <BuildingStorefrontIcon className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Choose Vendor Type
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Select how you want to register
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Individual Vendor */}
            <div
              onClick={() => setVendorType("individual")}
              className="cursor-pointer border-2 border-gray-200 dark:border-gray-700 rounded-2xl p-6 hover:border-green-500 hover:shadow-lg transition-all group"
            >
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center mb-4">
                <UserIcon className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Individual Vendor</h3>
              <p className="text-gray-500 text-sm mb-4">
                For individuals renting out personal vehicles
              </p>
              <ul className="text-sm text-gray-600 space-y-2">
                <li className="flex items-center gap-2">✅ Up to 5 vehicles</li>
                <li className="flex items-center gap-2">💰 15% commission</li>
                <li className="flex items-center gap-2">
                  📄 Personal PAN required
                </li>
                <li className="flex items-center gap-2">
                  🆔 Aadhar verification
                </li>
              </ul>
            </div>

            {/* Business Vendor */}
            <div
              onClick={() => setVendorType("business")}
              className="cursor-pointer border-2 border-gray-200 dark:border-gray-700 rounded-2xl p-6 hover:border-green-500 hover:shadow-lg transition-all group"
            >
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center mb-4">
                <BuildingStorefrontIcon className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Business Vendor</h3>
              <p className="text-gray-500 text-sm mb-4">
                For companies, rental agencies, businesses
              </p>
              <ul className="text-sm text-gray-600 space-y-2">
                <li className="flex items-center gap-2">
                  ✅ Unlimited vehicles
                </li>
                <li className="flex items-center gap-2">💰 10% commission</li>
                <li className="flex items-center gap-2">
                  📄 Business PAN & GST required
                </li>
                <li className="flex items-center gap-2">⭐ Priority support</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-20 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900">
      <div className="max-w-3xl w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            {vendorType === "individual" ? (
              <UserIcon className="w-8 h-8 text-white" />
            ) : (
              <BuildingStorefrontIcon className="w-8 h-8 text-white" />
            )}
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {vendorType === "individual"
              ? "Individual Vendor Registration"
              : "Business Vendor Registration"}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            {vendorType === "individual"
              ? "Register as an individual vehicle owner"
              : "Register your business as a vendor partner"}
          </p>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center gap-4">
            {[1, 2, 3, 4].map((s) => (
              <div key={s} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step >= s
                      ? "bg-green-500 text-white"
                      : "bg-gray-200 dark:bg-gray-700 text-gray-500"
                  }`}
                >
                  {s}
                </div>
                {s < 4 && (
                  <div className="w-12 h-0.5 bg-gray-200 dark:bg-gray-700 ml-4"></div>
                )}
              </div>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Step 1: Common Info */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Full Name *
                </label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    name="name"
                    value={commonInfo.name}
                    onChange={handleCommonChange}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="John Doe"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Email Address *
                </label>
                <div className="relative">
                  <EnvelopeIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    name="email"
                    value={commonInfo.email}
                    onChange={handleCommonChange}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-green-500"
                    placeholder="vendor@example.com"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Phone Number *
                </label>
                <div className="relative">
                  <PhoneIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="tel"
                    name="phone"
                    value={commonInfo.phone}
                    onChange={handleCommonChange}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-green-500"
                    placeholder="9876543210"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Password *
                </label>
                <div className="relative">
                  <LockClosedIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={commonInfo.password}
                    onChange={handleCommonChange}
                    className="w-full pl-10 pr-12 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-green-500"
                    placeholder="••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="w-5 h-5 text-gray-400" />
                    ) : (
                      <EyeIcon className="w-5 h-5 text-gray-400" />
                    )}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Minimum 6 characters
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Confirm Password *
                </label>
                <div className="relative">
                  <LockClosedIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={commonInfo.confirmPassword}
                    onChange={handleCommonChange}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-green-500"
                    placeholder="••••••"
                    required
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Vendor Specific Details */}
          {step === 2 && vendorType === "individual" && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Aadhar Number *
                </label>
                <div className="relative">
                  <IdentificationIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    name="aadharNumber"
                    value={individualDetails.aadharNumber}
                    onChange={handleIndividualChange}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-green-500"
                    placeholder="123456789012"
                    required
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  12-digit Aadhar number
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  PAN Number *
                </label>
                <div className="relative">
                  <DocumentTextIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    name="panNumber"
                    value={individualDetails.panNumber}
                    onChange={handleIndividualChange}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-green-500 uppercase"
                    placeholder="ABCDE1234F"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Residential Address *
                </label>
                <div className="relative">
                  <MapPinIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <textarea
                    name="address"
                    value={individualDetails.address}
                    onChange={handleIndividualChange}
                    rows="3"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-green-500"
                    placeholder="Full address"
                    required
                  />
                </div>
              </div>
            </div>
          )}

          {step === 2 && vendorType === "business" && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Business Name *
                </label>
                <div className="relative">
                  <BuildingStorefrontIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    name="businessName"
                    value={businessDetails.businessName}
                    onChange={handleBusinessChange}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-green-500"
                    placeholder="Your Business Name"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  GST Number *
                </label>
                <div className="relative">
                  <DocumentTextIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    name="gstNumber"
                    value={businessDetails.gstNumber}
                    onChange={handleBusinessChange}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-green-500 uppercase"
                    placeholder="22AAAAA0000A1Z"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Business PAN Number *
                </label>
                <div className="relative">
                  <DocumentTextIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    name="panNumber"
                    value={businessDetails.panNumber}
                    onChange={handleBusinessChange}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-green-500 uppercase"
                    placeholder="ABCDE1234F"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Business Address *
                </label>
                <div className="relative">
                  <MapPinIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <textarea
                    name="businessAddress"
                    value={businessDetails.businessAddress}
                    onChange={handleBusinessChange}
                    rows="3"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-green-500"
                    placeholder="Full business address"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Website (Optional)
                </label>
                <div className="relative">
                  <GlobeAltIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="url"
                    name="website"
                    value={businessDetails.website}
                    onChange={handleBusinessChange}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-green-500"
                    placeholder="https://yourbusiness.com"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Bank Details */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Account Holder Name *
                </label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    name="accountHolderName"
                    value={bankDetails.accountHolderName}
                    onChange={handleBankChange}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-green-500"
                    placeholder="As per bank account"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Bank Account Number *
                </label>
                <div className="relative">
                  <CreditCardIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    name="accountNumber"
                    value={bankDetails.accountNumber}
                    onChange={handleBankChange}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-green-500"
                    placeholder="Account number"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  IFSC Code *
                </label>
                <div className="relative">
                  <BanknotesIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    name="ifscCode"
                    value={bankDetails.ifscCode}
                    onChange={handleBankChange}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-green-500 uppercase"
                    placeholder="SBIN0001234"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Bank Name *
                </label>
                <input
                  type="text"
                  name="bankName"
                  value={bankDetails.bankName}
                  onChange={handleBankChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-green-500"
                  placeholder="State Bank of India"
                  required
                />
              </div>
            </div>
          )}

          {/* Step 4: Summary */}
          {step === 4 && (
            <div className="space-y-4">
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-5">
                <h3 className="font-semibold text-lg mb-4">
                  Registration Summary
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-600">
                    <span className="text-gray-600">Vendor Type:</span>
                    <span className="font-semibold">
                      {vendorType === "individual" ? "Individual" : "Business"}
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-600">
                    <span className="text-gray-600">Name:</span>
                    <span>{commonInfo.name}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-600">
                    <span className="text-gray-600">Email:</span>
                    <span>{commonInfo.email}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-600">
                    <span className="text-gray-600">Phone:</span>
                    <span>{commonInfo.phone}</span>
                  </div>
                  {vendorType === "individual" ? (
                    <>
                      <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-600">
                        <span className="text-gray-600">Aadhar:</span>
                        <span>{individualDetails.aadharNumber}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-600">
                        <span className="text-gray-600">PAN:</span>
                        <span>{individualDetails.panNumber}</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-600">
                        <span className="text-gray-600">Business Name:</span>
                        <span>{businessDetails.businessName}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-600">
                        <span className="text-gray-600">GST:</span>
                        <span>{businessDetails.gstNumber}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-600">
                        <span className="text-gray-600">Business PAN:</span>
                        <span>{businessDetails.panNumber}</span>
                      </div>
                    </>
                  )}
                  <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-600">
                    <span className="text-gray-600">Commission Rate:</span>
                    <span className="font-semibold text-green-600">
                      {vendorType === "individual" ? "15%" : "10%"}
                    </span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-gray-600">Vehicle Limit:</span>
                    <span className="font-semibold text-blue-600">
                      {vendorType === "individual"
                        ? "Up to 5 vehicles"
                        : "Unlimited"}
                    </span>
                  </div>
                </div>
              </div>
              <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-4">
                <p className="text-sm text-amber-700 dark:text-amber-400 flex items-center gap-2">
                  <CheckBadgeIcon className="w-5 h-5" />
                  Your registration will be reviewed by admin. Approval may take
                  24-48 hours.
                </p>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between gap-4 mt-8">
            {step > 1 && (
              <button
                type="button"
                onClick={prevStep}
                className="flex items-center gap-2 px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition"
              >
                <ArrowLeftIcon className="w-4 h-4" /> Previous
              </button>
            )}
            {step < 4 ? (
              <button
                type="button"
                onClick={nextStep}
                className="flex items-center gap-2 px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl transition ml-auto"
              >
                Next <ArrowRightIcon className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading}
                className="flex items-center justify-center gap-2 w-full py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold rounded-xl transition disabled:opacity-50"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  "Submit Registration"
                )}
              </button>
            )}
          </div>
        </form>

        <p className="text-center text-gray-500 dark:text-gray-400 mt-6">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-green-600 font-semibold hover:underline"
          >
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
