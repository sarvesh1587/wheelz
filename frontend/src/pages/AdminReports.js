import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import {
  ArrowUpIcon,
  ArrowDownIcon,
  ArrowPathIcon,
  ArrowDownTrayIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  CalendarDaysIcon,
  ChevronDownIcon,
  BoltIcon,
  TruckIcon,
  UsersIcon,
  BanknotesIcon,
  ChartBarIcon,
} from "@heroicons/react/24/outline";

// ─── Mock Data ───────────────────────────────────────────────────────────────

const MONTHLY_REVENUE = [
  { month: "Jan", revenue: 82000, bookings: 54 },
  { month: "Feb", revenue: 94000, bookings: 63 },
  { month: "Mar", revenue: 118000, bookings: 81 },
  { month: "Apr", revenue: 105000, bookings: 72 },
  { month: "May", revenue: 143000, bookings: 98 },
  { month: "Jun", revenue: 167000, bookings: 114 },
  { month: "Jul", revenue: 198000, bookings: 137 },
  { month: "Aug", revenue: 221000, bookings: 152 },
  { month: "Sep", revenue: 189000, bookings: 129 },
  { month: "Oct", revenue: 245000, bookings: 168 },
  { month: "Nov", revenue: 278000, bookings: 191 },
  { month: "Dec", revenue: 312000, bookings: 214 },
];

const WEEKLY_BOOKINGS = [
  { day: "Mon", cars: 24, bikes: 18, rideshare: 9 },
  { day: "Tue", cars: 18, bikes: 12, rideshare: 7 },
  { day: "Wed", cars: 22, bikes: 15, rideshare: 11 },
  { day: "Thu", cars: 29, bikes: 21, rideshare: 14 },
  { day: "Fri", cars: 38, bikes: 28, rideshare: 19 },
  { day: "Sat", cars: 52, bikes: 41, rideshare: 28 },
  { day: "Sun", cars: 45, bikes: 35, rideshare: 22 },
];

const VEHICLE_CATEGORIES = [
  { name: "Hatchback", value: 31, color: "#f59e0b" },
  { name: "SUV", value: 28, color: "#6366f1" },
  { name: "Sedan", value: 19, color: "#10b981" },
  { name: "Bike", value: 14, color: "#f43f5e" },
  { name: "Scooter", value: 8, color: "#8b5cf6" },
];

const USER_GROWTH = [
  { month: "Jan", users: 120 },
  { month: "Feb", users: 165 },
  { month: "Mar", users: 198 },
  { month: "Apr", users: 241 },
  { month: "May", users: 289 },
  { month: "Jun", users: 334 },
  { month: "Jul", users: 398 },
  { month: "Aug", users: 451 },
  { month: "Sep", users: 489 },
  { month: "Oct", users: 542 },
  { month: "Nov", users: 601 },
  { month: "Dec", users: 678 },
];

const TRANSACTIONS = [
  {
    id: "WLZ-20241214-A1B2",
    customer: "Arjun Sharma",
    vehicle: "Maruti Swift",
    amount: 4200,
    date: "14 Dec 2024",
    status: "completed",
    city: "Mumbai",
  },
  {
    id: "WLZ-20241214-C3D4",
    customer: "Priya Patel",
    vehicle: "Hyundai Creta",
    amount: 8750,
    date: "14 Dec 2024",
    status: "completed",
    city: "Bangalore",
  },
  {
    id: "WLZ-20241213-E5F6",
    customer: "Rahul Nair",
    vehicle: "Royal Enfield",
    amount: 2100,
    date: "13 Dec 2024",
    status: "pending",
    city: "Pune",
  },
  {
    id: "WLZ-20241213-G7H8",
    customer: "Sneha Joshi",
    vehicle: "Toyota Fortuner",
    amount: 12500,
    date: "13 Dec 2024",
    status: "completed",
    city: "Delhi",
  },
  {
    id: "WLZ-20241212-I9J0",
    customer: "Vikram Singh",
    vehicle: "Honda Activa",
    amount: 1400,
    date: "12 Dec 2024",
    status: "failed",
    city: "Goa",
  },
  {
    id: "WLZ-20241212-K1L2",
    customer: "Ananya Das",
    vehicle: "Maruti Swift",
    amount: 3600,
    date: "12 Dec 2024",
    status: "completed",
    city: "Hyderabad",
  },
  {
    id: "WLZ-20241211-M3N4",
    customer: "Kiran Kumar",
    vehicle: "Hyundai Creta",
    amount: 9200,
    date: "11 Dec 2024",
    status: "pending",
    city: "Chennai",
  },
  {
    id: "WLZ-20241211-O5P6",
    customer: "Divya Menon",
    vehicle: "Royal Enfield",
    amount: 2800,
    date: "11 Dec 2024",
    status: "completed",
    city: "Mumbai",
  },
  {
    id: "WLZ-20241210-Q7R8",
    customer: "Amit Verma",
    vehicle: "Toyota Fortuner",
    amount: 15000,
    date: "10 Dec 2024",
    status: "completed",
    city: "Delhi",
  },
  {
    id: "WLZ-20241210-S9T0",
    customer: "Meera Pillai",
    vehicle: "Honda Activa",
    amount: 1200,
    date: "10 Dec 2024",
    status: "failed",
    city: "Pune",
  },
  {
    id: "WLZ-20241209-U1V2",
    customer: "Suresh Rao",
    vehicle: "Maruti Swift",
    amount: 4800,
    date: "9 Dec 2024",
    status: "completed",
    city: "Bangalore",
  },
  {
    id: "WLZ-20241209-W3X4",
    customer: "Pooja Iyer",
    vehicle: "Hyundai Creta",
    amount: 7600,
    date: "9 Dec 2024",
    status: "completed",
    city: "Goa",
  },
];

const TOP_VEHICLES = [
  { name: "Hyundai Creta", bookings: 142, revenue: 892000, pct: 100 },
  { name: "Maruti Swift", bookings: 128, revenue: 614000, pct: 89 },
  { name: "Toyota Fortuner", bookings: 89, revenue: 1245000, pct: 63 },
  { name: "Royal Enfield", bookings: 76, revenue: 289000, pct: 54 },
  { name: "Honda Activa", bookings: 61, revenue: 97000, pct: 43 },
];

const TOP_USERS = [
  { name: "Amit Verma", trips: 24, spent: 187000, city: "Delhi" },
  { name: "Priya Patel", trips: 19, spent: 143000, city: "Bangalore" },
  { name: "Arjun Sharma", trips: 17, spent: 98000, city: "Mumbai" },
  { name: "Sneha Joshi", trips: 14, spent: 76000, city: "Pune" },
  { name: "Vikram Singh", trips: 11, spent: 54000, city: "Goa" },
];

const SPARKLINES = {
  revenue: [52, 68, 71, 65, 89, 94, 88, 102, 98, 114, 121, 134],
  bookings: [34, 42, 51, 47, 63, 71, 68, 82, 77, 91, 98, 107],
  vehicles: [28, 31, 33, 35, 38, 41, 43, 46, 48, 51, 53, 56],
  users: [120, 165, 198, 241, 289, 334, 398, 451, 489, 542, 601, 678],
};

const DATE_RANGES = [
  "Last 7 days",
  "Last 30 days",
  "Last 3 months",
  "This year",
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

const fmt = (n) =>
  n >= 100000
    ? `₹${(n / 100000).toFixed(1)}L`
    : n >= 1000
      ? `₹${(n / 1000).toFixed(0)}K`
      : `₹${n}`;

const fmtFull = (n) => `₹${n.toLocaleString("en-IN")}`;

const stagger = {
  container: { hidden: {}, show: { transition: { staggerChildren: 0.07 } } },
  item: {
    hidden: { opacity: 0, y: 18 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
  },
};

// ─── Sparkline ───────────────────────────────────────────────────────────────

function Sparkline({ data, color = "#f59e0b" }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const w = 80,
    h = 28;
  const pts = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * w;
      const y = h - ((v - min) / (max - min || 1)) * h;
      return `${x},${y}`;
    })
    .join(" ");
  const area = `${pts} ${w},${h} 0,${h}`;
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      <defs>
        <linearGradient
          id={`sg-${color.replace("#", "")}`}
          x1="0"
          y1="0"
          x2="0"
          y2="1"
        >
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={area} fill={`url(#sg-${color.replace("#", "")})`} />
      <polyline
        points={pts}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// ─── Custom Tooltip ───────────────────────────────────────────────────────────

function GlassTooltip({ active, payload, label, prefix = "₹" }) {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        background: "rgba(15,23,42,0.92)",
        border: "1px solid rgba(245,158,11,0.2)",
        borderRadius: 12,
        padding: "10px 14px",
        backdropFilter: "blur(12px)",
      }}
    >
      <p style={{ color: "#94a3b8", fontSize: 11, marginBottom: 4 }}>{label}</p>
      {payload.map((p, i) => (
        <p
          key={i}
          style={{
            color: p.color || "#f59e0b",
            fontSize: 13,
            fontWeight: 600,
            margin: "2px 0",
          }}
        >
          {p.name}: {prefix === "₹" ? fmtFull(p.value) : p.value}
        </p>
      ))}
    </div>
  );
}

// ─── Status Badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }) {
  const map = {
    completed: {
      bg: "rgba(16,185,129,0.12)",
      color: "#10b981",
      dot: "#10b981",
      label: "Completed",
    },
    pending: {
      bg: "rgba(245,158,11,0.12)",
      color: "#f59e0b",
      dot: "#f59e0b",
      label: "Pending",
    },
    failed: {
      bg: "rgba(239,68,68,0.12)",
      color: "#ef4444",
      dot: "#ef4444",
      label: "Failed",
    },
  };
  const s = map[status] || map.pending;
  return (
    <span
      style={{
        background: s.bg,
        color: s.color,
        border: `1px solid ${s.color}33`,
        borderRadius: 20,
        padding: "2px 10px",
        fontSize: 11,
        fontWeight: 600,
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
      }}
    >
      <span
        style={{
          width: 5,
          height: 5,
          borderRadius: "50%",
          background: s.dot,
          display: "inline-block",
        }}
      />
      {s.label}
    </span>
  );
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────

function KPICard({
  label,
  value,
  sub,
  growth,
  sparkData,
  icon: Icon,
  accent = "#f59e0b",
}) {
  const up = growth >= 0;
  return (
    <motion.div
      variants={stagger.item}
      style={{
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: 16,
        padding: "20px 22px",
        backdropFilter: "blur(8px)",
        position: "relative",
        overflow: "hidden",
      }}
      whileHover={{
        borderColor: `${accent}44`,
        boxShadow: `0 0 24px ${accent}18`,
      }}
      transition={{ duration: 0.2 }}
    >
      {/* Ambient glow */}
      <div
        style={{
          position: "absolute",
          top: -40,
          right: -40,
          width: 120,
          height: 120,
          borderRadius: "50%",
          background: `${accent}0A`,
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 14,
        }}
      >
        <div
          style={{ background: `${accent}18`, borderRadius: 10, padding: 8 }}
        >
          <Icon style={{ width: 18, height: 18, color: accent }} />
        </div>
        <Sparkline data={sparkData} color={accent} />
      </div>
      <p
        style={{
          color: "#94a3b8",
          fontSize: 12,
          marginBottom: 4,
          fontWeight: 500,
          letterSpacing: "0.04em",
          textTransform: "uppercase",
        }}
      >
        {label}
      </p>
      <p
        style={{
          color: "#f1f5f9",
          fontSize: 26,
          fontWeight: 700,
          letterSpacing: "-0.02em",
          marginBottom: 6,
        }}
      >
        {value}
      </p>
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <span
          style={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            fontSize: 12,
            fontWeight: 600,
            color: up ? "#10b981" : "#ef4444",
          }}
        >
          {up ? (
            <ArrowUpIcon style={{ width: 11, height: 11 }} />
          ) : (
            <ArrowDownIcon style={{ width: 11, height: 11 }} />
          )}
          {Math.abs(growth)}%
        </span>
        <span style={{ color: "#475569", fontSize: 11 }}>{sub}</span>
      </div>
    </motion.div>
  );
}

// ─── Section Header ───────────────────────────────────────────────────────────

function SectionHeader({ title, sub }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <h3
        style={{ color: "#f1f5f9", fontSize: 15, fontWeight: 600, margin: 0 }}
      >
        {title}
      </h3>
      {sub && (
        <p style={{ color: "#475569", fontSize: 12, margin: "3px 0 0" }}>
          {sub}
        </p>
      )}
    </div>
  );
}

// ─── Chart Card ───────────────────────────────────────────────────────────────

function ChartCard({ children, style = {} }) {
  return (
    <div
      style={{
        background: "rgba(255,255,255,0.02)",
        border: "1px solid rgba(255,255,255,0.06)",
        borderRadius: 16,
        padding: "20px 18px",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function AdminReports() {
  const [dateRange, setDateRange] = useState("Last 30 days");
  const [showDateMenu, setShowDateMenu] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [refreshing, setRefreshing] = useState(false);
  const dateMenuRef = useRef(null);

  useEffect(() => {
    setTimeout(() => setLoading(false), 900);
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (dateMenuRef.current && !dateMenuRef.current.contains(e.target))
        setShowDateMenu(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      setLastRefresh(new Date());
    }, 1200);
  };

  const handleExportCSV = () => {
    const rows = [
      ["ID", "Customer", "Vehicle", "Amount", "Date", "Status", "City"],
      ...TRANSACTIONS.map((t) => [
        t.id,
        t.customer,
        t.vehicle,
        t.amount,
        t.date,
        t.status,
        t.city,
      ]),
    ];
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "wheelz-report.csv";
    a.click();
  };

  const filtered = TRANSACTIONS.filter((t) => {
    const matchSearch =
      t.customer.toLowerCase().includes(search.toLowerCase()) ||
      t.vehicle.toLowerCase().includes(search.toLowerCase()) ||
      t.id.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || t.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalRevenue = MONTHLY_REVENUE.reduce((a, m) => a + m.revenue, 0);
  const totalBookings = MONTHLY_REVENUE.reduce((a, m) => a + m.bookings, 0);

  // Skeleton
  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#0B1120",
          padding: "32px 24px",
        }}
      >
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <div
            style={{
              height: 32,
              width: 200,
              background: "rgba(255,255,255,0.06)",
              borderRadius: 8,
              marginBottom: 32,
              animation: "pulse 1.5s infinite",
            }}
          />
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: 16,
              marginBottom: 24,
            }}
          >
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                style={{
                  height: 130,
                  background: "rgba(255,255,255,0.04)",
                  borderRadius: 16,
                  animation: "pulse 1.5s infinite",
                }}
              />
            ))}
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 16,
              marginBottom: 16,
            }}
          >
            {[1, 2].map((i) => (
              <div
                key={i}
                style={{
                  height: 240,
                  background: "rgba(255,255,255,0.04)",
                  borderRadius: 16,
                  animation: "pulse 1.5s infinite",
                }}
              />
            ))}
          </div>
          <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }`}</style>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0B1120",
        padding: "32px 16px",
        fontFamily: "'Inter', system-ui, sans-serif",
      }}
    >
      <style>{`
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(245,158,11,0.3); border-radius: 4px; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 900px) {
          .kpi-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .chart-grid { grid-template-columns: 1fr !important; }
          .bottom-grid { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 500px) {
          .kpi-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      <div style={{ maxWidth: 1280, margin: "0 auto" }}>
        {/* ── Header ── */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
            marginBottom: 32,
          }}
        >
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: 4,
              }}
            >
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: "#10b981",
                  boxShadow: "0 0 8px #10b981",
                }}
              />
              <span
                style={{
                  color: "#10b981",
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                }}
              >
                Live
              </span>
              <span style={{ color: "#334155", fontSize: 11 }}>
                Updated {lastRefresh.toLocaleTimeString()}
              </span>
            </div>
            <h1
              style={{
                color: "#f1f5f9",
                fontSize: 24,
                fontWeight: 700,
                margin: 0,
                letterSpacing: "-0.02em",
              }}
            >
              Platform Analytics
            </h1>
            <p style={{ color: "#475569", fontSize: 13, margin: "4px 0 0" }}>
              Wheelz · India Operations
            </p>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              flexWrap: "wrap",
            }}
          >
            {/* Date range */}
            <div ref={dateMenuRef} style={{ position: "relative" }}>
              <button
                onClick={() => setShowDateMenu((o) => !o)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 7,
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 10,
                  padding: "8px 14px",
                  color: "#cbd5e1",
                  fontSize: 13,
                  cursor: "pointer",
                }}
              >
                <CalendarDaysIcon
                  style={{ width: 15, height: 15, color: "#f59e0b" }}
                />
                {dateRange}
                <ChevronDownIcon
                  style={{ width: 13, height: 13, opacity: 0.5 }}
                />
              </button>
              <AnimatePresence>
                {showDateMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 6 }}
                    style={{
                      position: "absolute",
                      top: "calc(100% + 6px)",
                      right: 0,
                      background: "#0f172a",
                      border: "1px solid rgba(255,255,255,0.08)",
                      borderRadius: 10,
                      padding: 6,
                      zIndex: 50,
                      minWidth: 160,
                    }}
                  >
                    {DATE_RANGES.map((r) => (
                      <button
                        key={r}
                        onClick={() => {
                          setDateRange(r);
                          setShowDateMenu(false);
                        }}
                        style={{
                          display: "block",
                          width: "100%",
                          textAlign: "left",
                          padding: "8px 12px",
                          borderRadius: 7,
                          fontSize: 13,
                          cursor: "pointer",
                          background:
                            dateRange === r
                              ? "rgba(245,158,11,0.12)"
                              : "transparent",
                          color: dateRange === r ? "#f59e0b" : "#94a3b8",
                          border: "none",
                        }}
                      >
                        {r}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Refresh */}
            <button
              onClick={handleRefresh}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 10,
                padding: "8px 12px",
                color: "#94a3b8",
                fontSize: 13,
                cursor: "pointer",
              }}
            >
              <ArrowPathIcon
                style={{
                  width: 14,
                  height: 14,
                  animation: refreshing ? "spin 0.8s linear infinite" : "none",
                }}
              />
              Refresh
            </button>

            {/* Export CSV */}
            <button
              onClick={handleExportCSV}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                background: "rgba(245,158,11,0.1)",
                border: "1px solid rgba(245,158,11,0.25)",
                borderRadius: 10,
                padding: "8px 14px",
                color: "#f59e0b",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              <ArrowDownTrayIcon style={{ width: 14, height: 14 }} />
              Export CSV
            </button>
          </div>
        </motion.div>

        {/* ── KPI Cards ── */}
        <motion.div
          className="kpi-grid"
          variants={stagger.container}
          initial="hidden"
          animate="show"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 14,
            marginBottom: 20,
          }}
        >
          <KPICard
            label="Total Revenue"
            value={fmt(totalRevenue)}
            sub="vs last year"
            growth={28.4}
            sparkData={SPARKLINES.revenue}
            icon={BanknotesIcon}
            accent="#f59e0b"
          />
          <KPICard
            label="Total Bookings"
            value={totalBookings.toLocaleString()}
            sub="vs last year"
            growth={19.2}
            sparkData={SPARKLINES.bookings}
            icon={ChartBarIcon}
            accent="#6366f1"
          />
          <KPICard
            label="Active Vehicles"
            value="312"
            sub="across 8 cities"
            growth={12.1}
            sparkData={SPARKLINES.vehicles}
            icon={TruckIcon}
            accent="#10b981"
          />
          <KPICard
            label="Active Users"
            value="678"
            sub="registered this year"
            growth={-3.8}
            sparkData={SPARKLINES.users}
            icon={UsersIcon}
            accent="#f43f5e"
          />
        </motion.div>

        {/* ── Charts Row 1 ── */}
        <motion.div
          className="chart-grid"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 14,
            marginBottom: 14,
          }}
        >
          {/* Revenue Area Chart */}
          <ChartCard>
            <SectionHeader
              title="Revenue Overview"
              sub="Monthly platform earnings (INR)"
            />
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart
                data={MONTHLY_REVENUE}
                margin={{ top: 5, right: 5, bottom: 0, left: 0 }}
              >
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255,255,255,0.04)"
                  vertical={false}
                />
                <XAxis
                  dataKey="month"
                  tick={{ fill: "#475569", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tickFormatter={(v) => fmt(v)}
                  tick={{ fill: "#475569", fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                  width={48}
                />
                <Tooltip content={<GlassTooltip prefix="₹" />} />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  name="Revenue"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  fill="url(#revGrad)"
                  dot={false}
                  activeDot={{ r: 4, fill: "#f59e0b", strokeWidth: 0 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Booking Trends Bar Chart */}
          <ChartCard>
            <SectionHeader
              title="Booking Trends"
              sub="Daily breakdown by vehicle type"
            />
            <ResponsiveContainer width="100%" height={200}>
              <BarChart
                data={WEEKLY_BOOKINGS}
                margin={{ top: 5, right: 5, bottom: 0, left: 0 }}
                barSize={8}
                barGap={3}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255,255,255,0.04)"
                  vertical={false}
                />
                <XAxis
                  dataKey="day"
                  tick={{ fill: "#475569", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: "#475569", fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                  width={28}
                />
                <Tooltip content={<GlassTooltip prefix="" />} />
                <Bar
                  dataKey="cars"
                  name="Cars"
                  fill="#f59e0b"
                  radius={[3, 3, 0, 0]}
                />
                <Bar
                  dataKey="bikes"
                  name="Bikes"
                  fill="#6366f1"
                  radius={[3, 3, 0, 0]}
                />
                <Bar
                  dataKey="rideshare"
                  name="Rideshare"
                  fill="#10b981"
                  radius={[3, 3, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
            <div style={{ display: "flex", gap: 14, marginTop: 10 }}>
              {[
                ["Cars", "#f59e0b"],
                ["Bikes", "#6366f1"],
                ["Rideshare", "#10b981"],
              ].map(([l, c]) => (
                <div
                  key={l}
                  style={{ display: "flex", alignItems: "center", gap: 5 }}
                >
                  <div
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: 2,
                      background: c,
                    }}
                  />
                  <span style={{ color: "#475569", fontSize: 11 }}>{l}</span>
                </div>
              ))}
            </div>
          </ChartCard>
        </motion.div>

        {/* ── Charts Row 2 ── */}
        <motion.div
          className="chart-grid"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 14,
            marginBottom: 20,
          }}
        >
          {/* Donut Chart */}
          <ChartCard>
            <SectionHeader
              title="Vehicle Distribution"
              sub="Bookings by category"
            />
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <ResponsiveContainer width={160} height={160}>
                <PieChart>
                  <Pie
                    data={VEHICLE_CATEGORIES}
                    cx="50%"
                    cy="50%"
                    innerRadius={48}
                    outerRadius={72}
                    paddingAngle={3}
                    dataKey="value"
                    stroke="none"
                  >
                    {VEHICLE_CATEGORIES.map((e, i) => (
                      <Cell key={i} fill={e.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<GlassTooltip prefix="" />} />
                </PieChart>
              </ResponsiveContainer>
              <div
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                }}
              >
                {VEHICLE_CATEGORIES.map((cat) => (
                  <div
                    key={cat.name}
                    style={{ display: "flex", alignItems: "center", gap: 8 }}
                  >
                    <div
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        background: cat.color,
                        flexShrink: 0,
                      }}
                    />
                    <span style={{ color: "#94a3b8", fontSize: 12, flex: 1 }}>
                      {cat.name}
                    </span>
                    <span
                      style={{
                        color: "#f1f5f9",
                        fontSize: 12,
                        fontWeight: 600,
                      }}
                    >
                      {cat.value}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </ChartCard>

          {/* User Growth Line Chart */}
          <ChartCard>
            <SectionHeader
              title="User Growth"
              sub="New registrations per month"
            />
            <ResponsiveContainer width="100%" height={180}>
              <LineChart
                data={USER_GROWTH}
                margin={{ top: 5, right: 5, bottom: 0, left: 0 }}
              >
                <defs>
                  <linearGradient id="userGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255,255,255,0.04)"
                  vertical={false}
                />
                <XAxis
                  dataKey="month"
                  tick={{ fill: "#475569", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: "#475569", fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                  width={36}
                />
                <Tooltip content={<GlassTooltip prefix="" />} />
                <Line
                  type="monotone"
                  dataKey="users"
                  name="Users"
                  stroke="#6366f1"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4, fill: "#6366f1", strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>
        </motion.div>

        {/* ── Transactions Table ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          style={{ marginBottom: 20 }}
        >
          <ChartCard>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 12,
                marginBottom: 18,
              }}
            >
              <SectionHeader
                title="Recent Transactions"
                sub={`${filtered.length} of ${TRANSACTIONS.length} transactions`}
              />
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                {/* Search */}
                <div style={{ position: "relative" }}>
                  <MagnifyingGlassIcon
                    style={{
                      position: "absolute",
                      left: 10,
                      top: "50%",
                      transform: "translateY(-50%)",
                      width: 14,
                      height: 14,
                      color: "#475569",
                    }}
                  />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search..."
                    style={{
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      borderRadius: 8,
                      padding: "7px 10px 7px 30px",
                      color: "#cbd5e1",
                      fontSize: 12,
                      outline: "none",
                      width: 180,
                    }}
                  />
                </div>
                {/* Status filter */}
                <div style={{ display: "flex", gap: 4 }}>
                  {["all", "completed", "pending", "failed"].map((s) => (
                    <button
                      key={s}
                      onClick={() => setStatusFilter(s)}
                      style={{
                        padding: "6px 10px",
                        borderRadius: 8,
                        fontSize: 11,
                        fontWeight: 600,
                        cursor: "pointer",
                        border: "1px solid",
                        textTransform: "capitalize",
                        background:
                          statusFilter === s
                            ? "rgba(245,158,11,0.12)"
                            : "transparent",
                        borderColor:
                          statusFilter === s
                            ? "rgba(245,158,11,0.3)"
                            : "rgba(255,255,255,0.07)",
                        color: statusFilter === s ? "#f59e0b" : "#475569",
                      }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div style={{ overflowX: "auto" }}>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontSize: 13,
                }}
              >
                <thead>
                  <tr
                    style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
                  >
                    {[
                      "Transaction ID",
                      "Customer",
                      "Vehicle",
                      "Amount",
                      "Date",
                      "City",
                      "Status",
                    ].map((h) => (
                      <th
                        key={h}
                        style={{
                          textAlign: "left",
                          padding: "8px 12px",
                          color: "#334155",
                          fontSize: 11,
                          fontWeight: 600,
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td
                        colSpan={7}
                        style={{
                          textAlign: "center",
                          padding: 40,
                          color: "#334155",
                          fontSize: 13,
                        }}
                      >
                        No transactions found
                      </td>
                    </tr>
                  ) : (
                    filtered.map((t, i) => (
                      <tr
                        key={t.id}
                        style={{
                          borderBottom: "1px solid rgba(255,255,255,0.04)",
                          transition: "background 0.15s",
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.background =
                            "rgba(255,255,255,0.025)")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.background = "transparent")
                        }
                      >
                        <td
                          style={{
                            padding: "11px 12px",
                            color: "#64748b",
                            fontFamily: "monospace",
                            fontSize: 11,
                            whiteSpace: "nowrap",
                          }}
                        >
                          {t.id}
                        </td>
                        <td
                          style={{
                            padding: "11px 12px",
                            color: "#e2e8f0",
                            fontWeight: 500,
                          }}
                        >
                          {t.customer}
                        </td>
                        <td style={{ padding: "11px 12px", color: "#94a3b8" }}>
                          {t.vehicle}
                        </td>
                        <td
                          style={{
                            padding: "11px 12px",
                            color: "#f59e0b",
                            fontWeight: 600,
                          }}
                        >
                          {fmtFull(t.amount)}
                        </td>
                        <td
                          style={{
                            padding: "11px 12px",
                            color: "#64748b",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {t.date}
                        </td>
                        <td style={{ padding: "11px 12px", color: "#64748b" }}>
                          {t.city}
                        </td>
                        <td style={{ padding: "11px 12px" }}>
                          <StatusBadge status={t.status} />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </ChartCard>
        </motion.div>

        {/* ── Top Vehicles + Top Users ── */}
        <motion.div
          className="bottom-grid"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 14,
            marginBottom: 20,
          }}
        >
          {/* Top Vehicles */}
          <ChartCard>
            <SectionHeader title="Top Vehicles" sub="By total bookings" />
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {TOP_VEHICLES.map((v, i) => (
                <div key={v.name}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: 6,
                    }}
                  >
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 8 }}
                    >
                      <span
                        style={{
                          color: "#334155",
                          fontSize: 11,
                          fontWeight: 700,
                          width: 16,
                        }}
                      >
                        #{i + 1}
                      </span>
                      <span
                        style={{
                          color: "#e2e8f0",
                          fontSize: 13,
                          fontWeight: 500,
                        }}
                      >
                        {v.name}
                      </span>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <span
                        style={{
                          color: "#f59e0b",
                          fontSize: 12,
                          fontWeight: 600,
                        }}
                      >
                        {fmt(v.revenue)}
                      </span>
                      <span
                        style={{
                          color: "#334155",
                          fontSize: 11,
                          marginLeft: 6,
                        }}
                      >
                        {v.bookings} trips
                      </span>
                    </div>
                  </div>
                  <div
                    style={{
                      height: 4,
                      background: "rgba(255,255,255,0.06)",
                      borderRadius: 4,
                      overflow: "hidden",
                    }}
                  >
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${v.pct}%` }}
                      transition={{ delay: 0.7 + i * 0.08, duration: 0.5 }}
                      style={{
                        height: "100%",
                        background: `linear-gradient(90deg, #f59e0b, #fbbf24)`,
                        borderRadius: 4,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </ChartCard>

          {/* Top Users */}
          <ChartCard>
            <SectionHeader title="Top Customers" sub="By total spend" />
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {TOP_USERS.map((u, i) => (
                <div key={u.name}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: 6,
                    }}
                  >
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 8 }}
                    >
                      <div
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: "50%",
                          background: `rgba(${[245, 99, 99, 16][i % 4]},158,11,0.15)`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 11,
                          fontWeight: 700,
                          color: "#f59e0b",
                        }}
                      >
                        {u.name[0]}
                      </div>
                      <div>
                        <p
                          style={{
                            color: "#e2e8f0",
                            fontSize: 12,
                            fontWeight: 500,
                            margin: 0,
                          }}
                        >
                          {u.name}
                        </p>
                        <p
                          style={{ color: "#334155", fontSize: 10, margin: 0 }}
                        >
                          {u.city} · {u.trips} trips
                        </p>
                      </div>
                    </div>
                    <span
                      style={{
                        color: "#10b981",
                        fontSize: 13,
                        fontWeight: 600,
                      }}
                    >
                      {fmt(u.spent)}
                    </span>
                  </div>
                  <div
                    style={{
                      height: 3,
                      background: "rgba(255,255,255,0.05)",
                      borderRadius: 4,
                      overflow: "hidden",
                    }}
                  >
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{
                        width: `${(u.spent / TOP_USERS[0].spent) * 100}%`,
                      }}
                      transition={{ delay: 0.7 + i * 0.08, duration: 0.5 }}
                      style={{
                        height: "100%",
                        background: "linear-gradient(90deg,#10b981,#34d399)",
                        borderRadius: 4,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </ChartCard>
        </motion.div>

        {/* ── Footer ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 8,
            padding: "16px 0",
            borderTop: "1px solid rgba(255,255,255,0.05)",
          }}
        >
          <span style={{ color: "#1e293b", fontSize: 12 }}>
            Wheelz Admin · India Operations Dashboard
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <BoltIcon style={{ width: 12, height: 12, color: "#f59e0b" }} />
            <span style={{ color: "#1e293b", fontSize: 11 }}>
              Auto-refreshes every 5 minutes
            </span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
