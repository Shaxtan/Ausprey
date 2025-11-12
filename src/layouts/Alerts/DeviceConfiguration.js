// src/layouts/DeviceConfiguration/DeviceConfiguration.js

import React from "react";
// ** ✅ IMPORT PropTypes **
import PropTypes from "prop-types"; 

// @mui material components
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
// import Icon from "@mui/material/Icon"; // Icon is not strictly needed here

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";
// import MDAlert from "components/MDAlert"; // Optional: for success/error messages

// Material Dashboard 2 React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";

// Custom component for a Select dropdown
const MDSelect = ({ label, options, value, onChange }) => (
  <MDBox mb={2}>
    <MDTypography variant="caption" fontWeight="regular" color="text" sx={{ display: "block", mb: 1 }}>
      {label}
    </MDTypography>
    <MDBox
      component="select"
      name={label.toLowerCase().replace(/\s/g, "")} // Add name attribute for better form handling
      value={value}
      onChange={onChange}
      sx={({ palette: { grey, white }, functions: { pxToRem } }) => ({
        width: "100%",
        padding: `${pxToRem(8)} ${pxToRem(12)}`,
        border: `1px solid ${grey[300]}`,
        borderRadius: "0.5rem",
        backgroundColor: white.main,
        cursor: "pointer",
        fontSize: pxToRem(14),
        "&:focus": {
          outline: 0,
          borderColor: "#4d90fe", // Example focus color
        },
      })}
    >
      <option value="" disabled>Select {label}</option>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </MDBox>
  </MDBox>
);

// ** ✅ PropTypes Definition for MDSelect Component **
MDSelect.propTypes = {
  label: PropTypes.string.isRequired,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    })
  ).isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  onChange: PropTypes.func.isRequired,
};


function DeviceConfiguration() {
  // State for form fields
  const [formData, setFormData] = React.useState({
    account: "",
    deviceType: "",
    imei: "",
    selectCommand: "",
    commandExpiryTime: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    // Map MDSelect changes back to state (uses the `label` as the key)
    const stateKey = name === 'commandexpirytime(inminutes)' ? 'commandExpiryTime' : name; 

    setFormData((prev) => ({ ...prev, [stateKey]: value }));
  };

  const handleSubmit = () => {
    console.log("Configuration Updated:", formData);
    // Add your logic here to submit the configuration data
    alert("Configuration update simulated!");
  };

  // Dummy data for Select components
  const accountOptions = [
    { label: "Account A", value: "A" },
    { label: "Account B", value: "B" },
    { label: "Account C", value: "C" },
  ];

  const deviceTypeOptions = [
    { label: "Type 1 (GPS)", value: "type1" },
    { label: "Type 2 (Tracker)", value: "type2" },
  ];

  const selectCommandOptions = [
    { label: "Restart Device", value: "restart" },
    { label: "Set Geofence", value: "geofence" },
    { label: "Change Reporting Interval", value: "interval" },
  ];


  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox pt={6} pb={3}>
        <Grid container spacing={6}>
          <Grid item xs={12}>
            <Card>
              <MDBox
                mx={2}
                mt={-3}
                py={3}
                px={2}
                variant="gradient"
                bgColor="info"
                borderRadius="lg"
                coloredShadow="info"
              >
                {/* Heading: Device Configuration */}
                <MDTypography variant="h6" color="white">
                  Device Configuration
                </MDTypography>
              </MDBox>
              <MDBox p={3}>
                {/* Subheading: Create New Configuration */}
                <MDTypography variant="h5" color="text" mb={3} mt={1}>
                  Create New Configuration
                </MDTypography>

                <Grid container spacing={3}>
                  {/* Account */}
                  <Grid item xs={12} sm={6} md={4}>
                    <MDSelect
                      label="account"
                      options={accountOptions}
                      value={formData.account}
                      onChange={handleInputChange}
                    />
                  </Grid>

                  {/* Device Type */}
                  <Grid item xs={12} sm={6} md={4}>
                    <MDSelect
                      label="deviceType"
                      options={deviceTypeOptions}
                      value={formData.deviceType}
                      onChange={handleInputChange}
                    />
                  </Grid>
                  
                  {/* IMEI */}
                  <Grid item xs={12} sm={6} md={4}>
                    <MDInput 
                      label="IMEI" 
                      fullWidth 
                      type="text"
                      name="imei"
                      value={formData.imei}
                      onChange={handleInputChange}
                    />
                  </Grid>

                  {/* Select Command */}
                  <Grid item xs={12} sm={6} md={6}>
                    <MDSelect
                      label="selectCommand"
                      options={selectCommandOptions}
                      value={formData.selectCommand}
                      onChange={handleInputChange}
                    />
                  </Grid>

                  {/* Command Expiry Time (In Minutes) */}
                  <Grid item xs={12} sm={6} md={6}>
                    <MDInput 
                      label="Command Expiry Time (In Minutes)" 
                      fullWidth 
                      type="number"
                      name="commandExpiryTime"
                      value={formData.commandExpiryTime}
                      onChange={handleInputChange}
                    />
                  </Grid>
                </Grid>

                {/* Update Button */}
                <MDBox mt={4} mb={1} display="flex" justifyContent="flex-end">
                  <MDButton 
                    variant="gradient" 
                    color="dark" 
                    onClick={handleSubmit}
                  >
                    Update
                  </MDButton>
                </MDBox>
                
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default DeviceConfiguration;