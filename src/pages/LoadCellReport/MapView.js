import React, { useEffect, useRef, useState, useMemo } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import "leaflet.markercluster";

import MDBox from "../../assets/components/MDBox";
import MDTypography from "../../assets/components/MDTypography";
import MDInput from "../../assets/components/MDInput"; // For search
import Grid from "@mui/material/Grid";
import Icon from "@mui/material/Icon";
import Card from "@mui/material/Card";
import Collapse from "@mui/material/Collapse";
import IconButton from "@mui/material/IconButton";
import DashboardLayout from "../../assets/components/examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "../../assets/components/examples/Navbars/DashboardNavbar";

import ApiService from "../../services/ApiService";

// -----------------------------
// Custom Icons (Green, Red, Highlight Blue)
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

const highlightIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
  iconSize: [30, 50],
  iconAnchor: [15, 50],
  popupAnchor: [1, -34],
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
// Main Component
// -----------------------------
const MapView = () => {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const zoomDivRef = useRef(null);
  const markerClusterRef = useRef(null);
  const markerMapRef = useRef({}); // vehnum → marker
  const [highlightedVeh, setHighlightedVeh] = useState(null);

  const [vehicleStats, setVehicleStats] = useState({
    total: 0,
    inMotion: 0,
    stopped: 0,
    locked: 0,
  });

  const [vehicleList, setVehicleList] = useState([]);
  const [filter, setFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // Start open like old version

  const indiaCenter = { lat: 22.5589409, lng: 75.6089374 };
  const baseMaps = createTileLayers();

  // -----------------------------
  // Filtered Vehicles
  // -----------------------------
  const filteredVehicles = useMemo(() => {
    return vehicleList.filter((veh) => {
      const matchesSearch = veh.vehnum.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter =
        filter === "All" ||
        (filter === "Motion" && veh.status === "ON") ||
        (filter === "Idle" && veh.status === "OFF" && veh.lock === "0") ||
        (filter === "Stop" && veh.status === "OFF") ||
        (filter === "Lock" && veh.lock === "1");
      return matchesSearch && matchesFilter;
    });
  }, [vehicleList, filter, searchTerm]);

  // -----------------------------
  // Status Label & Badge
  // -----------------------------
  const getStatusLabel = (status, lock) => {
    if (status === "ON") return "In Motion";
    if (lock === "1") return "Locked";
    if (status === "OFF" && lock === "0") return "Idle";
    return "Stopped";
  };

  const getStatusColor = (status, lock) => {
    if (status === "ON") return "#4CAF50";
    if (lock === "1") return "#2196F3";
    return "#F44336";
  };

  // -----------------------------
  // Map Initialization
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
    L.control.scale().addTo(map);

    // Marker Cluster Group
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
  // Load Real Data from API
  // -----------------------------
  useEffect(() => {
    if (!mapRef.current || !markerClusterRef.current) return;

    ApiService.getMapViewData(1, (res) => {
      const data = res?.data?.data;
      if (!data || !Array.isArray(data)) return;

      const allLatLngs = [];
      const vehicles = [];
      let total = 0,
        inMotion = 0,
        stopped = 0,
        locked = 0;

      // Clear previous markers
      markerClusterRef.current.clearLayers();
      markerMapRef.current = {};

      data.forEach((v) => {
        const { lat, lng, vehnum, speed, gps, cts } = v;
        if (!lat || !lng) return;

        const status = speed > 0 ? "ON" : "OFF";
        const lock = "0"; // Adjust if API provides lock status
        const icon = status === "ON" ? greenIcon : redIcon;

        const marker = L.marker([lat, lng], { icon });
        marker.bindPopup(
          `<b>${vehnum}</b><br>Status: ${
            status === "ON" ? "Moving" : "Stopped"
          }<br>Speed: ${speed} km/h<br>GPS Time: ${cts || gps}`
        );

        markerClusterRef.current.addLayer(marker);
        markerMapRef.current[vehnum] = marker;

        allLatLngs.push([lat, lng]);

        total++;
        if (status === "ON") inMotion++;
        else stopped++;
        if (lock === "1") locked++;

        vehicles.push({
          vehnum,
          status,
          lock,
          time: cts || new Date().toLocaleString(),
          location: "Location not available", // Update if API has address
          alert: "Route ID - RD101",
        });
      });

      setVehicleStats({ total, inMotion, stopped, locked });
      setVehicleList(vehicles);

      if (allLatLngs.length > 0) {
        mapRef.current.fitBounds(allLatLngs, { padding: [50, 50] });
      }
    });
  }, []);

  // -----------------------------
  // Handle Vehicle Click (Highlight + Zoom + Close Sidebar)
  // -----------------------------
  const handleVehicleClick = (veh) => {
    const marker = markerMapRef.current[veh.vehnum];
    if (!marker || !mapRef.current) return;

    // Reset previous highlight
    if (highlightedVeh) {
      const old = vehicleList.find((v) => v.vehnum === highlightedVeh);
      const oldMarker = markerMapRef.current[highlightedVeh];
      if (oldMarker && old) {
        oldMarker.setIcon(old.status === "ON" ? greenIcon : redIcon);
      }
    }

    // Highlight new
    marker.setIcon(highlightIcon);
    setHighlightedVeh(veh.vehnum);

    mapRef.current.flyTo(marker.getLatLng(), 15, { animate: true });
    marker.openPopup();

    // Close sidebar on mobile-like experience
    setIsSidebarOpen(false);
  };

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
      <DashboardNavbar />
      <MDBox pt={2} pb={3}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card sx={{ height: "85vh", position: "relative", overflow: "hidden" }}>
              <MDBox p={3} pb={1}>
                <MDTypography variant="h5" fontWeight="medium">
                  Live Vehicle Tracking
                </MDTypography>
              </MDBox>

              {/* Leaflet Map */}
              <div ref={mapContainerRef} style={{ height: "calc(100% - 70px)", width: "100%" }} />

              {/* Overlay Sidebar Panel */}
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
                      {/* Search */}
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

                      {/* Filter Tabs */}
                      <MDBox display="flex" flexWrap="wrap" gap={1} mb={3}>
                        {["All", "Motion", "Idle", "Stop", "Lock"].map((tab) => (
                          <MDBox
                            key={tab}
                            onClick={() => setFilter(tab)}
                            sx={{
                              px: 2,
                              py: 1,
                              borderRadius: 2,
                              backgroundColor: filter === tab ? "#e3f2fd" : "#f5f5f5",
                              color: filter === tab ? "primary.main" : "text.secondary",
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
                                  Idle: vehicleStats.stopped - vehicleStats.locked,
                                  Stop: vehicleStats.stopped,
                                  Lock: vehicleStats.locked,
                                }[tab]
                              }
                              )
                            </strong>
                          </MDBox>
                        ))}
                      </MDBox>

                      {/* Vehicle List */}
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
                                backgroundColor:
                                  highlightedVeh === veh.vehnum ? "#e3f2fd" : "#fafafa",
                                border: `2px solid ${
                                  highlightedVeh === veh.vehnum ? "#1976d2" : "transparent"
                                }`,
                                cursor: "pointer",
                                transition: "all 0.2s",
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
                                    backgroundColor: getStatusColor(veh.status, veh.lock),
                                    color: "white",
                                    fontSize: "0.75rem",
                                    fontWeight: "bold",
                                  }}
                                >
                                  {getStatusLabel(veh.status, veh.lock)}
                                </MDBox>
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
            </Card>
          </Grid>
        </Grid>
      </MDBox>
    </DashboardLayout>
  );
};

export default MapView;
