import TextField from "@mui/material/TextField"; // The replacement input
import Grid from "@mui/material/Grid";

import React, { useEffect, useRef, useState, useMemo, useCallback } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-polylinedecorator";
import "leaflet-rotatedmarker";

import ApiService from "../../services/ApiService";
import { createTileLayers } from "../LoadCellReport/createTileLayers";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format } from "date-fns";

import { exportCSV, exportExcel, exportPDF } from "./../utils/downloadUtils";
import { AlertSuccess, callAlert } from "../../services/CommonService";

/* MUI components (used inside the panel) */
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import MDInput from "components/MDInput";
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
  const [speed] = useState(500); // animation speed (ms)
  const [fromMilliseconds, setFromMilliseconds] = useState("000"); // Store as a 3-digit string
  const [toMilliseconds, setToMilliseconds] = useState("000");

  const SIDEBAR_WIDTH = "300px";

  /* ---------- fetch vehicle list (IMEI) ---------- */
  useEffect(() => {
    const fetchVehicles = async () => {
      setIsLoading(true);
      try {
        const res = await ApiService.getVehicleImeis(1);
        const vehicles = res?.data?.response?.vehicles || [];
        setVehicleList(vehicles);

        // default vehicle – keep the old hard-coded IMEI if it exists
        const defaultImei = "868373076396961";
        const defaultVehicle = vehicles.find((v) => v.id === defaultImei) || vehicles[0];
        setSelectedVehicle(defaultVehicle || null);
      } catch (err) {
        console.error(err);
        callAlert("Failed to load vehicle list.");
        const fallback = { id: "868373076396961" };
        setVehicleList([fallback]);
        setSelectedVehicle(fallback);
      } finally {
        setIsLoading(false);
      }
    };
    fetchVehicles();
  }, []);

  /* ---------- filtered data (date + status) ---------- */
  const filteredData = useMemo(() => {
    return vehicleData.filter((r) => {
      const ts = new Date(r.ts).getTime();
      const dateOk = (!fromDate || ts >= fromDate.getTime()) && (!toDate || ts <= toDate.getTime());
      const statusOk = statusFilter.includes(r.status);
      return dateOk && statusOk;
    });
  }, [vehicleData, fromDate, toDate, statusFilter]);

  /* ---------- submit – call getTrackPlayHistory ---------- */
  const handleTrackSubmit = async () => {
    if (!selectedVehicle?.id) return callAlert("Please select a vehicle.");
    if (!fromDate || !toDate) return callAlert("Please select both From and To dates.");
    if (fromDate > toDate) return callAlert("'From' date cannot be after 'To' date.");

    setIsLoading(true);
    setShowHistory(false);
    setVehicleData([]);
    setHighlightedIndex(null);
    setShowOnlyPath(false);
    setStatusFilter(["MOTION", "STOP", "IDLE"]); // ← force all ON
    if (animationTimeoutRef.current) clearTimeout(animationTimeoutRef.current);
    if (vehicleLayerRef.current) vehicleLayerRef.current.clearLayers();

    try {
      const payload = {
        imei: selectedVehicle.id,
        startTime: fromDate.toISOString(),
        endTime: toDate.toISOString(),
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
      AlertSuccess(`Loaded ${sorted.length} points.`);
    } catch (err) {
      console.error(err);
      callAlert("Failed to load track data.");
    } finally {
      setIsLoading(false);
    }
  };

  /* ---------- animation (track play) ---------- */
  const simulateMovement = useCallback(() => {
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

    const pts = filteredData
      .map((r) => [+r.lat, +r.lng])
      .filter((p) => {
        const [lat, lng] = p;
        return (
          typeof lat === "number" &&
          typeof lng === "number" &&
          lat >= -90 &&
          lat <= 90 &&
          lng >= -180 &&
          lng <= 180 &&
          lat !== 0 &&
          lng !== 0 // optional: remove [0,0] if it's invalid
        );
      });

    if (pts.length < 2) {
      callAlert("Not enough points for animation.", "warning");
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
      map.panTo(next, { animate: true, duration: 0.5 });
      setHighlightedIndex(idx);
      animationTimeoutRef.current = setTimeout(moveNext, speed);
    };
    moveNext();
  }, [filteredData, speed]);

  const stopAnimation = () => {
    if (animationTimeoutRef.current) {
      clearTimeout(animationTimeoutRef.current);
      animationTimeoutRef.current = null;
    }
    setHighlightedIndex(null);
    callAlert("Animation stopped.", "info");
  };

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
  const blueIcon = new L.Icon({
    iconUrl:
      "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png",
    shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
  });

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
      }))({ position: "bottomright" })
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
      }))({ position: "bottomright" })
    );

    L.control.zoomview({ position: "topleft" }).addTo(map);
    L.control.scale().addTo(map);
    map.on("zoomend", () => {
      if (zoomDivRef.current) zoomDivRef.current.innerHTML = `Zoom: ${map.getZoom()}`;
    });

    return () => {
      if (animationTimeoutRef.current) clearTimeout(animationTimeoutRef.current);
      map.remove();
    };
  }, []);

  /* ---------- draw markers / polyline ---------- */
  useEffect(() => {
    const map = mapRef.current;
    const layer = vehicleLayerRef.current;
    if (!map || !layer) return;

    layer.clearLayers();
    if (animatedMarkerRef.current) {
      layer.removeLayer(animatedMarkerRef.current);
      animatedMarkerRef.current = null;
    }

    if (!showHistory || !selectedVehicle) return;

    const pts = filteredData
      .map((r) => [+r.lat, +r.lng])
      .filter((p) => {
        const [lat, lng] = p;
        return (
          typeof lat === "number" &&
          typeof lng === "number" &&
          lat >= -90 &&
          lat <= 90 &&
          lng >= -180 &&
          lng <= 180
        );
      });

    filteredData.forEach((rec, idx) => {
      const { lat, lng, ts, speed, status } = rec;
      if (!lat || !lng) return;

      if (!showOnlyPath && statusFilter.includes(status)) {
        let icon = status === "MOTION" ? greenIcon : status === "STOP" ? redIcon : yellowIcon;

        if (idx === highlightedIndex) icon = blueIcon;

        L.marker([+lat, +lng], { icon })
          .bindTooltip(
            `Time: ${formatTimestamp(ts)}<br/>Speed: ${
              speed ?? "N/A"
            } km/h<br/>Lat: ${+lat}<br/>Lng: ${+lng}<br/>Status: ${status}`
          )
          .addTo(layer);
      }
    });

    if (pts.length > 1 && highlightedIndex == null) {
      const line = L.polyline(pts, { color: "#00f", weight: 5, opacity: 0.7 }).addTo(layer);
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

      const bounds = line.getBounds();
      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [20, 20] });
      }
    } else if (pts.length === 1) {
      map.setView(pts[0], 14);
    }
  }, [
    filteredData,
    highlightedIndex,
    showHistory,
    showOnlyPath,
    statusFilter,
    selectedVehicle,
    greenIcon,
    redIcon,
    yellowIcon,
    blueIcon,
  ]);

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
          zIndex: 1000,
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
            value={selectedVehicle?.id || ""}
            onChange={(e) => {
              const veh = vehicleList.find((v) => v.id === e.target.value);
              setSelectedVehicle(veh);
              setShowHistory(false);
              setStatusFilter(["MOTION", "STOP", "IDLE"]); // ← reset
            }}
            fullWidth
            size="small"
            SelectProps={{ native: true }}
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
          <Grid container spacing={2}>
            {/* ----------------- FROM DATE/TIME PICKER ----------------- */}
            <Grid item xs={12} sm={6}>
              <MDBox>
                <MDTypography variant="caption" display="block" mb={0.5}>
                  From Date/Time
                </MDTypography>

                {/* DatePicker integrated here */}
                <div style={{ width: "100%" }}>
                  <DatePicker
                    selected={fromDate}
                    onChange={(date) => {
                      setFromDate(date);
                      // setShowHistory(false); // Uncomment if needed
                    }}
                    showTimeSelect
                    timeFormat="HH:mm:ss"
                    timeIntervals={1}
                    dateFormat="dd-MM-yyyy HH:mm:ss"
                    placeholderText="Select From DateTime"
                    // Use classes to ensure it looks like a standard form input
                    className="form-control"
                    calendarClassName="custom-calendar"
                    popperClassName="custom-popper"
                    // The inputProps are not directly available here, but className is used for styling
                    // to mimic full-width appearance.
                  />
                </div>
              </MDBox>
            </Grid>

            {/* ----------------- TO DATE/TIME PICKER ----------------- */}
            <Grid item xs={12} sm={6}>
              <MDBox>
                <MDTypography variant="caption" display="block" mb={0.5}>
                  To Date/Time
                </MDTypography>

                {/* DatePicker integrated here */}
                <div style={{ width: "100%" }}>
                  <DatePicker
                    selected={toDate}
                    onChange={(date) => {
                      setToDate(date);
                      // setShowHistory(false); // Uncomment if needed
                    }}
                    showTimeSelect
                    timeFormat="HH:mm:ss"
                    timeIntervals={1}
                    dateFormat="dd-MM-yyyy HH:mm:ss"
                    placeholderText="Select To DateTime"
                    // Use classes to ensure it looks like a standard form input
                    className="form-control"
                    calendarClassName="custom-to-calendar"
                    popperClassName="custom-to-popper"
                  />
                </div>
              </MDBox>
            </Grid>
          </Grid>
        </MDBox>
        Ausprey
        {/* Submit */}
        <MDButton
          variant="gradient"
          color="primary"
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

                          // Prevent all switches from being OFF
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

            {/* Play / Stop */}
            <MDBox display="flex" gap={1} mb={2}>
              <MDButton
                variant="gradient"
                color="success"
                onClick={simulateMovement}
                disabled={filteredData.length < 2}
                sx={{ flex: 1 }}
              >
                Play
              </MDButton>
              <MDButton variant="gradient" color="error" onClick={stopAnimation} sx={{ flex: 1 }}>
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
                        mapRef.current.setView([+rec.lat, +rec.lng], 16, {
                          animate: true,
                        });
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
                  <option value="">-- Format --</option>
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
                    const name = `report_${selectedVehicle.id}_${Date.now()}`;
                    if (downloadFormat === "csv") exportCSV(filteredData, `${name}.csv`);
                    else if (downloadFormat === "excel") exportExcel(filteredData, `${name}.xlsx`);
                    else if (downloadFormat === "pdf") exportPDF(filteredData, `${name}.pdf`);
                    AlertSuccess(`Exported as ${downloadFormat}`);
                    setShowDownload(false);
                  }}
                >
                  Download
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
