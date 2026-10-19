import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import { AlertTriangle, ArrowUpRight, Check, ShieldCheck, Upload } from "lucide-react";
import { PageHeader, Panel, StatusPill, Notice, Empty, Spinner, PageLoader } from "../components/ui";

const API =
  process.env.REACT_APP_API_URL || "https://wheelz-ldq2.onrender.com/api";

const FileUploadBox = ({ label, name, onChange, file }) => (
  <div className="flex flex-col gap-2">
    <span className="field-label">{label}</span>
    <label
      className={`group flex aspect-[16/10] cursor-pointer flex-col items-center justify-center rounded-[20px] border border-dashed p-4 text-center transition-colors ${
        file ? "border-accent bg-accent/5" : "border-line/25 hover:border-ink"
      }`}
    >
      <input
        type="file"
        name={name}
        accept="image/jpeg,image/jpg,image/png,application/pdf"
        className="hidden"
        onChange={onChange}
      />
      {file ? (
        <>
          <span className="mb-3 grid h-9 w-9 place-items-center rounded-full bg-accent text-accent-ink">
            <Check size={16} strokeWidth={2.5} />
          </span>
          <p className="max-w-[180px] truncate text-sm">{file.name}</p>
          <p className="mt-1 text-xs text-muted">Click to replace</p>
        </>
      ) : (
        <>
          <Upload size={20} strokeWidth={1.5} className="mb-3 text-muted transition-colors group-hover:text-ink" />
          <p className="text-sm">Click to upload</p>
          <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
            JPG, PNG or PDF · Max 5MB
          </p>
        </>
      )}
    </label>
  </div>
);

const STATUS_LABELS = {
  not_submitted: { tone: "neutral", label: "Not submitted" },
  pending: { tone: "pending", label: "Under review" },
  verified: { tone: "positive", label: "Verified" },
  rejected: { tone: "negative", label: "Rejected" },
};

const StatusBadge = ({ status }) => {
  const { tone, label } = STATUS_LABELS[status] || STATUS_LABELS.not_submitted;
  return <StatusPill tone={tone}>{label}</StatusPill>;
};

export default function KYCUpload() {
  const { user } = useAuth(); // Now this will work
  const navigate = useNavigate(); // Add navigate
  const [kycStatus, setKycStatus] = useState(null);
  const [rejectionReason, setRejectionReason] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    licenseNumber: "",
    aadhaarNumber: "",
  });

  const [files, setFiles] = useState({
    drivingLicenseFront: null,
    drivingLicenseBack: null,
    aadhaarFront: null,
    aadhaarBack: null,
  });

  useEffect(() => {
    fetchKYCStatus();
  }, []);

  const fetchKYCStatus = async () => {
    try {
      const token = localStorage.getItem("wheelz_token");
      if (!token) {
        console.log("No token found");
        setLoading(false);
        return;
      }

      const { data } = await axios.get(`${API}/kyc/status`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setKycStatus(data.kycStatus);
      setRejectionReason(data.rejectionReason);
    } catch (err) {
      console.error("Error fetching KYC status:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB");
      return;
    }
    setFiles((prev) => ({ ...prev, [e.target.name]: file }));
  };

  const handleInputChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const requiredFiles = [
      "drivingLicenseFront",
      "drivingLicenseBack",
      "aadhaarFront",
      "aadhaarBack",
    ];
    for (const field of requiredFiles) {
      if (!files[field]) {
        toast.error("Please upload all required documents");
        return;
      }
    }

    if (!form.licenseNumber.trim()) {
      toast.error("Please enter your driving license number");
      return;
    }

    if (!/^\d{12}$/.test(form.aadhaarNumber)) {
      toast.error("Aadhaar number must be exactly 12 digits");
      return;
    }

    const formData = new FormData();
    formData.append("licenseNumber", form.licenseNumber);
    formData.append("aadhaarNumber", form.aadhaarNumber);
    Object.entries(files).forEach(([key, file]) => formData.append(key, file));

    try {
      setSubmitting(true);
      const token = localStorage.getItem("wheelz_token");

      await axios.post(`${API}/kyc/submit`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      toast.success("KYC submitted! We'll verify within 24 hours.");
      setKycStatus("pending");

      setForm({ licenseNumber: "", aadhaarNumber: "" });
      setFiles({
        drivingLicenseFront: null,
        drivingLicenseBack: null,
        aadhaarFront: null,
        aadhaarBack: null,
      });

      // Redirect to home after 2 seconds
      setTimeout(() => {
        navigate("/");
      }, 2000);
    } catch (err) {
      console.error("KYC submission error:", err);
      toast.error(err.response?.data?.message || "Submission failed");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <PageLoader label="Checking KYC" />;
  }

  return (
    <div className="container-x pb-24 pt-28 md:pt-32">
      <PageHeader
        index="01"
        eyebrow="Identity"
        title={["KYC", "verification."]}
        lede="Verify your identity to unlock vehicle bookings."
        actions={
          <span className="flex items-center gap-3 text-sm text-muted">
            Status <StatusBadge status={kycStatus || "not_submitted"} />
          </span>
        }
      />

      <div className="max-w-3xl">
        {kycStatus === "verified" && (
          <Empty
            title="You're verified."
            action={
              <Link to="/vehicles" className="btn-primary">
                Book a ride <ArrowUpRight size={16} />
              </Link>
            }
          >
            Your KYC is complete. You can now book any vehicle on Wheelz.
          </Empty>
        )}

        {kycStatus === "pending" && (
          <Empty title="Under review.">
            Your documents are being reviewed. This usually takes up to 24 hours.
          </Empty>
        )}

        {kycStatus === "rejected" && (
          <Notice tone="negative" icon={AlertTriangle} title="KYC rejected" className="mb-10">
            Reason: {rejectionReason}. Please re-upload correct documents.
          </Notice>
        )}

        {(kycStatus === "not_submitted" ||
          kycStatus === "rejected" ||
          !kycStatus) && (
          <form onSubmit={handleSubmit} className="space-y-6">
            <Panel index="01" title="Driving license">
              <label className="field-label">License number</label>
              <input
                type="text"
                name="licenseNumber"
                value={form.licenseNumber}
                onChange={handleInputChange}
                placeholder="e.g. MH0120200012345"
                required
                className="field font-mono uppercase"
              />
              <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FileUploadBox
                  label="Front side"
                  name="drivingLicenseFront"
                  onChange={handleFileChange}
                  file={files.drivingLicenseFront}
                />
                <FileUploadBox
                  label="Back side"
                  name="drivingLicenseBack"
                  onChange={handleFileChange}
                  file={files.drivingLicenseBack}
                />
              </div>
            </Panel>

            <Panel index="02" title="Aadhaar card">
              <label className="field-label">Aadhaar number</label>
              <input
                type="text"
                name="aadhaarNumber"
                value={form.aadhaarNumber}
                onChange={handleInputChange}
                placeholder="12-digit Aadhaar number"
                maxLength={12}
                required
                className="field font-mono"
              />
              <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FileUploadBox
                  label="Front side"
                  name="aadhaarFront"
                  onChange={handleFileChange}
                  file={files.aadhaarFront}
                />
                <FileUploadBox
                  label="Back side"
                  name="aadhaarBack"
                  onChange={handleFileChange}
                  file={files.aadhaarBack}
                />
              </div>
            </Panel>

            <div className="flex flex-col gap-4 pt-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="flex items-center gap-2 text-xs text-muted">
                <ShieldCheck size={14} className="text-accent" />
                Your documents are securely stored and only used for identity verification.
              </p>
              <button type="submit" disabled={submitting} className="btn-primary !py-4">
                {submitting ? (
                  <>
                    <Spinner /> Submitting…
                  </>
                ) : (
                  <>
                    Submit KYC documents <ArrowUpRight size={16} />
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
