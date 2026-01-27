/**
=========================================================
* Material Dashboard 2 React - v2.2.0
=========================================================
*/

import { useState, useEffect } from "react";

// react-router components
import { useLocation, Link } from "react-router-dom";

// prop-types
import PropTypes from "prop-types";

// @mui components
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import Icon from "@mui/material/Icon";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import RefreshIcon from "@mui/icons-material/Refresh";

// MD components
import MDBox from "../../../MDBox";
import MDTypography from "../../../MDTypography";
import MDButton from "../../../MDButton";

// Example components
import Breadcrumbs from "../../Breadcrumbs";
import NotificationItem from "../../Items/NotificationItem";

// Custom styles
import {
  navbar,
  navbarContainer,
  navbarRow,
  navbarIconButton,
  navbarMobileMenu,
} from "../DashboardNavbar/styles";

// Layout context
import {
  useMaterialUIController,
  setTransparentNavbar,
  setMiniSidenav,
  setOpenConfigurator,
} from "context";

// NEW: Account context (the one you created in src/context/AccountContext.js)
import { useAccount } from "context/AccountContext";

// ==============================================================================
// Placeholder functions (kept same as original if you still need them somewhere)
const getInitialAccountId = () => {
  return "";
};
// ==============================================================================

function DashboardNavbarWithAccountContext({
  absolute,
  light,
  isMini,
  onManualRefresh,    // refresh handler
  isRefreshing,       // refresh state
  lastRefreshTime,    // timestamp of last refresh
}) {
  const [navbarType, setNavbarType] = useState();
  const [controller, dispatch] = useMaterialUIController();
  const { miniSidenav, transparentNavbar, fixedNavbar, openConfigurator, darkMode } = controller;

  const [openMenu, setOpenMenu] = useState(false);
  const [openAccountMenu, setOpenAccountMenu] = useState(false);

  const route = useLocation().pathname.split("/").slice(1);

  // ✅ Get account data from Context instead of props
  const { accounts, selectedAccountId, setSelectedAccountId } = useAccount();

  const handleAccountChange = (event) => {
    setSelectedAccountId(event.target.value);
  };

  // --- STANDARD NAVBAR EFFECTS (unchanged) ---
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
  // --- END STANDARD NAVBAR EFFECTS ---

  // Handlers
  const handleMiniSidenav = () => setMiniSidenav(dispatch, !miniSidenav);
  const handleConfiguratorOpen = () => setOpenConfigurator(dispatch, !openConfigurator);

  const handleOpenMenu = (event) => setOpenMenu(event.currentTarget);
  const handleCloseMenu = () => setOpenMenu(false);

  const handleOpenAccountMenu = (event) => setOpenAccountMenu(event.currentTarget);
  const handleCloseAccountMenu = () => setOpenAccountMenu(false);

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

  const renderAccountMenu = () => (
    <Menu
      anchorEl={openAccountMenu}
      anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      transformOrigin={{ vertical: "top", horizontal: "right" }}
      open={Boolean(openAccountMenu)}
      onClose={handleCloseAccountMenu}
      sx={{ mt: 2 }}
    >
      <MenuItem onClick={handleCloseAccountMenu}>
        <MDTypography variant="button" fontWeight="regular" color="dark">
          Account 1
        </MDTypography>
      </MenuItem>
      <MenuItem onClick={handleCloseAccountMenu}>
        <MDTypography variant="button" fontWeight="regular" color="dark">
          Account 2
        </MDTypography>
      </MenuItem>
    </Menu>
  );

  // Countdown Timer Component (same as your original)
  const RefreshCountdown = ({ lastRefreshTime }) => {
    const [timeLeft, setTimeLeft] = useState(300); // 5 minutes = 300 seconds

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

  // Icon styling (unchanged)
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
            {/* 1. Account Dropdown Section */}
            <MDBox display="flex" alignItems="center" gap={2} mr={2}>
              <MDTypography variant="h6" color="text" sx={{ whiteSpace: "nowrap" }}>
                Select Account
              </MDTypography>
              <FormControl variant="outlined" size="small" sx={{ minWidth: 200, height: 40 }}>
                <InputLabel id="account-select-label">Account</InputLabel>
                <Select
                  labelId="account-select-label"
                  id="account-select"
                  value={selectedAccountId}
                  label="Account"
                  onChange={handleAccountChange}
                  sx={{ height: "100%" }}
                >
                  {accounts.length > 0 ? (
                    accounts.map((account) => (
                      <MenuItem key={account.id} value={account.id}>
                        {account.name}
                      </MenuItem>
                    ))
                  ) : (
                    <MenuItem value={selectedAccountId} disabled>
                      Loading accounts...
                    </MenuItem>
                  )}
                </Select>
              </FormControl>
            </MDBox>

            {/* 2. Icons + Refresh */}
            <MDBox display="flex" alignItems="center" color={light ? "white" : "inherit"}>
              {/* Refresh Button */}
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
                >
                  {/* icon-only */}
                </MDButton>

                <RefreshCountdown lastRefreshTime={lastRefreshTime} />
              </MDBox>

              {/* NOTE: account_circle button removed so sign in/out moves to sidebar */}

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

DashboardNavbarWithAccountContext.defaultProps = {
  absolute: false,
  light: false,
  isMini: false,
  onManualRefresh: () => {},
  isRefreshing: false,
  lastRefreshTime: Date.now(),
};

DashboardNavbarWithAccountContext.propTypes = {
  absolute: PropTypes.bool,
  light: PropTypes.bool,
  isMini: PropTypes.bool,
  onManualRefresh: PropTypes.func.isRequired,
  isRefreshing: PropTypes.bool.isRequired,
  lastRefreshTime: PropTypes.number.isRequired,
};

export default DashboardNavbarWithAccountContext;
