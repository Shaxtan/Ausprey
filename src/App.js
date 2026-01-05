import { useState, useEffect, useMemo } from "react";

// react-router components
import { Routes, Route, Navigate, useLocation } from "react-router-dom";

// @mui material components
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import Icon from "@mui/material/Icon";

// 💡 CORRECTED IMPORT PATH: Assuming App.js is in the 'src' directory.
import mainLogo from "./assets/images/mainlogoo.png";
// ⭐ NEW IMPORT: Import the small icon
import smallIcon from "./assets/images/small-icon.jpeg";

// Material Dashboard 2 React components
import MDBox from "../src/assets/components/MDBox";

// Material Dashboard 2 React example components
import Sidenav from "../src/assets/components/examples/Sidenav";
import Configurator from "../src/assets/components/examples/Configurator";

// Material Dashboard 2 React themes
import theme from "assets/theme";
import themeRTL from "assets/theme/theme-rtl";

// Material Dashboard 2 React Dark Mode themes
import themeDark from "assets/theme-dark";
import themeDarkRTL from "assets/theme-dark/theme-rtl";

// RTL plugins
import rtlPlugin from "stylis-plugin-rtl";
import { CacheProvider } from "@emotion/react";
import createCache from "@emotion/cache";

// Material Dashboard 2 React routes
import routes from "routes";

// Material Dashboard 2 React contexts
// ⭐ FIX: Added 'setLayout' to control when the sidebar appears
import { useMaterialUIController, setMiniSidenav, setOpenConfigurator, setLayout } from "context";

export default function App() {
  const [controller, dispatch] = useMaterialUIController();
  const {
    miniSidenav,
    direction,
    layout,
    openConfigurator,
    sidenavColor,
    // eslint-disable-next-line no-unused-vars
    transparentSidenav,
    // eslint-disable-next-line no-unused-vars
    whiteSidenav,
    darkMode,
  } = controller;
  const [onMouseEnter, setOnMouseEnter] = useState(false);
  const [rtlCache, setRtlCache] = useState(null);
  const { pathname } = useLocation();

  // Cache for the rtl
  useMemo(() => {
    const cacheRtl = createCache({
      key: "rtl",
      stylisPlugins: [rtlPlugin],
    });

    setRtlCache(cacheRtl);
  }, []);

  // Open sidenav when mouse enter on mini sidenav
  const handleOnMouseEnter = () => {
    if (miniSidenav && !onMouseEnter) {
      setMiniSidenav(dispatch, false);
      setOnMouseEnter(true);
    }
  };

  // Close sidenav when mouse leave mini sidenav
  const handleOnMouseLeave = () => {
    if (onMouseEnter) {
      setMiniSidenav(dispatch, true);
      setOnMouseEnter(false);
    }
  };

  // Change the openConfigurator state
  const handleConfiguratorOpen = () => setOpenConfigurator(dispatch, !openConfigurator);

  // Setting the dir attribute for the body element
  useEffect(() => {
    document.body.setAttribute("dir", direction);
  }, [direction]);

  // Setting page scroll to 0 when changing the route
  useEffect(() => {
    document.documentElement.scrollTop = 0;
    document.scrollingElement.scrollTop = 0;
  }, [pathname]);

  // ⭐ CRUCIAL FIX: Set the layout type based on the current route
  useEffect(() => {
    if (pathname.startsWith("/authentication")) {
      setLayout(dispatch, "authentication"); // Set layout to hide Sidenav
    } else {
      setLayout(dispatch, "dashboard"); // Default to dashboard layout
    }
  }, [pathname, dispatch]);

  const getRoutes = (allRoutes) =>
    allRoutes.reduce((routesArray, route) => {
      if (route.collapse) {
        return [...routesArray, ...getRoutes(route.collapse)];
      }

      if (route.route) {
        return [
          ...routesArray,
          <Route exact path={route.route} element={route.component} key={route.key} />,
        ];
      }

      return routesArray;
    }, []);

  // ⭐ NEW LOGIC: Determine which logo to use based on miniSidenav state
  const logo = miniSidenav ? smallIcon : mainLogo;
  // ⭐ NEW LOGIC: Adjust logo styling based on miniSidenav state
  const logoStyles = miniSidenav
    ? {
        "& .MuiBox-root img": {
          width: "32px !important",
          height: "32px !important",
          borderRadius: "50% !important",
        },
      }
    : {
        "& .MuiBox-root img": {
          marginLeft: "-27px",
          width: "240px !important",
          height: "auto !important",
          borderRadius: "5px !important",
        },
      };

  return direction === "rtl" ? (
    <CacheProvider value={rtlCache}>
      <ThemeProvider theme={darkMode ? themeDarkRTL : themeRTL}>
        <CssBaseline />
        {/* The sidebar and configurator are only rendered when layout is "dashboard" */}
        {layout === "dashboard" && (
          <>
            <Sidenav
              color={sidenavColor}
              brand={logo}
              brandName=""
              routes={routes}
              onMouseEnter={handleOnMouseEnter}
              onMouseLeave={handleOnMouseLeave}
              sx={logoStyles}
            />
            <Configurator />
            {/* configsButton removed */}
          </>
        )}
        {layout === "vr" && <Configurator />}
        <Routes>
          {getRoutes(routes)}
          <Route path="*" element={<Navigate to="/dashboard" />} />
        </Routes>
      </ThemeProvider>
    </CacheProvider>
  ) : (
    <ThemeProvider theme={darkMode ? themeDark : theme}>
      <CssBaseline />
      {/* The sidebar and configurator are only rendered when layout is "dashboard" */}
      {layout === "dashboard" && (
        <>
          <Sidenav
            color={sidenavColor}
            brand={logo}
            brandName=""
            routes={routes}
            onMouseEnter={handleOnMouseEnter}
            onMouseLeave={handleOnMouseLeave}
            sx={logoStyles}
          />
          <Configurator />
          {/* configsButton removed */}
        </>
      )}
      {layout === "vr" && <Configurator />}
      <Routes>
        {getRoutes(routes)}
        <Route path="*" element={<Navigate to="/dashboard" />} />
      </Routes>
    </ThemeProvider>
  );
}
