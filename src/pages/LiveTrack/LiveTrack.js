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
import IconButton from "@mui/material/IconButton";
import truckImage from "../../assets/images/truckImage.jpg"; // Example path

// Layout
import DashboardLayout from "../../../src/assets/components/examples/LayoutContainers/DashboardLayout";

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
    default:
      return "default";
  }
}

function getCustomChipStyle(status) {
  const normalizedStatus = String(status || "").trim();

  if (normalizedStatus === "Inactive") {
    return {
      backgroundColor: "#344767",
      color: "#FFFFFF",
    };
  }

  if (normalizedStatus === "No Data" || normalizedStatus === "") {
    return {
      backgroundColor: "#bdbdbd",
      color: "#FFFFFF",
    };
  }

  return {};
}

function getBatteryIcon(percentage) {
  if (percentage > 75) return "battery_full";
  if (percentage > 50) return "battery_70";
  if (percentage > 20) return "battery_40";
  return "battery_alert";
}

function getVehicleIconOrImage(vehicleType) {
  const type = (vehicleType || "").toLowerCase();
  const DUMMY_TRUCK_IMAGE =
    "http://googleusercontent.com/image_collection/image_retrieval/some_id_string";
  const DUMMY_CONSTRUCTION_IMAGE = "https://i.imgur.com/example/construction_v.png";
  const DUMMY_VAN_IMAGE = "https://i.imgur.com/example/delivery_van.png";

  if (
    type.includes("truck") ||
    type.includes("trailer") ||
    type.includes("tipper") ||
    type.includes("flatbed")
  ) {
    return {
      icon: "local_shipping",
      color: "info",
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
  return { icon: "crop_square", color: "default" };
}

/* ============================
  VehicleHeaderBox
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
      <Avatar
        sx={{
          width: 170,
          height: 70,
          borderRadius: 0,
          bgcolor: "transparent",
          p: 0,
          overflow: "hidden",
          "& img": {
            objectFit: "cover",
          },
        }}
        src={truckImage}
      />
      <Box flexGrow={1}>
        <Typography variant="h6" fontWeight={700} noWrap>
          {device.name}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          <strong>Driver:</strong> {device.driverName || "N/A"}
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
                    color={getStatusColor(d.status)}
                    sx={{
                      fontWeight: 600,
                      mb: 0.5,
                      display: "inline-block",
                      maxWidth: "100%",
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
FlyToMarker.propTypes = {
  position: PropTypes.arrayOf(PropTypes.number).isRequired,
};

/* ============================
  MAIN COMPONENT
  ============================ */
export default function LiveTrack() {
  const LEFT_PANEL_WIDTH = 350;
  const [isLeftPanelOpen, setIsLeftPanelOpen] = useState(true);
  const theme = useTheme();

  const toggleLeftPanel = () => {
    setIsLeftPanelOpen((v) => !v);
  };

  const [allDevices, setAllDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [markerPos, setMarkerPos] = useState(null);
  const intervalRef = useRef(null);
  const [liveMetrics, setLiveMetrics] = useState({});

  const [filterStatus, setFilterStatus] = useState("Total");

  useEffect(() => {
    ApiService.getAllDevices()
      .then((devices) => {
        setAllDevices(devices);
        if (devices.length > 0) {
          setSelectedDevice(devices[0]);
        }
      })
      .catch(console.error);
  }, []);

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
          // battery address odometer
          const odometerValue = rawData.misc?.odometer ?? "0";
          const batteryPercent = rawData.misc?.batteryPercentage ?? "50";
          const addressString = rawData.address ?? "Address not available";

          let status;
          if (ign === "Y") {
            status = speedNum > 5 ? "Running" : "Idle";
          } else {
            status = speedNum === 0 ? "Stopped" : "Inactive";
          }

          const newLocation = [rawData.lat, rawData.lng];

          setAllDevices((prevDevices) => {
            const updatedDevices = prevDevices.map((d) => {
              if (d.id === imei) {
                const accumulatedRoute = [...(d.route || []), newLocation].slice(-100);
                const updatedDevice = {
                  ...d,
                  status,
                  speed: speedNum,
                  ignition: ign === "Y",
                  // battery: rawData.anl ? Math.round((Number(rawData.anl) / 4.2) * 100) : 50,
                  battery: Number(batteryPercent), // Use the specific field for percentage
                  odometer: Number(odometerValue),
                  address: addressString, // Store the address
                  lastUpdate: new Date().toLocaleTimeString(),
                  location: `${rawData.lat},${rawData.lng}`,
                  route: accumulatedRoute,
                };
                setLiveMetrics(updatedDevice);
                return updatedDevice;
              }
              return d;
            });
            return updatedDevices;
          });
        }
      } catch (error) {
        console.error(`Failed to fetch live update for ${imei}:`, error);
      }
    };

    fetchLiveUpdate();
    const liveInterval = setInterval(fetchLiveUpdate, 30000);
    return () => clearInterval(liveInterval);
  }, [selectedDevice?.id, selectedDevice?.accountId]);

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
      total++;
      const statusKey =
        d.status && ["Running", "Stopped", "Idle", "Inactive"].includes(d.status)
          ? d.status
          : "No Data";
      statusMap[statusKey]++;
    });

    const counts = { ...statusMap, Total: total };

    const devicesToRender = allDevices.filter((d) => {
      if (filterStatus === "Total") return true;
      const isNoData = !["Running", "Stopped", "Idle", "Inactive"].includes(d.status);
      if (filterStatus === "No Data") return isNoData;
      return d.status === filterStatus;
    });

    return { filteredDevices: devicesToRender, counts };
  }, [filterStatus, allDevices]);

  const selectedTrip = useMemo(() => {
    if (!selectedDevice) return null;
    const liveData = selectedDevice.id === liveMetrics.id ? liveMetrics : selectedDevice;
    const base = { ...MOCK_TRIP_BASE };
    return {
      ...base,
      id: liveData.tripId,
      vehicle: liveData.name,
      driverName: liveData.driverName,
      currentSpeed: `${liveData.speed} km/h`,
      signalLevel: liveData.battery > 50 ? "High" : "Low",
      currentLocation: liveData.route?.length
        ? liveData.route[liveData.route.length - 1].join(",")
        : base.currentLocation,
      //  Use API Data for these fields ***
      currentAddress: liveData.address || "Fetching address...", // Use API Address
      address: liveData.address || "Location address not available", // Used in the dedicated Address Card
      odometer: liveData.odometer,
      batteryVoltage: liveData.battery, // Represents percentage now
      route: liveData.route,
      status: liveData.status,
      speed: liveData.speed,
      lastUpdate: liveData.lastUpdate,
      ignitionStatus: liveData.ignition,
      engineHours: liveData.engineHours || "00:00",
    };
  }, [liveMetrics, selectedDevice]);

  const mapCenter = useMemo(() => {
    const r = selectedTrip?.route;
    if (r?.length) return r[r.length - 1];
    return [18.5204, 73.8567]; // Pune, India
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
    const isSelectedFilteredOut =
      selectedDevice && !filteredDevices.some((d) => d.id === selectedDevice.id);
    if (isSelectedFilteredOut || filteredDevices.length === 0) {
      setSelectedDevice(filteredDevices[0] || null);
    }
  }, [filterStatus, filteredDevices]);

  useEffect(() => {
    pausePlayback();
    setCurrentStep(0);
    setMarkerPos(selectedTrip?.route?.[0] ?? null);
  }, [selectedDevice]);

  return (
    <DashboardLayout>
      <Box
        sx={{
          display: "flex",
          gap: isLeftPanelOpen ? 2 : 0,
          px: { xs: 1, sm: 2, md: 3 },
          pb: 2,
          pt: 2,
          height: "calc(100vh - 120px)",
          alignItems: "stretch",
        }}
      >
        {/* LEFT PANEL */}
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
              position: "relative",
              transition: "width 200ms ease",
              height: "100%",
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                px: 2,
                py: 1,
                background: "transparent",
              }}
            >
              <Typography variant="subtitle1" fontWeight={700}>
                Devices
              </Typography>
              <Tooltip title={isLeftPanelOpen ? "Collapse sidebar" : "Open sidebar"}>
                <IconButton
                  onClick={toggleLeftPanel}
                  size="small"
                  sx={{
                    borderRadius: 1,
                    ml: 1,
                    bgcolor: "rgba(0,0,0,0.04)",
                    "&:hover": { bgcolor: "rgba(0,0,0,0.06)" },
                  }}
                  aria-label={isLeftPanelOpen ? "Collapse sidebar" : "Open sidebar"}
                >
                  <Icon sx={{ fontSize: 20 }}>
                    {isLeftPanelOpen ? "chevron_left" : "chevron_right"}
                  </Icon>
                </IconButton>
              </Tooltip>
            </Box>

            <Stack
              direction="row"
              spacing={1}
              sx={{ width: "100%", overflowX: "auto", pb: 0.5, px: 1 }}
            >
              {["Total", "Running", "Stopped", "Idle", "Inactive", "No Data"].map((status) => (
                <StatusBox
                  key={status}
                  status={status}
                  count={counts[status] || 0}
                  isSelected={filterStatus === status}
                  onClick={setFilterStatus}
                />
              ))}
            </Stack>

            <DeviceTable
              devices={filteredDevices}
              selectedId={selectedDevice?.id}
              onSelect={setSelectedDevice}
            />
          </Box>
        )}

        {/* Closed Sidebar Handle */}
        {!isLeftPanelOpen && (
          <Box
            sx={{
              position: "absolute",
              top: 16,
              left: 12,
              zIndex: 1700,
            }}
          >
            <Tooltip title="Open sidebar">
              <IconButton
                onClick={() => setIsLeftPanelOpen(true)}
                size="small"
                sx={{
                  bgcolor: "rgba(0,0,0,0.06)",
                  "&:hover": { bgcolor: "rgba(0,0,0,0.09)" },
                  boxShadow: 1,
                }}
                aria-label="Open sidebar"
              >
                <Icon sx={{ fontSize: 20 }}>chevron_right</Icon>
              </IconButton>
            </Tooltip>
          </Box>
        )}

        {/* RIGHT: MAP AREA */}
        <Box
          sx={{
            position: "relative",
            flexGrow: 1,
            height: "100%",
            borderRadius: 1,
            overflow: "hidden",
            boxShadow: "0 6px 18px rgba(15,15,15,0.08) !important",
            transition: "all 200ms ease",
          }}
        >
          <MapContainer
            center={mapCenter}
            zoom={13}
            scrollWheelZoom={true}
            style={{ height: "100%", width: "100%", zIndex: 1000 }}
          >
            <MapFixer />
            <TileLayer
              attribution="&copy; OpenStreetMap contributors"
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {selectedDevice && selectedDevice.route?.length > 0 && (
              <Marker
                position={selectedTrip.route[selectedTrip.route.length - 1]} // Use the last point from the derived trip
                icon={L.divIcon({
                  className: "live-vehicle-marker",
                  html: `
        <div style="
          background-color: ${
            selectedTrip.status === "Running" // Use selectedTrip status
              ? "#4caf50"
              : selectedTrip.status === "Stopped"
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
                      {selectedTrip.vehicle} {/* Use selectedTrip details */}
                    </Typography>
                    <Typography variant="body2">
                      Status: <strong>{selectedTrip.status}</strong>
                    </Typography>
                    <Typography variant="body2">
                      Speed: <strong>{selectedTrip.speed} km/h</strong>
                    </Typography>
                  </Box>
                </Popup>
              </Marker>
            )}
            {/* Fly to latest position on load */}
            {selectedTrip?.route?.length > 0 && (
              <FlyToMarker position={selectedTrip.route[selectedTrip.route.length - 1]} />
            )}

            {selectedTrip?.route?.length > 0 && (
              <Polyline positions={selectedTrip.route} color="blue" weight={5} opacity={0.7} />
            )}

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
                </Popup>
              </Marker>
            )}
          </MapContainer>

          {/* RIGHT OVERLAY PANEL */}
          <Box
            sx={{
              position: "absolute",
              top: 12,
              right: 12,
              display: "flex",
              flexDirection: "column",
              gap: 1.5,
              width: { xs: "95%", sm: 320 },
              zIndex: 2000,
              maxHeight: "calc(100% - 24px)",
              overflowY: "auto",
              backdropFilter: "saturate(140%) blur(6px)",
              paddingRight: "4px",
              "&::-webkit-scrollbar": {
                width: "8px", // Made slightly wider for visibility
              },
              "&::-webkit-scrollbar-track": {
                background: "transparent",
              },
              "&::-webkit-scrollbar-thumb": {
                background: "rgba(0, 0, 0, 0.4)", // Darker scrollbar for visibility
                borderRadius: "10px",
              },
              "&::-webkit-scrollbar-thumb:hover": {
                background: "rgba(0, 0, 0, 0.6)",
              },
            }}
          >
            <VehicleHeaderBox device={selectedDevice} />

            {/* 1. Trip Summary */}
            <Card sx={{ p: 2 }}>
              <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>
                Trip Summary
              </Typography>
              <Divider sx={{ mb: 1 }} />
              <InfoRow label="Trip ID" value={selectedTrip?.id} icon="badge" />
              <InfoRow label="Vehicle" value={selectedTrip?.vehicle} icon="local_shipping" />
              <InfoRow label="Driver" value={selectedTrip?.driverName} icon="person" />
              <InfoRow label="Distance" value={selectedTrip?.totalDistance} icon="map" />
            </Card>

            {/* 2. Live Metrics */}
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

            {/* 3. Address (MOVED BELOW LIVE METRICS) */}
            <Card sx={{ p: 2 }}>
              <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>
                Address
              </Typography>
              <Divider sx={{ mb: 1 }} />
              <Box sx={{ display: "flex", gap: 1 }}>
                <Icon sx={{ color: "text.secondary", fontSize: 20 }}>place</Icon>
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.4 }}>
                  {selectedTrip?.address || "Location address not available"}
                </Typography>
              </Box>
            </Card>

            {/* 4. Other Data (MOVED BELOW LIVE METRICS) */}
            <Card sx={{ p: 2, mb: 1 }}>
              <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>
                Other Data
              </Typography>
              <Divider sx={{ mb: 1 }} />
              <InfoRow
                label="Ignition"
                value={selectedTrip?.ignitionStatus ? "On" : "Off"}
                icon="power_settings_new"
              />
              <InfoRow
                label="Battery"
                value={selectedTrip?.batteryVoltage ? `${selectedTrip.batteryVoltage} V` : "N/A"}
                icon="battery_charging_full"
              />
              <InfoRow
                label="Odometer"
                value={selectedTrip?.odometer ? `${selectedTrip.odometer} km` : "N/A"}
                icon="confirmation_number"
              />
              <InfoRow
                label="Engine Hours"
                value={selectedTrip?.engineHours || "N/A"}
                icon="schedule"
              />
            </Card>
          </Box>
        </Box>
      </Box>
    </DashboardLayout>
  );
}
