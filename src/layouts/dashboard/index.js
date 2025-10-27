/**
=========================================================
* Material Dashboard 2 React - v2.2.0
=========================================================

* Product Page: https://www.creative-tim.com/product/material-dashboard-react
* Copyright 2023 Creative Tim (https://www.creative-tim.com)

Coded by www.creative-tim.com

=========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
*/

// @mui icons
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import CloudOffIcon from "@mui/icons-material/CloudOff";
import DevicesIcon from "@mui/icons-material/Devices"; // Icon for Total Devices
import WifiIcon from "@mui/icons-material/Wifi"; // Icon for Online
import DonutLargeIcon from "@mui/icons-material/DonutLarge"; // Icon for Pie Chart

// @mui material components
import Grid from "@mui/material/Grid";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";

// Material Dashboard 2 React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import ReportsBarChart from "examples/Charts/BarCharts/ReportsBarChart";
import ReportsLineChart from "examples/Charts/LineCharts/ReportsLineChart";
import ComplexStatisticsCard from "examples/Cards/StatisticsCards/ComplexStatisticsCard";
import PieChart from "examples/Charts/PieChart"; // <-- PieChart Import

// Data
import reportsBarChartData from "layouts/dashboard/data/reportsBarChartData";
import reportsLineChartData from "layouts/dashboard/data/reportsLineChartData";

// Dashboard components
import Projects from "layouts/dashboard/components/Projects";
import OrdersOverview from "layouts/dashboard/components/OrdersOverview";

// Mock Pie Chart Data for All Statuses
const pieChartData = {
  labels: ["Online", "Idle", "Offline"],
  datasets: {
    label: "Device Status",
    backgroundColors: ["info", "primary", "error"], // Map to dashboard colors
    data: [2300, 91, 34],
  },
};

// Mock Pie Chart Data for Online/Offline Only
const onlineOfflinePieData = {
  labels: ["Online", "Offline"],
  datasets: {
    label: "Connection Status",
    backgroundColors: ["success", "warning"], // Using success/warning for visual contrast
    data: [2300, 34],
  },
};

function Dashboard() {
  const { sales, tasks } = reportsLineChartData;

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3}>
        {/* --- Complex Statistics Cards --- */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={6} lg={3}>
            <MDBox mb={1.5}>
              <ComplexStatisticsCard
                color="dark"
                icon={<DevicesIcon style={{ marginTop: "-15px" }} />} // Used DevicesIcon for consistency
                title="Total Devices"
                count={281}
                percentage={{
                  color: "success",
                  amount: "+55%",
                  label: "than last week",
                }}
              />
            </MDBox>
          </Grid>
          <Grid item xs={12} md={6} lg={3}>
            <MDBox mb={1.5}>
              <ComplexStatisticsCard
                icon={<WifiIcon style={{ marginTop: "-15px" }} />} // Used WifiIcon for consistency
                title="Online"
                count="2,300"
                percentage={{
                  color: "success",
                  amount: "+3%",
                  label: "than last month",
                }}
              />
            </MDBox>
          </Grid>
          <Grid item xs={12} md={6} lg={3}>
            <MDBox mb={1.5}>
              <ComplexStatisticsCard
                color="error" // Changed color to 'error' to signify negative status
                icon={<CloudOffIcon style={{ marginTop: "-15px" }} />}
                title="Offline"
                count="34"
                percentage={{
                  color: "error", // Changed percentage color to 'error'
                  amount: "+1%",
                  label: "more than yesterday",
                }}
              />
            </MDBox>
          </Grid>
          <Grid item xs={12} md={6} lg={3}>
            <MDBox mb={1.5}>
              <ComplexStatisticsCard
                color="primary"
                icon={<HourglassEmptyIcon style={{ marginTop: "-15px" }} />}
                title="Idle"
                count="91"
                percentage={{
                  color: "success",
                  amount: "",
                  label: "Just updated",
                }}
              />
            </MDBox>
          </Grid>
        </Grid>

        {/* --- Charts Section --- */}
        <MDBox mt={4.5}>
          <Grid container spacing={3}>
            {/* Reports Bar Chart - Online Devices Trend */}
            <Grid item xs={12} md={6} lg={4}>
              <MDBox mb={3}>
                <ReportsBarChart
                  color="info"
                  title="Online Devices Trend"
                  description="Last 24 Hrs"
                  date="updated 5 minutes ago"
                  chart={reportsBarChartData}
                />
              </MDBox>
            </Grid>

            {/* NEW PIE CHART - Online/Offline Distribution (HEIGHT ENFORCED) */}
            <Grid item xs={12} md={6} lg={4}>
              <MDBox mb={3} sx={{ height: "300px !important" }}>
                <PieChart
                  icon={{ color: "success", component: <WifiIcon /> }} // Icon relating to connectivity
                  title="Online vs. Offline"
                  description="Current network connectivity status."
                  chart={onlineOfflinePieData} // <-- Using the new Online/Offline data
                />
              </MDBox>
            </Grid>

            {/* ORIGINAL PIE CHART - Device Status Distribution (HEIGHT ENFORCED) */}
            <Grid item xs={12} md={6} lg={4}>
              <MDBox mb={3} sx={{ height: "300px !important" }}>
                <PieChart
                  icon={{ color: "dark", component: <DonutLargeIcon /> }}
                  title="All Device Statuses"
                  description="Distribution including idle devices."
                  chart={pieChartData}
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
      <Footer />
    </DashboardLayout>
  );
}
export default Dashboard;
