import PropTypes from "prop-types";
import { useState } from "react";
import { NavLink } from "react-router-dom";

// @mui material components
import ListItem from "@mui/material/ListItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Icon from "@mui/material/Icon";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";

// 🔥 FIXED IMPORTS (Relative paths)
import MDBox from "../../MDBox";
import MDTypography from "../../MDTypography";

// Custom styles for the SidenavCollapse
import {
  collapseItem,
  collapseIconBox,
  collapseIcon,
  collapseText,
} from "./styles/sidenavCollapse";

// Material Dashboard 2 React context
import { useMaterialUIController } from "context";

function SidenavCollapse({ icon, name, active, subRoutes, ...rest }) {
  const [controller] = useMaterialUIController();
  const { miniSidenav, transparentSidenav, whiteSidenav, darkMode, sidenavColor } = controller;

  // 🔥 STATE FOR MENU
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  // 🔥 OPEN MENU ON HOVER (Only if miniSidenav is active)
  const handleOpen = (event) => {
    if (miniSidenav && subRoutes) {
      setAnchorEl(event.currentTarget);
    }
  };

  // 🔥 CLOSE MENU
  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <ListItem
        component="li"
        // 🔥 Trigger Menu on Mouse Enter of the Icon/Item
        onMouseEnter={handleOpen}
        onMouseLeave={handleClose}
      >
        <MDBox
          {...rest}
          sx={(theme) => ({
            ...collapseItem(theme, {
              active,
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
              width: "100% !important",
              height: "auto !important",
              minHeight: "4.5rem !important",
              padding: `${theme.spacing(1)} ${theme.spacing(0.5)} !important`,
              whiteSpace: "normal !important",
            }),
          })}
        >
          <ListItemIcon
            sx={(theme) => ({
              ...collapseIconBox(theme, { transparentSidenav, whiteSidenav, darkMode, active }),
              ...(miniSidenav && {
                marginRight: "0 !important",
                padding: "0 !important",
                minWidth: "auto !important",
                marginBottom: "0 !important",
                justifyContent: "center !important",
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
                  color={active ? "white" : darkMode ? "white" : "dark"}
                  sx={{
                    display: "block !important",
                    textAlign: "center !important",
                    lineHeight: "1.2 !important",
                    marginTop: "0.5rem !important",
                    paddingLeft: "0.25rem !important",
                    paddingRight: "0.25rem !important",
                    overflow: "hidden !important",
                    textOverflow: "ellipsis !important",
                    whiteSpace: "normal !important",
                  }}
                >
                  {name}
                </MDTypography>
              ) : (
                name
              )
            }
            sx={(theme) => {
              const baseStyles = collapseText(theme, {
                miniSidenav,
                transparentSidenav,
                whiteSidenav,
                active,
              });

              if (miniSidenav) {
                return {
                  ...baseStyles,
                  display: "block !important",
                  flex: "0 0 auto !important",
                  textAlign: "center !important",
                  margin: "0 !important",
                  padding: "0 !important",
                  opacity: "1 !important",
                  "& > span": {
                    display: "none !important",
                  },
                };
              }

              return baseStyles;
            }}
          />
        </MDBox>
      </ListItem>

      {/* 🔥 THE MENU COMPONENT (Solves clipping issues) */}
      {subRoutes && (
        <Menu
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          // 🔥 Keep menu open when hovering over the menu itself
          MenuListProps={{
            onMouseEnter: () => setAnchorEl(anchorEl),
            onMouseLeave: handleClose,
          }}
          anchorOrigin={{
            vertical: "top",
            horizontal: "right",
          }}
          transformOrigin={{
            vertical: "top",
            horizontal: "left",
          }}
          sx={{ marginLeft: 1 }} // Add slight gap from sidebar
        >
          {subRoutes.map((route) => (
            <NavLink key={route.key} to={route.route} style={{ textDecoration: "none", color: "inherit" }}>
              <MenuItem onClick={handleClose}>
                 <Icon fontSize="small" sx={{ mr: 1 }}>{route.icon || "arrow_right"}</Icon>
                 <MDTypography variant="button" fontWeight="regular" color="text">
                    {route.name}
                 </MDTypography>
              </MenuItem>
            </NavLink>
          ))}
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