import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { adminAPI, vehicleAPI, kycAPI } from "../services/api";
import toast from "react-hot-toast";
import {
  Users as UsersIcon,
  Truck as TruckIcon,
  Calendar as CalendarIcon,
  IndianRupee as CurrencyRupeeIcon,
  BarChart3 as ChartBarIcon,
  Store as BuildingStorefrontIcon,
  CheckCircle2 as CheckCircleIcon,
  XCircle as XCircleIcon,
  Eye as EyeIcon,
  X as XMarkIcon,
  IdCard as IdentificationIcon,
} from "lucide-react";
import { Reveal } from "../components/motion";
import { PageHeader, Stat, PageLoader, useThemeColors } from "../components/ui";
import VendorModal from "../components/admin/VendorModal";

const TOOLTIP = {
  background: "rgb(var(--surface))",
  border: "1px solid rgb(var(--line) / 0.1)",
  borderRadius: 16,
  color: "rgb(var(--ink))",
};
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { motion } from "framer-motion";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [users, setUsers] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [kycSubmissions, setKycSubmissions] = useState([]); // Add this
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [showVendorModal, setShowVendorModal] = useState(false);
  const colors = useThemeColors();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [dashboardRes, allUsersRes, vehiclesRes, kycRes] =
        await Promise.all([
          adminAPI.getDashboard(),
          adminAPI.getAllUsers(),
          vehicleAPI.getAll({ limit: 500 }),
          kycAPI.getAll({ status: "pending" }), // Get pending KYC
        ]);
      // Monthly revenue needs the reports endpoint; absent on older API deploys.
      const reportsRes = await adminAPI.getReports({ days: 180 }).catch(() => null);

      const allUsers = allUsersRes.data?.users || [];
      const customers = allUsers.filter((user) => user.role === "customer");
      const vendorsList = allUsers.filter((user) => user.role === "vendor");

      setDashboardData(dashboardRes.data);
      setUsers(customers);
      setVendors(vendorsList);
      setKycSubmissions(kycRes.data.kycs || []); // Set KYC submissions
      const fleet = vehiclesRes.data.vehicles || [];
      const stats = dashboardRes.data?.stats || {};
      const statuses = reportsRes?.data?.bookingStatus || [];
      setDashboardData((prev) => ({
        ...prev,
        totalVehicles: stats.vehicles?.total ?? fleet.length,
        totalBookings: stats.bookings?.total ?? 0,
        totalRevenue: stats.revenue?.total ?? 0,
        activeBookings: reportsRes ? statuses.filter((r) => r.status === "confirmed").reduce((n, r) => n + r.count, 0) : null,
        fleetSplit: [
          { name: "Cars", value: fleet.filter((v) => v.category === "car").length },
          { name: "Bikes", value: fleet.filter((v) => v.category === "bike").length },
        ],
        revenueByMonth: reportsRes?.data?.revenueByMonth || null,
      }));
    } catch (error) {
      console.error("Error fetching admin data:", error);
      toast.error("Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  // KYC Action Handlers
  const handleVerifyKYC = async (userId) => {
    try {
      await kycAPI.verify(userId);
      toast.success("KYC verified successfully");
      fetchDashboardData();
    } catch (error) {
      toast.error("Verification failed");
    }
  };

  const handleRejectKYC = async (userId) => {
    const reason = prompt("Enter rejection reason:");
    if (reason) {
      try {
        await kycAPI.reject(userId, reason);
        toast.success("KYC rejected");
        fetchDashboardData();
      } catch (error) {
        toast.error("Rejection failed");
      }
    }
  };

  const toggleVendorStatus = async (vendorId, currentStatus) => {
    try {
      await adminAPI.toggleVendorStatus(vendorId, !currentStatus);
      toast.success(
        `Vendor ${currentStatus ? "deactivated" : "activated"} successfully`,
      );
      fetchDashboardData();
    } catch (error) {
      toast.error("Failed to update vendor status");
    }
  };

  const viewVendorDetails = (vendor) => {
    setSelectedVendor(vendor);
    setShowVendorModal(true);
  };

  const statsCards = [
    {
      label: "Total Users",
      value: users.length,
      icon: UsersIcon,
      color: "",
    },
    {
      label: "Total Vendors",
      value: vendors.length,
      icon: BuildingStorefrontIcon,
      color: "",
    },
    {
      label: "Total Vehicles",
      value: dashboardData?.totalVehicles || 0,
      icon: TruckIcon,
      color: "",
    },
    {
      label: "Total Bookings",
      value: dashboardData?.totalBookings || 0,
      icon: CalendarIcon,
      color: "",
    },
    {
      label: "Pending KYC",
      value: kycSubmissions.length,
      icon: IdentificationIcon,
      color: "",
    }, // Added
    {
      label: "Revenue (paid)",
      value: `₹${(dashboardData?.totalRevenue || 0).toLocaleString("en-IN")}`,
      icon: CheckCircleIcon,
      color: "",
    },
  ];

  const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const revenueData = (() => {
    const rows = dashboardData?.revenueByMonth;
    if (!rows) return null;
    const now = new Date();
    return Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
      const hit = rows.find((r) => r.year === d.getFullYear() && r.month === d.getMonth() + 1);
      return { month: MONTHS[d.getMonth()], revenue: hit?.revenue || 0 };
    });
  })();

  const categoryData = (dashboardData?.fleetSplit || []).map((d, i) => ({
    ...d,
    color: i === 0 ? colors.accent : colors.muted,
  }));

  if (loading) {
    return <PageLoader label="Loading admin dashboard" />;
  }

  return (
    <div className="pb-24 pt-28 md:pt-32">
      <div className="container-x">
        <PageHeader
          index="01"
          eyebrow="Admin"
          title={["Control room."]}
          lede="Manage users, vehicles, KYC, and monitor platform performance."
        />

        {/* Stats Grid */}
        <div className="mb-14 grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-3 xl:grid-cols-6">
          {statsCards.map((stat, idx) => (
            <Reveal key={stat.label} delay={idx * 0.05}>
              <Stat label={stat.label} value={stat.value} />
            </Reveal>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Revenue Chart */}
          <motion.div
            animate={{ opacity: 1, x: 0 }}
            className="bg-surface rounded-[24px] p-6 border border-line/10"
          >
            <h3 className="eyebrow mb-6 flex items-center gap-2">
              <ChartBarIcon className="w-5 h-5 text-accent" />
              Revenue Overview
            </h3>
            {revenueData ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={revenueData}>
                  <CartesianGrid stroke={colors.lineA(0.08)} vertical={false} />
                  <XAxis dataKey="month" stroke={colors.muted} tickLine={false} axisLine={false} fontSize={12} />
                  <YAxis stroke={colors.muted} tickLine={false} axisLine={false} fontSize={12} />
                  <Tooltip contentStyle={TOOLTIP} formatter={(v) => [`₹${v.toLocaleString("en-IN")}`, "Revenue"]} />
                  <Line type="monotone" dataKey="revenue" stroke={colors.accent} strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p className="grid h-[300px] place-items-center text-center text-sm text-muted">
                Monthly revenue appears once the latest API is deployed.
              </p>
            )}
          </motion.div>

          {/* Vehicle Distribution Chart */}
          <motion.div
            animate={{ opacity: 1, x: 0 }}
            className="bg-surface rounded-[24px] p-6 border border-line/10"
          >
            <h3 className="eyebrow mb-6 flex items-center gap-2">
              <ChartBarIcon className="w-5 h-5 text-accent" />
              Vehicle Distribution
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name}: ${(percent * 100).toFixed(0)}%`
                  }
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  stroke="none"
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={TOOLTIP} />
              </PieChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        {/* Tabs */}
        <nav className="mb-10 flex gap-8 overflow-x-auto border-b border-line/10 [scrollbar-width:none]" aria-label="Admin sections">
          {[
            { id: "overview", label: "Overview" },
            { id: "kyc", label: "KYC verification" },
            { id: "users", label: "Users" },
            { id: "vendors", label: "Vendors" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              aria-current={activeTab === tab.id ? "page" : undefined}
              className={`relative whitespace-nowrap py-4 text-sm font-medium transition-colors ${
                activeTab === tab.id ? "text-ink" : "text-muted hover:text-ink"
              }`}
            >
              {tab.label}
              {activeTab === tab.id && <motion.span layoutId="admin-tab" className="absolute inset-x-0 bottom-0 h-px bg-accent" />}
            </button>
          ))}
        </nav>

        {/* KYC Verification Tab */}
        {/* {activeTab === "kyc" && (
          <motion.div
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            <div className="bg-surface rounded-[24px] overflow-hidden border border-line/10">
              <div className="p-4 bg-accent/10 border-b">
                <h2 className="font-semibold text-ink">
                  Pending KYC Submissions
                </h2>
                <p className="text-sm text-muted">
                  Review and verify user documents
                </p>
              </div>

              {kycSubmissions.length === 0 ? (
                <div className="text-center py-12">
                  <IdentificationIcon className="w-16 h-16 text-muted mx-auto mb-4" />
                  <h3 className="display-tight text-lg text-ink">
                    No Pending KYC
                  </h3>
                  <p className="text-muted">
                    All KYC submissions have been processed.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-line/10">
                  {kycSubmissions.map((kyc) => (
                    <div
                      key={kyc._id}
                      className="p-5 hover:bg-raised transition-colors"
                    >
                      <div className="flex flex-wrap justify-between items-start gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 bg-accent/10 rounded-full flex items-center justify-center font-bold text-accent">
                              {kyc.user?.name?.[0]?.toUpperCase()}
                            </div>
                            <div>
                              <p className="font-semibold text-ink">
                                {kyc.user?.name}
                              </p>
                              <p className="text-sm text-muted">
                                {kyc.user?.email}
                              </p>
                            </div>
                            <span className="ml-auto text-xs text-muted">
                              Submitted:{" "}
                              {new Date(kyc.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3 text-sm">
                            <div>
                              <span className="text-muted">
                                License Number:
                              </span>
                              <span className="ml-2 font-medium">
                                {kyc.licenseNumber}
                              </span>
                            </div>
                            <div>
                              <span className="text-muted">
                                Aadhaar Number:
                              </span>
                              <span className="ml-2 font-medium">
                                {kyc.aadhaarNumber}
                              </span>
                            </div>
                          </div>
                          <div className="flex gap-4 mt-3 text-xs text-muted">
                            <span>
                              DL Front:{" "}
                              {kyc.drivingLicenseFront?.split("/").pop()}
                            </span>
                            <span>
                              DL Back:{" "}
                              {kyc.drivingLicenseBack?.split("/").pop()}
                            </span>
                            <span>
                              Aadhaar Front:{" "}
                              {kyc.aadhaarFront?.split("/").pop()}
                            </span>
                            <span>
                              Aadhaar Back:{" "}
                              {kyc.aadhaarBack?.split("/").pop()}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleVerifyKYC(kyc.user._id)}
                            className="px-4 py-2 bg-ink text-canvas hover:bg-accent hover:text-accent-ink rounded-xl transition-colors flex items-center gap-1"
                          >
                            <CheckCircleIcon className="w-4 h-4" />
                            Verify
                          </button>
                          <button
                            onClick={() => handleRejectKYC(kyc.user._id)}
                            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl transition-colors flex items-center gap-1"
                          >
                            <XCircleIcon className="w-4 h-4" />
                            Reject
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )} */}
        {/* KYC Verification Tab with Image Previews */}
        {activeTab === "kyc" && (
          <motion.div
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            <div className="bg-surface rounded-[24px] overflow-hidden border border-line/10">
              <div className="p-4 bg-accent/10 border-b">
                <h2 className="font-semibold text-ink">
                  Pending KYC Submissions
                </h2>
                <p className="text-sm text-muted">
                  Review and verify user documents
                </p>
              </div>

              {kycSubmissions.length === 0 ? (
                <div className="text-center py-12">
                  <IdentificationIcon className="w-16 h-16 text-muted mx-auto mb-4" />
                  <h3 className="display-tight text-lg text-ink">
                    No Pending KYC
                  </h3>
                  <p className="text-muted">
                    All KYC submissions have been processed.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-line/10">
                  {kycSubmissions.map((kyc) => (
                    <div
                      key={kyc._id}
                      className="p-5 hover:bg-raised transition-colors"
                    >
                      <div className="flex flex-wrap justify-between items-start gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 bg-accent/10 rounded-full flex items-center justify-center font-bold text-accent">
                              {kyc.user?.name?.[0]?.toUpperCase()}
                            </div>
                            <div>
                              <p className="font-semibold text-ink">
                                {kyc.user?.name}
                              </p>
                              <p className="text-sm text-muted">
                                {kyc.user?.email}
                              </p>
                            </div>
                            <span className="ml-auto text-xs text-muted">
                              Submitted:{" "}
                              {new Date(kyc.createdAt).toLocaleDateString()}
                            </span>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3 text-sm">
                            <div>
                              <span className="text-muted">
                                License Number:
                              </span>
                              <span className="ml-2 font-medium">
                                {kyc.licenseNumber}
                              </span>
                            </div>
                            <div>
                              <span className="text-muted">
                                Aadhaar Number:
                              </span>
                              <span className="ml-2 font-medium">
                                {kyc.aadhaarNumber}
                              </span>
                            </div>
                          </div>

                          {/* Image Previews */}
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
                            {/* Driving License Front */}
                            <div className="relative group">
                              <div className="text-xs text-muted mb-1">
                                Driving License (Front)
                              </div>
                              {kyc.drivingLicenseFrontUrl ? (
                                <img
                                  src={kyc.drivingLicenseFrontUrl}
                                  alt="DL Front"
                                  className="w-full h-24 object-cover rounded-xl border cursor-pointer hover:opacity-90 transition-opacity"
                                  onClick={() =>
                                    window.open(
                                      kyc.drivingLicenseFrontUrl,
                                      "_blank",
                                    )
                                  }
                                />
                              ) : (
                                <div className="w-full h-24 bg-raised rounded-xl flex items-center justify-center text-muted">
                                  No Image
                                </div>
                              )}
                            </div>

                            {/* Driving License Back */}
                            <div>
                              <div className="text-xs text-muted mb-1">
                                Driving License (Back)
                              </div>
                              {kyc.drivingLicenseBackUrl ? (
                                <img
                                  src={kyc.drivingLicenseBackUrl}
                                  alt="DL Back"
                                  className="w-full h-24 object-cover rounded-xl border cursor-pointer hover:opacity-90 transition-opacity"
                                  onClick={() =>
                                    window.open(
                                      kyc.drivingLicenseBackUrl,
                                      "_blank",
                                    )
                                  }
                                />
                              ) : (
                                <div className="w-full h-24 bg-raised rounded-xl flex items-center justify-center text-muted">
                                  No Image
                                </div>
                              )}
                            </div>

                            {/* Aadhaar Front */}
                            <div>
                              <div className="text-xs text-muted mb-1">
                                Aadhaar (Front)
                              </div>
                              {kyc.aadhaarFrontUrl ? (
                                <img
                                  src={kyc.aadhaarFrontUrl}
                                  alt="Aadhaar Front"
                                  className="w-full h-24 object-cover rounded-xl border cursor-pointer hover:opacity-90 transition-opacity"
                                  onClick={() =>
                                    window.open(kyc.aadhaarFrontUrl, "_blank")
                                  }
                                />
                              ) : (
                                <div className="w-full h-24 bg-raised rounded-xl flex items-center justify-center text-muted">
                                  No Image
                                </div>
                              )}
                            </div>

                            {/* Aadhaar Back */}
                            <div>
                              <div className="text-xs text-muted mb-1">
                                Aadhaar (Back)
                              </div>
                              {kyc.aadhaarBackUrl ? (
                                <img
                                  src={kyc.aadhaarBackUrl}
                                  alt="Aadhaar Back"
                                  className="w-full h-24 object-cover rounded-xl border cursor-pointer hover:opacity-90 transition-opacity"
                                  onClick={() =>
                                    window.open(kyc.aadhaarBackUrl, "_blank")
                                  }
                                />
                              ) : (
                                <div className="w-full h-24 bg-raised rounded-xl flex items-center justify-center text-muted">
                                  No Image
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={() => handleVerifyKYC(kyc.user._id)}
                            className="px-4 py-2 bg-ink text-canvas hover:bg-accent hover:text-accent-ink rounded-xl transition-colors flex items-center gap-1"
                          >
                            <CheckCircleIcon className="w-4 h-4" />
                            Verify
                          </button>
                          <button
                            onClick={() => handleRejectKYC(kyc.user._id)}
                            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl transition-colors flex items-center gap-1"
                          >
                            <XCircleIcon className="w-4 h-4" />
                            Reject
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
        {/* Users List Tab */}
        {activeTab === "users" && (
          // ... your existing users table code ...
          <div className="bg-surface rounded-[24px] overflow-hidden border border-line/10">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-raised/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase">
                      Phone
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase">
                      Joined
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line/10">
                  {users.map((user) => (
                    <tr
                      key={user._id}
                      className="hover:bg-raised"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center text-accent-ink text-sm font-bold">
                            {user.name?.[0]?.toUpperCase()}
                          </div>
                          <span className="font-medium">{user.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm">{user.email}</td>
                      <td className="px-6 py-4 text-sm">{user.phone || "-"}</td>
                      <td className="px-6 py-4 text-sm">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full ${user.isActive ? "bg-raised text-accent" : "bg-accent/10 text-red-500"}`}
                        >
                          {user.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() =>
                            toggleVendorStatus(user._id, user.isActive)
                          }
                          className={`text-sm ${user.isActive ? "text-red-500" : "text-accent"}`}
                        >
                          {user.isActive ? "Deactivate" : "Activate"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Vendors List Tab */}
        {activeTab === "vendors" && (
          // ... your existing vendors table code ...
          <div className="bg-surface rounded-[24px] overflow-hidden border border-line/10">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-raised/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase">
                      Vendor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase">
                      Business Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase">
                      Phone
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line/10">
                  {vendors.map((vendor) => (
                    <tr
                      key={vendor._id}
                      className="hover:bg-raised"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-ink text-canvas rounded-full flex items-center justify-center text-sm font-bold">
                            {vendor.name?.[0]?.toUpperCase()}
                          </div>
                          <span className="font-medium">{vendor.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {vendor.businessName || "-"}
                      </td>
                      <td className="px-6 py-4 text-sm">{vendor.email}</td>
                      <td className="px-6 py-4 text-sm">
                        {vendor.phone || "-"}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full ${vendor.isVendorApproved ? "bg-raised text-accent" : "bg-accent/10 text-accent"}`}
                        >
                          {vendor.isVendorApproved ? "Approved" : "Pending"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => viewVendorDetails(vendor)}
                            className="text-accent hover:text-accent text-sm"
                          >
                            View
                          </button>
                          <button
                            onClick={() =>
                              toggleVendorStatus(
                                vendor._id,
                                vendor.isVendorApproved,
                              )
                            }
                            className={`text-sm ${vendor.isVendorApproved ? "text-red-500" : "text-accent"}`}
                          >
                            {vendor.isVendorApproved ? "Deactivate" : "Approve"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Vendor Details Modal */}
      <VendorModal
        vendor={selectedVendor}
        open={showVendorModal && !!selectedVendor}
        onClose={() => setShowVendorModal(false)}
        onChanged={fetchDashboardData}
      />
    </div>
  );
}
