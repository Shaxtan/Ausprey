import React, { useState } from "react";

// @mui material components
import Grid from "@mui/material/Grid";
import Divider from "@mui/material/Divider";
import TextField from "@mui/material/TextField";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Card from "@mui/material/Card"; // Essential: Ensures the Card component is defined.

// @mui icons
import FacebookIcon from "@mui/icons-material/Facebook";
import TwitterIcon from "@mui/icons-material/Twitter";
import InstagramIcon from "@mui/icons-material/Instagram";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";

// Material Dashboard 2 React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";

// Overview page components
import Header from "layouts/profile/components/Header";

// Recharts Imports (assuming you have them installed)
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

// --- Mock Data and Placeholder Functions ---

const mockChartData = [
  { time: "10:00:00", V1: 4000, V2: 2400, V3: 2400, V4: 3000, Average: 2950 },
  { time: "10:00:01", V1: 3000, V2: 1398, V3: 2210, V4: 4000, Average: 2652 },
  { time: "10:00:02", V1: 2000, V2: 9800, V3: 2290, V4: 5000, Average: 4772 },
  { time: "10:00:03", V1: 2780, V2: 3908, V3: 2000, V4: 6000, Average: 3672 },
  { time: "10:00:04", V1: 1890, V2: 4800, V3: 2181, V4: 7000, Average: 3968 },
];

const exportCSV = (data, filename) =>
  console.log(`Exporting ${data.length} records to ${filename} as CSV`);
const exportExcel = (data, filename) =>
  console.log(`Exporting ${data.length} records to ${filename} as Excel`);
const exportPDF = (data, filename) =>
  console.log(`Exporting ${data.length} records to ${filename} as PDF`);

// --- Main Component ---

function Overview() {
  const [imei, setImei] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [showAverage, setShowAverage] = useState(true);
  const [showData, setShowData] = useState(true);
  const [chartData, setChartData] = useState([]);
  const [dateRange, setDateRange] = useState("");
  const [showDownloadOptions, setShowDownloadOptions] = useState(false);
  const [exportFormat, setExportFormat] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();
    // In a real application, you'd make an API call here.
    console.log("Searching with:", { imei, fromDate, toDate, showAverage, showData });

    // Using mock data for demonstration
    const dateRangeStr = `Data from ${fromDate.replace("T", " ")} to ${toDate.replace("T", " ")}`;

    setChartData(mockChartData);
    setDateRange(dateRangeStr);
    setShowDownloadOptions(true);
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />

      {/* --- Load Cell Search Form (Wrapped in a White Card/Box) --- */}

      {/* --- Load Cell Graph (Wrapped in a White Card/Box) --- */}

      {/* --- Existing Profile/Project Content Below --- */}
      <Header>
        <MDBox mt={5} mb={3}></MDBox>
        <MDBox mt={3} mb={3}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              {/* MDBox with component={Card} creates the white box effect */}
              <MDBox component={Card} p={3}>
                <MDTypography variant="h5" mb={3}>
                  Search Load Cell Data
                </MDTypography>

                <MDBox component="form" onSubmit={handleSubmit}>
                  <Grid container spacing={3} alignItems="flex-end">
                    {/* IMEI Input */}
                    <Grid item xs={12} md={3}>
                      <TextField
                        fullWidth
                        label="IMEI"
                        id="imeiInput"
                        value={imei}
                        onChange={(e) => setImei(e.target.value)}
                        placeholder="Enter IMEI"
                        required
                        variant="outlined"
                        size="small"
                      />
                    </Grid>

                    {/* From Date-Time Input */}
                    <Grid item xs={12} md={3}>
                      <TextField
                        fullWidth
                        label="From Date-Time"
                        id="fromDateInput"
                        type="datetime-local"
                        step="1"
                        value={fromDate}
                        onChange={(e) => setFromDate(e.target.value)}
                        required
                        InputLabelProps={{ shrink: true }}
                        variant="outlined"
                        size="small"
                      />
                    </Grid>

                    {/* To Date-Time Input */}
                    <Grid item xs={12} md={3}>
                      <TextField
                        fullWidth
                        label="To Date-Time"
                        id="toDateInput"
                        type="datetime-local"
                        step="1"
                        value={toDate}
                        onChange={(e) => setToDate(e.target.value)}
                        required
                        InputLabelProps={{ shrink: true }}
                        variant="outlined"
                        size="small"
                      />
                    </Grid>

                    {/* Checkboxes and Search Button */}
                    <Grid item xs={12} md={3} sx={{ display: "flex", alignItems: "flex-end" }}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={showAverage}
                            onChange={(e) => setShowAverage(e.target.checked)}
                            id="averageCheck"
                          />
                        }
                        label="Average"
                        sx={{ mr: 1 }}
                      />
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={showData}
                            onChange={(e) => setShowData(e.target.checked)}
                            id="dataCheck"
                          />
                        }
                        label="Data"
                        sx={{ mr: 2 }}
                      />
                      <MDButton variant="gradient" color="info" type="submit" sx={{ ml: "auto" }}>
                        Search
                      </MDButton>
                    </Grid>
                  </Grid>

                  {/* Download Options */}
                  {showDownloadOptions && chartData.length > 0 && (
                    <MDBox mt={4} display="flex" justifyContent="flex-end" alignItems="center">
                      <MDTypography variant="button" fontWeight="medium" mr={1}>
                        Format:
                      </MDTypography>
                      <FormControl variant="outlined" size="small" sx={{ minWidth: 150, mr: 2 }}>
                        <InputLabel id="formatSelectLabel">Select Format</InputLabel>
                        <Select
                          labelId="formatSelectLabel"
                          id="formatSelect"
                          value={exportFormat}
                          onChange={(e) => setExportFormat(e.target.value)}
                          label="Select Format"
                        >
                          <MenuItem value="">-- Select Format --</MenuItem>
                          <MenuItem value="csv">CSV</MenuItem>
                          <MenuItem value="excel">Excel</MenuItem>
                          <MenuItem value="pdf">PDF</MenuItem>
                        </Select>
                      </FormControl>
                      <MDButton
                        variant="gradient"
                        color="success"
                        disabled={!exportFormat}
                        onClick={() => {
                          const filename = `LoadCellReport_${imei}_${Date.now()}`;
                          if (exportFormat === "csv") exportCSV(chartData, `${filename}.csv`);
                          else if (exportFormat === "excel")
                            exportExcel(chartData, `${filename}.xlsx`);
                          else if (exportFormat === "pdf") exportPDF(chartData, `${filename}.pdf`);
                        }}
                      >
                        Download
                      </MDButton>
                    </MDBox>
                  )}
                </MDBox>
              </MDBox>
            </Grid>
          </Grid>
        </MDBox>
        <MDBox mb={3}>
          <Grid container>
            <Grid item xs={12}>
              {/* MDBox with component={Card} creates the white box effect */}
              <MDBox component={Card} p={3}>
                <MDTypography variant="h5" mb={2}>
                  Load Cell Graph with Averages
                </MDTypography>
                {dateRange && (
                  <MDTypography
                    variant="subtitle2"
                    fontWeight="bold"
                    color="text"
                    textAlign="center"
                    mb={2}
                  >
                    {dateRange}
                  </MDTypography>
                )}
                <MDBox height="500px">
                  {chartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={chartData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 10 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="time" />
                        <YAxis yAxisId="left" />
                        <Tooltip />
                        <Legend />

                        {showData && (
                          <>
                            <Area
                              type="monotone"
                              dataKey="V1"
                              stroke="#8884d8"
                              fill="#8884d8"
                              fillOpacity={0.3}
                              dot={false}
                            />
                            <Area
                              type="monotone"
                              dataKey="V2"
                              stroke="#82ca9d"
                              fill="#82ca9d"
                              fillOpacity={0.3}
                              dot={false}
                            />
                            <Area
                              type="monotone"
                              dataKey="V3"
                              stroke="#ffc658"
                              fill="#ffc658"
                              fillOpacity={0.3}
                              dot={false}
                            />
                            <Area
                              type="monotone"
                              dataKey="V4"
                              stroke="#ce7e00"
                              fill="#ce7e00"
                              fillOpacity={0.3}
                              dot={false}
                            />
                          </>
                        )}

                        {showAverage && (
                          <Area
                            type="monotone"
                            dataKey="Average"
                            stroke="#0000FF"
                            fill="#0000FF"
                            fillOpacity={0.4}
                            dot={false}
                          />
                        )}
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <MDBox display="flex" justifyContent="center" alignItems="center" height="100%">
                      <MDTypography variant="h6" color="text">
                        Search for data to view the graph.
                      </MDTypography>
                    </MDBox>
                  )}
                </MDBox>
              </MDBox>
            </Grid>
          </Grid>
        </MDBox>
        <MDBox p={2}></MDBox>
      </Header>
      <Footer />
    </DashboardLayout>
  );
}

export default Overview;
