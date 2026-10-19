import React, { useState, useEffect } from "react";
import { adminAPI } from "../services/api";
import LoadingSpinner from "../components/common/LoadingSpinner";
import {
  Users as UsersIcon,
  CheckCircle2 as CheckCircleIcon,
  XCircle as XCircleIcon,
  Search as MagnifyingGlassIcon,
  Eye as EyeIcon,
  ShieldCheck as ShieldCheckIcon,
  User as UserIcon,
  Store as BuildingStorefrontIcon,
} from "lucide-react";
import { PageHeader } from "../components/ui";
import toast from "react-hot-toast";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getAllUsers();
      setUsers(res.data.users || []);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (userId, currentStatus) => {
    try {
      await adminAPI.toggleUserActive(userId);
      toast.success(
        `User ${currentStatus ? "blocked" : "activated"} successfully`,
      );
      fetchUsers();
    } catch (error) {
      console.error("Error toggling user status:", error);
      toast.error("Failed to update user status");
    }
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case "admin":
        return (
          <span className="px-2 py-1 rounded-full border font-mono text-[10px] uppercase tracking-[0.12em] border-red-500/30 text-red-500">
            <ShieldCheckIcon className="w-3 h-3 inline mr-1" />
            Admin
          </span>
        );
      case "vendor":
        return (
          <span className="px-2 py-1 rounded-full border font-mono text-[10px] uppercase tracking-[0.12em] border-line/15 text-ink/80">
            <BuildingStorefrontIcon className="w-3 h-3 inline mr-1" />
            Vendor
          </span>
        );
      default:
        return (
          <span className="px-2 py-1 rounded-full border font-mono text-[10px] uppercase tracking-[0.12em] border-line/15 text-ink/80">
            <UserIcon className="w-3 h-3 inline mr-1" />
            Customer
          </span>
        );
    }
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === "all" || user.role === filterRole;
    return matchesSearch && matchesRole;
  });

  if (loading) return <LoadingSpinner />;

  return (
    <div className="container-x pb-24 pt-28 md:pt-32">
      <PageHeader index="01" eyebrow="Admin" title={["Users."]} lede="View and manage all registered users." />

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-line/10 bg-surface"
            />
          </div>
        </div>

        <select
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
          className="px-4 py-2 rounded-xl border border-line/10 bg-surface"
        >
          <option value="all">All Roles</option>
          <option value="admin">Admin</option>
          <option value="vendor">Vendor</option>
          <option value="customer">Customer</option>
        </select>
      </div>

      {/* Users Table */}
      <div className="bg-surface rounded-[24px] overflow-hidden border border-line/10">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-raised/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase">
                  Joined
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line/10">
              {filteredUsers.map((user) => (
                <tr
                  key={user._id}
                  className="hover:bg-raised transition"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-accent/10 rounded-full flex items-center justify-center">
                        <span className="text-accent font-semibold">
                          {user.name?.[0]?.toUpperCase() || "U"}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-ink">
                          {user.name}
                        </p>
                        <p className="text-sm text-muted">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">{getRoleBadge(user.role)}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        user.isActive
                          ? "bg-raised text-accent"
                          : "bg-accent/10 text-red-500"
                      }`}
                    >
                      {user.isActive ? "Active" : "Blocked"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-muted">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() =>
                          handleToggleStatus(user._id, user.isActive)
                        }
                        className={`p-1.5 rounded-xl transition ${
                          user.isActive
                            ? "text-red-500 hover:bg-red-50"
                            : "text-accent hover:bg-accent hover:text-accent-ink"
                        }`}
                        title={user.isActive ? "Block User" : "Activate User"}
                      >
                        {user.isActive ? (
                          <XCircleIcon className="w-5 h-5" />
                        ) : (
                          <CheckCircleIcon className="w-5 h-5" />
                        )}
                      </button>
                      <button
                        className="p-1.5 rounded-xl text-accent hover:bg-accent hover:text-accent-ink"
                        title="View Details"
                      >
                        <EyeIcon className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <UsersIcon className="w-12 h-12 text-muted mx-auto mb-3" />
            <p className="text-muted">No users found</p>
          </div>
        )}
      </div>
    </div>
  );
}
