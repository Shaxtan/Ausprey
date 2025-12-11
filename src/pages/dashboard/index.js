import React, { useState, useMemo, useEffect, useCallback } from "react";
import ApiService from "services/ApiService";
import { useNavigate } from "react-router-dom";

// @mui icons
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import CloudOffIcon from "@mui/icons-material/CloudOff";
import DevicesIcon from "@mui/icons-material/Devices";
import WifiIcon from "@mui/icons-material/Wifi";
import DirectionsRunIcon from "@mui/icons-material/DirectionsRun";
import DonutLargeIcon from "@mui/icons-material/DonutLarge";
import Icon from "@mui/material/Icon";
import StopIcon from "@mui/icons-material/Stop";

// @mui material components
import Grid from "@mui/material/Grid";

// Material Dashboard 2 React components
import MDBox from "../../../src/assets/components/MDBox";

// Material Dashboard 2 React example components
import DashboardLayout from "../../assets/components/examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "../../assets/components/examples/Navbars/DashboardNavbar";
import Footer from "../../assets/components/examples/Footer";
import ComplexStatisticsCard from "../../assets/components/examples/Cards/StatisticsCards/ComplexStatisticsCard";
import PieChart from "../../assets/components/examples/Charts/PieChart";

// Dashboard components
import Projects from "./components/DashboardTable";

// IMPORT THE NEW CHATBOT COMPONENT
import Chatbot from "./Chatbot"; // <--- Adjust path if needed

// Mock Pie Chart Data
const alertTypePieData = {
  labels: ["Critical (Error)", "Warning", "Informational"],
  datasets: {
    label: "Alert Types",
    backgroundColors: ["error", "warning", "info"],
    data: [50, 120, 300],
  },
};

const getInitialAccountId = () => {
  try {
    const user = JSON.parse(localStorage.getItem("userDetails") || "{}");
    return user?.accountId || 1;
  } catch {
    return 1;
  }
};

function Dashboard() {
  const navigate = useNavigate();
  
  // =========================================================================
  // === API STATE ===
  // =========================================================================
  const [totalDevices, setTotalDevices] = useState(0);
  const [onlineDevices, setOnlineDevices] = useState(0);
  const [offlineDevices, setOfflineDevices] = useState(0);
  const [devices, setDevices] = useState([]); // Passed to Chatbot
  const [accounts, setAccounts] = useState([]);
  const [selectedAccountId, setSelectedAccountId] = useState(getInitialAccountId());
  const [summaryData, setSummaryData] = useState({
    totalDevices: 0,
    offline: 0,
    onlineIdle: 0,
    onlineStopped: 0,
    onlineMotion: 0,
    unreachable: 0,
  });

  const fetchDashboardData = useCallback((accountId) => {
    ApiService.getDashboardData(
      { accid: accountId },
      (res) => {
        if (res?.data?.resultCode === 1 && res?.data?.data?.data) {
          const apiData = res.data.data.data;
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

          const online = newSummary.onlineIdle + newSummary.onlineStopped + newSummary.onlineMotion;
          const totalWithUnreachable = newSummary.totalDevices + newSummary.unreachable;

          setTotalDevices(totalWithUnreachable);
          setOnlineDevices(online);
          setOfflineDevices(newSummary.offline);

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
        }
      },
      true,
      1
    );
  }, []);

  const fetchAccounts = useCallback(() => {
    ApiService.getAccountDropdown((res) => {
      if (res?.data?.resultCode === 1 && Array.isArray(res.data.data)) {
        setAccounts(res.data.data);
      } else {
        console.error("Failed to load account dropdown:", res);
      }
    });
  }, []);

  useEffect(() => {
    fetchAccounts();
    fetchDashboardData(selectedAccountId);

    const intervalId = setInterval(() => {
      console.log("Auto-refreshing dashboard data...");
      fetchDashboardData(selectedAccountId);
    }, 300000);

    return () => clearInterval(intervalId);
  }, [fetchAccounts, fetchDashboardData, selectedAccountId]);

  // =========================================================================
  // === CHART MEMOIZATION ===
  // =========================================================================

  const onlineOfflinePieData = useMemo(() => {
    const online = summaryData.onlineIdle + summaryData.onlineStopped + summaryData.onlineMotion;
    const offline = summaryData.offline;
    const unreachable = summaryData.unreachable;
    return {
      labels: ["Online", "Offline", "Unreachable"],
      datasets: {
        label: "Connection Status",
        backgroundColors: ["success", "error", "info"],
        data: [online, offline, unreachable],
      },
    };
  }, [summaryData]);

  const allDeviceStatusPieData = useMemo(() => {
    const inMotion = summaryData.onlineMotion;
    const stopped = summaryData.onlineStopped + summaryData.offline;
    const idle = summaryData.onlineIdle;
    return {
      labels: ["In Motion", "Stopped", "Idle"],
      datasets: {
        label: "Vehicle Status",
        backgroundColors: ["success", "error", "warning"],
        data: [inMotion, stopped, idle],
      },
    };
  }, [summaryData]);

  const newPieData4 = useMemo(() => ({
    labels: ["Category A", "Category B", "Category C"],
    datasets: {
      label: "Placeholder Data 4",
      backgroundColors: ["#4CAF50", "#2196F3", "#FF9800"],
      data: [30, 40, 30],
    },
  }), []);

  const newPieData5 = useMemo(() => ({
    labels: ["Violations", "Warnings", "Safe Zones"],
    datasets: {
      label: "Placeholder Data 5",
      backgroundColors: ["#F44336", "#FFC107", "#00BCD4"],
      data: [15, 25, 60],
    },
  }), []);

  const newPieData6 = useMemo(() => ({
    labels: ["Good", "Fair", "Poor"],
    datasets: {
      label: "Placeholder Data 6",
      backgroundColors: ["#8BC34A", "#FFEB3B", "#607D8B"],
      data: [70, 20, 10],
    },
  }), []);

  // --- MEMOIZED CHARTS (To prevent scroll refresh) ---

  const renderChart1 = useMemo(() => (
    <PieChart
      icon={{ color: "success", component: <WifiIcon /> }}
      title="Online vs Offline vs Unreachable"
      chart={onlineOfflinePieData}
    />
  ), [onlineOfflinePieData]);

  const renderChart2 = useMemo(() => (
    <PieChart
      icon={{ color: "dark", component: <DonutLargeIcon /> }}
      title="Vehicle Running Status"
      chart={allDeviceStatusPieData}
    />
  ), [allDeviceStatusPieData]);

  const renderChart3 = useMemo(() => (
    <PieChart
      icon={{ color: "warning", component: <Icon>notifications_active</Icon> }}
      title="Alert Type Distribution"
      // description="Breakdown of Critical, Waring, and Info alerts."
      chart={alertTypePieData}
    />
  ), []);

  const renderChart4 = useMemo(() => (
    <PieChart
      icon={{ color: "primary", component: <Icon>local_gas_station</Icon> }}
      title="New Chart 4: Fuel Usage"
      description="Distribution of fuel consumption types."
      chart={newPieData4}
    />
  ), [newPieData4]);

  const renderChart5 = useMemo(() => (
    <PieChart
      icon={{ color: "error", component: <Icon>security</Icon> }}
      title="New Chart 5: Geofence Violations"
      description="Breakdown of different types of violations."
      chart={newPieData5}
    />
  ), [newPieData5]);

  const renderChart6 = useMemo(() => (
    <PieChart
      icon={{ color: "info", component: <Icon>healing</Icon> }}
      title="New Chart 6: Vehicle Health"
      description="Distribution of vehicle diagnostic statuses."
      chart={newPieData6}
    />
  ), [newPieData6]);

  return (
    <DashboardLayout>
      <DashboardNavbar />

      <MDBox py={3} pt={1} pb={1}>
        {/* Account selection placeholder */}
      </MDBox>

      <MDBox py={0}>
        {/* --- Statistics Cards --- */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={6} lg={2}>
            <MDBox mb={1.5}>
              <ComplexStatisticsCard
                color="dark"
                icon={<DevicesIcon style={{ marginTop: "-15px" }} />}
                title="Total Devices"
                count={summaryData.totalDevices.toLocaleString()}
                percentage={{ color: "success", label: "Total Active Fleet" }}
              />
            </MDBox>
          </Grid>
          <Grid item xs={12} md={6} lg={2}>
            <MDBox mb={1.5}>
              <ComplexStatisticsCard
                color="success"
                icon={<DirectionsRunIcon style={{ marginTop: "-15px", color: "white" }} />}
                title="Online Motion"
                count={summaryData.onlineMotion.toLocaleString()}
                percentage={{ color: "success", label: "Total Online Fleet" }}
              />
            </MDBox>
          </Grid>
          <Grid item xs={12} md={6} lg={2}>
            <MDBox mb={1.5}>
              <ComplexStatisticsCard
                color="warning"
                icon={<HourglassEmptyIcon style={{ marginTop: "-15px" }} />}
                title="Online Idle"
                count={summaryData.onlineIdle.toLocaleString()}
                percentage={{ color: "success", label: "Total Idle Fleet" }}
              />
            </MDBox>
          </Grid>
          <Grid item xs={12} md={6} lg={2}>
            <MDBox mb={1.5}>
              <ComplexStatisticsCard
                color="error"
                icon={<StopIcon style={{ marginTop: "-15px" }} />}
                title="Online Stopped"
                count={summaryData.onlineStopped.toLocaleString()}
                percentage={{ color: "success", label: "Total Stopped Fleet" }}
              />
            </MDBox>
          </Grid>
          <Grid item xs={12} md={6} lg={2}>
            <MDBox mb={1.5}>
              <ComplexStatisticsCard
                color="warning"
                icon={<CloudOffIcon style={{ marginTop: "-15px" }} />}
                title="Offline"
                count={summaryData.offline.toLocaleString()}
                percentage={{ color: "error", label: "Total Offline Fleet" }}
              />
            </MDBox>
          </Grid>
          <Grid item xs={12} md={6} lg={2}>
            <MDBox mb={1.5}>
              <ComplexStatisticsCard
                color="secondary"
                icon={<CloudOffIcon style={{ marginTop: "-15px" }} />}
                title="Unreachable"
                count={summaryData.unreachable.toLocaleString()}
                percentage={{ color: "success", label: "Total Unreacble Fleet" }}
              />
            </MDBox>
          </Grid>
        </Grid>

        {/* --- Charts --- */}
        <MDBox mt={4}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6} lg={4}>
              <MDBox mb={3} sx={{ height: "300px !important" }}>
                {renderChart1}
              </MDBox>
            </Grid>
            <Grid item xs={12} md={6} lg={4}>
              <MDBox mb={3} sx={{ height: "300px !important" }}>
                {renderChart2}
              </MDBox>
            </Grid>
            <Grid item xs={12} md={6} lg={4}>
              <MDBox mb={3} sx={{ height: "300px !important" }}>
                {renderChart3}
              </MDBox>
            </Grid>
            <Grid item xs={12} md={6} lg={4}>
              <MDBox mb={3} mt={-10} sx={{ height: "300px !important" }}>
                {renderChart4}
              </MDBox>
            </Grid>
            <Grid item xs={12} md={6} lg={4}>
              <MDBox mb={3} mt={-10} sx={{ height: "300px !important" }}>
                {renderChart5}
              </MDBox>
            </Grid>
            <Grid item xs={12} md={6} lg={4}>
              <MDBox mb={3} mt={-10} sx={{ height: "300px !important" }}>
                {renderChart6}
              </MDBox>
            </Grid>
          </Grid>
        </MDBox>

        {/* --- Table --- */}
        <MDBox>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <MDBox sx={{ width: "100%", overflowX: "auto" }}>
                <Projects accountId={selectedAccountId} />
              </MDBox>
            </Grid>
          </Grid>
        </MDBox>
      </MDBox>

      {/* --- Chatbot Component --- */}
      {/* We simply pass the devices data down to the Chatbot */}
      <Chatbot devices={devices} />

      <Footer />
    </DashboardLayout>
  );
}
export default Dashboard;