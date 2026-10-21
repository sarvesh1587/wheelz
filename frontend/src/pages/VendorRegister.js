import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  User as UserIcon,
  Mail as EnvelopeIcon,
  Lock as LockClosedIcon,
  Phone as PhoneIcon,
  Store as BuildingStorefrontIcon,
  FileText as DocumentTextIcon,
  MapPin as MapPinIcon,
  Banknote as BanknotesIcon,
  CreditCard as CreditCardIcon,
  Eye as EyeIcon,
  EyeOff as EyeSlashIcon,
  BadgeCheck as CheckBadgeIcon,
  ArrowRight as ArrowRightIcon,
  ArrowLeft as ArrowLeftIcon,
  IdCard as IdentificationIcon,
} from "lucide-react";
import { PageHeader } from "../components/ui";

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
      <div className="container-x pb-24 pt-28 md:pt-32">
        <div>
          <PageHeader
            index="01"
            eyebrow="Become a vendor"
            title={["List your", "vehicles."]}
            lede="Select how you want to register."
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Individual Vendor */}
            <div
              onClick={() => setVendorType("individual")}
              className="group cursor-pointer rounded-[24px] border border-line/10 bg-surface p-8 transition-colors hover:border-accent"
            >
              <div className="w-12 h-12 bg-raised rounded-xl flex items-center justify-center mb-4">
                <UserIcon className="w-6 h-6 text-accent" />
              </div>
              <h3 className="display-tight mb-2 text-3xl">Individual Vendor</h3>
              <p className="text-muted text-sm mb-4">
                For individuals renting out personal vehicles
              </p>
              <ul className="text-sm text-muted space-y-2">
                <li className="flex items-center gap-2">Up to 5 vehicles</li>
                <li className="flex items-center gap-2">15% commission</li>
                <li className="flex items-center gap-2">
                  Personal PAN required
                </li>
                <li className="flex items-center gap-2">
                  Aadhar verification
                </li>
              </ul>
            </div>

            {/* Business Vendor */}
            <div
              onClick={() => setVendorType("business")}
              className="group cursor-pointer rounded-[24px] border border-line/10 bg-surface p-8 transition-colors hover:border-accent"
            >
              <div className="w-12 h-12 bg-raised rounded-xl flex items-center justify-center mb-4">
                <BuildingStorefrontIcon className="w-6 h-6 text-accent" />
              </div>
              <h3 className="display-tight mb-2 text-3xl">Business Vendor</h3>
              <p className="text-muted text-sm mb-4">
                For companies, rental agencies, businesses
              </p>
              <ul className="text-sm text-muted space-y-2">
                <li className="flex items-center gap-2">
                  Unlimited vehicles
                </li>
                <li className="flex items-center gap-2">10% commission</li>
                <li className="flex items-center gap-2">
                  Business PAN & GST required
                </li>
                <li className="flex items-center gap-2">Priority support</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-x pb-24 pt-28 md:pt-32">
      <div className="mx-auto max-w-3xl">
        {/* Header */}
        <PageHeader
          index="02"
          eyebrow={vendorType === "individual" ? "Individual vendor" : "Business vendor"}
          title={["Registration."]}
          size="md"
          lede={
            vendorType === "individual"
              ? "Register as an individual vehicle owner"
              : "Register your business as a vendor partner"
          }
        />

        {/* Step Indicator */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center gap-4">
            {[1, 2, 3, 4].map((s) => (
              <div key={s} className="flex items-center">
                <div
                  className={`grid h-9 w-9 place-items-center rounded-full font-mono text-sm ${
                    step >= s
                      ? "bg-ink text-canvas"
                      : "bg-line/10 text-muted"
                  }`}
                >
                  {s}
                </div>
                {s < 4 && (
                  <div className="w-12 h-0.5 bg-line/10 ml-4"></div>
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
                <label className="block text-sm font-medium text-ink/80 mb-1">
                  Full Name *
                </label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
                  <input
                    type="text"
                    name="name"
                    value={commonInfo.name}
                    onChange={handleCommonChange}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-line/10 bg-surface focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
                  <EnvelopeIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
                  <input
                    type="email"
                    name="email"
                    value={commonInfo.email}
                    onChange={handleCommonChange}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-line/10 bg-surface focus:ring-2 focus:ring-green-500"
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
                  <PhoneIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
                  <input
                    type="tel"
                    name="phone"
                    value={commonInfo.phone}
                    onChange={handleCommonChange}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-line/10 bg-surface focus:ring-2 focus:ring-green-500"
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
                  <LockClosedIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={commonInfo.password}
                    onChange={handleCommonChange}
                    className="w-full pl-10 pr-12 py-3 rounded-xl border border-line/10 bg-surface focus:ring-2 focus:ring-green-500"
                    placeholder="••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="w-5 h-5 text-muted" />
                    ) : (
                      <EyeIcon className="w-5 h-5 text-muted" />
                    )}
                  </button>
                </div>
                <p className="text-xs text-muted mt-1">
                  Minimum 6 characters
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Confirm Password *
                </label>
                <div className="relative">
                  <LockClosedIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={commonInfo.confirmPassword}
                    onChange={handleCommonChange}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-line/10 bg-surface focus:ring-2 focus:ring-green-500"
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
                  <IdentificationIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
                  <input
                    type="text"
                    name="aadharNumber"
                    value={individualDetails.aadharNumber}
                    onChange={handleIndividualChange}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-line/10 bg-surface focus:ring-2 focus:ring-green-500"
                    placeholder="123456789012"
                    required
                  />
                </div>
                <p className="text-xs text-muted mt-1">
                  12-digit Aadhar number
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  PAN Number *
                </label>
                <div className="relative">
                  <DocumentTextIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
                  <input
                    type="text"
                    name="panNumber"
                    value={individualDetails.panNumber}
                    onChange={handleIndividualChange}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-line/10 bg-surface focus:ring-2 focus:ring-green-500 uppercase"
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
                  <MapPinIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
                  <textarea
                    name="address"
                    value={individualDetails.address}
                    onChange={handleIndividualChange}
                    rows="3"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-line/10 bg-surface focus:ring-2 focus:ring-green-500"
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
                  <BuildingStorefrontIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
                  <input
                    type="text"
                    name="businessName"
                    value={businessDetails.businessName}
                    onChange={handleBusinessChange}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-line/10 bg-surface focus:ring-2 focus:ring-green-500"
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
                  <DocumentTextIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
                  <input
                    type="text"
                    name="gstNumber"
                    value={businessDetails.gstNumber}
                    onChange={handleBusinessChange}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-line/10 bg-surface focus:ring-2 focus:ring-green-500 uppercase"
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
                  <DocumentTextIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
                  <input
                    type="text"
                    name="panNumber"
                    value={businessDetails.panNumber}
                    onChange={handleBusinessChange}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-line/10 bg-surface focus:ring-2 focus:ring-green-500 uppercase"
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
                  <MapPinIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
                  <textarea
                    name="businessAddress"
                    value={businessDetails.businessAddress}
                    onChange={handleBusinessChange}
                    rows="3"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-line/10 bg-surface focus:ring-2 focus:ring-green-500"
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
                  <GlobeAltIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
                  <input
                    type="url"
                    name="website"
                    value={businessDetails.website}
                    onChange={handleBusinessChange}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-line/10 bg-surface focus:ring-2 focus:ring-green-500"
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
                  <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
                  <input
                    type="text"
                    name="accountHolderName"
                    value={bankDetails.accountHolderName}
                    onChange={handleBankChange}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-line/10 bg-surface focus:ring-2 focus:ring-green-500"
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
                  <CreditCardIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
                  <input
                    type="text"
                    name="accountNumber"
                    value={bankDetails.accountNumber}
                    onChange={handleBankChange}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-line/10 bg-surface focus:ring-2 focus:ring-green-500"
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
                  <BanknotesIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
                  <input
                    type="text"
                    name="ifscCode"
                    value={bankDetails.ifscCode}
                    onChange={handleBankChange}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-line/10 bg-surface focus:ring-2 focus:ring-green-500 uppercase"
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
                  className="w-full px-4 py-3 rounded-xl border border-line/10 bg-surface focus:ring-2 focus:ring-green-500"
                  placeholder="State Bank of India"
                  required
                />
              </div>
            </div>
          )}

          {/* Step 4: Summary */}
          {step === 4 && (
            <div className="space-y-4">
              <div className="bg-raised/50 rounded-xl p-5">
                <h3 className="font-semibold text-lg mb-4">
                  Registration Summary
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between py-2 border-b border-line/10">
                    <span className="text-muted">Vendor Type:</span>
                    <span className="font-semibold">
                      {vendorType === "individual" ? "Individual" : "Business"}
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-line/10">
                    <span className="text-muted">Name:</span>
                    <span>{commonInfo.name}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-line/10">
                    <span className="text-muted">Email:</span>
                    <span>{commonInfo.email}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-line/10">
                    <span className="text-muted">Phone:</span>
                    <span>{commonInfo.phone}</span>
                  </div>
                  {vendorType === "individual" ? (
                    <>
                      <div className="flex justify-between py-2 border-b border-line/10">
                        <span className="text-muted">Aadhar:</span>
                        <span>{individualDetails.aadharNumber}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-line/10">
                        <span className="text-muted">PAN:</span>
                        <span>{individualDetails.panNumber}</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex justify-between py-2 border-b border-line/10">
                        <span className="text-muted">Business Name:</span>
                        <span>{businessDetails.businessName}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-line/10">
                        <span className="text-muted">GST:</span>
                        <span>{businessDetails.gstNumber}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-line/10">
                        <span className="text-muted">Business PAN:</span>
                        <span>{businessDetails.panNumber}</span>
                      </div>
                    </>
                  )}
                  <div className="flex justify-between py-2 border-b border-line/10">
                    <span className="text-muted">Commission Rate:</span>
                    <span className="font-semibold text-accent">
                      {vendorType === "individual" ? "15%" : "10%"}
                    </span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-muted">Vehicle Limit:</span>
                    <span className="font-semibold text-accent">
                      {vendorType === "individual"
                        ? "Up to 5 vehicles"
                        : "Unlimited"}
                    </span>
                  </div>
                </div>
              </div>
              <div className="bg-accent/10 rounded-xl p-4">
                <p className="text-sm text-accent flex items-center gap-2">
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
                className="flex items-center gap-2 px-6 py-3 border border-line/15 rounded-xl hover:bg-raised transition"
              >
                <ArrowLeftIcon className="w-4 h-4" /> Previous
              </button>
            )}
            {step < 4 ? (
              <button
                type="button"
                onClick={nextStep}
                className="flex items-center gap-2 px-6 py-3 bg-ink text-canvas hover:bg-accent hover:text-accent-ink rounded-xl transition ml-auto"
              >
                Next <ArrowRightIcon className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading}
                className="flex items-center justify-center gap-2 w-full py-3 bg-raised hover:from-green-600 hover:to-emerald-700 text-white font-semibold rounded-xl transition disabled:opacity-50"
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

        <p className="text-center text-muted mt-6">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-accent font-semibold hover:underline"
          >
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
