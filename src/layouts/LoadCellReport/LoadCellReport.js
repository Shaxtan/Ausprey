import React, { useState } from "react";
// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";

// Material Dashboard 2 React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";

// Material UI components
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import TextField from "@mui/material/TextField";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import InputLabel from "@mui/material/InputLabel";
import FormControl from "@mui/material/FormControl";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";

// Recharts for the Graph (Assuming you have Recharts installed)
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

// --- Mock Data and Export Functions (for demonstration) ---

const initialChartData = [
  // Example structure for chart data
  { time: "10:00:00", V1: 40, V2: 35, V3: 50, V4: 45, Average: 42.5 },
  { time: "10:00:05", V1: 42, V2: 37, V3: 52, V4: 47, Average: 44.5 },
  { time: "10:00:10", V1: 45, V2: 40, V3: 55, V4: 50, Average: 47.5 },
];

const exportCSV = (data, filename) => {
  console.log(`Exporting ${data.length} records to ${filename} (CSV)`);
  alert(`Downloading ${filename}`);
  // Actual CSV generation logic would go here
};

const exportExcel = (data, filename) => {
  console.log(`Exporting ${data.length} records to ${filename} (Excel)`);
  alert(`Downloading ${filename}`);
  // Actual Excel generation logic would go here
};

const exportPDF = (data, filename) => {
  console.log(`Exporting ${data.length} records to ${filename} (PDF)`);
  alert(`Downloading ${filename}`);
  // Actual PDF generation logic would go here
};

// --- Main Component ---

function LoadCellReport() {
  // Form State
  const [imei, setImei] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [showAverage, setShowAverage] = useState(true);
  const [showData, setShowData] = useState(true);
  const [exportFormat, setExportFormat] = useState("");

  // Report State
  const [chartData, setChartData] = useState(initialChartData);
  const [dateRange, setDateRange] = useState("");
  const [showDownloadOptions, setShowDownloadOptions] = useState(true); // Control visibility of download section

  // Form Submission Handler
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Searching Load Cell Data:", { imei, fromDate, toDate });

    // Simulate API call and setting results
    setDateRange(`Data from ${fromDate || "N/A"} to ${toDate || "N/A"}`);
    setChartData(initialChartData); // Load fetched data here
    setShowDownloadOptions(true);
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3}>
        {/* --- Search Form Card --- */}
        <Grid container spacing={3} mb={4}>
          <Grid item xs={12}>
            <Card>
              <MDBox pt={3} px={3}>
                <MDTypography variant="h6" fontWeight="medium">
                  Search Load Cell Data
                </MDTypography>
              </MDBox>
              <MDBox p={3}>
                <form onSubmit={handleSubmit}>
                  {/* The grid structure mirrors the row g-3 and col-md-3 layout */}
                  <Grid container spacing={3} alignItems="flex-end">
                    {/* IMEI Input */}
                    <Grid item xs={12} md={3}>
                      <MDTypography variant="caption" display="block" mb={0.5}>
                        IMEI
                      </MDTypography>
                      <TextField
                        type="text"
                        fullWidth
                        id="imeiInput"
                        value={imei}
                        onChange={(e) => setImei(e.target.value)}
                        placeholder="Enter IMEI"
                        required
                        variant="outlined"
                        size="small"
                      />
                    </Grid>

                    {/* From Date-Time */}
                    <Grid item xs={12} md={3}>
                      <MDTypography variant="caption" display="block" mb={0.5}>
                        From Date-Time
                      </MDTypography>
                      <TextField
                        type="datetime-local"
                        fullWidth
                        id="fromDateInput"
                        value={fromDate}
                        onChange={(e) => setFromDate(e.target.value)}
                        required
                        InputLabelProps={{ shrink: true }}
                        variant="outlined"
                        size="small"
                      />
                    </Grid>

                    {/* To Date-Time */}
                    <Grid item xs={12} md={3}>
                      <MDTypography variant="caption" display="block" mb={0.5}>
                        To Date-Time
                      </MDTypography>
                      <TextField
                        type="datetime-local"
                        fullWidth
                        id="toDateInput"
                        value={toDate}
                        onChange={(e) => setToDate(e.target.value)}
                        required
                        InputLabelProps={{ shrink: true }}
                        variant="outlined"
                        size="small"
                      />
                    </Grid>

                    {/* Checkboxes and Search Button */}
                    <Grid item xs={12} md={3} sx={{ display: "flex", alignItems: "center" }}>
                      {/* Average Checkbox */}
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={showAverage}
                            onChange={(e) => setShowAverage(e.target.checked)}
                          />
                        }
                        label={
                          <MDTypography variant="button" fontWeight="regular">
                            Average
                          </MDTypography>
                        }
                        sx={{ mr: 1 }}
                      />

                      {/* Data Checkbox */}
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={showData}
                            onChange={(e) => setShowData(e.target.checked)}
                          />
                        }
                        label={
                          <MDTypography variant="button" fontWeight="regular">
                            Data
                          </MDTypography>
                        }
                        sx={{ mr: 2 }}
                      />

                      {/* Search Button */}
                      <MDButton type="submit" variant="gradient" color="info">
                        Search
                      </MDButton>
                    </Grid>
                  </Grid>

                  {/* --- Download Options --- */}
                  {showDownloadOptions && chartData.length > 0 && (
                    <MDBox mt={4} display="flex" justifyContent="flex-end" alignItems="center">
                      <MDTypography variant="button" fontWeight="bold" mr={1.5}>
                        Format:
                      </MDTypography>

                      <FormControl variant="outlined" size="small" sx={{ minWidth: 150, mr: 1.5 }}>
                        <InputLabel id="format-select-label">Select Format</InputLabel>
                        <Select
                          labelId="format-select-label"
                          id="formatSelect"
                          value={exportFormat}
                          label="Select Format"
                          onChange={(e) => setExportFormat(e.target.value)}
                        >
                          <MenuItem value="">-- Select Format --</MenuItem>
                          <MenuItem value="csv">CSV</MenuItem>
                          <MenuItem value="excel">Excel</MenuItem>
                          <MenuItem value="pdf">PDF</MenuItem>
                        </Select>
                      </FormControl>

                      <MDButton
                        type="button"
                        variant="gradient"
                        color="success"
                        disabled={!exportFormat}
                        onClick={() => {
                          const filename = `LoadCellReport_${imei || "data"}_${Date.now()}`;
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
                </form>
              </MDBox>
            </Card>
          </Grid>
        </Grid>

        {/* --- Graph Card --- */}
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card>
              <MDBox pt={3} px={3}>
                <MDTypography variant="h6" fontWeight="medium">
                  Load Cell Graph with Averages
                </MDTypography>
              </MDBox>
              <MDBox p={3}>
                {dateRange && (
                  <MDTypography variant="body2" fontWeight="bold" align="center" mb={2}>
                    {dateRange}
                  </MDTypography>
                )}

                <MDBox sx={{ width: "100%", height: 500 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={chartData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 10 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      {/* Assuming your 'time' data needs to be formatted for a proper chart */}
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
                            name="Load Cell 1"
                          />
                          <Area
                            type="monotone"
                            dataKey="V2"
                            stroke="#82ca9d"
                            fill="#82ca9d"
                            fillOpacity={0.3}
                            dot={false}
                            name="Load Cell 2"
                          />
                          <Area
                            type="monotone"
                            dataKey="V3"
                            stroke="#ffc658"
                            fill="#ffc658"
                            fillOpacity={0.3}
                            dot={false}
                            name="Load Cell 3"
                          />
                          <Area
                            type="monotone"
                            dataKey="V4"
                            stroke="#ce7e00"
                            fill="#ce7e00"
                            fillOpacity={0.3}
                            dot={false}
                            name="Load Cell 4"
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
                          name="Average Load"
                        />
                      )}
                    </AreaChart>
                  </ResponsiveContainer>
                </MDBox>
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </MDBox>
    </DashboardLayout>
  );
}

export default LoadCellReport;
