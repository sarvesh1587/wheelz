// frontend/src/pages/Booking.jsx - WITH HOURLY RENTAL SUPPORT
import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { vehicleAPI, bookingAPI, promoAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";
import LoadingSpinner from "../components/common/LoadingSpinner";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import toast from "react-hot-toast";
import { ArrowLeft, ArrowUpRight, Check, MapPin, Ticket, X } from "lucide-react";
import { Magnetic } from "../components/motion";
import { PageHeader, Panel, Row, Segmented, Spinner, Notice } from "../components/ui";

const EXTRAS = [
  { key: "insurance", label: "Zero Dep Insurance", price: 200, description: "Full coverage" },
  { key: "gps", label: "GPS Navigation", price: 100, description: "Never get lost" },
  { key: "childSeat", label: "Child Seat", price: 150, description: "Safe for kids" },
  { key: "driver", label: "Professional Driver", price: 500, description: "Experienced driver" },
];

const dateField =
  "w-full rounded-none border-0 border-b border-line/20 bg-transparent px-0 py-3 text-base text-ink outline-none transition-colors placeholder:text-muted/70 focus:border-ink";

export default function Booking() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [availability, setAvailability] = useState(null);
  const [extras, setExtras] = useState({
    insurance: false,
    gps: false,
    childSeat: false,
    driver: false,
  });
  const [creatingBooking, setCreatingBooking] = useState(false);
  const [checkingAvailability, setCheckingAvailability] = useState(false);

  // ─── HOURLY RENTAL STATES ─────────────────────────────────────────────────
  const [rentalType, setRentalType] = useState("daily");
  const [selectedHours, setSelectedHours] = useState(3);

  // ─── PROMO CODE STATES ────────────────────────────────────────────────────
  const [promoCode, setPromoCode] = useState("");
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [applyingPromo, setApplyingPromo] = useState(false);
  const [promoDiscount, setPromoDiscount] = useState(0);

  let toastId = null;

  useEffect(() => {
    vehicleAPI
      .getOne(id)
      .then((res) => setVehicle(res.data.vehicle))
      .catch(() => navigate("/vehicles"))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const checkAvailability = async () => {
    if (!startDate) return;
    // For hourly, only startDate needed
    if (rentalType === "daily" && !endDate) return;

    setCheckingAvailability(true);
    try {
      const formattedStartDate = startDate.toISOString().split("T")[0];
      const formattedEndDate =
        rentalType === "hourly"
          ? formattedStartDate
          : endDate.toISOString().split("T")[0];

      const res = await vehicleAPI.checkAvailability(id, {
        startDate: formattedStartDate,
        endDate: formattedEndDate,
      });
      setAvailability(res.data);

      if (!res.data.isAvailable) {
        toast.error("Vehicle not available for selected dates");
      }
    } catch (error) {
      console.error("Availability check error:", error);
    } finally {
      setCheckingAvailability(false);
    }
  };

  useEffect(() => {
    if (rentalType === "hourly" && startDate) {
      checkAvailability();
    } else if (rentalType === "daily" && startDate && endDate) {
      checkAvailability();
    }
  }, [startDate, endDate, rentalType]);

  // Reset endDate when switching to hourly
  useEffect(() => {
    if (rentalType === "hourly") {
      setEndDate(null);
    }
  }, [rentalType]);

  const calculateExtrasCost = () => {
    let cost = 0;
    if (extras.insurance) cost += 200;
    if (extras.gps) cost += 100;
    if (extras.childSeat) cost += 150;
    if (extras.driver) cost += 500;
    return cost;
  };

  // ─── PRICE CALCULATIONS ───────────────────────────────────────────────────
  const pricePerDay = vehicle?.currentPrice || vehicle?.basePrice || 0;
  const hourlyRate = Math.ceil(pricePerDay / 4);

  const totalDays =
    rentalType === "daily" && startDate && endDate
      ? Math.max(1, Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)))
      : 1;

  const extrasPerDay = calculateExtrasCost();

  const basePrice =
    rentalType === "hourly"
      ? hourlyRate * selectedHours
      : pricePerDay * totalDays;

  const extrasTotal =
    rentalType === "hourly" ? extrasPerDay : extrasPerDay * totalDays;

  const subtotal = basePrice;
  const total = subtotal + extrasTotal - promoDiscount;

  // ─── PROMO CODE FUNCTIONS ─────────────────────────────────────────────────
  const applyPromoCode = async () => {
    if (!promoCode) return;
    setApplyingPromo(true);
    try {
      const res = await promoAPI.validatePromo({
        code: promoCode,
        amount: subtotal + extrasTotal,
      });
      if (res.data.success) {
        setAppliedPromo(res.data.promo);
        setPromoDiscount(res.data.promo.discountAmount);
        toast.success(
          `Promo applied! You save ₹${res.data.promo.discountAmount}`,
        );
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Invalid promo code");
      setAppliedPromo(null);
      setPromoDiscount(0);
    } finally {
      setApplyingPromo(false);
    }
  };

  const removePromo = () => {
    setAppliedPromo(null);
    setPromoCode("");
    setPromoDiscount(0);
  };

  // ─── CREATE BOOKING ───────────────────────────────────────────────────────
  const handleCreateBooking = async () => {
    if (!startDate) {
      toast.error("Please select a pickup date");
      return;
    }
    if (rentalType === "daily" && !endDate) {
      toast.error("Please select a return date");
      return;
    }
    if (availability && !availability.isAvailable) {
      toast.error("Vehicle not available for selected dates");
      return;
    }

    setCreatingBooking(true);
    toastId = toast.loading("Creating booking...");

    // For hourly: endDate = startDate (same day)
    const effectiveEndDate = rentalType === "hourly" ? startDate : endDate;

    const bookingData = {
      vehicleId: id,
      startDate: startDate.toISOString(),
      endDate: effectiveEndDate.toISOString(),
      pickupLocation: vehicle?.locationName || vehicle?.city,
      extras: extras,
      promoCode: appliedPromo?.code || null,
      promoDiscount: promoDiscount,
      rentalType,
      hours: rentalType === "hourly" ? selectedHours : undefined,
    };

    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error("timeout")), 8000);
    });

    try {
      await Promise.race([bookingAPI.create(bookingData), timeoutPromise]);
      toast.dismiss(toastId);
      toast.success("Booking confirmed!");
      setTimeout(() => navigate("/dashboard"), 1500);
    } catch (err) {
      console.error("Booking error:", err);
      toast.dismiss(toastId);

      if (err.message === "timeout") {
        toast.loading("Booking processing... Check dashboard in a moment.", {
          duration: 4000,
        });
        setTimeout(() => navigate("/dashboard"), 2000);
      } else {
        toast.error(err.response?.data?.message || "Booking failed");
        setCreatingBooking(false);
      }
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!vehicle) return null;

  const canConfirm = !(
    creatingBooking ||
    !startDate ||
    (rentalType === "daily" && !endDate) ||
    (availability && !availability.isAvailable)
  );

  return (
    <div className="container-x pb-24 pt-28 md:pt-32">
      <Link
        to={`/vehicles/${id}`}
        className="link-underline mb-8 inline-flex items-center gap-2 text-sm text-muted hover:text-ink"
      >
        <ArrowLeft size={14} /> Back to vehicle
      </Link>

      <PageHeader
        index="01"
        eyebrow="Checkout"
        title={["Complete", "your booking."]}
        lede="Pick your dates, add what you need, and lock it in."
      />

      <div className="grid gap-10 lg:grid-cols-12">
        <div className="space-y-6 lg:col-span-7">
          <Panel>
            <div className="flex gap-5">
              <img
                src={vehicle.images?.[0]}
                alt={vehicle.name}
                className="h-24 w-32 shrink-0 rounded-2xl bg-raised object-cover"
              />
              <div className="min-w-0 flex-1">
                <p className="eyebrow mb-2">
                  {vehicle.brand} · {vehicle.year}
                </p>
                <h2 className="display-tight text-2xl md:text-3xl">{vehicle.name}</h2>
                <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted">
                  <span className="flex items-center gap-1.5">
                    <MapPin size={14} /> {vehicle.city}
                  </span>
                  <span className="flex items-center gap-2">
                    <span className={`h-2 w-2 rounded-full ${vehicle.isAvailable ? "bg-emerald-400" : "bg-line/30"}`} />
                    {vehicle.isAvailable ? "Available" : "Booked"}
                  </span>
                  <span className="font-mono text-xs">
                    ₹{pricePerDay}/day · ₹{hourlyRate}/hr
                  </span>
                </div>
              </div>
            </div>
          </Panel>

          <Panel index="02" title="Rental type & dates">
            <Segmented
              value={rentalType}
              onChange={setRentalType}
              options={[
                { value: "daily", label: "Daily" },
                { value: "hourly", label: "Hourly" },
              ]}
              className="mb-8"
            />

            {rentalType === "hourly" && (
              <div className="mb-8">
                <p className="field-label mb-3">Duration</p>
                <div className="flex flex-wrap gap-2">
                  {[3, 4, 5, 6, 8, 10, 12].map((h) => (
                    <button
                      key={h}
                      type="button"
                      onClick={() => setSelectedHours(h)}
                      aria-pressed={selectedHours === h}
                      className={`grid h-11 min-w-[3.5rem] place-items-center rounded-full px-4 font-mono text-sm transition-colors ${
                        selectedHours === h
                          ? "bg-ink text-canvas"
                          : "border border-line/15 text-muted hover:border-ink hover:text-ink"
                      }`}
                    >
                      {h}h
                    </button>
                  ))}
                </div>
                <p className="mt-3 text-xs text-muted">
                  ₹{hourlyRate}/hr (daily rate ÷ 4) · Minimum 3 hours
                </p>
              </div>
            )}

            <div className={`grid grid-cols-1 gap-8 ${rentalType === "daily" ? "md:grid-cols-2" : ""}`}>
              <div>
                <label className="field-label">Pickup date</label>
                <DatePicker
                  selected={startDate}
                  onChange={setStartDate}
                  selectsStart
                  startDate={startDate}
                  endDate={rentalType === "daily" ? endDate : null}
                  minDate={new Date()}
                  className={dateField}
                  dateFormat="dd/MM/yyyy"
                  placeholderText="Select pickup date"
                />
              </div>

              {rentalType === "daily" && (
                <div>
                  <label className="field-label">Return date</label>
                  <DatePicker
                    selected={endDate}
                    onChange={setEndDate}
                    selectsEnd
                    startDate={startDate}
                    endDate={endDate}
                    minDate={startDate || new Date()}
                    className={dateField}
                    dateFormat="dd/MM/yyyy"
                    placeholderText="Select return date"
                  />
                </div>
              )}
            </div>

            {checkingAvailability && (
              <p className="mt-6 flex items-center gap-2 text-sm text-muted">
                <Spinner /> Checking availability…
              </p>
            )}

            {availability && availability.isAvailable === false && (
              <Notice tone="negative" className="mt-6">
                Vehicle not available for selected dates
              </Notice>
            )}

            {availability && availability.isAvailable === true && (
              <Notice tone="positive" className="mt-6">
                Vehicle available. You can proceed.
              </Notice>
            )}
          </Panel>

          <Panel index="03" title="Extras">
            <ul className="border-t border-line/10">
              {EXTRAS.map((extra) => (
                <li key={extra.key}>
                  <label className="group flex cursor-pointer items-center justify-between gap-4 border-b border-line/10 py-5">
                    <span className="flex items-center gap-4">
                      <input
                        type="checkbox"
                        checked={extras[extra.key]}
                        onChange={(e) =>
                          setExtras({
                            ...extras,
                            [extra.key]: e.target.checked,
                          })
                        }
                        className="peer sr-only"
                      />
                      <span
                        className={`grid h-6 w-6 shrink-0 place-items-center rounded-full border transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-accent ${
                          extras[extra.key]
                            ? "border-accent bg-accent text-accent-ink"
                            : "border-line/25 group-hover:border-ink"
                        }`}
                      >
                        {extras[extra.key] && <Check size={13} strokeWidth={3} />}
                      </span>
                      <span>
                        <span className="block font-medium">{extra.label}</span>
                        <span className="block text-xs text-muted">{extra.description}</span>
                      </span>
                    </span>
                    <span className="text-right">
                      <span className="block font-mono text-sm">+₹{extra.price}</span>
                      <span className="block text-xs text-muted">
                        {rentalType === "hourly" ? "per booking" : "per day"}
                      </span>
                    </span>
                  </label>
                </li>
              ))}
            </ul>
          </Panel>
        </div>

        <aside className="lg:col-span-5">
          <div className="sticky top-28 rounded-[24px] border border-line/10 bg-surface p-6 md:p-8">
            <p className="eyebrow mb-4">Price summary</p>

            <div>
              {rentalType === "daily" ? (
                <>
                  <Row label="Rental days">
                    {totalDays} {totalDays === 1 ? "day" : "days"}
                  </Row>
                  <Row label="Price per day">₹{pricePerDay.toLocaleString()}</Row>
                  <Row label="Subtotal">₹{subtotal.toLocaleString()}</Row>
                </>
              ) : (
                <>
                  <Row label="Duration">{selectedHours} hours</Row>
                  <Row label="Hourly rate">₹{hourlyRate}/hr</Row>
                  <Row label={`₹${hourlyRate} × ${selectedHours} hrs`}>₹{subtotal.toLocaleString()}</Row>
                </>
              )}

              {extrasPerDay > 0 && (
                <Row label={`Extras${rentalType === "daily" ? ` (${totalDays} days)` : ""}`}>
                  +₹{extrasTotal.toLocaleString()}
                </Row>
              )}

              {promoDiscount > 0 && (
                <Row label="Promo discount">
                  <span className="text-accent">-₹{promoDiscount.toLocaleString()}</span>
                </Row>
              )}
            </div>

            <div className="mt-6">
              <label className="field-label flex items-center gap-2">
                <Ticket size={12} /> Promo code
              </label>
              <div className="flex items-end gap-3">
                <input
                  type="text"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                  placeholder="Enter code"
                  disabled={!!appliedPromo}
                  className="field flex-1 font-mono uppercase disabled:opacity-60"
                />
                {appliedPromo ? (
                  <button
                    onClick={removePromo}
                    aria-label="Remove promo code"
                    className="grid h-10 w-10 place-items-center rounded-full border border-line/15 transition-colors hover:border-ink"
                  >
                    <X size={14} />
                  </button>
                ) : (
                  <button
                    onClick={applyPromoCode}
                    disabled={!promoCode || applyingPromo}
                    className="btn-ghost !px-5 !py-2.5"
                  >
                    {applyingPromo ? <Spinner /> : "Apply"}
                  </button>
                )}
              </div>

              {appliedPromo && (
                <p className="mt-3 flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5 text-muted">
                    <Check size={12} className="text-accent" /> {appliedPromo.code} applied
                  </span>
                  <span className="font-mono text-accent">-₹{promoDiscount.toLocaleString()}</span>
                </p>
              )}

              {!appliedPromo && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {["WELCOME50", "FLAT100", "FESTIVAL200"].map((code) => (
                    <button key={code} onClick={() => setPromoCode(code)} className="chip font-mono !text-[11px]">
                      {code}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-8 flex items-end justify-between border-t border-line/10 pt-6">
              <span className="eyebrow">Total</span>
              <div className="text-right">
                {promoDiscount > 0 && (
                  <span className="block text-sm text-muted line-through">
                    ₹{(subtotal + extrasTotal).toLocaleString()}
                  </span>
                )}
                <span className="display text-5xl">₹{total.toLocaleString()}</span>
                <p className="mt-1 text-xs text-muted">incl. all taxes</p>
              </div>
            </div>

            <Magnetic strength={0.15} className="mt-8 w-full">
              <button
                onClick={handleCreateBooking}
                disabled={!canConfirm}
                className="btn-primary w-full !py-4 text-base disabled:cursor-not-allowed"
              >
                {creatingBooking ? (
                  <>
                    <Spinner /> Creating booking…
                  </>
                ) : (
                  <>
                    Confirm booking · ₹{total.toLocaleString()} <ArrowUpRight size={18} />
                  </>
                )}
              </button>
            </Magnetic>

            <p className="mt-4 text-center text-xs text-muted">If it takes too long, check your dashboard</p>
          </div>
        </aside>
      </div>
    </div>
  );
}
