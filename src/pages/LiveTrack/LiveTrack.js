// src/LiveTrack/LiveTrack.js
import React, { useEffect, useMemo, useRef, useState } from "react";
import PropTypes from "prop-types";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, Marker, Polyline, Popup, useMap } from "react-leaflet";

// MUI
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Button from "@mui/material/Button";
import Icon from "@mui/material/Icon";
import Divider from "@mui/material/Divider";
import Typography from "@mui/material/Typography";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import Tooltip from "@mui/material/Tooltip";
import Stack from "@mui/material/Stack";
import Chip from "@mui/material/Chip";
import Avatar from "@mui/material/Avatar";
import { useTheme } from "@mui/material/styles";

// Layout
import DashboardLayout from "../../../src/assets/components/examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "../../../src/assets/components/examples/Navbars/DashboardNavbar";

// MD Components
import MDBox from "../../assets/components/MDBox";

/* ============================
  MOCK DATA (ENHANCED)
  ============================ */
const MOCK_DEVICES = [
  {
    id: "D001",
    name: "Truck 1",
    tripId: "T12345",
    status: "Running",
    speed: 60,
    battery: 95,
    ignition: true,
    lastUpdate: "10:58:30 AM",
    driverName: "Rajesh Kumar",
    vehicleType: "Truck",
    route: [
      [18.5204, 73.8567],
      [18.525, 73.845],
      [18.535, 73.84],
      [18.545, 73.848],
      [18.552, 73.857],
    ],
  },
  {
    id: "D002",
    name: "Diesel Tanker MH.14",
    tripId: "T98765",
    status: "Running",
    speed: 40,
    battery: 80,
    ignition: true,
    lastUpdate: "11:02:15 AM",
    driverName: "Priya Sharma",
    vehicleType: "Tanker",
    route: [
      [18.5, 73.86],
      [18.505, 73.872],
      [18.515, 73.88],
      [18.53, 73.885],
    ],
  },
  {
    id: "D003",
    name: "Concrete Truck 4445",
    tripId: "T55555",
    status: "Stopped",
    speed: 0,
    battery: 60,
    ignition: false,
    lastUpdate: "09:45:00 AM",
    driverName: "Amit Singh",
    vehicleType: "Concrete Mixer",
    route: [
      [18.54, 73.86],
      [18.545, 73.862],
      [18.548, 73.859],
    ],
  },
  {
    id: "D004",
    name: "MG-Truck 4465",
    tripId: "T22222",
    status: "Idle",
    speed: 5,
    battery: 35,
    ignition: true,
    lastUpdate: "10:55:00 AM",
    driverName: "Vikram Bose",
    vehicleType: "Truck",
    route: [
      [18.56, 73.84],
      [18.555, 73.845],
      [18.548, 73.85],
      [18.542, 73.852],
    ],
  },
  {
    id: "D005",
    name: "Object 4465",
    tripId: "T11111",
    status: "Inactive",
    speed: 0,
    battery: 10,
    ignition: false,
    lastUpdate: "Yesterday",
    driverName: "N/A",
    vehicleType: "Object",
    route: [
      [18.51, 73.835],
      [18.512, 73.838],
      [18.515, 73.839],
    ],
  },
  // --- START: 20 NEW MOCK DEVICES (driverName and vehicleType added) ---
  {
    id: "D006",
    name: "Delivery Van A-7",
    tripId: "T60001",
    status: "Running",
    speed: 55,
    battery: 98,
    ignition: true,
    lastUpdate: "11:05:10 AM",
    driverName: "Suresh Patil",
    vehicleType: "Van",
    route: [
      [18.52, 73.87],
      [18.525, 73.875],
      [18.53, 73.88],
    ],
  },
  {
    id: "D007",
    name: "Excavator E-3",
    tripId: "T60002",
    status: "Stopped",
    speed: 0,
    battery: 75,
    ignition: false,
    lastUpdate: "08:30:00 AM",
    driverName: "Mohan Kale",
    vehicleType: "Excavator",
    route: [
      [18.55, 73.83],
      [18.551, 73.831],
    ],
  },
  {
    id: "D008",
    name: "Waste Compactor MH.12",
    tripId: "T60003",
    status: "Running",
    speed: 25,
    battery: 65,
    ignition: true,
    lastUpdate: "11:00:45 AM",
    driverName: "Pooja Deshmukh",
    vehicleType: "Compactor",
    route: [
      [18.51, 73.84],
      [18.512, 73.845],
      [18.514, 73.85],
    ],
  },
  {
    id: "D009",
    name: "Water Tanker W-9",
    tripId: "T60004",
    status: "Idle",
    speed: 8,
    battery: 45,
    ignition: true,
    lastUpdate: "10:45:20 AM",
    driverName: "Ganesh Iyer",
    vehicleType: "Tanker",
    route: [
      [18.53, 73.85],
      [18.532, 73.852],
    ],
  },
  {
    id: "D010",
    name: "Heavy Trailer H-1",
    tripId: "T60005",
    status: "Inactive",
    speed: 0,
    battery: 20,
    ignition: false,
    lastUpdate: "2 Days Ago",
    driverName: "N/A",
    vehicleType: "Trailer",
    route: [
      [18.5, 73.89],
      [18.501, 73.891],
    ],
  },
  {
    id: "D011",
    name: "Flatbed F-4",
    tripId: "T60006",
    status: "Running",
    speed: 70,
    battery: 90,
    ignition: true,
    lastUpdate: "11:04:05 AM",
    driverName: "Kishore Jadhav",
    vehicleType: "Truck",
    route: [
      [18.56, 73.86],
      [18.55, 73.87],
      [18.54, 73.88],
      [18.53, 73.89],
    ],
  },
  {
    id: "D012",
    name: "Logistics Van L-12",
    tripId: "T60007",
    status: "Idle",
    speed: 2,
    battery: 50,
    ignition: true,
    lastUpdate: "11:01:30 AM",
    driverName: "Rohit Kulkarni",
    vehicleType: "Van",
    route: [
      [18.51, 73.865],
      [18.511, 73.867],
    ],
  },
  {
    id: "D013",
    name: "Crane C-22",
    tripId: "T60008",
    status: "Stopped",
    speed: 0,
    battery: 88,
    ignition: false,
    lastUpdate: "10:15:00 AM",
    driverName: "Deepak Yadav",
    vehicleType: "Crane",
    route: [
      [18.545, 73.875],
      [18.546, 73.876],
    ],
  },
  {
    id: "D014",
    name: "Tractor T-100",
    tripId: "T60009",
    status: "Running",
    speed: 30,
    battery: 55,
    ignition: true,
    lastUpdate: "10:59:00 AM",
    driverName: "Anil More",
    vehicleType: "Tractor",
    route: [
      [18.52, 73.88],
      [18.525, 73.87],
      [18.53, 73.86],
    ],
  },
  {
    id: "D015",
    name: "Mini Truck M-5",
    tripId: "T60010",
    status: "Running",
    speed: 45,
    battery: 70,
    ignition: true,
    lastUpdate: "11:03:55 AM",
    driverName: "Sanjay Rane",
    vehicleType: "Truck",
    route: [
      [18.555, 73.84],
      [18.56, 73.845],
    ],
  },
  {
    id: "D016",
    name: "Service Vehicle S-8",
    tripId: "T60011",
    status: "Idle",
    speed: 10,
    battery: 30,
    ignition: true,
    lastUpdate: "10:30:10 AM",
    driverName: "Ajay Bhosale",
    vehicleType: "Van",
    route: [
      [18.538, 73.835],
      [18.54, 73.837],
    ],
  },
  {
    id: "D017",
    name: "Tipper T-33",
    tripId: "T60012",
    status: "Running",
    speed: 50,
    battery: 92,
    ignition: true,
    lastUpdate: "11:01:12 AM",
    driverName: "Eknath Shinde",
    vehicleType: "Tipper",
    route: [
      [18.51, 73.88],
      [18.515, 73.885],
      [18.52, 73.89],
    ],
  },
  {
    id: "D018",
    name: "Forklift F-99",
    tripId: "T60013",
    status: "Stopped",
    speed: 0,
    battery: 68,
    ignition: false,
    lastUpdate: "07:50:00 AM",
    driverName: "Javed Khan",
    vehicleType: "Forklift",
    route: [
      [18.505, 73.85],
      [18.506, 73.851],
    ],
  },
  {
    id: "D019",
    name: "Refrigerated Truck R-5",
    tripId: "T60014",
    status: "Running",
    speed: 62,
    battery: 85,
    ignition: true,
    lastUpdate: "11:04:40 AM",
    driverName: "Fatima Syed",
    vehicleType: "Truck",
    route: [
      [18.55, 73.88],
      [18.545, 73.875],
      [18.54, 73.87],
    ],
  },
  {
    id: "D020",
    name: "Bus B-42",
    tripId: "T60015",
    status: "Running",
    speed: 35,
    battery: 78,
    ignition: true,
    lastUpdate: "11:02:00 AM",
    driverName: "Ramesh Pawar",
    vehicleType: "Bus",
    route: [
      [18.5, 73.87],
      [18.505, 73.865],
      [18.51, 73.86],
    ],
  },
  {
    id: "D021",
    name: "Pickup P-11",
    tripId: "T60016",
    status: "Idle",
    speed: 3,
    battery: 40,
    ignition: true,
    lastUpdate: "10:50:00 AM",
    driverName: "Santosh Mhetre",
    vehicleType: "Pickup",
    route: [
      [18.56, 73.88],
      [18.562, 73.881],
    ],
  },
  {
    id: "D022",
    name: "Road Roller RR-1",
    tripId: "T60017",
    status: "Stopped",
    speed: 0,
    battery: 58,
    ignition: false,
    lastUpdate: "09:00:00 AM",
    driverName: "Baban Ghadge",
    vehicleType: "Roller",
    route: [
      [18.54, 73.89],
      [18.541, 73.891],
    ],
  },
  {
    id: "D023",
    name: "Ambulance AMB-1",
    tripId: "T60018",
    status: "Running",
    speed: 80,
    battery: 99,
    ignition: true,
    lastUpdate: "11:05:30 AM",
    driverName: "Dr. Kiran Rege",
    vehicleType: "Ambulance",
    route: [
      [18.51, 73.83],
      [18.52, 73.835],
      [18.53, 73.84],
    ],
  },
  {
    id: "D024",
    name: "School Bus SB-3",
    tripId: "T60019",
    status: "Idle",
    speed: 5,
    battery: 72,
    ignition: true,
    lastUpdate: "10:40:00 AM",
    driverName: "Sunita Reddy",
    vehicleType: "Bus",
    route: [
      [18.55, 73.865],
      [18.552, 73.867],
    ],
  },
  {
    id: "D025",
    name: "Utility Cart U-2",
    tripId: "T60020",
    status: "Inactive",
    speed: 0,
    battery: 15,
    ignition: false,
    lastUpdate: "3 Weeks Ago",
    driverName: "N/A",
    vehicleType: "Utility",
    route: [
      [18.5, 73.83],
      [18.501, 73.831],
    ],
  },
  // --- END: 20 NEW MOCK DEVICES ---
];

const MOCK_TRIP_BASE = {
  startTime: "2025-10-26 08:00 AM",
  endTime: "2025-10-26 11:30 AM",
  totalDistance: "N/A",
  vehicle: "Unknown",
  driverName: "Unknown",
  currentSpeed: "—",
  currentAddress: "—",
  currentLocation: "—",
  currentDirection: "—",
  signalLevel: "—",
};

/* ============================
  Leaflet Icon Fix
  ============================ */
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

/* ============================
  MapFixer
  ============================ */
function MapFixer() {
  const map = useMap();
  useEffect(() => {
    if (!map) return;
    const t = setTimeout(() => map.invalidateSize(), 120);
    const onResize = () => map.invalidateSize();
    window.addEventListener("resize", onResize);
    return () => {
      clearTimeout(t);
      window.removeEventListener("resize", onResize);
    };
  }, [map]);
  return null;
}

/* ============================
  Small helpers & components
  ============================ */
function InfoRow({ label, value, icon }) {
  return (
    <Box sx={{ display: "flex", justifyContent: "space-between", py: 0.6 }}>
      <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
        {icon && <Icon sx={{ fontSize: 18, color: "info.main" }}>{icon}</Icon>}
        <Typography variant="caption" color="text.secondary">
          {label}
        </Typography>
      </Box>
      <Typography variant="body2" sx={{ fontWeight: 700 }}>
        {value ?? "—"}
      </Typography>
    </Box>
  );
}
InfoRow.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.any,
  icon: PropTypes.string,
};
InfoRow.defaultProps = { value: null, icon: null };

/**
 * Returns a standard MUI color name (primary, error, warning, success, default)
 * This avoids non-standard theme colors that could cause the 'type' error.
 */
function getStatusColor(status) {
  const normalizedStatus = String(status || "").trim();

  switch (normalizedStatus) {
    case "Running":
      return "success";
    case "Stopped":
      return "error";
    case "Idle":
      return "warning";
    case "Inactive":
    // Use default color for any status that is not green, red, or amber
    default:
      return "default";
  }
}

/**
 * Returns custom styling for "Inactive" and "No Data" Chips.
 * This is used when the default color prop fails.
 */
function getCustomChipStyle(status) {
  const normalizedStatus = String(status || "").trim();

  if (normalizedStatus === "Inactive") {
    // Custom style for 'Inactive' (e.g., dark background)
    return {
      backgroundColor: "#344767", // Example Dark Grey color
      color: "#FFFFFF",
    };
  }

  if (normalizedStatus === "No Data" || normalizedStatus === "") {
    // Custom style for 'No Data' (e.g., light grey background)
    return {
      backgroundColor: "#bdbdbd", // MUI Grey 400
      color: "#FFFFFF",
    };
  }

  // Return an empty object if a standard color (success, error, warning) is used
  return {};
}

function getBatteryIcon(percentage) {
  if (percentage > 75) return "battery_full";
  if (percentage > 50) return "battery_70";
  if (percentage > 20) return "battery_40";
  return "battery_alert";
}

/**
 * Gets a placeholder image URL or icon for a vehicle type.
 * IMPORTANT: Added dummyImage property.
 */
function getVehicleIconOrImage(vehicleType) {
  const type = (vehicleType || "").toLowerCase();

  // Using the uploaded image as a dummy placeholder URL for a 'Truck' or similar heavy vehicle.
  const DUMMY_TRUCK_IMAGE =
    "http://googleusercontent.com/image_collection/image_retrieval/some_id_string";
  // Placeholder image for construction/yellow vehicles
  const DUMMY_CONSTRUCTION_IMAGE = "https://i.imgur.com/example/construction_v.png"; // Dummy URL
  // Placeholder image for buses/vans
  const DUMMY_VAN_IMAGE = "https://i.imgur.com/example/delivery_van.png"; // Dummy URL

  if (
    type.includes("truck") ||
    type.includes("trailer") ||
    type.includes("tipper") ||
    type.includes("flatbed")
  ) {
    return {
      icon: "local_shipping",
      color: "info",
      // *** IMPLEMENTATION: Use the actual image placeholder tag or a dummy URL ***
      dummyImage: DUMMY_TRUCK_IMAGE,
    };
  }
  if (type.includes("tanker")) {
    return { icon: "liquor", color: "warning" };
  }
  if (type.includes("bus")) {
    return { icon: "directions_bus", color: "primary", dummyImage: DUMMY_VAN_IMAGE };
  }
  if (type.includes("van") || type.includes("pickup") || type.includes("utility")) {
    return { icon: "airport_shuttle", color: "secondary", dummyImage: DUMMY_VAN_IMAGE };
  }
  if (
    type.includes("excavator") ||
    type.includes("roller") ||
    type.includes("compactor") ||
    type.includes("concrete")
  ) {
    return { icon: "construction", color: "error", dummyImage: DUMMY_CONSTRUCTION_IMAGE };
  }
  if (type.includes("crane") || type.includes("forklift")) {
    return { icon: "build_circle", color: "success" };
  }
  if (type.includes("ambulance")) {
    return { icon: "local_hospital", color: "error" };
  }
  return { icon: "crop_square", color: "default" }; // Default/Other
}

/* ============================
  VehicleHeaderBox (NEW COMPONENT)
  ============================ */
function VehicleHeaderBox({ device }) {
  if (!device) {
    return (
      <Card sx={{ p: 2, textAlign: "center", height: 100 }}>
        <Typography color="text.secondary">Select a device to view details</Typography>
      </Card>
    );
  }

  const { icon, color, dummyImage } = getVehicleIconOrImage(device.vehicleType);

  return (
    <Card sx={{ p: 2, display: "flex", alignItems: "center", gap: 2 }}>
      {/* Truck Image/Icon Placeholder - MODIFIED */}
      <Avatar
        sx={{
          width: 70,
          height: 70,
          bgcolor: dummyImage ? "transparent" : `${color}.main`, // Transparent background if image is used
          border: dummyImage ? `1px solid ${color}.main` : "none", // Optional border
          p: dummyImage ? 0.5 : 0, // Optional padding
          overflow: "hidden", // Ensure image stays inside
        }}
        src={dummyImage} // Set the dummy image URL
      >
        {/* If no dummyImage, show the Material Icon */}
        {!dummyImage && <Icon sx={{ fontSize: 40, color: "white" }}>{icon}</Icon>}
      </Avatar>

      {/* Details */}
      <Box flexGrow={1}>
        {/* Device Name (Title) */}
        <Typography variant="h6" fontWeight={700} noWrap>
          {device.name}
        </Typography>

        {/* Status Chip */}
        <Chip
          label={device.status}
          size="small"
          color={getStatusColor(device.status)}
          sx={{
            fontWeight: 600,
            mt: 0.5,
            ...getCustomChipStyle(device.status),
          }}
        />

        {/* Driver Name */}
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          <Icon sx={{ fontSize: 16, verticalAlign: "middle", mr: 0.5 }}>person</Icon>
          **Driver:** {device.driverName || "N/A"}
        </Typography>
      </Box>
    </Card>
  );
}
VehicleHeaderBox.propTypes = {
  device: PropTypes.object,
};
VehicleHeaderBox.defaultProps = { device: null };

/* ============================
  StatusBox 
  ============================ */
function StatusBox({ status, count, isSelected, onClick }) {
  const colorMap = {
    Running: "success",
    Stopped: "error",
    Idle: "warning",
    Inactive: "default",
    "No Data": "default",
    Total: "primary",
  };
  const color = colorMap[status] || "default";

  // Use a custom color for the count text for Inactive/No Data to mimic the chip color
  const countColor = status === "Inactive" ? "#344767" : status === "No Data" ? "#bdbdbd" : color;

  return (
    <Card
      onClick={() => onClick(status)}
      sx={{
        p: 1.5,
        minWidth: 100,
        flexShrink: 0,
        flexGrow: 1,
        textAlign: "center",
        cursor: "pointer",
        transition: "all 0.2s",
        border: `2px solid ${isSelected ? "rgb(25, 118, 210)" : "transparent"}`,
        boxShadow: isSelected
          ? "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)"
          : "none",
        "&:hover": {
          backgroundColor: "#f5f5f5",
        },
      }}
    >
      <Typography variant="caption" color="text.secondary" fontWeight={600} display="block">
        {status}
      </Typography>
      <Typography variant="h5" color={color} fontWeight={700}>
        {count}
      </Typography>
    </Card>
  );
}
StatusBox.propTypes = {
  status: PropTypes.string.isRequired,
  count: PropTypes.number.isRequired,
  isSelected: PropTypes.bool.isRequired,
  onClick: PropTypes.func.isRequired,
};

/* ============================
  DeviceTable 
  ============================ */
function DeviceTable({ devices, selectedId, onSelect }) {
  return (
    <Card sx={{ p: 0, overflow: "hidden", height: "calc(100vh - 250px) !important" }}>
      <MDBox p={2} bgColor="dark" borderRadius="0px" coloredShadow="dark">
        <Typography variant="h6" color="white" fontWeight={600}>
          Live Device List ({devices.length})
        </Typography>
      </MDBox>

      <TableContainer
        component={Paper}
        sx={{
          // Adjusted height due to new boxes
          maxHeight: "calc(100vh - 330px) !important",
          overflow: "auto !important",
          borderRadius: 0,
        }}
      >
        <Table
          stickyHeader
          size="small"
          sx={{
            tableLayout: "fixed !important",
            borderCollapse: "collapse !important",
            "& thead th": {
              background: "#fafafa !important",
              fontWeight: 700,
              py: "12px !important",
              borderBottom: "1px solid rgba(0,0,0,0.08) !important",
            },
          }}
        >
          <TableHead>
            <TableRow>
              <TableCell
                align="left"
                sx={{
                  width: "45% !important",
                  fontWeight: 700,
                  px: 2,
                  color: "text.primary",
                }}
              >
                Vehicle
              </TableCell>
              <TableCell
                align="center"
                sx={{
                  width: "25% !important",
                  fontWeight: 700,
                  color: "text.primary",
                }}
              >
                Status
              </TableCell>
              <TableCell
                align="center"
                sx={{
                  width: "15% !important",
                  fontWeight: 700,
                  color: "text.primary",
                }}
              >
                Speed
              </TableCell>
              <TableCell
                align="center"
                sx={{
                  width: "15% !important",
                  fontWeight: 700,
                  color: "text.primary",
                  pr: 2,
                }}
              >
                Info
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {devices.map((d) => (
              <TableRow
                key={d.id}
                hover
                selected={selectedId === d.id}
                onClick={() => onSelect(d)}
                sx={{
                  cursor: "pointer",
                  "&.Mui-selected": { backgroundColor: "rgba(25,118,210,0.06) !important" },
                }}
              >
                <TableCell
                  sx={{
                    width: "45% !important",
                    textAlign: "left !important",
                    verticalAlign: "middle !important",
                    overflow: "hidden",
                    px: 2,
                    py: 1,
                  }}
                >
                  <Typography variant="body2" fontWeight={600} noWrap>
                    {d.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" noWrap>
                    {d.id} • {d.tripId}
                  </Typography>
                </TableCell>

                <TableCell
                  sx={{
                    width: "25% !important",
                    textAlign: "center !important",
                    verticalAlign: "middle !important",
                    whiteSpace: "normal",
                  }}
                >
                  <Chip
                    label={d.status}
                    size="small"
                    // Use a standard, safe color prop
                    color={getStatusColor(d.status)}
                    sx={{
                      fontWeight: 600,
                      mb: 0.5,
                      display: "inline-block",
                      maxWidth: "100%",
                      // Apply custom styles for non-standard colors
                      ...getCustomChipStyle(d.status),
                    }}
                  />
                  <Tooltip title={`Last Update: ${d.lastUpdate}`} placement="right">
                    <Typography
                      variant="caption"
                      display="block"
                      color="text.secondary"
                      sx={{ mt: 0.5 }}
                    >
                      {d.lastUpdate}
                    </Typography>
                  </Tooltip>
                </TableCell>

                <TableCell
                  sx={{
                    width: "15% !important",
                    textAlign: "center !important",
                    verticalAlign: "middle !important",
                    py: 1,
                  }}
                >
                  <Typography variant="body1" fontWeight={700}>
                    {d.speed}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    km/h
                  </Typography>
                </TableCell>

                <TableCell
                  sx={{
                    width: "15% !important",
                    textAlign: "center !important",
                    verticalAlign: "middle !important",
                    py: 1,
                    pr: 2,
                  }}
                >
                  <Stack direction="row" spacing={2} justifyContent="center" alignItems="center">
                    <Tooltip title={`Ignition: ${d.ignition ? "ON" : "OFF"}`}>
                      <Icon
                        color={d.ignition ? "success" : "error"}
                        sx={{ fontSize: "1.2rem !important" }}
                      >
                        {d.ignition ? "power_settings_new" : "vpn_key_off"}
                      </Icon>
                    </Tooltip>

                    <Tooltip title={`Battery: ${d.battery}%`}>
                      <Icon
                        color={d.battery < 20 ? "error" : "success"}
                        sx={{ fontSize: "1.4rem !important" }}
                      >
                        {getBatteryIcon(d.battery)}
                      </Icon>
                    </Tooltip>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Card>
  );
}
DeviceTable.propTypes = {
  devices: PropTypes.array.isRequired,
  selectedId: PropTypes.string,
  onSelect: PropTypes.func.isRequired,
};
DeviceTable.defaultProps = { selectedId: null };

/* ============================
  MAIN COMPONENT
  ============================ */
export default function LiveTrack() {
  // left panel fixed width (desktop) - responsive for small screens
  const LEFT_PANEL_WIDTH = 520;

  const [selectedDevice, setSelectedDevice] = useState(MOCK_DEVICES[0] ?? null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [markerPos, setMarkerPos] = useState(null);
  const intervalRef = useRef(null);

  // State for filtering
  const [filterStatus, setFilterStatus] = useState("Total");

  const { filteredDevices, counts } = useMemo(() => {
    const statusMap = {
      Running: 0,
      Stopped: 0,
      Idle: 0,
      Inactive: 0,
      "No Data": 0,
    };
    let total = 0;

    MOCK_DEVICES.forEach((d) => {
      total++;

      // Use the logic from getStatusColor to categorize
      const statusKey =
        d.status && ["Running", "Stopped", "Idle", "Inactive"].includes(d.status)
          ? d.status
          : "No Data";

      statusMap[statusKey]++;
    });

    const counts = { ...statusMap, Total: total };

    const devicesToRender = MOCK_DEVICES.filter((d) => {
      if (filterStatus === "Total") return true;

      const isNoData = !["Running", "Stopped", "Idle", "Inactive"].includes(d.status);

      if (filterStatus === "No Data") return isNoData;

      return d.status === filterStatus;
    });

    return { filteredDevices: devicesToRender, counts };
  }, [filterStatus]);

  const selectedTrip = useMemo(() => {
    if (!selectedDevice) return null;
    const base = { ...MOCK_TRIP_BASE };
    return {
      ...base,
      id: selectedDevice.tripId,
      vehicle: selectedDevice.name,
      driverName: selectedDevice.driverName,
      currentSpeed: `${selectedDevice.speed} km/h`,
      signalLevel: selectedDevice.battery > 50 ? "High" : "Low",
      currentLocation: selectedDevice.route?.length
        ? selectedDevice.route[selectedDevice.route.length - 1].join(",")
        : base.currentLocation,
      currentAddress: "Mock Address (Pune, India)",
      route: selectedDevice.route,
    };
  }, [selectedDevice]);

  const mapCenter = useMemo(() => {
    const r = selectedTrip?.route;
    if (r?.length) return r[0];
    return [18.5204, 73.8567];
  }, [selectedTrip]);

  const startPlayback = (speedMultiplier = 1) => {
    if (!selectedTrip?.route?.length) return;

    setIsPlaying(true);
    setCurrentStep(0);
    setMarkerPos(selectedTrip.route[0]);

    if (intervalRef.current) clearInterval(intervalRef.current);

    const intervalTime = Math.max(100, 500 / speedMultiplier);

    intervalRef.current = setInterval(() => {
      setCurrentStep((prev) => {
        const next = prev + 1;
        if (next >= selectedTrip.route.length) {
          clearInterval(intervalRef.current);
          setIsPlaying(false);
          return prev;
        }
        setMarkerPos(selectedTrip.route[next]);
        return next;
      });
    }, intervalTime);
  };

  const pausePlayback = () => {
    setIsPlaying(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const stopPlayback = () => {
    isPlaying && pausePlayback();
    setCurrentStep(0);
    setMarkerPos(selectedTrip?.route?.[0] ?? null);
  };

  useEffect(() => {
    // Stop/Reset playback when a new device is selected
    pausePlayback();
    setCurrentStep(0);
    setMarkerPos(selectedTrip?.route?.[0] ?? null);
  }, [selectedDevice]);

  // If the currently selected device is filtered out, clear selection
  useEffect(() => {
    if (selectedDevice && !filteredDevices.some((d) => d.id === selectedDevice.id)) {
      setSelectedDevice(filteredDevices[0] || null);
    }
    // Also, if the filter changes to something empty, clear the device selection
    if (filteredDevices.length === 0) {
      setSelectedDevice(null);
    }
  }, [filterStatus, filteredDevices, selectedDevice]);

  return (
    <DashboardLayout>
      <DashboardNavbar />

      {/* Main area: left fixed panel + right map (flex layout). */}
      <Box
        sx={{
          display: "flex",
          gap: 2,
          px: { xs: 1, sm: 2, md: 3 },
          pb: 2,
          pt: 2,
          height: "calc(100vh - 120px)",
          alignItems: "stretch",
        }}
      >
        {/* LEFT: device list panel */}
        <Box
          sx={{
            width: { xs: "100%", sm: `${LEFT_PANEL_WIDTH}px` },
            flexShrink: 0,
            display: { xs: "block", sm: "block" },
            zIndex: 1500,
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          {/* Status Filter Boxes */}
          <Stack direction="row" spacing={1} sx={{ width: "100%", overflowX: "auto", pb: 0.5 }}>
            {["Total", "Running", "Stopped", "Idle", "Inactive", "No Data"].map((status) => (
              <StatusBox
                key={status}
                status={status}
                count={counts[status] || 0} // Safely use count
                isSelected={filterStatus === status}
                onClick={(s) => setFilterStatus(s)}
              />
            ))}
          </Stack>

          {/* Device Table */}
          <DeviceTable
            devices={filteredDevices}
            selectedId={selectedDevice?.id}
            onSelect={setSelectedDevice}
          />
        </Box>

        {/* RIGHT: map area (flex-grow) */}
        <Box
          sx={{
            position: "relative",
            flexGrow: 1,
            height: "100%",
            borderRadius: 1,
            overflow: "hidden",
            boxShadow: "0 6px 18px rgba(15,15,15,0.08) !important",
          }}
        >
          {/* Leaflet MapContainer */}
          <MapContainer
            center={mapCenter}
            zoom={13}
            scrollWheelZoom={true}
            style={{ height: "100%", width: "100%", zIndex: 1000 }}
          >
            <MapFixer />
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* Render all device markers (static position: last known location) */}
            {filteredDevices.map((d) => {
              const [lat, lng] = d.route[d.route.length - 1];
              const { color } = getVehicleIconOrImage(d.vehicleType);

              // Custom Leaflet icon for better visibility and color-coding
              const customIcon = L.divIcon({
                className: "custom-div-icon",
                html: `<div style="background-color:${
                  d.status === "Running" ? "green" : d.status === "Stopped" ? "red" : "orange"
                }; width:10px; height:10px; border-radius:50%; border:2px solid white; box-shadow: 0 0 5px rgba(0,0,0,0.5);"></div>`,
                iconSize: [20, 20],
                iconAnchor: [10, 10],
              });

              return (
                <Marker key={d.id} position={[lat, lng]} icon={customIcon}>
                  <Popup>
                    <Typography variant="body2" fontWeight={700}>
                      {d.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Status: {d.status}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Speed: {d.speed} km/h
                    </Typography>
                  </Popup>
                </Marker>
              );
            })}

            {/* Render the selected trip's historical route */}
            {selectedTrip?.route?.length > 0 && (
              <Polyline positions={selectedTrip.route} color="blue" weight={5} opacity={0.7} />
            )}

            {/* Render the playback marker for the selected device */}
            {selectedTrip && markerPos && (
              <Marker
                position={markerPos}
                icon={L.divIcon({
                  className: "playback-marker",
                  html: `<div style="background-color:purple; width:14px; height:14px; border-radius:50%; border:3px solid white; box-shadow: 0 0 8px rgba(128,0,128,1);"></div>`,
                  iconSize: [20, 20],
                  iconAnchor: [10, 10],
                })}
              >
                <Popup>
                  <Typography variant="body2" fontWeight={700}>
                    Playback Position
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Step: {currentStep + 1} / {selectedTrip.route.length}
                  </Typography>
                </Popup>
              </Marker>
            )}
          </MapContainer>

          {/* Overlay cards at top-right inside this box */}
          <Box
            sx={{
              position: "absolute",
              top: 12,
              right: 12,
              display: "flex",
              flexDirection: "column",
              gap: 1,
              width: { xs: "95%", sm: 320 },
              zIndex: 1600,
              // small blur + glass effect
              backdropFilter: "saturate(140%) blur(6px)",
            }}
          >
            {/* NEW: Vehicle Header Box */}
            <VehicleHeaderBox device={selectedDevice} />

            {/* Existing: Trip Summary Card */}
            <Card sx={{ p: 2, mb: 0.5 }}>
              <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>
                Trip Summary
              </Typography>
              <Divider sx={{ mb: 1 }} />
              <InfoRow label="Trip ID" value={selectedTrip?.id} icon="badge" />
              <InfoRow label="Vehicle" value={selectedTrip?.vehicle} icon="local_shipping" />
              <InfoRow label="Driver" value={selectedTrip?.driverName} icon="person" />
              <InfoRow label="Distance" value={selectedTrip?.totalDistance} icon="map" />
            </Card>

            {/* Existing: Live Metrics Card */}
            <Card sx={{ p: 2 }}>
              <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>
                Live Metrics
              </Typography>
              <Divider sx={{ mb: 1 }} />
              <InfoRow label="Current Speed" value={selectedTrip?.currentSpeed} icon="speed" />
              <InfoRow label="Signal" value={selectedTrip?.signalLevel} icon="network_cell" />
              <InfoRow label="Direction" value={selectedTrip?.currentDirection} icon="explore" />
              <Box sx={{ mt: 1 }}>
                <Stack direction="row" spacing={1} justifyContent="center" sx={{ mt: 2 }}>
                  <Button
                    variant="contained"
                    color={isPlaying ? "error" : "primary"}
                    startIcon={<Icon>{isPlaying ? "pause" : "play_arrow"}</Icon>}
                    onClick={isPlaying ? pausePlayback : startPlayback}
                    disabled={!selectedTrip?.route?.length}
                  >
                    {isPlaying ? "Pause" : "Play"}
                  </Button>
                  <Button
                    variant="outlined"
                    color="secondary"
                    startIcon={<Icon>stop</Icon>}
                    onClick={stopPlayback}
                    disabled={!selectedTrip?.route?.length || (!isPlaying && currentStep === 0)}
                  >
                    Stop
                  </Button>
                </Stack>
              </Box>
            </Card>
          </Box>
        </Box>
      </Box>
    </DashboardLayout>
  );
}
