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
import Alerts from "layouts/Alerts/Alerts";
// ** NEW IMPORT FOR LOAD CELL REPORT **
import LoadCellReport from "layouts/LoadCellReport/LoadCellReport";

// Material Dashboard 2 React layouts
import Dashboard from "layouts/dashboard";
import Tables from "layouts/tables";
import Billing from "layouts/billing";
// import RTL from "layouts/rtl";
import Notifications from "layouts/notifications";
import Profile from "layouts/profile";
import SignIn from "layouts/authentication/sign-in";
import SignUp from "layouts/authentication/sign-up";
// The path for your TripReport component
import TripReport from "layouts/tables/data/TripReport";

// @mui icons
import Icon from "@mui/material/Icon";

const routes = [
  {
    type: "collapse",
    name: "Dashboard",
    key: "dashboard",
    icon: <Icon fontSize="small">dashboard</Icon>,
    route: "/dashboard",
    component: <Dashboard />,
  },

  {
    type: "collapse",
    name: "Alerts",
    key: "alerts",
    icon: <Icon fontSize="small">warning</Icon>,
    route: "/alerts",
    component: <Alerts />,
  },

  {
    type: "collapse",
    name: "Distance Report",
    key: "tables",
    icon: <Icon fontSize="small">table_view</Icon>,
    route: "/tables",
    component: <Tables />,
  },

  // NOTE: Keeping old Billing route as is
  // {
  //   type: "collapse",
  //   name: "Billing (Old)",
  //   key: "billing-old",
  //   icon: <Icon fontSize="small">receipt_long</Icon>,
  //   route: "/billing",
  //   component: <Billing />,
  // },

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
    name: "Load Cell Report",
    key: "load-cell-report", // CRUCIAL: Changed key from 'profile' to 'load-cell-report'
    icon: <Icon fontSize="small">scale</Icon>, // Changed icon to a more fitting one (scale)
    route: "/load-cell-report", // CRUCIAL: Changed route from '/profile' to '/load-cell-report'
    component: <LoadCellReport />, // CRUCIAL: Now renders your new component
  },
  // ----------------------------------------------------------------------

  // NOTE: Moving the original 'Profile' route here for completeness,
  // if you still want a Profile page accessible.
  // {
  //   type: "collapse",
  //   name: "User Profile",
  //   key: "profile",
  //   icon: <Icon fontSize="small">person</Icon>,
  //   route: "/profile",
  //   component: <Profile />,
  // },

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
    name: "Sign Up",
    key: "sign-up",
    icon: <Icon fontSize="small">assignment</Icon>,
    route: "/authentication/sign-up",
    component: <SignUp />,
  },
];

export default routes;
