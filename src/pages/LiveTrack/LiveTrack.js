// src/LiveTrack/LiveTrack.js
import React, { useEffect, useMemo, useRef, useState } from "react";
import PropTypes from "prop-types";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapContainer, Marker, Polyline, Popup, useMap } from "react-leaflet";
import { useLocation, useSearchParams } from "react-router-dom";
import { createTileLayers } from "../../pages/LoadCellReport/createTileLayers";

// MUI
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
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
import Avatar from "@mui/material/Avatar";
import { useTheme } from "@mui/material/styles";
import IconButton from "@mui/material/IconButton";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import truckImage from "../../assets/images/truckImage.jpg";

// Layout & Components
import DashboardLayout from "../../../src/assets/components/examples/LayoutContainers/DashboardLayout";
import MDBox from "../../assets/components/MDBox";
import ApiService from "../../services/ApiService";

// Styles
import {
  styles,
  getVehicleMarkerHtml,
  getPlaybackMarkerHtml,
  getRotatingTruckHtml,
} from "./LiveTrack.styles";

const formatDevTimestamp = (devTs) => {
  if (!devTs) return "—";

  const isoLike = devTs.replace(" ", "T");
  const date = new Date(isoLike);
  if (Number.isNaN(date.getTime())) return devTs;

  const pad = (n) => n.toString().padStart(2, "0");
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  const seconds = pad(date.getSeconds());

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

/* ============================
  CONSTANTS & CONFIG
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

// Leaflet Icon Fix
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const TRUCK_ICON_URL = "https://cdn-icons-png.flaticon.com/512/1048/1048329.png";

const truckIcon = new L.Icon({
  iconUrl: TRUCK_ICON_URL,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -28],
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
  shadowSize: [41, 41],
});

const truckHighlightIcon = new L.Icon({
  iconUrl: TRUCK_ICON_URL,
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -32],
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
  shadowSize: [41, 41],
});

/* ============================
  SUB-COMPONENTS
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

function FlyToMarker({ position }) {
  const map = useMap();
  useEffect(() => {
    if (position && position[0] && position[1]) {
      map.flyTo(position, 16, { duration: 1.8, easeLinearity: 0.25 });
    }
  }, [position, map]);
  return null;
}
FlyToMarker.propTypes = { position: PropTypes.arrayOf(PropTypes.number).isRequired };

function InfoRow({ label, value, icon }) {
  return (
    <Box sx={styles.infoRow}>
      <Box sx={styles.infoLabelBox}>
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

function VehicleHeaderBox({ device }) {
  if (!device) {
    return (
      <Card sx={{ p: 2, textAlign: "center", height: 100 }}>
        <Typography color="text.secondary">Select a device to view details</Typography>
      </Card>
    );
  }

  return (
    <Card sx={{ p: 2, display: "flex", alignItems: "center", gap: 2 }}>
      <Avatar sx={styles.vehicleHeaderAvatar} src={truckImage} />
      <Box flexGrow={1}>
        <Typography variant="h6" fontWeight={700} noWrap>
          {device.name}
        </Typography>
      </Box>
    </Card>
  );
}
VehicleHeaderBox.propTypes = { device: PropTypes.object };

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
    <Card onClick={() => onClick(status)} sx={styles.statusBox(isSelected)}>
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

// UPDATED: DeviceTable now receives deviceSearch and setDeviceSearch as props
function DeviceTable({ devices, selectedId, onSelect, deviceSearch, setDeviceSearch }) {
  return (
    <Card sx={styles.tableCard}>
      <MDBox p={2} borderRadius="0px" coloredShadow="dark">
        <Typography variant="h6" color="white" fontWeight={600}>
          Live Device List ({devices.length})
        </Typography>

        {/* Search bar inside this box */}
        <Box sx={{ mt: 1 }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Search device..."
            variant="outlined"
            value={deviceSearch}
            onChange={(e) => setDeviceSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Icon fontSize="small">search</Icon>
                </InputAdornment>
              ),
            }}
          />
        </Box>
      </MDBox>

      <TableContainer component={Paper} sx={styles.tableContainer}>
        <Table stickyHeader size="small" sx={styles.tableRoot}>
          <TableHead>
            <TableRow>
              <TableCell align="left" sx={styles.cell("45%", "left", { px: 2 })}>
                <MDBox display="flex" alignItems="center" justifyContent="flex-start">
                  <Icon fontSize="small" sx={{ mr: "135px" }}>
                    directions_car
                  </Icon>
                  <Icon fontSize="small" sx={{ mr: "120px" }}>
                    access_time
                  </Icon>
                </MDBox>
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
                sx={styles.tableRow(selectedId === d.id)}
              >
                {/* Vehicle Column */}
                <TableCell
                  sx={styles.cell("45%", "left", {
                    px: 2,
                    py: 1,
                    overflow: "hidden",
                  })}
                >
                  <Typography variant="body2" fontWeight={600} noWrap>
                    {d.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" noWrap>
                    {d.id}
                  </Typography>
                </TableCell>

                {/* Status Column */}
                <TableCell sx={styles.cell("25%", "center", { whiteSpace: "normal" })}>
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
  deviceSearch: PropTypes.string.isRequired,
  setDeviceSearch: PropTypes.func.isRequired,
};

/**
 * Calculates the bearing between two points in degrees (0 = North, 90 = East, etc.)
 */
const calculateBearing = (start, end) => {
  if (!start || !end) return 0;
  const startLat = (start[0] * Math.PI) / 180;
  const startLng = (start[1] * Math.PI) / 180;
  const endLat = (end[0] * Math.PI) / 180;
  const endLng = (end[1] * Math.PI) / 180;

  const y = Math.sin(endLng - startLng) * Math.cos(endLat);
  const x =
    Math.cos(startLat) * Math.sin(endLat) -
    Math.sin(startLat) * Math.cos(endLat) * Math.cos(endLng - startLng);

  const bearing = (Math.atan2(y, x) * 180) / Math.PI;
  return (bearing + 360) % 360; // Normalize to 0-360
};

/* ============================
  MAIN COMPONENT
 ============================ */
function LayerSwitcher() {
  const map = useMap();

  useEffect(() => {
    const baseMaps = createTileLayers();

    let currentLayer = baseMaps["OpenStreet"];
    currentLayer.addTo(map);

    const makeBtn = (iconSrc, title, switchFn) => {
      const btn = L.DomUtil.create("button");
      btn.innerHTML = `<img src="${iconSrc}" alt="${title}" title="${title}" style="width:24px;height:24px"/>`;
      btn.style.cssText = "background:none;border:none;cursor:pointer;margin:0 2px;";
      L.DomEvent.on(btn, "click", switchFn);
      return btn;
    };

    const switchTo = (name) => {
      const layer = baseMaps[name];
      if (!layer) return;
      if (currentLayer && map.hasLayer(currentLayer)) map.removeLayer(currentLayer);
      layer.addTo(map);
      currentLayer = layer;
    };

    const container = L.DomUtil.create("div");
    container.style.cssText =
      "display:flex;gap:8px;background:#fff;padding:4px 8px;" +
      "border-radius:8px;box-shadow:0 2px 6px rgba(0,0,0,0.2);";

    container.appendChild(
      makeBtn("https://cdn-icons-png.flaticon.com/512/854/854929.png", "OpenStreet", () =>
        switchTo("OpenStreet")
      )
    );
    container.appendChild(
      makeBtn("https://cdn-icons-png.flaticon.com/512/1865/1865083.png", "MapBox Dark", () =>
        switchTo("MapBoxDark")
      )
    );
    container.appendChild(
      makeBtn("https://cdn-icons-png.flaticon.com/512/1865/1865269.png", "Google Satellite", () =>
        switchTo("GoogleSatellite")
      )
    );

    const SwitcherControl = L.Control.extend({ onAdd: () => container });
    const control = new SwitcherControl({ position: "bottomleft" });
    control.addTo(map);

    return () => {
      control.remove();
      Object.values(baseMaps).forEach((l) => {
        if (map.hasLayer(l)) map.removeLayer(l);
      });
    };
  }, [map]);

  return null;
}

export default function LiveTrack() {
  const LEFT_PANEL_WIDTH = 550;
  const [isLeftPanelOpen, setIsLeftPanelOpen] = useState(true);
  const toggleLeftPanel = () => setIsLeftPanelOpen((v) => !v);

  const [allDevices, setAllDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [markerPos, setMarkerPos] = useState(null);
  const intervalRef = useRef(null);
  const [liveMetrics, setLiveMetrics] = useState({});
  const [filterStatus, setFilterStatus] = useState("Total");

  // Search state for devices
  const [deviceSearch, setDeviceSearch] = useState("");
  const prevAnimatedPosRef = useRef(null);
  const [animatedBearing, setAnimatedBearing] = useState(0);

  // --- Smooth animation state & refs ---
  // animatedPos holds the interpolated [lat, lng] rendered on the map each frame
  const [animatedPos, setAnimatedPos] = useState(null);
  // animFrameRef holds the rAF id so we can cancel it on unmount / device change
  const animFrameRef = useRef(null);
  // animFromRef holds the position we are animating FROM (previous GPS fix)
  const animFromRef = useRef(null);

  const location = useLocation();
  const [searchParams] = useSearchParams();

  // IMEI from state OR from query string
  const imeiFromQuery = searchParams.get("imei");
  const imeiFromState = location.state?.targetImei;
  const targetImei = imeiFromState || imeiFromQuery;
  const targetAccountId = location.state?.targetAccountId;

  /* ------------------------------------------------------------------
   * animateToPosition
   * Smoothly moves the marker from `fromPos` to `toPos` over `duration`
   * milliseconds using requestAnimationFrame + ease-in-out interpolation.
   * ------------------------------------------------------------------ */
  const animateToPosition = (fromPos, toPos, duration = 28000) => {
    // Cancel any in-progress animation
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }

    // Guard: need valid coordinates
    if (
      !fromPos ||
      !toPos ||
      fromPos.length < 2 ||
      toPos.length < 2 ||
      (fromPos[0] === toPos[0] && fromPos[1] === toPos[1])
    ) {
      // No real movement — just snap to destination
      setAnimatedPos(toPos);
      return;
    }

    const startTime = performance.now();

    const step = (now) => {
      const elapsed = now - startTime;
      const rawT = Math.min(elapsed / duration, 1);
      const t = rawT < 0.5 ? 2 * rawT * rawT : -1 + (4 - 2 * rawT) * rawT;

      const lat = fromPos[0] + (toPos[0] - fromPos[0]) * t;
      const lng = fromPos[1] + (toPos[1] - fromPos[1]) * t;
      const newPos = [lat, lng];

      // Calculate bearing from previous animated position → current animated position
      if (prevAnimatedPosRef.current) {
        const b = calculateBearing(prevAnimatedPosRef.current, newPos);
        setAnimatedBearing(b);
      }
      prevAnimatedPosRef.current = newPos;

      setAnimatedPos(newPos);

      if (rawT < 1) {
        animFrameRef.current = requestAnimationFrame(step);
      } else {
        animFrameRef.current = null;
      }
    };

    animFrameRef.current = requestAnimationFrame(step);
  };

  useEffect(() => {
    ApiService.getAllDevices()
      .then((devices) => {
        console.log("LiveTrack targetImei:", targetImei);
        console.log("LiveTrack devices sample:", devices?.slice?.(0, 3));

        setAllDevices(devices || []);

        let initialSelectedDevice = null;

        if (targetImei) {
          initialSelectedDevice =
            devices.find((d) => d.id === targetImei) ||
            devices.find((d) => d.imei === targetImei) ||
            devices.find((d) => d.deviceId === targetImei);
          console.log("Matched initialSelectedDevice:", initialSelectedDevice);
        }

        if (initialSelectedDevice && targetAccountId) {
          initialSelectedDevice = {
            ...initialSelectedDevice,
            accountId: targetAccountId,
          };
        }

        if (!initialSelectedDevice && devices.length > 0) {
          initialSelectedDevice = devices[0];
        }

        setSelectedDevice(initialSelectedDevice);
      })
      .catch(console.error);
  }, [targetImei, targetAccountId]);

  // Live updates for selected device
  useEffect(() => {
    if (!selectedDevice?.accountId || !selectedDevice?.id) {
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
            // Capture the previous last-known position BEFORE updating state
            const prevDevice = prevDevices.find((d) => d.id === imei);
            const prevLocation = prevDevice?.route?.length
              ? prevDevice.route[prevDevice.route.length - 1]
              : newLocation;

            // Kick off smooth animation from previous position → new GPS fix
            // Use 28 s so the animation finishes just before the next 30 s poll
            animateToPosition(prevLocation, newLocation, 28000);

            return prevDevices.map((d) => {
              if (d.id === imei) {
                const accumulatedRoute = [...(d.route || []), newLocation].slice(-100);
                const updatedDevice = {
                  ...d,
                  status,
                  speed: speedNum,
                  ignition: ign === "Y",
                  battery: Number(batteryPercent),
                  odometer: Number(odometerValue),
                  distance: rawData.distance ?? 0,
                  address: addressString,
                  lastUpdate: formatDevTimestamp(rawData.devTs),
                  location: `${rawData.lat},${rawData.lng}`,
                  route: accumulatedRoute,
                };
                setLiveMetrics(updatedDevice);
                return updatedDevice;
              }
              return d;
            });
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

  // Filter devices and counts (status + search)
  const { filteredDevices, counts } = useMemo(() => {
    const statusMap = { Running: 0, Stopped: 0, Idle: 0, Inactive: 0, "No Data": 0 };
    let total = 0;

    allDevices.forEach((d) => {
      total++;
      const statusKey =
        d.status && ["Running", "Stopped", "Idle", "Inactive"].includes(d.status)
          ? d.status
          : "No Data";
      statusMap[statusKey]++;
    });

    const statusFiltered = allDevices.filter((d) => {
      if (filterStatus === "Total") return true;
      const isNoData = !["Running", "Stopped", "Idle", "Inactive"].includes(d.status);
      if (filterStatus === "No Data") return isNoData;
      return d.status === filterStatus;
    });

    const search = deviceSearch.trim().toLowerCase();
    const devicesToRender = !search
      ? statusFiltered
      : statusFiltered.filter((d) => {
          const name = (d.name || "").toLowerCase();
          const id = (d.id || "").toString().toLowerCase();
          return name.includes(search) || id.includes(search);
        });

    return { filteredDevices: devicesToRender, counts: { ...statusMap, Total: total } };
  }, [filterStatus, allDevices, deviceSearch]);

  // Selected trip view model
  const selectedTrip = useMemo(() => {
    if (!selectedDevice) return null;
    const liveData = selectedDevice.id === liveMetrics.id ? liveMetrics : selectedDevice;
    const base = { ...MOCK_TRIP_BASE };
    return {
      ...base,
      id: liveData.tripId,
      vehicle: liveData.name,
      driverName: liveData.driverName,
      totalDistance: liveData.distance != null ? `${liveData.distance} km` : "N/A",
      currentSpeed: `${liveData.speed} km/h`,
      signalLevel: liveData.battery > 50 ? "High" : "Low",
      currentLocation: liveData.route?.length
        ? liveData.route[liveData.route.length - 1].join(",")
        : base.currentLocation,
      currentAddress: liveData.address || "Fetching address...",
      address: liveData.address || "Location address not available",
      odometer: liveData.odometer,
      batteryVoltage: liveData.battery,
      route: liveData.route,
      status: liveData.status,
      speed: liveData.speed,
      lastUpdate: liveData.lastUpdate,
      ignitionStatus: liveData.ignition,
      engineHours: liveData.engineHours || "00:00",
    };
  }, [liveMetrics, selectedDevice]);

  // Bearing derived from the two most recent route points
  const currentBearing = useMemo(() => {
    const route = selectedTrip?.route;
    if (route && route.length >= 2) {
      const prev = route[route.length - 2];
      const curr = route[route.length - 1];
      return calculateBearing(prev, curr);
    }
    return 0;
  }, [selectedTrip?.route]);

  // The truck icon image faces East (right) by default.
  // CSS rotation 0° = North in our convention, so we subtract 90° to compensate.
  const truckRotation = (animatedPos ? animatedBearing : currentBearing) - 125;

  // Map center follows the real (non-animated) last GPS fix so FlyToMarker
  // pans to the destination immediately while the truck drives there.
  const mapCenter = useMemo(() => {
    const r = selectedTrip?.route;
    if (r?.length) return r[r.length - 1];
    return [18.5204, 73.8567];
  }, [selectedTrip]);

  // The position actually rendered for the live truck marker:
  // - While animation is running → animatedPos (smooth interpolated position)
  // - Before first fix / after device switch → fall back to last route point
  const renderedMarkerPos = useMemo(() => {
    if (animatedPos) return animatedPos;
    const r = selectedTrip?.route;
    return r?.length ? r[r.length - 1] : null;
  }, [animatedPos, selectedTrip?.route]);

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

  // Reset animation and playback when the selected device changes
  useEffect(() => {
    // Cancel any running smooth-move animation
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    setAnimatedPos(null);
    animFromRef.current = null;
    prevAnimatedPosRef.current = null;
    setAnimatedBearing(0);

    pausePlayback();
    setCurrentStep(0);
    setMarkerPos(selectedTrip?.route?.[0] ?? null);
  }, [selectedDevice]);

  // Cleanup animation frame on unmount
  useEffect(() => {
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  return (
    <DashboardLayout>
      <Box
        sx={{
          ...styles.dashboardContainer(isLeftPanelOpen),
          zIndex: 0,
          position: "relative",
        }}
      >
        {isLeftPanelOpen && (
          <Box sx={styles.leftPanelContainer(LEFT_PANEL_WIDTH)}>
            <Box sx={styles.leftPanelHeader}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  mb: 1,
                }}
              >
                <Typography variant="subtitle1" fontWeight={700}>
                  Devices
                </Typography>
                <Tooltip title="Collapse sidebar">
                  <IconButton onClick={toggleLeftPanel} size="small" sx={styles.collapseButton}>
                    <Icon sx={{ fontSize: 20 }}>chevron_left</Icon>
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>

            <DeviceTable
              devices={filteredDevices}
              selectedId={selectedDevice?.id}
              onSelect={setSelectedDevice}
              deviceSearch={deviceSearch}
              setDeviceSearch={setDeviceSearch}
            />
          </Box>
        )}

        {!isLeftPanelOpen && (
          <Box sx={styles.expandButtonWrapper}>
            <Tooltip title="Open sidebar">
              <IconButton
                onClick={() => setIsLeftPanelOpen(true)}
                size="small"
                sx={styles.expandButton}
              >
                <Icon sx={{ fontSize: 20 }}>chevron_right</Icon>
              </IconButton>
            </Tooltip>
          </Box>
        )}

        <Box sx={styles.mapWrapper}>
          <MapContainer
            center={mapCenter}
            zoom={13}
            scrollWheelZoom={true}
            style={{ height: "100%", width: "100%", zIndex: 0 }}
          >
            <MapFixer />
            <LayerSwitcher />

            {/* Live truck marker — uses animatedPos for smooth movement */}
            {selectedDevice && renderedMarkerPos && (
              <Marker
                position={renderedMarkerPos}
                icon={L.divIcon({
                  className: "rotating-truck-container",
                  html: getRotatingTruckHtml(
                    selectedTrip?.status,
                    truckRotation, // bearing − 90° so icon aligns with direction of travel
                    true // highlighted
                  ),
                  iconSize: [40, 40],
                  iconAnchor: [20, 20], // centre anchor for clean rotation
                })}
              >
                <Popup>
                  <Box sx={{ minWidth: 180 }}>
                    <Typography variant="subtitle2" fontWeight="bold">
                      {selectedTrip?.vehicle}
                    </Typography>
                    <Typography variant="body2">
                      Status: <strong>{selectedTrip?.status}</strong>
                    </Typography>
                    <Typography variant="body2">
                      Speed: <strong>{selectedTrip?.speed} km/h</strong>
                    </Typography>
                  </Box>
                </Popup>
              </Marker>
            )}

            {/* FlyToMarker uses real GPS destination, not animated position */}
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
                  html: getPlaybackMarkerHtml(),
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

          <Box sx={styles.overlayPanel}>
            <VehicleHeaderBox device={selectedDevice} />

            <Card sx={{ p: 2 }}>
              <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>
                Trip Summary
              </Typography>
              <Divider sx={{ mb: 1 }} />
              <InfoRow label="IMEI" value={selectedTrip?.id} icon="badge" />
              <InfoRow label="Vehicle" value={selectedTrip?.vehicle} icon="local_shipping" />
              <InfoRow label="Driver" value={selectedTrip?.driverName} icon="person" />
              <InfoRow label="Distance" value={selectedTrip?.totalDistance} icon="map" />
            </Card>

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
                  {/* playback buttons commented */}
                </Stack>
              </Box>
            </Card>

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
