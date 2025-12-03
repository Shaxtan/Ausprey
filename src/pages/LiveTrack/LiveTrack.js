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
import truckImage from '../../assets/images/truckImage.jpg'; // Example path
// Layout
import DashboardLayout from "../../../src/assets/components/examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "../../../src/assets/components/examples/Navbars/DashboardNavbar";

// MD Components
import MDBox from "../../assets/components/MDBox";
import ApiService from "../../services/ApiService";
/* ============================
  MOCK DATA (ENHANCED)
  ============================ */

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

{/* // 1. (Make sure you have imported the image: import truckImage from 'path/to/your/truck.png';) */}

<Avatar
  sx={{
    width: 170,
    height: 70,
    // Key change: Set borderRadius to 0 to make it a rectangle
    borderRadius: 0, 
    // Set background to transparent since we are using an image
    bgcolor: 'transparent',
    // Optional: add a border for a defined frame
    // border: '1px solid #ccc', 
    p: 0, // Remove padding unless you want space inside the box
    overflow: "hidden", // Ensure image stays inside the boundaries
    
    // Optional: Add objectFit to ensure the image fills the rectangle nicely.
    // Use 'cover' to crop and cover, or 'contain' to fit without cropping.
    '& img': { 
        objectFit: 'cover', 
    },
  }}
  // Set the imported truck image as the source
  src={truckImage} 
>
  {/* The child Icon logic is now unnecessary if you only want the image, 
      but it can be kept as a fallback if the image fails to load. */}
  {/* {!truckImage && <Icon sx={{ fontSize: 40, color: "white" }}>{icon}</Icon>} */}
</Avatar>

      {/* Details */}
      <Box flexGrow={1}>
        {/* Device Name (Title) */}
        <Typography variant="h6" fontWeight={700} noWrap>
          {device.name}
        </Typography>

        {/* Status Chip */}
        {/* <Chip
          label={device.status}
          size="small"
          color={getStatusColor(device.status)}
          sx={{
            fontWeight: 600,
            mt: 0.5,
            ...getCustomChipStyle(device.status),
          }}
        /> */}

        {/* Driver Name */}
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          {/* <Icon sx={{ fontSize: 16, verticalAlign: "middle", mr: 0.5 }}>person</Icon> */}
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
  FlyToMarker Component
  ============================ */
function FlyToMarker({ position }) {
  const map = useMap();

  useEffect(() => {
    if (position && position[0] && position[1]) {
      map.flyTo(position, 16, {
        duration: 1.8,
        easeLinearity: 0.25,
      });
    }
  }, [position, map]);

  return null;
}
// props for flymarker
FlyToMarker.propTypes = {
  position: PropTypes.arrayOf(PropTypes.number).isRequired,
};

/* ============================
  MAIN COMPONENT
  ============================ */
export default function LiveTrack() {
  // left panel fixed width (desktop) - responsive for small screens
  const LEFT_PANEL_WIDTH = 350;
const [isLeftPanelOpen, setIsLeftPanelOpen] = useState(true);
  const theme = useTheme();

  const toggleLeftPanel = () => {
    setIsLeftPanelOpen(!isLeftPanelOpen);
  };
  // NEW MASTER STATE: Holds ALL devices fetched from getDashboardData
  const [allDevices, setAllDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [markerPos, setMarkerPos] = useState(null);
  const intervalRef = useRef(null);
  // Add a state to hold the live metrics, decoupled from selectedDevice
  const [liveMetrics, setLiveMetrics] = useState({});

  // State for filtering
  const [filterStatus, setFilterStatus] = useState("Total");

  // --- INITIAL DATA FETCH: Get all devices once ---
  useEffect(() => {
    // 1. Initial fetch of ALL devices from the dashboard API
    ApiService.getAllDevices()
      .then((devices) => {
        setAllDevices(devices);

        // Auto-select the first device found
        if (devices.length > 0) {
          setSelectedDevice(devices[0]);
        }
      })
      .catch(console.error); // Error handled by ApiService.callAlert
  }, []); // Runs only once on mount

  // --- LIVE DATA POLLING: Polls ONLY for the selected device ---
  // --- LIVE DATA POLLING: Polls ONLY for the selected device ---
  useEffect(() => {
    if (!selectedDevice || !selectedDevice.accountId || !selectedDevice.id) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }

    const imei = selectedDevice.id;
    const accountId = selectedDevice.accountId || 1;

    const fetchLiveUpdate = async () => {
      try {
        const response = await ApiService.testData(accountId, imei);
        const rawData = response?.data?.data;

        if (response?.data?.resultCode === 1 && rawData) {
          const speedNum = Number(rawData.speed) || 0;
          const ign = (rawData.ign || "").toUpperCase();

          let status;
          if (ign === "Y") {
            status = speedNum > 5 ? "Running" : "Idle";
          } else {
            status = speedNum === 0 ? "Stopped" : "Inactive";
          }

          const newLocation = [rawData.lat, rawData.lng];

          // --- UPDATE LOGIC (MODIFIED): Update the Master List & Live Metrics ---
          setAllDevices((prevDevices) => {
            const updatedDevices = prevDevices.map((d) => {
              if (d.id === imei) {
                const accumulatedRoute = [...(d.route || []), newLocation].slice(-100);

                const updatedDevice = {
                  ...d,
                  status,
                  speed: speedNum,
                  ignition: ign === "Y",
                  battery: rawData.anl ? Math.round((Number(rawData.anl) / 4.2) * 100) : 50,
                  lastUpdate: new Date().toLocaleTimeString(),
                  location: `${rawData.lat},${rawData.lng}`,
                  route: accumulatedRoute,
                };

                // --- NEW: Update separate liveMetrics state ---
                // This object only contains the latest live data
                setLiveMetrics(updatedDevice);

                return updatedDevice;
              }
              return d;
            });

            // Sync selectedDevice with the latest object (if still selected)
            // The old setSelectedDevice line is commented out to prevent triggering re-run
            // setSelectedDevice(updatedDevices.find((d) => d.id === imei));

            return updatedDevices;
          });
        }
      } catch (error) {
        console.error(`Failed to fetch live update for ${imei}:`, error);
      }
    };

    // 2. Initial call + Set up 30-second interval refresh
    fetchLiveUpdate();
    const liveInterval = setInterval(fetchLiveUpdate, 30000);

    // 3. Cleanup on component unmount or when selectedDevice ID/Account changes
    return () => clearInterval(liveInterval);
  }, [selectedDevice?.id, selectedDevice?.accountId]); // *** CRITICAL CHANGE: Depend only on ID/Account ***

  // --- FILTERING LOGIC ---
  const { filteredDevices, counts } = useMemo(() => {
    const statusMap = {
      Running: 0,
      Stopped: 0,
      Idle: 0,
      Inactive: 0,
      "No Data": 0,
    };
    let total = 0;

    allDevices.forEach((d) => {
      // CHANGE: Use allDevices
      total++;

      // Use the logic from getStatusColor to categorize
      const statusKey =
        d.status && ["Running", "Stopped", "Idle", "Inactive"].includes(d.status)
          ? d.status
          : "No Data";

      statusMap[statusKey]++;
    });

    const counts = { ...statusMap, Total: total };

    const devicesToRender = allDevices.filter((d) => {
      // CHANGE: Use allDevices
      if (filterStatus === "Total") return true;

      const isNoData = !["Running", "Stopped", "Idle", "Inactive"].includes(d.status);

      if (filterStatus === "No Data") return isNoData;

      return d.status === filterStatus;
    });

    return { filteredDevices: devicesToRender, counts };
  }, [filterStatus, allDevices]); // CHANGE: Dependency is allDevices

  // --- SELECTED TRIP (DERIVED DATA) ---
  const selectedTrip = useMemo(() => {
    if (!selectedDevice) return null;

    // Find the selected device's latest object from liveMetrics state
    const liveData = selectedDevice.id === liveMetrics.id ? liveMetrics : selectedDevice;

    const base = { ...MOCK_TRIP_BASE };
    return {
      ...base,
      id: liveData.tripId,
      vehicle: liveData.name,
      driverName: liveData.driverName,
      // Use live data for speed, status, etc.
      currentSpeed: `${liveData.speed} km/h`,
      signalLevel: liveData.battery > 50 ? "High" : "Low",
      currentLocation: liveData.route?.length
        ? liveData.route[liveData.route.length - 1].join(",")
        : base.currentLocation,
      currentAddress: "Mock Address (Pune, India)",
      route: liveData.route,

      // Pass the raw live data properties needed for the marker/header
      status: liveData.status,
      speed: liveData.speed,
      lastUpdate: liveData.lastUpdate,
      driverName: liveData.driverName,
    };
  }, [liveMetrics, selectedDevice]); // DEPENDENCY CHANGE
  // --- MAP CENTER ---
  const mapCenter = useMemo(() => {
    const r = selectedTrip?.route;
    // Center on the latest point if available, otherwise use a default
    if (r?.length) return r[r.length - 1];
    return [18.5204, 73.8567]; // Pune, India
  }, [selectedTrip]);

  // --- PLAYBACK LOGIC (Unchanged, but now runs on accumulated route) ---
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

  // --- UI Filter/Selection Sync ---
  useEffect(() => {
    // If the currently selected device is filtered out, clear selection or select first visible
    const isSelectedFilteredOut =
      selectedDevice && !filteredDevices.some((d) => d.id === selectedDevice.id);

    if (isSelectedFilteredOut || filteredDevices.length === 0) {
      // Clear selection or select the first device in the new filtered list
      setSelectedDevice(filteredDevices[0] || null);
    }
  }, [filterStatus, filteredDevices]); // Only check when filters or the list of all devices changes

  // Reset playback when a new device is selected
  useEffect(() => {
    pausePlayback();
    setCurrentStep(0);
    setMarkerPos(selectedTrip?.route?.[0] ?? null);
  }, [selectedDevice]);

 return (
    <DashboardLayout>
      {/* <DashboardNavbar /> */}

      {/* Main area: left fixed panel + right map (flex layout). */}
      <Box
        sx={{
          display: "flex",
          // Conditionally remove gap when the panel is closed
          gap: isLeftPanelOpen ? 2 : 0, 
          px: { xs: 1, sm: 2, md: 3 },
          pb: 2,
          pt: 2,
          height: "calc(100vh - 120px)",
          alignItems: "stretch",
        }}
      >
        {/* LEFT: device list panel */}
        {/* 3. CONDITIONAL RENDERING */}
        {isLeftPanelOpen && (
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
        )}

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
          {/* 2. ADD THE TOGGLE BUTTON HERE */}
          <Button
            variant="contained"
            color="primary"
            sx={{
              position: "absolute",
              // Place button just outside the map box, to the left
              left: -54, 
              top: 10,
              minWidth: 40,
              height: 400,
              padding: 0,
              zIndex: 1700, // Above map content and overlays
              display: { xs: 'none', sm: 'flex' }, // Hide on extra small screens
              transform: `translateX(${isLeftPanelOpen ? (LEFT_PANEL_WIDTH + theme.spacing(2)) : 0}px)`, // Adjust position based on panel state and gap (2 = theme.spacing(2))
              transition: theme.transitions.create(['transform'], {
                  easing: theme.transitions.easing.sharp,
                  duration: theme.transitions.duration.leavingScreen,
              }),
              borderRadius: '4px 0 0 4px', // Right-side corners should be sharp
            }}
            onClick={toggleLeftPanel}
            aria-label={isLeftPanelOpen ? "Collapse device list" : "Expand device list"}
          >
            <Icon>{isLeftPanelOpen ? "chevron_left" : "chevron_right"}</Icon>
          </Button>
          
          {/* Leaflet MapContainer (Map rendering code remains the same) */}
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

            {/* LIVE MOVING MARKER - Only for the selected (or only) live device */}
            {selectedDevice && selectedDevice.route?.length > 0 && (
              <Marker
                position={selectedDevice.route[selectedDevice.route.length - 1]} // Latest position
                // ... (rest of Marker/Popup code)
                icon={L.divIcon({
                  className: "live-vehicle-marker",
                  html: `
        <div style="
          background-color: ${
            selectedDevice.status === "Running"
              ? "#4caf50"
              : selectedDevice.status === "Stopped"
              ? "#f44336"
              : "#ff9800"
          };
          width: 18px;
          height: 18px;
          border-radius: 50% 50% 50% 0;
          border: 3px solid white;
          box-shadow: 0 2px 8px rgba(0,0,0,0.4);
          transform: rotate(-45deg);
          position: relative;
        ">
          <div style="
            position: absolute;
            top: 3px;
            left: 3px;
            width: 6px;
            height: 6px;
            background: white;
            border-radius: 50%;
          "></div>
        </div>
      `,
                  iconSize: [24, 24],
                  iconAnchor: [12, 12],
                })}
              >
                <Popup>
                  <Box sx={{ minWidth: 180 }}>
                    <Typography variant="subtitle2" fontWeight="bold">
                      {selectedDevice.name}
                    </Typography>
                    <Typography variant="body2">
                      Status: <strong>{selectedDevice.status}</strong>
                    </Typography>
                    <Typography variant="body2">
                      Speed: <strong>{selectedDevice.speed} km/h</strong>
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Last Update: {selectedDevice.lastUpdate}
                    </Typography>
                    {selectedDevice.driverName && (
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        Driver: {selectedDevice.driverName}
                      </Typography>
                    )}
                  </Box>
                </Popup>
              </Marker>
            )}

            {/* THIS IS WHERE YOU PUT IT - Right here! */}
            {selectedDevice && selectedDevice.route?.length > 0 && (
              <FlyToMarker position={selectedDevice.route[selectedDevice.route.length - 1]} />
            )}

            {/* Render the selected trip's historical route */}
            {selectedTrip?.route?.length > 0 && (
              <Polyline positions={selectedTrip.route} color="blue" weight={5} opacity={0.7} />
            )}

            {/* Render the playback marker for the selected device */}
            {selectedTrip && markerPos && (
              <Marker
                position={markerPos}
                // ... (rest of Marker/Popup code)
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