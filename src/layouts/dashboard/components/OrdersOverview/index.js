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

// Mock Data for Top Performers (Devices that traveled the most)
const topDevicesData = [
  {
    rank: 1,
    imei: "871234567890123",
    distance: "12,500 km",
    color: "success",
    icon: "military_tech",
    label: "Top Performer - Longest Distance",
  },
  {
    rank: 2,
    imei: "871234567890245",
    distance: "11,900 km",
    color: "info",
    icon: "trending_up",
    label: "High Mileage",
  },
  {
    rank: 3,
    imei: "871234567890356",
    distance: "10,210 km",
    color: "primary",
    icon: "trending_up",
    label: "Consistent Runner",
  },
  {
    rank: 4,
    imei: "871234567890478",
    distance: "9,850 km",
    color: "dark",
    icon: "directions_car",
    label: "Above Average",
  },
  {
    rank: 5,
    imei: "871234567890590",
    distance: "8,100 km",
    color: "text",
    icon: "directions_car",
    label: "Average Range",
  },
];

function OrdersOverview() {
  return (
    <Card sx={{ height: "100%" }}>
      <MDBox pt={3} px={3}>
        <MDTypography variant="h6" fontWeight="medium">
          Top Distance Performers {/* Changed heading to Top Distance Performers */}
        </MDTypography>
        <MDBox mt={0} mb={2}>
          <MDTypography variant="button" color="text" fontWeight="regular">
            <MDTypography display="inline" variant="body2" verticalAlign="middle">
              {/* Changed icon to represent travel/shipping */}
              <Icon sx={{ color: ({ palette: { info } }) => info.main }}>local_shipping</Icon>{" "}
            </MDTypography>
            &nbsp;
            <MDTypography variant="button" color="text" fontWeight="medium">
              Daily
            </MDTypography>{" "}
            distance leaderboard {/* Changed text to reflect distance leaderboard */}
          </MDTypography>
        </MDBox>
      </MDBox>
      <MDBox p={2}>
        {/* Mapping the Top Devices Data */}
        {topDevicesData.map((device, index) => (
          <TimelineItem
            key={device.imei}
            color={device.color}
            icon={device.icon}
            // Title shows the rank, brief IMEI, and total distance
            title={`#${device.rank}: Device *${device.imei.slice(-4)}* - ${device.distance}`}
            // dateTime shows the performance label
            dateTime={device.label}
            lastItem={index === topDevicesData.length - 1}
          />
        ))}

        {/* Removed the original Alert TimelineItems */}
      </MDBox>
    </Card>
  );
}

export default OrdersOverview;
