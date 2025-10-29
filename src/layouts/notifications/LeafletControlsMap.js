// LeafletControlsMap.js - Refactored for Split-Panel Dashboard Design

import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Grid from "@mui/material/Grid"; // ⭐ ADDED Grid for layout

// Material Dashboard 2 React components
import MDBox from "../../components/MDBox/index";
import MDTypography from "../../components/MDTypography/index";
import MDButton from "../../components/MDButton/index";
import MDInput from "../../components/MDInput/index";
import Icon from "@mui/material/Icon";
import { useSnackbar } from "notistack";

// Custom Imports
import { createTileLayers } from "../LoadCellReport/createTileLayers";
// Leaflet Icon fix for marker visibility
import iconUrl from "leaflet/dist/images/marker-icon.png";
import iconRetinaUrl from "leaflet/dist/images/marker-icon-2x.png";
import shadowUrl from "leaflet/dist/images/marker-shadow.png";

// ====================================================================
// ⭐ LEAFLET ICON FIX (CRUCIAL)
// ====================================================================
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: iconRetinaUrl,
  iconUrl: iconUrl,
  shadowUrl: shadowUrl,
});

// ====================================================================
// ⭐ DUMMY DATA AND UTILITY PLACEHOLDERS (KEEP FOR FUNCTIONALITY) ⭐
// ====================================================================

const vehicleList = [
  { id: "V12345", name: "Truck Alpha" },
  { id: "V67890", name: "Car Beta" },
];

const mockTrackData = [
  { ts: "2025-10-27 09:00:00", lat: 22.5589409, lng: 75.6089374, speed: 0, status: "STOP" },
  { ts: "2025-10-27 09:05:00", lat: 22.561, lng: 75.611, speed: 45, status: "MOTION" },
  { ts: "2025-10-27 09:10:00", lat: 22.562, lng: 75.612, speed: 50, status: "MOTION" },
  { ts: "2025-10-27 09:15:00", lat: 22.563, lng: 75.613, speed: 0, status: "IDLE" },
  { ts: "2025-10-27 09:20:00", lat: 22.564, lng: 75.614, speed: 30, status: "MOTION" },
  { ts: "2025-10-27 09:25:00", lat: 22.565, lng: 75.615, speed: 55, status: "MOTION" },
];

const formatTimestamp = (ts) => {
  return new Date(ts).toLocaleTimeString("en-IN", {
    timeZone: "Asia/Kolkata",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
};

const ApiService = {
  getMockData: (url, callback) => {
    setTimeout(() => {
      const processedData = mockTrackData
        .map((p) => ({
          ...p,
          lat: p.lat + (Math.random() - 0.5) * 0.00001,
          lng: p.lng + (Math.random() - 0.5) * 0.00001,
        }))
        .sort((a, b) => new Date(a.ts) - new Date(b.ts));

      callback({
        data: processedData,
        message: "Track data fetched successfully.",
      });
    }, 1500);
  },
};

const exportCSV = (data, filename) =>
  console.log(`Exporting ${data.length} records to ${filename}`);
const exportExcel = (data, filename) =>
  console.log(`Exporting ${data.length} records to ${filename}`);
const exportPDF = (data, filename) =>
  console.log(`Exporting ${data.length} records to ${filename}`);

// ====================================================================
// ⭐ MAIN COMPONENT ⭐
// ====================================================================

const LeafletControlsMap = () => {
  // Map Refs
  const mapRef = useRef(null);
  const zoomDivRef = useRef(null);
  const vehicleLayerRef = useRef(null);
  const pathLayerRef = useRef(null);
  const animatedMarkerRef = useRef(null);
  const animationTimeoutRef = useRef(null);

  // Sidebar Refs and State
  const [selectedVehicle, setSelectedVehicle] = useState(vehicleList[0]);
  const [fromDate, setFromDate] = useState(new Date(Date.now() - 24 * 60 * 60 * 1000));
  const [toDate, setToDate] = useState(new Date());
  const [showHistory, setShowHistory] = useState(false);
  const [statusFilter, setStatusFilter] = useState(["MOTION", "STOP", "IDLE"]);
  const [showDownload, setShowDownload] = useState(false);
  const [downloadFormat, setDownloadFormat] = useState("");
  const [showVehicleHistory, setShowVehicleHistory] = useState(false);
  const [vehicleData, setVehicleData] = useState([]);
  const [highlightedIndex, setHighlightedIndex] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Notifications
  const { enqueueSnackbar } = useSnackbar();
  const callAlert = (message, variant = "error") => {
    enqueueSnackbar(message, { variant });
  };

  const initialCenter = { lat: 22.5589409, lng: 75.6089374 };
  const baseMaps = createTileLayers();

  // Filter data
  const filteredData = vehicleData.filter((rec) => statusFilter.includes(rec.status));

  // ====================================================================
  // ⭐ LEAFLET LOGIC & UTILITY FUNCTIONS ⭐
  // ====================================================================

  const getBearing = (lat1, lon1, lat2, lon2) => {
    // ... (Bearing calculation logic remains the same)
    const rad = Math.PI / 180;
    const dLon = (lon2 - lon1) * rad;
    lat1 = lat1 * rad;
    lat2 = lat2 * rad;
    const y = Math.sin(dLon) * Math.cos(lat2);
    const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);
    let brng = Math.atan2(y, x) / rad;
    brng = (brng + 360) % 360;
    return brng;
  };

  const updateMapLayers = () => {
    const map = mapRef.current;
    if (!map) return;

    // Clear all layers
    vehicleLayerRef.current.clearLayers();
    pathLayerRef.current.clearLayers();
    if (animationTimeoutRef.current) clearTimeout(animationTimeoutRef.current);

    // Draw Path
    const latlngs = filteredData.map((p) => [p.lat, p.lng]).filter((p) => p[0] && p[1]);
    if (latlngs.length > 0) {
      L.polyline(latlngs, { color: "#1A73E8", weight: 4, opacity: 0.7 }).addTo(
        pathLayerRef.current
      );

      // Start/End Markers
      const startIcon = L.divIcon({
        className: "start-point",
        html: '<div style="background:green; width:12px; height:12px; border-radius:50%"></div>',
        iconSize: [12, 12],
      });
      const endIcon = L.divIcon({
        className: "end-point",
        html: '<div style="background:red; width:12px; height:12px; border-radius:50%"></div>',
        iconSize: [12, 12],
      });

      L.marker(latlngs[0], { icon: startIcon }).addTo(pathLayerRef.current);
      L.marker(latlngs[latlngs.length - 1], { icon: endIcon }).addTo(pathLayerRef.current);

      // Fit map to path bounds
      map.fitBounds(pathLayerRef.current.getBounds(), { padding: [50, 50] });

      // Initialize the animated marker at the start point
      const firstPoint = [filteredData[0].lat, filteredData[0].lng];
      const vehicleIcon = new L.Icon({
        iconUrl: "/icons/arrows.png", // Use your vehicle icon path
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });
      const marker = L.marker(firstPoint, { icon: vehicleIcon, rotationAngle: 0 }).addTo(
        vehicleLayerRef.current
      );
      animatedMarkerRef.current = marker;
    }
  };

  const simulateMovement = (index = 0) => {
    if (animationTimeoutRef.current) clearTimeout(animationTimeoutRef.current);

    const data = filteredData;
    if (index >= data.length) {
      callAlert("Track play finished.", "info");
      setHighlightedIndex(null);
      return;
    }

    const { lat, lng } = data[index];
    const map = mapRef.current;
    const marker = animatedMarkerRef.current;
    const nextPoint = data[index + 1];

    if (marker && lat && lng) {
      const currentLatLng = marker.getLatLng();
      const newLatLng = L.latLng(+lat, +lng);

      if (nextPoint) {
        const bearing = getBearing(
          currentLatLng.lat,
          currentLatLng.lng,
          nextPoint.lat,
          nextPoint.lng
        );
        marker.setRotationAngle(bearing);
      }

      marker.setLatLng(newLatLng);
      map.setView(newLatLng, map.getZoom(), { animate: true, duration: 0.1 });
      setHighlightedIndex(index);

      // Set timeout for next movement
      animationTimeoutRef.current = setTimeout(() => {
        simulateMovement(index + 1);
      }, 500); // Animation Speed
    }
  };

  const handleStop = () => {
    if (animationTimeoutRef.current) clearTimeout(animationTimeoutRef.current);
    animationTimeoutRef.current = null;
    setHighlightedIndex(null);

    if (animatedMarkerRef.current && filteredData.length > 0) {
      // Clear and re-add the marker at the start point
      vehicleLayerRef.current.clearLayers();
      const firstPoint = [filteredData[0].lat, filteredData[0].lng];
      const vehicleIcon = new L.Icon({
        iconUrl: "/icons/arrows.png",
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });
      const marker = L.marker(firstPoint, { icon: vehicleIcon, rotationAngle: 0 }).addTo(
        vehicleLayerRef.current
      );
      animatedMarkerRef.current = marker;
      mapRef.current.setView(firstPoint, mapRef.current.getZoom());
    }
  };

  const handleTrackSubmit = async () => {
    if (!selectedVehicle || !fromDate || !toDate) {
      callAlert("Please select a vehicle, 'From' date, and 'To' date.");
      return;
    }
    if (fromDate > toDate) {
      callAlert("'From' date cannot be after 'To' date.");
      return;
    }
    const maxDays = 7;
    const diffDays = (toDate - fromDate) / (1000 * 60 * 60 * 24);
    if (diffDays > maxDays) {
      callAlert(`Please select a date range within ${maxDays} days.`);
      return;
    }

    // Reset state and clear previous data/animation
    setVehicleData([]);
    setShowHistory(false);
    setHighlightedIndex(null);
    handleStop();

    setIsLoading(true);

    try {
      ApiService.getMockData("/trkplyreport.json", (res) => {
        setVehicleData(res.data);
        setShowHistory(true);
        callAlert("Track data loaded. Click 'Track Play' to start.", "success");
      });
    } catch (err) {
      console.error("Error loading track data:", err);
      callAlert("Failed to load track data.");
    } finally {
      setTimeout(() => setIsLoading(false), 1500); // Simulate loading end
    }
  };

  // Effect for map layer update (runs when filters change)
  useEffect(() => {
    if (showHistory) {
      updateMapLayers();
    }
  }, [statusFilter, showHistory, vehicleData]);

  // Effect for map initialization (runs once)
  useEffect(() => {
    if (mapRef.current) return;

    // Custom Zoom Control Definition
    const ZoomView = L.Control.extend({
      onAdd: function (map) {
        const div = L.DomUtil.create("div", "leaflet-zoom-control leaflet-bar-part leaflet-bar");
        div.innerHTML = "Zoom: " + map.getZoom();
        zoomDivRef.current = div;
        return div;
      },
      onRemove: function () {},
    });
    L.control.zoomview = (opts) => new ZoomView(opts);

    // Map Initialization
    const map = L.map("leaflet-map-container", {
      center: [initialCenter.lat, initialCenter.lng],
      zoom: 4,
      maxBounds: [
        [-90, -180],
        [90, 180],
      ],
      layers: [baseMaps["OpenStreet"]],
      zoomControl: false, // Disable default zoom control
    });

    mapRef.current = map;
    vehicleLayerRef.current = L.layerGroup().addTo(map);
    pathLayerRef.current = L.layerGroup().addTo(map);

    // Add Controls
    L.control.zoomview({ position: "topleft" }).addTo(map);
    L.control.layers(baseMaps, {}, { position: "topleft" }).addTo(map);
    L.control.scale().addTo(map);

    // Event Listener
    map.on("zoomend", () => {
      if (zoomDivRef.current) {
        zoomDivRef.current.innerHTML = "Zoom: " + map.getZoom();
      }
    });

    // Cleanup
    return () => {
      if (animationTimeoutRef.current) clearTimeout(animationTimeoutRef.current);
      if (mapRef.current) {
        map.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // ====================================================================
  // ⭐ JSX RENDER (SPLIT-PANEL LAYOUT) ⭐
  // ====================================================================

  return (
    // Outer container for the split view
    <MDBox
      // minHeight="50vh" // Keep as comment if you like
      width="100%"
      sx={{
        // --- Existing Styles ---
        borderRadius: "0.75rem",
        overflow: "hidden",
        // You can remove border/shadow as suggested in my previous answer for a cleaner look
        border: "1px solid #ddd",
        boxShadow: "0 4px 6px rgba(0,0,0,0.05)",

        // --- GAP FIX AND MOVE UP ---
        // ⭐ FIX 1: Use negative margin to pull the container up, overriding parent padding/margin.
        // Adjust the '-24px' value based on the size of the gap you see.
        // The '!important' is used to forcefully override other styles, as requested.
        marginTop: `-104px !important`,

        // ⭐ FIX 2: Height Adjustment
        // If your goal is to fill the remaining viewport height under the navbar:
        // This value is usually 'calc(100vh - [Navbar Height] - [Padding])'.
        // A common dashboard layout has a navbar (~70px) and page padding (~20px).
        height: `calc(100vh - 90px)`, // Using 90px as a reliable starting point

        // ⭐ FIX 3: Fixed Typo and Formatting
        // Fix: marginBotton was misspelled and the value was invalid.
        // If you need bottom margin, use `marginBottom`. If you don't, remove it.
        marginBottom: "50px", // Example: Adding proper bottom margin
      }}
    >
      {/* ⭐ FIX 2: Set Grid container height to 100% of the parent MDBox */}
      <Grid container spacing={0} sx={{ height: "100%" }}>
        {/* Column 1: Control Panel (Fixed Width) */}
        <Grid item xs={12} sm={12} md={4} lg={3} xl={3}>
          <MDBox
            bgColor="white"
            p={3}
            sx={{
              // Set height to 100% of the Grid item's height
              height: "100%",
              // This is the key for internal scrolling of the control panel
              overflowY: "auto",
              borderRight: "1px solid #eee",
              // DatePicker styling fix
              "& .react-datepicker-wrapper, & .react-datepicker__input-container, & .form-control":
                {
                  width: "100%",
                  boxSizing: "border-box",
                  display: "block",
                },
              "& .form-control": {
                padding: "8px 10px",
                border: "1px solid #d2d6da",
                borderRadius: "0.5rem",
                fontSize: "14px",
                color: "#344767",
                transition: "border-color 0.3s",
                "&:focus": { borderColor: "#1A73E8", outline: "none" },
              },
            }}
          >
            <MDTypography variant="h6" mb={2} color="info">
              Track Play Controls
            </MDTypography>

            {/* Select Vehicle */}
            <MDTypography variant="button" fontWeight="medium" mb={0.5} display="block">
              Select Vehicle
            </MDTypography>
            <MDBox mb={2}>
              <MDInput
                select
                value={selectedVehicle?.id || ""}
                onChange={(e) => {
                  setSelectedVehicle(vehicleList.find((v) => v.id === e.target.value));
                  setShowHistory(false);
                }}
                fullWidth
                size="small"
                inputProps={{ native: true }}
              >
                {vehicleList.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name} ({v.id})
                  </option>
                ))}
              </MDInput>
            </MDBox>

            {/* Date/Time Range */}
            <MDTypography variant="button" fontWeight="medium" mb={0.5} display="block">
              📅 Select Date/Time Range
            </MDTypography>
            <MDBox mb={2}>
              <DatePicker
                selected={fromDate}
                onChange={(date) => {
                  setFromDate(date);
                  setShowHistory(false);
                }}
                showTimeSelect
                dateFormat="dd/MM/yyyy HH:mm:ss"
                placeholderText="From Date/Time"
                className="form-control"
              />
            </MDBox>
            <MDBox mb={2}>
              <DatePicker
                selected={toDate}
                onChange={(date) => {
                  setToDate(date);
                  setShowHistory(false);
                }}
                showTimeSelect
                dateFormat="dd/MM/yyyy HH:mm:ss"
                placeholderText="To Date/Time"
                className="form-control"
              />
            </MDBox>

            {/* Submit Button */}
            <MDButton
              variant="gradient"
              color="primary"
              fullWidth
              onClick={handleTrackSubmit}
              disabled={isLoading}
              sx={{ mb: 3, py: 1.2 }}
            >
              {isLoading ? (
                "Loading Track..."
              ) : (
                <>
                  <Icon sx={{ mr: 1 }}>search</Icon> Get Track Data
                </>
              )}
            </MDButton>

            {/* Status Filter and Playback Controls (Conditional) */}
            {showHistory && (
              <>
                <MDTypography
                  variant="button"
                  fontWeight="medium"
                  color="dark"
                  mb={1}
                  display="block"
                >
                  Filter Status:
                </MDTypography>
                <MDBox mb={2} display="flex" justifyContent="space-around" flexWrap="wrap">
                  {["MOTION", "STOP", "IDLE"].map((type) => {
                    const isChecked = statusFilter.includes(type);
                    return (
                      <MDBox
                        key={type}
                        display="flex"
                        flexDirection="column"
                        alignItems="center"
                        width="30%"
                      >
                        <MDTypography variant="caption" fontWeight="regular" color="dark" mb={0.5}>
                          {type}
                        </MDTypography>
                        {/* Toggle Switch */}
                        <MDBox
                          component="label"
                          sx={{
                            position: "relative",
                            display: "inline-block",
                            width: "40px",
                            height: "22px",
                            background: isChecked ? "#5fdd54" : "#ccc",
                            borderRadius: "11px",
                            transition: "0.4s",
                            cursor: "pointer",
                            "&:after": {
                              content: '""',
                              position: "absolute",
                              height: "18px",
                              width: "18px",
                              borderRadius: "50%",
                              left: isChecked ? "20px" : "2px",
                              top: "2px",
                              backgroundColor: ({ palette: { white } }) => white.main,
                              boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                              transition: "0.4s",
                            },
                          }}
                          onClick={() => {
                            setHighlightedIndex(null);
                            setStatusFilter((prev) =>
                              prev.includes(type) ? prev.filter((s) => s !== type) : [...prev, type]
                            );
                          }}
                        />
                      </MDBox>
                    );
                  })}
                </MDBox>

                {/* Playback Buttons */}
                <MDBox display="flex" gap={1} mb={3}>
                  <MDButton
                    variant="gradient"
                    color="success"
                    onClick={() => simulateMovement(0)}
                    disabled={filteredData.length === 0}
                    sx={{ flex: 1, py: 1 }}
                  >
                    <Icon sx={{ mr: 0.5 }}>play_arrow</Icon> Play
                  </MDButton>
                  <MDButton
                    variant="gradient"
                    color="error"
                    onClick={handleStop}
                    disabled={filteredData.length === 0}
                    sx={{ flex: 1, py: 1 }}
                  >
                    <Icon sx={{ mr: 0.5 }}>stop</Icon> Stop
                  </MDButton>
                </MDBox>

                {/* History and Download Toggles */}
                <MDTypography
                  variant="button"
                  color="info"
                  fontWeight="medium"
                  onClick={() => setShowVehicleHistory(!showVehicleHistory)}
                  sx={{ cursor: "pointer", mb: 1, display: "block" }}
                >
                  <Icon sx={{ mr: 0.5, verticalAlign: "middle" }}>
                    {showVehicleHistory ? "arrow_drop_up" : "arrow_drop_down"}
                  </Icon>{" "}
                  View History ({filteredData.length})
                </MDTypography>

                {/* Vehicle History List */}
                {showVehicleHistory && (
                  <MDBox
                    component="ul"
                    bgColor="grey-100"
                    p={1}
                    borderRadius="md"
                    sx={{
                      listStyle: "none",
                      m: 0,
                      maxHeight: "120px",
                      overflowY: "auto", // Scrollable list within the scrollable panel
                      boxShadow: "inset 0 1px 3px rgba(0,0,0,0.1)",
                    }}
                  >
                    {filteredData.map((rec, idx) => (
                      <MDBox
                        component="li"
                        key={idx}
                        p={0.5}
                        sx={{
                          backgroundColor: idx === highlightedIndex ? "#e0f2f1" : "transparent", // Light teal highlight
                          cursor: "pointer",
                          fontWeight: idx === highlightedIndex ? "600" : "400",
                          "&:hover": { backgroundColor: "#f0f0f0" },
                          borderRadius: "4px",
                        }}
                        onClick={() => {
                          setHighlightedIndex(idx);
                          if (rec.lat && rec.lng) {
                            mapRef.current.setView([+rec.lat, +rec.lng], 16, { animate: true });
                          }
                        }}
                      >
                        <MDTypography variant="caption" color="dark" display="block">
                          <Icon
                            sx={{
                              fontSize: "12px !important",
                              verticalAlign: "text-bottom",
                              mr: 0.5,
                            }}
                          >
                            access_time
                          </Icon>
                          {formatTimestamp(rec.ts)} — {rec.status} @{" "}
                          <strong>{rec.speed ?? "N/A"} km/h</strong>
                        </MDTypography>
                      </MDBox>
                    ))}
                  </MDBox>
                )}

                {/* Download Report Section */}
                <MDTypography
                  variant="button"
                  color="info"
                  fontWeight="medium"
                  onClick={() => setShowDownload(!showDownload)}
                  sx={{ cursor: "pointer", mt: 2, mb: 1, display: "block" }}
                >
                  <Icon sx={{ mr: 0.5, verticalAlign: "middle" }}>
                    {showDownload ? "arrow_drop_up" : "arrow_drop_down"}
                  </Icon>{" "}
                  Download Report
                </MDTypography>

                {showDownload && (
                  <MDBox p={1} borderRadius="md" sx={{ border: "1px dashed #ddd" }}>
                    <MDInput
                      select
                      id="formatSelect"
                      value={downloadFormat}
                      onChange={(e) => setDownloadFormat(e.target.value)}
                      fullWidth
                      size="small"
                      sx={{ mb: 1.5 }}
                      inputProps={{ native: true }}
                    >
                      <option value="">-- Select Format --</option>
                      <option value="csv">CSV</option>
                      <option value="excel">Excel</option>
                      <option value="pdf">PDF</option>
                    </MDInput>

                    <MDButton
                      variant="gradient"
                      color="secondary"
                      fullWidth
                      disabled={!downloadFormat}
                      onClick={() => {
                        const filename = `report_${selectedVehicle.id}_${new Date().getTime()}`;
                        if (downloadFormat === "csv") exportCSV(filteredData, `${filename}.csv`);
                        else if (downloadFormat === "excel")
                          exportExcel(filteredData, `${filename}.xlsx`);
                        else if (downloadFormat === "pdf")
                          exportPDF(filteredData, `${filename}.pdf`);
                        callAlert(`Exported to ${downloadFormat}`, "success");
                        setShowDownload(false);
                      }}
                      sx={{ py: 0.8 }}
                    >
                      Generate & Download
                    </MDButton>
                  </MDBox>
                )}
              </>
            )}
          </MDBox>
        </Grid>

        {/* Column 2: Map Container (Fluid Width) */}
        <Grid item xs={12} sm={12} md={8} lg={9} xl={9}>
          <div
            id="leaflet-map-container"
            style={{ height: "100%", width: "100%", zIndex: 0 }}
          ></div>
        </Grid>
      </Grid>
    </MDBox>
  );
};

export default LeafletControlsMap;
