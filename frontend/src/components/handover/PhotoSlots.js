import React, { useEffect, useRef } from "react";
import { Camera, Plus, X } from "lucide-react";
import compressImage from "../../utils/compressImage";

export const VEHICLE_SLOTS = [
  { key: "front", label: "Front" },
  { key: "back", label: "Back" },
  { key: "left", label: "Left side" },
  { key: "right", label: "Right side" },
  { key: "odometer", label: "Odometer" },
  { key: "fuel", label: "Fuel gauge" },
];
const MAX_EXTRA = 4;

// Labelled photo pickers that open the phone camera. `value` maps slot key
// to { file, preview }; extra photos use keys "extra-1"... .
export default function PhotoSlots({ slots = VEHICLE_SLOTS, value, onChange, extras = true }) {
  const urls = useRef([]);
  useEffect(() => () => urls.current.forEach((u) => URL.revokeObjectURL(u)), []);

  const set = async (key, label, file) => {
    if (!file) return;
    const small = await compressImage(file);
    const preview = URL.createObjectURL(small);
    urls.current.push(preview);
    onChange({ ...value, [key]: { file: small, preview, label } });
  };
  const remove = (key) => {
    const next = { ...value };
    delete next[key];
    onChange(next);
  };
  const extraKeys = Object.keys(value).filter((k) => k.startsWith("extra-"));
  const nextExtra = `extra-${Date.now()}`;

  const Slot = ({ k, label }) => (
    <div className="relative">
      <label className="group relative block aspect-[4/3] cursor-pointer overflow-hidden rounded-2xl border border-dashed border-line/25 bg-raised transition-colors hover:border-accent">
        {value[k] ? (
          <img src={value[k].preview} alt={label} className="h-full w-full object-cover" />
        ) : (
          <span className="flex h-full flex-col items-center justify-center gap-1.5 text-muted">
            <Camera size={20} />
            <span className="text-xs">{label}</span>
          </span>
        )}
        <input type="file" accept="image/*" capture="environment" className="sr-only" onChange={(e) => set(k, label, e.target.files?.[0])} />
      </label>
      {value[k] && (
        <>
          <span className="pointer-events-none absolute bottom-1.5 left-1.5 rounded-full bg-black/60 px-2 py-0.5 text-[10px] text-white">{label}</span>
          <button type="button" onClick={() => remove(k)} aria-label={`Remove ${label} photo`} className="absolute right-1.5 top-1.5 grid h-6 w-6 place-items-center rounded-full bg-black/60 text-white">
            <X size={12} />
          </button>
        </>
      )}
    </div>
  );

  return (
    <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
      {slots.map((s) => (
        <Slot key={s.key} k={s.key} label={s.label} />
      ))}
      {extraKeys.map((k, i) => (
        <Slot key={k} k={k} label={value[k]?.label || `Extra ${i + 1}`} />
      ))}
      {extras && extraKeys.length < MAX_EXTRA && (
        <label className="flex aspect-[4/3] cursor-pointer flex-col items-center justify-center gap-1.5 rounded-2xl border border-dashed border-line/25 text-muted transition-colors hover:border-accent">
          <Plus size={18} />
          <span className="text-xs">Damage / extra</span>
          <input type="file" accept="image/*" capture="environment" className="sr-only" onChange={(e) => set(nextExtra, `Extra ${extraKeys.length + 1}`, e.target.files?.[0])} />
        </label>
      )}
    </div>
  );
}

// Appends the chosen photos (and their labels) to a FormData in slot order.
export function appendPhotos(form, value) {
  Object.values(value).forEach((p, i) => {
    form.append("photos", p.file, `${(p.label || `photo-${i + 1}`).replace(/\W+/g, "-").toLowerCase()}.jpg`);
    form.append("labels[]", p.label || `Photo ${i + 1}`);
  });
}

// Best-effort device location for the report; resolves to {} if unavailable.
export function currentLocation() {
  return new Promise((resolve) => {
    if (!navigator.geolocation) return resolve({});
    navigator.geolocation.getCurrentPosition(
      (p) => resolve({ lat: p.coords.latitude, lng: p.coords.longitude, accuracy: Math.round(p.coords.accuracy) }),
      () => resolve({}),
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 60000 },
    );
  });
}
