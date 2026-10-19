import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { vehicleAPI, adminAPI } from "../services/api";
import LoadingSpinner from "../components/common/LoadingSpinner";
import AdminVehicleCard from "../components/vehicle/AdminVehicleCard";
import {
  Users as UsersIcon,
  Truck as TruckIcon,
  Calendar as CalendarIcon,
  IndianRupee as CurrencyRupeeIcon,
  Store as BuildingStorefrontIcon,
  Plus as PlusIcon,
  BarChart3 as ChartBarIcon,
  TrendingUp as ArrowTrendingUpIcon,
  Clock as ClockIcon,
  BadgeCheck as CheckBadgeIcon,
} from "lucide-react";
import { PageHeader, Stat } from "../components/ui";

export default function AdminHomepage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [featuredVehicles, setFeaturedVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalVehicles: 0,
    totalBookings: 0,
    totalRevenue: 0,
    pendingVendors: 0,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch featured vehicles
      const vehiclesRes = await vehicleAPI.getAll({
        sort: "popular",
        limit: 6,
      });
      setFeaturedVehicles(vehiclesRes.data.vehicles);

      // Fetch stats
      const dashboardRes = await adminAPI.getDashboard();
      const usersRes = await adminAPI.getAllUsers();

      const vendors = (usersRes.data.users || []).filter(
        (u) => u.role === "vendor" && !u.isVendorApproved,
      );

      setStats({
        totalUsers: dashboardRes.data.stats?.users?.total || 0,
        totalVehicles: dashboardRes.data.stats?.vehicles?.total || 0,
        totalBookings: dashboardRes.data.stats?.bookings?.total || 0,
        totalRevenue: dashboardRes.data.stats?.revenue?.total || 0,
        pendingVendors: vendors.length,
      });
    } catch (error) {
      console.error("Error fetching admin data:", error);
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    {
      to: "/admin/vehicles/add",
      label: "Add Vehicle",
      icon: PlusIcon,
      color: "bg-accent",
      description: "Add new car or bike to inventory",
    },
    {
      to: "/admin/vehicles",
      label: "Manage Vehicles",
      icon: TruckIcon,
      color: "bg-ink text-canvas",
      description: "Edit, delete or update vehicle status",
    },
    {
      to: "/admin/users",
      label: "Manage Users",
      icon: UsersIcon,
      color: "bg-ink text-canvas",
      description: "View and manage all users",
    },
    {
      to: "/admin/vendors",
      label: "Vendors",
      icon: BuildingStorefrontIcon,
      color: "bg-ink text-canvas",
      description: `${stats.pendingVendors} pending approvals`,
    },
  ];

  const statsCards = [
    {
      label: "Total Users",
      value: stats.totalUsers,
      icon: UsersIcon,
      color: "",
    },
    {
      label: "Total Vehicles",
      value: stats.totalVehicles,
      icon: TruckIcon,
      color: "",
    },
    {
      label: "Total Bookings",
      value: stats.totalBookings,
      icon: CalendarIcon,
      color: "",
    },
    {
      label: "Total Revenue",
      value: `₹${(stats.totalRevenue / 1000).toFixed(0)}K`,
      icon: CurrencyRupeeIcon,
      color: "",
    },
  ];

  if (loading) return <LoadingSpinner />;

  return (
    <div className="pb-24 pt-28 md:pt-32">
      <div className="container-x">
        <PageHeader
          index="01"
          eyebrow="Admin"
          title={[`Welcome back, ${user?.name?.split(" ")[0] || "admin"}.`]}
          size="md"
          lede="Here's what's happening with your platform today."
          actions={
            <Link to="/admin/vehicles/add" className="btn-primary">
              <PlusIcon className="h-4 w-4" /> Add new vehicle
            </Link>
          }
        />

        {/* Stats Cards */}
        <div className="mb-16 grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-4">
          {statsCards.map((stat) => (
            <Stat key={stat.label} label={stat.label} value={stat.value} />
          ))}
        </div>

        {/* Quick Actions Grid */}
        <p className="eyebrow mb-4 flex items-center gap-3"><span className="text-accent">(02)</span> Quick actions</p>
        <div className="mb-16 border-t border-line/10">
          {quickActions.map((action) => (
            <Link
              key={action.to + action.label}
              to={action.to}
              className="group grid gap-2 border-b border-line/10 py-6 md:grid-cols-12 md:items-center"
            >
              <span className="flex items-center gap-5 md:col-span-6">
                <action.icon className="h-5 w-5 text-muted transition-colors group-hover:text-accent" />
                <span className="display-tight text-2xl md:text-3xl">{action.label}</span>
              </span>
              <span className="text-sm text-muted md:col-span-5">{action.description}</span>
              <ArrowTrendingUpIcon className="hidden h-5 w-5 justify-self-end text-muted transition-colors group-hover:text-accent md:block" />
            </Link>
          ))}
        </div>

        {/* Featured Vehicles Section with Admin Controls */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="display-tight text-xl text-ink flex items-center gap-2">
                Featured vehicles
              </h2>
              <p className="text-sm text-muted mt-1">
                Most popular vehicles - manage them directly from here
              </p>
            </div>
            <Link
              to="/admin/vehicles"
              className="text-accent hover:text-accent text-sm font-medium flex items-center gap-1"
            >
              View All Vehicles
              <ArrowTrendingUpIcon className="w-4 h-4" />
            </Link>
          </div>

          {featuredVehicles.length === 0 ? (
            <div className="bg-surface rounded-[24px] p-8 text-center border border-line/10">
              <TruckIcon className="w-12 h-12 text-muted mx-auto mb-3" />
              <p className="text-muted">
                No vehicles found. Add your first vehicle!
              </p>
              <Link
                to="/admin/vehicles/add"
                className="inline-block mt-3 text-accent hover:underline"
              >
                + Add Vehicle
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredVehicles.map((vehicle) => (
                <AdminVehicleCard
                  key={vehicle._id}
                  vehicle={vehicle}
                  onVehicleUpdate={fetchData}
                />
              ))}
            </div>
          )}
        </div>

        {/* Recent Activity / Tips */}
        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-surface rounded-[24px] p-5 border border-line/10">
            <h3 className="font-semibold text-ink mb-3 flex items-center gap-2">
              <ClockIcon className="w-5 h-5 text-accent" />
              Admin Tips
            </h3>
            <ul className="space-y-2 text-sm text-muted">
              <li>New vehicle listings appear on homepage within minutes</li>
              <li>Use "Mark Unavailable" for vehicles under maintenance</li>
              <li>Vendor registrations require your approval</li>
              <li>Check analytics dashboard for revenue insights</li>
            </ul>
          </div>

          <div className="bg-surface rounded-[24px] p-5 border border-line/10">
            <h3 className="font-semibold text-ink mb-3 flex items-center gap-2">
              <CheckBadgeIcon className="w-5 h-5 text-accent" />
              Quick Stats
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted">
                  Pending Vendor Approvals
                </span>
                <span className="font-mono text-ink">
                  {stats.pendingVendors}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted">
                  Total Bookings This Month
                </span>
                <span className="font-mono text-ink">
                  {stats.totalBookings}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted">Average Rating</span>
                <span className="font-mono text-ink">4.8</span>
              </div>
            </div>
            <Link
              to="/admin"
              className="mt-4 inline-block text-sm text-accent hover:underline"
            >
              View Full Analytics →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
