import { useState, useEffect, useMemo } from "react";

// react-router components
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AccountProvider } from "../src/context/AccountContext";

// @mui material components
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import Icon from "@mui/material/Icon";

// logos
import mainLogo from "./assets/images/mainlogoo.png";
import smallIcon from "./assets/images/small-icon.jpeg";

// Material Dashboard 2 React components
import MDBox from "../src/assets/components/MDBox";

// Material Dashboard 2 React example components
import Sidenav from "../src/assets/components/examples/Sidenav";
import Configurator from "../src/assets/components/examples/Configurator";

// themes
import theme from "assets/theme";
import themeRTL from "assets/theme/theme-rtl";
import themeDark from "assets/theme-dark";
import themeDarkRTL from "assets/theme-dark/theme-rtl";

// RTL plugins
import rtlPlugin from "stylis-plugin-rtl";
import { CacheProvider } from "@emotion/react";
import createCache from "@emotion/cache";

// routes
import routes from "routes";

// context
import { useMaterialUIController, setMiniSidenav, setOpenConfigurator, setLayout } from "context";

const isAuthPath = (pathname) => pathname.startsWith("/authentication") || pathname === "/login";

export default function App() {
  const [controller, dispatch] = useMaterialUIController();
  const {
    miniSidenav,
    direction,
    layout,
    openConfigurator,
    sidenavColor,
    transparentSidenav,
    whiteSidenav,
    darkMode,
  } = controller;
  const [onMouseEnter, setOnMouseEnter] = useState(false);
  const [rtlCache, setRtlCache] = useState(null);
  const { pathname } = useLocation();

  useMemo(() => {
    const cacheRtl = createCache({
      key: "rtl",
      stylisPlugins: [rtlPlugin],
    });

    setRtlCache(cacheRtl);
  }, []);

  const handleOnMouseEnter = () => {
    if (miniSidenav && !onMouseEnter) {
      setMiniSidenav(dispatch, false);
      setOnMouseEnter(true);
    }
  };

  const handleOnMouseLeave = () => {
    if (onMouseEnter) {
      setMiniSidenav(dispatch, true);
      setOnMouseEnter(false);
    }
  };

  const handleConfiguratorOpen = () => setOpenConfigurator(dispatch, !openConfigurator);

  useEffect(() => {
    document.body.setAttribute("dir", direction);
  }, [direction]);

  useEffect(() => {
    document.documentElement.scrollTop = 0;
    document.scrollingElement.scrollTop = 0;
  }, [pathname]);

  useEffect(() => {
    if (isAuthPath(pathname)) {
      setLayout(dispatch, "authentication"); // hide Sidenav on auth
    } else {
      setLayout(dispatch, "dashboard"); // default to dashboard layout
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

  const logo = miniSidenav ? smallIcon : mainLogo;
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

  const authRoutes = routes.filter(
    (r) => r.route && (r.route.startsWith("/authentication") || r.route === "/login")
  );
  const protectedRoutes = routes.filter(
    (r) => r.route && !(r.route.startsWith("/authentication") || r.route === "/login")
  );

  const authRouteElements = authRoutes.map((route) => (
    <Route exact path={route.route} element={route.component} key={route.key} />
  ));

  const protectedRouteElements = protectedRoutes.map((route) => (
    <Route exact path={route.route} element={route.component} key={route.key} />
  ));

  const AppContent = (
    <>
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
        </>
      )}
      {layout === "vr" && <Configurator />}

      <Routes>
        {authRouteElements}

        <Route
          path="/*"
          element={
            <AccountProvider>
              <Routes>
                {protectedRouteElements}
                <Route path="*" element={<Navigate to="/dashboard" />} />
              </Routes>
            </AccountProvider>
          }
        />

        <Route path="*" element={<Navigate to="/dashboard" />} />
      </Routes>
    </>
  );

  return direction === "rtl" ? (
    <CacheProvider value={rtlCache}>
      <ThemeProvider theme={darkMode ? themeDarkRTL : themeRTL}>
        <CssBaseline />
        {AppContent}
      </ThemeProvider>
    </CacheProvider>
  ) : (
    <ThemeProvider theme={darkMode ? themeDark : theme}>
      <CssBaseline />
      {AppContent}
    </ThemeProvider>
  );
}
