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

// @mui material components
import Card from "@mui/material/Card";
import Icon from "@mui/material/Icon";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

// Material Dashboard 2 React example components
import TimelineItem from "examples/Timeline/TimelineItem";

function OrdersOverview() {
  return (
    <Card sx={{ height: "100%" }}>
      <MDBox pt={3} px={3}>
        <MDTypography variant="h6" fontWeight="medium">
          Alerts {/* Changed heading to "Alerts" */}
        </MDTypography>
        <MDBox mt={0} mb={2}>
          <MDTypography variant="button" color="text" fontWeight="regular">
            <MDTypography display="inline" variant="body2" verticalAlign="middle">
              <Icon sx={{ color: ({ palette: { success } }) => success.main }}>check_circle</Icon>{" "}
              {/* Changed icon to check_circle for alerts */}
            </MDTypography>
            &nbsp;
            <MDTypography variant="button" color="text" fontWeight="medium">
              3 new
            </MDTypography>{" "}
            alerts today {/* Changed text to reflect alerts */}
          </MDTypography>
        </MDBox>
      </MDBox>
      <MDBox p={2}>
        <TimelineItem
          color="error" // Critical alert
          icon="warning"
          title="Critical: Device 913280183713 Offline"
          dateTime="23 JAN 10:15 AM"
        />
        <TimelineItem
          color="warning" // Warning alert
          icon="notifications"
          title="Warning: Account ACC-001035 nearing data limit"
          dateTime="23 JAN 9:30 AM"
        />
        <TimelineItem
          color="success" // Info/Success alert
          icon="check_circle"
          title="Route update successful for ACC-001034"
          dateTime="23 JAN 8:45 AM"
        />
        <TimelineItem
          color="info" // Informational alert
          icon="info"
          title="New device 771123456789 connected via API"
          dateTime="22 JAN 6:00 PM"
        />
        <TimelineItem
          color="primary" // General alert
          icon="power_settings_new"
          title="Device 664590123456 restarted"
          dateTime="22 JAN 1:30 PM"
          lastItem
        />
      </MDBox>
    </Card>
  );
}

export default OrdersOverview;
