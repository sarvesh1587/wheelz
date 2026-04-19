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
} from "@heroicons/react/24/outline";

export default function VendorRegister() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  // Personal Information
  const [personalInfo, setPersonalInfo] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
  });

  // Business Information
  const [businessInfo, setBusinessInfo] = useState({
    businessName: "",
    gstNumber: "",
    businessAddress: "",
    panNumber: "",
  });

  // Bank Information
  const [bankInfo, setBankInfo] = useState({
    bankAccountNumber: "",
    ifscCode: "",
    accountHolderName: "",
  });

  const handlePersonalChange = (e) => {
    setPersonalInfo({ ...personalInfo, [e.target.name]: e.target.value });
  };

  const handleBusinessChange = (e) => {
    setBusinessInfo({ ...businessInfo, [e.target.name]: e.target.value });
  };

  const handleBankChange = (e) => {
    setBankInfo({ ...bankInfo, [e.target.name]: e.target.value });
  };

  const validatePersonalInfo = () => {
    if (!personalInfo.name.trim()) {
      toast.error("Please enter your full name");
      return false;
    }
    if (!personalInfo.email.trim()) {
      toast.error("Please enter email address");
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(personalInfo.email)) {
      toast.error("Please enter a valid email address");
      return false;
    }
    if (!personalInfo.phone.trim()) {
      toast.error("Please enter phone number");
      return false;
    }
    if (!/^[0-9]{10}$/.test(personalInfo.phone)) {
      toast.error("Please enter a valid 10-digit phone number");
      return false;
    }
    if (!personalInfo.password) {
      toast.error("Please enter a password");
      return false;
    }
    if (personalInfo.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return false;
    }
    if (personalInfo.password !== personalInfo.confirmPassword) {
      toast.error("Passwords do not match");
      return false;
    }
    return true;
  };

  // const validateBusinessInfo = () => {
  //   if (!businessInfo.businessName.trim()) {
  //     toast.error("Please enter business name");
  //     return false;
  //   }
  //   if (!businessInfo.gstNumber.trim()) {
  //     toast.error("Please enter GST number");
  //     return false;
  //   }
  //   if (
  //     !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(
  //       businessInfo.gstNumber.toUpperCase(),
  //     )
  //   ) {
  //     toast.error("Please enter a valid GST number (15 characters)");
  //     return false;
  //   }
  //   if (!businessInfo.businessAddress.trim()) {
  //     toast.error("Please enter business address");
  //     return false;
  //   }
  //   if (!businessInfo.panNumber.trim()) {
  //     toast.error("Please enter PAN number");
  //     return false;
  //   }
  //   if (
  //     !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(businessInfo.panNumber.toUpperCase())
  //   ) {
  //     toast.error("Please enter a valid PAN number (10 characters)");
  //     return false;
  //   }
  //   return true;
  // };
  const validateBusinessInfo = () => {
    if (!businessInfo.businessName.trim()) {
      toast.error("Please enter business name");
      return false;
    }
    if (!businessInfo.gstNumber.trim()) {
      toast.error("Please enter GST number");
      return false;
    }
    // Relaxed GST validation - accept any 15 character input for testing
    if (businessInfo.gstNumber.length !== 15) {
      toast.error("GST number must be 15 characters");
      return false;
    }
    if (!businessInfo.businessAddress.trim()) {
      toast.error("Please enter business address");
      return false;
    }
    if (!businessInfo.panNumber.trim()) {
      toast.error("Please enter PAN number");
      return false;
    }
    // Relaxed PAN validation - accept any 10 character input for testing
    if (businessInfo.panNumber.length !== 10) {
      toast.error("PAN number must be 10 characters");
      return false;
    }
    return true;
  };
  const validateBankInfo = () => {
    if (!bankInfo.accountHolderName.trim()) {
      toast.error("Please enter account holder name");
      return false;
    }
    if (!bankInfo.bankAccountNumber.trim()) {
      toast.error("Please enter bank account number");
      return false;
    }
    if (!/^[0-9]{9,18}$/.test(bankInfo.bankAccountNumber)) {
      toast.error("Please enter a valid bank account number (9-18 digits)");
      return false;
    }
    if (!bankInfo.ifscCode.trim()) {
      toast.error("Please enter IFSC code");
      return false;
    }
    if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(bankInfo.ifscCode.toUpperCase())) {
      toast.error("Please enter a valid IFSC code (11 characters)");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validatePersonalInfo()) return;
    if (!validateBusinessInfo()) return;
    if (!validateBankInfo()) return;

    setLoading(true);

    const vendorData = {
      name: personalInfo.name,
      email: personalInfo.email,
      password: personalInfo.password,
      phone: personalInfo.phone,
      businessName: businessInfo.businessName,
      gstNumber: businessInfo.gstNumber.toUpperCase(),
      businessAddress: businessInfo.businessAddress,
      panNumber: businessInfo.panNumber.toUpperCase(),
      bankAccountNumber: bankInfo.bankAccountNumber,
      ifscCode: bankInfo.ifscCode.toUpperCase(),
      accountHolderName: bankInfo.accountHolderName,
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
        toast.success(
          "Registration submitted! Admin will review and approve your account.",
        );
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
    if (step === 1 && validatePersonalInfo()) {
      setStep(2);
    } else if (step === 2 && validateBusinessInfo()) {
      setStep(3);
    }
  };

  const prevStep = () => {
    setStep(step - 1);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-20 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900">
      <div className="max-w-3xl w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 animate-fade-in">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <BuildingStorefrontIcon className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Become a Vendor Partner
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Register your business and start earning with Wheelz
          </p>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center gap-4">
            <div
              className={`flex items-center gap-2 ${step >= 1 ? "text-green-500" : "text-gray-400"}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? "bg-green-500 text-white" : "bg-gray-200 dark:bg-gray-700 text-gray-500"}`}
              >
                1
              </div>
              <span className="text-sm font-medium hidden sm:inline">
                Personal
              </span>
            </div>
            <div className="w-12 h-0.5 bg-gray-200 dark:bg-gray-700"></div>
            <div
              className={`flex items-center gap-2 ${step >= 2 ? "text-green-500" : "text-gray-400"}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? "bg-green-500 text-white" : "bg-gray-200 dark:bg-gray-700 text-gray-500"}`}
              >
                2
              </div>
              <span className="text-sm font-medium hidden sm:inline">
                Business
              </span>
            </div>
            <div className="w-12 h-0.5 bg-gray-200 dark:bg-gray-700"></div>
            <div
              className={`flex items-center gap-2 ${step >= 3 ? "text-green-500" : "text-gray-400"}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 3 ? "bg-green-500 text-white" : "bg-gray-200 dark:bg-gray-700 text-gray-500"}`}
              >
                3
              </div>
              <span className="text-sm font-medium hidden sm:inline">Bank</span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Step 1: Personal Information */}
          {step === 1 && (
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Full Name *
                </label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    name="name"
                    value={personalInfo.name}
                    onChange={handlePersonalChange}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                    placeholder="John Doe"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email Address *
                </label>
                <div className="relative">
                  <EnvelopeIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    name="email"
                    value={personalInfo.email}
                    onChange={handlePersonalChange}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                    placeholder="business@example.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Phone Number *
                </label>
                <div className="relative">
                  <PhoneIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="tel"
                    name="phone"
                    value={personalInfo.phone}
                    onChange={handlePersonalChange}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                    placeholder="9876543210"
                    required
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  10-digit mobile number
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Password *
                </label>
                <div className="relative">
                  <LockClosedIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={personalInfo.password}
                    onChange={handlePersonalChange}
                    className="w-full pl-10 pr-12 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                    placeholder="••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="w-5 h-5" />
                    ) : (
                      <EyeIcon className="w-5 h-5" />
                    )}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Minimum 6 characters
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Confirm Password *
                </label>
                <div className="relative">
                  <LockClosedIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={personalInfo.confirmPassword}
                    onChange={handlePersonalChange}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                    placeholder="••••••"
                    required
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Business Information */}
          {step === 2 && (
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Business Name *
                </label>
                <div className="relative">
                  <BuildingStorefrontIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    name="businessName"
                    value={businessInfo.businessName}
                    onChange={handleBusinessChange}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                    placeholder="Your Business Name"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  GST Number *
                </label>
                <div className="relative">
                  <DocumentTextIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    name="gstNumber"
                    value={businessInfo.gstNumber}
                    onChange={handleBusinessChange}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all uppercase"
                    placeholder="22AAAAA0000A1Z"
                    required
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  15-character GST number
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  PAN Number *
                </label>
                <div className="relative">
                  <DocumentTextIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    name="panNumber"
                    value={businessInfo.panNumber}
                    onChange={handleBusinessChange}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all uppercase"
                    placeholder="AAAAA0000A"
                    required
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  10-character PAN number
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Business Address *
                </label>
                <div className="relative">
                  <MapPinIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <textarea
                    name="businessAddress"
                    value={businessInfo.businessAddress}
                    onChange={handleBusinessChange}
                    rows="3"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                    placeholder="Full business address"
                    required
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Bank Information */}
          {step === 3 && (
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Account Holder Name *
                </label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    name="accountHolderName"
                    value={bankInfo.accountHolderName}
                    onChange={handleBankChange}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                    placeholder="As per bank account"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Bank Account Number *
                </label>
                <div className="relative">
                  <CreditCardIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    name="bankAccountNumber"
                    value={bankInfo.bankAccountNumber}
                    onChange={handleBankChange}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                    placeholder="Account number"
                    required
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  9-18 digit account number
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  IFSC Code *
                </label>
                <div className="relative">
                  <BanknotesIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    name="ifscCode"
                    value={bankInfo.ifscCode}
                    onChange={handleBankChange}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all uppercase"
                    placeholder="SBIN0001234"
                    required
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  11-character IFSC code
                </p>
              </div>

              {/* Benefits Section */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 rounded-xl p-4 mt-4">
                <div className="flex items-center gap-2 mb-3">
                  <CheckBadgeIcon className="w-5 h-5 text-green-500" />
                  <h4 className="font-semibold text-gray-900 dark:text-white">
                    Vendor Benefits
                  </h4>
                </div>
                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1 ml-7">
                  <li>• 90% earnings on each booking</li>
                  <li>• Free vehicle listing and promotion</li>
                  <li>• 24/7 vendor support</li>
                  <li>• Monthly payout directly to bank</li>
                </ul>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between gap-4 mt-8">
            {step > 1 && (
              <button
                type="button"
                onClick={prevStep}
                className="flex items-center gap-2 px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
              >
                <ArrowLeftIcon className="w-4 h-4" />
                Previous
              </button>
            )}
            {step < 3 ? (
              <button
                type="button"
                onClick={nextStep}
                className="flex items-center gap-2 px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-xl transition-all ml-auto"
              >
                Next
                <ArrowRightIcon className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading}
                className="flex items-center justify-center gap-2 w-full py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold rounded-xl transition-all duration-200 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit Application"
                )}
              </button>
            )}
          </div>
        </form>

        <p className="text-center text-gray-600 dark:text-gray-400 mt-6">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-green-500 font-semibold hover:underline"
          >
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
