import React, { useState } from "react";

// @mui material components
import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";
import Icon from "@mui/material/Icon";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";
import InputLabel from "@mui/material/InputLabel";
import FormControl from "@mui/material/FormControl";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";

// Material Dashboard 2 React context
import { useMaterialUIController } from "context";

function AlertLogsComponent() {
  const [controller] = useMaterialUIController();
  const { darkMode } = controller;

  // State for form fields
  const [account, setAccount] = useState("");
  const [vehicles, setVehicles] = useState("");
  const [alertType, setAlertType] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [alertMode, setAlertMode] = useState("");

  // Submit handler
  const handleSubmit = (event) => {
    event.preventDefault();
    console.log({ account, vehicles, alertType, fromDate, toDate, alertMode });
    // Add your form submission logic here (e.g., API call)
  };

  // Define the strongest inline style for Cards
  const overrideStyle = {
    width: "100%",
    maxWidth: "none",
    boxSizing: "border-box",
  };

  return (
    // Keep your forced width and padding override on the main container
    <MDBox py={3} style={{ width: "100%", maxWidth: "none", padding: "0 !important" }}>
      <Grid
        container
        spacing={3}
        // KEEPING YOUR FORCED WIDTH
        style={{ width: "155%", maxWidth: "none", margin: "0 !important" }}
      >
        <Grid item xs={12} style={overrideStyle}>
          <Card id="alert-logs-form" style={overrideStyle}>
            {/* ALERT LOGS Header */}
            <MDBox pt={2} px={2}>
              <MDTypography variant="h6" fontWeight="medium">
                ALERT LOGS
              </MDTypography>
            </MDBox>

            <MDBox p={2}>
              <form onSubmit={handleSubmit}>
                {/* --- ROW 1: Account and Vehicle (md={6}) --- */}
                <MDBox mb={4}>
                  <Grid container spacing={3}>
                    {/* Account Select (Set to md={6} for 2 columns) */}
                    <Grid item xs={12} md={6}>
                      <FormControl fullWidth>
                        <InputLabel>Account</InputLabel>
                        <Select
                          label="Account"
                          value={account}
                          onChange={(e) => setAccount(e.target.value)}
                        >
                          <MenuItem value="">Select Account</MenuItem>
                          <MenuItem value="account1">Account 1</MenuItem>
                          <MenuItem value="account2">Account 2</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>

                    {/* Vehicles Select (Set to md={6} for 2 columns) */}
                    <Grid item xs={12} md={6}>
                      <FormControl fullWidth>
                        <InputLabel>Vehicles</InputLabel>
                        <Select
                          label="Vehicles"
                          value={vehicles}
                          onChange={(e) => setVehicles(e.target.value)}
                        >
                          <MenuItem value="">Select Vehicles (0)</MenuItem>
                          <MenuItem value="vehicle1">Vehicle A</MenuItem>
                          <MenuItem value="vehicle2">Vehicle B</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                  </Grid>
                </MDBox>

                {/* --- ROW 2: Alert Type and Alert Mode (md={6}) --- */}
                <MDBox mb={4}>
                  <Grid container spacing={3}>
                    {/* Alert Type Select (Set to md={6}) */}
                    <Grid item xs={12} md={6}>
                      <FormControl fullWidth>
                        <InputLabel>Alert Type</InputLabel>
                        <Select
                          label="Alert Type"
                          value={alertType}
                          onChange={(e) => setAlertType(e.target.value)}
                        >
                          <MenuItem value="">Alert Type (0)</MenuItem>
                          <MenuItem value="type1">Over Speed</MenuItem>
                          <MenuItem value="type2">Geo-fence Exit</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>

                    {/* Alert Mode Select (Set to md={6}) */}
                    <Grid item xs={12} md={6}>
                      <FormControl fullWidth>
                        <InputLabel>Alert Mode</InputLabel>
                        <Select
                          label="Alert Mode"
                          value={alertMode}
                          onChange={(e) => setAlertMode(e.target.value)}
                        >
                          <MenuItem value="">Select Mode</MenuItem>
                          <MenuItem value="sms">SMS</MenuItem>
                          <MenuItem value="email">Email</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                  </Grid>
                </MDBox>

                {/* --- ROW 3: From Date and To Date (md={6}) --- */}
                <MDBox mb={4}>
                  <Grid container spacing={3}>
                    {/* From Date Input (Set to md={6}) */}
                    <Grid item xs={12} md={6}>
                      <MDTypography variant="caption" display="block" mb={0.5}>
                        From date
                      </MDTypography>
                      <TextField
                        type="datetime-local"
                        fullWidth
                        value={fromDate}
                        onChange={(e) => setFromDate(e.target.value)}
                        InputProps={{
                          startAdornment: (
                            <Icon sx={{ mr: 1, color: "text.secondary" }}>calendar_today</Icon>
                          ),
                        }}
                      />
                    </Grid>

                    {/* To Date Input (Set to md={6}) */}
                    <Grid item xs={12} md={6}>
                      <MDTypography variant="caption" display="block" mb={0.5}>
                        To date
                      </MDTypography>
                      <TextField
                        type="datetime-local"
                        fullWidth
                        value={toDate}
                        onChange={(e) => setToDate(e.target.value)}
                        InputProps={{
                          startAdornment: (
                            <Icon sx={{ mr: 1, color: "text.secondary" }}>calendar_today</Icon>
                          ),
                        }}
                      />
                    </Grid>
                  </Grid>
                </MDBox>

                {/* Submit Button */}
                <MDBox>
                  <Grid container>
                    <Grid item xs={12} sx={{ textAlign: "center" }}>
                      <MDButton type="submit" variant="gradient" color="info" sx={{ px: 5 }}>
                        Submit
                      </MDButton>
                    </Grid>
                  </Grid>
                </MDBox>
              </form>
            </MDBox>
          </Card>
        </Grid>
      </Grid>

      {/* Placeholder for Alert Logs Table/Results */}
      <Grid
        container
        spacing={3}
        mt={4}
        // KEEPING YOUR FORCED WIDTH
        style={{ width: "155%", maxWidth: "none", margin: "16px 0 0 0 !important" }}
      >
        <Grid item xs={12} style={overrideStyle}>
          {/* Apply inline style to the results Card */}
          <Card style={overrideStyle}>
            <MDBox pt={2} px={2}>
              <MDTypography variant="h6" fontWeight="medium">
                Alert Logs Results
              </MDTypography>
            </MDBox>
            <MDBox p={2}>
              <MDTypography variant="body2">
                Your alert logs data will appear here after submission.
              </MDTypography>
            </MDBox>
          </Card>
        </Grid>
      </Grid>
    </MDBox>
  );
}

export default AlertLogsComponent;
