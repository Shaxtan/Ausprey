import React, { useState, useMemo, useEffect } from "react";
import ApiService from "services/ApiService";

/**
=========================================================
* Material Dashboard 2 React - v2.2.0
=========================================================
*/
import MenuItem from "@mui/material/MenuItem";

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
import MDBox from "../../../src/assets/components/MDBox";
import MDButton from "../../../src/assets/components/MDButton";
import MDTypography from "../../../src/assets/components/MDTypography";
import MDInput from "../../../src/assets/components/MDInput";

// Material Dashboard 2 React example components
import DashboardLayout from "../../assets/components/examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "../../assets/components/examples/Navbars/DashboardNavbar";
import Footer from "../../assets/components/examples/Footer";
// import ReportsBarChart from "examples/Charts/BarCharts/ReportsBarChart";
// import ReportsLineChart from "examples/Charts/LineCharts/ReportsLineChart";
import ComplexStatisticsCard from "../../assets/components/examples/Cards/StatisticsCards/ComplexStatisticsCard";
import PieChart from "../../assets/components/examples/Charts/PieChart";

// Data
import reportsLineChartData from "../dashboard/data/reportsLineChartData";

// Dashboard components
import Projects from "./components/DashboardTable";
// import OrdersOverview from "./components/TopPerformersData";

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
  const [tripFilterType, setTripFilterType] = useState("bts-elock"); // default active
  const [btsOption, setBtsOption] = useState("");
  const [unreachableOption, setUnreachableOption] = useState("");

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
    totalDevices: 0,
    offline: 0,
    onlineIdle: 0,
    onlineStopped: 0,
    onlineMotion: 0,
    unreachable: 0,
  });

  useEffect(() => {
    ApiService.getDashboardData(
      {},
      (res) => {
        if (res?.data?.resultCode === 1 && res?.data?.data?.data) {
          const apiData = res.data.data.data; // ← New nesting level

          // 1. Extract Summary (This is what changed!)
          const summary = apiData.summary || {};
          const newSummary = {
            totalDevices: summary.totalDevices || 0,
            offline: summary.offline || 0,
            onlineIdle: summary.onlineIdle || 0,
            onlineStopped: summary.onlineStopped || 0,
            onlineMotion: summary.onlineMotion || 0,
            unreachable: summary.unreachable || 0,
          };
          setSummaryData(newSummary);

          // 2. Calculate derived values
          const online = newSummary.onlineIdle + newSummary.onlineStopped + newSummary.onlineMotion;
          const totalWithUnreachable = newSummary.totalDevices + newSummary.unreachable;

          setTotalDevices(totalWithUnreachable);
          setOnlineDevices(online);
          setOfflineDevices(newSummary.offline);

          // 3. Pie Chart Data (Online/Offline/Unreachable)
          setPieData([
            { name: "Online", value: online },
            { name: "Offline", value: newSummary.offline },
            { name: "Unreachable", value: newSummary.unreachable },
          ]);

          // 4. Extract device list for chatbot IMEI validation
          const devicesRaw = apiData.VTS?.available || [];
          const fetchedDevices = devicesRaw.map((item) => ({
            imei: item.imei || "N/A",
            name: item.vehnum || item.name || item.imei,
            status: item.gps === "A" ? "active" : "inactive",
            ign: item.ign,
            speed: Number(item.speed) || 0,
          }));

          setDevices(fetchedDevices);
        } else {
          console.error("Invalid dashboard response:", res);
          callAlert("Error", "Failed to load dashboard data");
        }
      },
      true,
      1
    );
  }, []);
  // =========================================================================

  // Helper to format pie chart data for MD PieChart component
  const onlineOfflinePieData = useMemo(() => {
    const online = summaryData.onlineIdle + summaryData.onlineStopped + summaryData.onlineMotion;
    const offline = summaryData.offline;
    const unreachable = summaryData.unreachable;

    return {
      labels: ["Online", "Offline", "Unreachable"],
      datasets: {
        label: "Connection Status",
        backgroundColors: ["success", "error", "info"], // Green, Red, Blue
        data: [online, offline, unreachable],
      },
    };
  }, [summaryData]);

  const newPieData4 = {
    labels: ["Category A", "Category B", "Category C"],
    datasets: {
      label: "Placeholder Data 4",
      backgroundColors: ["#4CAF50", "#2196F3", "#FF9800"], // Example colors
      data: [30, 40, 30], // Example percentages
    },
  };

  const newPieData5 = {
    labels: ["Violations", "Warnings", "Safe Zones"],
    datasets: {
      label: "Placeholder Data 5",
      backgroundColors: ["#F44336", "#FFC107", "#00BCD4"],
      data: [15, 25, 60],
    },
  };

  const newPieData6 = {
    labels: ["Good", "Fair", "Poor"],
    datasets: {
      label: "Placeholder Data 6",
      backgroundColors: ["#8BC34A", "#FFEB3B", "#607D8B"],
      data: [70, 20, 10],
    },
  };

  const allDeviceStatusPieData = useMemo(() => {
    const inMotion = summaryData.onlineMotion;
    const stopped = summaryData.onlineStopped + summaryData.offline; // Group stopped + offline
    const idle = summaryData.onlineIdle;

    return {
      labels: ["In Motion", "Stopped", "Idle"],
      datasets: {
        label: "Vehicle Status",
        backgroundColors: ["success", "error", "warning"], // Green, Red, Orange
        data: [inMotion, stopped, idle],
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
          <Grid item xs={12} md={6} lg={2}>
            <MDBox mb={1.5}>
              <ComplexStatisticsCard
                color="dark"
                icon={<DevicesIcon style={{ marginTop: "-15px" }} />}
                title="Total Devices"
                count={summaryData.totalDevices.toLocaleString()}
                percentage={{
                  color: "success",
                  // amount: "+55%", // Placeholder %
                  label: "Total Active Fleet",
                }}
              />
            </MDBox>
          </Grid>
          {/* Online Motion */}
          <Grid item xs={12} md={6} lg={2}>
            <MDBox mb={1.5}>
              <ComplexStatisticsCard
                color="success" // Makes the card green
                icon={
                  <DirectionsRunIcon
                    style={{
                      marginTop: "-15px",
                      color: "white", // 🔥 Makes the icon/logo white
                    }}
                  />
                }
                title="Online Motion"
                count={summaryData.onlineMotion.toLocaleString()}
                percentage={{
                  color: "success",
                  label: "Total Online Fleet",
                }}
              />
            </MDBox>
          </Grid>

          {/* Online Idle */}
          <Grid item xs={12} md={6} lg={2}>
            <MDBox mb={1.5}>
              <ComplexStatisticsCard
                color="warning"
                icon={<HourglassEmptyIcon style={{ marginTop: "-15px" }} />}
                title="Online Idle"
                count={summaryData.onlineIdle.toLocaleString()}
                percentage={{
                  color: "success",
                  // amount: "", // Placeholder %
                  label: "Total Idle Fleet",
                }}
              />
            </MDBox>
          </Grid>
          {/* Online stopped */}
          <Grid item xs={12} md={6} lg={2}>
            <MDBox mb={1.5}>
              <ComplexStatisticsCard
                color="error"
                icon={<StopIcon style={{ marginTop: "-15px" }} />}
                title="Online Stopped"
                count={summaryData.onlineStopped.toLocaleString()}
                percentage={{
                  color: "success",
                  // amount: "+0.5%", // Placeholder %
                  label: "Total Unreacble Fleet",
                }}
              />
            </MDBox>
          </Grid>
          {/* Offline */}
          <Grid item xs={12} md={6} lg={2}>
            <MDBox mb={1.5}>
              <ComplexStatisticsCard
                color="primary"
                icon={<CloudOffIcon style={{ marginTop: "-15px" }} />}
                title="Offline"
                count={summaryData.offline.toLocaleString()}
                percentage={{
                  color: "error",
                  // amount: "+1%", // Placeholder %
                  label: "Total Offline Fleet",
                }}
              />
            </MDBox>
          </Grid>
          {/* Unreachable */}
          <Grid item xs={12} md={6} lg={2}>
            <MDBox mb={1.5}>
              <ComplexStatisticsCard
                color="secondary"
                icon={<CloudOffIcon style={{ marginTop: "-15px" }} />}
                title="Unreachable"
                count={summaryData.unreachable.toLocaleString()}
                percentage={{
                  color: "success",
                  // amount: "+0.5%", // Placeholder %
                  label: "Total Unreacble Fleet",
                }}
              />
            </MDBox>
          </Grid>
        </Grid>

        {/* --- Charts Section --- (UPDATED WITH LIVE DATA) */}
        <MDBox mt={4}>
          {/* Pie Charts on a separate row */}
          <Grid container spacing={2}>
            {/* Online vs Offline vs Unreachable */}
            <Grid item xs={12} md={6} lg={4}>
              <MDBox mb={3} sx={{ height: "300px !important" }}>
                <PieChart
                  icon={{ color: "success", component: <WifiIcon /> }}
                  title="Online vs Offline vs Unreachable"
                  description={
                    <>
                      {/* Total: <strong>{summaryData.totalDevices.toLocaleString()}</strong>
                      <br /> */}
                      Online:{" "}
                      <strong>
                        {(
                          summaryData.onlineMotion +
                          summaryData.onlineIdle +
                          summaryData.onlineStopped
                        ).toLocaleString()}
                      </strong>{" "}
                      | Offline: <strong>{summaryData.offline.toLocaleString()}</strong> |
                      Unreachable: <strong>{summaryData.unreachable.toLocaleString()}</strong>
                    </>
                  }
                  chart={onlineOfflinePieData}
                />
              </MDBox>
            </Grid>

            {/* Vehicle Running Status */}
            <Grid item xs={12} md={6} lg={4}>
              <MDBox mb={3} sx={{ height: "300px !important" }}>
                <PieChart
                  icon={{ color: "dark", component: <DonutLargeIcon /> }}
                  title="Vehicle Running Status"
                  description={
                    <>
                      {/* Total: <strong>{summaryData.totalDevices.toLocaleString()}</strong>
                      <br /> */}
                      In Motion: <strong>{summaryData.onlineMotion.toLocaleString()}</strong> |
                      Stopped:{" "}
                      <strong>
                        {(summaryData.onlineStopped + summaryData.offline).toLocaleString()}
                      </strong>{" "}
                      | Idle: <strong>{summaryData.onlineIdle.toLocaleString()}</strong>
                      {summaryData.unreachable > 0 && (
                        <>
                          {" "}
                          | Unreachable: <strong>{summaryData.unreachable.toLocaleString()}</strong>
                        </>
                      )}
                    </>
                  }
                  chart={allDeviceStatusPieData}
                />
              </MDBox>
            </Grid>
            {/* ROW 1: EXISTING Pie Chart 3 (Alert Type Distribution) */}
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

            {/* --- ROW 2: NEW Pie Charts --- */}

            {/* NEW Pie Chart 4 (This will automatically wrap to the next line) */}
            <Grid item xs={12} md={6} lg={4}>
              <MDBox mb={3} mt={-10} sx={{ height: "300px !important" }}>
                <PieChart
                  icon={{ color: "primary", component: <Icon>local_gas_station</Icon> }}
                  title="New Chart 4: Fuel Usage"
                  description="Distribution of fuel consumption types."
                  chart={newPieData4} // <--- REPLACE with your data
                />
              </MDBox>
            </Grid>

            {/* NEW Pie Chart 5 */}
            <Grid item xs={12} md={6} lg={4}>
              <MDBox mb={3} mt={-10} sx={{ height: "300px !important" }}>
                <PieChart
                  icon={{ color: "error", component: <Icon>security</Icon> }}
                  title="New Chart 5: Geofence Violations"
                  description="Breakdown of different types of violations."
                  chart={newPieData5} // <--- REPLACE with your data
                />
              </MDBox>
            </Grid>

            {/* NEW Pie Chart 6 */}
            <Grid item xs={12} md={6} lg={4}>
              <MDBox mb={3} mt={-10} sx={{ height: "300px !important" }}>
                <PieChart
                  icon={{ color: "info", component: <Icon>healing</Icon> }}
                  title="New Chart 6: Vehicle Health"
                  description="Distribution of vehicle diagnostic statuses."
                  chart={newPieData6} // <--- REPLACE with your data
                />
              </MDBox>
            </Grid>
          </Grid>
        </MDBox>

        {/* --- Projects and Orders Overview Section --- */}
        <MDBox>
          <Grid container spacing={3}>
            <Grid item xs={16} md={14} lg={14}>
              <Projects />
            </Grid>
            {/* <Grid item xs={12} md={6} lg={4}>
              <OrdersOverview />
            </Grid> */}
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
