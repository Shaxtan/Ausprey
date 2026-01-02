/**
=========================================================
* Material Dashboard 2 React - v2.2.0
=========================================================
*/
import LiveTrack from "pages/LiveTrack/LiveTrack";
import Alerts from "../src/pages/Alerts/Alerts";
import LoadCellReport from "../src/pages/LoadCellReport/LoadCellReport";
import DeviceConfiguration from "./pages/Alerts/DeviceConfiguration";

// Material Dashboard 2 React layouts
import Dashboard from "../src/pages/dashboard";
// 🔥 Step 1: Import your new component here
import Dashboard2 from "../src/pages/dashboard2"; 
import TripDashboard from "pages/TripDashboard/TripDashboard";
import Notifications from "../src/pages/notifications";
import SignIn from "../src/pages/authentication/sign-in";
import SignUp from "../src/pages/authentication/sign-up";
// import TripReport from "../src/pages/tables/data/TripReport";

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
  // 🔥 Step 2: Add the new route object here
  // {
  //   type: "collapse",
  //   name: "Dashboard 2",
  //   key: "dashboard2",
  //   icon: <Icon fontSize="small">analytics</Icon>, // You can change the icon (e.g., 'speed', 'grid_view')
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
   {
    type: "collapse",
    name: "Trip Dashboard",
    key: "live-track",
    icon: <Icon fontSize="small">gps_fixed</Icon>,
    route: "/Trip-dashboard",
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
  
  // ----------------------------------------------------------------------
  // 🔥 PARENT: REPORTS (Empty Component as placeholder)
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
  // 🔥 CHILDREN: LINKED VIA 'parent: "reports"'
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
    icon: <Icon fontSize="small">location_on</Icon>
,
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
    key: "sign-in",
    route: "/authentication/sign-in",
    component: <SignIn />,
  },
  {
    key: "sign-up",
    route: "/authentication/sign-up",
    component: <SignUp />,
  },
];

export default routes;