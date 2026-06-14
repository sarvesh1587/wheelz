/**
 * Referral Dashboard
 * File: frontend/src/components/ReferralDashboard.js
 */

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { promoAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import {
  UserGroupIcon,
  CurrencyRupeeIcon,
  ClipboardDocumentIcon,
  ShareIcon,
  GiftIcon,
  ArrowTrendingUpIcon,
} from "@heroicons/react/24/outline";

export default function ReferralDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [referralCode, setReferralCode] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchStats();
    generateCode();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await promoAPI.getReferralStats();
      setStats(res.data.stats);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const generateCode = async () => {
    try {
      const res = await promoAPI.generateReferral();
      setReferralCode(res.data.referralCode);
    } catch (err) {
      console.error(err);
    }
  };

  const copyToClipboard = () => {
    const link = `https://wheelz-sand.vercel.app/register?ref=${referralCode}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    toast.success("Referral link copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const shareOnWhatsApp = () => {
    const link = `https://wheelz-sand.vercel.app/register?ref=${referralCode}`;
    const text = `🚗 Join Wheelz - India's smartest vehicle rental & ridesharing platform!\n\nUse my referral code *${referralCode}* and get ₹100 FREE!\n\n👉 ${link}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  };

  if (loading) {
    return (
      <div className="animate-pulse bg-white dark:bg-gray-800 rounded-2xl p-6 h-64" />
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl p-5 text-white"
        >
          <UserGroupIcon className="w-8 h-8 mb-2 opacity-80" />
          <p className="text-3xl font-bold">{stats?.totalReferrals || 0}</p>
          <p className="text-sm opacity-90">Total Referrals</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-5 text-white"
        >
          <CurrencyRupeeIcon className="w-8 h-8 mb-2 opacity-80" />
          <p className="text-3xl font-bold">₹{stats?.totalEarned || 0}</p>
          <p className="text-sm opacity-90">Total Earned</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-5 text-white"
        >
          <ArrowTrendingUpIcon className="w-8 h-8 mb-2 opacity-80" />
          <p className="text-3xl font-bold">{stats?.pendingReferrals || 0}</p>
          <p className="text-sm opacity-90">Pending</p>
        </motion.div>
      </div>

      {/* Referral Code Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700"
      >
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
          <GiftIcon className="w-5 h-5 text-amber-500" /> Your Referral Code
        </h3>
        <p className="text-sm text-gray-500 mb-4">
          Share this code with friends. Both get ₹100 on their first booking!
        </p>

        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 bg-gray-50 dark:bg-gray-700 rounded-xl px-4 py-3 border-2 border-dashed border-amber-300 dark:border-amber-600">
            <p className="text-2xl font-bold text-amber-500 tracking-wider text-center">
              {referralCode || "GENERATING..."}
            </p>
          </div>
          <button
            onClick={copyToClipboard}
            className="px-4 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl transition-colors flex items-center gap-2"
          >
            <ClipboardDocumentIcon className="w-5 h-5" />
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>

        <button
          onClick={shareOnWhatsApp}
          className="w-full py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-medium flex items-center justify-center gap-2 transition-colors"
        >
          <ShareIcon className="w-5 h-5" /> Share on WhatsApp
        </button>
      </motion.div>

      {/* How It Works */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700"
      >
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
          How It Works
        </h3>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mx-auto mb-2 text-2xl">
              🔗
            </div>
            <p className="text-sm font-medium">Share Link</p>
            <p className="text-xs text-gray-500">Send to friends</p>
          </div>
          <div>
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-2 text-2xl">
              👤
            </div>
            <p className="text-sm font-medium">Friend Joins</p>
            <p className="text-xs text-gray-500">Uses your code</p>
          </div>
          <div>
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-2 text-2xl">
              💰
            </div>
            <p className="text-sm font-medium">Both Earn ₹100</p>
            <p className="text-xs text-gray-500">After first booking</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
