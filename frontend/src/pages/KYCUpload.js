import { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext"; // ✅ Add this

const API =
  process.env.REACT_APP_API_URL || "https://wheelz-ldq2.onrender.com/api";

const FileUploadBox = ({ label, name, onChange, file }) => (
  <div className="flex flex-col gap-1">
    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
      {label}
    </label>
    <label className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer hover:border-amber-500 transition-colors bg-gray-50 dark:bg-gray-800">
      <input
        type="file"
        name={name}
        accept="image/jpeg,image/jpg,image/png,application/pdf"
        className="hidden"
        onChange={onChange}
      />
      {file ? (
        <div className="text-center">
          <span className="text-green-500 text-2xl">✅</span>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 truncate max-w-[180px]">
            {file.name}
          </p>
        </div>
      ) : (
        <div className="text-center">
          <span className="text-3xl">📄</span>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Click to upload
          </p>
          <p className="text-xs text-gray-400 mt-0.5">
            JPG, PNG or PDF · Max 5MB
          </p>
        </div>
      )}
    </label>
  </div>
);

const StatusBadge = ({ status }) => {
  const config = {
    not_submitted: {
      color: "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300",
      label: "Not Submitted",
    },
    pending: {
      color:
        "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
      label: "⏳ Under Review",
    },
    verified: {
      color:
        "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
      label: "✅ Verified",
    },
    rejected: {
      color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
      label: "❌ Rejected",
    },
  };
  const { color, label } = config[status] || config.not_submitted;
  return (
    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${color}`}>
      {label}
    </span>
  );
};

export default function KYCUpload() {
  const { user } = useAuth(); // ✅ Use auth context
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
      // ✅ FIXED: Use correct token key
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
      if (err.response?.status === 401) {
        toast.error("Please login again");
      }
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

  // const handleSubmit = async (e) => {
  //   e.preventDefault();

  //   // Validate all files
  //   const requiredFiles = [
  //     "drivingLicenseFront",
  //     "drivingLicenseBack",
  //     "aadhaarFront",
  //     "aadhaarBack",
  //   ];
  //   for (const field of requiredFiles) {
  //     if (!files[field]) {
  //       toast.error("Please upload all required documents");
  //       return;
  //     }
  //   }

  //   if (!form.licenseNumber.trim()) {
  //     toast.error("Please enter your driving license number");
  //     return;
  //   }

  //   if (!/^\d{12}$/.test(form.aadhaarNumber)) {
  //     toast.error("Aadhaar number must be exactly 12 digits");
  //     return;
  //   }

  //   const formData = new FormData();
  //   formData.append("licenseNumber", form.licenseNumber);
  //   formData.append("aadhaarNumber", form.aadhaarNumber);
  //   Object.entries(files).forEach(([key, file]) => formData.append(key, file));

  //   try {
  //     setSubmitting(true);
  //     // ✅ FIXED: Use correct token key
  //     const token = localStorage.getItem("wheelz_token");

  //     await axios.post(`${API}/kyc/submit`, formData, {
  //       headers: {
  //         Authorization: `Bearer ${token}`,
  //         "Content-Type": "multipart/form-data",
  //       },
  //     });
  //     toast.success("KYC submitted! We'll verify within 24 hours.");
  //     setKycStatus("pending");

  //     // Reset form
  //     setForm({ licenseNumber: "", aadhaarNumber: "" });
  //     setFiles({
  //       drivingLicenseFront: null,
  //       drivingLicenseBack: null,
  //       aadhaarFront: null,
  //       aadhaarBack: null,
  //     });
  //   } catch (err) {
  //     console.error("KYC submission error:", err);
  //     toast.error(err.response?.data?.message || "Submission failed");
  //   } finally {
  //     setSubmitting(false);
  //   }
  // };
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

      // ✅ Reset form
      setForm({ licenseNumber: "", aadhaarNumber: "" });
      setFiles({
        drivingLicenseFront: null,
        drivingLicenseBack: null,
        aadhaarFront: null,
        aadhaarBack: null,
      });

      // ✅ Redirect to home after 2 seconds
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
    return (
      <div className="flex items-center justify-center min-h-screen pt-20">
        <div className="animate-spin w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10 pt-24">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          KYC Verification
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Verify your identity to unlock vehicle bookings
        </p>
        <div className="mt-3 flex items-center gap-2">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Status:
          </span>
          <StatusBadge status={kycStatus || "not_submitted"} />
        </div>
      </div>

      {/* Already Verified */}
      {kycStatus === "verified" && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-2xl p-6 text-center">
          <div className="text-5xl mb-3">🎉</div>
          <h2 className="text-lg font-semibold text-green-700 dark:text-green-400">
            You're Verified!
          </h2>
          <p className="text-green-600 dark:text-green-500 mt-1">
            Your KYC is complete. You can now book any vehicle on Wheelz.
          </p>
        </div>
      )}

      {/* Pending */}
      {kycStatus === "pending" && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-2xl p-6 text-center">
          <div className="text-5xl mb-3">⏳</div>
          <h2 className="text-lg font-semibold text-yellow-700 dark:text-yellow-400">
            Under Review
          </h2>
          <p className="text-yellow-600 dark:text-yellow-500 mt-1">
            Your documents are being reviewed. This usually takes up to 24
            hours.
          </p>
        </div>
      )}

      {/* Rejected Banner */}
      {kycStatus === "rejected" && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-2xl p-4 mb-6">
          <p className="text-red-700 dark:text-red-400 font-medium">
            ❌ KYC Rejected
          </p>
          <p className="text-red-600 dark:text-red-500 text-sm mt-1">
            Reason: {rejectionReason}. Please re-upload correct documents.
          </p>
        </div>
      )}

      {/* Upload Form — show if not submitted or rejected */}
      {(kycStatus === "not_submitted" ||
        kycStatus === "rejected" ||
        !kycStatus) && (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Driving License Section */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 space-y-4">
            <h2 className="font-semibold text-gray-800 dark:text-white flex items-center gap-2">
              🪪 Driving License
            </h2>
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                License Number
              </label>
              <input
                type="text"
                name="licenseNumber"
                value={form.licenseNumber}
                onChange={handleInputChange}
                placeholder="e.g. MH0120200012345"
                required
                className="mt-1 w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FileUploadBox
                label="Front Side"
                name="drivingLicenseFront"
                onChange={handleFileChange}
                file={files.drivingLicenseFront}
              />
              <FileUploadBox
                label="Back Side"
                name="drivingLicenseBack"
                onChange={handleFileChange}
                file={files.drivingLicenseBack}
              />
            </div>
          </div>

          {/* Aadhaar Section */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 space-y-4">
            <h2 className="font-semibold text-gray-800 dark:text-white flex items-center gap-2">
              📋 Aadhaar Card
            </h2>
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Aadhaar Number
              </label>
              <input
                type="text"
                name="aadhaarNumber"
                value={form.aadhaarNumber}
                onChange={handleInputChange}
                placeholder="12-digit Aadhaar number"
                maxLength={12}
                required
                className="mt-1 w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FileUploadBox
                label="Front Side"
                name="aadhaarFront"
                onChange={handleFileChange}
                file={files.aadhaarFront}
              />
              <FileUploadBox
                label="Back Side"
                name="aadhaarBack"
                onChange={handleFileChange}
                file={files.aadhaarBack}
              />
            </div>
          </div>

          {/* Privacy Note */}
          <p className="text-xs text-gray-400 dark:text-gray-500 text-center">
            🔒 Your documents are securely stored and only used for identity
            verification.
          </p>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 disabled:opacity-50 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit KYC Documents"
            )}
          </button>
        </form>
      )}
    </div>
  );
}
