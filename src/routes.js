/**
=========================================================
* Material Dashboard 2 React - v2.2.0
=========================================================
*/
import Geozone from "pages/Geozone/Geozone";
import MDBox from "assets/components/MDBox";
import LiveTrack from "pages/LiveTrack/LiveTrack";
import Alerts from "../src/pages/Alerts/Alerts";
import LoadCellReport from "../src/pages/LoadCellReport/LoadCellReport";
import LiveLoadGraph from "../src/pages/LoadCellReport/LiveLoadGraph";
import DistanceReport from "pages/DistanceReport/DistanceReport";
import DeviceConfiguration from "./pages/Alerts/DeviceConfiguration";
import TripDashboard2 from "pages/TripDashboard/TripDashboard2";

// Material Dashboard 2 React layouts
import Dashboard from "../src/pages/dashboard";
import Dashboard2 from "../src/pages/dashboard2";
import TripDashboard from "pages/TripDashboard/TripDashboard";
import Notifications from "../src/pages/notifications";
import SignIn from "../src/pages/authentication/sign-in";
import SignUp from "../src/pages/authentication/sign-up";

// @mui icons
import Icon from "@mui/material/Icon";
import MapView from "../src/pages/LoadCellReport/MapView";

const routes = [
  {
    type: "collapse",
    name: "Dashboard",
    key: "dashboard",
    icon: <Icon fontSize="small">dashboard</Icon>,
    route: "/dashboard",
    component: <Dashboard />,
  },

  // {
  //   type: "collapse",
  //   name: "Dashboard 2",
  //   key: "dashboard2",
  //   icon: <Icon fontSize="small">analytics</Icon>,
  //   route: "/dashboard2",
  //   component: <Dashboard2 />,
  // },

  // {
  //   type: "collapse",
  //   name: "Device Config",
  //   key: "device-configuration",
  //   icon: <Icon fontSize="small">settings_cell</Icon>,
  //   route: "/device-configuration",
  //   component: <DeviceConfiguration />,
  // },

  {
    type: "collapse",
    name: "Live Track",
    key: "live-track",
    icon: <Icon fontSize="small">gps_fixed</Icon>,
    route: "/live-track",
    component: <LiveTrack />,
  },

  // {
  //   type: "collapse",
  //   name: "Exam",
  //   key: "trip-dashboard2",
  //   icon: <Icon fontSize="small">gps_fixed</Icon>,
  //   route: "/trip-dashboard2",
  //   component: <TripDashboard2 />,
  // },

  {
    type: "collapse",
    name: (
      <span
        style={{
          lineHeight: 1.1,
          textAlign: "center",
          display: "inline-block",
          color: "#ffffff",
        }}
      >
        Trip
        <br />
        Dashboard
      </span>
    ),
    key: "trip-dashboard",
    icon: <Icon fontSize="small">timeline</Icon>,
    route: "/trip-dashboard",
    component: <TripDashboard />,
  },

  {
    type: "collapse",
    name: "Map View",
    key: "map-view",
    icon: <Icon fontSize="small">map</Icon>,
    route: "/map-view",
    component: <MapView />,
  },
  {
    type: "collapse",
    name: "Geozone",
    key: "geozone",
    icon: <Icon fontSize="small">public</Icon>, // or any other icon
    route: "/geozone",
    component: <Geozone />,
  },

  // ----------------------------------------------------------------------
  // PARENT: REPORTS (placeholder)
  // ----------------------------------------------------------------------
  {
    type: "collapse",
    name: "Reports",
    key: "reports",
    icon: <Icon fontSize="small">assessment</Icon>,
    route: "/reports",
    component: <Dashboard />,
    noRoute: true,
  },

  // ----------------------------------------------------------------------
  // CHILDREN: under "Reports"
  // ----------------------------------------------------------------------
  {
    type: "collapse",
    name: "Alerts",
    key: "alerts",
    icon: <Icon fontSize="small">warning</Icon>,
    route: "/alerts",
    component: <Alerts />,
    parent: "reports",
  },
  {
    type: "collapse",
    name: "Track Play",
    key: "notifications",
    icon: <Icon fontSize="small">location_on</Icon>,
    route: "/notifications",
    component: <Notifications />,
    parent: "reports",
  },
  {
    type: "collapse",
    name: "Load Sensor",
    key: "load-cell-report",
    icon: <Icon fontSize="small">scale</Icon>,
    route: "/load-cell-report",
    component: <LoadCellReport />,
    parent: "reports",
  },
  {
    type: "collapse",
    name: "Live load Sensor",
    key: "live-load-cell-report",
    icon: <Icon fontSize="small">bolt</Icon>,
    route: "/live-load-cell-report",
    component: <LiveLoadGraph />,
    parent: "reports",
  },
  {
    type: "collapse",
    name: "Distance Report",
    key: "distance-report",
    icon: <Icon fontSize="small">directions_car</Icon>,
    route: "/distance-report",
    component: <DistanceReport />,
    parent: "reports",
  },

  // ----------------------------------------------------------------------
  // AUTH PAGES IN SIDEBAR (same behavior as old navbar)
  // ----------------------------------------------------------------------
  {
    type: "collapse",
    name: "Sign In",
    key: "sign-in",
    icon: <Icon fontSize="small">login</Icon>,
    route: "/authentication/sign-in",
    component: <SignIn />,
  },

  {
    type: "collapse",
    name: "Sign Out",
    key: "sign-out",
    icon: <Icon fontSize="small">logout</Icon>,
    // IMPORTANT: same as your old navbar: Sign Out goes to sign-up route
    route: "/authentication/sign-up",
    component: <SignUp />,
  },
];

export default routes;
