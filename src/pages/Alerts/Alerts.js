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
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  // State for the API response data
  const [alertLogs, setAlertLogs] = useState([]);
  const [loading, setLoading] = useState(false);

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
  const handleQuickSelect = (type) => {
    const now = new Date();
    let start = new Date();
    let end = new Date();

    // Reset seconds/milliseconds for consistency
    now.setSeconds(0, 0);

    switch (type) {
      case "today":
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
        break;
      case "yesterday":
        start.setDate(now.getDate() - 1);
        start.setHours(0, 0, 0, 0);
        end.setDate(now.getDate() - 1);
        end.setHours(23, 59, 59, 999);
        break;
      case "week":
        start.setDate(now.getDate() - 7);
        // Usually, 'past week' goes up to right now
        break;
      default:
        break;
    }

    // Convert to the format required by <TextField type="datetime-local" />
    // Format: YYYY-MM-DDTHH:mm
    const formatDateForInput = (date) => {
      const pad = (num) => num.toString().padStart(2, "0");
      return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
    };

    setFromDate(formatDateForInput(start));
    setToDate(formatDateForInput(end));
  };

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

                      {/* From Date */}
                      <Grid item xs={12} md={4}>
                        <TextField
                          label="From Date"
                          type="datetime-local"
                          fullWidth
                          value={fromDate}
                          onChange={(e) => setFromDate(e.target.value)}
                          variant="outlined"
                          sx={inputStyleSx}
                          InputLabelProps={{ shrink: true }}
                        />
                      </Grid>

                      {/* To Date */}
                      <Grid item xs={12} md={4}>
                        <TextField
                          label="To Date"
                          type="datetime-local"
                          fullWidth
                          value={toDate}
                          onChange={(e) => setToDate(e.target.value)}
                          variant="outlined"
                          sx={inputStyleSx}
                          InputLabelProps={{ shrink: true }}
                        />
                      </Grid>
                      {/* Quick Select Buttons */}
                      <MDBox
                        mb={2}
                        display="flex"
                        gap={1}
                        justifyContent="center"
                        width="100%"
                        mt={1}
                      >
                        <MDButton
                          variant="outlined"
                          color="secondary"
                          size="small"
                          onClick={() => handleQuickSelect("today")}
                        >
                          Today
                        </MDButton>
                        <MDButton
                          variant="outlined"
                          color="secondary"
                          size="small"
                          onClick={() => handleQuickSelect("yesterday")}
                        >
                          Yesterday
                        </MDButton>
                        <MDButton
                          variant="outlined"
                          color="secondary"
                          size="small"
                          onClick={() => handleQuickSelect("week")}
                        >
                          Last 7 Days
                        </MDButton>
                      </MDBox>
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
