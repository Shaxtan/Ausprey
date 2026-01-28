import React, { useEffect, useRef, useState, useMemo, useCallback } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import "leaflet.markercluster";

import MDBox from "../../assets/components/MDBox";
import MDTypography from "../../assets/components/MDTypography";
import MDInput from "../../assets/components/MDInput";
import Grid from "@mui/material/Grid";
import Icon from "@mui/material/Icon";
import Card from "@mui/material/Card";
import Collapse from "@mui/material/Collapse";
import IconButton from "@mui/material/IconButton";
import DashboardLayout from "../../assets/components/examples/LayoutContainers/DashboardLayout";
// IMPORTANT: use the new navbar with context
import DashboardNavbarWithAccountContext from "../../assets/components/examples/Navbars/DashboardNavbar/DashboardNavbarWithAccountContext";

// Get account data from context
import { useAccount } from "context/AccountContext";

import ApiService from "../../services/ApiService";

// -----------------------------
// Custom Truck Icons (map)
// -----------------------------
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

// -----------------------------
// Tile Layer
// -----------------------------
const createTileLayers = () => ({
  OpenStreet: L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: "© OpenStreetMap contributors",
  }),
});

// -----------------------------
// Helper functions
// -----------------------------
const getStatusLabel = (status, lock) => {
  if (lock === "1") return "Locked";
  if (status === "MOTION") return "In Motion";
  if (status === "IDLE") return "Idle";
  if (status === "STOP") return "Stopped";
  return "Unknown";
};

const getStatusColor = (status, lock) => {
  if (lock === "1") return "#2196F3"; // Blue
  if (status === "MOTION") return "#4CAF50"; // Green
  if (status === "IDLE") return "#FF9800"; // Orange
  return "#F44336"; // Red for Stopped
};

// all statuses use truck icon; lock uses highlight variant
const getIconForStatus = (status, lock) => {
  if (lock === "1") return truckHighlightIcon;
  return truckIcon;
};

// -----------------------------
// Main Component
// -----------------------------
const MapView = () => {
  // --- ACCOUNT (from context) & REFRESH sSTATE ---
  const { selectedAccountId } = useAccount(); // accounts & setter are used in navbar
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshTime, setLastRefreshTime] = useState(Date.now());

  // --- MAP & UI STATE ---
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const zoomDivRef = useRef(null);
  const markerClusterRef = useRef(null);
  const markerMapRef = useRef({}); // vehnum → marker
  const [highlightedVeh, setHighlightedVeh] = useState(null);

  const [vehicleStats, setVehicleStats] = useState({
    total: 0,
    inMotion: 0,
    idle: 0,
    stopped: 0,
    locked: 0,
  });

  const [vehicleList, setVehicleList] = useState([]);
  const [filter, setFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const indiaCenter = { lat: 22.5589409, lng: 75.6089374 };
  const baseMaps = createTileLayers();

  // -----------------------------
  // Map Initialization
  // -----------------------------
  useEffect(() => {
    if (mapRef.current || !mapContainerRef.current) return;

    const ZoomView = L.Control.extend({
      onAdd: (map) => {
        const div = L.DomUtil.create(
          "div",
          "leaflet-bar leaflet-control leaflet-control-custom"
        );
        div.style.background = "white";
        div.style.padding = "5px 10px";
        div.style.fontWeight = "bold";
        div.innerHTML = `Zoom: ${map.getZoom()}`;
        zoomDivRef.current = div;
        return div;
      },
    });

    L.control.zoomview = (opts) => new ZoomView(opts);

    const map = L.map(mapContainerRef.current, {
      center: [indiaCenter.lat, indiaCenter.lng],
      zoom: 5,
      layers: [baseMaps.OpenStreet],
      zoomControl: false,
    });

    mapRef.current = map;
    L.control.zoomview({ position: "topleft" }).addTo(map);
    L.control.scale().addTo(map);

    const cluster = L.markerClusterGroup({
      spiderfyOnMaxZoom: true,
      showCoverageOnHover: false,
      zoomToBoundsOnClick: true,
    });
    markerClusterRef.current = cluster;
    map.addLayer(cluster);

    map.on("zoomend", () => {
      if (zoomDivRef.current) {
        zoomDivRef.current.innerHTML = `Zoom: ${map.getZoom()}`;
      }
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // -----------------------------
  // Data Fetching (depends on selectedAccountId from context)
  // -----------------------------
  const fetchMapData = useCallback(() => {
    if (!mapRef.current || !markerClusterRef.current || !selectedAccountId) return;

    setIsRefreshing(true);

    ApiService.getMapViewData(
      {},
      (res) => {
        const data = res?.data?.data;
        if (!data || !Array.isArray(data)) {
          setIsRefreshing(false);
          return;
        }

        const allLatLngs = [];
        const vehicles = [];
        let total = 0,
          inMotion = 0,
          idle = 0,
          stopped = 0,
          locked = 0;

        markerClusterRef.current.clearLayers();
        markerMapRef.current = {};

        data.forEach((v) => {
          const { lat, lng, vehnum, speed, gps, cts, ign, lock, address } = v;
          if (!lat || !lng) return;

          const speedNum = Number(speed) || 0;
          const ignition = (ign || "N").toString().toUpperCase();
          const isLocked = lock === "1" || lock === true;

          let status;
          if (speedNum === 0 && ignition === "N") status = "STOP";
          else if (speedNum > 5 && ignition === "Y") status = "MOTION";
          else if (speedNum < 5) status = "IDLE";
          else status = "IDLE";

          const effectiveStatus = isLocked ? "LOCKED" : status;
          const icon = getIconForStatus(effectiveStatus, isLocked ? "1" : "0");

          const marker = L.marker([lat, lng], { icon });
          marker.bindPopup(
            `<b>${vehnum}</b><br>
             Status: ${getStatusLabel(effectiveStatus, isLocked ? "1" : "0")}<br>
             Speed: ${speedNum} km/h<br>
             Ignition: ${ignition}<br>
             GPS Time: ${cts || gps || "N/A"}<br>
             Address: ${address || "Resolving..."}`
          );

          markerClusterRef.current.addLayer(marker);
          markerMapRef.current[vehnum] = marker;

          allLatLngs.push([lat, lng]);

          total++;
          if (effectiveStatus === "MOTION") inMotion++;
          else if (effectiveStatus === "IDLE") idle++;
          else if (effectiveStatus === "STOP") stopped++;
          if (isLocked) locked++;

          vehicles.push({
            vehnum,
            status: effectiveStatus,
            lock: isLocked ? "1" : "0",
            time: cts || gps || new Date().toLocaleString(),
            location: address || "Location resolving...",
          });
        });

        setVehicleStats({ total, inMotion, idle, stopped, locked });
        setVehicleList(vehicles);
        setIsRefreshing(false);
        setLastRefreshTime(Date.now());

        if (allLatLngs.length > 0) {
          mapRef.current.fitBounds(allLatLngs, { padding: [50, 50] });
        }
      },
      true,
      selectedAccountId
    );
  }, [selectedAccountId]);

  // Re-fetch when account changes
  useEffect(() => {
    fetchMapData();
  }, [fetchMapData]);

  // -----------------------------
  // Handle Vehicle Click
  // -----------------------------
  const handleVehicleClick = (veh) => {
    const marker = markerMapRef.current[veh.vehnum];
    if (!marker || !mapRef.current) return;

    if (highlightedVeh) {
      const oldVeh = vehicleList.find((v) => v.vehnum === highlightedVeh);
      const oldMarker = markerMapRef.current[highlightedVeh];
      if (oldMarker && oldVeh) {
        oldMarker.setIcon(getIconForStatus(oldVeh.status, oldVeh.lock));
      }
    }

    marker.setIcon(truckHighlightIcon);
    setHighlightedVeh(veh.vehnum);

    mapRef.current.flyTo(marker.getLatLng(), 15, { animate: true });
    marker.openPopup();
    setIsSidebarOpen(false);
  };

  // -----------------------------
  // Filtered Vehicles (sidebar)
  // -----------------------------
  const filteredVehicles = useMemo(
    () =>
      vehicleList.filter((veh) => {
        const matchesSearch = veh.vehnum
          .toLowerCase()
          .includes(searchTerm.toLowerCase());
        const matchesFilter =
          filter === "All" ||
          (filter === "Motion" && veh.status === "MOTION") ||
          (filter === "Idle" && veh.status === "IDLE") ||
          (filter === "Stop" && veh.status === "STOP") ||
          (filter === "Lock" && veh.lock === "1");
        return matchesSearch && matchesFilter;
      }),
    [vehicleList, filter, searchTerm]
  );

  // -----------------------------
  // Overlay Panel Style
  // -----------------------------
  const overlayPanelStyle = {
    position: "absolute",
    top: "24px",
    right: "24px",
    zIndex: 1000,
    width: "380px",
    maxWidth: "90vw",
  };

  return (
    <DashboardLayout>
      <DashboardNavbarWithAccountContext
        onManualRefresh={fetchMapData}
        isRefreshing={isRefreshing}
        lastRefreshTime={lastRefreshTime}
      />

      {/* Full-page map container */}
      <MDBox
        sx={{
          position: "relative",
          height: "calc(100vh - 64px)", // adjust if your navbar height is different
          width: "100%",
        }}
      >
        <div
          ref={mapContainerRef}
          style={{
            height: "100%",
            width: "100%",
          }}
        />

        {/* Sidebar overlay */}
        <div style={overlayPanelStyle}>
          <Card
            sx={{
              height: "100%",
              display: "flex",
              flexDirection: "column",
              boxShadow: 6,
            }}
          >
            <MDBox
              p={2}
              borderBottom="1px solid #eee"
              display="flex"
              justifyContent="space-between"
              alignItems="center"
            >
              <MDTypography variant="h6">Vehicle Status</MDTypography>
              <IconButton onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
                <Icon>{isSidebarOpen ? "chevron_right" : "chevron_left"}</Icon>
              </IconButton>
            </MDBox>

            <Collapse in={isSidebarOpen} timeout="auto" unmountOnExit>
              <MDBox p={2} pt={1} flex={1} sx={{ overflow: "auto" }}>
                <MDInput
                  placeholder="Search vehicle..."
                  fullWidth
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  sx={{ mb: 2 }}
                  InputProps={{
                    startAdornment: <Icon sx={{ mr: 1 }}>search</Icon>,
                  }}
                />

                <MDBox display="flex" flexWrap="wrap" gap={1} mb={3}>
                  {["All", "Motion", "Idle", "Stop", "Lock"].map((tab) => (
                    <MDBox
                      key={tab}
                      onClick={() => setFilter(tab)}
                      sx={{
                        px: 2,
                        py: 1,
                        borderRadius: 2,
                        backgroundColor:
                          filter === tab ? "#e3f2fd" : "#f5f5f5",
                        color:
                          filter === tab ? "primary.main" : "text.secondary",
                        fontWeight: "medium",
                        cursor: "pointer",
                        fontSize: "0.875rem",
                        textAlign: "center",
                        flex: "1 1 0",
                        minWidth: "70px",
                      }}
                    >
                      {tab}{" "}
                      <strong>
                        (
                        {
                          {
                            All: vehicleStats.total,
                            Motion: vehicleStats.inMotion,
                            Idle: vehicleStats.idle,
                            Stop: vehicleStats.stopped,
                            Lock: vehicleStats.locked,
                          }[tab]
                        }
                        )
                      </strong>
                    </MDBox>
                  ))}
                </MDBox>

                <MDBox sx={{ maxHeight: "50vh", overflow: "auto" }}>
                  {filteredVehicles.length === 0 ? (
                    <MDTypography
                      variant="body2"
                      color="text.secondary"
                      textAlign="center"
                      py={4}
                    >
                      No vehicles found
                    </MDTypography>
                  ) : (
                    filteredVehicles.map((veh) => (
                      <MDBox
                        key={veh.vehnum}
                        onClick={() => handleVehicleClick(veh)}
                        sx={{
                          position: "relative",
                          p: 2,
                          mb: 1,
                          borderRadius: 2,
                          backgroundColor:
                            highlightedVeh === veh.vehnum
                              ? "#e3f2fd"
                              : "#fafafa",
                          border: `2px solid ${
                            highlightedVeh === veh.vehnum
                              ? "#1976d2"
                              : "transparent"
                          }`,
                          cursor: "pointer",
                          transition: "all 0.2s",
                          "&:hover": { backgroundColor: "#f0f7ff" },
                        }}
                      >
                        <MDBox
                          sx={{
                            position: "absolute",
                            top: 8,
                            right: 8,
                            width: 24,
                            height: 24,
                            borderRadius: "50%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            backgroundColor: "#ffffff",
                            boxShadow: "0 0 0 2px rgba(0,0,0,0.06)",
                          }}
                        >
                          <Icon
                            sx={{
                              fontSize: 16,
                              color: getStatusColor(veh.status, veh.lock),
                            }}
                          >
                            directions_car
                          </Icon>
                        </MDBox>

                        <MDBox
                          display="flex"
                          flexDirection="column"
                          alignItems="flex-start"
                          gap={0.5}
                        >
                          <MDTypography
                            variant="subtitle2"
                            fontWeight="bold"
                            color="text.primary"
                          >
                            {veh.vehnum}
                          </MDTypography>
                        </MDBox>

                        <MDTypography
                          variant="caption"
                          color="text.secondary"
                          mt={1}
                          display="block"
                        >
                          Last updated: {veh.time}
                        </MDTypography>
                      </MDBox>
                    ))
                  )}
                </MDBox>
              </MDBox>
            </Collapse>
          </Card>
        </div>
      </MDBox>
    </DashboardLayout>
  );
};

export default MapView;
