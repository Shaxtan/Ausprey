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
import DashboardNavbar from "../../assets/components/examples/Navbars/DashboardNavbar";

import ApiService from "../../services/ApiService";

// -----------------------------
// Custom Icons (Keep as is)
// -----------------------------
const greenIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});
const redIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});
const yellowIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-yellow.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});
const highlightIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
  iconSize: [30, 50],
  iconAnchor: [15, 50],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const createTileLayers = () => ({
  OpenStreet: L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: "© OpenStreetMap contributors",
  }),
});

// -----------------------------
// Main Component
// -----------------------------
const MapView = () => {
  // --- ACCOUNT & REFRESH STATE ---
  const [selectedAccountId, setSelectedAccountId] = useState("");
  const [accounts, setAccounts] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshTime, setLastRefreshTime] = useState(Date.now());

  // --- MAP & UI STATE ---
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const zoomDivRef = useRef(null);
  const markerClusterRef = useRef(null);
  const markerMapRef = useRef({});
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
  // 1. Initial Load: Accounts & Default ID
  // -----------------------------
  useEffect(() => {
    // Determine default ID from userDetails or fallback to 1
    let defaultId = "1";
    try {
      const user = JSON.parse(localStorage.getItem("userDetails") || "{}");
      if (user.accountId) defaultId = user.accountId.toString();
    } catch (e) {
      console.error("Error parsing userDetails", e);
    }

    ApiService.getAccountDropdown((res) => {
      if (res?.data?.resultCode === 1 && Array.isArray(res.data.data)) {
        setAccounts(res.data.data);
        // Set selected ID to logged-in user's ID if not already set
        setSelectedAccountId(defaultId);
      }
    });
  }, []);

  // -----------------------------
  // 2. Data Fetching Logic (Memoized)
  // -----------------------------
  const fetchMapData = useCallback(() => {
    if (!mapRef.current || !markerClusterRef.current || !selectedAccountId) return;

    setIsRefreshing(true);
    // Passing current selectedAccountId to the API
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
          else status = "IDLE";

          const effectiveStatus = isLocked ? "LOCKED" : status;
          const icon = getIconForStatus(effectiveStatus, isLocked ? "1" : "0");

          const marker = L.marker([lat, lng], { icon });
          marker.bindPopup(
            `<b>${vehnum}</b><br>Status: ${getStatusLabel(
              effectiveStatus,
              isLocked ? "1" : "0"
            )}<br>Speed: ${speedNum} km/h<br>Address: ${address || "Resolving..."}`
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

  // Handle Dropdown Change
  const handleAccountChange = (event) => {
    setSelectedAccountId(event.target.value.toString());
  };

  // -----------------------------
  // Helper Functions (Keep as is)
  // -----------------------------
  const getStatusLabel = (status, lock) => {
    if (lock === "1") return "Locked";
    if (status === "MOTION") return "In Motion";
    if (status === "IDLE") return "Idle";
    if (status === "STOP") return "Stopped";
    return "Unknown";
  };

  const getStatusColor = (status, lock) => {
    if (lock === "1") return "#2196F3";
    if (status === "MOTION") return "#4CAF50";
    if (status === "IDLE") return "#FF9800";
    return "#F44336";
  };

  const getIconForStatus = (status, lock) => {
    if (lock === "1") return highlightIcon;
    if (status === "MOTION") return greenIcon;
    if (status === "IDLE") return yellowIcon;
    return redIcon;
  };

  // -----------------------------
  // Map Initialization (Keep as is)
  // -----------------------------
  useEffect(() => {
    if (mapRef.current || !mapContainerRef.current) return;

    const ZoomView = L.Control.extend({
      onAdd: (map) => {
        const div = L.DomUtil.create("div", "leaflet-bar leaflet-control leaflet-control-custom");
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
    const cluster = L.markerClusterGroup({ spiderfyOnMaxZoom: true, showCoverageOnHover: false });
    markerClusterRef.current = cluster;
    map.addLayer(cluster);

    map.on("zoomend", () => {
      if (zoomDivRef.current) zoomDivRef.current.innerHTML = `Zoom: ${map.getZoom()}`;
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  const handleVehicleClick = (veh) => {
    const marker = markerMapRef.current[veh.vehnum];
    if (!marker || !mapRef.current) return;
    if (highlightedVeh) {
      const oldVeh = vehicleList.find((v) => v.vehnum === highlightedVeh);
      const oldMarker = markerMapRef.current[highlightedVeh];
      if (oldMarker && oldVeh) oldMarker.setIcon(getIconForStatus(oldVeh.status, oldVeh.lock));
    }
    marker.setIcon(highlightIcon);
    setHighlightedVeh(veh.vehnum);
    mapRef.current.flyTo(marker.getLatLng(), 15, { animate: true });
    marker.openPopup();
    setIsSidebarOpen(false);
  };

  const filteredVehicles = useMemo(() => {
    return vehicleList.filter((veh) => {
      const matchesSearch = veh.vehnum.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter =
        filter === "All" ||
        (filter === "Motion" && veh.status === "MOTION") ||
        (filter === "Idle" && veh.status === "IDLE") ||
        (filter === "Stop" && veh.status === "STOP") ||
        (filter === "Lock" && veh.lock === "1");
      return matchesSearch && matchesFilter;
    });
  }, [vehicleList, filter, searchTerm]);

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
      <DashboardNavbar
        selectedAccountId={selectedAccountId}
        accounts={accounts}
        handleAccountChange={handleAccountChange}
        onManualRefresh={fetchMapData}
        isRefreshing={isRefreshing}
        lastRefreshTime={lastRefreshTime}
      />
      <MDBox pt={2} pb={3}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card sx={{ height: "85vh", position: "relative", overflow: "hidden" }}>
              <MDBox p={3} pb={1}>
                <MDTypography variant="h5" fontWeight="medium">
                  Live Vehicle Tracking
                </MDTypography>
              </MDBox>

              <div ref={mapContainerRef} style={{ height: "calc(100% - 70px)", width: "100%" }} />

              <div style={overlayPanelStyle}>
                <Card
                  sx={{ height: "100%", display: "flex", flexDirection: "column", boxShadow: 6 }}
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
                        InputProps={{ startAdornment: <Icon sx={{ mr: 1 }}>search</Icon> }}
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
                              cursor: "pointer",
                              fontSize: "0.875rem",
                              textAlign: "center",
                              flex: "1 1 0",
                              minWidth: "70px",
                              backgroundColor: filter === tab ? "#e3f2fd" : "#f5f5f5",
                              color: filter === tab ? "primary.main" : "text.secondary",
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
                                p: 2,
                                mb: 1,
                                borderRadius: 2,
                                cursor: "pointer",
                                transition: "all 0.2s",
                                backgroundColor:
                                  highlightedVeh === veh.vehnum ? "#e3f2fd" : "#fafafa",
                                border: `2px solid ${
                                  highlightedVeh === veh.vehnum ? "#1976d2" : "transparent"
                                }`,
                                "&:hover": { backgroundColor: "#f0f7ff" },
                              }}
                            >
                              <MDBox
                                display="flex"
                                justifyContent="space-between"
                                alignItems="center"
                              >
                                <MDBox>
                                  <MDTypography variant="subtitle2" fontWeight="bold">
                                    {veh.vehnum}
                                  </MDTypography>
                                  <MDTypography variant="caption" color="text.secondary">
                                    {veh.location}
                                  </MDTypography>
                                </MDBox>
                                <MDBox
                                  sx={{
                                    px: 1.5,
                                    py: 0.5,
                                    borderRadius: 1,
                                    color: "white",
                                    fontSize: "0.75rem",
                                    fontWeight: "bold",
                                    backgroundColor: getStatusColor(veh.status, veh.lock),
                                  }}
                                >
                                  {getStatusLabel(veh.status, veh.lock)}
                                </MDBox>
                              </MDBox>
                            </MDBox>
                          ))
                        )}
                      </MDBox>
                    </MDBox>
                  </Collapse>
                </Card>
              </div>
            </Card>
          </Grid>
        </Grid>
      </MDBox>
    </DashboardLayout>
  );
};

export default MapView;
