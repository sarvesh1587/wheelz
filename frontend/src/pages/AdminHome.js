import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  Truck as TruckIcon,
  Users as UsersIcon,
  IndianRupee as CurrencyRupeeIcon,
  BarChart3 as ChartBarIcon,
  Plus as PlusIcon,
  ArrowRight as ArrowRightIcon,
} from "lucide-react";
import { PageHeader, Panel, Stat } from "../components/ui";
import { adminAPI } from "../services/api";

export default function AdminHome() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  useEffect(() => {
    adminAPI.getDashboard().then((r) => setStats(r.data.stats)).catch(() => {});
  }, []);
  const n = (v) => (stats ? (v || 0).toLocaleString("en-IN") : "—");

  const quickActions = [
    {
      to: "/admin/vehicles",
      label: "Manage Vehicles",
      icon: TruckIcon,
      color: "bg-ink text-canvas",
    },
    {
      to: "/admin/users",
      label: "Manage Users",
      icon: UsersIcon,
      color: "bg-ink text-canvas",
    },
    {
      to: "/admin/vehicles/add",
      label: "Add New Vehicle",
      icon: PlusIcon,
      color: "bg-ink text-canvas",
    },
    {
      to: "/admin",
      label: "View Analytics",
      icon: ChartBarIcon,
      color: "bg-accent",
    },
  ];

  return (
    <div className="container-x pb-24 pt-28 md:pt-32">
      <PageHeader
        index="01"
        eyebrow="Admin"
        title={[`Welcome back, ${user?.name?.split(" ")[0] || "admin"}.`]}
        size="md"
        lede="You have full control over the Wheelz platform. Manage vehicles, users, and track performance."
      />

      {/* Quick Stats */}
      <div className="mb-16 grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-4">
        <Stat label="Total vehicles" value={n(stats?.vehicles?.total)} />
        <Stat label="Customers" value={n(stats?.users?.total)} />
        <Stat label="Revenue (paid)" value={stats ? `₹${n(stats.revenue?.total)}` : "—"} />
        <Stat label="Bookings" value={n(stats?.bookings?.total)} />
      </div>

      {/* Quick Actions Grid */}
      <p className="eyebrow mb-4 flex items-center gap-3"><span className="text-accent">(02)</span> Quick actions</p>
      <div className="mb-16 border-t border-line/10">
        {quickActions.map((action) => (
          <Link
            key={action.to + action.label}
            to={action.to}
            className="group flex items-center justify-between gap-6 border-b border-line/10 py-6"
          >
            <span className="flex items-center gap-5">
              <action.icon className="h-5 w-5 text-muted transition-colors group-hover:text-accent" />
              <span className="display-tight text-2xl md:text-3xl">{action.label}</span>
            </span>
            <ArrowRightIcon className="h-5 w-5 text-muted transition-transform duration-500 ease-out-expo group-hover:translate-x-1 group-hover:text-accent" />
          </Link>
        ))}
      </div>

      {/* Tips */}
      <Panel index="03" title="Admin tips">
        <ul className="space-y-3 text-sm text-muted">
          <li>Use the "Manage Vehicles" section to add, edit, or remove vehicles</li>
          <li>Track platform performance using the Analytics Dashboard</li>
          <li>New vendor registrations require admin approval</li>
          <li>Monitor bookings and revenue from the dashboard charts</li>
        </ul>
      </Panel>
    </div>
  );
}
