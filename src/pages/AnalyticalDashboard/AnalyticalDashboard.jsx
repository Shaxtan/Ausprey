import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
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
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

// Layout — same as DistanceReport
import DashboardLayout from "../../../src/assets/components/examples/LayoutContainers/DashboardLayout";
import DashboardNavbarWithAccountContext from "assets/components/examples/Navbars/DashboardNavbar/DashboardNavbarWithAccountContext";

// MUI
import MDBox from "../../../src/assets/components/MDBox";
import MDTypography from "../../../src/assets/components/MDTypography";
import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";

// ─── MOCK DATA ────────────────────────────────────────────────────────────────

const FLEET_SUMMARY = { active: 34, idle: 8, offline: 5, total: 47 };

const DISTANCE_TREND = [
  { day: "Mon", km: 1240 },
  { day: "Tue", km: 1580 },
  { day: "Wed", km: 1320 },
  { day: "Thu", km: 1750 },
  { day: "Fri", km: 1900 },
  { day: "Sat", km: 980 },
  { day: "Sun", km: 620 },
];

const ENGINE_DATA = [
  { name: "Engine ON", value: 62, color: "#22d3ee" },
  { name: "Idle", value: 21, color: "#f59e0b" },
  { name: "Engine OFF", value: 17, color: "#475569" },
];

const IDLE_VS_RUNNING = [
  { vehicle: "TN01", running: 8.2, idle: 1.8 },
  { vehicle: "TN02", running: 6.5, idle: 3.5 },
  { vehicle: "TN03", running: 9.1, idle: 0.9 },
  { vehicle: "TN04", running: 5.0, idle: 5.0 },
  { vehicle: "TN05", running: 7.8, idle: 2.2 },
  { vehicle: "TN06", running: 4.2, idle: 5.8 },
];

const OVERSPEED_ALERTS = [
  { time: "08:14", vehicle: "MH12-AB-1234", speed: 92, limit: 80, zone: "Highway NH-4" },
  { time: "09:37", vehicle: "TN01-CD-5678", speed: 76, limit: 60, zone: "Urban Zone B" },
  { time: "11:02", vehicle: "KA05-EF-9012", speed: 110, limit: 80, zone: "Expressway" },
  { time: "12:48", vehicle: "MH12-GH-3456", speed: 68, limit: 60, zone: "School Zone" },
  { time: "14:15", vehicle: "DL01-IJ-7890", speed: 95, limit: 80, zone: "Highway NH-8" },
];

const LIVE_EVENTS = [
  { id: 1, type: "overspeed", msg: "MH12-AB-1234 exceeded 90 km/h", time: "2s ago", severity: "high" },
  { id: 2, type: "geofence", msg: "TN01-CD-5678 exited Zone A", time: "14s ago", severity: "medium" },
  { id: 3, type: "ignition", msg: "KA05-EF-9012 ignition ON", time: "31s ago", severity: "low" },
  { id: 4, type: "ignition", msg: "MH12-GH-3456 ignition OFF", time: "1m ago", severity: "low" },
  { id: 5, type: "geofence", msg: "DL01-IJ-7890 entered Zone C", time: "2m ago", severity: "medium" },
  { id: 6, type: "overspeed", msg: "UP32-KL-1111 exceeded 85 km/h", time: "3m ago", severity: "high" },
];

const DRIVER_SCORES = [
  { name: "Ramesh K.", score: 94, trips: 128, harsh: 2, overspeed: 1, rank: 1 },
  { name: "Suresh M.", score: 88, trips: 115, harsh: 5, overspeed: 3, rank: 2 },
  { name: "Dinesh P.", score: 82, trips: 97, harsh: 8, overspeed: 4, rank: 3 },
  { name: "Mahesh T.", score: 76, trips: 143, harsh: 12, overspeed: 7, rank: 4 },
  { name: "Rajesh V.", score: 71, trips: 89, harsh: 15, overspeed: 9, rank: 5 },
  { name: "Ganesh R.", score: 65, trips: 104, harsh: 18, overspeed: 12, rank: 6 },
];

const DRIVER_BEHAVIOR_RADAR = [
  { metric: "Braking", Ramesh: 95, Suresh: 78, Dinesh: 65 },
  { metric: "Accel.", Ramesh: 92, Suresh: 80, Dinesh: 70 },
  { metric: "Speed", Ramesh: 96, Suresh: 85, Dinesh: 60 },
  { metric: "Routes", Ramesh: 90, Suresh: 88, Dinesh: 75 },
  { metric: "Idle", Ramesh: 88, Suresh: 82, Dinesh: 72 },
];

const MAINTENANCE_VEHICLES = [
  { id: "MH12-AB-1234", hours: 4820, nextService: 180, health: 88, status: "Good" },
  { id: "TN01-CD-5678", hours: 5100, nextService: 40, health: 62, status: "Due Soon" },
  { id: "KA05-EF-9012", hours: 3200, nextService: 800, health: 95, status: "Good" },
  { id: "MH12-GH-3456", hours: 6300, nextService: -20, health: 38, status: "Overdue" },
  { id: "DL01-IJ-7890", hours: 4100, nextService: 300, health: 91, status: "Good" },
];

const UTILIZATION_DATA = [
  { month: "Nov", util: 71 },
  { month: "Dec", util: 65 },
  { month: "Jan", util: 78 },
  { month: "Feb", util: 82 },
  { month: "Mar", util: 74 },
  { month: "Apr", util: 86 },
];

const COST_PER_KM = [
  { vehicle: "MH12-AB", cost: 4.2 },
  { vehicle: "TN01-CD", cost: 5.8 },
  { vehicle: "KA05-EF", cost: 3.9 },
  { vehicle: "MH12-GH", cost: 6.4 },
  { vehicle: "DL01-IJ", cost: 4.7 },
  { vehicle: "UP32-KL", cost: 5.1 },
];

const ZONE_DENSITY = [
  { zone: "Zone A", vehicles: 14, color: "#0EA5E9" },
  { zone: "Zone B", vehicles: 9, color: "#8B5CF6" },
  { zone: "Zone C", vehicles: 11, color: "#10B981" },
  { zone: "Zone D", vehicles: 6, color: "#F59E0B" },
  { zone: "Zone E", vehicles: 7, color: "#F87171" },
];

const BREAKDOWN_TREND = [
  { month: "Nov", incidents: 3 },
  { month: "Dec", incidents: 5 },
  { month: "Jan", incidents: 2 },
  { month: "Feb", incidents: 4 },
  { month: "Mar", incidents: 1 },
  { month: "Apr", incidents: 3 },
];

const PREDICTIVE_RISK = [
  { vehicle: "MH12-GH-3456", risk: 87, reason: "Overdue service + high engine hours" },
  { vehicle: "TN01-CD-5678", risk: 64, reason: "Service due in 40 hrs" },
  { vehicle: "UP32-KL-1111", risk: 51, reason: "Increasing idle time anomaly" },
  { vehicle: "MH12-AB-1234", risk: 23, reason: "Normal wear patterns" },
];

// ─── SHARED STYLES ────────────────────────────────────────────────────────────

const TOOLTIP_STYLE = {
  contentStyle: {
    borderRadius: 10,
    border: "none",
    boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
    fontSize: 11,
  },
  cursor: { fill: "#f3f4f6" },
};

const EventTypeColors = {
  overspeed: "#EF4444",
  geofence: "#F59E0B",
  ignition: "#0EA5E9",
};

const TABLE_TH = {
  textAlign: "left",
  padding: "8px 12px",
  fontSize: 10,
  fontWeight: 700,
  letterSpacing: "0.07em",
  textTransform: "uppercase",
  color: "#9CA3AF",
  borderBottom: "1px solid #F3F4F6",
};

const TABLE_TD = {
  padding: "10px 12px",
  fontSize: 12,
  color: "#374151",
  borderBottom: "1px solid #F9FAFB",
  verticalAlign: "middle",
};

// ─── SMALL HELPER COMPONENTS ─────────────────────────────────────────────────

function SectionLabel({ children }) {
  return (
    <MDTypography
      variant="caption"
      sx={{
        display: "block",
        mb: 1.5,
        pl: 0.5,
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: "0.12em",
        textTransform: "uppercase",
        color: "#9CA3AF",
      }}
    >
      {children}
    </MDTypography>
  );
}

function KpiCard({ label, value, color, badge }) {
  return (
    <Card sx={{ borderRadius: 3, border: "1px solid #E5E7EB", height: "100%" }}>
      <MDBox p={2.5}>
        <MDTypography
          variant="caption"
          sx={{
            fontSize: 11,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            color: "#9CA3AF",
          }}
        >
          {label}
        </MDTypography>
        <MDTypography
          variant="h4"
          fontWeight="bold"
          sx={{ color, mt: 0.5, lineHeight: 1.1 }}
        >
          {value}
        </MDTypography>
        {badge && (
          <MDBox mt={1}>
            <span
              style={{
                fontSize: 11,
                fontWeight: 600,
                padding: "2px 10px",
                borderRadius: 20,
                background: `${color}18`,
                color,
                border: `1px solid ${color}33`,
              }}
            >
              {badge}
            </span>
          </MDBox>
        )}
        <MDBox
          mt={1.5}
          sx={{
            width: "40%",
            height: 3,
            borderRadius: 999,
            background: color,
            opacity: 0.5,
          }}
        />
      </MDBox>
    </Card>
  );
}

function ChartCard({ title, children, height = 260 }) {
  return (
    <Card sx={{ borderRadius: 3, border: "1px solid #E5E7EB", height: "100%" }}>
      <MDBox pt={2.5} px={3} pb={0}>
        <MDTypography variant="h6" fontWeight="medium" sx={{ fontSize: 13, color: "#374151" }}>
          {title}
        </MDTypography>
      </MDBox>
      <MDBox p={2.5} sx={{ height }}>
        {children}
      </MDBox>
    </Card>
  );
}

function StatusPill({ status }) {
  const map = {
    Good: { bg: "#ECFDF5", color: "#16A34A", border: "#BBF7D0" },
    "Due Soon": { bg: "#FFFBEB", color: "#D97706", border: "#FDE68A" },
    Overdue: { bg: "#FEF2F2", color: "#DC2626", border: "#FECACA" },
  };
  const s = map[status] || map.Good;

  return (
    <span
      style={{
        background: s.bg,
        color: s.color,
        border: `1px solid ${s.border}`,
        borderRadius: 20,
        padding: "2px 10px",
        fontSize: 11,
        fontWeight: 600,
      }}
    >
      {status}
    </span>
  );
}

function ScoreBadge({ score }) {
  const color = score >= 90 ? "#16A34A" : score >= 75 ? "#D97706" : "#DC2626";
  const bg = score >= 90 ? "#ECFDF5" : score >= 75 ? "#FFFBEB" : "#FEF2F2";

  return (
    <span
      style={{
        background: bg,
        color,
        borderRadius: 20,
        padding: "2px 10px",
        fontWeight: 700,
        fontSize: 12,
      }}
    >
      {score}
    </span>
  );
}

function HealthBar({ value }) {
  const color = value >= 80 ? "#16A34A" : value >= 55 ? "#D97706" : "#DC2626";

  return (
    <MDBox display="flex" alignItems="center" gap={1}>
      <MDBox
        sx={{
          flex: 1,
          height: 5,
          background: "#F3F4F6",
          borderRadius: 999,
          overflow: "hidden",
        }}
      >
        <MDBox
          sx={{
            width: `${value}%`,
            height: "100%",
            background: color,
            borderRadius: 999,
          }}
        />
      </MDBox>
      <span style={{ fontSize: 11, color, fontWeight: 600, minWidth: 32 }}>{value}%</span>
    </MDBox>
  );
}

function RiskBar({ value }) {
  const color = value >= 75 ? "#DC2626" : value >= 50 ? "#D97706" : "#16A34A";

  return (
    <MDBox display="flex" alignItems="center" gap={1}>
      <MDBox
        sx={{
          flex: 1,
          height: 5,
          background: "#F3F4F6",
          borderRadius: 999,
          overflow: "hidden",
        }}
      >
        <MDBox
          sx={{
            width: `${value}%`,
            height: "100%",
            background: color,
            borderRadius: 999,
          }}
        />
      </MDBox>
      <span style={{ fontSize: 11, color, fontWeight: 700, minWidth: 32 }}>{value}%</span>
    </MDBox>
  );
}

// ─── MAP PLACEHOLDER ─────────────────────────────────────────────────────────

function MapPlaceholder({ height = 220 }) {
  const dots = [
    { x: 30, y: 25, active: true },
    { x: 55, y: 40, active: true },
    { x: 72, y: 20, active: false },
    { x: 45, y: 60, active: true },
    { x: 20, y: 55, active: true },
    { x: 80, y: 55, active: false },
    { x: 60, y: 70, active: true },
    { x: 35, y: 75, active: true },
    { x: 88, y: 35, active: true },
    { x: 65, y: 45, active: true },
  ];

  return (
    <MDBox
      sx={{
        position: "relative",
        height,
        borderRadius: 2,
        background: "linear-gradient(145deg,#EFF6FF,#F0F9FF)",
        overflow: "hidden",
        border: "1px solid #E0F2FE",
      }}
    >
      <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.2 }}>
        {[20, 40, 60, 80].map((v) => (
          <React.Fragment key={v}>
            <line x1={`${v}%`} y1="0" x2={`${v}%`} y2="100%" stroke="#0EA5E9" strokeWidth="0.7" />
            <line x1="0" y1={`${v}%`} x2="100%" y2={`${v}%`} stroke="#0EA5E9" strokeWidth="0.7" />
          </React.Fragment>
        ))}
      </svg>

      <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.35 }}>
        <polyline
          points="20%,55% 30%,25% 55%,40% 72%,20%"
          stroke="#0EA5E9"
          strokeWidth="2"
          fill="none"
          strokeDasharray="5 4"
        />
        <polyline
          points="35%,75% 45%,60% 65%,45% 88%,35%"
          stroke="#8B5CF6"
          strokeWidth="2"
          fill="none"
          strokeDasharray="5 4"
        />
        <polyline
          points="20%,55% 35%,75%"
          stroke="#10B981"
          strokeWidth="2"
          fill="none"
          strokeDasharray="5 4"
        />
      </svg>

      {dots.map((d, i) => (
        <MDBox
          key={i}
          sx={{
            position: "absolute",
            left: `${d.x}%`,
            top: `${d.y}%`,
            transform: "translate(-50%,-50%)",
          }}
        >
          <MDBox
            sx={{
              width: 12,
              height: 12,
              borderRadius: "50%",
              background: d.active ? "#0EA5E9" : "#9CA3AF",
              border: `2px solid ${d.active ? "#BAE6FD" : "#E5E7EB"}`,
              boxShadow: d.active ? "0 0 8px rgba(14,165,233,0.5)" : "none",
            }}
          />
        </MDBox>
      ))}

      <MDBox
        sx={{
          position: "absolute",
          bottom: 8,
          left: 10,
          fontSize: 10,
          color: "#6B7280",
          fontFamily: "monospace",
        }}
      >
        18.52°N, 73.86°E · Pune Region
      </MDBox>

      <MDBox sx={{ position: "absolute", top: 8, right: 10, display: "flex", gap: 1 }}>
        {[{ c: "#0EA5E9", l: "Active" }, { c: "#9CA3AF", l: "Offline" }].map((x, i) => (
          <MDBox key={i} display="flex" alignItems="center" gap={0.5}>
            <MDBox sx={{ width: 7, height: 7, borderRadius: "50%", background: x.c }} />
            <span style={{ fontSize: 10, color: "#6B7280" }}>{x.l}</span>
          </MDBox>
        ))}
      </MDBox>
    </MDBox>
  );
}

function HeatmapPlaceholder({ height = 180 }) {
  return (
    <MDBox
      sx={{
        position: "relative",
        height,
        borderRadius: 2,
        background: "#F8FAFC",
        overflow: "hidden",
        border: "1px solid #E5E7EB",
      }}
    >
      <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
        <defs>
          {[
            { id: "h0", color: "#EF4444" },
            { id: "h1", color: "#F59E0B" },
            { id: "h2", color: "#F59E0B" },
            { id: "h3", color: "#0EA5E9" },
            { id: "h4", color: "#EF4444" },
          ].map((b) => (
            <radialGradient key={b.id} id={b.id} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={b.color} stopOpacity="0.45" />
              <stop offset="100%" stopColor={b.color} stopOpacity="0" />
            </radialGradient>
          ))}
        </defs>

        <ellipse cx="35%" cy="40%" rx="70" ry="48" fill="url(#h0)" />
        <ellipse cx="65%" cy="55%" rx="58" ry="40" fill="url(#h1)" />
        <ellipse cx="20%" cy="65%" rx="45" ry="30" fill="url(#h2)" />
        <ellipse cx="75%" cy="25%" rx="40" ry="28" fill="url(#h3)" />
        <ellipse cx="50%" cy="70%" rx="52" ry="36" fill="url(#h4)" />

        {[20, 40, 60, 80].map((v) => (
          <React.Fragment key={v}>
            <line x1={`${v}%`} y1="0" x2={`${v}%`} y2="100%" stroke="#E5E7EB" strokeWidth="1" />
            <line x1="0" y1={`${v}%`} x2="100%" y2={`${v}%`} stroke="#E5E7EB" strokeWidth="1" />
          </React.Fragment>
        ))}
      </svg>

      <MDBox
        sx={{
          position: "absolute",
          bottom: 8,
          right: 10,
          display: "flex",
          alignItems: "center",
          gap: 0.8,
        }}
      >
        <span style={{ fontSize: 9, color: "#9CA3AF" }}>Low</span>
        {["#0EA5E9", "#F59E0B", "#EF4444"].map((c, i) => (
          <MDBox key={i} sx={{ width: 20, height: 6, background: c, borderRadius: 2, opacity: 0.7 }} />
        ))}
        <span style={{ fontSize: 9, color: "#9CA3AF" }}>High</span>
      </MDBox>
    </MDBox>
  );
}

// ─── TAB BUTTON ──────────────────────────────────────────────────────────────

function TabBtn({ label, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        background: active ? "linear-gradient(135deg,#0EA5E9,#6366F1)" : "transparent",
        border: active ? "none" : "1px solid #E5E7EB",
        color: active ? "#fff" : "#6B7280",
        borderRadius: 8,
        padding: "6px 16px",
        fontSize: 12,
        fontWeight: 600,
        cursor: "pointer",
        textTransform: "capitalize",
        letterSpacing: "0.02em",
        whiteSpace: "nowrap",
        transition: "all 0.15s",
        boxShadow: active ? "0 4px 12px rgba(14,165,233,0.3)" : "none",
      }}
    >
      {label}
    </button>
  );
}

// ─── LIVE BADGE ───────────────────────────────────────────────────────────────

function LiveBadge() {
  return (
    <MDBox
      display="flex"
      alignItems="center"
      gap={0.6}
      sx={{
        background: "#ECFDF5",
        border: "1px solid #BBF7D0",
        borderRadius: 20,
        px: 1.2,
        py: 0.3,
      }}
    >
      <MDBox
        sx={{
          width: 7,
          height: 7,
          borderRadius: "50%",
          background: "#16A34A",
          animation: "pulse 1.5s infinite",
        }}
      />
      <span style={{ fontSize: 11, fontWeight: 700, color: "#16A34A" }}>LIVE</span>
    </MDBox>
  );
}

// ─── PROP TYPES ──────────────────────────────────────────────────────────────

SectionLabel.propTypes = {
  children: PropTypes.node.isRequired,
};

KpiCard.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  color: PropTypes.string.isRequired,
  badge: PropTypes.string,
};

KpiCard.defaultProps = {
  badge: "",
};

ChartCard.propTypes = {
  title: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
  height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

ChartCard.defaultProps = {
  height: 260,
};

StatusPill.propTypes = {
  status: PropTypes.string.isRequired,
};

ScoreBadge.propTypes = {
  score: PropTypes.number.isRequired,
};

HealthBar.propTypes = {
  value: PropTypes.number.isRequired,
};

RiskBar.propTypes = {
  value: PropTypes.number.isRequired,
};

MapPlaceholder.propTypes = {
  height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

MapPlaceholder.defaultProps = {
  height: 220,
};

HeatmapPlaceholder.propTypes = {
  height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

HeatmapPlaceholder.defaultProps = {
  height: 180,
};

TabBtn.propTypes = {
  label: PropTypes.string.isRequired,
  active: PropTypes.bool,
  onClick: PropTypes.func.isRequired,
};

TabBtn.defaultProps = {
  active: false,
};

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────

export default function AnalyticalDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [liveEvents, setLiveEvents] = useState(LIVE_EVENTS);

  const TABS = [
    "overview",
    "diagnostics",
    "realtime",
    "predictive",
    "drivers",
    "maintenance",
    "geospatial",
    "business",
  ];

  useEffect(() => {
    const pool = [
      { type: "overspeed", msg: "GJ01-MN-2222 exceeded 78 km/h", severity: "high" },
      { type: "geofence", msg: "MH04-PQ-3333 entered Zone B", severity: "medium" },
      { type: "ignition", msg: "RJ14-RS-4444 ignition ON", severity: "low" },
    ];

    const t = setInterval(() => {
      const e = pool[Math.floor(Math.random() * pool.length)];
      setLiveEvents((prev) => [{ ...e, id: Date.now(), time: "just now" }, ...prev.slice(0, 7)]);
    }, 5000);

    return () => clearInterval(t);
  }, []);

  return (
    <DashboardLayout>
      <DashboardNavbarWithAccountContext />

      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
        @keyframes slideIn { from{opacity:0;transform:translateY(-5px)} to{opacity:1;transform:translateY(0)} }
      `}</style>

      <MDBox py={2.5} px={1}>
        <Card sx={{ p: 1.5, mb: 3, borderRadius: 3, border: "1px solid #E5E7EB" }}>
          <MDBox display="flex" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={1}>
            <MDBox display="flex" gap={1} flexWrap="wrap">
              {TABS.map((tab) => (
                <TabBtn key={tab} label={tab} active={activeTab === tab} onClick={() => setActiveTab(tab)} />
              ))}
            </MDBox>
            <LiveBadge />
          </MDBox>
        </Card>

        {activeTab === "overview" && (
          <MDBox>
            <SectionLabel>Descriptive Analytics · Fleet Overview</SectionLabel>

            <Grid container spacing={2.5} mb={3}>
              {[
                { label: "Active Vehicles", value: FLEET_SUMMARY.active, color: "#0EA5E9", badge: "+3 today" },
                { label: "Idle", value: FLEET_SUMMARY.idle, color: "#F59E0B", badge: "↓ 2 from avg" },
                { label: "Offline", value: FLEET_SUMMARY.offline, color: "#EF4444", badge: "Check connectivity" },
                { label: "Total Fleet", value: FLEET_SUMMARY.total, color: "#8B5CF6", badge: "47 registered" },
              ].map((k, i) => (
                <Grid item xs={6} md={3} key={i}>
                  <KpiCard {...k} />
                </Grid>
              ))}
            </Grid>

            <Grid container spacing={2.5} mb={3}>
              <Grid item xs={12} md={8}>
                <Card sx={{ borderRadius: 3, border: "1px solid #E5E7EB" }}>
                  <MDBox pt={2.5} px={3} pb={1}>
                    <MDTypography variant="h6" fontWeight="medium" sx={{ fontSize: 13 }}>
                      Live Vehicle Map · Pune Region
                    </MDTypography>
                  </MDBox>
                  <MDBox px={2.5} pb={2}>
                    <MapPlaceholder height={230} />
                    <Grid container spacing={1} mt={1}>
                      {ZONE_DENSITY.map((z, i) => (
                        <Grid item xs key={i}>
                          <MDBox
                            sx={{
                              background: "#F9FAFB",
                              borderRadius: 2,
                              p: 1,
                              textAlign: "center",
                              border: "1px solid #F3F4F6",
                            }}
                          >
                            <MDTypography variant="h6" fontWeight="bold" sx={{ color: z.color, fontSize: 18 }}>
                              {z.vehicles}
                            </MDTypography>
                            <MDTypography variant="caption" sx={{ fontSize: 10, color: "#9CA3AF" }}>
                              {z.zone}
                            </MDTypography>
                          </MDBox>
                        </Grid>
                      ))}
                    </Grid>
                  </MDBox>
                </Card>
              </Grid>

              <Grid item xs={12} md={4}>
                <Card sx={{ borderRadius: 3, border: "1px solid #E5E7EB", height: "100%" }}>
                  <MDBox pt={2.5} px={3} pb={0}>
                    <MDTypography variant="h6" fontWeight="medium" sx={{ fontSize: 13 }}>
                      Engine Status
                    </MDTypography>
                  </MDBox>
                  <MDBox px={2.5} pb={2}>
                    <ResponsiveContainer width="100%" height={170}>
                      <PieChart>
                        <Pie
                          data={ENGINE_DATA}
                          cx="50%"
                          cy="50%"
                          innerRadius={48}
                          outerRadius={72}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {ENGINE_DATA.map((e, i) => (
                            <Cell key={i} fill={e.color} />
                          ))}
                        </Pie>
                        <Tooltip {...TOOLTIP_STYLE} formatter={(v) => `${v}%`} />
                      </PieChart>
                    </ResponsiveContainer>

                    {ENGINE_DATA.map((e, i) => (
                      <MDBox key={i} display="flex" alignItems="center" gap={1} mb={0.8}>
                        <MDBox
                          sx={{
                            width: 9,
                            height: 9,
                            borderRadius: "50%",
                            background: e.color,
                            flexShrink: 0,
                          }}
                        />
                        <MDTypography variant="caption" sx={{ flex: 1, fontSize: 12, color: "#6B7280" }}>
                          {e.name}
                        </MDTypography>
                        <MDTypography variant="caption" sx={{ fontWeight: 700, color: e.color, fontSize: 13 }}>
                          {e.value}%
                        </MDTypography>
                      </MDBox>
                    ))}

                    <MDBox mt={2} sx={{ background: "#FFFBEB", borderRadius: 2, p: 1.5, border: "1px solid #FDE68A" }}>
                      <MDTypography
                        variant="caption"
                        sx={{ fontSize: 10, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.06em" }}
                      >
                        Avg Idle Time Today
                      </MDTypography>
                      <MDTypography variant="h5" fontWeight="bold" sx={{ color: "#D97706", mt: 0.3 }}>
                        2h 18m
                      </MDTypography>
                      <MDTypography variant="caption" sx={{ fontSize: 10, color: "#9CA3AF" }}>
                        ↑ 12 min vs yesterday
                      </MDTypography>
                    </MDBox>
                  </MDBox>
                </Card>
              </Grid>
            </Grid>

            <ChartCard title="Distance Traveled — Last 7 Days (km)" height={220}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={DISTANCE_TREND}>
                  <defs>
                    <linearGradient id="distGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0EA5E9" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#0EA5E9" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                  <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
                  <Tooltip {...TOOLTIP_STYLE} formatter={(v) => [`${v} km`, "Distance"]} />
                  <Area
                    type="monotone"
                    dataKey="km"
                    stroke="#0EA5E9"
                    strokeWidth={2.5}
                    fill="url(#distGrad)"
                    dot={{ fill: "#0EA5E9", r: 3 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </ChartCard>
          </MDBox>
        )}

        {activeTab === "diagnostics" && (
          <MDBox>
            <SectionLabel>Diagnostic Analytics</SectionLabel>
            <Grid container spacing={2.5}>
              <Grid item xs={12} md={7}>
                <ChartCard title="Idle vs Running Time per Vehicle (hrs)" height={260}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={IDLE_VS_RUNNING}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                      <XAxis dataKey="vehicle" tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
                      <Tooltip {...TOOLTIP_STYLE} />
                      <Legend wrapperStyle={{ fontSize: 11, color: "#6B7280" }} />
                      <Bar dataKey="running" name="Running" fill="#0EA5E9" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="idle" name="Idle" fill="#F59E0B" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartCard>
              </Grid>

              <Grid item xs={12} md={5}>
                <Card sx={{ borderRadius: 3, border: "1px solid #E5E7EB", height: "100%" }}>
                  <MDBox pt={2.5} px={3} pb={0}>
                    <MDTypography variant="h6" fontWeight="medium" sx={{ fontSize: 13 }}>
                      Route Deviation Analysis
                    </MDTypography>
                  </MDBox>
                  <MDBox px={2.5} pb={2}>
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                      <thead>
                        <tr>
                          {["Vehicle", "Planned", "Actual", "Dev."].map((h) => (
                            <th key={h} style={TABLE_TH}>
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          { v: "MH12-AB", planned: 120, actual: 138, dev: "+15%" },
                          { v: "TN01-CD", planned: 95, actual: 91, dev: "-4%" },
                          { v: "KA05-EF", planned: 200, actual: 224, dev: "+12%" },
                          { v: "MH12-GH", planned: 150, actual: 148, dev: "-1%" },
                          { v: "DL01-IJ", planned: 180, actual: 207, dev: "+15%" },
                        ].map((r, i) => (
                          <tr key={i}>
                            <td style={{ ...TABLE_TD, fontFamily: "monospace", fontSize: 11 }}>{r.v}</td>
                            <td style={TABLE_TD}>{r.planned}</td>
                            <td style={TABLE_TD}>{r.actual}</td>
                            <td style={TABLE_TD}>
                              <span
                                style={{
                                  fontWeight: 700,
                                  color: r.dev.startsWith("+") ? "#DC2626" : "#16A34A",
                                }}
                              >
                                {r.dev}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    <MDTypography variant="h6" fontWeight="medium" sx={{ fontSize: 13, mt: 2.5, mb: 1 }}>
                      Stop Analysis — Top Locations
                    </MDTypography>
                    {[
                      { loc: "Wakad Depot", stops: 28, avgDur: "14 min" },
                      { loc: "Hinjewadi Hub", stops: 19, avgDur: "22 min" },
                      { loc: "Baner Gate", stops: 15, avgDur: "8 min" },
                      { loc: "Aundh Checkpoint", stops: 11, avgDur: "31 min" },
                    ].map((s, i) => (
                      <MDBox key={i} display="flex" alignItems="center" gap={1} sx={{ py: 1, borderBottom: "1px solid #F9FAFB" }}>
                        <MDBox sx={{ width: 7, height: 7, borderRadius: "50%", background: "#8B5CF6", flexShrink: 0 }} />
                        <MDTypography variant="caption" sx={{ flex: 1, fontSize: 12, color: "#374151" }}>
                          {s.loc}
                        </MDTypography>
                        <MDTypography variant="caption" sx={{ fontSize: 11, color: "#9CA3AF" }}>
                          {s.stops} stops
                        </MDTypography>
                        <MDTypography variant="caption" sx={{ fontSize: 11, color: "#8B5CF6", fontWeight: 700 }}>
                          {s.avgDur}
                        </MDTypography>
                      </MDBox>
                    ))}
                  </MDBox>
                </Card>
              </Grid>
            </Grid>
          </MDBox>
        )}

        {activeTab === "realtime" && (
          <MDBox>
            <SectionLabel>Real-Time Analytics</SectionLabel>
            <Grid container spacing={2.5}>
              <Grid item xs={12} md={5}>
                <Card sx={{ borderRadius: 3, border: "1px solid #E5E7EB", height: "100%" }}>
                  <MDBox pt={2.5} px={3} pb={0} display="flex" justifyContent="space-between" alignItems="center">
                    <MDTypography variant="h6" fontWeight="medium" sx={{ fontSize: 13 }}>
                      Live Event Stream
                    </MDTypography>
                    <LiveBadge />
                  </MDBox>
                  <MDBox px={2.5} pb={2}>
                    {liveEvents.map((e, i) => (
                      <MDBox
                        key={e.id}
                        display="flex"
                        alignItems="flex-start"
                        gap={1.2}
                        sx={{
                          py: 1.2,
                          borderBottom: "1px solid #F9FAFB",
                          animation: i === 0 ? "slideIn 0.3s ease" : "none",
                        }}
                      >
                        <MDBox
                          sx={{
                            width: 8,
                            height: 8,
                            borderRadius: "50%",
                            background: EventTypeColors[e.type],
                            mt: 0.5,
                            flexShrink: 0,
                          }}
                        />
                        <MDBox sx={{ flex: 1 }}>
                          <MDTypography variant="caption" sx={{ fontSize: 12, color: "#374151", display: "block" }}>
                            {e.msg}
                          </MDTypography>
                          <MDTypography variant="caption" sx={{ fontSize: 10, color: "#9CA3AF" }}>
                            {e.time} · {e.type}
                          </MDTypography>
                        </MDBox>
                        <span
                          style={{
                            fontSize: 9,
                            fontWeight: 700,
                            padding: "2px 8px",
                            borderRadius: 20,
                            textTransform: "uppercase",
                            background:
                              e.severity === "high"
                                ? "#FEF2F2"
                                : e.severity === "medium"
                                ? "#FFFBEB"
                                : "#EFF6FF",
                            color:
                              e.severity === "high"
                                ? "#DC2626"
                                : e.severity === "medium"
                                ? "#D97706"
                                : "#2563EB",
                          }}
                        >
                          {e.severity}
                        </span>
                      </MDBox>
                    ))}
                  </MDBox>
                </Card>
              </Grid>

              <Grid item xs={12} md={7}>
                <Grid container spacing={2.5}>
                  <Grid item xs={12}>
                    <Card sx={{ borderRadius: 3, border: "1px solid #E5E7EB" }}>
                      <MDBox pt={2.5} px={3} pb={0}>
                        <MDTypography variant="h6" fontWeight="medium" sx={{ fontSize: 13 }}>
                          Overspeed Alerts Today
                        </MDTypography>
                      </MDBox>
                      <MDBox px={2.5} pb={2}>
                        <table style={{ width: "100%", borderCollapse: "collapse" }}>
                          <thead>
                            <tr>
                              {["Time", "Vehicle", "Speed", "Limit", "Zone"].map((h) => (
                                <th key={h} style={TABLE_TH}>
                                  {h}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {OVERSPEED_ALERTS.map((a, i) => (
                              <tr key={i}>
                                <td style={TABLE_TD}>{a.time}</td>
                                <td style={{ ...TABLE_TD, fontFamily: "monospace", fontSize: 11 }}>{a.vehicle}</td>
                                <td style={TABLE_TD}>
                                  <span style={{ color: "#DC2626", fontWeight: 700 }}>{a.speed} km/h</span>
                                </td>
                                <td style={{ ...TABLE_TD, color: "#9CA3AF" }}>{a.limit}</td>
                                <td style={{ ...TABLE_TD, color: "#6B7280" }}>{a.zone}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </MDBox>
                    </Card>
                  </Grid>

                  <Grid item xs={12}>
                    <Card sx={{ borderRadius: 3, border: "1px solid #E5E7EB" }}>
                      <MDBox pt={2.5} px={3} pb={2}>
                        <MDTypography variant="h6" fontWeight="medium" sx={{ fontSize: 13, mb: 1.5 }}>
                          Alert Summary — Today
                        </MDTypography>
                        <Grid container spacing={1.5}>
                          {[
                            { label: "Overspeed", count: 5, color: "#EF4444", bg: "#FEF2F2" },
                            { label: "Geo-fence Exit", count: 3, color: "#F59E0B", bg: "#FFFBEB" },
                            { label: "Ignition Events", count: 24, color: "#0EA5E9", bg: "#EFF6FF" },
                            { label: "Route Deviation", count: 2, color: "#8B5CF6", bg: "#F5F3FF" },
                          ].map((item, i) => (
                            <Grid item xs={6} key={i}>
                              <MDBox
                                sx={{
                                  background: item.bg,
                                  borderRadius: 2,
                                  p: 1.5,
                                  border: `1px solid ${item.color}22`,
                                }}
                              >
                                <MDTypography variant="h5" fontWeight="bold" sx={{ color: item.color }}>
                                  {item.count}
                                </MDTypography>
                                <MDTypography variant="caption" sx={{ fontSize: 11, color: "#6B7280" }}>
                                  {item.label}
                                </MDTypography>
                              </MDBox>
                            </Grid>
                          ))}
                        </Grid>
                      </MDBox>
                    </Card>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </MDBox>
        )}

        {activeTab === "predictive" && (
          <MDBox>
            <SectionLabel>Predictive Analytics</SectionLabel>
            <Grid container spacing={2.5}>
              <Grid item xs={12} md={5}>
                <Card sx={{ borderRadius: 3, border: "1px solid #E5E7EB" }}>
                  <MDBox pt={2.5} px={3} pb={2}>
                    <MDTypography variant="h6" fontWeight="medium" sx={{ fontSize: 13, mb: 2 }}>
                      Breakdown Prediction Risk Score
                    </MDTypography>
                    {PREDICTIVE_RISK.map((p, i) => (
                      <MDBox key={i} mb={2}>
                        <MDBox display="flex" justifyContent="space-between" mb={0.6}>
                          <MDTypography
                            variant="caption"
                            sx={{ fontSize: 11, fontFamily: "monospace", color: "#374151" }}
                          >
                            {p.vehicle}
                          </MDTypography>
                        </MDBox>
                        <RiskBar value={p.risk} />
                        <MDTypography
                          variant="caption"
                          sx={{ fontSize: 10, color: "#9CA3AF", mt: 0.3, display: "block" }}
                        >
                          {p.reason}
                        </MDTypography>
                      </MDBox>
                    ))}
                  </MDBox>
                </Card>
              </Grid>

              <Grid item xs={12} md={7}>
                <Grid container spacing={2.5}>
                  <Grid item xs={12}>
                    <ChartCard title="Breakdown Incidents Trend" height={180}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={BREAKDOWN_TREND}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                          <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
                          <YAxis tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
                          <Tooltip {...TOOLTIP_STYLE} />
                          <Bar dataKey="incidents" fill="#EF4444" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </ChartCard>
                  </Grid>

                  <Grid item xs={12}>
                    <Card sx={{ borderRadius: 3, border: "1px solid #E5E7EB" }}>
                      <MDBox pt={2.5} px={3} pb={2}>
                        <MDTypography variant="h6" fontWeight="medium" sx={{ fontSize: 13, mb: 1.5 }}>
                          Delivery Delay Prediction (ETA-Based)
                        </MDTypography>
                        {[
                          { vehicle: "MH12-AB-1234", destination: "Hinjewadi Plant", delay: "+28 min", risk: "high" },
                          { vehicle: "TN01-CD-5678", destination: "Baner Depot", delay: "+5 min", risk: "low" },
                          { vehicle: "KA05-EF-9012", destination: "Wakad Hub", delay: "On time", risk: "none" },
                          { vehicle: "UP32-KL-1111", destination: "Aundh Gate", delay: "+42 min", risk: "high" },
                        ].map((d, i) => (
                          <MDBox key={i} display="flex" alignItems="center" gap={1.5} sx={{ py: 1, borderBottom: "1px solid #F9FAFB" }}>
                            <MDTypography
                              variant="caption"
                              sx={{ fontSize: 11, fontFamily: "monospace", color: "#6B7280", flex: 1 }}
                            >
                              {d.vehicle}
                            </MDTypography>
                            <MDTypography variant="caption" sx={{ fontSize: 11, color: "#6B7280", flex: 1 }}>
                              {d.destination}
                            </MDTypography>
                            <MDTypography
                              variant="caption"
                              sx={{
                                fontSize: 12,
                                fontWeight: 700,
                                color:
                                  d.risk === "high"
                                    ? "#DC2626"
                                    : d.risk === "low"
                                    ? "#D97706"
                                    : "#16A34A",
                              }}
                            >
                              {d.delay}
                            </MDTypography>
                          </MDBox>
                        ))}
                      </MDBox>
                    </Card>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>

            <MDBox mt={2.5}>
              <Card sx={{ borderRadius: 3, border: "1px solid #E5E7EB" }}>
                <MDBox pt={2.5} px={3} pb={2}>
                  <MDTypography variant="h6" fontWeight="medium" sx={{ fontSize: 13, mb: 1.5 }}>
                    Maintenance Scheduling Insights
                  </MDTypography>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr>
                        {["Vehicle", "Engine Hours", "Next Service (hrs)", "Health", "Status"].map((h) => (
                          <th key={h} style={TABLE_TH}>
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {MAINTENANCE_VEHICLES.map((v, i) => (
                        <tr key={i}>
                          <td style={{ ...TABLE_TD, fontFamily: "monospace", fontSize: 11 }}>{v.id}</td>
                          <td style={TABLE_TD}>{v.hours.toLocaleString()}</td>
                          <td
                            style={{
                              ...TABLE_TD,
                              fontWeight: 600,
                              color: v.nextService < 0 ? "#DC2626" : v.nextService < 100 ? "#D97706" : "#16A34A",
                            }}
                          >
                            {v.nextService < 0 ? `${Math.abs(v.nextService)} overdue` : v.nextService}
                          </td>
                          <td style={{ ...TABLE_TD, minWidth: 140 }}>
                            <HealthBar value={v.health} />
                          </td>
                          <td style={TABLE_TD}>
                            <StatusPill status={v.status} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </MDBox>
              </Card>
            </MDBox>
          </MDBox>
        )}

        {activeTab === "drivers" && (
          <MDBox>
            <SectionLabel>Driver Behavior Analytics</SectionLabel>
            <Grid container spacing={2.5}>
              <Grid item xs={12} md={8}>
                <Card sx={{ borderRadius: 3, border: "1px solid #E5E7EB" }}>
                  <MDBox pt={2.5} px={3} pb={2}>
                    <MDTypography variant="h6" fontWeight="medium" sx={{ fontSize: 13, mb: 1.5 }}>
                      Driver Ranking Leaderboard
                    </MDTypography>
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                      <thead>
                        <tr>
                          {["Rank", "Driver", "Score", "Trips", "Harsh Events", "Overspeed"].map((h) => (
                            <th key={h} style={TABLE_TH}>
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {DRIVER_SCORES.map((d, i) => (
                          <tr key={i}>
                            <td style={TABLE_TD}>
                              <span
                                style={{
                                  width: 24,
                                  height: 24,
                                  borderRadius: "50%",
                                  display: "inline-flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  fontSize: 11,
                                  fontWeight: 700,
                                  background: i === 0 ? "#FFFBEB" : "#F9FAFB",
                                  color: i === 0 ? "#D97706" : "#6B7280",
                                  border: `1px solid ${i === 0 ? "#FDE68A" : "#E5E7EB"}`,
                                }}
                              >
                                #{d.rank}
                              </span>
                            </td>
                            <td style={TABLE_TD}>{d.name}</td>
                            <td style={TABLE_TD}>
                              <ScoreBadge score={d.score} />
                            </td>
                            <td style={TABLE_TD}>{d.trips}</td>
                            <td style={{ ...TABLE_TD, color: d.harsh > 10 ? "#DC2626" : "#6B7280" }}>{d.harsh}</td>
                            <td style={{ ...TABLE_TD, color: d.overspeed > 6 ? "#DC2626" : "#6B7280" }}>
                              {d.overspeed}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </MDBox>
                </Card>
              </Grid>

              <Grid item xs={12} md={4}>
                <Card sx={{ borderRadius: 3, border: "1px solid #E5E7EB", height: "100%" }}>
                  <MDBox pt={2.5} px={3} pb={0}>
                    <MDTypography variant="h6" fontWeight="medium" sx={{ fontSize: 13 }}>
                      Behavior Radar — Top 3
                    </MDTypography>
                  </MDBox>
                  <MDBox px={1} pb={1}>
                    <ResponsiveContainer width="100%" height={230}>
                      <RadarChart data={DRIVER_BEHAVIOR_RADAR} cx="50%" cy="50%" outerRadius={80}>
                        <PolarGrid stroke="#F3F4F6" />
                        <PolarAngleAxis dataKey="metric" tick={{ fontSize: 11, fill: "#9CA3AF" }} />
                        <Radar name="Ramesh K." dataKey="Ramesh" stroke="#0EA5E9" fill="#0EA5E9" fillOpacity={0.15} />
                        <Radar name="Suresh M." dataKey="Suresh" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.12} />
                        <Radar name="Dinesh P." dataKey="Dinesh" stroke="#F59E0B" fill="#F59E0B" fillOpacity={0.1} />
                        <Legend wrapperStyle={{ fontSize: 11, color: "#6B7280" }} />
                        <Tooltip {...TOOLTIP_STYLE} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </MDBox>

                  <MDBox px={2.5} pb={2}>
                    <MDTypography variant="h6" fontWeight="medium" sx={{ fontSize: 13, mb: 1 }}>
                      Fleet Harsh Events — Today
                    </MDTypography>
                    {[
                      { label: "Harsh Braking", count: 23, color: "#EF4444" },
                      { label: "Harsh Acceleration", count: 18, color: "#F59E0B" },
                      { label: "Sharp Cornering", count: 9, color: "#8B5CF6" },
                    ].map((h, i) => (
                      <MDBox key={i} display="flex" alignItems="center" gap={1} sx={{ py: 1, borderBottom: "1px solid #F9FAFB" }}>
                        <MDBox sx={{ width: 7, height: 7, borderRadius: "50%", background: h.color }} />
                        <MDTypography variant="caption" sx={{ flex: 1, fontSize: 12, color: "#374151" }}>
                          {h.label}
                        </MDTypography>
                        <MDTypography variant="h6" fontWeight="bold" sx={{ color: h.color }}>
                          {h.count}
                        </MDTypography>
                      </MDBox>
                    ))}
                  </MDBox>
                </Card>
              </Grid>
            </Grid>
          </MDBox>
        )}

        {activeTab === "maintenance" && (
          <MDBox>
            <SectionLabel>Maintenance & Health</SectionLabel>

            <Grid container spacing={2.5} mb={3}>
              {[
                { label: "Vehicles Due", value: "3", color: "#F59E0B" },
                { label: "Overdue", value: "1", color: "#EF4444" },
                { label: "Avg Engine Hours", value: "4,704", color: "#0EA5E9" },
                { label: "Fleet Health Score", value: "74%", color: "#10B981" },
              ].map((k, i) => (
                <Grid item xs={6} md={3} key={i}>
                  <KpiCard {...k} />
                </Grid>
              ))}
            </Grid>

            <Grid container spacing={2.5}>
              <Grid item xs={12} md={6}>
                <Card sx={{ borderRadius: 3, border: "1px solid #E5E7EB" }}>
                  <MDBox pt={2.5} px={3} pb={2}>
                    <MDTypography variant="h6" fontWeight="medium" sx={{ fontSize: 13, mb: 1.5 }}>
                      Vehicle Health Status
                    </MDTypography>
                    {MAINTENANCE_VEHICLES.map((v, i) => (
                      <MDBox key={i} sx={{ py: 1.5, borderBottom: "1px solid #F9FAFB" }}>
                        <MDBox display="flex" justifyContent="space-between" mb={1}>
                          <MDTypography
                            variant="caption"
                            sx={{ fontSize: 12, fontFamily: "monospace", color: "#374151" }}
                          >
                            {v.id}
                          </MDTypography>
                          <StatusPill status={v.status} />
                        </MDBox>
                        <HealthBar value={v.health} />
                        <MDBox display="flex" gap={2} mt={0.5}>
                          <MDTypography variant="caption" sx={{ fontSize: 10, color: "#9CA3AF" }}>
                            Engine: {v.hours.toLocaleString()} hrs
                          </MDTypography>
                          <MDTypography
                            variant="caption"
                            sx={{ fontSize: 10, color: v.nextService < 0 ? "#DC2626" : "#9CA3AF" }}
                          >
                            Next: {v.nextService < 0 ? `${Math.abs(v.nextService)} hrs overdue` : `${v.nextService} hrs`}
                          </MDTypography>
                        </MDBox>
                      </MDBox>
                    ))}
                  </MDBox>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Grid container spacing={2.5}>
                  <Grid item xs={12}>
                    <ChartCard title="Breakdown Incidents Trend" height={180}>
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={BREAKDOWN_TREND}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                          <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
                          <YAxis tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
                          <Tooltip {...TOOLTIP_STYLE} />
                          <Line
                            type="monotone"
                            dataKey="incidents"
                            stroke="#EF4444"
                            strokeWidth={2.5}
                            dot={{ fill: "#EF4444", r: 4 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </ChartCard>
                  </Grid>

                  <Grid item xs={12}>
                    <Card sx={{ borderRadius: 3, border: "1px solid #E5E7EB" }}>
                      <MDBox pt={2.5} px={3} pb={2}>
                        <MDTypography variant="h6" fontWeight="medium" sx={{ fontSize: 13, mb: 1.5 }}>
                          Service Reminders
                        </MDTypography>
                        {[
                          { task: "Oil Change", vehicles: 2, dueIn: "This week" },
                          { task: "Tyre Rotation", vehicles: 4, dueIn: "Next 15 days" },
                          { task: "Battery Check", vehicles: 1, dueIn: "Overdue" },
                          { task: "Brake Inspection", vehicles: 3, dueIn: "Next 30 days" },
                        ].map((r, i) => (
                          <MDBox key={i} display="flex" alignItems="center" gap={1} sx={{ py: 1, borderBottom: "1px solid #F9FAFB" }}>
                            <MDBox
                              sx={{
                                width: 8,
                                height: 8,
                                borderRadius: 1,
                                background: r.dueIn === "Overdue" ? "#EF4444" : "#8B5CF6",
                                flexShrink: 0,
                              }}
                            />
                            <MDTypography variant="caption" sx={{ flex: 1, fontSize: 12, color: "#374151" }}>
                              {r.task}
                            </MDTypography>
                            <MDTypography variant="caption" sx={{ fontSize: 11, color: "#9CA3AF" }}>
                              {r.vehicles} vehicles
                            </MDTypography>
                            <MDTypography
                              variant="caption"
                              sx={{
                                fontSize: 11,
                                fontWeight: 700,
                                color: r.dueIn === "Overdue" ? "#DC2626" : "#D97706",
                              }}
                            >
                              {r.dueIn}
                            </MDTypography>
                          </MDBox>
                        ))}
                      </MDBox>
                    </Card>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </MDBox>
        )}

        {activeTab === "geospatial" && (
          <MDBox>
            <SectionLabel>Geo-Spatial Analytics</SectionLabel>
            <Grid container spacing={2.5}>
              <Grid item xs={12} md={6}>
                <Card sx={{ borderRadius: 3, border: "1px solid #E5E7EB" }}>
                  <MDBox pt={2.5} px={3} pb={2}>
                    <MDTypography variant="h6" fontWeight="medium" sx={{ fontSize: 13, mb: 1.5 }}>
                      Route & Stop Heatmap
                    </MDTypography>
                    <HeatmapPlaceholder height={190} />

                    <MDTypography variant="h6" fontWeight="medium" sx={{ fontSize: 13, mt: 2.5, mb: 1 }}>
                      Geo-Fence Violations
                    </MDTypography>
                    {[
                      { zone: "Zone A", entries: 12, exits: 10, violations: 2 },
                      { zone: "Zone B", entries: 8, exits: 9, violations: 1 },
                      { zone: "Zone C", entries: 15, exits: 14, violations: 3 },
                      { zone: "Zone D", entries: 4, exits: 5, violations: 0 },
                    ].map((z, i) => (
                      <MDBox key={i} display="flex" alignItems="center" gap={1} sx={{ py: 1, borderBottom: "1px solid #F9FAFB" }}>
                        <MDTypography variant="caption" sx={{ width: 55, fontSize: 12, color: "#374151" }}>
                          {z.zone}
                        </MDTypography>
                        <MDTypography variant="caption" sx={{ fontSize: 11, color: "#9CA3AF" }}>
                          ↑{z.entries} entries
                        </MDTypography>
                        <MDTypography variant="caption" sx={{ fontSize: 11, color: "#9CA3AF" }}>
                          ↓{z.exits} exits
                        </MDTypography>
                        <MDTypography
                          variant="caption"
                          sx={{
                            ml: "auto",
                            fontSize: 12,
                            fontWeight: 700,
                            color: z.violations > 0 ? "#DC2626" : "#16A34A",
                          }}
                        >
                          {z.violations} violations
                        </MDTypography>
                      </MDBox>
                    ))}
                  </MDBox>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Grid container spacing={2.5}>
                  <Grid item xs={12}>
                    <ChartCard title="Vehicle Density by Zone" height={220}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={ZONE_DENSITY} layout="vertical">
                          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#F3F4F6" />
                          <XAxis type="number" tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
                          <YAxis
                            type="category"
                            dataKey="zone"
                            tick={{ fontSize: 11, fill: "#6B7280" }}
                            axisLine={false}
                            tickLine={false}
                            width={55}
                          />
                          <Tooltip {...TOOLTIP_STYLE} />
                          <Bar dataKey="vehicles" radius={[0, 4, 4, 0]}>
                            {ZONE_DENSITY.map((z, i) => (
                              <Cell key={i} fill={z.color} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </ChartCard>
                  </Grid>

                  <Grid item xs={12}>
                    <Card sx={{ borderRadius: 3, border: "1px solid #E5E7EB" }}>
                      <MDBox pt={2.5} px={3} pb={2}>
                        <MDTypography variant="h6" fontWeight="medium" sx={{ fontSize: 13, mb: 1.5 }}>
                          Live Map — Geo-fence Overlay
                        </MDTypography>
                        <MapPlaceholder height={180} />
                      </MDBox>
                    </Card>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </MDBox>
        )}

        {activeTab === "business" && (
          <MDBox>
            <SectionLabel>Business / MIS Analytics</SectionLabel>

            <Grid container spacing={2.5} mb={3}>
              {[
                { label: "Avg Cost / km", value: "₹4.85", color: "#F59E0B" },
                { label: "Fleet Utilization", value: "86%", color: "#0EA5E9" },
                { label: "Total km This Month", value: "38,420", color: "#8B5CF6" },
                { label: "Driver Productivity", value: "7.4 hrs", color: "#10B981" },
              ].map((k, i) => (
                <Grid item xs={6} md={3} key={i}>
                  <KpiCard {...k} />
                </Grid>
              ))}
            </Grid>

            <Grid container spacing={2.5} mb={2.5}>
              <Grid item xs={12} md={6}>
                <ChartCard title="Fleet Utilization — Last 6 Months (%)" height={220}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={UTILIZATION_DATA}>
                      <defs>
                        <linearGradient id="utilGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.25} />
                          <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                      <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
                      <YAxis domain={[50, 100]} tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
                      <Tooltip {...TOOLTIP_STYLE} formatter={(v) => [`${v}%`, "Utilization"]} />
                      <Area
                        type="monotone"
                        dataKey="util"
                        stroke="#8B5CF6"
                        strokeWidth={2.5}
                        fill="url(#utilGrad)"
                        dot={{ fill: "#8B5CF6", r: 3 }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </ChartCard>
              </Grid>

              <Grid item xs={12} md={6}>
                <ChartCard title="Cost per km by Vehicle (₹)" height={220}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={COST_PER_KM}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                      <XAxis dataKey="vehicle" tick={{ fontSize: 10, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
                      <Tooltip {...TOOLTIP_STYLE} formatter={(v) => [`₹${v}`, "Cost/km"]} />
                      <Bar dataKey="cost" radius={[4, 4, 0, 0]}>
                        {COST_PER_KM.map((c, i) => (
                          <Cell key={i} fill={c.cost > 5.5 ? "#EF4444" : c.cost > 4.5 ? "#F59E0B" : "#10B981"} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </ChartCard>
              </Grid>
            </Grid>

            <Card sx={{ borderRadius: 3, border: "1px solid #E5E7EB" }}>
              <MDBox pt={2.5} px={3} pb={2}>
                <MDTypography variant="h6" fontWeight="medium" sx={{ fontSize: 13, mb: 1.5 }}>
                  Driver Productivity Report
                </MDTypography>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr>
                      {["Driver", "Trips", "Driving Hours", "Km Covered", "Idle Time", "Score"].map((h) => (
                        <th key={h} style={TABLE_TH}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { name: "Ramesh K.", trips: 128, hours: "8.4", km: 4820, idle: "0.8h", scoreIdx: 0 },
                      { name: "Suresh M.", trips: 115, hours: "7.9", km: 4320, idle: "1.2h", scoreIdx: 1 },
                      { name: "Dinesh P.", trips: 97, hours: "7.2", km: 3680, idle: "1.9h", scoreIdx: 2 },
                      { name: "Mahesh T.", trips: 143, hours: "9.1", km: 5100, idle: "2.4h", scoreIdx: 3 },
                      { name: "Rajesh V.", trips: 89, hours: "6.5", km: 3100, idle: "3.1h", scoreIdx: 4 },
                    ].map((d, i) => (
                      <tr key={i}>
                        <td style={TABLE_TD}>{d.name}</td>
                        <td style={TABLE_TD}>{d.trips}</td>
                        <td style={TABLE_TD}>{d.hours} hrs</td>
                        <td style={TABLE_TD}>{d.km.toLocaleString()} km</td>
                        <td style={{ ...TABLE_TD, color: parseFloat(d.idle) > 2 ? "#D97706" : "#6B7280" }}>{d.idle}</td>
                        <td style={TABLE_TD}>
                          <ScoreBadge score={DRIVER_SCORES[d.scoreIdx]?.score || 80} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </MDBox>
            </Card>
          </MDBox>
        )}
      </MDBox>
    </DashboardLayout>
  );
}