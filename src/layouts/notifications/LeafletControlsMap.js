// import React, { useEffect, useRef, useState, useMemo } from "react";
// import L from "leaflet";
// import "leaflet/dist/leaflet.css";
// import "leaflet-polylinedecorator";
// import ApiService from "../../services/ApiService"; // ⭐ The API Service
// import { createTileLayers } from "../LoadCellReport/createTileLayers"; // Assuming path is correct
// import DatePicker from "react-datepicker";
// import "react-datepicker/dist/react-datepicker.css";
// import { format } from "date-fns";
// import "leaflet-rotatedmarker";
// import { exportCSV, exportExcel, exportPDF } from "./../utils/downloadUtils";
// import jsPDF from "jspdf";
// import "jspdf-autotable";
// import { AlertSuccess, callAlert } from "../../services/CommonService";

// // Material Dashboard 2 React components
// import MDBox from "components/MDBox";
// import MDTypography from "components/MDTypography";
// import MDButton from "components/MDButton";
// import MDInput from "components/MDInput";
// import Icon from "@mui/material/Icon";
// import Grid from "@mui/material/Grid";

// /* ----------------------------------------------------
//  * HELPER FUNCTIONS (Date formatting, parsing)
//  ---------------------------------------------------- */
// const getDateKey = (ts) => {
//   // ... (original implementation, omitted for brevity)
//   if (!ts) return null;
//   let d = new Date(ts);
//   if (!isNaN(d)) return d.toISOString().slice(0, 10);
//   const m = ts.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/);
//   if (m) {
//     const [, dd, mm, yy] = m;
//     d = new Date(`${yy}-${mm}-${dd}`);
//     return !isNaN(d) ? d.toISOString().slice(0, 10) : null;
//   }
//   return null;
// };
// const parseCustomDateTime = (str) => {
//   // Expected format: "04-07-2025 00:13:21"
//   const [datePart, timePart] = str.split(" ");
//   const [dd, mm, yyyy] = datePart.split("-");
//   return new Date(`${yyyy}-${mm}-${dd}T${timePart}`);
// };

// const formatTimestamp = (input) => {
//   const d = new Date(input);
//   if (isNaN(d)) return input;
//   const pad = (n) => String(n).padStart(2, "0");
//   return `${pad(d.getDate())}-${pad(d.getMonth() + 1)}-${d.getFullYear()} ${pad(
//     d.getHours()
//   )}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
// };

// // --------------------------------------------------------------------
// // ⭐ LEAFLET ICON FIX (CRUCIAL): Ensure custom map component handles the fix
// // --------------------------------------------------------------------
// import iconUrl from "leaflet/dist/images/marker-icon.png";
// import iconRetinaUrl from "leaflet/dist/images/marker-icon-2x.png";
// import shadowUrl from "leaflet/dist/images/marker-shadow.png";
// if (L.Icon.Default.prototype._getIconUrl) {
//   delete L.Icon.Default.prototype._getIconUrl;
//   L.Icon.Default.mergeOptions({
//     iconRetinaUrl: iconRetinaUrl,
//     iconUrl: iconUrl,
//     shadowUrl: shadowUrl,
//   });
// }
// // --------------------------------------------------------------------

// const LeafletControlsMap = () => {
//   const [showDownload, setShowDownload] = useState(false);
//   const [showVehicleHistory, setShowVehicleHistory] = useState(false);
//   const [isLoading, setIsLoading] = useState(false); // 🆕 Loading state for API

//   const mapRef = useRef(null);
//   const vehicleLayerRef = useRef(null);
//   const zoomDivRef = useRef(null);
//   const animatedMarkerRef = useRef(null);
//   const animationTimeoutRef = useRef(null);

//   // State for panel visibility, kept for potential future use,
//   // but the auto-hide logic is removed.
//   const [isPanelVisible, setIsPanelVisible] = useState(true);

//   const [vehicleList, setVehicleList] = useState([]);
//   const [selectedVehicle, setSelectedVehicle] = useState(null);
//   const [highlightedIndex, setHighlightedIndex] = useState(null);
//   const [fromDate, setFromDate] = useState(null); // type: Date
//   const [toDate, setToDate] = useState(null); // type: Date

//   const [showHistory, setShowHistory] = useState(false);
//   const [speed, setSpeed] = useState(500);
//   const [showOnlyPath, setShowOnlyPath] = useState(false);
//   const [statusFilter, setStatusFilter] = useState(["MOTION", "STOP", "IDLE"]);
//   const [downloadFormat, setDownloadFormat] = useState("");
//   const inactivityTimerRef = useRef(null);
//   const panelRef = useRef(null);
//   const [vehicleData, setVehicleData] = useState([]);
//   // Define the fixed width for the sidebar
//   const SIDEBAR_WIDTH = "300px";

//   // Helper functions (placeholders)
//   const parseCustomDateTime = (ts) => ts;
//   const formatTimestamp = (date) => new Date(date).toLocaleTimeString();
//   /* ----------------------------------------------------
//   // 🚀 API IMPLEMENTATION: HANDLE TRACK SUBMIT 🚀
//   ---------------------------------------------------- */
//   const handleTrackSubmit = async () => {
//     // 1. Validation
//     if (!selectedVehicle || !selectedVehicle.id) {
//       callAlert("Please select a vehicle.", "warning");
//       return;
//     }
//     if (!fromDate || !toDate) {
//       callAlert("Please select both 'From' and 'To' dates.", "warning");
//       return;
//     }
//     if (fromDate > toDate) {
//       callAlert("'From' date cannot be after 'To' date.", "error");
//       return;
//     }

//     // 2. Format Dates for API Payload
//     // The API expects "dd-MM-yyyy HH:mm:ss"
//     const dateFormat = "dd-MM-yyyy HH:mm:ss";
//     const from = format(fromDate, dateFormat);
//     const to = format(toDate, dateFormat);

//     // 3. Prepare Payload
//     const payload = {
//       deviceid: selectedVehicle.id, // e.g., "MH05AS1234" or the IMEI
//       from,
//       to,
//     };

//     // 4. Reset state and start loading
//     setShowHistory(false);
//     setVehicleData([]);
//     setHighlightedIndex(null);
//     if (animationTimeoutRef.current) clearTimeout(animationTimeoutRef.current);
//     if (vehicleLayerRef.current) vehicleLayerRef.current.clearLayers();
//     setIsLoading(true);

//     try {
//       // 5. API Call: Replace 'trkplyreport' with your actual API endpoint if different
//       const res = await ApiService.post("trkplyreport", payload);

//       const report = res?.data?.response?.report || [];

//       if (report.length === 0) {
//         callAlert("No track data found for the selected period.", "info");
//       } else {
//         // Sort data chronologically by timestamp (optional but recommended)
//         const sortedReport = report.sort(
//           (a, b) => parseCustomDateTime(a.ts).getTime() - parseCustomDateTime(b.ts).getTime()
//         );

//         setVehicleData(sortedReport);
//         setShowHistory(true);
//         AlertSuccess(`Track data loaded successfully. Total points: ${sortedReport.length}`);
//       }
//     } catch (error) {
//       console.error("API Error fetching track data:", error);
//       callAlert("Failed to load track data. Please check the network and API endpoint.", "error");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   /* ----------------------------------------------------
//   // Other logic (Panel, Map Setup, Draw Markers, etc.)
//   ---------------------------------------------------- */

//   // ❌ FIX 1: Removed logic that hides the panel after inactivity
//   useEffect(() => {
//     // if (!isPanelVisible) return; // Keep this line if you re-introduce visibility logic elsewhere
//     /*
//     // ❌ OLD LOGIC COMMENTED OUT TO PREVENT AUTO-HIDE
//     const resetTimer = () => {
//       if (inactivityTimerRef.current) {
//         clearTimeout(inactivityTimerRef.current);
//       }
//       inactivityTimerRef.current = setTimeout(() => {
//         setIsPanelVisible(false); // Auto-collapse
//       }, 10000); // 10 seconds
//     };

//     const panelEl = panelRef.current;
//     if (panelEl) {
//       panelEl.addEventListener("mousemove", resetTimer);
//       panelEl.addEventListener("click", resetTimer);
//       panelEl.addEventListener("keydown", resetTimer);
//     }

//     resetTimer();

//     return () => {
//       if (panelEl) {
//         panelEl.removeEventListener("mousemove", resetTimer);
//         panelEl.removeEventListener("click", resetTimer);
//         panelEl.removeEventListener("keydown", resetTimer);
//       }
//       clearTimeout(inactivityTimerRef.current);
//     };
//     */
//   }, [isPanelVisible]); // Dependency remains, but effect is now empty of auto-hide logic

//   const simulateMovement = () => {
//     // ... (simulateMovement logic, unchanged)
//     const map = mapRef.current;
//     const layer = vehicleLayerRef.current;

//     if (!map || !filteredData.length) return;

//     layer.clearLayers();

//     if (animatedMarkerRef.current) {
//       layer.removeLayer(animatedMarkerRef.current);
//       animatedMarkerRef.current = null;
//     }
//     if (animationTimeoutRef.current) {
//       clearTimeout(animationTimeoutRef.current);
//       animationTimeoutRef.current = null;
//     }

//     const pts = filteredData.map((rec) => [rec.lat, rec.lng]).filter((p) => p[0] && p[1]);

//     if (pts.length < 2) {
//       callAlert("Not enough points for track play.", "warning");
//       return;
//     }

//     const line = L.polyline(pts, {
//       color: "#00f",
//       weight: 5,
//       opacity: 0.6,
//     }).addTo(layer);

//     L.polylineDecorator(line, {
//       patterns: [
//         {
//           offset: 25,
//           repeat: 100,
//           symbol: L.Symbol.arrowHead({
//             pixelSize: 10,
//             polygon: false,
//             pathOptions: { weight: 2 },
//           }),
//         },
//       ],
//     }).addTo(layer);

//     map.fitBounds(line.getBounds(), { padding: [20, 20] });

//     let idx = 0;

//     const marker = L.marker(pts[0], {
//       icon: new L.Icon({
//         iconUrl: "/icons/arrows.png",
//         iconSize: [32, 32],
//         iconAnchor: [16, 16],
//       }),
//       rotationAngle: 0,
//       rotationOrigin: "center center",
//     }).addTo(layer);

//     animatedMarkerRef.current = marker;
//     map.setView(pts[0], 14);

//     const moveNext = () => {
//       idx++;
//       if (idx >= pts.length) {
//         callAlert("Track play finished.", "info");
//         setHighlightedIndex(null);
//         return;
//       }

//       const next = pts[idx];
//       marker.setLatLng(next);
//       map.panTo(next, {
//         animate: true,
//         duration: 0.5,
//       });
//       setHighlightedIndex(idx);

//       animationTimeoutRef.current = setTimeout(moveNext, speed);
//     };

//     moveNext();
//   };

//   const handleStop = () => {
//     if (animationTimeoutRef.current) {
//       clearTimeout(animationTimeoutRef.current);
//       animationTimeoutRef.current = null;
//       callAlert("Track play stopped.", "info");
//     }
//     // Set to null to re-trigger the useEffect that draws static markers/path
//     setHighlightedIndex(null);
//   };

//   const indiaCenter = { lat: 22.5589409, lng: 75.6089374 };
//   const baseMaps = createTileLayers();

//   /* ---------- marker icons ---------- */
//   const redIcon = new L.Icon({
//     iconUrl:
//       "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
//     shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
//     iconSize: [25, 41],
//     iconAnchor: [12, 41],
//   });
//   const greenIcon = new L.Icon({
//     iconUrl:
//       "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png",
//     shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
//     iconSize: [25, 41],
//     iconAnchor: [12, 41],
//   });

//   const yellowIcon = new L.Icon({
//     iconUrl:
//       "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-yellow.png",
//     shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
//     iconSize: [25, 41],
//     iconAnchor: [12, 41],
//   });

//   /* ---------- map setup (runs once) ---------- */
//   useEffect(() => {
//     if (mapRef.current) return;

//     /* zoom read-out */
//     const ZoomView = L.Control.extend({
//       onAdd: (m) => {
//         const div = L.DomUtil.create("div", "leaflet-bar leaflet-control");
//         div.style.padding = "5px";
//         div.innerHTML = `Zoom: ${m.getZoom()}`;
//         zoomDivRef.current = div;
//         return div;
//       },
//     });
//     L.control.zoomview = (opts) => new ZoomView(opts);

//     /* map */
//     const map = L.map("mapCanvas", {
//       center: [indiaCenter.lat, indiaCenter.lng],
//       zoom: 5,
//       layers: [baseMaps["OpenStreet"]],
//       zoomControl: false,
//       dragging: true,
//       scrollWheelZoom: true,
//       doubleClickZoom: false,
//       boxZoom: false,
//       keyboard: false,
//       touchZoom: false,
//     });
//     mapRef.current = map;
//     vehicleLayerRef.current = L.layerGroup().addTo(map);

//     /* custom control panel (Map Type Switcher and Zoom) */
//     let currentLayer = baseMaps["OpenStreet"];
//     const mapControlContainer = L.Control.extend({
//       onAdd: function () {
//         const container = L.DomUtil.create("div", "leaflet-control-custom-container");
//         // ... (Styles for map control container, omitted for brevity)
//         container.style.display = "flex";
//         container.style.gap = "10px";
//         container.style.justifyContent = "center";
//         container.style.alignItems = "center";
//         container.style.background = "#fff";
//         container.style.padding = "5px 10px";
//         container.style.borderRadius = "10px";
//         container.style.boxShadow = "0 2px 8px rgba(0,0,0,0.3)";
//         container.style.marginBottom = "20px";

//         const makeBtn = (icon, title, onClick) => {
//           const btn = L.DomUtil.create("button", "", container);
//           btn.innerHTML = `<img src="${icon}" alt="${title}" title="${title}" style="width:24px;height:24px"/>`;
//           btn.style.background = "none";
//           btn.style.border = "none";
//           btn.style.cursor = "pointer";
//           btn.onclick = onClick;
//           return btn;
//         };

//         const switchTo = (layerName) => {
//           const layer = baseMaps[layerName];
//           if (!layer) return;
//           const map = mapRef.current;
//           if (map && currentLayer) {
//             if (map.hasLayer(currentLayer)) map.removeLayer(currentLayer);
//             layer.addTo(map);
//             currentLayer = layer;
//           }
//         };

//         makeBtn("https://cdn-icons-png.flaticon.com/512/854/854929.png", "OpenStreet Map", () =>
//           switchTo("OpenStreet")
//         );
//         makeBtn("https://cdn-icons-png.flaticon.com/512/1865/1865083.png", "MapBox Dark", () =>
//           switchTo("MapBoxDark")
//         );
//         makeBtn("https://cdn-icons-png.flaticon.com/512/1865/1865269.png", "Google Satellite", () =>
//           switchTo("GoogleSatellite")
//         );

//         return container;
//       },
//     });

//     map.addControl(new mapControlContainer({ position: "bottomright" }));

//     // Zoom Control Panel
//     const CustomZoomControl = L.Control.extend({
//       onAdd: function () {
//         const container = L.DomUtil.create("div", "custom-zoom-panel");
//         // ... (Styles for custom zoom control, omitted for brevity)
//         container.style.display = "flex";
//         container.style.flexDirection = "column";
//         container.style.alignItems = "center";
//         container.style.background = "#fff";
//         container.style.borderRadius = "8px";
//         container.style.boxShadow = "0 2px 8px rgba(0,0,0,0.3)";
//         container.style.padding = "6px";

//         const zoomInBtn = L.DomUtil.create("button", "", container);
//         zoomInBtn.innerHTML = `<img src="https://cdn-icons-png.flaticon.com/512/992/992651.png" alt="Zoom In" style="width: 20px; height: 20px;" />`;
//         Object.assign(zoomInBtn.style, {
//           background: "none",
//           border: "none",
//           cursor: "pointer",
//           padding: "4px",
//           marginBottom: "6px",
//         });
//         zoomInBtn.onclick = () => mapRef.current.zoomIn();

//         const zoomOutBtn = L.DomUtil.create("button", "", container);
//         zoomOutBtn.innerHTML = `<img src="https://cdn-icons-png.flaticon.com/512/992/992683.png" alt="Zoom Out" style="width: 20px; height: 20px;" />`;
//         Object.assign(zoomOutBtn.style, {
//           background: "none",
//           border: "none",
//           cursor: "pointer",
//           padding: "4px",
//         });
//         zoomOutBtn.onclick = () => mapRef.current.zoomOut();

//         return container;
//       },
//     });

//     map.addControl(new CustomZoomControl({ position: "bottomright" }));

//     L.control.zoomview({ position: "topleft" }).addTo(map);
//     L.control.scale().addTo(map);
//     map.on(
//       "zoomend",
//       () => zoomDivRef.current && (zoomDivRef.current.innerHTML = `Zoom: ${map.getZoom()}`)
//     );

//     return () => {
//       if (animationTimeoutRef.current) clearTimeout(animationTimeoutRef.current);
//       if (mapRef.current) {
//         map.remove();
//         mapRef.current = null;
//       }
//     };
//   }, [baseMaps]);

//   /* 🔽 Initial Load Vehicle List 🔽 */
//   useEffect(() => {
//     // Replace with your actual endpoint for device list (e.g., /api/devices)
//     ApiService.getMockData("/trkplyreport.json", (res) => {
//       const raw = res?.data?.response?.report || [];

//       // Group by vehicle name to get a list of unique devices (replace with real device list API)
//       const grouped = {};
//       raw.forEach((r) => {
//         if (!grouped[r.name]) grouped[r.name] = [];
//         grouped[r.name].push(r);
//       });

//       const list = Object.keys(grouped).map((id) => ({ id }));
//       setVehicleList(list);

//       // Set initial dates (Last 24 hours)
//       const now = new Date();
//       setFromDate(new Date(now.getTime() - 24 * 60 * 60 * 1000));
//       setToDate(now);

//       if (list.length > 0) {
//         setSelectedVehicle(list[0]);
//       }
//     });
//   }, []);

//   /* ---------- date-filtered data (Memoized for performance) ---------- */
//   const filteredData = useMemo(() => {
//     return vehicleData.filter((r) => {
//       const ts = parseCustomDateTime(r.ts).getTime();
//       const statusMatch = statusFilter.includes(r.status);
//       const dateMatch =
//         (!fromDate || ts >= fromDate.getTime()) && (!toDate || ts <= toDate.getTime());

//       return statusMatch && dateMatch;
//     });
//   }, [vehicleData, fromDate, toDate, statusFilter]);

//   /* ---------- draw markers and path — only if showHistory ---------- */
//   useEffect(() => {
//     const map = mapRef.current;
//     const layer = vehicleLayerRef.current;
//     if (!map || !layer) {
//       return;
//     }

//     layer.clearLayers();
//     if (!showHistory || !selectedVehicle) return;

//     if (animatedMarkerRef.current) {
//       layer.removeLayer(animatedMarkerRef.current);
//       animatedMarkerRef.current = null;
//     }

//     const pts = [];
//     filteredData.forEach((rec, idx) => {
//       const { lat, lng, ts, speed, status } = rec;
//       if (!(lat && lng)) return;

//       pts.push([+lat, +lng]);

//       if (!showOnlyPath && statusFilter.includes(status)) {
//         let icon;
//         if (status === "MOTION") icon = greenIcon;
//         else if (status === "STOP") icon = redIcon;
//         else if (status === "IDLE") icon = yellowIcon;

//         if (idx === highlightedIndex) {
//           icon = new L.Icon({
//             iconUrl:
//               "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png",
//             shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
//             iconSize: [30, 50],
//             iconAnchor: [15, 50],
//           });
//         }

//         L.marker([+lat, +lng], { icon })
//           .bindTooltip(
//             `Time: ${formatTimestamp(ts)}<br/>
//             Speed: ${speed ?? "N/A"} km/h<br/>
//             Latitude: ${+lat}<br/>
//             Longitude: ${+lng}<br/>
//             Status: ${status}`
//           )
//           .addTo(layer);
//       }
//     });

//     if (pts.length > 1 && highlightedIndex == null) {
//       const line = L.polyline(pts, {
//         color: "#00f",
//         weight: 5,
//         opacity: 0.7,
//       }).addTo(layer);
//       L.polylineDecorator(line, {
//         patterns: [
//           {
//             offset: 25,
//             repeat: 100,
//             symbol: L.Symbol.arrowHead({
//               pixelSize: 10,
//               polygon: false,
//               pathOptions: { weight: 2 },
//             }),
//           },
//         ],
//       }).addTo(layer);
//       map.fitBounds(line.getBounds(), { padding: [20, 20] });
//     } else if (pts.length > 0) {
//       const targetPoint =
//         highlightedIndex !== null ? filteredData[highlightedIndex] : filteredData[pts.length - 1];
//       map.setView(
//         [+targetPoint.lat, +targetPoint.lng],
//         highlightedIndex !== null ? 16 : map.getZoom(),
//         { animate: true }
//       );
//     }
//   }, [filteredData, highlightedIndex, showHistory, showOnlyPath, statusFilter, selectedVehicle]);

//   /* ----------------------------------------------------
//   // JSX RENDER
//   ---------------------------------------------------- */

// import Grid from "@mui/material/Grid";
// import Icon from "@mui/material/Icon"; // for the calendar icon
import TextField from "@mui/material/TextField"; // The replacement input
import React, { useEffect, useRef, useState, useMemo } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-polylinedecorator";
import ApiService from "../../services/ApiService"; // ⭐ The API Service
import { createTileLayers } from "../LoadCellReport/createTileLayers"; // Assuming path is correct
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format } from "date-fns";
import "leaflet-rotatedmarker";
import { exportCSV, exportExcel, exportPDF } from "./../utils/downloadUtils";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { AlertSuccess, callAlert } from "../../services/CommonService";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import MDInput from "components/MDInput";
import Icon from "@mui/material/Icon";
import Grid from "@mui/material/Grid";

/* ----------------------------------------------------
 * HELPER FUNCTIONS (Date formatting, parsing)
 ---------------------------------------------------- */
const getDateKey = (ts) => {
  // ... (original implementation, omitted for brevity)
  if (!ts) return null;
  let d = new Date(ts);
  if (!isNaN(d)) return d.toISOString().slice(0, 10);
  const m = ts.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/);
  if (m) {
    const [, dd, mm, yy] = m;
    d = new Date(`${yy}-${mm}-${dd}`);
    return !isNaN(d) ? d.toISOString().slice(0, 10) : null;
  }
  return null;
};

// NOTE: This helper is defined twice in the previous input. I'm keeping one for use.
const parseCustomDateTime = (str) => {
  // Expected format: "dd-MM-yyyy HH:mm:ss"
  const [datePart, timePart] = str.split(" ");
  const [dd, mm, yyyy] = datePart.split("-");
  return new Date(`${yyyy}-${mm}-${dd}T${timePart}`);
};

const formatTimestamp = (input) => {
  const d = new Date(input);
  if (isNaN(d)) return input;
  const pad = (n) => String(n).padStart(2, "0");
  return `${pad(d.getDate())}-${pad(d.getMonth() + 1)}-${d.getFullYear()} ${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
};

// --------------------------------------------------------------------
// ⭐ LEAFLET ICON FIX (CRUCIAL):
// --------------------------------------------------------------------
import iconUrl from "leaflet/dist/images/marker-icon.png";
import iconRetinaUrl from "leaflet/dist/images/marker-icon-2x.png";
import shadowUrl from "leaflet/dist/images/marker-shadow.png";
if (L.Icon.Default.prototype._getIconUrl) {
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: iconRetinaUrl,
    iconUrl: iconUrl,
    shadowUrl: shadowUrl,
  });
}
// --------------------------------------------------------------------

const LeafletControlsMap = () => {
  const [showDownload, setShowDownload] = useState(false);
  const [showVehicleHistory, setShowVehicleHistory] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // Loading state for API

  const mapRef = useRef(null);
  const vehicleLayerRef = useRef(null);
  const zoomDivRef = useRef(null);
  const animatedMarkerRef = useRef(null);
  const animationTimeoutRef = useRef(null);

  // ⭐ KEY STATE FOR SLIDING SIDEBAR
  const [isPanelVisible, setIsPanelVisible] = useState(true);

  const [vehicleList, setVehicleList] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [highlightedIndex, setHighlightedIndex] = useState(null);
  const [fromDate, setFromDate] = useState(null); // type: Date
  const [toDate, setToDate] = useState(null); // type: Date

  const [showHistory, setShowHistory] = useState(false);
  const [speed, setSpeed] = useState(500);
  const [showOnlyPath, setShowOnlyPath] = useState(false);
  const [statusFilter, setStatusFilter] = useState(["MOTION", "STOP", "IDLE"]);
  const [downloadFormat, setDownloadFormat] = useState("");
  const inactivityTimerRef = useRef(null);
  const panelRef = useRef(null);
  const [vehicleData, setVehicleData] = useState([]);

  // ⭐ KEY VARIABLE FOR SLIDING SIDEBAR
  const SIDEBAR_WIDTH = "300px";

  /* ----------------------------------------------------
  // 🚀 API IMPLEMENTATION: HANDLE TRACK SUBMIT 🚀
  ---------------------------------------------------- */
  const handleTrackSubmit = async () => {
    // 1. Validation
    if (!selectedVehicle || !selectedVehicle.id) {
      callAlert("Please select a vehicle.", "warning");
      return;
    }
    if (!fromDate || !toDate) {
      callAlert("Please select both 'From' and 'To' dates.", "warning");
      return;
    }
    if (fromDate > toDate) {
      callAlert("'From' date cannot be after 'To' date.", "error");
      return;
    }

    // 2. Format Dates for API Payload
    const dateFormat = "dd-MM-yyyy HH:mm:ss";
    const from = format(fromDate, dateFormat);
    const to = format(toDate, dateFormat);

    // 3. Prepare Payload
    const payload = {
      deviceid: selectedVehicle.id, // e.g., "MH05AS1234" or the IMEI
      from,
      to,
    };

    // 4. Reset state and start loading
    setShowHistory(false);
    setVehicleData([]);
    setHighlightedIndex(null);
    if (animationTimeoutRef.current) clearTimeout(animationTimeoutRef.current);
    if (vehicleLayerRef.current) vehicleLayerRef.current.clearLayers();
    setIsLoading(true);

    try {
      // 5. API Call: Replace 'trkplyreport' with your actual API endpoint if different
      // NOTE: Using getMockData as in your original setup for consistency
      const res = await ApiService.getMockData("/trkplyreport.json", payload);

      const report = res?.data?.response?.report || [];

      if (report.length === 0) {
        callAlert("No track data found for the selected period.", "info");
      } else {
        // Sort data chronologically by timestamp
        const sortedReport = report.sort(
          (a, b) => parseCustomDateTime(a.ts).getTime() - parseCustomDateTime(b.ts).getTime()
        );

        setVehicleData(sortedReport);
        setShowHistory(true);
        AlertSuccess(`Track data loaded successfully. Total points: ${sortedReport.length}`);
      }
    } catch (error) {
      console.error("API Error fetching track data:", error);
      callAlert("Failed to load track data. Please check the network and API endpoint.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  /* ----------------------------------------------------
  // Other logic (Panel, Map Setup, Draw Markers, etc.)
  ---------------------------------------------------- */

  // Removed the auto-hide logic based on your previous input
  useEffect(() => {
    return () => {
      clearTimeout(inactivityTimerRef.current);
    };
  }, []);

  const simulateMovement = () => {
    // ... (simulateMovement logic)
    const map = mapRef.current;
    const layer = vehicleLayerRef.current;

    if (!map || !filteredData.length) return;

    layer.clearLayers();

    if (animatedMarkerRef.current) {
      layer.removeLayer(animatedMarkerRef.current);
      animatedMarkerRef.current = null;
    }
    if (animationTimeoutRef.current) {
      clearTimeout(animationTimeoutRef.current);
      animationTimeoutRef.current = null;
    }

    const pts = filteredData.map((rec) => [rec.lat, rec.lng]).filter((p) => p[0] && p[1]);

    if (pts.length < 2) {
      callAlert("Not enough points for track play.", "warning");
      return;
    }

    const line = L.polyline(pts, {
      color: "#00f",
      weight: 5,
      opacity: 0.6,
    }).addTo(layer);

    L.polylineDecorator(line, {
      patterns: [
        {
          offset: 25,
          repeat: 100,
          symbol: L.Symbol.arrowHead({
            pixelSize: 10,
            polygon: false,
            pathOptions: { weight: 2 },
          }),
        },
      ],
    }).addTo(layer);

    map.fitBounds(line.getBounds(), { padding: [20, 20] });

    let idx = 0;

    const marker = L.marker(pts[0], {
      icon: new L.Icon({
        iconUrl: "/icons/arrows.png",
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      }),
      rotationAngle: 0,
      rotationOrigin: "center center",
    }).addTo(layer);

    animatedMarkerRef.current = marker;
    map.setView(pts[0], 14);

    const moveNext = () => {
      idx++;
      if (idx >= pts.length) {
        callAlert("Track play finished.", "info");
        setHighlightedIndex(null);
        return;
      }

      const next = pts[idx];
      marker.setLatLng(next);
      map.panTo(next, {
        animate: true,
        duration: 0.5,
      });
      setHighlightedIndex(idx);

      animationTimeoutRef.current = setTimeout(moveNext, speed);
    };

    moveNext();
  };

  const handleStop = () => {
    if (animationTimeoutRef.current) {
      clearTimeout(animationTimeoutRef.current);
      animationTimeoutRef.current = null;
      callAlert("Track play stopped.", "info");
    }
    // Set to null to re-trigger the useEffect that draws static markers/path
    setHighlightedIndex(null);
  };

  const indiaCenter = { lat: 22.5589409, lng: 75.6089374 };
  const baseMaps = createTileLayers();

  /* ---------- marker icons ---------- */
  const redIcon = new L.Icon({
    iconUrl:
      "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
    shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
  });
  const greenIcon = new L.Icon({
    iconUrl:
      "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png",
    shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
  });

  const yellowIcon = new L.Icon({
    iconUrl:
      "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-yellow.png",
    shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
  });

  /* ---------- map setup (runs once) ---------- */
  useEffect(() => {
    if (mapRef.current) return;

    /* zoom read-out */
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

    /* map */
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

    /* custom control panel (Map Type Switcher and Zoom) */
    let currentLayer = baseMaps["OpenStreet"];
    const mapControlContainer = L.Control.extend({
      onAdd: function () {
        const container = L.DomUtil.create("div", "leaflet-control-custom-container");
        container.style.display = "flex";
        container.style.gap = "10px";
        container.style.justifyContent = "center";
        container.style.alignItems = "center";
        container.style.background = "#fff";
        container.style.padding = "5px 10px";
        container.style.borderRadius = "10px";
        container.style.boxShadow = "0 2px 8px rgba(0,0,0,0.3)";
        container.style.marginBottom = "20px";

        const makeBtn = (icon, title, onClick) => {
          const btn = L.DomUtil.create("button", "", container);
          btn.innerHTML = `<img src="${icon}" alt="${title}" title="${title}" style="width:24px;height:24px"/>`;
          btn.style.background = "none";
          btn.style.border = "none";
          btn.style.cursor = "pointer";
          btn.onclick = onClick;
          return btn;
        };

        const switchTo = (layerName) => {
          const layer = baseMaps[layerName];
          if (!layer) return;
          const map = mapRef.current;
          if (map && currentLayer) {
            if (map.hasLayer(currentLayer)) map.removeLayer(currentLayer);
            layer.addTo(map);
            currentLayer = layer;
          }
        };

        makeBtn("https://cdn-icons-png.flaticon.com/512/854/854929.png", "OpenStreet Map", () =>
          switchTo("OpenStreet")
        );
        makeBtn("https://cdn-icons-png.flaticon.com/512/1865/1865083.png", "MapBox Dark", () =>
          switchTo("MapBoxDark")
        );
        makeBtn("https://cdn-icons-png.flaticon.com/512/1865/1865269.png", "Google Satellite", () =>
          switchTo("GoogleSatellite")
        );

        return container;
      },
    });

    map.addControl(new mapControlContainer({ position: "bottomright" }));

    // Zoom Control Panel
    const CustomZoomControl = L.Control.extend({
      onAdd: function () {
        const container = L.DomUtil.create("div", "custom-zoom-panel");
        container.style.display = "flex";
        container.style.flexDirection = "column";
        container.style.alignItems = "center";
        container.style.background = "#fff";
        container.style.borderRadius = "8px";
        container.style.boxShadow = "0 2px 8px rgba(0,0,0,0.3)";
        container.style.padding = "6px";

        const zoomInBtn = L.DomUtil.create("button", "", container);
        zoomInBtn.innerHTML = `<img src="https://cdn-icons-png.flaticon.com/512/992/992651.png" alt="Zoom In" style="width: 20px; height: 20px;" />`;
        Object.assign(zoomInBtn.style, {
          background: "none",
          border: "none",
          cursor: "pointer",
          padding: "4px",
          marginBottom: "6px",
        });
        zoomInBtn.onclick = () => mapRef.current.zoomIn();

        const zoomOutBtn = L.DomUtil.create("button", "", container);
        zoomOutBtn.innerHTML = `<img src="https://cdn-icons-png.flaticon.com/512/992/992683.png" alt="Zoom Out" style="width: 20px; height: 20px;" />`;
        Object.assign(zoomOutBtn.style, {
          background: "none",
          border: "none",
          cursor: "pointer",
          padding: "4px",
        });
        zoomOutBtn.onclick = () => mapRef.current.zoomOut();

        return container;
      },
    });

    map.addControl(new CustomZoomControl({ position: "bottomright" }));

    L.control.zoomview({ position: "topleft" }).addTo(map);
    L.control.scale().addTo(map);
    map.on(
      "zoomend",
      () => zoomDivRef.current && (zoomDivRef.current.innerHTML = `Zoom: ${map.getZoom()}`)
    );

    return () => {
      if (animationTimeoutRef.current) clearTimeout(animationTimeoutRef.current);
      if (mapRef.current) {
        map.remove();
        mapRef.current = null;
      }
    };
  }, [baseMaps]);

  /* 🔽 Initial Load Vehicle List 🔽 */
  useEffect(() => {
    // Replace with your actual endpoint for device list (e.g., /api/devices)
    ApiService.getMockData("/trkplyreport.json", (res) => {
      const raw = res?.data?.response?.report || [];

      // Group by vehicle name to get a list of unique devices (replace with real device list API)
      const grouped = {};
      raw.forEach((r) => {
        if (!grouped[r.name]) grouped[r.name] = [];
        grouped[r.name].push(r);
      });

      const list = Object.keys(grouped).map((id) => ({ id }));
      setVehicleList(list);

      // Set initial dates (Last 24 hours)
      const now = new Date();
      setFromDate(new Date(now.getTime() - 24 * 60 * 60 * 1000));
      setToDate(now);

      if (list.length > 0) {
        setSelectedVehicle(list[0]);
      }
    });
  }, []);

  /* ---------- date-filtered data (Memoized for performance) ---------- */
  const filteredData = useMemo(() => {
    return vehicleData.filter((r) => {
      const ts = parseCustomDateTime(r.ts).getTime();
      const statusMatch = statusFilter.includes(r.status);
      const dateMatch =
        (!fromDate || ts >= fromDate.getTime()) && (!toDate || ts <= toDate.getTime());

      return statusMatch && dateMatch;
    });
  }, [vehicleData, fromDate, toDate, statusFilter]);

  /* ---------- draw markers and path — only if showHistory ---------- */
  useEffect(() => {
    const map = mapRef.current;
    const layer = vehicleLayerRef.current;
    if (!map || !layer) {
      return;
    }

    layer.clearLayers();
    if (!showHistory || !selectedVehicle) return;

    if (animatedMarkerRef.current) {
      layer.removeLayer(animatedMarkerRef.current);
      animatedMarkerRef.current = null;
    }

    const pts = [];
    filteredData.forEach((rec, idx) => {
      const { lat, lng, ts, speed, status } = rec;
      if (!(lat && lng)) return;

      pts.push([+lat, +lng]);

      if (!showOnlyPath && statusFilter.includes(status)) {
        let icon;
        if (status === "MOTION") icon = greenIcon;
        else if (status === "STOP") icon = redIcon;
        else if (status === "IDLE") icon = yellowIcon;

        if (idx === highlightedIndex) {
          icon = new L.Icon({
            iconUrl:
              "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png",
            shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
            iconSize: [30, 50],
            iconAnchor: [15, 50],
          });
        }

        L.marker([+lat, +lng], { icon })
          .bindTooltip(
            `Time: ${formatTimestamp(ts)}<br/>
             Speed: ${speed ?? "N/A"} km/h<br/>
             Latitude: ${+lat}<br/>
             Longitude: ${+lng}<br/>
             Status: ${status}`
          )
          .addTo(layer);
      }
    });

    if (pts.length > 1 && highlightedIndex == null) {
      const line = L.polyline(pts, {
        color: "#00f",
        weight: 5,
        opacity: 0.7,
      }).addTo(layer);
      L.polylineDecorator(line, {
        patterns: [
          {
            offset: 25,
            repeat: 100,
            symbol: L.Symbol.arrowHead({
              pixelSize: 10,
              polygon: false,
              pathOptions: { weight: 2 },
            }),
          },
        ],
      }).addTo(layer);
      map.fitBounds(line.getBounds(), { padding: [20, 20] });
    } else if (pts.length > 0) {
      const targetPoint =
        highlightedIndex !== null ? filteredData[highlightedIndex] : filteredData[pts.length - 1];
      map.setView(
        [+targetPoint.lat, +targetPoint.lng],
        highlightedIndex !== null ? 16 : map.getZoom(),
        { animate: true }
      );
    }
  }, [filteredData, highlightedIndex, showHistory, showOnlyPath, statusFilter, selectedVehicle]);

  /* ----------------------------------------------------
   * 🎨 RENDER: SLIDING SIDEBAR LAYOUT 🎨
   * The Map is a full-width Grid item. The Panel is an 
   * absolute-positioned MDBox that slides over the map.
   ---------------------------------------------------- */
  // LeafletControlsMap.js (The map component)

  // ... (imports and component function definition omitted for brevity)
  return (
    // Outer container for the full screen area - No major change here, just cleaning up comments
    <MDBox
      width="100%"
      sx={{
        position: "relative",
        borderRadius: "0.75rem",
        overflow: "hidden",
        border: "1px solid #ddd",
        boxShadow: "0 4px 6px rgba(0,0,0,0.05)",
        backgroundColor: `#EFF1F4 !important`,
        height: `100% !important`,
        marginTop: `0px !important`,
        marginBottom: "0px",
        // Adding flex container properties for full-height children, though absolute positioning handles layout here.
        // Keeping current relative layout since sidebar is absolute.
      }}
    >
      {/* ⭐ 1. Floating Toggle Button (Controls Sidebar Visibility) */}
      {/* CRITICAL FIX: The button's transition is what moves it with the sidebar. Its position is relative to the MDBox container. */}
      <MDBox
        sx={{
          position: "absolute",
          top: "10px",
          // Button moves from 10px from the left (closed) to the SIDEBAR_WIDTH (open)
          left: isPanelVisible ? SIDEBAR_WIDTH : "10px",
          zIndex: 1000,
          transition: "left 0.3s ease-in-out",
          transform: "translateX(0)",
        }}
      >
        <MDButton
          variant="gradient"
          color="dark"
          size="small"
          onClick={() => setIsPanelVisible(!isPanelVisible)}
          sx={{ minWidth: "40px", height: "40px", p: 1, borderRadius: "50%", boxShadow: 3 }}
        >
          <Icon>{isPanelVisible ? "arrow_back_ios" : "arrow_forward_ios"}</Icon>
        </MDButton>
      </MDBox>

      {/* ⭐ 2. Map Container (NEW LAYOUT) */}
      {/* CRITICAL FIX: Use conditional margin-left on the map container to clear the space when the sidebar is visible. */}
      <MDBox
        sx={{
          height: "100%",
          width: "100%",
          zIndex: 0,
          transition: "margin-left 0.3s ease-in-out, width 0.3s ease-in-out",
          // If panel is visible, push the map to the right by SIDEBAR_WIDTH and reduce its effective width.
          marginLeft: isPanelVisible ? SIDEBAR_WIDTH : "0px",
          width: isPanelVisible ? `calc(100% - ${SIDEBAR_WIDTH})` : "100%", // Also adjust width to prevent scrollbar
        }}
      >
        <div id="mapCanvas" style={{ height: "100%", width: "100%", zIndex: 0 }}></div>
      </MDBox>

      {/* ⭐ 3. Control Panel (Sidebar) - ABSOLUTE POSITIONED MDBox */}
      <MDBox
        ref={panelRef}
        bgColor="white"
        p={3}
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          width: SIDEBAR_WIDTH, // Fixed width
          height: "100%",
          zIndex: 900,
          overflowY: "auto",
          borderRight: "1px solid #eee",
          // Smooth Slide Effect: Use transform to move it off-screen
          transform: isPanelVisible ? "translateX(0)" : `translateX(-${SIDEBAR_WIDTH})`,
          transition: "transform 0.3s ease-in-out",
          boxShadow: "4px 0 6px rgba(0,0,0,0.1)",
          // Retain original form control styles
          "& .react-datepicker-wrapper, & .react-datepicker__input-container, & .form-control": {
            width: "100%",
            boxSizing: "border-box",
            display: "block",
          },
          "& .form-control": {
            padding: "8px 10px",
            border: "1px solid #d2d6ba",
            borderRadius: "0.5rem",
            fontSize: "14px",
            color: "#344767",
            transition: "border-color 0.3s",
            "&:focus": { borderColor: "#1A73E8", outline: "none" },
          },
        }}
      >
        {/* ---------------------------------------------------- */}
        {/* 🚀 START OF SIDEBAR CONTENT 🚀 */}
        {/* ---------------------------------------------------- */}
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
            <option value="" disabled>
              -- Select Vehicle --
            </option>
            {vehicleList.map((v) => (
              <option key={v.id} value={v.id}>
                {v.id}
              </option>
            ))}
          </MDInput>
        </MDBox>
        {/* Date/Time Range */}
        <MDTypography variant="button" fontWeight="medium" mb={0.5} display="block">
          Select Date/Time Range
        </MDTypography>
        <MDBox mt={3} mb={3}>
          {/* Optional: You can put the main title here or keep it outside the MDBox if preferred */}
          {/* <MDTypography variant="button" fontWeight="medium" mb={0.5} display="block">
    📅 Select Date/Time Range
  </MDTypography> */}

          <Grid container spacing={2}>
            {/* ----------------- FROM DATE/TIME PICKER ----------------- */}
            <Grid item xs={12} sm={6}>
              <MDBox>
                <MDTypography variant="caption" display="block" mb={0.5}>
                  From Date/Time
                </MDTypography>
                <TextField
                  // Use datetime-local for native browser picker
                  type="datetime-local"
                  fullWidth
                  value={fromDate}
                  onChange={(e) => {
                    setFromDate(e.target.value);
                    // setShowHistory(false); // Uncomment if needed
                  }}
                  InputProps={{
                    startAdornment: (
                      <Icon sx={{ mr: 1, color: "text.secondary" }}>calendar_today</Icon>
                    ),
                  }}
                  inputProps={
                    {
                      // For setting a default value, ensure your state is correctly formatted.
                    }
                  }
                />
              </MDBox>
            </Grid>

            {/* ----------------- TO DATE/TIME PICKER ----------------- */}
            <Grid item xs={12} sm={6}>
              <MDBox>
                <MDTypography variant="caption" display="block" mb={0.5}>
                  To Date/Time
                </MDTypography>
                <TextField
                  // Use datetime-local for native browser picker
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
          </Grid>
        </MDBox>
        {/* Submit Button with API Call */}
        <MDButton
          variant="gradient"
          color="primary"
          fullWidth
          onClick={handleTrackSubmit}
          disabled={isLoading || !selectedVehicle || !fromDate || !toDate}
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
        {showHistory && filteredData.length > 0 && (
          <>
            {/* Status Filter */}
            <MDTypography variant="button" fontWeight="medium" color="dark" mb={1} display="block">
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
                    {/* Toggle Switch Logic */}
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
                onClick={() => simulateMovement()}
                disabled={filteredData.length < 2 || isLoading}
                sx={{ flex: 1, py: 1 }}
              >
                <Icon sx={{ mr: 0.5 }}>play_arrow</Icon> Play
              </MDButton>
              <MDButton
                variant="gradient"
                color="error"
                onClick={handleStop}
                disabled={filteredData.length === 0 || isLoading}
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
                  overflowY: "auto",
                  boxShadow: "inset 0 1px 3px rgba(0,0,0,0.1)",
                }}
              >
                {filteredData.map((rec, idx) => (
                  <MDBox
                    component="li"
                    key={idx}
                    p={0.5}
                    sx={{
                      backgroundColor: idx === highlightedIndex ? "#e0f2f1" : "transparent",
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
                        sx={{ fontSize: "12px !important", verticalAlign: "text-bottom", mr: 0.5 }}
                      >
                        access_time
                      </Icon>
                      {formatTimestamp(parseCustomDateTime(rec.ts))} — {rec.status} @
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
                  disabled={!downloadFormat || filteredData.length === 0}
                  onClick={() => {
                    const filename = `report_${selectedVehicle.id}_${new Date().getTime()}`;
                    if (downloadFormat === "csv") exportCSV(filteredData, `${filename}.csv`);
                    else if (downloadFormat === "excel")
                      exportExcel(filteredData, `${filename}.xlsx`);
                    else if (downloadFormat === "pdf") exportPDF(filteredData, `${filename}.pdf`);
                    AlertSuccess(`Exported to ${downloadFormat}`);
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
        {/* ---------------------------------------------------- */}
        {/* 🛑 END OF SIDEBAR CONTENT (Absolute MDBox) 🛑 */}
      </MDBox>
    </MDBox>
  );
};

export default LeafletControlsMap;
