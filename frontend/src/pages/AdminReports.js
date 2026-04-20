import React, { useState, useEffect } from "react";
import { adminAPI, bookingAPI, vehicleAPI } from "../services/api";
import LoadingSpinner from "../components/common/LoadingSpinner";
import {
  DocumentArrowDownIcon,
  CurrencyRupeeIcon,
  TruckIcon,
  UsersIcon,
  CalendarIcon,
} from "@heroicons/react/24/outline";

export default function AdminReports() {
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState({
    totalRevenue: 0,
    totalBookings: 0,
    totalVehicles: 0,
    totalUsers: 0,
    monthlyData: [],
  });

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const [dashboardRes, bookingsRes, vehiclesRes] = await Promise.all([
        adminAPI.getDashboard(),
        bookingAPI.getAll({ limit: 1000 }),
        vehicleAPI.getAll({ limit: 1000 }),
      ]);

      setReports({
        totalRevenue: dashboardRes.data.stats?.revenue?.total || 0,
        totalBookings: dashboardRes.data.stats?.bookings?.total || 0,
        totalVehicles: dashboardRes.data.stats?.vehicles?.total || 0,
        totalUsers: dashboardRes.data.stats?.users?.total || 0,
        monthlyData: dashboardRes.data.charts?.monthlyRevenue || [],
      });
    } catch (error) {
      console.error("Error fetching reports:", error);
    } finally {
      setLoading(false);
    }
  };

  const downloadReport = () => {
    const reportData = {
      generatedAt: new Date().toISOString(),
      ...reports,
    };
    const blob = new Blob([JSON.stringify(reportData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `wheelz-report-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 pt-24">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Reports & Analytics
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Download platform reports and insights
          </p>
        </div>
        <button
          onClick={downloadReport}
          className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl transition"
        >
          <DocumentArrowDownIcon className="w-5 h-5" />
          Download Report
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold">
                ₹{reports.totalRevenue.toLocaleString()}
              </p>
              <p className="text-sm opacity-90">Total Revenue</p>
            </div>
            <CurrencyRupeeIcon className="w-8 h-8 opacity-80" />
          </div>
        </div>
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-2xl p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold">{reports.totalBookings}</p>
              <p className="text-sm opacity-90">Total Bookings</p>
            </div>
            <CalendarIcon className="w-8 h-8 opacity-80" />
          </div>
        </div>
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold">{reports.totalVehicles}</p>
              <p className="text-sm opacity-90">Total Vehicles</p>
            </div>
            <TruckIcon className="w-8 h-8 opacity-80" />
          </div>
        </div>
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold">{reports.totalUsers}</p>
              <p className="text-sm opacity-90">Total Users</p>
            </div>
            <UsersIcon className="w-8 h-8 opacity-80" />
          </div>
        </div>
      </div>

      {/* Monthly Data Table */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="font-semibold text-gray-900 dark:text-white">
            Monthly Revenue Breakdown
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Month
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Revenue
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Bookings
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {reports.monthlyData.length > 0 ? (
                reports.monthlyData.map((item, index) => (
                  <tr
                    key={index}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/30"
                  >
                    <td className="px-6 py-4">
                      {item.month || `Month ${item._id?.month}`}
                    </td>
                    <td className="px-6 py-4">
                      ₹{item.revenue?.toLocaleString() || 0}
                    </td>
                    <td className="px-6 py-4">{item.count || 0}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="3"
                    className="px-6 py-8 text-center text-gray-500"
                  >
                    No data available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
