import { useEffect } from "react";
import { useLocation, NavLink } from "react-router-dom";
import PropTypes from "prop-types";
import List from "@mui/material/List";
import Divider from "@mui/material/Divider";
import Link from "@mui/material/Link";
import Icon from "@mui/material/Icon";

// 🔥 FIXED IMPORTS
import MDBox from "../../MDBox";
import MDTypography from "../../MDTypography";
import SidenavCollapse from "./SidenavCollapse";
import SidenavRoot from "./SidenavRoot";
import sidenavLogoLabel from "./styles/sidenav";

import {
  useMaterialUIController,
  setMiniSidenav,
  setTransparentSidenav,
  setWhiteSidenav,
} from "context";

function Sidenav({ color, brand, brandName, routes, ...rest }) {
  const [controller, dispatch] = useMaterialUIController();
  const { miniSidenav, transparentSidenav, whiteSidenav, darkMode } = controller;
  const location = useLocation();
  const collapseName = location.pathname.replace("/", "");

  let textColor = "white";
  if (transparentSidenav || (whiteSidenav && !darkMode)) textColor = "dark";
  else if (whiteSidenav && darkMode) textColor = "inherit";

  // 1. Force initial state to collapsed
  useEffect(() => {
    setMiniSidenav(dispatch, true);
    setTransparentSidenav(dispatch, false);
    setWhiteSidenav(dispatch, false);
  }, [dispatch]);

  // 2. Intercept and neutralize mouse events from Parent Layout
  // This prevents the Layout from forcing the sidebar open on hover
  const { onMouseEnter, onMouseLeave, ...restProps } = rest;

  // Filter out Children (Alerts, TrackPlay, LoadSensor)
  const reportsChildren = routes.filter(
    (r) => r.type === "collapse" && r.parent === "reports"
  );

  const renderRoutes = routes.map(
    ({ type, name, icon, title, key, href, route, parent, noRoute }) => {
      
      // Hide Children from main list
      if (parent === "reports") return null;

      if (type === "collapse") {
        
        // Handle Parent "Reports"
        if (key === "reports") {
          const subRoutes = reportsChildren.map((r) => ({
            key: r.key,
            name: r.name,
            route: r.route,
            icon: r.icon,
          }));

          const isActive =
            key === collapseName ||
            subRoutes.some((sr) => sr.route === location.pathname);

          return (
            <SidenavCollapse
              key={key}
              name={name}
              icon={icon}
              active={isActive}
              subRoutes={subRoutes}
            />
          );
        }

        // Standard Route Logic
        const isActive = key === collapseName;
        if (href) {
          return (
            <Link href={href} key={key} target="_blank" sx={{ textDecoration: "none" }}>
              <SidenavCollapse name={name} icon={icon} active={isActive} />
            </Link>
          );
        }
        if (noRoute) {
          return (
            <SidenavCollapse key={key} name={name} icon={icon} active={isActive} />
          );
        }
        return (
          <NavLink key={key} to={route}>
            <SidenavCollapse name={name} icon={icon} active={isActive} />
          </NavLink>
        );
      }

      if (type === "title") {
        return (
          <MDTypography
            key={key}
            color={textColor}
            display="block"
            variant="caption"
            fontWeight="bold"
            textTransform="uppercase"
            pl={3}
            mt={2}
            mb={1}
            ml={1}
          >
            {title}
          </MDTypography>
        );
      }

      if (type === "divider") {
        return <Divider key={key} light />;
      }

      return null;
    }
  );

  return (
    <SidenavRoot
      {...restProps} // Pass safe props
      variant="permanent"
      // 3. HARD LOCK: Force miniSidenav to true in ownerState 
      // This ensures the CSS always renders the collapsed width
      ownerState={{ ...controller, miniSidenav: true }} 
      onMouseEnter={() => {}} // Explicitly block hover expansion
      onMouseLeave={() => {}} // Explicitly block hover expansion
    >
      <MDBox pt={3} pb={1} px={4} textAlign="center">
        <MDBox
          display={{ xs: "block", xl: "none" }}
          position="absolute"
          top={0}
          right={0}
          p={1.625}
          onClick={() => setMiniSidenav(dispatch, true)}
          sx={{ cursor: "pointer" }}
        >
          <MDTypography variant="h6" color="secondary">
            <Icon sx={{ fontWeight: "bold" }}>close</Icon>
          </MDTypography>
        </MDBox>

        <MDBox component={NavLink} to="/" display="flex" alignItems="center">
          {brand && <MDBox component="img" src={brand} alt="Brand" width="2rem" />}
          <MDBox sx={(theme) => sidenavLogoLabel(theme, { miniSidenav: true })}>
            <MDTypography component="h6" variant="button" fontWeight="medium" color={textColor}>
              {brandName}
            </MDTypography>
          </MDBox>
        </MDBox>
      </MDBox>
      <Divider />
      <List>{renderRoutes}</List>
    </SidenavRoot>
  );
}

Sidenav.defaultProps = { color: "info", brand: "" };
Sidenav.propTypes = {
  color: PropTypes.oneOf(["primary", "secondary", "info", "success", "warning", "error", "dark"]),
  brand: PropTypes.string,
  brandName: PropTypes.string.isRequired,
  routes: PropTypes.arrayOf(PropTypes.object).isRequired,
};

export default Sidenav;