import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css"; // Don't forget the CSS!

import TextField from "@mui/material/TextField"; // The replacement input
import Grid from "@mui/material/Grid";

import React, { useEffect, useRef, useState, useMemo, useCallback } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-polylinedecorator";
// <<<<<<< HEAD
// import ApiService from "../../services/ApiService"; // ⭐ The API Service
import { createTileLayers } from "../../pages/LoadCellReport/createTileLayers"; // Assuming path is correct
// import DatePicker from "react-datepicker";
// =======
import "leaflet-rotatedmarker";
import "leaflet-geometryutil"; // npm install leaflet-geometryutil
import simplify from "simplify-js";

import ApiService from "../../services/ApiService";
// import { createTileLayers } from "../LoadCellReport/createTileLayers";
// import DatePicker from "react-datepicker";
// >>>>>>> 191ac6946e434fd06cac94e17eadc667aa63035e
import "react-datepicker/dist/react-datepicker.css";
import { format, formatISO } from "date-fns";

import { exportCSV, exportExcel, exportPDF } from "./../utils/downloadUtils";
import { AlertSuccess, callAlert, callAlertConfirm } from "../../services/CommonService";

/* MUI components (used inside the panel) */
import MDBox from "../../assets/components/MDBox";
import MDTypography from "../../assets/components/MDTypography";
import MDButton from "../../assets/components/MDButton";
import MDInput from "../../assets/components/MDInput";
import Icon from "@mui/material/Icon";

/* -------------------------------------------------
   ICON FIX – default Leaflet marker
------------------------------------------------- */
import iconUrl from "leaflet/dist/images/marker-icon.png";
import iconRetinaUrl from "leaflet/dist/images/marker-icon-2x.png";
import shadowUrl from "leaflet/dist/images/marker-shadow.png";
if (L.Icon.Default.prototype._getIconUrl) {
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl,
    iconUrl,
    shadowUrl,
  });
}

/* -------------------------------------------------
   HELPER FUNCTIONS
------------------------------------------------- */
const formatTimestamp = (input) => {
  const d = new Date(input);
  if (isNaN(d)) return input;
  const pad = (n) => String(n).padStart(2, "0");
  return `${pad(d.getDate())}-${pad(d.getMonth() + 1)}-${d.getFullYear()} ${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
};

/* -------------------------------------------------
   COMPONENT
------------------------------------------------- */
const LeafletControlsMap = () => {
  /* ---------- refs ---------- */
  const mapRef = useRef(null);
  const vehicleLayerRef = useRef(null);
  const zoomDivRef = useRef(null);
  const animatedMarkerRef = useRef(null);
  const animationTimeoutRef = useRef(null);
  const panelRef = useRef(null);
  const originalPathRef = useRef({ line: null, decorator: null, points: [] }); // NEW: Store full path
  // NEW REF: To store the time offset when paused.
  const pauseTimeRef = useRef(0);

  /* ---------- state ---------- */
  const [isPanelVisible, setIsPanelVisible] = useState(true);
  const [vehicleList, setVehicleList] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [showHistory, setShowHistory] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [vehicleData, setVehicleData] = useState([]);
  const [highlightedIndex, setHighlightedIndex] = useState(null);
  const [statusFilter, setStatusFilter] = useState([]);
  const [showOnlyPath, setShowOnlyPath] = useState(false);
  const [showDownload, setShowDownload] = useState(false);
  const [showVehicleHistory, setShowVehicleHistory] = useState(false);
  const [downloadFormat, setDownloadFormat] = useState("");
  const [speed] = useState(50); // animation speed (ms)
  const [fromMilliseconds, setFromMilliseconds] = useState("000");
  const [toMilliseconds, setToMilliseconds] = useState("000");
  // NEW STATE: Tracks if the animation is paused.
  const [isPaused, setIsPaused] = useState(false);

  const SIDEBAR_WIDTH = "300px";

  /* ---------- fetch vehicle list (IMEI) ---------- */
  /* ---------- fetch vehicle list (IMEI) ---------- */
  useEffect(() => {
    const fetchVehicles = async () => {
      setIsLoading(true);
      try {
        const res = await ApiService.getImeiDropdown(1, true);
        const vehicles = res?.data?.response?.vehicles || [];

        const options = vehicles.map((v) => ({
          value: v.imei,
          label: `${v.imei} (${v.vehnum})`,
        }));

        const sorted = options.sort((a, b) => a.label.localeCompare(b.label));
        setVehicleList(sorted);
      } catch (err) {
        console.error("Failed to load IMEI dropdown:", err);
        callAlert("Failed to load vehicle list.");

        const fallback = { value: "868373076396961", label: "868373076396961" };
        setVehicleList([fallback]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchVehicles();
  }, []);

  /* ---------- filtered data (date + status) ---------- */
  const filteredData = useMemo(() => {
    const from = fromDate ? new Date(fromDate) : null;
    const to = toDate ? new Date(toDate) : null;

    return vehicleData.filter((r) => {
      const ts = new Date(r.ts).getTime();
      const dateOk = (!from || ts >= from.getTime()) && (!to || ts <= to.getTime());
      const statusOk = statusFilter.includes(r.status);
      return dateOk && statusOk;
    });
  }, [vehicleData, fromDate, toDate, statusFilter]);
  /* ---------- FULL STOP (used on form submit) ---------- */
  const fullStopAnimation = useCallback(() => {
    if (animationTimeoutRef.current) {
      cancelAnimationFrame(animationTimeoutRef.current);
      animationTimeoutRef.current = null;
    }
    if (animatedMarkerRef.current) {
      animatedMarkerRef.current.remove();
      animatedMarkerRef.current = null;
    }
    pauseTimeRef.current = 0; // Reset time offset
    setIsPaused(false); // Reset pause state
    setHighlightedIndex(null);
  }, []);

  // const filteredData = useMemo(() => {
  //   return vehicleData.filter((r) => {
  //     const ts = new Date(r.ts).getTime();
  //     const dateOk = (!fromDate || ts >= fromDate.getTime()) && (!toDate || ts <= toDate.getTime());
  //     const statusOk = statusFilter.includes(r.status);
  //     return dateOk && statusOk;
  //   });
  // }, [vehicleData, fromDate, toDate, statusFilter]);

  /* ---------- submit – call getTrackPlayHistory ---------- */
  const handleTrackSubmit = async () => {
    if (!selectedVehicle?.value) return callAlert("Please select a vehicle.");
    if (!fromDate || !toDate) return callAlert("Please select both From and To dates.");
    if (fromDate > toDate) return callAlert("'From' date cannot be after 'To' date.");

    setIsLoading(true);
    setShowHistory(false);
    setVehicleData([]);
    setHighlightedIndex(null);
    setShowOnlyPath(false);
    setStatusFilter(["MOTION", "STOP", "IDLE"]);
    // Stop and clean up any ongoing animation
    fullStopAnimation();
    if (vehicleLayerRef.current) vehicleLayerRef.current.clearLayers();

    if (originalPathRef.current.line) {
      originalPathRef.current.line.remove();
      originalPathRef.current.decorator?.remove();
      originalPathRef.current = { line: null, decorator: null, points: [] };
    }

    try {
      const payload = {
        imei: selectedVehicle.value, // ← Use .value
        startTime: formatISO(fromDate),
        endTime: formatISO(toDate),
      };
      const res = await ApiService.getTrackPlayHistory(payload);
      const report = res?.data?.response?.report || [];

      if (!report.length) {
        callAlert("No track data found for the selected period.", "info");
        return;
      }

      const sorted = report.sort((a, b) => new Date(a.ts) - new Date(b.ts));
      setVehicleData(sorted);
      setShowHistory(true);
      // AlertSuccess(`Loaded ${sorted.length} points.`);
    } catch (err) {
      console.error(err);
      callAlert("Failed to load track data.");
    } finally {
      setIsLoading(false);
    }
  };

  /* ---------- animation (track play) – uses full original path ---------- */
  // Inside the component:

  // Renamed simulateMovement to startAnimation for clarity
  const startAnimation = useCallback(() => {
    const map = mapRef.current;
    const layer = vehicleLayerRef.current;

    // Check if the path data is ready
    if (!map || !originalPathRef.current.line || vehicleData.length < 2) {
      return callAlert("Track data not ready or insufficient points for animation.", "warning");
    }

    // If currently animating, do nothing (or explicitly handle resume/restart logic)
    if (animationTimeoutRef.current && !isPaused) return;

    // Stop any existing animation frame request (but keep marker and path if paused)
    if (animationTimeoutRef.current) {
      cancelAnimationFrame(animationTimeoutRef.current);
      animationTimeoutRef.current = null;
    }

    // Resume logic: Clear the pause state
    setIsPaused(false);

    layer.clearLayers();
    originalPathRef.current.line.addTo(layer);
    originalPathRef.current.decorator?.addTo(layer);

    const polyline = originalPathRef.current.line;
    const points = vehicleData;
    let startTime = null;
    const totalDuration = 30000; // 30 seconds total animation (adjustable)

    // Determine the starting progress (0 if new, based on pauseTimeRef if resuming)
    const initialProgress = pauseTimeRef.current / totalDuration;

    let marker = animatedMarkerRef.current;

    // Initialize marker if it doesn't exist (i.e., new animation)
    if (!marker) {
      // Calculate initial position based on initialProgress
      const initialPosition = L.GeometryUtil.interpolateOnLine(map, polyline, initialProgress);

      marker = L.marker(initialPosition.latLng, {
        icon: L.icon({
          iconUrl: "/iconss/vehiclemarker.png",
          iconSize: [32, 32],
          iconAnchor: [16, 16],
        }),
        rotationAngle: 0,
        rotationOrigin: "center center",
      }).addTo(layer);

      animatedMarkerRef.current = marker;
    } else {
      // If marker exists (i.e., resuming), just ensure it's on the layer
      marker.addTo(layer);
    }

    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;

      // Elapsed time is the current time minus the start time, plus the pause offset
      const elapsed = timestamp - startTime + pauseTimeRef.current;
      const progress = Math.min(elapsed / totalDuration, 1);

      const position = L.GeometryUtil.interpolateOnLine(map, polyline, progress);
      marker.setLatLng(position.latLng); // Update rotation

      if (position.predecessor) {
        const bearing = L.GeometryUtil.bearing(position.predecessor, position.latLng);
        marker.setRotationAngle(bearing);
      } // Update highlighted index

      const pointIndex = Math.floor(progress * (points.length - 1));
      setHighlightedIndex(pointIndex);

      if (progress < 1) {
        animationTimeoutRef.current = requestAnimationFrame(animate);
      } else {
        callAlert("Track play finished.", "info");
        fullStopAnimation(); // Call the unified stop function
      }
    };

    animationTimeoutRef.current = requestAnimationFrame(animate);
  }, [vehicleData, isPaused, fullStopAnimation]); // Added fullStopAnimation dependency

  /* ---------- PAUSE / RESUME logic ---------- */
  const togglePlayPause = () => {
    // If animation is running (animationTimeoutRef.current is set and not paused)
    if (animationTimeoutRef.current && !isPaused) {
      // PAUSE
      cancelAnimationFrame(animationTimeoutRef.current);
      animationTimeoutRef.current = null;
      setIsPaused(true);
      // Crucially, calculate the current progress time to resume from
      // We use the current highlighted index to approximate the time elapsed,
      // or a more accurate position calculation if needed.
      if (highlightedIndex !== null && vehicleData.length > 0) {
        // Simplified time update based on index (index / total_indices * total_duration)
        const totalDuration = 30000;
        pauseTimeRef.current = (highlightedIndex / (vehicleData.length - 1)) * totalDuration;
      }
      // callAlertConfirm("Animation paused.", "info");
    } else if (isPaused) {
      // RESUME
      // The marker is already on the map, and pauseTimeRef.current holds the offset
      startAnimation();
      // callAlert("Animation resumed.", "info");
    } else {
      // START NEW PLAYBACK
      pauseTimeRef.current = 0; // Reset offset to 0 for a new run
      startAnimation();
    }
  }; /* ---------- marker icons ---------- */

  const redIcon = useMemo(
    () =>
      new L.Icon({
        iconUrl:
          "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
        shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
      }),
    []
  );
  const greenIcon = useMemo(
    () =>
      new L.Icon({
        iconUrl:
          "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png",
        shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
      }),
    []
  );
  const yellowIcon = useMemo(
    () =>
      new L.Icon({
        iconUrl:
          "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-yellow.png",
        shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
      }),
    []
  );
  const blueIcon = useMemo(
    () =>
      new L.Icon({
        iconUrl:
          "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png",
        shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
      }),
    []
  );
  const startIcon = useMemo(
    () =>
      L.divIcon({
        html: `<div style="background:#4caf50;color:white;padding:4px 8px;border-radius:12px;font-size:12px;font-weight:bold;box-shadow:0 2px 6px rgba(0,0,0,0.3);">START</div>`,
        className: "custom-start-marker",
        iconSize: [70, 30],
        iconAnchor: [35, 30],
      }),
    []
  );

  const endIcon = useMemo(
    () =>
      L.divIcon({
        html: `<div style="background:#f44336;color:white;padding:4px 8px;border-radius:12px;font-size:12px;font-weight:bold;box-shadow:0 2px 6px rgba(0,0,0,0.3);">END</div>`,
        className: "custom-end-marker",
        iconSize: [60, 30],
        iconAnchor: [30, 30],
      }),
    []
  );

  /* ---------- map init (once) ---------- */
  useEffect(() => {
    if (mapRef.current) return;

    const indiaCenter = { lat: 22.5589409, lng: 75.6089374 };
    const baseMaps = createTileLayers();

    const ZoomView = L.Control.extend({
      onAdd: (m) => {
        const div = L.DomUtil.create("div", "leaflet-bar leaflet-control");
        div.style.padding = "5px";
        div.innerHTML = `Zoom: ${m.getZoom()}`;
        zoomDivRef.current = div;
        return div;
      },
    });
    L.control.zoomview = (opts) => new ZoomView(opts);

    const map = L.map("mapCanvas", {
      center: [indiaCenter.lat, indiaCenter.lng],
      zoom: 5,
      layers: [baseMaps["OpenStreet"]],
      zoomControl: false,
      dragging: true,
      scrollWheelZoom: true,
      doubleClickZoom: false,
      boxZoom: false,
      keyboard: false,
      touchZoom: false,
    });
    mapRef.current = map;
    vehicleLayerRef.current = L.layerGroup().addTo(map);

    /* ---- layer switcher ---- */
    let currentLayer = baseMaps["OpenStreet"];
    const makeBtn = (icon, title, switchFn) => {
      const btn = L.DomUtil.create("button", "", null);
      btn.innerHTML = `<img src="${icon}" alt="${title}" title="${title}" style="width:24px;height:24px"/>`;
      btn.style.cssText = "background:none;border:none;cursor:pointer;margin:0 2px;";
      btn.onclick = switchFn;
      return btn;
    };
    const switchTo = (name) => {
      const layer = baseMaps[name];
      if (!layer) return;
      if (currentLayer && map.hasLayer(currentLayer)) map.removeLayer(currentLayer);
      layer.addTo(map);
      currentLayer = layer;
    };
    const container = L.DomUtil.create("div", "leaflet-control-custom-container");
    container.style.cssText =
      "display:flex;gap:8px;background:#fff;padding:4px 8px;border-radius:8px;box-shadow:0 2px 6px rgba(0,0,0,0.2);margin-bottom:20px;";
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
    map.addControl(
      new (L.Control.extend({
        onAdd: () => container,
      }))({ position: "topright" })
    );

    /* ---- custom zoom buttons ---- */
    const zoomPanel = L.DomUtil.create("div", "custom-zoom-panel");
    zoomPanel.style.cssText =
      "display:flex;flex-direction:column;align-items:center;background:#fff;border-radius:8px;padding:6px;box-shadow:0 2px 6px rgba(0,0,0,0.2);";
    const zoomIn = L.DomUtil.create("button", "", zoomPanel);
    zoomIn.innerHTML = `<img src="https://cdn-icons-png.flaticon.com/512/992/992651.png" style="width:20px;height:20px"/>`;
    Object.assign(zoomIn.style, {
      background: "none",
      border: "none",
      cursor: "pointer",
      padding: "4px",
      marginBottom: "6px",
    });
    zoomIn.onclick = () => map.zoomIn();
    const zoomOut = L.DomUtil.create("button", "", zoomPanel);
    zoomOut.innerHTML = `<img src="https://cdn-icons-png.flaticon.com/512/992/992683.png" style="width:20px;height:20px"/>`;
    Object.assign(zoomOut.style, {
      background: "none",
      border: "none",
      cursor: "pointer",
      padding: "4px",
    });
    zoomOut.onclick = () => map.zoomOut();
    map.addControl(
      new (L.Control.extend({
        onAdd: () => zoomPanel,
      }))({ position: "topright" })
    );

    L.control.zoomview({ position: "topleft" }).addTo(map);
    L.control.scale().addTo(map);
    map.on("zoomend", () => {
      if (zoomDivRef.current) zoomDivRef.current.innerHTML = `Zoom: ${map.getZoom()}`;
    });

    // Cleanup on unmount
    return () => {
      fullStopAnimation(); // Ensures animation is stopped
      map.remove();
    };
  }, [fullStopAnimation]); // Added fullStopAnimation dependency

  /* Draw Path + Markers */
  useEffect(() => {
    const map = mapRef.current;
    const layer = vehicleLayerRef.current;
    if (!map || !layer || !showHistory || !selectedVehicle) return;

    const isAnimationActive = animationTimeoutRef.current || isPaused;

    if (!isAnimationActive) layer.clearLayers();
    else {
      layer.clearLayers();
      animatedMarkerRef.current?.addTo(layer);
      originalPathRef.current.line?.addTo(layer);
      originalPathRef.current.decorator?.addTo(layer);
      originalPathRef.current.startMarker?.addTo(layer);
      originalPathRef.current.endMarker?.addTo(layer);
    }

    if (vehicleData.length === 0) return;

    if (!originalPathRef.current.line) {
      let points = vehicleData
        .map((r) => ({ x: +r.lng, y: +r.lat, data: r }))
        .filter(
          (p) => !isNaN(p.x) && !isNaN(p.y) && p.y >= -90 && p.y <= 90 && p.x >= -180 && p.x <= 180
        );

      points = points.filter(
        (p, i, arr) => i === 0 || p.x !== arr[i - 1].x || p.y !== arr[i - 1].y
      );
      if (points.length < 2) return;

      const tolerance =
        points.length > 10000
          ? 0.001
          : points.length > 5000
            ? 0.0005
            : points.length > 1000
              ? 0.0002
              : 0.0001;
      const simplified = simplify(points, tolerance, true);
      const latLngs = simplified.map((p) => [p.y, p.x]);

      const line = L.polyline(latLngs, { color: "#3388ff", weight: 4, opacity: 0.85 }).addTo(layer);
      const decorator = L.polylineDecorator(line, {
        patterns: [
          {
            offset: "8%",
            repeat: "15%",
            symbol: L.Symbol.arrowHead({
              pixelSize: 12,
              headAngle: 60,
              polygon: false,
              pathOptions: { color: "#3388ff", weight: 3 },
            }),
          },
        ],
      }).addTo(layer);

      // Start Marker
      const startLatLng = latLngs[0];
      const startMarker = L.marker(startLatLng, { icon: startIcon })
        // .bindTooltip("Start Point", { permanent: true, direction: "top", offset: [0, -10] })
        .addTo(layer);

      // End Marker
      const endLatLng = latLngs[latLngs.length - 1];
      const endMarker = L.marker(endLatLng, { icon: endIcon })
        // .bindTooltip("End Point", { permanent: true, direction: "top", offset: [0, -10] })
        .addTo(layer);

      originalPathRef.current = {
        line,
        decorator,
        points: simplified.map((p) => L.latLng(p.y, p.x)),
        startMarker,
        endMarker,
      };

      map.fitBounds(line.getBounds(), { padding: [50, 50] });
    } else if (!isAnimationActive) {
      originalPathRef.current.line.addTo(layer);
      originalPathRef.current.decorator?.addTo(layer);
      originalPathRef.current.startMarker?.addTo(layer);
      originalPathRef.current.endMarker?.addTo(layer);
      map.fitBounds(originalPathRef.current.line.getBounds(), { padding: [50, 50] });
    }

    if (!isAnimationActive) {
      filteredData.forEach((rec) => {
        if (!rec.lat || !rec.lng) return;
        const icon =
          rec.status === "MOTION" ? greenIcon : rec.status === "STOP" ? redIcon : yellowIcon;
        L.marker([+rec.lat, +rec.lng], { icon })
          .bindTooltip(
            `Time: ${formatTimestamp(rec.ts)}<br>Speed: ${rec.speed ?? "N/A"} km/h<br>Status: ${
              rec.status
            }`
          )
          .addTo(layer);
      });
    }
  }, [
    vehicleData,
    filteredData,
    showHistory,
    selectedVehicle,
    isPaused,
    greenIcon,
    redIcon,
    yellowIcon,
    startIcon,
    endIcon,
  ]);
  // QUICK SELECT DATE HANDLER
  const handleQuickSelect = (type) => {
    const now = new Date();
    let start = new Date();
    let end = new Date();

    // Reset seconds/milliseconds for consistency
    now.setSeconds(0, 0);

    switch (type) {
      case "today":
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
        break;
      case "yesterday":
        start.setDate(now.getDate() - 1);
        start.setHours(0, 0, 0, 0);
        end.setDate(now.getDate() - 1);
        end.setHours(23, 59, 59, 999);
        break;
      case "week":
        start.setDate(now.getDate() - 7);
        // Usually, 'past week' goes up to right now
        break;
      default:
        break;
    }

    // Convert to the format required by <TextField type="datetime-local" />
    // Format: YYYY-MM-DDTHH:mm
    const formatDateForInput = (date) => {
      const pad = (num) => num.toString().padStart(2, "0");
      return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
    };

    setFromDate(formatDateForInput(start));
    setToDate(formatDateForInput(end));
  };

  /* ---------- render ---------- */
  return (
    <MDBox
      sx={{
        position: "relative",
        height: "100%",
        width: "100%",
        overflow: "hidden",
        backgroundColor: "#EFF1F4",
      }}
    >
      {/* Toggle button */}
      <MDBox
        sx={{
          position: "absolute",
          top: "10px",
          left: isPanelVisible ? SIDEBAR_WIDTH : "10px",
          zIndex: 1100,
          transition: "left 0.3s ease-in-out",
        }}
      >
        <MDButton
          variant="gradient"
          color="dark"
          size="small"
          onClick={() => setIsPanelVisible(!isPanelVisible)}
          sx={{ minWidth: "40px", height: "40px", p: 1, borderRadius: "50%" }}
        >
          <Icon>{isPanelVisible ? "arrow_back_ios" : "arrow_forward_ios"}</Icon>
        </MDButton>
      </MDBox>

      {/* Map canvas */}
      <MDBox
        sx={{
          height: "100%",
          width: "100%",
          transition: "margin-left 0.3s ease-in-out, width 0.3s ease-in-out",
          marginLeft: isPanelVisible ? SIDEBAR_WIDTH : "0px",
          width: isPanelVisible ? `calc(100% - ${SIDEBAR_WIDTH})` : "100%",
        }}
      >
        <div id="mapCanvas" style={{ height: "100%", width: "100%" }} />
      </MDBox>

      {/* Sliding sidebar */}
      <MDBox
        ref={panelRef}
        bgColor="white"
        p={3}
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          width: SIDEBAR_WIDTH,
          height: "100%",
          zIndex: 900,
          overflowY: "auto",
          borderRight: "1px solid #eee",
          transform: isPanelVisible ? "translateX(0)" : `translateX(-${SIDEBAR_WIDTH})`,
          transition: "transform 0.3s ease-in-out",
          boxShadow: "4px 0 6px rgba(0,0,0,0.1)",
        }}
      >
        <MDTypography variant="h6" mb={2} color="info">
          Track Play Controls
        </MDTypography>
        {/* Vehicle select */}
        <MDTypography variant="button" fontWeight="medium" mb={0.5}>
          Select Vehicle
        </MDTypography>
        <MDBox mb={2}>
          <MDInput
            select
            value={selectedVehicle?.value || ""}
            onChange={(e) => {
              const veh = vehicleList.find((v) => v.value === e.target.value);
              setSelectedVehicle(veh);
              setShowHistory(false);
              // Stop any ongoing animation when changing vehicle
              fullStopAnimation();
              setStatusFilter(["MOTION", "STOP", "IDLE"]);
            }}
            fullWidth
            size="small"
            SelectProps={{ native: true }}
          >
            <option value="" disabled>
              -- Select Vehicle --
            </option>
            {vehicleList.map((v) => (
              <option key={v.value} value={v.value}>
                {v.label}
              </option>
            ))}
          </MDInput>
        </MDBox>
        {/* Date/Time Range */}
        <MDTypography variant="button" fontWeight="medium" mb={0.5} display="block">
          Select Date/Time Range
        </MDTypography>
        <MDBox mt={3} mb={3}>
          <Grid container spacing={2}>
            {/* ----------------- FROM DATE/TIME PICKER (MUI TextField) ----------------- */}
            <Grid item xs={12} sm={6}>
              <MDBox>
                <MDTypography variant="caption" display="block" mb={0.5}>
                  From Date/Time
                </MDTypography>

                {/* Replaced DatePicker with TextField type="datetime-local" */}
                <TextField
                  type="datetime-local"
                  fullWidth
                  value={fromDate}
                  onChange={(e) => {
                    setFromDate(e.target.value);
                    // setShowHistory(false); // Uncomment if needed
                  }}
                  // The datetime-local input handles the placeholder and format natively
                  // The format should be handled by converting the date object to the "YYYY-MM-DDThh:mm:ss" format
                  // before setting it as the `value` prop, and then converting it back to a Date object
                  // or desired format in the onChange handler, if necessary.
                  InputProps={{
                    startAdornment: (
                      // Icon is typically not needed for native datetime-local, but added for consistency
                      <Icon sx={{ mr: 1, color: "text.secondary" }}>calendar_today</Icon>
                    ),
                  }}
                />
              </MDBox>
            </Grid>

            {/* ----------------- TO DATE/TIME PICKER (MUI TextField) ----------------- */}
            <Grid item xs={12} sm={6}>
              <MDBox>
                <MDTypography variant="caption" display="block" mb={0.5}>
                  To Date/Time
                </MDTypography>

                {/* Replaced DatePicker with TextField type="datetime-local" */}
                <TextField
                  type="datetime-local"
                  fullWidth
                  value={toDate}
                  onChange={(e) => {
                    setToDate(e.target.value);
                    // setShowHistory(false); // Uncomment if needed
                  }}
                  InputProps={{
                    startAdornment: (
                      <Icon sx={{ mr: 1, color: "text.secondary" }}>calendar_today</Icon>
                    ),
                  }}
                />
              </MDBox>
            </Grid>
            {/* Quick Select Buttons */}
            <MDBox mb={2} display="flex" gap={1} justifyContent="center" width="100%" mt={1} ml={2}>
              <MDButton
                variant="outlined"
                color="secondary"
                size="small"
                onClick={() => handleQuickSelect("today")}
              >
                Today
              </MDButton>
              <MDButton
                variant="outlined"
                color="secondary"
                size="small"
                onClick={() => handleQuickSelect("yesterday")}
              >
                Yesterday
              </MDButton>
              <MDButton
                variant="outlined"
                color="secondary"
                size="small"
                onClick={() => handleQuickSelect("week")}
              >
                Last 7 Days
              </MDButton>
            </MDBox>
          </Grid>
        </MDBox>

        {/* Submit */}
        <MDButton
          variant="gradient"
          color="info"
          fullWidth
          onClick={handleTrackSubmit}
          disabled={isLoading || !selectedVehicle || !fromDate || !toDate}
          sx={{ mb: 3 }}
        >
          {isLoading ? "Loading…" : "Get Track Data"}
        </MDButton>

        {/* ---------- when history is loaded ---------- */}
        {showHistory && filteredData.length > 0 && (
          <>
            {/* Status filter */}
            <MDTypography variant="button" fontWeight="medium" mb={1}>
              Filter Status
            </MDTypography>
            <MDBox display="flex" justifyContent="space-between" mb={2}>
              {["MOTION", "STOP", "IDLE"].map((type) => {
                const checked = statusFilter.includes(type);
                return (
                  <MDBox key={type} display="flex" flexDirection="column" alignItems="center">
                    <MDTypography variant="caption">{type}</MDTypography>
                    <MDBox
                      component="label"
                      sx={{
                        position: "relative",
                        width: "40px",
                        height: "22px",
                        background: checked ? "#5fdd54" : "#ccc",
                        borderRadius: "11px",
                        cursor: "pointer",
                        transition: "0.3s",
                        "&:after": {
                          content: '""',
                          position: "absolute",
                          width: "18px",
                          height: "18px",
                          borderRadius: "50%",
                          background: "#fff",
                          left: checked ? "20px" : "2px",
                          top: "2px",
                          transition: "0.3s",
                        },
                      }}
                      onClick={() => {
                        setHighlightedIndex(null);
                        setStatusFilter((prev) => {
                          const toggled = prev.includes(type)
                            ? prev.filter((s) => s !== type)
                            : [...prev, type];

                          if (toggled.length === 0) {
                            callAlert("At least one status must stay active.", "warning");
                            return prev;
                          }
                          return toggled;
                        });
                      }}
                    />
                  </MDBox>
                );
              })}
            </MDBox>
            {/* Play / Pause / Stop Buttons - Improved Spacing & Icons */}
            <MDBox display="flex" gap={2} justifyContent="space-between" mb={3}>
              {/* Play / Pause Button */}
              <MDButton
                variant="gradient"
                color={animationTimeoutRef.current ? (isPaused ? "success" : "warning") : "success"}
                startIcon={
                  <Icon>{animationTimeoutRef.current && !isPaused ? "pause" : "play_arrow"}</Icon>
                }
                onClick={togglePlayPause}
                disabled={!showHistory || vehicleData.length < 2}
                sx={{ flex: 1, minWidth: 0 }}
                size="medium"
              >
                {animationTimeoutRef.current ? (isPaused ? "Resume" : "Pause") : "Play Track"}
              </MDButton>

              {/* Full Stop Button */}
              <MDButton
                variant="gradient"
                color="error"
                startIcon={<Icon>stop</Icon>}
                onClick={fullStopAnimation}
                disabled={!animationTimeoutRef.current && !isPaused}
                sx={{ flex: 1, minWidth: 0 }}
                size="medium"
              >
                Stop
              </MDButton>
            </MDBox>
            {/* History list */}
            <MDTypography
              variant="button"
              color="info"
              fontWeight="medium"
              onClick={() => setShowVehicleHistory(!showVehicleHistory)}
              sx={{ cursor: "pointer", mb: 1 }}
            >
              {showVehicleHistory ? "Hide" : "Show"} History ({filteredData.length})
            </MDTypography>
            {showVehicleHistory && (
              <MDBox
                component="ul"
                p={0}
                m={0}
                sx={{
                  listStyle: "none",
                  maxHeight: "150px",
                  overflowY: "auto",
                  border: "1px solid #eee",
                  borderRadius: "4px",
                }}
              >
                {filteredData.map((rec, i) => (
                  <MDBox
                    component="li"
                    key={i}
                    p={1}
                    sx={{
                      background: i === highlightedIndex ? "#e0f7fa" : "transparent",
                      cursor: "pointer",
                    }}
                    onClick={() => {
                      setHighlightedIndex(i);
                      if (rec.lat && rec.lng)
                        mapRef.current.setView([+rec.lat, +rec.lng], 16, { animate: true });
                    }}
                  >
                    <MDTypography variant="caption">
                      {formatTimestamp(rec.ts)} — {rec.status} @ {rec.speed ?? "N/A"} km/h
                    </MDTypography>
                  </MDBox>
                ))}
              </MDBox>
            )}
            {/* Download */}
            <MDTypography
              variant="button"
              color="info"
              fontWeight="medium"
              onClick={() => setShowDownload(!showDownload)}
              sx={{ cursor: "pointer", mt: 2, mb: 1 }}
            >
              {showDownload ? "Hide" : "Show"} Download
            </MDTypography>
            {showDownload && (
              <MDBox p={1} sx={{ border: "1px dashed #ccc", borderRadius: 1 }}>
                <MDInput
                  select
                  value={downloadFormat}
                  onChange={(e) => setDownloadFormat(e.target.value)}
                  fullWidth
                  size="small"
                  SelectProps={{ native: true }}
                  sx={{ mb: 1 }}
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
                  disabled={!downloadFormat || filteredData.length === 0}
                  onClick={() => {
                    const imei = selectedVehicle?.value || "unknown";
                    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, "-");
                    const baseName = `track_${imei}_${timestamp}`;

                    if (downloadFormat === "csv") {
                      exportCSV(filteredData, `${baseName}.csv`);
                    } else if (downloadFormat === "excel") {
                      exportExcel(filteredData, `${baseName}.xlsx`);
                    } else if (downloadFormat === "pdf") {
                      exportPDF(filteredData, `${baseName}.pdf`);
                    }

                    AlertSuccess(`Downloaded as ${downloadFormat.toUpperCase()}`);
                    setShowDownload(false);
                    setDownloadFormat("");
                  }}
                >
                  Download Report
                </MDButton>
              </MDBox>
            )}
          </>
        )}
      </MDBox>
    </MDBox>
  );
};

export default LeafletControlsMap;
