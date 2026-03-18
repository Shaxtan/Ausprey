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

// MUI
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import SendIcon from "@mui/icons-material/Send";

// Recharts
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import DashboardNavbarWithAccountContext from "assets/components/examples/Navbars/DashboardNavbar/DashboardNavbarWithAccountContext";

const CHATBOT_ICON_PLACEHOLDER = "https://cdn-icons-png.flaticon.com/512/4712/4712001.png";

// ---------- MOCK DATA (Retained) ----------
const vehicleSummaryMock = {
  vehicleNumber: "MH12-AB-1234",
  activeAlerts: 12,
};

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
  const [startDate, setStartDate] = useState("2026-03-18T00:00");
  const [endDate, setEndDate] = useState("2026-03-18T23:59");

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

    const formatDateForPayload = (dateStr) => {
      const d = new Date(dateStr);
      return `${d.getDate()}/${(d.getMonth() + 1).toString().padStart(2, "0")}/${d.getFullYear()}`;
    };

    const payload = {
      imei: imei,
      startDate: formatDateForPayload(startDate),
      endDate: formatDateForPayload(endDate),
    };

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

  // ---- DYNAMIC CHART LOGIC ----

  const isSingleDay = useMemo(() => {
    if (!startDate || !endDate) return false;
    return startDate.split("T")[0] === endDate.split("T")[0];
  }, [startDate, endDate]);

  const xAxisKey = isSingleDay ? "hr" : "repDate";

  const formatXAxis = (tickItem) => {
    if (tickItem === null || tickItem === undefined) return "";

    if (isSingleDay) {
      return `${tickItem}:00`;
    }

    return new Date(tickItem).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
    });
  };

  // Filter data to ensure valid bars are rendered
  const chartData = useMemo(() => {
    const rawData = reportData?.vehicleDistances || [];
    return rawData.filter((item) => item[xAxisKey] !== null && item[xAxisKey] !== undefined);
  }, [reportData, xAxisKey]);

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

  const handleQuickSelect = (type) => {
    const now = new Date();
    const end = new Date();
    let start = new Date();

    switch (type) {
      case "today":
        start.setHours(0, 0, 0, 0);
        break;
      case "yesterday":
        start.setDate(now.getDate() - 1);
        start.setHours(0, 0, 0, 0);
        end.setDate(now.getDate() - 1);
        end.setHours(23, 59, 59, 999);
        break;
      case "last7":
        start.setDate(now.getDate() - 7);
        start.setHours(0, 0, 0, 0);
        break;
      default:
        break;
    }

    const format = (date) => {
      const pad = (num) => num.toString().padStart(2, "0");
      const y = date.getFullYear();
      const m = pad(date.getMonth() + 1);
      const d = pad(date.getDate());
      const hh = pad(date.getHours());
      const mm = pad(date.getMinutes());
      return `${y}-${m}-${d}T${hh}:${mm}`;
    };

    setStartDate(format(start));
    setEndDate(format(end));
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
      <DashboardNavbarWithAccountContext />
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
            <Grid item xs={12}>
              <MDBox display="flex" gap={1} mb={1} ml={70}>
                <MDButton
                  variant="outlined"
                  color="info"
                  size="small"
                  onClick={() => handleQuickSelect("today")}
                >
                  Today
                </MDButton>
                <MDButton
                  variant="outlined"
                  color="info"
                  size="small"
                  onClick={() => handleQuickSelect("yesterday")}
                >
                  Yesterday
                </MDButton>
                <MDButton
                  variant="outlined"
                  color="info"
                  size="small"
                  onClick={() => handleQuickSelect("last7")}
                >
                  Last 7 Days
                </MDButton>
              </MDBox>
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

        {/* DISTANCE BAR CHART */}
        <Grid container spacing={2.5} mb={3}>
          <Grid item xs={12}>
            <Card sx={{ borderRadius: 3, border: "1px solid #E5E7EB" }}>
              <MDBox pt={2.5} px={3}>
                <MDTypography variant="h6" fontWeight="medium">
                  {isSingleDay ? "Hourly Distance Covered (km)" : "Daily Distance Covered (km)"}
                </MDTypography>
              </MDBox>
              <MDBox p={3} sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis
                      dataKey={xAxisKey}
                      tickFormatter={formatXAxis}
                      tick={{ fontSize: 11, fill: "#6B7280" }}
                      axisLine={false}
                      tickLine={false}
                      interval={isSingleDay ? 0 : "preserveStartEnd"}
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: "#6B7280" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      cursor={{ fill: "#f3f4f6" }}
                      labelFormatter={formatXAxis}
                      contentStyle={{
                        borderRadius: "10px",
                        border: "none",
                        boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                      }}
                    />
                    <Bar
                      dataKey="distance"
                      fill="#0EA5E9"
                      radius={[4, 4, 0, 0]}
                      barSize={isSingleDay ? 18 : 35}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </MDBox>
            </Card>
          </Grid>
        </Grid>

        {/* BOTTOM ROW */}
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

export default DistanceReport;
