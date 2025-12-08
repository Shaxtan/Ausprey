/**
=========================================================
* Material Dashboard 2 React - v2.2.0
=========================================================

* Product Page: https://www.creative-tim.com/product/material-dashboard-react
* Copyright 2023 Creative Tim (https://www.creative-tim.com)

Coded by www.creative-tim.com

=========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
*/

// ** CORRECT IMPORT FOR ALERTS **
import Alerts from "../src/pages/Alerts/Alerts";
// ** NEW IMPORT FOR LOAD CELL REPORT **
import LoadCellReport from "../src/pages/LoadCellReport/LoadCellReport";
// ** ✅ NEW IMPORT FOR DEVICE CONFIGURATION **
import DeviceConfiguration from "./pages/Alerts/DeviceConfiguration";

// Material Dashboard 2 React layouts
import Dashboard from "../src/pages/dashboard";
// import Tables from "layouts/tables";
// import Billing from "layouts/billing";
// import RTL from "layouts/rtl";
import Notifications from "../src/pages/notifications";
// import Profile from "../src/pages/profile";
import SignIn from "../src/pages/authentication/sign-in";
import SignUp from "../src/pages/authentication/sign-up";
// The path for your TripReport component
import TripReport from "../src/pages/tables/data/TripReport";

// @mui icons
import Icon from "@mui/material/Icon";
// ** ✅ NEW IMPORT FOR MAP VIEW **
import MapView from "../src/pages/LoadCellReport/MapView"; // UNCOMMENTED/ADDED

const routes = [
  {
    type: "collapse",
    name: "Dashboard",
    key: "dashboard",
    icon: <Icon fontSize="small">dashboard</Icon>,
    route: "/dashboard",
    component: <Dashboard />,
  },

  // ----------------------------------------------------------------------
  // ** ✅ NEW ROUTE: DEVICE CONFIGURATION **
  {
    type: "collapse",
    name: "Device Config", // Display name in the sidebar
    key: "device-configuration", // Unique key
    icon: <Icon fontSize="small">settings_cell</Icon>, // Using a relevant icon
    route: "/device-configuration", // Unique route path
    component: <DeviceConfiguration />, // Your new component
  },
  // ----------------------------------------------------------------------
  // ** ✅ NEW ROUTE: MAP VIEW **
  {
    type: "collapse",
    name: "Map View", // Display name in the sidebar
    key: "map-view", // Unique key
    icon: <Icon fontSize="small">map</Icon>, // Using a relevant icon (e.g., 'map')
    route: "/map-view", // Unique route path
    component: <MapView />, // Your new component
  },
  // ----------------------------------------------------------------------

  {
    type: "collapse",
    name: "Alerts",
    key: "alerts",
    icon: <Icon fontSize="small">warning</Icon>,
    route: "/alerts",
    component: <Alerts />,
  }, 
  
  // Commented-out routes skipped for brevity...

  {
    type: "collapse",
    name: "Track Play",
    key: "notifications",
    icon: <Icon fontSize="small">notifications</Icon>,
    route: "/notifications",
    component: <Notifications />,
  }, 
  
  // ---------------------------------------------------------------------- 
  // ** CORRECTED LOAD CELL REPORT ROUTE **
  {
    type: "collapse",
    name: "Load Sensor",
    key: "load-cell-report", 
    icon: <Icon fontSize="small">scale</Icon>, 
    route: "/load-cell-report", 
    component: <LoadCellReport />, 
  }, 
  // ---------------------------------------------------------------------- 

  {
    // type: "collapse",
    // name: "Sign In",
    key: "sign-in", 
    // icon: <Icon fontSize="small">login</Icon>,
    route: "/authentication/sign-in",
    component: <SignIn />,
  },
  {
    // type: "collapse",
    // name: "Sign Up",
    key: "sign-up", 
    // icon: <Icon fontSize="small">assignment</Icon>,
    route: "/authentication/sign-up",
    component: <SignUp />,
  },
];

export default routes;