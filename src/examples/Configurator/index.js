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

import { useState, useEffect } from "react";

// react-github-btn (Still imported, but unused in the final JSX)
import GitHubButton from "react-github-btn";

// @mui material components
import Divider from "@mui/material/Divider";
import Switch from "@mui/material/Switch";
import IconButton from "@mui/material/IconButton";
import Link from "@mui/material/Link";
import Icon from "@mui/material/Icon";

// @mui icons (Still imported, but unused in the final JSX)
import TwitterIcon from "@mui/icons-material/Twitter";
import FacebookIcon from "@mui/icons-material/Facebook";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";

// Custom styles for the Configurator
import ConfiguratorRoot from "examples/Configurator/ConfiguratorRoot";

// Material Dashboard 2 React context
import {
  useMaterialUIController,
  setOpenConfigurator,
  setFixedNavbar, // Keep
  setDarkMode, // Keep
  // The following context functions are now unused but kept for completeness
  // if you decide to add back Sidenav options later.
  setTransparentSidenav,
  setWhiteSidenav,
  setSidenavColor,
} from "context";

function Configurator() {
  const [controller, dispatch] = useMaterialUIController();
  const {
    openConfigurator,
    fixedNavbar,
    darkMode,
    // Unused properties removed for clarity in the remaining code block
  } = controller;

  // Since we only use fixedNavbar and darkMode, we only need their handlers
  const handleCloseConfigurator = () => setOpenConfigurator(dispatch, false);
  const handleFixedNavbar = () => setFixedNavbar(dispatch, !fixedNavbar);
  const handleDarkMode = () => setDarkMode(dispatch, !darkMode);

  // The rest of the unused variables and functions (sidenavColors, useEffect, sidenav handlers, sidenavTypeButtonsStyles, sidenavTypeActiveButtonStyles) are removed from the component's body for a clean result, as they are not needed for the fixedNavbar and darkMode switches.

  return (
    <ConfiguratorRoot variant="permanent" ownerState={{ openConfigurator }}>
      {/* Header with Close Icon */}
      <MDBox
        display="flex"
        justifyContent="space-between"
        alignItems="baseline"
        pt={4}
        pb={0.5}
        px={3}
      >
        <MDBox>
          <MDTypography variant="h5">Settings</MDTypography> {/* Changed title for simplicity */}
          <MDTypography variant="body2" color="text">
            Toggle dashboard options.
          </MDTypography>
        </MDBox>

        <Icon
          sx={({ typography: { size }, palette: { dark, white } }) => ({
            fontSize: `${size.lg} !important`,
            color: darkMode ? white.main : dark.main,
            stroke: "currentColor",
            strokeWidth: "2px",
            cursor: "pointer",
            transform: "translateY(5px)",
          })}
          onClick={handleCloseConfigurator}
        >
          close
        </Icon>
      </MDBox>

      <Divider />

      {/* Configuration Switches Section */}
      <MDBox pt={0.5} pb={3} px={3}>
        {/* Navbar Fixed Switch */}
        <MDBox
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mt={3}
          lineHeight={1}
        >
          <MDTypography variant="h6">Navbar Fixed</MDTypography>

          <Switch checked={fixedNavbar} onChange={handleFixedNavbar} />
        </MDBox>
        <Divider />
        {/* Light / Dark Mode Switch */}
        <MDBox display="flex" justifyContent="space-between" alignItems="center" lineHeight={1}>
          <MDTypography variant="h6">Light / Dark</MDTypography>

          <Switch checked={darkMode} onChange={handleDarkMode} />
        </MDBox>
      </MDBox>

      {/* Footer section (documentation, GitHub, social shares) is removed */}
    </ConfiguratorRoot>
  );
}

export default Configurator;
