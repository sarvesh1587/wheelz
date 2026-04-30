import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

const API = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

export default function KYCStatusBanner() {
  const [kycStatus, setKycStatus] = useState(null);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const token = localStorage.getItem("token");
        const { data } = await axios.get(`${API}/kyc/status`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setKycStatus(data.kycStatus);
      } catch (err) {
        console.error(err);
      }
    };
    fetchStatus();
  }, []);

  if (!kycStatus || kycStatus === "verified") return null;

  const banners = {
    not_submitted: {
      bg: "bg-orange-50 border-orange-300 dark:bg-orange-900/20 dark:border-orange-700",
      text: "text-orange-800 dark:text-orange-300",
      message: "⚠️ KYC verification required to book vehicles.",
      cta: "Complete KYC →",
    },
    pending: {
      bg: "bg-yellow-50 border-yellow-300 dark:bg-yellow-900/20 dark:border-yellow-700",
      text: "text-yellow-800 dark:text-yellow-300",
      message:
        "⏳ Your KYC is under review. Bookings will be enabled once verified.",
      cta: "View Status →",
    },
    rejected: {
      bg: "bg-red-50 border-red-300 dark:bg-red-900/20 dark:border-red-700",
      text: "text-red-800 dark:text-red-300",
      message:
        "❌ Your KYC was rejected. Please re-upload your documents to book.",
      cta: "Re-submit KYC →",
    },
  };

  const banner = banners[kycStatus];
  if (!banner) return null;

  return (
    <div
      className={`border rounded-xl px-4 py-3 mb-4 flex items-center justify-between ${banner.bg}`}
    >
      <p className={`text-sm font-medium ${banner.text}`}>{banner.message}</p>
      <Link
        to="/kyc"
        className={`text-sm font-semibold underline ml-4 whitespace-nowrap ${banner.text}`}
      >
        {banner.cta}
      </Link>
    </div>
  );
}
