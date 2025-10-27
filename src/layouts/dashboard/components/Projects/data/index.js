/* eslint-disable react/prop-types */
/* eslint-disable react/function-component-definition */
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
import Tooltip from "@mui/material/Tooltip";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDAvatar from "components/MDAvatar";
import MDProgress from "components/MDProgress";

// Helper component for simple text output
const DataCell = ({ text, color = "text", fontWeight = "medium" }) => (
  <MDTypography variant="caption" color={color} fontWeight={fontWeight}>
    {text}
  </MDTypography>
);

// Helper component for GPS Status
const Status = ({ status }) => {
  let color;
  if (status === "Online") {
    color = "success";
  } else if (status === "Offline") {
    color = "error";
  } else {
    color = "warning"; // Other states like Moving/Idle
  }

  return (
    <MDBox lineHeight={1}>
      <MDTypography variant="caption" color={color} fontWeight="bold">
        {status}
      </MDTypography>
    </MDBox>
  );
};

// Helper component for Ignition Status
const Ignition = ({ status }) => {
  let color = status === "On" ? "success" : "error";
  return (
    <MDTypography variant="caption" color={color} fontWeight="bold">
      {status}
    </MDTypography>
  );
};

export default function data() {
  return {
    // 1. Updated Columns to 10 distinct fields
    columns: [
      { Header: "No", accessor: "no", width: "5%", align: "left" },
      { Header: "VEHICLE NO.", accessor: "vehicleNo", width: "10%", align: "left" },
      { Header: "VEHICLE NAME", accessor: "vehicleName", width: "12%", align: "left" },
      { Header: "GPS STATUS", accessor: "gpsStatus", width: "8%", align: "center" },
      { Header: "IGNITION", accessor: "ignitionStatus", width: "8%", align: "center" }, // NEW FIELD
      { Header: "IMEI", accessor: "imei", width: "12%", align: "center" },
      { Header: "LAST DATA TIME", accessor: "lastDataTime", width: "12%", align: "center" }, // NEW FIELD
      { Header: "ADDRESS", accessor: "address", width: "20%", align: "left" },
      { Header: "AVG. SPEED", accessor: "avgSpeed", width: "7%", align: "center" },
      { Header: "CURRENT SPEED", accessor: "currentSpeed", width: "8%", align: "center" },
    ],

    // 2. Updated Rows with 10 rows and 10 fields
    rows: [
      {
        no: <DataCell text="1" />,
        vehicleNo: <DataCell text="HR55K1234" fontWeight="bold" />,
        vehicleName: <DataCell text="Truck Alpha" />,
        gpsStatus: <Status status="Online" />,
        ignitionStatus: <Ignition status="On" />,
        imei: <DataCell text="913280183713" />,
        lastDataTime: <DataCell text="2025-10-27 10:01:00" />,
        address: <DataCell text="123 Main St, New Delhi, India" />,
        avgSpeed: <DataCell text="45 km/h" />,
        currentSpeed: <DataCell text="62 km/h" color="success" fontWeight="bold" />,
      },
      {
        no: <DataCell text="2" />,
        vehicleNo: <DataCell text="DL05F5678" fontWeight="bold" />,
        vehicleName: <DataCell text="Van Beta" />,
        gpsStatus: <Status status="Offline" />,
        ignitionStatus: <Ignition status="Off" />,
        imei: <DataCell text="883018277209" />,
        lastDataTime: <DataCell text="2025-10-27 09:30:00" />,
        address: <DataCell text="Near Gateway, Mumbai, India" />,
        avgSpeed: <DataCell text="10 km/h" />,
        currentSpeed: <DataCell text="0 km/h" color="error" fontWeight="bold" />,
      },
      {
        no: <DataCell text="3" />,
        vehicleNo: <DataCell text="UP16T9012" fontWeight="bold" />,
        vehicleName: <DataCell text="Bus Gamma" />,
        gpsStatus: <Status status="Moving" />,
        ignitionStatus: <Ignition status="On" />,
        imei: <DataCell text="771123456789" />,
        lastDataTime: <DataCell text="2025-10-27 10:03:00" />,
        address: <DataCell text="Hollywood Blvd, Los Angeles, USA" />,
        avgSpeed: <DataCell text="70 km/h" />,
        currentSpeed: <DataCell text="95 km/h" color="info" fontWeight="bold" />,
      },
      {
        no: <DataCell text="4" />,
        vehicleNo: <DataCell text="RJ14A3321" fontWeight="bold" />,
        vehicleName: <DataCell text="Sedan Delta" />,
        gpsStatus: <Status status="Online" />,
        ignitionStatus: <Ignition status="On" />,
        imei: <DataCell text="664590123456" />,
        lastDataTime: <DataCell text="2025-10-27 10:00:00" />,
        address: <DataCell text="Jaipur Highway, Rajasthan" />,
        avgSpeed: <DataCell text="55 km/h" />,
        currentSpeed: <DataCell text="80 km/h" color="info" fontWeight="bold" />,
      },
      {
        no: <DataCell text="5" />,
        vehicleNo: <DataCell text="KA01Z0099" fontWeight="bold" />,
        vehicleName: <DataCell text="Bike Epsilon" />,
        gpsStatus: <Status status="Idle" />,
        ignitionStatus: <Ignition status="On" />,
        imei: <DataCell text="550019283746" />,
        lastDataTime: <DataCell text="2025-10-27 09:55:00" />,
        address: <DataCell text="Tech Park, Bangalore, India" />,
        avgSpeed: <DataCell text="20 km/h" />,
        currentSpeed: <DataCell text="5 km/h" color="warning" fontWeight="bold" />,
      },
      {
        no: <DataCell text="6" />,
        vehicleNo: <DataCell text="TS09B7777" fontWeight="bold" />,
        vehicleName: <DataCell text="Trailer Zeta" />,
        gpsStatus: <Status status="Offline" />,
        ignitionStatus: <Ignition status="Off" />,
        imei: <DataCell text="447890123456" />,
        lastDataTime: <DataCell text="2025-10-26 18:00:00" />,
        address: <DataCell text="Industrial Area, Hyderabad" />,
        avgSpeed: <DataCell text="30 km/h" />,
        currentSpeed: <DataCell text="0 km/h" color="error" fontWeight="bold" />,
      },
      {
        no: <DataCell text="7" />,
        vehicleNo: <DataCell text="PB11G5432" fontWeight="bold" />,
        vehicleName: <DataCell text="Lorry Eta" />,
        gpsStatus: <Status status="Moving" />,
        ignitionStatus: <Ignition status="On" />,
        imei: <DataCell text="331234509876" />,
        lastDataTime: <DataCell text="2025-10-27 10:02:00" />,
        address: <DataCell text="National Highway 44, Punjab" />,
        avgSpeed: <DataCell text="65 km/h" />,
        currentSpeed: <DataCell text="75 km/h" color="info" fontWeight="bold" />,
      },
      {
        no: <DataCell text="8" />,
        vehicleNo: <DataCell text="MH12D0011" fontWeight="bold" />,
        vehicleName: <DataCell text="Car Theta" />,
        gpsStatus: <Status status="Online" />,
        ignitionStatus: <Ignition status="Off" />,
        imei: <DataCell text="229876543210" />,
        lastDataTime: <DataCell text="2025-10-27 09:45:00" />,
        address: <DataCell text="Pune City Center, Maharashtra" />,
        avgSpeed: <DataCell text="15 km/h" />,
        currentSpeed: <DataCell text="0 km/h" color="success" fontWeight="bold" />,
      },
      {
        no: <DataCell text="9" />,
        vehicleNo: <DataCell text="TN39P6006" fontWeight="bold" />,
        vehicleName: <DataCell text="Scooter Iota" />,
        gpsStatus: <Status status="Moving" />,
        ignitionStatus: <Ignition status="On" />,
        imei: <DataCell text="110055447788" />,
        lastDataTime: <DataCell text="2025-10-27 10:04:00" />,
        address: <DataCell text="Chennai Beach Road, Tamil Nadu" />,
        avgSpeed: <DataCell text="40 km/h" />,
        currentSpeed: <DataCell text="55 km/h" color="success" fontWeight="bold" />,
      },
      {
        no: <DataCell text="10" />,
        vehicleNo: <DataCell text="GJ06L1010" fontWeight="bold" />,
        vehicleName: <DataCell text="Tanker Kappa" />,
        gpsStatus: <Status status="Online" />,
        ignitionStatus: <Ignition status="Off" />,
        imei: <DataCell text="006789123456" />,
        lastDataTime: <DataCell text="2025-10-27 08:30:00" />,
        address: <DataCell text="Port Area, Gujarat" />,
        avgSpeed: <DataCell text="5 km/h" />,
        currentSpeed: <DataCell text="0 km/h" color="success" fontWeight="bold" />,
      },
    ],
  };
}
