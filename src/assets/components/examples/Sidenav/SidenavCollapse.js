import PropTypes from "prop-types";
import { useState, useRef, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";

import ListItem from "@mui/material/ListItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Icon from "@mui/material/Icon";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";

import MDBox from "../../MDBox";
import MDTypography from "../../MDTypography";

import {
  collapseItem,
  collapseIconBox,
  collapseIcon,
  collapseText,
} from "./styles/sidenavCollapse";

import { useMaterialUIController } from "context";

function SidenavCollapse({ icon, name, active, subRoutes, ...rest }) {
  const [controller] = useMaterialUIController();
  const { miniSidenav, transparentSidenav, whiteSidenav, darkMode, sidenavColor } = controller;

  const location = useLocation();
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  // Ref to hold the timer ID
  const closeTimerRef = useRef(null);

  const delayedClose = () => {
    closeTimerRef.current = setTimeout(() => {
      setAnchorEl(null);
    }, 150); // Increased slightly to 150ms for smoother bridge
  };

  const cancelClose = () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  };

  const handleOpen = (event) => {
    cancelClose();
    if (miniSidenav && subRoutes) {
      setAnchorEl(event.currentTarget);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => cancelClose();
  }, []);

  const isSubRouteActive = subRoutes?.some((route) => location.pathname === route.route);

  return (
    <>
      <ListItem
        component="li"
        onMouseEnter={handleOpen}
        onMouseLeave={delayedClose}
      >
        <MDBox
          {...rest}
          sx={(theme) => ({
            ...collapseItem(theme, {
              active: active || isSubRouteActive,
              transparentSidenav,
              whiteSidenav,
              darkMode,
              sidenavColor,
            }),
            ...(miniSidenav && {
              display: "flex !important",
              flexDirection: "column !important",
              alignItems: "center !important",
              justifyContent: "center !important",
            }),
          })}
        >
          <ListItemIcon
            sx={(theme) => ({
              ...collapseIconBox(theme, { transparentSidenav, whiteSidenav, darkMode, active }),
              ...(miniSidenav && {
                marginRight: "0 !important",
                minWidth: "auto !important",
              }),
            })}
          >
            {typeof icon === "string" ? (
              <Icon sx={(theme) => collapseIcon(theme, { active })}>{icon}</Icon>
            ) : (
              icon
            )}
          </ListItemIcon>

          <ListItemText
            primary={miniSidenav ? (
              <MDTypography
                variant="caption"
                fontWeight="regular"
                color={active ? "white" : darkMode ? "white" : "dark"}
                sx={{
                  textAlign: "center !important",
                  marginTop: "0.5rem !important",
                }}
              >
                {name}
              </MDTypography>
            ) : name}
            sx={(theme) => collapseText(theme, { miniSidenav, active })}
          />
        </MDBox>
      </ListItem>

      {/* --- MENU COMPONENT --- */}
      {subRoutes && (
        <Menu
          anchorEl={anchorEl}
          open={open}
          onClose={delayedClose}
          
          // 1. Force the position to the Right of the Anchor
          anchorOrigin={{
            vertical: "top",    // Align top of menu...
            horizontal: "right", // ...to the RIGHT edge of the sidebar item
          }}
          transformOrigin={{
            vertical: "top",    // Align top of menu...
            horizontal: "left",  // ...to the LEFT edge of the menu box
          }}
          
          // 2. Prevent auto-focus and scroll locking for smoother hover feel
          disableAutoFocusItem
          disableScrollLock
          
          MenuListProps={{
            onMouseEnter: cancelClose, 
            onMouseLeave: delayedClose,
          }}
          
          // 3. Styling the Menu Box (Paper)
          PaperProps={{
            sx: {
              mt: 0,         // Ensure it aligns exactly with the top
              ml: 1.5,       // Add gap so it doesn't overlap the icon
              minWidth: "150px", // Optional: prevent it from being too thin
              pointerEvents: 'auto',
            },
          }}
          
          // 4. Ensure the menu overlay doesn't block mouse movement
          style={{ pointerEvents: 'none' }}
        >
          {subRoutes.map((route) => {
            const renderIcon =
              typeof route.icon === "string" ? (
                <Icon sx={{ mr: 1 }}>{route.icon}</Icon>
              ) : (
                <MDBox sx={{ mr: 1 }}>{route.icon}</MDBox>
              );

            return (
              <NavLink
                key={route.key}
                to={route.route}
                style={{ textDecoration: "none", color: "inherit", pointerEvents: "auto" }}
                onClick={() => setAnchorEl(null)}
              >
                <MenuItem sx={{ display: "flex", alignItems: "center" }}>
                  {renderIcon}
                  <MDTypography variant="button" fontWeight="regular" color="text">
                    {route.name}
                  </MDTypography>
                </MenuItem>
              </NavLink>
            );
          })}
        </Menu>
      )}
    </>
  );
}

SidenavCollapse.defaultProps = {
  active: false,
  subRoutes: null,
};

SidenavCollapse.propTypes = {
  icon: PropTypes.node.isRequired,
  name: PropTypes.string.isRequired,
  active: PropTypes.bool,
  subRoutes: PropTypes.arrayOf(PropTypes.object),
};

export default SidenavCollapse;