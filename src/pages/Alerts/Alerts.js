import React, { useState, useEffect } from "react";

import Chatbot from "pages/dashboard/Chatbot";

import "./Alerts.css";

import MDBox from "../../assets/components/MDBox";
import MDTypography from "../../assets/components/MDTypography";
import MDButton from "../../assets/components/MDButton";

import Projects from "pages/dashboard/components/DashboardTable";

import DashboardLayout from "../../assets/components/examples/LayoutContainers/DashboardLayout";

import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Icon from "@mui/material/Icon";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";

import ApiService from "services/ApiService"; 

function Alerts() {
  const [accounts, setAccounts] = useState([]);
  const [selectedAccountId, setSelectedAccountId] = useState("");

  const [imei, setImei] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  useEffect(() => {
    ApiService.getAccountDropdown((res) => {
      if (res?.data?.resultCode === 1 && Array.isArray(res.data.data)) {
        const fetchedAccounts = res.data.data;
        setAccounts(fetchedAccounts);

        if (fetchedAccounts.length > 0) {
          setSelectedAccountId(fetchedAccounts[0].id);
        }
      } else {
        console.error("Failed to load account dropdown:", res);
      }
    });
  }, []);

  const handleAccountChange = (event) => {
    setSelectedAccountId(event.target.value);
    console.log("Selected Account ID:", event.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Filters Submitted:", {
      selectedAccountId,
      imei,
      fromDate,
      toDate,
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
                      
                      <Grid item xs={12} md={6}>
                        <MDBox display="flex" flexDirection="column">
                          <MDTypography variant="caption" mb={0.5} display="block">
                            {/* Select Account */}
                          </MDTypography>
                          
                          <FormControl
                            variant="outlined"
                            size="medium"
                            fullWidth
                            sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px" } }}
                          >
                            <InputLabel id="account-select-label">Account</InputLabel>
                            <Select
                              labelId="account-select-label"
                              id="account-select"
                              value={selectedAccountId}
                              label="Account"
                              onChange={handleAccountChange}
                              sx={{ height: 45 }}
                            >
                              {accounts.length > 0 ? (
                                accounts.map((acc) => (
                                  <MenuItem key={acc.id} value={acc.id}>
                                    {acc.name}
                                  </MenuItem>
                                ))
                              ) : (
                                <MenuItem value="" disabled>
                                   Loading accounts...
                                </MenuItem>
                              )}
                            </Select>
                          </FormControl>
                        </MDBox>
                      </Grid>

                      <Grid item xs={12} md={6}>
                        <MDTypography variant="caption" mb={0.5} display="block">
                          Select IMEI
                        </MDTypography>
                        <TextField
                          select
                          fullWidth
                          value={imei}
                          onChange={(e) => setImei(e.target.value)}
                          variant="outlined"
                          sx={inputStyleSx}
                        >
                          <MenuItem value="">Select IMEI</MenuItem>
                          <MenuItem value="imei1">865432101234567</MenuItem>
                          <MenuItem value="imei2">865432109876543</MenuItem>
                        </TextField>
                      </Grid>

                      <Grid item xs={12} md={6}>
                        <MDTypography variant="caption" mb={0.5} display="block">
                          From Date
                        </MDTypography>
                        <TextField
                          type="datetime-local"
                          fullWidth
                          value={fromDate}
                          onChange={(e) => setFromDate(e.target.value)}
                          variant="outlined"
                          sx={inputStyleSx}
                          InputProps={{
                            startAdornment: (
                              <Icon sx={{ mr: 1, color: "text.secondary" }}>calendar_today</Icon>
                            ),
                          }}
                        />
                      </Grid>

                      <Grid item xs={12} md={6}>
                        <MDTypography variant="caption" mb={0.5} display="block">
                          To Date
                        </MDTypography>
                        <TextField
                          type="datetime-local"
                          fullWidth
                          value={toDate}
                          onChange={(e) => setToDate(e.target.value)}
                          variant="outlined"
                          sx={inputStyleSx}
                          InputProps={{
                            startAdornment: (
                              <Icon sx={{ mr: 1, color: "text.secondary" }}>calendar_today</Icon>
                            ),
                          }}
                        />
                      </Grid>
                    </Grid>
                  </MDBox>

                  <MDBox textAlign="center">
                    <MDButton type="submit" variant="gradient" color="info" sx={{ px: 5 }}>
                      Search Logs
                    </MDButton>
                  </MDBox>
                </form>
              </MDBox>
            </Card>
          </Grid>
        </Grid>

        <MDBox mt={4}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Card>
                <MDBox pt={3} px={3}>
                  <MDTypography variant="h6" fontWeight="medium">
                    Alert Results
                  </MDTypography>
                </MDBox>
                <MDBox p={2}>
                  <Projects />
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