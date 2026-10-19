import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { ArrowUpRight } from "lucide-react";

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
      tone: "bg-accent",
      message: "KYC verification required to book vehicles.",
      cta: "Complete KYC",
    },
    pending: {
      tone: "bg-accent animate-pulse",
      message:
        "Your KYC is under review. Bookings will be enabled once verified.",
      cta: "View status",
    },
    rejected: {
      tone: "bg-red-500",
      message:
        "Your KYC was rejected. Please re-upload your documents to book.",
      cta: "Re-submit KYC",
    },
  };

  const banner = banners[kycStatus];
  if (!banner) return null;

  return (
    <div className="mb-6 flex items-center justify-between gap-4 rounded-full border border-line/10 bg-surface py-2 pl-5 pr-2">
      <p className="flex items-center gap-3 text-sm text-ink">
        <span className={`h-2 w-2 shrink-0 rounded-full ${banner.tone}`} />
        {banner.message}
      </p>
      <Link to="/kyc" className="btn-ghost shrink-0 !px-4 !py-2 !text-xs">
        {banner.cta} <ArrowUpRight size={14} />
      </Link>
    </div>
  );
}
