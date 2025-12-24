import React, { useState, useEffect, useMemo } from "react";

// Components
import DashboardLayout from "../../assets/components/examples/LayoutContainers/DashboardLayout";
import MDBox from "../../assets/components/MDBox";
import MDTypography from "../../assets/components/MDTypography";
import MDButton from "../../assets/components/MDButton";
import Chatbot from "pages/dashboard/Chatbot";

// Import CustomTable and the Helper Component DataCell
import CustomTable, { DataCell } from "./CustomTable";

// Material UI
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";

// Services
import ApiService from "services/ApiService";
import "./Alerts.css";

// 1. Define your Table Columns here
const ALERT_COLUMNS = [
  { Header: "No", accessor: "no", width: "5%", align: "left" },
  { Header: "Vehicle No", accessor: "vehicleNo", width: "15%", align: "left" },
  { Header: "Alert Type", accessor: "type", width: "20%", align: "left" },
  { Header: "Time", accessor: "time", width: "20%", align: "center" },
  { Header: "Message / Location", accessor: "message", width: "40%", align: "left" },
];

function Alerts() {
  const [accounts, setAccounts] = useState([]);
  const [selectedAccountId, setSelectedAccountId] = useState("");
  const [dateRangeOption, setDateRangeOption] = useState("last24hours");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  // State for the API response data
  const [alertLogs, setAlertLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  // Helper to set date range based on option
  const setDateRange = (option) => {
    const now = new Date();
    let from = new Date();

    switch (option) {
      case "last24hours":
        from.setHours(from.getHours() - 24);
        break;
      case "past7days":
        from.setDate(from.getDate() - 7);
        break;
      case "past10days":
        from.setDate(from.getDate() - 10);
        break;
      case "past15days":
        from.setDate(from.getDate() - 15);
        break;
      default:
        return;
    }

    // Set time to start of day for day-based ranges, keep full precision for 24h
    if (option !== "last24hours") {
      from.setHours(0, 0, 0, 0);
    }

    setFromDate(from.toISOString().slice(0, 16));
    setToDate(now.toISOString().slice(0, 16));
    setDateRangeOption(option);
  };

  // Set default to Last 24 Hours on mount
  useEffect(() => {
    setDateRange("last24hours");
  }, []);

  // Fetch Accounts on Mount
  useEffect(() => {
    ApiService.getAccountDropdown((res) => {
      if (res?.data?.resultCode === 1 && Array.isArray(res.data.data)) {
        const fetchedAccounts = res.data.data;
        setAccounts(fetchedAccounts);
        if (fetchedAccounts.length > 0) {
          setSelectedAccountId(fetchedAccounts[0].id);
        }
      }
    });
  }, []);
  // Allow manual change to override quick selection
  const handleFromDateChange = (e) => {
    setFromDate(e.target.value);
    setDateRangeOption("custom"); // mark as custom when manually changed
  };

  const handleToDateChange = (e) => {
    setToDate(e.target.value);
    setDateRangeOption("custom");
  };

  // Format Date for API
  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return "";
    return dateTimeString.replace("T", " ") + ":00";
  };

  // Handle Search Submission
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!selectedAccountId || !fromDate || !toDate) {
      alert("Please select an account and both dates.");
      return;
    }

    setLoading(true);

    const payload = {
      accid: selectedAccountId.toString(),
      startTime: formatDateTime(fromDate),
      endTime: formatDateTime(toDate),
      pageSize: 0,
    };

    ApiService.getAlertsByAccount(payload, (res) => {
      setLoading(false);
      if (res?.data?.resultCode === 1) {
        setAlertLogs(res.data.data || []);
      } else {
        setAlertLogs([]);
        console.error("API Error:", res?.data?.message);
      }
    });
  };

  // Map API data to Table Rows
  const tableRows = useMemo(() => {
    return alertLogs.map((log, index) => ({
      no: <DataCell text={index + 1} fontWeight="bold" />,
      vehicleNo: <DataCell text={log.vehicleNumber || "N/A"} fontWeight="bold" />,
      type: <DataCell text={log.type || "General Alert"} />,
      time: <DataCell text={log.deviceTime || "N/A"} />,
      message: <DataCell text={log.message || "No details"} />,
    }));
  }, [alertLogs]);

  const inputStyleSx = { "& .MuiOutlinedInput-root": { borderRadius: "8px" } };

  return (
    <DashboardLayout>
      <MDBox py={3}>
        {/* Filter Section */}
        <Grid container spacing={3} justifyContent="center">
          <Grid item xs={12}>
            <Card>
              <MDBox pt={2} px={2}>
                <MDTypography variant="h6" fontWeight="medium">
                  Filter Alert Logs
                </MDTypography>
              </MDBox>

              <MDBox p={2}>
                <form onSubmit={handleSubmit}>
                  <MDBox mb={2}>
                    <Grid container spacing={3} alignItems="center">
                      {/* Account Selection */}
                      <Grid item xs={12} md={4}>
                        <FormControl variant="outlined" fullWidth sx={inputStyleSx}>
                          <InputLabel id="account-select-label">Account</InputLabel>
                          <Select
                            labelId="account-select-label"
                            value={selectedAccountId}
                            label="Account"
                            onChange={(e) => setSelectedAccountId(e.target.value)}
                            sx={{ height: 45 }}
                          >
                            {accounts.map((acc) => (
                              <MenuItem key={acc.id} value={acc.id}>
                                {acc.name}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>

                      {/* Quick Date Range Selector */}
                      <Grid item xs={12} md={4}>
                        <FormControl variant="outlined" fullWidth sx={inputStyleSx}>
                          <InputLabel id="date-range-label">Quick Date Range</InputLabel>
                          <Select
                            labelId="date-range-label"
                            value={dateRangeOption}
                            label="Quick Date Range"
                            onChange={(e) => setDateRange(e.target.value)}
                            sx={{ height: 45 }}
                          >
                            <MenuItem value="last24hours">Last 24 Hours</MenuItem>
                            <MenuItem value="past7days">Past 7 Days</MenuItem>
                            <MenuItem value="past10days">Past 10 Days</MenuItem>
                            <MenuItem value="past15days">Past 15 Days</MenuItem>
                            <MenuItem value="custom" disabled={dateRangeOption === "custom"}>
                              Custom Range
                            </MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>

                      {/* From Date */}
                      <Grid item xs={12} md={4}>
                        <TextField
                          label="From Date & Time"
                          type="datetime-local"
                          fullWidth
                          value={fromDate}
                          onChange={handleFromDateChange}
                          variant="outlined"
                          sx={inputStyleSx}
                          InputLabelProps={{ shrink: true }}
                        />
                      </Grid>

                      {/* To Date */}
                      <Grid item xs={12} md={4}>
                        <TextField
                          label="To Date & Time"
                          type="datetime-local"
                          fullWidth
                          value={toDate}
                          onChange={handleToDateChange}
                          variant="outlined"
                          sx={inputStyleSx}
                          InputLabelProps={{ shrink: true }}
                        />
                      </Grid>
                    </Grid>
                  </MDBox>

                  <MDBox textAlign="center">
                    <MDButton
                      type="submit"
                      variant="gradient"
                      color="info"
                      sx={{ px: 5 }}
                      disabled={loading}
                    >
                      {loading ? "Searching..." : "Search Logs"}
                    </MDButton>
                  </MDBox>
                </form>
              </MDBox>
            </Card>
          </Grid>
        </Grid>

        {/* Results Table Section using CustomTable */}
        <MDBox mt={4}>
          <CustomTable title="Alert Results" columns={ALERT_COLUMNS} rows={tableRows} />
        </MDBox>
      </MDBox>

      <Chatbot />
    </DashboardLayout>
  );
}

export default Alerts;
