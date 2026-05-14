/**
=========================================================
* Material Dashboard 2 React - v2.2.0
=========================================================
*/

import { useState, useEffect } from "react";

// react-router components
import { useLocation } from "react-router-dom";

// prop-types
import PropTypes from "prop-types";

// @mui components
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import Icon from "@mui/material/Icon";
import MenuItem from "@mui/material/MenuItem";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import RefreshIcon from "@mui/icons-material/Refresh";

// Material Dashboard components
import MDBox from "../../../MDBox";
import MDTypography from "../../../MDTypography";
import MDButton from "../../../MDButton";

// Example components
import Breadcrumbs from "../../Breadcrumbs";
import NotificationItem from "../../Items/NotificationItem";

// Custom styles
import { navbar, navbarContainer, navbarRow, navbarIconButton } from "../DashboardNavbar/styles";

// Context
import {
  useMaterialUIController,
  setTransparentNavbar,
  setMiniSidenav,
  setOpenConfigurator,
} from "context";

function DashboardNavbar({
  absolute,
  light,
  isMini,
  handleAccountChange,
  selectedAccountId,
  accounts,
  onManualRefresh,
  isRefreshing,
  lastRefreshTime,
}) {
  const [navbarType, setNavbarType] = useState();
  const [controller, dispatch] = useMaterialUIController();
  const { miniSidenav, transparentNavbar, fixedNavbar, openConfigurator, darkMode } = controller;

  const [openMenu, setOpenMenu] = useState(false);

  const route = useLocation().pathname.split("/").slice(1);

  // Find the selected account object to provide to Autocomplete
  const currentAccount = accounts.find((acc) => acc.id === selectedAccountId) || null;

  // --- STANDARD NAVBAR EFFECTS ---
  useEffect(() => {
    if (fixedNavbar) {
      setNavbarType("sticky");
    } else {
      setNavbarType("static");
    }

    function handleTransparentNavbar() {
      setTransparentNavbar(dispatch, (fixedNavbar && window.scrollY === 0) || !fixedNavbar);
    }

    window.addEventListener("scroll", handleTransparentNavbar);
    handleTransparentNavbar();

    return () => window.removeEventListener("scroll", handleTransparentNavbar);
  }, [dispatch, fixedNavbar]);

  // Handlers
  const handleConfiguratorOpen = () => setOpenConfigurator(dispatch, !openConfigurator);
  const handleOpenMenu = (event) => setOpenMenu(event.currentTarget);
  const handleCloseMenu = () => setOpenMenu(false);

  // Menus
  const renderMenu = () => (
    <Menu
      anchorEl={openMenu}
      anchorReference={null}
      anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
      open={Boolean(openMenu)}
      onClose={handleCloseMenu}
      sx={{ mt: 2 }}
    >
      <NotificationItem icon={<Icon>email</Icon>} title="Check new messages" />
      <NotificationItem icon={<Icon>podcasts</Icon>} title="Manage Podcast sessions" />
      <NotificationItem icon={<Icon>shopping_cart</Icon>} title="Payment successfully completed" />
    </Menu>
  );

  // Countdown Timer Component
  const RefreshCountdown = ({ lastRefreshTime }) => {
    const [timeLeft, setTimeLeft] = useState(300);

    useEffect(() => {
      const calculateTimeLeft = () => {
        const diff = Math.max(0, 300 - Math.floor((Date.now() - lastRefreshTime) / 1000));
        setTimeLeft(diff);
      };

      calculateTimeLeft();
      const interval = setInterval(calculateTimeLeft, 1000);

      return () => clearInterval(interval);
    }, [lastRefreshTime]);

    const minutes = Math.floor(timeLeft / 60);
    const seconds = String(timeLeft % 60).padStart(2, "0");

    return (
      <MDTypography variant="caption" color="text" fontWeight="medium">
        {minutes}:{seconds}
      </MDTypography>
    );
  };

  RefreshCountdown.propTypes = {
    lastRefreshTime: PropTypes.number.isRequired,
  };

  // Icon styling
  const iconsStyle = ({ palette: { dark, white, text }, functions: { rgba } }) => ({
    color: () => {
      let colorValue = light || darkMode ? white.main : dark.main;
      if (transparentNavbar && !light) {
        colorValue = darkMode ? rgba(text.main, 0.6) : text.main;
      }
      return colorValue;
    },
  });

  return (
    <AppBar
      position={absolute ? "absolute" : navbarType}
      color="inherit"
      sx={(theme) => navbar(theme, { transparentNavbar, absolute, light, darkMode })}
    >
      <Toolbar sx={(theme) => navbarContainer(theme)}>
        {/* Left Side: Breadcrumbs */}
        <MDBox color="inherit" mb={{ xs: 1, md: 0 }} sx={(theme) => navbarRow(theme, { isMini })}>
          <Breadcrumbs icon="home" title={route[route.length - 1]} route={route} light={light} />
        </MDBox>

        {!isMini && (
          <MDBox sx={(theme) => navbarRow(theme, { isMini })} display="flex" alignItems="center">
            {/* 1. Searchable Account Dropdown Section */}
            <MDBox display="flex" alignItems="center" gap={2} mr={2}>
              <MDTypography variant="h6" color="text" sx={{ whiteSpace: "nowrap" }}>
                Select Account
              </MDTypography>
              <Autocomplete
                size="small"
                options={accounts}
                getOptionLabel={(option) => option.name || ""}
                value={currentAccount}
                sx={{ width: 250 }}
                // Syncs with your existing handleAccountChange logic
                onChange={(event, newValue) => {
                  handleAccountChange({
                    target: { value: newValue ? newValue.id : "" },
                  });
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Account"
                    variant="outlined"
                    // Ensures background matches MD theme if needed
                    sx={{
                      "& .MuiInputBase-root": { height: 40 },
                      "& .MuiOutlinedInput-root": { padding: "2px 8px" },
                    }}
                  />
                )}
                // Prevents the "Loading accounts..." manual check by letting Autocomplete handle empty states
                noOptionsText="No accounts found"
                loading={accounts.length === 0}
              />
            </MDBox>

            {/* 2. Icons + Refresh */}
            <MDBox display="flex" alignItems="center" color={light ? "white" : "inherit"}>
              <MDBox display="flex" alignItems="center" mr={1}>
                <MDButton
                  variant="text"
                  color="success"
                  size="small"
                  onClick={onManualRefresh}
                  disabled={isRefreshing}
                  startIcon={
                    <RefreshIcon
                      sx={isRefreshing ? { animation: "spin 1s linear infinite" } : {}}
                    />
                  }
                  sx={{
                    textTransform: "none",
                    fontWeight: "bold",
                    minWidth: "unset",
                    p: 1,
                  }}
                />
                <RefreshCountdown lastRefreshTime={lastRefreshTime} />
              </MDBox>

              <IconButton
                size="small"
                disableRipple
                color="inherit"
                sx={navbarIconButton}
                onClick={handleConfiguratorOpen}
              >
                <Icon sx={iconsStyle}>settings</Icon>
              </IconButton>

              <IconButton
                size="small"
                disableRipple
                color="inherit"
                sx={navbarIconButton}
                onClick={handleOpenMenu}
              >
                <Icon sx={iconsStyle}>notifications</Icon>
              </IconButton>
              {renderMenu()}
            </MDBox>
          </MDBox>
        )}
      </Toolbar>
    </AppBar>
  );
}

DashboardNavbar.defaultProps = {
  absolute: false,
  light: false,
  isMini: false,
  handleAccountChange: () => {},
  selectedAccountId: "",
  accounts: [],
  onManualRefresh: () => {},
  isRefreshing: false,
  lastRefreshTime: Date.now(),
};

DashboardNavbar.propTypes = {
  absolute: PropTypes.bool,
  light: PropTypes.bool,
  isMini: PropTypes.bool,
  handleAccountChange: PropTypes.func.isRequired,
  selectedAccountId: PropTypes.string.isRequired,
  accounts: PropTypes.array.isRequired,
  onManualRefresh: PropTypes.func.isRequired,
  isRefreshing: PropTypes.bool.isRequired,
  lastRefreshTime: PropTypes.number.isRequired,
};

export default DashboardNavbar;