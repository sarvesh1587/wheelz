import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { Download, RefreshCw, Search } from "lucide-react";
import toast from "react-hot-toast";
import { adminAPI, vehicleAPI } from "../services/api";
import { Reveal } from "../components/motion";
import {
  PageHeader,
  Panel,
  Stat,
  StatusPill,
  Segmented,
  Notice,
  Empty,
  PageLoader,
  Spinner,
  useThemeColors,
} from "../components/ui";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const RANGES = [
  { value: 7, label: "7 days" },
  { value: 30, label: "30 days" },
  { value: 90, label: "90 days" },
  { value: 365, label: "12 months" },
];

const inr = (n) => `₹${Math.round(n || 0).toLocaleString("en-IN")}`;
const compactInr = (n) =>
  n >= 1e7 ? `₹${(n / 1e7).toFixed(1)}Cr` : n >= 1e5 ? `₹${(n / 1e5).toFixed(1)}L` : n >= 1e3 ? `₹${(n / 1e3).toFixed(1)}K` : inr(n);

// Month buckets covering the selected range so empty months still show as zero.
function monthBuckets(days) {
  const out = [];
  const now = new Date();
  const count = Math.max(1, Math.min(12, Math.ceil(days / 30)));
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    out.push({ year: d.getFullYear(), month: d.getMonth() + 1, label: `${MONTHS[d.getMonth()]} ${String(d.getFullYear()).slice(2)}` });
  }
  return out;
}

// Used when the deployed API doesn't have /admin/reports yet: build what we
// can from endpoints that already exist. Booking timelines aren't available.
async function loadFallback(days) {
  const since = Date.now() - days * 86400000;
  const [dash, users, vehicles, breakdown] = await Promise.allSettled([
    adminAPI.getDashboard(),
    adminAPI.getAllUsers(),
    vehicleAPI.getAll({ limit: 500 }),
    adminAPI.getRevenueBreakdown(),
  ]);
  const s = dash.status === "fulfilled" ? dash.value.data.stats : {};
  const userList = users.status === "fulfilled" ? users.value.data.users || [] : [];
  const vehicleList = vehicles.status === "fulfilled" ? vehicles.value.data.vehicles || [] : [];
  const rev = breakdown.status === "fulfilled" ? breakdown.value.data.breakdown || [] : [];

  const growth = {};
  userList.forEach((u) => {
    const t = new Date(u.createdAt);
    if (+t < since) return;
    const k = `${t.getFullYear()}-${t.getMonth() + 1}`;
    growth[k] = (growth[k] || 0) + 1;
  });
  const mix = {};
  vehicleList.forEach((v) => {
    const k = v.subCategory || v.category || "Other";
    mix[k] = (mix[k] || 0) + 1;
  });

  return {
    partial: true,
    kpis: {
      totalRevenue: s.revenue?.total || 0,
      totalBookings: s.bookings?.total || 0,
      periodRevenue: null,
      periodBookings: null,
      customers: s.users?.total ?? userList.filter((u) => u.role === "customer").length,
      vendors: s.vendors?.total ?? userList.filter((u) => u.role === "vendor").length,
      vehicles: s.vehicles?.total ?? vehicleList.length,
      availableVehicles: vehicleList.filter((v) => v.isAvailable).length,
      cities: [...new Set(vehicleList.map((v) => v.city).filter(Boolean))].sort(),
    },
    revenueByMonth: [],
    bookingsByWeekday: [],
    revenueByCategory: rev.map((r) => ({ category: r._id || "other", revenue: r.revenue, count: r.count })),
    topCities: [],
    bookingStatus: [],
    fleetMix: Object.entries(mix)
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count),
    userGrowth: Object.entries(growth).map(([k, users]) => {
      const [year, month] = k.split("-").map(Number);
      return { year, month, users };
    }),
    transactions: [],
  };
}

export default function AdminReports() {
  const c = useThemeColors();
  const [days, setDays] = useState(365);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const load = useCallback(
    async (quiet = false) => {
      quiet ? setRefreshing(true) : setLoading(true);
      try {
        const res = await adminAPI.getReports({ days });
        setData({ ...res.data, partial: false });
      } catch (err) {
        if (err.response?.status === 404 || !err.response) {
          setData(await loadFallback(days));
        } else {
          toast.error(err.response?.data?.message || "Failed to load reports");
        }
      } finally {
        setLoading(false);
        setRefreshing(false);
        setLastRefresh(new Date());
      }
    },
    [days],
  );

  useEffect(() => {
    load();
  }, [load]);

  const series = useMemo(() => {
    if (!data) return null;
    const buckets = monthBuckets(days);
    const byKey = (arr, field) => Object.fromEntries(arr.map((r) => [`${r.year}-${r.month}`, r[field]]));
    const rev = byKey(data.revenueByMonth, "revenue");
    const bk = byKey(data.revenueByMonth, "bookings");
    const usr = byKey(data.userGrowth, "users");
    let cumulative = 0;
    const months = buckets.map((b) => {
      const k = `${b.year}-${b.month}`;
      cumulative += usr[k] || 0;
      return { label: b.label, revenue: rev[k] || 0, bookings: bk[k] || 0, newUsers: usr[k] || 0, users: cumulative };
    });
    const week = WEEKDAYS.map((d, i) => {
      const row = { day: d, car: 0, bike: 0 };
      data.bookingsByWeekday
        .filter((r) => r.day === i + 1)
        .forEach((r) => {
          row[r.category === "bike" ? "bike" : "car"] += r.count;
        });
      return row;
    });
    return { months, week };
  }, [data, days]);

  const transactions = useMemo(() => {
    if (!data) return [];
    const q = search.trim().toLowerCase();
    return data.transactions.filter(
      (t) =>
        (statusFilter === "all" || t.status === statusFilter) &&
        (!q || [t.id, t.customer, t.vehicle, t.city].some((v) => String(v).toLowerCase().includes(q))),
    );
  }, [data, search, statusFilter]);

  const exportCsv = () => {
    if (!transactions.length) return toast.error("Nothing to export");
    const head = ["Booking", "Customer", "Vehicle", "City", "Amount", "Status", "Payment", "Date"];
    const rows = transactions.map((t) => [t.id, t.customer, t.vehicle, t.city, t.amount, t.status, t.paymentStatus, new Date(t.date).toISOString()]);
    const csv = [head, ...rows].map((r) => r.map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const a = Object.assign(document.createElement("a"), { href: url, download: `wheelz-transactions-${days}d.csv` });
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading || !data) return <PageLoader label="Loading reports" />;

  const k = data.kpis;
  const axis = { stroke: c.muted, tickLine: false, axisLine: false, fontSize: 12 };
  const tooltip = {
    contentStyle: { background: c.surface, border: `1px solid ${c.lineA(0.12)}`, borderRadius: 16, color: c.ink, fontSize: 12 },
    labelStyle: { color: c.muted },
    cursor: { fill: c.lineA(0.04) },
  };
  const pieColors = [c.accent, c.ink, c.muted, c.accentA(0.45), c.lineA(0.25), c.accentA(0.2)];
  const hasTimeline = !data.partial;
  const totalFleet = data.fleetMix.reduce((s, r) => s + r.count, 0);
  const statusTotal = data.bookingStatus.reduce((s, r) => s + r.count, 0);

  return (
    <div className="container-x pb-24 pt-28 md:pt-32">
      <PageHeader
        index="01"
        eyebrow={`Live · updated ${lastRefresh.toLocaleTimeString()}`}
        title={["Analytics."]}
        lede={k.cities.length ? `Wheelz operations across ${k.cities.join(", ")}.` : "Wheelz operations."}
        actions={
          <>
            <Segmented value={days} onChange={setDays} options={RANGES} />
            <button onClick={() => load(true)} disabled={refreshing} className="btn-ghost !px-4 !py-2.5" aria-label="Refresh">
              {refreshing ? <Spinner /> : <RefreshCw size={15} />}
            </button>
          </>
        }
      />

      {data.partial && (
        <Notice tone="pending" title="Showing partial reports" className="mb-10">
          The live API doesn't have the reports endpoint yet, so booking timelines, cities and transactions are hidden.
          Redeploy the backend to see them. Everything shown here is real.
        </Notice>
      )}

      {/* KPIs */}
      <div className="mb-14 grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-4">
        <Reveal>
          <Stat
            label="Revenue (paid)"
            value={compactInr(hasTimeline ? k.periodRevenue : k.totalRevenue)}
            hint={hasTimeline ? `${inr(k.totalRevenue)} all time` : "All time"}
          />
        </Reveal>
        <Reveal delay={0.05}>
          <Stat
            label="Bookings"
            value={(hasTimeline ? k.periodBookings : k.totalBookings).toLocaleString("en-IN")}
            hint={hasTimeline ? `${k.totalBookings.toLocaleString("en-IN")} all time` : "All time"}
          />
        </Reveal>
        <Reveal delay={0.1}>
          <Stat label="Customers" value={k.customers.toLocaleString("en-IN")} hint={`${k.vendors} vendor${k.vendors === 1 ? "" : "s"}`} />
        </Reveal>
        <Reveal delay={0.15}>
          <Stat label="Fleet" value={k.vehicles} hint={`${k.availableVehicles} available now`} />
        </Reveal>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Revenue */}
        {hasTimeline && (
          <Panel index="02" title="Revenue & bookings" className="lg:col-span-8">
            {series.months.every((m) => !m.revenue && !m.bookings) ? (
              <p className="py-16 text-center text-sm text-muted">No bookings in this period.</p>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={series.months}>
                  <defs>
                    <linearGradient id="revFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={c.accent} stopOpacity={0.35} />
                      <stop offset="100%" stopColor={c.accent} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke={c.lineA(0.08)} vertical={false} />
                  <XAxis dataKey="label" {...axis} />
                  <YAxis yAxisId="r" {...axis} tickFormatter={compactInr} width={60} />
                  <YAxis yAxisId="b" orientation="right" {...axis} allowDecimals={false} width={30} />
                  <Tooltip {...tooltip} formatter={(v, n) => (n === "revenue" ? [inr(v), "Revenue"] : [v, "Bookings"])} />
                  <Area yAxisId="r" type="monotone" dataKey="revenue" stroke={c.accent} strokeWidth={2} fill="url(#revFill)" />
                  <Area yAxisId="b" type="monotone" dataKey="bookings" stroke={c.muted} strokeWidth={1.5} fill="none" strokeDasharray="4 4" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </Panel>
        )}

        {/* Booking status */}
        {hasTimeline && (
          <Panel index="03" title="Booking status" className="lg:col-span-4">
            {statusTotal === 0 ? (
              <p className="py-16 text-center text-sm text-muted">No bookings in this period.</p>
            ) : (
              <ul className="space-y-5">
                {data.bookingStatus
                  .slice()
                  .sort((a, b) => b.count - a.count)
                  .map((s) => (
                    <li key={s.status}>
                      <div className="mb-2 flex items-center justify-between text-sm">
                        <StatusPill status={s.status} />
                        <span className="font-mono">{s.count}</span>
                      </div>
                      <div className="h-1 overflow-hidden rounded-full bg-line/10">
                        <div className="h-full rounded-full bg-accent" style={{ width: `${(s.count / statusTotal) * 100}%` }} />
                      </div>
                    </li>
                  ))}
              </ul>
            )}
          </Panel>
        )}

        {/* Weekday */}
        {hasTimeline && (
          <Panel index="04" title="Bookings by weekday" className="lg:col-span-6">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={series.week} barGap={4}>
                <CartesianGrid stroke={c.lineA(0.08)} vertical={false} />
                <XAxis dataKey="day" {...axis} />
                <YAxis {...axis} allowDecimals={false} width={30} />
                <Tooltip {...tooltip} />
                <Bar dataKey="car" name="Cars" fill={c.accent} radius={[6, 6, 0, 0]} />
                <Bar dataKey="bike" name="Bikes" fill={c.ink} radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-4 flex gap-5 text-xs text-muted">
              <span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-accent" /> Cars</span>
              <span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-ink" /> Bikes</span>
            </div>
          </Panel>
        )}

        {/* Fleet mix */}
        <Panel index={hasTimeline ? "05" : "02"} title="Fleet mix" className={hasTimeline ? "lg:col-span-6" : "lg:col-span-6"}>
          {totalFleet === 0 ? (
            <p className="py-16 text-center text-sm text-muted">No vehicles listed.</p>
          ) : (
            <div className="grid items-center gap-6 sm:grid-cols-2">
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={data.fleetMix} dataKey="count" nameKey="type" innerRadius={60} outerRadius={95} paddingAngle={2} stroke="none">
                    {data.fleetMix.map((_, i) => (
                      <Cell key={i} fill={pieColors[i % pieColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip {...tooltip} />
                </PieChart>
              </ResponsiveContainer>
              <ul className="space-y-3">
                {data.fleetMix.map((f, i) => (
                  <li key={f.type} className="flex items-center justify-between gap-3 text-sm">
                    <span className="flex items-center gap-2 capitalize">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ background: pieColors[i % pieColors.length] }} />
                      {f.type}
                    </span>
                    <span className="font-mono text-muted">
                      {f.count} · {Math.round((f.count / totalFleet) * 100)}%
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Panel>

        {/* Revenue by category */}
        <Panel index={hasTimeline ? "06" : "03"} title="Revenue by category" className="lg:col-span-6">
          {data.revenueByCategory.length === 0 ? (
            <p className="py-16 text-center text-sm text-muted">No paid bookings yet.</p>
          ) : (
            <ul className="divide-y divide-line/10">
              {data.revenueByCategory.map((r) => (
                <li key={r.category} className="flex items-baseline justify-between py-4">
                  <span className="display-tight text-2xl capitalize">{r.category}s</span>
                  <span className="text-right">
                    <span className="display block text-3xl">{compactInr(r.revenue)}</span>
                    <span className="text-xs text-muted">{r.count} paid booking{r.count === 1 ? "" : "s"}</span>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        {/* Top cities */}
        {hasTimeline && (
          <Panel index="07" title="Top cities" className="lg:col-span-6">
            {data.topCities.length === 0 ? (
              <p className="py-16 text-center text-sm text-muted">No bookings in this period.</p>
            ) : (
              <ul className="divide-y divide-line/10">
                {data.topCities.map((city, i) => (
                  <li key={city.city} className="grid grid-cols-12 items-baseline gap-3 py-3 text-sm">
                    <span className="col-span-1 font-mono text-accent">{String(i + 1).padStart(2, "0")}</span>
                    <span className="col-span-6">{city.city}</span>
                    <span className="col-span-2 text-right font-mono text-muted">{city.bookings}</span>
                    <span className="col-span-3 text-right font-mono">{compactInr(city.revenue)}</span>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        )}

        {/* User growth */}
        <Panel index={hasTimeline ? "08" : "04"} title="New sign-ups" className={hasTimeline ? "lg:col-span-12" : "lg:col-span-6"}>
          {series.months.every((m) => !m.newUsers) ? (
            <p className="py-16 text-center text-sm text-muted">No new users in this period.</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={series.months}>
                <CartesianGrid stroke={c.lineA(0.08)} vertical={false} />
                <XAxis dataKey="label" {...axis} />
                <YAxis {...axis} allowDecimals={false} width={30} />
                <Tooltip {...tooltip} formatter={(v) => [v, "New users"]} />
                <Bar dataKey="newUsers" fill={c.accent} radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Panel>
      </div>

      {/* Transactions */}
      {hasTimeline && (
        <section className="mt-16">
          <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="eyebrow mb-3 flex items-center gap-3"><span className="text-accent">(09)</span> Recent bookings</p>
              <h2 className="display-tight text-3xl">Transactions</h2>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <label className="flex items-center gap-2 rounded-full border border-line/15 px-4 py-2 focus-within:border-ink">
                <Search size={14} className="text-muted" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search"
                  className="w-36 bg-transparent text-sm outline-none placeholder:text-muted"
                />
              </label>
              <Segmented
                value={statusFilter}
                onChange={setStatusFilter}
                options={["all", "confirmed", "pending", "completed", "cancelled"].map((s) => ({ value: s, label: s[0].toUpperCase() + s.slice(1) }))}
              />
              <button onClick={exportCsv} className="chip">
                <Download size={13} /> CSV
              </button>
            </div>
          </div>

          {transactions.length === 0 ? (
            <Empty title="No bookings match." />
          ) : (
            <div className="overflow-x-auto rounded-[24px] border border-line/10" data-lenis-prevent>
              <table className="w-full min-w-[760px] text-sm">
                <thead>
                  <tr className="border-b border-line/10 text-left">
                    {["Booking", "Customer", "Vehicle", "City", "Date", "Amount", "Status"].map((h) => (
                      <th key={h} className={`eyebrow px-5 py-4 font-normal ${h === "Amount" ? "text-right" : ""}`}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((t) => (
                    <tr key={t.id} className="border-b border-line/10 last:border-0 hover:bg-raised/40">
                      <td className="px-5 py-4 font-mono text-xs">{t.id}</td>
                      <td className="px-5 py-4">{t.customer}</td>
                      <td className="px-5 py-4">{t.vehicle}</td>
                      <td className="px-5 py-4 text-muted">{t.city}</td>
                      <td className="px-5 py-4 text-muted">{new Date(t.date).toLocaleDateString("en-IN")}</td>
                      <td className="px-5 py-4 text-right font-mono">{inr(t.amount)}</td>
                      <td className="px-5 py-4">
                        <StatusPill status={t.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
