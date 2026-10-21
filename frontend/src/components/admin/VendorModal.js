import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { ArrowUpRight, Building2, Check, Mail, MapPin, Phone, User, X } from "lucide-react";
import { adminAPI } from "../../services/api";
import { Modal, Row, StatusPill, Spinner } from "../ui";

const inr = (n) => `₹${Math.round(n || 0).toLocaleString("en-IN")}`;
const val = (v) => (v && String(v).trim() ? v : "—");

// Full vendor review sheet used from the admin dashboard.
export default function VendorModal({ vendor, open, onClose, onChanged }) {
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open || !vendor?._id) return;
    let alive = true;
    setLoading(true);
    setDetail(null);
    adminAPI
      .getUserById(vendor._id)
      .then((r) => alive && setDetail(r.data))
      .catch(() => alive && setDetail(null))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [open, vendor?._id]);

  if (!vendor) return null;

  // Prefer the masked detail response; fall back to the list row (no PII shown).
  const u = detail?.user || vendor;
  const vehicles = detail?.vehicles || [];
  const stats = detail?.stats;
  const isBusiness = u.vendorType === "business";
  const business = u.businessDetails || {};
  const legacy = u.vendorDetails || {};
  const bank = u.bankDetails || {};
  const approved = !!u.isVendorApproved;

  const setApproval = async (next) => {
    setSaving(true);
    try {
      await adminAPI.toggleVendorStatus(u._id, next);
      toast.success(next ? `${u.name} approved` : `${u.name} set to pending`);
      onChanged?.();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update vendor");
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async () => {
    setSaving(true);
    try {
      await adminAPI.toggleUserActive(u._id);
      toast.success(u.isActive === false ? "Account activated" : "Account deactivated");
      onChanged?.();
      onClose();
    } catch {
      toast.error("Failed to update account");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} eyebrow="Vendor" title={u.name} size="xl">
      <div className="-mt-3 mb-8 flex flex-wrap items-center gap-2">
        <StatusPill tone={approved ? "positive" : "pending"}>{approved ? "Approved" : "Pending approval"}</StatusPill>
        {u.isActive === false && <StatusPill tone="negative">Account inactive</StatusPill>}
        <StatusPill tone="neutral">{isBusiness ? "Business" : u.vendorType === "individual" ? "Individual" : "Vendor"}</StatusPill>
        {u.kycStatus && <StatusPill status={u.kycStatus}>KYC {u.kycStatus.replace("_", " ")}</StatusPill>}
      </div>

      {/* Stats */}
      <div className="mb-8 grid grid-cols-2 gap-px overflow-hidden rounded-[20px] border border-line/10 bg-line/10 md:grid-cols-4">
        {[
          ["Vehicles", stats ? stats.vehicles : "—"],
          ["Available", stats ? stats.availableVehicles : "—"],
          ["Bookings", stats ? stats.bookings : "—"],
          ["Earned", stats ? inr(stats.revenue) : "—"],
        ].map(([label, value]) => (
          <div key={label} className="bg-surface p-5">
            <p className="eyebrow">{label}</p>
            <p className="display mt-2 text-3xl">{loading ? <Spinner /> : value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <section>
          <p className="eyebrow mb-2 flex items-center gap-2">
            <User size={12} /> Contact
          </p>
          <Row label="Email">
            <a href={`mailto:${u.email}`} className="link-underline inline-flex items-center gap-1.5">
              <Mail size={12} /> {u.email}
            </a>
          </Row>
          <Row label="Phone">
            {u.phone ? (
              <a href={`tel:${u.phone}`} className="link-underline inline-flex items-center gap-1.5">
                <Phone size={12} /> {u.phone}
              </a>
            ) : (
              "—"
            )}
          </Row>
          <Row label="Address">
            <span className="inline-flex items-start gap-1.5">
              <MapPin size={12} className="mt-0.5 shrink-0" />
              {val(u.individualDetails?.address || business.businessAddress || legacy.businessAddress || u.address?.city)}
            </span>
          </Row>
          <Row label="Joined">{u.createdAt ? new Date(u.createdAt).toLocaleDateString("en-IN") : "—"}</Row>
          <Row label="Commission">{u.commissionRate != null ? `${u.commissionRate}%` : "—"}</Row>
        </section>

        <section>
          <p className="eyebrow mb-2 flex items-center gap-2">
            <Building2 size={12} /> {isBusiness ? "Business" : "Identity"}
          </p>
          {isBusiness ? (
            <>
              <Row label="Business name">{val(business.businessName || legacy.businessName || u.businessName)}</Row>
              <Row label="GST">{val(business.gstNumber || legacy.gstNumber)}</Row>
              <Row label="PAN">{detail ? val(business.panNumber || legacy.panNumber) : "—"}</Row>
              <Row label="Website">{val(business.website)}</Row>
            </>
          ) : (
            <>
              <Row label="Aadhaar">{detail ? val(u.individualDetails?.aadharNumber) : "—"}</Row>
              <Row label="PAN">{detail ? val(u.individualDetails?.panNumber) : "—"}</Row>
            </>
          )}
          <p className="eyebrow mb-2 mt-6">Payouts</p>
          <Row label="Account holder">{val(bank.accountHolderName || legacy.accountHolderName)}</Row>
          <Row label="Bank">{val(bank.bankName)}</Row>
          <Row label="Account">{detail ? val(bank.accountNumber || legacy.bankAccountNumber) : "—"}</Row>
          <Row label="IFSC">{val(bank.ifscCode || legacy.ifscCode)}</Row>
        </section>
      </div>

      {/* Vehicles */}
      <section className="mt-8">
        <p className="eyebrow mb-3">Vehicles</p>
        {loading ? (
          <div className="flex justify-center py-6 text-muted">
            <Spinner />
          </div>
        ) : vehicles.length === 0 ? (
          <p className="rounded-[20px] border border-dashed border-line/20 p-5 text-sm text-muted">
            {detail ? "No vehicles listed yet." : "Vehicle list needs the latest API deploy."}
          </p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {vehicles.slice(0, 6).map((v) => (
              <Link
                key={v._id}
                to={`/vehicles/${v._id}`}
                onClick={onClose}
                className="flex items-center gap-3 rounded-2xl border border-line/10 p-3 transition-colors hover:border-accent"
              >
                <img src={v.images?.[0]} alt="" className="h-12 w-16 rounded-xl bg-raised object-cover" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium">{v.name}</span>
                  <span className="block text-xs text-muted">
                    {v.city} · ₹{(v.currentPrice || v.basePrice || 0).toLocaleString("en-IN")}/day
                  </span>
                </span>
                <span className={`h-2 w-2 shrink-0 rounded-full ${v.isAvailable ? "bg-emerald-400" : "bg-line/30"}`} />
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Actions */}
      <div className="mt-10 flex flex-wrap items-center gap-3 border-t border-line/10 pt-6">
        {approved ? (
          <button onClick={() => setApproval(false)} disabled={saving} className="btn-ghost hover:!border-red-500 hover:!bg-transparent hover:!text-red-500">
            <X size={16} /> Revoke approval
          </button>
        ) : (
          <button onClick={() => setApproval(true)} disabled={saving} className="btn-primary">
            {saving ? <Spinner /> : <Check size={16} />} Approve vendor
          </button>
        )}
        <button onClick={toggleActive} disabled={saving} className="btn-ghost">
          {u.isActive === false ? "Activate account" : "Deactivate account"}
        </button>
        <Link to={`/admin/vendors/${u._id}`} onClick={onClose} className="link-underline ml-auto inline-flex items-center gap-1 text-sm">
          Full profile <ArrowUpRight size={14} />
        </Link>
      </div>
    </Modal>
  );
}
