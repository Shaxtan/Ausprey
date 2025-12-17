import React, { useState, useEffect } from "react";

// Components
import DashboardLayout from "../../assets/components/examples/LayoutContainers/DashboardLayout";
import MDBox from "../../assets/components/MDBox";
import MDTypography from "../../assets/components/MDTypography";
import MDButton from "../../assets/components/MDButton";
import Projects from "pages/dashboard/components/DashboardTable";
import Chatbot from "pages/dashboard/Chatbot";

// Material UI
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Icon from "@mui/material/Icon";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";

// Services
import ApiService from "services/ApiService";
import "./Alerts.css";

function Alerts() {
  const [accounts, setAccounts] = useState([]);
  const [selectedAccountId, setSelectedAccountId] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  // State for the API response data
  const [alertLogs, setAlertLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  // 1. Fetch Accounts on Mount
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

  // 2. Format Date for API (From "2025-12-17T10:41" to "2025-12-17 10:41:48")
  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return "";
    // Replace the 'T' separator with a space and add seconds
    return dateTimeString.replace("T", " ") + ":00";
  };

  // 3. Handle Search Submission
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
      pageSize: 0, // Default as per your requirement
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

  const inputStyleSx = { "& .MuiOutlinedInput-root": { borderRadius: "8px" } };

  return (
    <DashboardLayout>
      <MDBox py={3}>
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

        {/* Results Table Section */}
        <MDBox mt={4}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Card>
                <MDBox pt={3} px={3} display="flex" justifyContent="space-between">
                  <MDTypography variant="h6" fontWeight="medium">
                    Alert Results
                  </MDTypography>
                  <MDTypography variant="button" color="text">
                    Total: {alertLogs.length}
                  </MDTypography>
                </MDBox>
                <MDBox p={2}>
                  {/* Passing alertLogs as the data source to the Projects table */}
                  <Projects tableData={alertLogs} />
                </MDBox>
              </Card>
            </Grid>
          </Grid>
        </MDBox>
      </MDBox>

      <Chatbot />
    </DashboardLayout>
  );
}

export default Alerts;
