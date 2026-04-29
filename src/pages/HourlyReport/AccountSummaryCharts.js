import React, { useState, useMemo } from "react";
import PropTypes from "prop-types";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RTooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
  Sector,
  ScatterChart,
  Scatter,
  ZAxis,
  Treemap,
} from "recharts";
import Box from "@mui/material/Box";
import Icon from "@mui/material/Icon";
import Chip from "@mui/material/Chip";
import MDTypography from "../../assets/components/MDTypography";

// ─── Design Tokens ────────────────────────────────────────────────────────────
const PALETTE = {
  blue: "#1A73E8",
  teal: "#00897b",
  amber: "#f59e0b",
  rose: "#e11d48",
  emerald: "#10b981",
};

const PIE_COLORS = [
  "#1A73E8", "#00897b", "#f59e0b", "#e11d48", "#7c3aed",
  "#0ea5e9", "#10b981", "#f97316", "#6366f1", "#ec4899",
];

const cardSx = {
  background: "#fff",
  borderRadius: "14px",
  border: "1px solid #e8eaf6",
  boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
  overflow: "hidden",
  display: "flex",
  flexDirection: "column",
};

const cardHeaderSx = {
  px: 2.5,
  pt: 2.5,
  pb: 1.5,
  borderBottom: "1px solid #f4f4f8",
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "space-between",
  gap: 1,
};

// ─── Recursive Flattening Helper ──────────────────────────────────────────────
// This extracts all nested accounts into a flat array for Top 10 analysis
const flattenAccounts = (accounts) => {
  let flat = [];
  accounts.forEach((acc) => {
    // We target terminal accounts (those without children) or all accounts 
    // depending on if you want to include aggregate folders in the rankings.
    // Usually, for Top 10, you want the actual active sub-accounts.
    if (!acc.childAccounts || acc.childAccounts.length === 0) {
      flat.push(acc);
    } else {
      // If you want to include the parent (like Tech-Hop) in rankings, 
      // push 'acc' here too. Otherwise, just recurse.
      flat = [...flat, ...flattenAccounts(acc.childAccounts)];
    }
  });
  return flat;
};

// ─── Shared Tooltip ───────────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label, formatter }) => {
  if (!active || !payload?.length) return null;
  return (
    <Box sx={{ background: "#1e1e2e", borderRadius: "10px", px: 2, py: 1.5, boxShadow: "0 8px 32px rgba(0,0,0,0.25)", border: "1px solid rgba(255,255,255,0.08)", minWidth: 160 }}>
      {label && <MDTypography sx={{ fontSize: "0.68rem", color: "rgba(255,255,255,0.5)", mb: 0.5 }}>{label}</MDTypography>}
      {payload.map((p, i) => (
        <Box key={i} display="flex" alignItems="center" gap={1} mb={0.3}>
          <Box sx={{ width: 8, height: 8, borderRadius: "50%", background: p.color || p.fill || "#fff" }} />
          <MDTypography sx={{ fontSize: "0.75rem", color: "#fff", fontWeight: 600 }}>
            {formatter ? formatter(p) : `${p.name}: ${p.value?.toLocaleString()}`}
          </MDTypography>
        </Box>
      ))}
    </Box>
  );
};

CustomTooltip.propTypes = {
  active: PropTypes.bool,
  payload: PropTypes.arrayOf(PropTypes.object),
  label: PropTypes.string,
  formatter: PropTypes.func,
};

const ChartCard = ({ icon, title, subtitle, badge, children, height = 300 }) => (
  <Box sx={cardSx}>
    <Box sx={cardHeaderSx}>
      <Box display="flex" gap={1.5} alignItems="flex-start">
        <Box sx={{ width: 36, height: 36, borderRadius: "10px", background: "linear-gradient(135deg,#1A73E822,#1A73E844)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Icon sx={{ color: "#1A73E8", fontSize: 18 }}>{icon}</Icon>
        </Box>
        <Box>
          <MDTypography sx={{ fontSize: "0.82rem", fontWeight: 700, color: "#1e1e2e", lineHeight: 1.3 }}>{title}</MDTypography>
          <MDTypography sx={{ fontSize: "0.65rem", color: "#9094a8", mt: 0.2 }}>{subtitle}</MDTypography>
        </Box>
      </Box>
      {badge && <Chip label={badge} size="small" sx={{ fontSize: "0.6rem", height: 20, fontWeight: 700, background: "#f0f4ff", color: "#1A73E8" }} />}
    </Box>
    <Box sx={{ px: 1.5, pb: 2, pt: 1.5, flex: 1, minHeight: height }}>{children}</Box>
  </Box>
);

ChartCard.propTypes = {
  icon: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string,
  badge: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  children: PropTypes.node.isRequired,
  height: PropTypes.number,
};

// ─── Scatter Point (Fixes ESLint) ─────────────────────────────────────────────
const ScatterPoint = ({ cx, cy, payload }) => {
  const r = Math.max(5, Math.min(18, 5 + Math.sqrt(payload.z || 0) * 1.5));
  const ratio = (payload.x || 0) / Math.max(payload.y, 1);
  const color = ratio > 0.15 ? PALETTE.emerald : ratio > 0.05 ? PALETTE.amber : PALETTE.rose;

  return <circle cx={cx} cy={cy} r={r} fill={color} fillOpacity={0.75} stroke={color} strokeWidth={1.5} />;
};

ScatterPoint.propTypes = {
  cx: PropTypes.number,
  cy: PropTypes.number,
  payload: PropTypes.shape({
    x: PropTypes.number,
    y: PropTypes.number,
    z: PropTypes.number,
  }),
};

// ─── 1. Horizontal Bar Chart — Top 10 by Distance ────────────────────────────
const TopPerformersBar = ({ data }) => {
  const top10 = useMemo(() =>
    [...data]
      .filter((a) => a.totalDistance > 0)
      .sort((a, b) => b.totalDistance - a.totalDistance)
      .slice(0, 10)
      .map((a) => ({
        name: a.accountName.length > 22 ? a.accountName.slice(0, 20) + "…" : a.accountName,
        fullName: a.accountName,
        distance: a.totalDistance,
      })), [data]);

  const maxVal = top10[0]?.distance || 1;

  return (
    <ChartCard icon="emoji_events" title="Top 10 Performers" subtitle="By total distance covered" badge="Distance (km)" height={320}>
      <ResponsiveContainer width="100%" height={310}>
        <BarChart data={top10} layout="vertical" margin={{ top: 4, right: 56, left: 8, bottom: 4 }} barCategoryGap="22%">
          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f5" />
          <XAxis type="number" tick={{ fontSize: 10, fill: "#9094a8" }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v.toLocaleString()}`} />
          <YAxis type="category" dataKey="name" width={130} tick={{ fontSize: 10, fill: "#344767", fontWeight: 500 }} axisLine={false} tickLine={false} />
          <RTooltip content={<CustomTooltip formatter={(p) => `${p.payload.fullName}: ${p.value?.toLocaleString()} km`} />} cursor={{ fill: "rgba(26,115,232,0.04)" }} />
          <Bar dataKey="distance" radius={[0, 6, 6, 0]} maxBarSize={18} label={{ position: "right", fontSize: 10, fill: "#344767", formatter: (v) => `${v.toLocaleString()}` }}>
            {top10.map((entry, i) => <Cell key={i} fill={`rgba(26,115,232,${(0.35 + 0.65 * (entry.distance / maxVal)).toFixed(2)})`} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
};

TopPerformersBar.propTypes = { data: PropTypes.arrayOf(PropTypes.object).isRequired };

// ─── 2. Donut Chart — Fleet Distribution ─────────────────────────────────────
const renderActiveShape = (props) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, value } = props;
  return (
    <g>
      <text x={cx} y={cy - 12} textAnchor="middle" fill="#344767" style={{ fontSize: 13, fontWeight: 700 }}>{value}</text>
      <text x={cx} y={cy + 8} textAnchor="middle" fill="#9094a8" style={{ fontSize: 9 }}>devices</text>
      <text x={cx} y={cy + 22} textAnchor="middle" fill="#9094a8" style={{ fontSize: 8 }}>{((value / (payload.total || 1)) * 100).toFixed(1)}%</text>
      <Sector cx={cx} cy={cy} innerRadius={innerRadius} outerRadius={outerRadius + 6} startAngle={startAngle} endAngle={endAngle} fill={fill} />
      <Sector cx={cx} cy={cy} innerRadius={innerRadius - 4} outerRadius={innerRadius - 2} startAngle={startAngle} endAngle={endAngle} fill={fill} />
    </g>
  );
};

const FleetDonut = ({ data }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const top15 = useMemo(() => {
    const sorted = [...data].filter((a) => a.deviceCount > 0).sort((a, b) => b.deviceCount - a.deviceCount);
    const top = sorted.slice(0, 14);
    const rest = sorted.slice(14);
    const total = data.reduce((s, a) => s + (a.deviceCount || 0), 0);
    const result = top.map((a) => ({ ...a, name: a.accountName, value: a.deviceCount, total }));
    if (rest.length) result.push({ name: `Others (${rest.length})`, value: rest.reduce((s, a) => s + (a.deviceCount || 0), 0), total, accountName: "Other accounts" });
    return result;
  }, [data]);

  return (
    <ChartCard icon="donut_large" title="Fleet Distribution" subtitle="Share of devices per sub-account" badge="Devices" height={320}>
      <Box display="flex" alignItems="center" gap={1} sx={{ height: 310 }}>
        <ResponsiveContainer width="55%" height="100%">
          <PieChart>
            <Pie activeIndex={activeIndex} activeShape={renderActiveShape} data={top15} cx="50%" cy="50%" innerRadius={72} outerRadius={100} dataKey="value" onMouseEnter={(_, i) => setActiveIndex(i)}>
              {top15.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <Box sx={{ flex: 1, overflowY: "auto", maxHeight: 290, pr: 0.5 }}>
          {top15.map((item, i) => (
            <Box key={i} onMouseEnter={() => setActiveIndex(i)} display="flex" alignItems="center" gap={0.8} sx={{ py: 0.4, px: 0.5, borderRadius: 1, cursor: "pointer", background: activeIndex === i ? "#f0f4ff" : "transparent" }}>
              <Box sx={{ width: 8, height: 8, borderRadius: "50%", background: PIE_COLORS[i % PIE_COLORS.length], flexShrink: 0 }} />
              <MDTypography sx={{ fontSize: "0.62rem", color: "#344767", flex: 1 }}>{item.name}</MDTypography>
              <MDTypography sx={{ fontSize: "0.62rem", fontWeight: 700, color: "#1A73E8" }}>{item.value}</MDTypography>
            </Box>
          ))}
        </Box>
      </Box>
    </ChartCard>
  );
};

FleetDonut.propTypes = { data: PropTypes.arrayOf(PropTypes.object).isRequired };

// ─── 3. Scatter Plot — Efficiency Analysis ────────────────────────────────────
// const EfficiencyScatter = ({ data }) => {
//   const points = useMemo(() => data.filter(a => a.totalDistance > 0 || a.totalRunTime > 0).map(a => ({
//     x: a.totalDistance || 0,
//     y: Math.round((a.totalRunTime || 0) / 60),
//     z: a.deviceCount || 1,
//     name: a.accountName,
//   })), [data]);

//   return (
//     // <ChartCard icon="scatter_plot" title="Efficiency Analysis" subtitle="Distance vs Run Time (min) · size = devices" badge="Scatter" height={320}>
//     //   <ResponsiveContainer width="100%" height={280}>
//     //     <ScatterChart margin={{ top: 8, right: 24, left: 0, bottom: 20 }}>
//     //       <CartesianGrid stroke="#f0f0f5" strokeDasharray="4 4" />
//     //       <XAxis type="number" dataKey="x" name="Distance" tick={{ fontSize: 10 }} axisLine={false} label={{ value: "km", position: "insideBottom", offset: -10, fontSize: 10 }} />
//     //       <YAxis type="number" dataKey="y" name="Run Time" tick={{ fontSize: 10 }} axisLine={false} label={{ value: "min", angle: -90, position: "insideLeft", fontSize: 10 }} />
//     //       <ZAxis type="number" dataKey="z" range={[40, 400]} />
//     //       <RTooltip content={({ active, payload }) => {
//     //         if (!active || !payload?.length) return null;
//     //         const p = payload[0].payload;
//     //         return (
//     //           <Box sx={{ background: "#1e1e2e", borderRadius: 2, px: 2, py: 1.5, color: "#fff" }}>
//     //             <MDTypography sx={{ fontSize: "0.72rem", fontWeight: 700, color: "#fff" }}>{p.name}</MDTypography>
//     //             <MDTypography sx={{ fontSize: "0.68rem", color: "rgba(255,255,255,0.7)" }}>Dist: {p.x}km | Time: {p.y}m | Devices: {p.z}</MDTypography>
//     //           </Box>
//     //         );
//     //       }} />
//     //       <Scatter data={points} shape={<ScatterPoint />} />
//     //     </ScatterChart>
//     //   </ResponsiveContainer>
//     // </ChartCard>
//   );
// };

// EfficiencyScatter.propTypes = { data: PropTypes.arrayOf(PropTypes.object).isRequired };

// ─── Main Component ───────────────────────────────────────────────────────────
const AccountSummaryCharts = ({ childAccounts }) => {
  // Use flattening to ensure nested sub-accounts are visible to the charts
  const flattenedData = useMemo(() => flattenAccounts(childAccounts), [childAccounts]);

  if (!flattenedData.length) return null;

  return (
    <Box sx={{ mb: 3 }}>
      <Box display="flex" alignItems="center" gap={1} mb={2}>
        <Icon sx={{ color: "#1A73E8", fontSize: 18 }}>bar_chart</Icon>
        <MDTypography variant="h6" fontWeight="bold" sx={{ fontSize: "0.9rem", color: "#344767" }}>Analytics Overview</MDTypography>
        <Chip label={`${flattenedData.length} active units`} size="small" sx={{ ml: 0.5, fontSize: "0.6rem", height: 20, background: "#e3f0ff", color: "#1A73E8", fontWeight: 700 }} />
      </Box>

      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 2.5 }}>
        <TopPerformersBar data={flattenedData} />
        <FleetDonut data={flattenedData} />
        {/* <EfficiencyScatter data={flattenedData} /> */}
        {/* FleetTreemap component code should be placed here if you wish to use it */}
      </Box>
    </Box>
  );
};

AccountSummaryCharts.propTypes = {
  childAccounts: PropTypes.arrayOf(PropTypes.object).isRequired,
};

export default AccountSummaryCharts;