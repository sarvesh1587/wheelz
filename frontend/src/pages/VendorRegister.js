import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { authAPI } from "../services/api";
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
} from "@heroicons/react/24/outline";

export default function VendorRegister() {
  const navigate = useNavigate();
  const { login } = useAuth();
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
    if (!personalInfo.name) {
      toast.error("Please enter your full name");
      return false;
    }
    if (!personalInfo.email) {
      toast.error("Please enter email address");
      return false;
    }
    if (!personalInfo.password || personalInfo.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return false;
    }
    if (personalInfo.password !== personalInfo.confirmPassword) {
      toast.error("Passwords do not match");
      return false;
    }
    if (!personalInfo.phone) {
      toast.error("Please enter phone number");
      return false;
    }
    return true;
  };

  const validateBusinessInfo = () => {
    if (!businessInfo.businessName) {
      toast.error("Please enter business name");
      return false;
    }
    if (!businessInfo.gstNumber) {
      toast.error("Please enter GST number");
      return false;
    }
    if (!businessInfo.businessAddress) {
      toast.error("Please enter business address");
      return false;
    }
    if (!businessInfo.panNumber) {
      toast.error("Please enter PAN number");
      return false;
    }
    return true;
  };

  const validateBankInfo = () => {
    if (!bankInfo.bankAccountNumber) {
      toast.error("Please enter bank account number");
      return false;
    }
    if (!bankInfo.ifscCode) {
      toast.error("Please enter IFSC code");
      return false;
    }
    if (!bankInfo.accountHolderName) {
      toast.error("Please enter account holder name");
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
      ...personalInfo,
      ...businessInfo,
      ...bankInfo,
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
          <div className="w-16 h-16 bg-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <BuildingStorefrontIcon className="w-8 h-8 text-gray-900" />
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
              className={`flex items-center gap-2 ${step >= 1 ? "text-amber-500" : "text-gray-400"}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? "bg-amber-500 text-white" : "bg-gray-200 dark:bg-gray-700 text-gray-500"}`}
              >
                1
              </div>
              <span className="text-sm font-medium hidden sm:inline">
                Personal
              </span>
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
              <span className="text-sm font-medium hidden sm:inline">
                Business
              </span>
            </div>
            <div className="w-12 h-0.5 bg-gray-200 dark:bg-gray-700"></div>
            <div
              className={`flex items-center gap-2 ${step >= 3 ? "text-amber-500" : "text-gray-400"}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 3 ? "bg-amber-500 text-white" : "bg-gray-200 dark:bg-gray-700 text-gray-500"}`}
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
                  Full Name
                </label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    name="name"
                    value={personalInfo.name}
                    onChange={handlePersonalChange}
                    className="input-field pl-10"
                    placeholder="John Doe"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <EnvelopeIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    name="email"
                    value={personalInfo.email}
                    onChange={handlePersonalChange}
                    className="input-field pl-10"
                    placeholder="business@example.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Phone Number
                </label>
                <div className="relative">
                  <PhoneIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="tel"
                    name="phone"
                    value={personalInfo.phone}
                    onChange={handlePersonalChange}
                    className="input-field pl-10"
                    placeholder="9876543210"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Password
                </label>
                <div className="relative">
                  <LockClosedIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={personalInfo.password}
                    onChange={handlePersonalChange}
                    className="input-field pl-10 pr-10"
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
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <LockClosedIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={personalInfo.confirmPassword}
                    onChange={handlePersonalChange}
                    className="input-field pl-10"
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
                  Business Name
                </label>
                <div className="relative">
                  <BuildingStorefrontIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    name="businessName"
                    value={businessInfo.businessName}
                    onChange={handleBusinessChange}
                    className="input-field pl-10"
                    placeholder="Your Business Name"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  GST Number
                </label>
                <div className="relative">
                  <DocumentTextIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    name="gstNumber"
                    value={businessInfo.gstNumber}
                    onChange={handleBusinessChange}
                    className="input-field pl-10"
                    placeholder="22AAAAA0000A1Z"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  PAN Number
                </label>
                <div className="relative">
                  <DocumentTextIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    name="panNumber"
                    value={businessInfo.panNumber}
                    onChange={handleBusinessChange}
                    className="input-field pl-10"
                    placeholder="AAAAA0000A"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Business Address
                </label>
                <div className="relative">
                  <MapPinIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <textarea
                    name="businessAddress"
                    value={businessInfo.businessAddress}
                    onChange={handleBusinessChange}
                    className="input-field pl-10"
                    rows="3"
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
                  Account Holder Name
                </label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    name="accountHolderName"
                    value={bankInfo.accountHolderName}
                    onChange={handleBankChange}
                    className="input-field pl-10"
                    placeholder="As per bank account"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Bank Account Number
                </label>
                <div className="relative">
                  <CreditCardIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    name="bankAccountNumber"
                    value={bankInfo.bankAccountNumber}
                    onChange={handleBankChange}
                    className="input-field pl-10"
                    placeholder="Account number"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  IFSC Code
                </label>
                <div className="relative">
                  <BanknotesIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    name="ifscCode"
                    value={bankInfo.ifscCode}
                    onChange={handleBankChange}
                    className="input-field pl-10"
                    placeholder="SBIN0001234"
                    required
                  />
                </div>
              </div>

              {/* Benefits Section */}
              <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-4 mt-4">
                <div className="flex items-center gap-2 mb-2">
                  <CheckBadgeIcon className="w-5 h-5 text-amber-500" />
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
                className="btn-secondary flex-1"
              >
                Previous
              </button>
            )}
            {step < 3 ? (
              <button
                type="button"
                onClick={nextStep}
                className="btn-primary flex-1"
              >
                Next
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading}
                className="btn-primary flex-1 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
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
            className="text-amber-500 font-semibold hover:underline"
          >
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
