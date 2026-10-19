import React, { useState, useEffect } from "react";
import { adminAPI } from "../services/api";
import LoadingSpinner from "../components/common/LoadingSpinner";
import {
  Store as BuildingStorefrontIcon,
  CheckCircle2 as CheckCircleIcon,
  XCircle as XCircleIcon,
  Eye as EyeIcon,
  Search as MagnifyingGlassIcon,
  Mail as EnvelopeIcon,
  Phone as PhoneIcon,
  MapPin as MapPinIcon,
  FileText as DocumentTextIcon,
  User as UserIcon,
  IdCard as IdentificationIcon,
  Banknote as BanknotesIcon,
} from "lucide-react";
import { PageHeader } from "../components/ui";
import toast from "react-hot-toast";

export default function AdminVendors() {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    fetchVendors();
  }, []);

  const fetchVendors = async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getAllUsers();
      const allUsers = res.data.users || [];
      const vendorList = allUsers.filter((u) => u.role === "vendor");
      setVendors(vendorList);
    } catch (error) {
      console.error("Error fetching vendors:", error);
      toast.error("Failed to fetch vendors");
    } finally {
      setLoading(false);
    }
  };

  const handleApproveVendor = async (vendorId) => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL || "https://wheelz-ldq2.onrender.com/api"}/admin/approve-vendor/${vendorId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("wheelz_token")}`,
          },
        },
      );
      const data = await response.json();
      if (data.success) {
        toast.success(data.message || "Vendor approved successfully!");
        fetchVendors();
      } else {
        toast.error(data.message || "Failed to approve vendor");
      }
    } catch (error) {
      console.error("Error approving vendor:", error);
      toast.error("Failed to approve vendor");
    }
  };

  const handleRejectVendor = async (vendorId) => {
    if (window.confirm("Are you sure you want to reject this vendor?")) {
      toast.success("Vendor rejected");
      fetchVendors();
    }
  };

  const viewVendorDetails = (vendor) => {
    setSelectedVendor(vendor);
    setShowDetailsModal(true);
  };

  const getVendorTypeBadge = (vendor) => {
    if (vendor.vendorType === "individual") {
      return (
        <span className="px-2 py-1 rounded-full text-xs font-medium bg-raised text-accent flex items-center gap-1 w-fit">
          <UserIcon className="w-3 h-3" /> Individual
        </span>
      );
    } else if (vendor.vendorType === "business") {
      return (
        <span className="px-2 py-1 rounded-full text-xs font-medium bg-raised text-accent flex items-center gap-1 w-fit">
          <BuildingStorefrontIcon className="w-3 h-3" /> Business
        </span>
      );
    }
    return (
      <span className="px-2 py-1 rounded-full border font-mono text-[10px] uppercase tracking-[0.12em] border-line/15 text-ink/80">
        Unknown
      </span>
    );
  };

  const filteredVendors = vendors.filter(
    (v) =>
      v.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.vendorType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.individualDetails?.aadharNumber
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      v.businessDetails?.businessName
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      v.businessDetails?.gstNumber
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()),
  );

  if (loading) return <LoadingSpinner />;

  return (
    <div className="container-x pb-24 pt-28 md:pt-32">
      <PageHeader index="01" eyebrow="Admin" title={["Vendors."]} lede="Approve, review, and manage vendor registrations." />

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
          <input
            type="text"
            placeholder="Search vendors by name, email, type, GST, or Aadhar..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-line/10 bg-surface"
          />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-raised rounded-2xl p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold">{vendors.length}</p>
              <p className="text-sm opacity-90">Total Vendors</p>
            </div>
            <BuildingStorefrontIcon className="w-8 h-8 opacity-80" />
          </div>
        </div>
        <div className="bg-raised rounded-2xl p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold">
                {vendors.filter((v) => v.isVendorApproved).length}
              </p>
              <p className="text-sm opacity-90">Approved</p>
            </div>
            <CheckCircleIcon className="w-8 h-8 opacity-80" />
          </div>
        </div>
        <div className="bg-accent rounded-2xl p-4 text-accent-ink">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold">
                {vendors.filter((v) => !v.isVendorApproved).length}
              </p>
              <p className="text-sm opacity-90">Pending</p>
            </div>
            <XCircleIcon className="w-8 h-8 opacity-80" />
          </div>
        </div>
        <div className="bg-raised rounded-2xl p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold">
                {vendors.filter((v) => v.vendorType === "business").length}
              </p>
              <p className="text-sm opacity-90">Business Vendors</p>
            </div>
            <BuildingStorefrontIcon className="w-8 h-8 opacity-80" />
          </div>
        </div>
      </div>

      {/* Vendors Table */}
      <div className="bg-surface rounded-[24px] overflow-hidden border border-line/10">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-raised/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase">
                  Vendor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase">
                  Business/Individual
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase">
                  Registered
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line/10">
              {filteredVendors.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    className="px-6 py-8 text-center text-muted"
                  >
                    No vendors found
                  </td>
                </tr>
              ) : (
                filteredVendors.map((vendor) => (
                  <tr
                    key={vendor._id}
                    className="hover:bg-raised"
                  >
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-ink">
                          {vendor.name}
                        </p>
                        <p className="text-sm text-muted">{vendor.email}</p>
                        <p className="text-xs text-muted flex items-center gap-1 mt-1">
                          <PhoneIcon className="w-3 h-3" />{" "}
                          {vendor.phone || "N/A"}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">{getVendorTypeBadge(vendor)}</td>
                    <td className="px-6 py-4">
                      {vendor.vendorType === "individual" ? (
                        <div>
                          <p className="text-sm">
                            Aadhar:{" "}
                            {vendor.individualDetails?.aadharNumber || "N/A"}
                          </p>
                          <p className="text-xs text-muted">
                            PAN: {vendor.individualDetails?.panNumber || "N/A"}
                          </p>
                        </div>
                      ) : vendor.vendorType === "business" ? (
                        <div>
                          <p className="text-sm font-medium">
                            {vendor.businessDetails?.businessName || "N/A"}
                          </p>
                          <p className="text-xs text-muted">
                            GST: {vendor.businessDetails?.gstNumber || "N/A"}
                          </p>
                        </div>
                      ) : (
                        <div>
                          <p className="text-sm">
                            {vendor.vendorDetails?.businessName || "N/A"}
                          </p>
                          <p className="text-xs text-muted">
                            GST: {vendor.vendorDetails?.gstNumber || "N/A"}
                          </p>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {vendor.isVendorApproved ? (
                        <span className="px-2 py-1 rounded-full border font-mono text-[10px] uppercase tracking-[0.12em] border-line/15 text-ink/80">
                          Approved
                        </span>
                      ) : (
                        <span className="px-2 py-1 rounded-full border font-mono text-[10px] uppercase tracking-[0.12em] border-line/15 text-ink/80">
                          Pending
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-muted">
                      {new Date(vendor.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => viewVendorDetails(vendor)}
                          className="p-1.5 rounded-xl text-accent hover:bg-accent hover:text-accent-ink transition"
                          title="View Details"
                        >
                          <EyeIcon className="w-4 h-4" />
                        </button>
                        {!vendor.isVendorApproved && (
                          <>
                            <button
                              onClick={() => handleApproveVendor(vendor._id)}
                              className="p-1.5 rounded-xl text-accent hover:bg-accent hover:text-accent-ink transition"
                              title="Approve Vendor"
                            >
                              <CheckCircleIcon className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleRejectVendor(vendor._id)}
                              className="p-1.5 rounded-xl text-red-500 hover:bg-red-50 transition"
                              title="Reject Vendor"
                            >
                              <XCircleIcon className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Vendor Details Modal */}
      {showDetailsModal && selectedVendor && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowDetailsModal(false)}
        >
          <div
            className="bg-surface rounded-[24px] max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-line/10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-line/10 sticky top-0 bg-surface">
              <h2 className="text-xl font-bold">Vendor Details</h2>
            </div>
            <div className="p-6 space-y-4">
              {/* Personal Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-muted">Full Name</label>
                  <p className="font-medium">{selectedVendor.name}</p>
                </div>
                <div>
                  <label className="text-xs text-muted">Email</label>
                  <p className="font-medium flex items-center gap-1">
                    <EnvelopeIcon className="w-3 h-3" /> {selectedVendor.email}
                  </p>
                </div>
                <div>
                  <label className="text-xs text-muted">Phone</label>
                  <p className="font-medium flex items-center gap-1">
                    <PhoneIcon className="w-3 h-3" />{" "}
                    {selectedVendor.phone || "N/A"}
                  </p>
                </div>
                <div>
                  <label className="text-xs text-muted">Vendor Type</label>
                  <p className="font-medium capitalize">
                    {selectedVendor.vendorType || "Individual"}
                  </p>
                </div>
                <div>
                  <label className="text-xs text-muted">Registered On</label>
                  <p className="font-medium">
                    {new Date(selectedVendor.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <label className="text-xs text-muted">
                    Commission Rate
                  </label>
                  <p className="font-medium text-accent">
                    {selectedVendor.commissionRate ||
                      (selectedVendor.vendorType === "business"
                        ? "10%"
                        : "15%")}
                  </p>
                </div>
              </div>

              {/* Individual Vendor Details */}
              {selectedVendor.vendorType === "individual" &&
                selectedVendor.individualDetails && (
                  <div className="border-t pt-4">
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <IdentificationIcon className="w-4 h-4" /> Individual
                      Details
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs text-muted">
                          Aadhar Number
                        </label>
                        <p className="font-mono text-sm">
                          {selectedVendor.individualDetails.aadharNumber ||
                            "N/A"}
                        </p>
                      </div>
                      <div>
                        <label className="text-xs text-muted">
                          PAN Number
                        </label>
                        <p className="font-mono text-sm">
                          {selectedVendor.individualDetails.panNumber || "N/A"}
                        </p>
                      </div>
                      <div className="col-span-2">
                        <label className="text-xs text-muted">Address</label>
                        <p className="text-sm">
                          {selectedVendor.individualDetails.address || "N/A"}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

              {/* Business Vendor Details */}
              {selectedVendor.vendorType === "business" &&
                selectedVendor.businessDetails && (
                  <div className="border-t pt-4">
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <BuildingStorefrontIcon className="w-4 h-4" /> Business
                      Details
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs text-muted">
                          Business Name
                        </label>
                        <p className="font-medium">
                          {selectedVendor.businessDetails.businessName || "N/A"}
                        </p>
                      </div>
                      <div>
                        <label className="text-xs text-muted">
                          GST Number
                        </label>
                        <p className="font-mono text-sm">
                          {selectedVendor.businessDetails.gstNumber || "N/A"}
                        </p>
                      </div>
                      <div>
                        <label className="text-xs text-muted">
                          Business PAN
                        </label>
                        <p className="font-mono text-sm">
                          {selectedVendor.businessDetails.panNumber || "N/A"}
                        </p>
                      </div>
                      <div>
                        <label className="text-xs text-muted">Website</label>
                        <p className="text-sm">
                          {selectedVendor.businessDetails.website || "N/A"}
                        </p>
                      </div>
                      <div className="col-span-2">
                        <label className="text-xs text-muted">
                          Business Address
                        </label>
                        <p className="text-sm">
                          {selectedVendor.businessDetails.businessAddress ||
                            "N/A"}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

              {/* Bank Details */}
              {(selectedVendor.bankDetails || selectedVendor.vendorDetails) && (
                <div className="border-t pt-4">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <BanknotesIcon className="w-4 h-4" /> Bank Information
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-muted">
                        Account Holder
                      </label>
                      <p className="font-medium">
                        {selectedVendor.bankDetails?.accountHolderName ||
                          selectedVendor.vendorDetails?.accountHolderName ||
                          "N/A"}
                      </p>
                    </div>
                    <div>
                      <label className="text-xs text-muted">
                        Account Number
                      </label>
                      <p className="font-mono text-sm">
                        {selectedVendor.bankDetails?.accountNumber ||
                          selectedVendor.vendorDetails?.bankAccountNumber ||
                          "N/A"}
                      </p>
                    </div>
                    <div>
                      <label className="text-xs text-muted">IFSC Code</label>
                      <p className="font-mono text-sm uppercase">
                        {selectedVendor.bankDetails?.ifscCode ||
                          selectedVendor.vendorDetails?.ifscCode ||
                          "N/A"}
                      </p>
                    </div>
                    <div>
                      <label className="text-xs text-muted">Bank Name</label>
                      <p className="font-medium">
                        {selectedVendor.bankDetails?.bankName || "N/A"}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Status */}
              <div className="border-t pt-4">
                <label className="text-xs text-muted">Approval Status</label>
                <div className="mt-1">
                  {selectedVendor.isVendorApproved ? (
                    <span className="px-2 py-1 rounded-full border font-mono text-[10px] uppercase tracking-[0.12em] border-line/15 text-ink/80">
                      Approved
                    </span>
                  ) : (
                    <span className="px-2 py-1 rounded-full border font-mono text-[10px] uppercase tracking-[0.12em] border-line/15 text-ink/80">
                      Pending Approval
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-line/10 flex justify-end gap-3">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="btn-secondary"
              >
                Close
              </button>
              {!selectedVendor.isVendorApproved && (
                <button
                  onClick={() => {
                    handleApproveVendor(selectedVendor._id);
                    setShowDetailsModal(false);
                  }}
                  className="btn-primary"
                >
                  Approve Vendor
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
