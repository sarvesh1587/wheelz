import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { ShieldCheck, ShieldAlert, Phone } from "lucide-react";
import { handoverAPI } from "../../services/api";
import { Modal, Row, StatusPill, Spinner, Notice } from "../ui";
import PhotoSlots, { appendPhotos, currentLocation } from "./PhotoSlots";

const MIN_PHOTOS = 4;

// Owner's pickup / return screen: verify the renter, photograph the vehicle,
// record odometer and fuel, and (at return) flag damage.
export default function CheckInModal({ bookingId, mode, open, onClose, onDone }) {
  const isPickup = mode === "pickup";
  const [info, setInfo] = useState(null);
  const [photos, setPhotos] = useState({});
  const [form, setForm] = useState({ code: "", odometer: "", fuelLevel: 50, notes: "", matched: false, damage: false, damageDescription: "", damageAmount: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setPhotos({});
    setForm({ code: "", odometer: "", fuelLevel: 50, notes: "", matched: false, damage: false, damageDescription: "", damageAmount: "" });
    setInfo(null);
    handoverAPI
      .get(bookingId)
      .then((res) => setInfo(res.data.handover))
      .catch((err) => toast.error(err.response?.data?.message || "Couldn't load the booking"));
  }, [open, bookingId]);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value });
  const photoCount = Object.keys(photos).length;
  const prevOdo = info?.pickupReport?.odometer;

  const submit = async (e) => {
    e.preventDefault();
    if (isPickup && !form.matched) return toast.error("Check the renter's licence against the photo first");
    if (isPickup && !/^\d{6}$/.test(form.code.trim())) return toast.error("Enter the renter's 6-digit pickup code");
    if (photoCount < MIN_PHOTOS) return toast.error(`Add at least ${MIN_PHOTOS} photos`);
    if (form.odometer === "") return toast.error("Enter the odometer reading");
    if (!isPickup && prevOdo != null && Number(form.odometer) < prevOdo) return toast.error(`Odometer can't be below ${prevOdo} km`);
    if (form.damage && form.damageDescription.trim().length < 10) return toast.error("Describe the damage");

    setSaving(true);
    const fd = new FormData();
    appendPhotos(fd, photos);
    fd.append("odometer", form.odometer);
    fd.append("fuelLevel", form.fuelLevel);
    fd.append("notes", form.notes);
    if (isPickup) fd.append("code", form.code.trim());
    if (!isPickup && form.damage) {
      fd.append("damage", "true");
      fd.append("damageDescription", form.damageDescription);
      fd.append("damageAmount", form.damageAmount || 0);
    }
    const loc = await currentLocation();
    Object.entries(loc).forEach(([k, v]) => fd.append(k, v));
    try {
      const res = await (isPickup ? handoverAPI.pickup(bookingId, fd) : handoverAPI.return(bookingId, fd));
      toast.success(res.data.message);
      onDone?.();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Couldn't save. Check your connection and try again.");
    } finally {
      setSaving(false);
    }
  };

  const renter = info?.renter;

  return (
    <Modal open={open} onClose={() => !saving && onClose()} size="lg" eyebrow={info?.bookingRef} title={isPickup ? "Hand over the vehicle" : "Take the vehicle back"}>
      {!info ? (
        <div className="flex justify-center py-10">
          <Spinner />
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-7">
          {isPickup && (
            <section>
              <p className="field-label mb-3">1. Check who is taking the vehicle</p>
              {renter ? (
                <div className="grid gap-4 rounded-2xl border border-line/10 p-4 sm:grid-cols-[10rem_1fr]">
                  {renter.licensePhoto ? (
                    <a href={renter.licensePhoto} target="_blank" rel="noreferrer">
                      <img src={renter.licensePhoto} alt="Renter's driving licence" className="aspect-[4/3] w-full rounded-xl object-cover" />
                    </a>
                  ) : (
                    <div className="grid aspect-[4/3] place-items-center rounded-xl bg-raised text-xs text-muted">No licence photo</div>
                  )}
                  <div className="text-sm">
                    <Row label="Name">{renter.name}</Row>
                    <Row label="Licence no.">{renter.licenseNumber || "—"}</Row>
                    <Row label="Phone">
                      <a href={`tel:${renter.phone}`} className="inline-flex items-center gap-1 hover:text-accent">
                        <Phone size={12} /> {renter.phone}
                      </a>
                    </Row>
                    <Row label="KYC">
                      <StatusPill status={renter.kycStatus === "verified" ? "verified" : "pending"}>{renter.kycStatus}</StatusPill>
                    </Row>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted">Renter details unavailable.</p>
              )}
              {renter && renter.kycStatus !== "verified" && (
                <Notice tone="negative" icon={ShieldAlert} className="mt-3" title="KYC not verified">
                  Don't hand over the vehicle until the renter's documents are verified.
                </Notice>
              )}
              <label className="mt-4 flex items-start gap-3 text-sm">
                <input type="checkbox" checked={form.matched} onChange={set("matched")} className="mt-0.5 h-4 w-4 accent-[rgb(var(--accent))]" />
                <span>I've seen the original driving licence; the name and photo match the person in front of me.</span>
              </label>
            </section>
          )}

          <section>
            <p className="field-label mb-1">{isPickup ? "2." : "1."} Walk around the vehicle</p>
            <p className="mb-3 text-xs text-muted">At least {MIN_PHOTOS} clear photos. Include scratches and dents up close. Photos, time and location are saved as evidence.</p>
            <PhotoSlots value={photos} onChange={setPhotos} />
            <p className="mt-2 text-xs text-muted">{photoCount} photo{photoCount === 1 ? "" : "s"} added</p>
          </section>

          <section className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="field-label" htmlFor="odo">Odometer (km)</label>
              <input id="odo" inputMode="numeric" className="field" value={form.odometer} onChange={set("odometer")} placeholder={prevOdo != null ? `At pickup: ${prevOdo}` : "e.g. 12450"} />
              {!isPickup && prevOdo != null && form.odometer !== "" && Number(form.odometer) >= prevOdo && (
                <p className="mt-1 text-xs text-muted">{Number(form.odometer) - prevOdo} km driven</p>
              )}
            </div>
            <div>
              <label className="field-label" htmlFor="fuel">Fuel / charge: {form.fuelLevel}%</label>
              <input id="fuel" type="range" min={0} max={100} step={5} value={form.fuelLevel} onChange={set("fuelLevel")} className="mt-4 w-full accent-[rgb(var(--accent))]" />
              {!isPickup && info.pickupReport?.fuelLevel != null && <p className="mt-1 text-xs text-muted">At pickup: {info.pickupReport.fuelLevel}%</p>}
            </div>
          </section>

          <div>
            <label className="field-label" htmlFor="notes">Notes (optional)</label>
            <input id="notes" className="field" value={form.notes} onChange={set("notes")} placeholder={isPickup ? "Existing scratch on rear bumper…" : "Returned clean…"} />
          </div>

          {!isPickup && (
            <section className="rounded-2xl border border-line/10 p-4">
              <label className="flex items-center gap-3 text-sm font-medium">
                <input type="checkbox" checked={form.damage} onChange={set("damage")} className="h-4 w-4 accent-[rgb(var(--accent))]" />
                New damage or missing items
              </label>
              {form.damage && (
                <div className="mt-4 grid gap-4 sm:grid-cols-[1fr_10rem]">
                  <div>
                    <label className="field-label" htmlFor="dmg">What happened</label>
                    <input id="dmg" className="field" value={form.damageDescription} onChange={set("damageDescription")} placeholder="Deep scratch on left door, not in pickup photos" />
                  </div>
                  <div>
                    <label className="field-label" htmlFor="amt">Repair estimate (₹)</label>
                    <input id="amt" inputMode="numeric" className="field" value={form.damageAmount} onChange={set("damageAmount")} />
                  </div>
                  <p className="text-xs text-muted sm:col-span-2">This opens a dispute. The renter can respond, and Wheelz decides using the pickup and return photos. Your earnings for this ride stay on hold until then.</p>
                </div>
              )}
            </section>
          )}

          {isPickup && (
            <section>
              <label className="field-label" htmlFor="code">3. Renter's pickup code</label>
              <input id="code" inputMode="numeric" maxLength={6} className="field font-mono text-2xl tracking-[0.4em]" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.replace(/\D/g, "") })} placeholder="••••••" />
              <p className="mt-1 flex items-center gap-1.5 text-xs text-muted">
                <ShieldCheck size={12} /> Ask for it in person, only after the checks above. It proves the booked renter is here.
              </p>
            </section>
          )}

          <button type="submit" disabled={saving} className="btn-primary w-full justify-center">
            {saving ? <Spinner /> : isPickup ? "Start ride" : "Complete ride"}
          </button>
        </form>
      )}
    </Modal>
  );
}
