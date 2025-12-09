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

  const closeTimerRef = useRef(null);

  const delayedClose = () => {
    closeTimerRef.current = setTimeout(() => {
      setAnchorEl(null);
    }, 150);
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

  useEffect(() => {
    return () => cancelClose();
  }, []);

  const isSubRouteActive = subRoutes?.some((route) => location.pathname === route.route);

  return (
    <>
      <ListItem component="li" onMouseEnter={handleOpen} onMouseLeave={delayedClose}>
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
            primary={
              miniSidenav ? (
                <MDTypography
                  variant="caption"
                  fontWeight="regular"
                  color="white"     // ✅ ALWAYS WHITE
                  sx={{
                    textAlign: "center !important",
                    marginTop: "0.5rem !important",
                  }}
                >
                  {name}
                </MDTypography>
              ) : (
                name
              )
            }
            sx={(theme) => collapseText(theme, { miniSidenav, active })}
          />
        </MDBox>
      </ListItem>

      {subRoutes && (
        <Menu
          anchorEl={anchorEl}
          open={open}
          onClose={delayedClose}
          anchorOrigin={{
            vertical: "top",
            horizontal: "right",
          }}
          transformOrigin={{
            vertical: "top",
            horizontal: "left",
          }}
          disableAutoFocusItem
          disableScrollLock
          MenuListProps={{
            onMouseEnter: cancelClose,
            onMouseLeave: delayedClose,
          }}
          PaperProps={{
            sx: {
              mt: 0,
              ml: 1.5,
              minWidth: "150px",
              pointerEvents: "auto",
            },
          }}
          style={{ pointerEvents: "none" }}
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
