import React, { useState, useMemo, useEffect, useCallback, useRef } from "react"; // Added useRef
import ApiService from "services/ApiService";
import { useNavigate } from "react-router-dom";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import CloudOffIcon from "@mui/icons-material/CloudOff";
import DevicesIcon from "@mui/icons-material/Devices";
import WifiIcon from "@mui/icons-material/Wifi";
import DirectionsRunIcon from "@mui/icons-material/DirectionsRun";
import DonutLargeIcon from "@mui/icons-material/DonutLarge";
import Icon from "@mui/material/Icon";
import StopIcon from "@mui/icons-material/Stop";

import Grid from "@mui/material/Grid";
import MDBox from "../../../src/assets/components/MDBox";

import DashboardLayout from "../../assets/components/examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "../../assets/components/examples/Navbars/DashboardNavbar";
import Footer from "../../assets/components/examples/Footer";
import ComplexStatisticsCard from "../../assets/components/examples/Cards/StatisticsCards/ComplexStatisticsCard";
import PieChart from "../../assets/components/examples/Charts/PieChart";

import Projects from "./components/DashboardTable";
import Chatbot from "./Chatbot";
import AlertModal from "../Modals/Modal";

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
  
  // Create a ref for the Projects table section
  const projectsRef = useRef(null);

  const [alertModalOpen, setAlertModalOpen] = useState(false);
  const [totalDevices, setTotalDevices] = useState(0);
  const [onlineDevices, setOnlineDevices] = useState(0);
  const [offlineDevices, setOfflineDevices] = useState(0);
  const [devices, setDevices] = useState([]);
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

  const [alertApiData, setAlertApiData] = useState({ summary: [], data: [] });
  const [lastRefreshTime, setLastRefreshTime] = useState(Date.now());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedAlertType, setSelectedAlertType] = useState(null);

  // Function to handle smooth scroll
  const scrollToProjects = () => {
    if (projectsRef.current) {
      projectsRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleOpenAlertModal = (type = null) => {
    setSelectedAlertType(type);
    setAlertModalOpen(true);
  };

  const filteredAlertData = useMemo(() => {
    if (!selectedAlertType) return alertApiData.data;
    return alertApiData.data.filter((alert) => alert.type === selectedAlertType);
  }, [alertApiData.data, selectedAlertType]);

  const handleCloseAlertModal = () => {
    setAlertModalOpen(false);
  };

  const fetchAlertsData = useCallback((accountId) => {
    ApiService.getDbAlerts(accountId, (res) => {
      if (res?.data?.resultCode === 1 && res?.data?.data) {
        setAlertApiData(res.data.data);
      }
    });
  }, []);

  const fetchDashboardData = useCallback((accountId, isManual = false) => {
    if (isManual) setIsRefreshing(true);

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
          setDevices(
            devicesRaw.map((item) => ({
              imei: item.imei || "N/A",
              name: item.vehnum || item.name || item.imei,
              status: item.gps === "A" ? "active" : "inactive",
              ign: item.ign,
              speed: Number(item.speed) || 0,
            }))
          );

          setLastRefreshTime(Date.now());
          if (isManual) setIsRefreshing(false);
        } else {
          if (isManual) setIsRefreshing(false);
        }
      },
      true,
      1
    );
  }, []);

  const fetchAccounts = () => {
    ApiService.getAccountDropdown((res) => {
      if (res?.data?.resultCode === 1 && Array.isArray(res.data.data)) {
        setAccounts(res.data.data);
      }
    });
  };

  useEffect(() => {
    fetchAccounts();
    fetchDashboardData(selectedAccountId);
    fetchAlertsData(selectedAccountId);

    const intervalId = setInterval(() => {
      fetchDashboardData(selectedAccountId);
      fetchAlertsData(selectedAccountId);
    }, 5 * 60 * 1000);

    return () => clearInterval(intervalId);
  }, [selectedAccountId, fetchDashboardData, fetchAlertsData]);

  const handleAccountChange = (event) => {
    setSelectedAccountId(event.target.value);
  };

  const onlineOfflinePieData = useMemo(() => {
    const online = summaryData.onlineIdle + summaryData.onlineStopped + summaryData.onlineMotion;
    return {
      labels: ["Online", "Offline", "Unreachable"],
      datasets: {
        label: "Connection Status",
        backgroundColors: ["success", "error", "info"],
        data: [online, summaryData.offline, summaryData.unreachable],
      },
    };
  }, [summaryData]);

  const allDeviceStatusPieData = useMemo(() => {
    return {
      labels: ["In Motion", "Stopped", "Idle"],
      datasets: {
        label: "Vehicle Status",
        backgroundColors: ["success", "error", "warning"],
        data: [
          summaryData.onlineMotion,
          summaryData.onlineStopped + summaryData.offline,
          summaryData.onlineIdle,
        ],
      },
    };
  }, [summaryData]);

  const dynamicAlertPieData = useMemo(() => {
    const labels = alertApiData.summary.map((item) => item.type);
    const counts = alertApiData.summary.map((item) => item.count);
    return {
      labels: labels.length > 0 ? labels : ["No Alerts"],
      datasets: {
        label: "Alert Count",
        backgroundColors: ["error", "warning", "info", "primary", "dark", "secondary"],
        data: counts.length > 0 ? counts : [0],
      },
    };
  }, [alertApiData]);

  // Static chart data (Mock)
  const fuelPieData = useMemo(() => ({
    labels: ["Efficient", "Average", "High Usage"],
    datasets: {
      label: "Fuel",
      backgroundColors: ["#4CAF50", "#2196F3", "#FF9800"],
      data: [30, 40, 30],
    },
  }), []);

  const geofencePieData = useMemo(() => ({
    labels: ["Inside", "Outside", "Violations"],
    datasets: {
      label: "Geofence",
      backgroundColors: ["#F44336", "#FFC107", "#00BCD4"],
      data: [60, 20, 20],
    },
  }), []);

  const healthPieData = useMemo(() => ({
    labels: ["Good", "Service Due", "Critical"],
    datasets: {
      label: "Health",
      backgroundColors: ["#8BC34A", "#FFEB3B", "#607D8B"],
      data: [70, 20, 10],
    },
  }), []);

  const renderChart1 = useMemo(() => (
    <PieChart
      icon={{ color: "success", component: <WifiIcon /> }}
      title="Online vs Offline"
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

  const renderChart3 = useMemo(() => {
    const chartConfigs = {
      ...dynamicAlertPieData,
      options: {
        onClick: (event, elements) => {
          if (elements.length > 0) {
            const index = elements[0].index;
            const typeClicked = dynamicAlertPieData.labels[index];
            handleOpenAlertModal(typeClicked);
          }
        },
      },
    };
    return (
      <PieChart
        icon={{ color: "warning", component: <Icon>notifications_active</Icon> }}
        title="Alert Type Distribution"
        chart={chartConfigs}
      />
    );
  }, [dynamicAlertPieData]);

  const renderChart4 = useMemo(() => (
    <PieChart
      icon={{ color: "primary", component: <Icon>local_gas_station</Icon> }}
      title="Fuel Usage"
      chart={fuelPieData}
    />
  ), [fuelPieData]);

  const renderChart5 = useMemo(() => (
    <PieChart
      icon={{ color: "error", component: <Icon>security</Icon> }}
      title="Geofence Violations"
      chart={geofencePieData}
    />
  ), [geofencePieData]);

  const renderChart6 = useMemo(() => (
    <PieChart
      icon={{ color: "info", component: <Icon>healing</Icon> }}
      title="Vehicle Health"
      chart={healthPieData}
    />
  ), [healthPieData]);

  return (
    <DashboardLayout>
      <DashboardNavbar
        accounts={accounts}
        selectedAccountId={String(selectedAccountId)}
        handleAccountChange={handleAccountChange}
        onManualRefresh={() => {
          fetchDashboardData(selectedAccountId, true);
          fetchAlertsData(selectedAccountId);
        }}
        lastRefreshTime={lastRefreshTime}
        isRefreshing={isRefreshing}
      />

      <MDBox py={3} pt={1} pb={1} />

      <MDBox py={0}>
        <Grid container spacing={3}>
          {/* Card 1: Total Devices */}
          <Grid item xs={12} md={6} lg={2} onClick={scrollToProjects} sx={{ cursor: "pointer" }}>
            <ComplexStatisticsCard
              color="dark"
              icon={<DevicesIcon style={{ marginTop: "-15px" }} />}
              title="Total Devices"
              count={summaryData.totalDevices.toLocaleString()}
              percentage={{ color: "success", label: "Total Active Fleet" }}
            />
          </Grid>
          {/* Card 2: Motion */}
          <Grid item xs={12} md={6} lg={2} onClick={scrollToProjects} sx={{ cursor: "pointer" }}>
            <ComplexStatisticsCard
              color="success"
              icon={<DirectionsRunIcon style={{ marginTop: "-15px", color: "white" }} />}
              title="Motion"
              count={summaryData.onlineMotion.toLocaleString()}
              percentage={{ color: "success", label: "Total Online Fleet" }}
            />
          </Grid>
          {/* Card 3: Idle */}
          <Grid item xs={12} md={6} lg={2} onClick={scrollToProjects} sx={{ cursor: "pointer" }}>
            <ComplexStatisticsCard
              color="warning"
              icon={<HourglassEmptyIcon style={{ marginTop: "-15px" }} />}
              title="Idle"
              count={summaryData.onlineIdle.toLocaleString()}
              percentage={{ color: "success", label: "Total Idle Fleet" }}
            />
          </Grid>
          {/* Card 4: Stopped */}
          <Grid item xs={12} md={6} lg={2} onClick={scrollToProjects} sx={{ cursor: "pointer" }}>
            <ComplexStatisticsCard
              color="error"
              icon={<StopIcon style={{ marginTop: "-15px" }} />}
              title="Stopped"
              count={summaryData.onlineStopped.toLocaleString()}
              percentage={{ color: "success", label: "Total Stopped Fleet" }}
            />
          </Grid>
          {/* Card 5: Offline */}
          <Grid item xs={12} md={6} lg={2} onClick={scrollToProjects} sx={{ cursor: "pointer" }}>
            <ComplexStatisticsCard
              color="warning"
              icon={<CloudOffIcon style={{ marginTop: "-15px" }} />}
              title="Offline"
              count={summaryData.offline.toLocaleString()}
              percentage={{ color: "error", label: "Total Offline Fleet" }}
            />
          </Grid>
          {/* Card 6: Unreachable */}
          <Grid item xs={12} md={6} lg={2} onClick={scrollToProjects} sx={{ cursor: "pointer" }}>
            <ComplexStatisticsCard
              color="secondary"
              icon={<CloudOffIcon style={{ marginTop: "-15px" }} />}
              title="Unreachable"
              count={summaryData.unreachable.toLocaleString()}
              percentage={{ color: "success", label: "Total Unreacble Fleet" }}
            />
          </Grid>
        </Grid>

        <MDBox mt={4}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6} lg={4}>
              <MDBox mb={3} sx={{ height: "300px !important" }}>{renderChart1}</MDBox>
            </Grid>
            <Grid item xs={12} md={6} lg={4}>
              <MDBox mb={3} sx={{ height: "300px !important" }}>{renderChart2}</MDBox>
            </Grid>
            <Grid item xs={12} md={6} lg={4}>
              <MDBox
                mb={3}
                sx={{
                  height: "300px !important",
                  cursor: "pointer",
                  transition: "transform 0.2s",
                  "&:hover": { transform: "scale(1.02)" },
                }}
                onClick={() => handleOpenAlertModal(null)}
              >
                {renderChart3}
              </MDBox>
            </Grid>
            <Grid item xs={12} md={6} lg={4}>
              <MDBox mb={3} mt={-10} sx={{ height: "300px !important" }}>{renderChart4}</MDBox>
            </Grid>
            <Grid item xs={12} md={6} lg={4}>
              <MDBox mb={3} mt={-10} sx={{ height: "300px !important" }}>{renderChart5}</MDBox>
            </Grid>
            <Grid item xs={12} md={6} lg={4}>
              <MDBox mb={3} mt={-10} sx={{ height: "300px !important" }}>{renderChart6}</MDBox>
            </Grid>
          </Grid>
        </MDBox>

        {/* Updated section with ref for scrolling */}
        <MDBox ref={projectsRef}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <MDBox sx={{ width: "100%", overflowX: "auto" }}>
                <Projects accountId={selectedAccountId} />
              </MDBox>
            </Grid>
          </Grid>
        </MDBox>
      </MDBox>

      <Chatbot devices={devices} />
      <Footer />

      <AlertModal
        open={alertModalOpen}
        onClose={handleCloseAlertModal}
        title={selectedAlertType ? `${selectedAlertType} Alerts` : "All Alerts"}
        alertData={filteredAlertData}
      />
    </DashboardLayout>
  );
}

export default Dashboard; 