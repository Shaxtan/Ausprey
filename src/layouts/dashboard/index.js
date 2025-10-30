import React, { useState, useMemo, useEffect } from "react";
import ApiService from "services/ApiService";

/**
=========================================================
* Material Dashboard 2 React - v2.2.0
=========================================================
*/

// @mui icons
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import CloudOffIcon from "@mui/icons-material/CloudOff";
import DevicesIcon from "@mui/icons-material/Devices"; // Icon for Total Devices
import WifiIcon from "@mui/icons-material/Wifi"; // Icon for Online
import DirectionsRunIcon from "@mui/icons-material/DirectionsRun"; // Icon for Motion
import DonutLargeIcon from "@mui/icons-material/DonutLarge"; // Icon for Pie Chart
import Icon from "@mui/material/Icon"; // Import Icon for general use
import SendIcon from "@mui/icons-material/Send"; // Icon for send button
import StopIcon from "@mui/icons-material/Stop"; // Icon for Online Stopped

// @mui material components
import Grid from "@mui/material/Grid";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDButton from "components/MDButton";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";

// Material Dashboard 2 React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import ReportsBarChart from "examples/Charts/BarCharts/ReportsBarChart";
import ReportsLineChart from "examples/Charts/LineCharts/ReportsLineChart";
import ComplexStatisticsCard from "examples/Cards/StatisticsCards/ComplexStatisticsCard";
import PieChart from "examples/Charts/PieChart";

// Data
import reportsLineChartData from "layouts/dashboard/data/reportsLineChartData";

// Dashboard components
import Projects from "layouts/dashboard/components/Projects";
import OrdersOverview from "layouts/dashboard/components/OrdersOverview";

// Placeholder for a Chatbot Icon URL
const CHATBOT_ICON_PLACEHOLDER = "https://cdn-icons-png.flaticon.com/512/4712/4712001.png";

// Mock Pie Chart Data (will be replaced by live data)
const alertTypePieData = {
  labels: ["Critical (Error)", "Warning", "Informational"],
  datasets: {
    label: "Alert Types",
    backgroundColors: ["error", "warning", "info"],
    data: [50, 120, 300], // Example data
  },
};

function Dashboard() {
  const { sales, tasks } = reportsLineChartData;

  // =========================================================================
  // === API STATE & LOGIC EXTRACTED FROM OLD DASHBOARD ===
  // =========================================================================
  const [totalDevices, setTotalDevices] = useState(0);
  const [onlineDevices, setOnlineDevices] = useState(0);
  const [offlineDevices, setOfflineDevices] = useState(0);
  const [pieData, setPieData] = useState([]); // Used for Online/Offline PieChart
  const [devices, setDevices] = useState([]); // List of devices
  const [tripData, setTripData] = useState([]); // Data for the table (not rendered here)
  const [summaryData, setSummaryData] = useState({
    offline: 0,
    onlineIdle: 0,
    onlineStopped: 0,
    onlineMotion: 0,
  });

  useEffect(() => {
    // console.log("Fetching dashboard data...");
    ApiService.getDashboardData(
      {},
      (res) => {
        if (res?.data?.resultCode === 1 && res?.data?.data) {
          const { summary, data } = res.data.data;

          // 1. Set Summary Data (for Stat Cards)
          const newSummary = {
            offline: summary.offline || 0,
            onlineIdle: summary.onlineIdle || 0,
            onlineStopped: summary.onlineStopped || 0,
            onlineMotion: summary.onlineMotion || 0,
          };
          setSummaryData(newSummary);

          // 2. Calculate Totals and Pie Chart Data
          const online = newSummary.onlineIdle + newSummary.onlineStopped + newSummary.onlineMotion;
          const offline = newSummary.offline;
          const total = online + offline;

          setTotalDevices(total);
          setOnlineDevices(online);
          setOfflineDevices(offline);

          // Data structure for Online vs. Offline Pie Chart
          setPieData([
            { name: "Online", value: online },
            { name: "Offline", value: offline },
          ]);

          // Process and set other data (for chatbot and potential list use)
          const fetchedDevices = data.map((item) => ({
            imei: item.imei || "N/A",
            accountId: item.vehnum || "N/A",
            name: item.name || "N/A",
            status: item.gps === "A" ? "active" : "inactive", // Simplified status for device list
          }));
          setDevices(fetchedDevices);

          // Trip data processing is skipped for brevity but kept in state logic
          const fetchedTripData = data.map((item, index) => ({
            id: index + 1,
            // ... (rest of the trip data fields)
          }));
          setTripData(fetchedTripData);
        } else {
          console.error("Dashboard data fetch failed:", res?.message || "Unknown error");
        }
      },
      true,
      1
    );
  }, []);
  // =========================================================================

  // Helper to format pie chart data for MD PieChart component
  const onlineOfflinePieData = useMemo(() => {
    const onlineValue = pieData.find((item) => item.name === "Online")?.value || 0;
    const offlineValue = pieData.find((item) => item.name === "Offline")?.value || 0;

    return {
      labels: ["Online", "Offline"],
      datasets: {
        label: "Connection Status",
        backgroundColors: ["success", "error"],
        data: [onlineValue, offlineValue],
      },
    };
  }, [pieData]);

  const allDeviceStatusPieData = useMemo(() => {
    return {
      labels: ["Motion", "Idle", "Stopped", "Offline"],
      datasets: {
        label: "Device Status",
        backgroundColors: ["success", "primary", "info", "error"],
        data: [
          summaryData.onlineMotion,
          summaryData.onlineIdle,
          summaryData.onlineStopped,
          summaryData.offline,
        ],
      },
    };
  }, [summaryData]);

  // =========================================================================
  // === CHATBOT STATE & LOGIC (Modified for IMEI validation) ===
  // =========================================================================
  const CHAT_STEP = useMemo(
    () => ({
      ASK_IMEI: "ask_imei",
      SHOW_OPTIONS: "show_options",
      COMPLETE: "complete",
    }),
    []
  );

  const [isChatbotOpen, setIsChatbotOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      type: "bot",
      text: "Hello! I'm your virtual assistant. To begin, please provide the **IMEI** number of the device you want to manage.",
    },
  ]);
  const [imeiInput, setImeiInput] = useState("");
  const [chatStep, setChatStep] = useState(CHAT_STEP.ASK_IMEI);
  const [activeImei, setActiveImei] = useState(null); // To store the validated IMEI

  const toggleChatbot = () => {
    setIsChatbotOpen(!isChatbotOpen);
  };

  const handleImeiSubmit = () => {
    const enteredImei = imeiInput.trim();
    if (enteredImei === "") return;

    // 1. Add user message
    const newUserMessage = { type: "user", text: enteredImei };
    setMessages((prev) => [...prev, newUserMessage]);

    // 2. Clear input
    setImeiInput("");

    // 3. Find the device in the loaded list (API logic implementation)
    const foundDevice = devices.find((d) => d.imei === enteredImei);

    setTimeout(() => {
      let botResponse;
      let nextStep;

      if (foundDevice) {
        // Success path: Device found
        botResponse = {
          type: "bot",
          text: `Thank you. Device **${
            foundDevice.name
          }** (IMEI: ${enteredImei}) has been successfully identified. Its current status is **${foundDevice.status.toUpperCase()}**. What would you like to do next?`,
        };
        setActiveImei(enteredImei);
        nextStep = CHAT_STEP.SHOW_OPTIONS;
      } else {
        // Failure path: Device not found
        botResponse = {
          type: "bot",
          text: `I could not find an active device with the IMEI **${enteredImei}**. Please check the number and try again.`,
        };
        nextStep = CHAT_STEP.ASK_IMEI; // Stay on the current step to re-enter
        setActiveImei(null);
      }

      setMessages((prev) => [...prev, botResponse]);
      setChatStep(nextStep);

      // Scroll to bottom (simulated)
      const body = document.getElementById("chatbot-body-content");
      if (body) body.scrollTop = body.scrollHeight;
    }, 1000); // Simulate API check delay
  };

  const handleOptionSelect = (option) => {
    // 1. Add user message
    const newUserMessage = { type: "user", text: option };
    setMessages((prev) => [...prev, newUserMessage]);

    // 2. Simulate action and close conversation
    setTimeout(() => {
      let botResponseText = "";
      if (option === "Alert Logs") {
        botResponseText = `You selected **Alert Logs** for IMEI **${activeImei}**. I can navigate you to the appropriate section or provide a direct link to the log data.`;
      } else {
        botResponseText = `You selected **${option}** for IMEI **${activeImei}**. I will now open the corresponding dashboard view for this device.`;
      }

      const botResponse = {
        type: "bot",
        text: `${botResponseText} This conversation is now complete. You can close the widget.`,
      };
      setMessages((prev) => [...prev, botResponse]);
      setChatStep(CHAT_STEP.COMPLETE); // Mark as complete
      // Scroll to bottom (simulated)
      const body = document.getElementById("chatbot-body-content");
      if (body) body.scrollTop = body.scrollHeight;
    }, 1000);
  };

  // --- INLINE STYLE OBJECTS FOR CHATBOT (Unmodified) ---

  const iconStyle = {
    position: "fixed",
    bottom: "30px",
    right: "30px",
    width: "60px",
    height: "60px",
    borderRadius: "50%",
    cursor: "pointer",
    zIndex: 10000,
    backgroundColor: "#1A73E8", // MD Info color
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  };

  const widgetStyle = {
    position: "fixed",
    bottom: "100px",
    right: "30px",
    width: "350px",
    height: "450px",
    backgroundColor: "#fff",
    borderRadius: "8px",
    boxShadow: "0 8px 30px rgba(0, 0, 0, 0.3)",
    zIndex: 9999,
    display: "flex",
    flexDirection: "column",
    opacity: isChatbotOpen ? 1 : 0,
    visibility: isChatbotOpen ? "visible" : "hidden",
    transform: isChatbotOpen ? "translateY(0)" : "translateY(20px)",
    transition: "opacity 0.3s ease, transform 0.3s ease, visibility 0.3s",
  };

  const headerStyle = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "10px 15px",
    backgroundColor: "#1A73E8",
    color: "white",
    borderTopLeftRadius: "8px",
    borderTopRightRadius: "8px",
  };

  const closeBtnStyle = {
    background: "none",
    border: "none",
    color: "white",
    fontSize: "1.5rem",
    cursor: "pointer",
    lineHeight: 1,
  };

  const bodyStyle = {
    flexGrow: 1,
    padding: "15px",
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  };

  const footerStyle = {
    padding: "10px 15px",
    borderTop: "1px solid #eee",
    display: "flex",
    gap: "8px",
  };

  // Helper function to apply message styles based on type
  const getMessageStyle = (type) => ({
    maxWidth: "80%",
    padding: "8px 12px",
    borderRadius: "18px",
    wordWrap: "break-word",
    margin: "0",
    fontSize: "0.9rem",
    alignSelf: type === "user" ? "flex-end" : "flex-start",
    backgroundColor: type === "user" ? "#1A73E8" : "#e9e9e9",
    color: type === "user" ? "white" : "#333",
    // Tapered edges for a more modern chat look
    borderBottomLeftRadius: type === "user" ? "18px" : "2px",
    borderBottomRightRadius: type === "user" ? "2px" : "18px",
  });

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3}>
        {/* --- Complex Statistics Cards --- (UPDATED WITH LIVE DATA) */}
        <Grid container spacing={3}>
          {/* Total Devices */}
          <Grid item xs={12} md={6} lg={3}>
            <MDBox mb={1.5}>
              <ComplexStatisticsCard
                color="dark"
                icon={<DevicesIcon style={{ marginTop: "-15px" }} />}
                title="Total Devices"
                count={totalDevices.toLocaleString()}
                percentage={{
                  color: "success",
                  amount: "+55%", // Placeholder %
                  label: "than last week",
                }}
              />
            </MDBox>
          </Grid>
          {/* Online Motion */}
          <Grid item xs={12} md={6} lg={3}>
            <MDBox mb={1.5}>
              <ComplexStatisticsCard
                icon={<DirectionsRunIcon style={{ marginTop: "-15px" }} />}
                title="Online Motion"
                count={summaryData.onlineMotion.toLocaleString()}
                percentage={{
                  color: "success",
                  amount: "+3%", // Placeholder %
                  label: "than last month",
                }}
              />
            </MDBox>
          </Grid>
          {/* Online Idle */}
          <Grid item xs={12} md={6} lg={3}>
            <MDBox mb={1.5}>
              <ComplexStatisticsCard
                color="primary"
                icon={<HourglassEmptyIcon style={{ marginTop: "-15px" }} />}
                title="Online Idle"
                count={summaryData.onlineIdle.toLocaleString()}
                percentage={{
                  color: "success",
                  amount: "", // Placeholder %
                  label: "Just updated",
                }}
              />
            </MDBox>
          </Grid>
          {/* Offline */}
          <Grid item xs={12} md={6} lg={3}>
            <MDBox mb={1.5}>
              <ComplexStatisticsCard
                color="error"
                icon={<CloudOffIcon style={{ marginTop: "-15px" }} />}
                title="Offline"
                count={summaryData.offline.toLocaleString()}
                percentage={{
                  color: "error",
                  amount: "+1%", // Placeholder %
                  label: "more than yesterday",
                }}
              />
            </MDBox>
          </Grid>
          {/* Online Stopped (Added as 5th card) */}
          {/* <Grid item xs={12} md={6} lg={3}>
            <MDBox mb={1.5}>
              <ComplexStatisticsCard
                color="info"
                icon={<StopIcon style={{ marginTop: "-15px" }} />}
                title="Online Stopped"
                count={summaryData.onlineStopped.toLocaleString()}
                percentage={{
                  color: "success",
                  amount: "+0.5%", // Placeholder %
                  label: "since last hour",
                }}
              />
            </MDBox>
          </Grid> */}
        </Grid>

        {/* --- Charts Section --- (UPDATED WITH LIVE DATA) */}
        <MDBox mt={4.5}>
          {/* Pie Charts on a separate row */}
          <Grid container spacing={3}>
            {/* Online vs. Offline Pie Chart */}
            <Grid item xs={12} md={6} lg={4}>
              <MDBox mb={3} sx={{ height: "300px !important" }}>
                <PieChart
                  icon={{ color: "success", component: <WifiIcon /> }}
                  title="Online vs. Offline"
                  description={`Total devices: ${totalDevices.toLocaleString()}`}
                  chart={onlineOfflinePieData}
                />
              </MDBox>
            </Grid>
            {/* All Device Statuses Pie Chart */}
            <Grid item xs={12} md={6} lg={4}>
              <MDBox mb={3} sx={{ height: "300px !important" }}>
                <PieChart
                  icon={{ color: "dark", component: <DonutLargeIcon /> }}
                  title="All Device Status"
                  description="Distribution including Motion, Idle, and Stopped."
                  chart={allDeviceStatusPieData}
                />
              </MDBox>
            </Grid>
            {/* Alert Type Distribution Pie Chart (MOCK DATA) */}
            <Grid item xs={12} md={6} lg={4}>
              <MDBox mb={3} sx={{ height: "300px !important" }}>
                <PieChart
                  icon={{ color: "warning", component: <Icon>notifications_active</Icon> }}
                  title="Alert Type Distribution"
                  description="Breakdown of Critical, Warning, and Info alerts."
                  chart={alertTypePieData} // Using mock data for alerts
                />
              </MDBox>
            </Grid>
          </Grid>
        </MDBox>

        {/* --- Projects and Orders Overview Section --- */}
        <MDBox>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6} lg={8}>
              <Projects />
            </Grid>
            <Grid item xs={12} md={6} lg={4}>
              <OrdersOverview />
            </Grid>
          </Grid>
        </MDBox>
      </MDBox>

      {/* --- START CHATBOT INTEGRATION SECTION (Modified for IMEI validation) --- */}

      {/* ⭐️ CHATBOT ICON BUTTON */}
      <div style={iconStyle} onClick={toggleChatbot}>
        <img
          src={CHATBOT_ICON_PLACEHOLDER}
          alt="Chatbot Icon"
          style={{ width: 30, height: 30, filter: "invert(1)" }}
        />
      </div>

      {/* ⭐️ CHATBOT WIDGET PANEL */}
      <div style={widgetStyle}>
        <div style={headerStyle}>
          <MDTypography variant="h6" color="white" style={{ margin: 0 }}>
            Virtual Assistant
          </MDTypography>
          <button style={closeBtnStyle} onClick={toggleChatbot}>
            &times;
          </button>
        </div>

        {/* Chat Body */}
        <div id="chatbot-body-content" style={bodyStyle}>
          {messages.map((msg, index) => (
            <div key={index} style={getMessageStyle(msg.type)}>
              <MDTypography
                variant="button"
                fontWeight="regular"
                color={msg.type === "user" ? "white" : "dark"}
                dangerouslySetInnerHTML={{
                  __html: msg.text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>"),
                }}
              />
            </div>
          ))}

          {/* Quick Links / Options */}
          {chatStep === CHAT_STEP.SHOW_OPTIONS && (
            <MDBox mt={1}>
              <MDTypography variant="caption" color="text" sx={{ mb: 1 }}>
                Options for IMEI: {activeImei}
              </MDTypography>
              <MDButton
                variant="outlined"
                color="info"
                fullWidth
                sx={{ mb: 1.5 }}
                onClick={() => handleOptionSelect("Track/Play")}
              >
                Track/Play
              </MDButton>
              <MDButton
                variant="outlined"
                color="info"
                fullWidth
                sx={{ mb: 1.5 }}
                onClick={() => handleOptionSelect("Alert Logs")}
              >
                Alert Logs
              </MDButton>
              <MDButton
                variant="outlined"
                color="info"
                fullWidth
                onClick={() => handleOptionSelect("Trip Report")}
              >
                Trip Report
              </MDButton>
            </MDBox>
          )}
        </div>

        {/* Chat Input/Footer */}
        <div style={footerStyle}>
          {chatStep === CHAT_STEP.ASK_IMEI ? (
            <>
              <MDInput
                type="text"
                placeholder="Enter IMEI (e.g., 123456)"
                value={imeiInput}
                onChange={(e) => setImeiInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleImeiSubmit()}
                size="small"
                fullWidth
              />
              <MDButton
                variant="gradient"
                color="info"
                iconOnly
                onClick={handleImeiSubmit}
                sx={{ minWidth: "40px", height: "36px" }}
              >
                <Icon>
                  <SendIcon />
                </Icon>
              </MDButton>
            </>
          ) : (
            <MDInput
              type="text"
              placeholder={
                chatStep === CHAT_STEP.COMPLETE
                  ? "Conversation is complete"
                  : "Select an option above"
              }
              disabled
              size="small"
              fullWidth
            />
          )}
        </div>
      </div>
      {/* --- END CHATBOT INTEGRATION SECTION --- */}

      <Footer />
    </DashboardLayout>
  );
}
export default Dashboard;
