import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import ApiService from "../../services/ApiService";

// Material Dashboard 2 React components
import MDBox from "../../../src/assets/components/MDBox";
import MDTypography from "../../../src/assets/components/MDTypography";
import MDButton from "../../../src/assets/components/MDButton";
import MDInput from "../../../src/assets/components/MDInput";
import Autocomplete from "@mui/material/Autocomplete";

// Layout
import DashboardLayout from "../../../src/assets/components/examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "../../../src/assets/components/examples/Navbars/DashboardNavbar";

// MUI
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Icon from "@mui/material/Icon";
import SendIcon from "@mui/icons-material/Send";

// Recharts
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const CHATBOT_ICON_PLACEHOLDER = "https://cdn-icons-png.flaticon.com/512/4712/4712001.png";

// ---------- MOCK DATA (Retained) ----------
const vehicleSummaryMock = {
  vehicleNumber: "MH12-AB-1234",
  activeAlerts: 12,
};

const fuelUsageData = [
  { name: "Consumed", value: 68, color: "#FF6B6B" },
  { name: "Remaining", value: 32, color: "#4FD1C5" },
];

const avgSpeedData = [
  { trip: "Trip 1", actual: 60, limit: 80 },
  { trip: "Trip 2", actual: 72, limit: 80 },
  { trip: "Trip 3", actual: 55, limit: 80 },
  { trip: "Trip 4", actual: 85, limit: 90 },
  { trip: "Trip 5", actual: 77, limit: 90 },
];

const fuelTrendData = [
  { day: "Mon", last: 45, current: 48 },
  { day: "Tue", last: 47, current: 50 },
  { day: "Wed", last: 49, current: 52 },
];

function DistanceReport() {
  const navigate = useNavigate();
  const [imeiList, setImeiList] = useState([]);
  const [selectedImei, setSelectedImei] = useState("");
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);

  // Date Selection States
  const [startDate, setStartDate] = useState("2026-01-01T14:09");
  const [endDate, setEndDate] = useState("2026-03-09T14:09");

  // 1. Fetch IMEI Dropdown
  useEffect(() => {
    ApiService.getImeiDropdown(1).then((res) => {
      const vehicles = res?.data?.response?.vehicles || [];
      setImeiList(vehicles);
      if (vehicles.length > 0) setSelectedImei(vehicles[0].imei);
    });
  }, []);

  // 2. Fetch Report when IMEI changes
  useEffect(() => {
    if (selectedImei) fetchReport(selectedImei);
  }, [selectedImei]);

  const fetchReport = (imei) => {
    if (!imei) return;
    setLoading(true);

    // Helper to format date as D/MM/YYYY
    const formatDateForPayload = (dateStr) => {
      const d = new Date(dateStr);
      return `${d.getDate()}/${(d.getMonth() + 1).toString().padStart(2, "0")}/${d.getFullYear()}`;
    };

    const payload = {
      imei: imei, // Dynamically use the passed imei
      startDate: formatDateForPayload(startDate), // Formats to "1/01/2026"
      endDate: formatDateForPayload(endDate), // Formats to "11/03/2026"
    };

    // Using the helper method from ApiService
    ApiService.getDistanceReport(payload)
      .then((responseData) => {
        if (responseData) {
          setReportData(responseData.data);
        }
      })
      .catch((err) => {
        console.error("Report Fetch Error:", err);
      })
      .finally(() => setLoading(false));
  };

  // ---- CHART DATE FORMATTER ----
  const formatChartDate = (tickItem) => {
    if (!tickItem) return "";
    return new Date(tickItem).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
  };

  // ---- CHATBOT STATE ----
  const CHAT_STEP = useMemo(
    () => ({ ASK_IMEI: "ask_imei", SHOW_OPTIONS: "show_options", COMPLETE: "complete" }),
    []
  );
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);
  const [messages, setMessages] = useState([
    { type: "bot", text: "Hello! Please provide the **IMEI** number." },
  ]);
  const [imeiInput, setImeiInput] = useState("");
  const [chatStep, setChatStep] = useState(CHAT_STEP.ASK_IMEI);

  const toggleChatbot = () => setIsChatbotOpen((v) => !v);
  const handleImeiSubmit = () => {
    if (!imeiInput.trim()) return;
    const send = imeiInput.trim();
    setMessages((prev) => [...prev, { type: "user", text: send }]);
    setSelectedImei(send);
    setImeiInput("");
    setChatStep(CHAT_STEP.SHOW_OPTIONS);
  };

  const handleOptionSelect = (option) => {
    setMessages((prev) => [...prev, { type: "user", text: option }]);
    if (option === "Alert Logs") navigate("/alerts");
    else if (option === "Track/Play") navigate("/notifications");
    setChatStep(CHAT_STEP.COMPLETE);
  };

  // Styles
  const iconStyle = {
    position: "fixed",
    bottom: "28px",
    right: "28px",
    width: "54px",
    height: "54px",
    borderRadius: "50%",
    cursor: "pointer",
    zIndex: 1300,
    background: "linear-gradient(135deg, #2563EB, #38BDF8)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  };
  const widgetStyle = {
    position: "fixed",
    bottom: "96px",
    right: "28px",
    width: "360px",
    height: "460px",
    backgroundColor: "#fff",
    borderRadius: 16,
    display: isChatbotOpen ? "flex" : "none",
    flexDirection: "column",
    zIndex: 1299,
    boxShadow: "0 24px 60px rgba(0,0,0,0.3)",
  };
  const headerStyle = {
    padding: "10px 16px",
    background: "linear-gradient(135deg, #0f766e, #38bdf8)",
    color: "#fff",
    display: "flex",
    justifyContent: "space-between",
  };
  const bodyStyle = {
    flexGrow: 1,
    padding: "16px",
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  };
  const footerStyle = { padding: "10px", borderTop: "1px solid #eee", display: "flex", gap: "8px" };
  const getMessageStyle = (type) => ({
    padding: "8px 12px",
    borderRadius: "12px",
    backgroundColor: type === "user" ? "#2563EB" : "#E5E7EB",
    color: type === "user" ? "#fff" : "#000",
    alignSelf: type === "user" ? "flex-end" : "flex-start",
    fontSize: "0.85rem",
  });

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={2.5} px={1}>
        {/* FILTER ROW */}
        <Card sx={{ p: 2, mb: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <Autocomplete
                options={imeiList}
                getOptionLabel={(option) => `${option.vehnum} (${option.imei})`}
                value={imeiList.find((v) => v.imei === selectedImei) || null}
                onChange={(event, newValue) => {
                  if (newValue) {
                    setSelectedImei(newValue.imei);
                  }
                }}
                renderInput={(params) => (
                  <MDInput {...params} label="Search Vehicle / IMEI" fullWidth />
                )}
                // Optional: stylistic tweaks to match Material Dashboard 2
                sx={{
                  "& .MuiOutlinedInput-root": {
                    padding: "2px",
                  },
                }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <MDInput
                type="datetime-local"
                label="Start"
                value={startDate}
                fullWidth
                onChange={(e) => setStartDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <MDInput
                type="datetime-local"
                label="End"
                value={endDate}
                fullWidth
                onChange={(e) => setEndDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <MDButton
                variant="gradient"
                color="info"
                fullWidth
                onClick={() => fetchReport(selectedImei)}
              >
                {loading ? "..." : "Refresh"}
              </MDButton>
            </Grid>
          </Grid>
        </Card>

        {/* SUMMARY CARDS */}
        <Grid container spacing={2.5} mb={3}>
          <Grid item xs={12} md={3}>
            <SummaryCard
              label="Vehicle Number"
              value={reportData?.vehicleDistances?.[0]?.vehNum || vehicleSummaryMock.vehicleNumber}
              gradient="linear-gradient(135deg,#E0F2FE,#EFF6FF)"
              accent="#2563EB"
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <SummaryCard
              label="IMEI Number"
              value={reportData?.imei || "---"}
              gradient="linear-gradient(135deg,#ECFDF5,#DCFCE7)"
              accent="#16A34A"
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <SummaryCard
              label="Total Distance"
              value={`${reportData?.totalDistanceKm || 0} km`}
              gradient="linear-gradient(135deg,#EEF2FF,#E0E7FF)"
              accent="#4F46E5"
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <SummaryCard
              label="Active Alerts"
              value={vehicleSummaryMock.activeAlerts}
              gradient="linear-gradient(135deg,#FEF2F2,#FEE2E2)"
              accent="#DC2626"
            />
          </Grid>
        </Grid>

        {/* DISTANCE AREA CHART */}
        <Grid container spacing={2.5} mb={3}>
          <Grid item xs={12} md={8}>
            <Card sx={{ borderRadius: 3, border: "1px solid #E5E7EB" }}>
              <MDBox pt={2.5} px={3}>
                <MDTypography variant="h6" fontWeight="medium">
                  Daily Distance Covered
                </MDTypography>
              </MDBox>
              <MDBox p={3} sx={{ height: 260 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={reportData?.vehicleDistances || []}>
                    <defs>
                      <linearGradient id="usageGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#38BDF8" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#E0F2FE" stopOpacity={0.1} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis
                      dataKey="repDate"
                      tickFormatter={formatChartDate}
                      tick={{ fontSize: 10 }}
                    />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip labelFormatter={formatChartDate} />
                    <Area
                      type="monotone"
                      dataKey="distance"
                      stroke="#0EA5E9"
                      fill="url(#usageGrad)"
                      strokeWidth={2}
                      dot={{ r: 3 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </MDBox>
            </Card>
          </Grid>

          {/* FUEL DONUT (Mock preserved) */}
          <Grid item xs={12} md={4}>
            <Card sx={{ borderRadius: 3, p: 3, border: "1px solid #E5E7EB" }}>
              <MDTypography variant="h6">Fuel Usage</MDTypography>
              <FuelDonut data={fuelUsageData} />
              <MDBox mt={2} display="flex" justifyContent="center" gap={2}>
                <LegendItem color="#FF6B6B" label="Consumed" />
                <LegendItem color="#4FD1C5" label="Remaining" />
              </MDBox>
            </Card>
          </Grid>
        </Grid>

        {/* BOTTOM ROW (Mock data preserved) */}
        <Grid container spacing={2.5}>
          <Grid item xs={12} md={6}>
            <Card sx={{ p: 3, border: "1px solid #E5E7EB" }}>
              <MDTypography variant="h6">Average Speed</MDTypography>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={avgSpeedData}>
                  <XAxis dataKey="trip" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="actual" fill="#FB7185" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card sx={{ p: 3, border: "1px solid #E5E7EB" }}>
              <MDTypography variant="h6">Fuel Trend</MDTypography>
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={fuelTrendData}>
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Line dataKey="current" stroke="#F97316" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          </Grid>
        </Grid>
      </MDBox>

      {/* CHATBOT ICON & WIDGET */}
      <div style={iconStyle} onClick={toggleChatbot}>
        <img src={CHATBOT_ICON_PLACEHOLDER} alt="bot" style={{ width: 26, filter: "invert(1)" }} />
      </div>
      <div style={widgetStyle}>
        <div style={headerStyle}>
          <MDTypography variant="h6" color="white">
            Assistant
          </MDTypography>
          <button
            style={{ background: "none", border: "none", color: "#fff", cursor: "pointer" }}
            onClick={toggleChatbot}
          >
            ×
          </button>
        </div>
        <div style={bodyStyle}>
          {messages.map((m, i) => (
            <div key={i} style={getMessageStyle(m.type)}>
              {m.text}
            </div>
          ))}
          {chatStep === CHAT_STEP.SHOW_OPTIONS && (
            <MDButton
              variant="outlined"
              color="info"
              onClick={() => handleOptionSelect("Alert Logs")}
            >
              Alert Logs
            </MDButton>
          )}
        </div>
        <div style={footerStyle}>
          <MDInput
            fullWidth
            value={imeiInput}
            onChange={(e) => setImeiInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleImeiSubmit()}
          />
          <MDButton onClick={handleImeiSubmit}>
            <SendIcon />
          </MDButton>
        </div>
      </div>
    </DashboardLayout>
  );
}

// Presentational Components
function SummaryCard({ label, value, gradient, accent }) {
  return (
    <Card
      sx={{
        height: "100%",
        backgroundImage: gradient,
        backgroundSize: "cover",
        borderRadius: 3,
        border: "1px solid rgba(0,0,0,0.05)",
        boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
      }}
    >
      <MDBox p={2.4}>
        <MDTypography
          variant="caption"
          textTransform="uppercase"
          sx={{ opacity: 0.7, fontSize: 11 }}
        >
          {label}
        </MDTypography>
        <MDTypography variant="h6" fontWeight="bold" mt={0.8}>
          {value}
        </MDTypography>
        <MDBox mt={1.6} sx={{ width: "42%", height: 3, borderRadius: 999, background: accent }} />
      </MDBox>
    </Card>
  );
}
SummaryCard.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  gradient: PropTypes.string.isRequired,
  accent: PropTypes.string.isRequired,
};

function LegendItem({ color, label }) {
  return (
    <MDBox display="flex" alignItems="center" gap={0.8}>
      <span style={{ width: 10, height: 10, borderRadius: "50%", backgroundColor: color }} />
      <MDTypography variant="caption" sx={{ fontSize: 11 }}>
        {label}
      </MDTypography>
    </MDBox>
  );
}
LegendItem.propTypes = { color: PropTypes.string.isRequired, label: PropTypes.string.isRequired };

function FuelDonut({ data }) {
  const consumed = data.find((d) => d.name === "Consumed")?.value || 0;
  const size = 180;
  const strokeWidth = 18;
  const radius = (size - strokeWidth) / 2;
  const center = size / 2;
  const circumference = 2 * Math.PI * radius;
  const consumedLength = (consumed / 100) * circumference;
  return (
    <div style={{ position: "relative", width: size, height: size, margin: "auto" }}>
      <svg width={size} height={size}>
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="#E5E7EB"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="#FB7185"
          strokeWidth={strokeWidth}
          strokeDasharray={`${consumedLength} ${circumference}`}
          strokeLinecap="round"
          transform={`rotate(-90 ${center} ${center})`}
        />
      </svg>
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          textAlign: "center",
        }}
      >
        <MDTypography variant="h5" fontWeight="bold">
          {consumed}%
        </MDTypography>
        <MDTypography variant="caption" color="text.secondary" sx={{ fontSize: 11 }}>
          Fuel
        </MDTypography>
      </div>
    </div>
  );
}
FuelDonut.propTypes = { data: PropTypes.array.isRequired };

export default DistanceReport;
