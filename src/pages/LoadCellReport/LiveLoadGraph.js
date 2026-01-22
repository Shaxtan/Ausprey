import React from "react";
import DashboardLayout from "../../../src/assets/components/examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "../../../src/assets/components/examples/Navbars/DashboardNavbar";
import MDBox from "../../../src/assets/components/MDBox";
import MDTypography from "../../../src/assets/components/MDTypography";
import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";
import ReactSelect from "react-select";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import useLiveLoadGraphLogic from "./useLiveLoadGraphLogic";

function LiveLoadGraph() {
  const { imeis, chartData, handleStartMonitor, loading } = useLiveLoadGraphLogic();

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3}>
        <Card sx={{ mb: 3, p: 3 }}>
          <MDTypography variant="h6" mb={2}>
            Live Load Monitoring
          </MDTypography>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <ReactSelect
                options={imeis}
                onChange={(opt) => handleStartMonitor(opt.value)}
                placeholder="Select Vehicle to Start Live Tracking..."
              />
            </Grid>
            {loading && (
              <Grid item>
                <MDTypography variant="caption">Updating...</MDTypography>
              </Grid>
            )}
          </Grid>
        </Card>

        <Card>
          <MDBox p={3} sx={{ height: 500 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="Average"
                  stroke="#1A73E8"
                  fill="#1A73E8"
                  fillOpacity={0.3}
                  isAnimationActive={false} // Smoother for live updates
                />
              </AreaChart>
            </ResponsiveContainer>
          </MDBox>
        </Card>
      </MDBox>
    </DashboardLayout>
  );
}

export default LiveLoadGraph;
