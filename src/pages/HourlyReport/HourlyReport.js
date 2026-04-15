import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import PropTypes from "prop-types";
import Autocomplete from "@mui/material/Autocomplete";
import MenuItem from "@mui/material/MenuItem";

import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";
import Icon from "@mui/material/Icon";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import CircularProgress from "@mui/material/CircularProgress";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import Collapse from "@mui/material/Collapse";
import Box from "@mui/material/Box";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TablePagination from "@mui/material/TablePagination";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";

import MDBox from "../../assets/components/MDBox";
import MDTypography from "../../assets/components/MDTypography";
import MDButton from "../../assets/components/MDButton";
import ApiService from "../../services/ApiService";

// ─── Leaflet CDN ───────────────────────────────────────────────────────────────
const LEAFLET_CSS = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.css";
const LEAFLET_JS = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.js";

// ─── Helpers ───────────────────────────────────────────────────────────────────

/** Parse "(lat,lng)" from location strings like "Some Address (22.34,73.17)" */
const parseLatLng = (locationStr) => {
  if (!locationStr) return null;
  const match = locationStr.match(/\((-?\d+\.?\d*),\s*(-?\d+\.?\d*)\)/);
  if (!match) return null;
  return { lat: parseFloat(match[1]), lng: parseFloat(match[2]) };
};

/** Convert epoch seconds → readable date-time */
const epochToTime = (epochSeconds) => {
  if (!epochSeconds) return "—";
  // The API returns seconds since midnight (duration style), not unix epoch.
  // Total seconds in day context: convert to HH:MM:SS
  const h = Math.floor(epochSeconds / 3600) % 24;
  const m = Math.floor((epochSeconds % 3600) / 60);
  const s = epochSeconds % 60;
  const pad = (n) => String(n).padStart(2, "0");
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
};

/** Format minutes into "Xh Ym" */
const formatDuration = (minutes) => {
  if (minutes == null) return "—";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
};

// ─── Styles ────────────────────────────────────────────────────────────────────
const tableHeadSx = {
  "& .MuiTableCell-root": {
    backgroundColor: "#f8f9fa",
    color: "#7b809a",
    fontSize: "0.72rem",
    fontWeight: 700,
    opacity: 0.85,
    borderBottom: "1px solid #f0f2f5",
    textTransform: "uppercase",
    letterSpacing: "0.04em",
    padding: "10px 14px",
    whiteSpace: "nowrap",
  },
};

const tableBodySx = {
  "& .MuiTableRow-root:hover": { backgroundColor: "#f5f8ff" },
  "& .MuiTableCell-root": {
    padding: "10px 14px",
    fontSize: "0.82rem",
    borderBottom: "1px solid #f0f2f5",
    verticalAlign: "middle",
  },
};

// ─── SessionMap: embedded Leaflet map with animated vehicle ───────────────────
const SessionMap = ({ session, vehNum, imei }) => {
  const mapDivRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const animTimerRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0); // 0–100
  const [leafletReady, setLeafletReady] = useState(typeof window.L !== "undefined");

  const startPt = parseLatLng(session.startLocation);
  const endPt = parseLatLng(session.endLocation);

  // Build interpolated route between start & end (10 steps)
  const routePoints = useMemo(() => {
    if (!startPt || !endPt) return [];
    const steps = 20;
    return Array.from({ length: steps + 1 }, (_, i) => ({
      lat: startPt.lat + ((endPt.lat - startPt.lat) * i) / steps,
      lng: startPt.lng + ((endPt.lng - startPt.lng) * i) / steps,
    }));
  }, [session.startLocation, session.endLocation]);

  // Load Leaflet if not already available
  useEffect(() => {
    if (typeof window.L !== "undefined") {
      setLeafletReady(true);
      return;
    }
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = LEAFLET_CSS;
    document.head.appendChild(link);
    const script = document.createElement("script");
    script.src = LEAFLET_JS;
    script.async = true;
    script.onload = () => setLeafletReady(true);
    document.head.appendChild(script);
  }, []);

  // Init map
  useEffect(() => {
    if (!leafletReady || !mapDivRef.current || routePoints.length < 2) return;
    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }

    const L = window.L;
    const center = routePoints[0];
    const map = L.map(mapDivRef.current, { zoomControl: true }).setView(
      [center.lat, center.lng],
      13
    );
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap",
      maxZoom: 19,
    }).addTo(map);

    // Draw polyline
    const latLngs = routePoints.map((p) => [p.lat, p.lng]);
    const poly = L.polyline(latLngs, { color: "#1976d2", weight: 4, opacity: 0.85 }).addTo(map);
    map.fitBounds(poly.getBounds(), { padding: [30, 30] });

    // Start marker (green)
    L.marker([routePoints[0].lat, routePoints[0].lng], {
      icon: L.divIcon({
        html: `<div style="background:#4caf50;color:#fff;padding:3px 7px;border-radius:10px;font-size:11px;font-weight:700;box-shadow:0 2px 5px rgba(0,0,0,0.25);">START</div>`,
        className: "",
        iconSize: [55, 24],
        iconAnchor: [27, 24],
      }),
    }).addTo(map);

    // End marker (red)
    L.marker([routePoints[routePoints.length - 1].lat, routePoints[routePoints.length - 1].lng], {
      icon: L.divIcon({
        html: `<div style="background:#f44336;color:#fff;padding:3px 7px;border-radius:10px;font-size:11px;font-weight:700;box-shadow:0 2px 5px rgba(0,0,0,0.25);">END</div>`,
        className: "",
        iconSize: [50, 24],
        iconAnchor: [25, 24],
      }),
    }).addTo(map);

    // Vehicle marker
    const vehicleIcon = L.divIcon({
      html: `<div style="width:28px;height:28px;background:linear-gradient(135deg,#1976d2,#42a5f5);border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px rgba(25,118,210,0.5);border:2px solid #fff;">
               <span style="font-size:15px;">🚛</span>
             </div>`,
      className: "",
      iconSize: [28, 28],
      iconAnchor: [14, 14],
    });
    markerRef.current = L.marker([center.lat, center.lng], { icon: vehicleIcon }).addTo(map);
    markerRef.current.bindPopup(`<b>${vehNum}</b><br>IMEI: ${imei}`);

    mapRef.current = map;
    setTimeout(() => map.invalidateSize(), 300);

    return () => {
      if (animTimerRef.current) clearInterval(animTimerRef.current);
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [leafletReady, routePoints, vehNum, imei]);

  // Animation control
  const startAnimation = useCallback(() => {
    if (!markerRef.current || routePoints.length < 2) return;
    if (animTimerRef.current) clearInterval(animTimerRef.current);

    const L = window.L;
    let idx = 0;
    setProgress(0);
    setIsPlaying(true);

    // Speed: cover all points in ~8 seconds
    const intervalMs = Math.max(200, 8000 / routePoints.length);

    animTimerRef.current = setInterval(() => {
      if (idx >= routePoints.length) {
        clearInterval(animTimerRef.current);
        setIsPlaying(false);
        setProgress(100);
        return;
      }
      const pt = routePoints[idx];
      markerRef.current.setLatLng([pt.lat, pt.lng]);
      mapRef.current?.panTo([pt.lat, pt.lng], { animate: true, duration: 0.3 });
      setProgress(Math.round((idx / (routePoints.length - 1)) * 100));
      idx++;
    }, intervalMs);
  }, [routePoints]);

  const stopAnimation = useCallback(() => {
    if (animTimerRef.current) clearInterval(animTimerRef.current);
    setIsPlaying(false);
    setProgress(0);
    // Reset marker to start
    if (markerRef.current && routePoints.length > 0) {
      markerRef.current.setLatLng([routePoints[0].lat, routePoints[0].lng]);
      mapRef.current?.panTo([routePoints[0].lat, routePoints[0].lng]);
    }
  }, [routePoints]);

  if (!startPt || !endPt) {
    return (
      <Box
        sx={{
          height: 300,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "#f5f5f5",
          borderRadius: 2,
        }}
      >
        <MDTypography variant="caption" color="text">
          Location data unavailable for map
        </MDTypography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Map controls */}
      <Box display="flex" alignItems="center" gap={1} mb={1}>
        <Button
          size="small"
          variant="contained"
          color="success"
          startIcon={<Icon>play_arrow</Icon>}
          onClick={startAnimation}
          disabled={isPlaying}
        >
          Simulate
        </Button>
        <Button
          size="small"
          variant="outlined"
          color="inherit"
          startIcon={<Icon>stop</Icon>}
          onClick={stopAnimation}
          disabled={!isPlaying && progress === 0}
        >
          Reset
        </Button>
        <Box flex={1} sx={{ ml: 1 }}>
          <Box sx={{ height: 6, background: "#e0e0e0", borderRadius: 3, overflow: "hidden" }}>
            <Box
              sx={{
                height: "100%",
                width: `${progress}%`,
                background: "linear-gradient(90deg,#1976d2,#42a5f5)",
                borderRadius: 3,
                transition: "width 0.2s ease",
              }}
            />
          </Box>
        </Box>
        <MDTypography variant="caption" color="info" fontWeight="bold" sx={{ minWidth: 36 }}>
          {progress}%
        </MDTypography>
      </Box>

      {/* Leaflet map container */}
      {leafletReady ? (
        <div
          ref={mapDivRef}
          style={{
            width: "100%",
            height: 340,
            borderRadius: 8,
            zIndex: 1,
            border: "1px solid #e0e0e0",
          }}
        />
      ) : (
        <Box
          height={340}
          display="flex"
          alignItems="center"
          justifyContent="center"
          bgcolor="#f5f5f5"
          borderRadius={2}
        >
          <CircularProgress size={28} />
          <MDTypography variant="caption" sx={{ ml: 1 }}>
            Loading map…
          </MDTypography>
        </Box>
      )}
    </Box>
  );
};

SessionMap.propTypes = {
  session: PropTypes.object.isRequired,
  vehNum: PropTypes.string.isRequired,
  imei: PropTypes.string.isRequired,
};

// ─── Session Detail Panel (expanded row content) ──────────────────────────────
const SessionDetailPanel = ({ record }) => {
  const [activeSession, setActiveSession] = useState(0);

  const session = record.sessions[activeSession];

  return (
    <Box sx={{ m: 2, p: 2, background: "#fff", border: "1px solid #e0e0e0", borderRadius: 2 }}>
      <Grid container spacing={3}>
        {/* Left: session info */}
        <Grid item xs={12} md={4}>
          <MDTypography variant="h6" gutterBottom>
            Session Details
          </MDTypography>

          {/* Session tabs */}
          <Box display="flex" flexWrap="wrap" gap={0.8} mb={2}>
            {record.sessions.map((s, i) => (
              <Chip
                key={i}
                label={`Session ${i + 1}`}
                size="small"
                color={activeSession === i ? "info" : "default"}
                onClick={() => setActiveSession(i)}
                sx={{ cursor: "pointer", fontWeight: activeSession === i ? 700 : 400 }}
              />
            ))}
          </Box>

          {/* Session stats */}
          {[
            { label: "Start Time", value: epochToTime(session.startTime), icon: "schedule" },
            { label: "End Time", value: epochToTime(session.endTime), icon: "flag" },
            { label: "Duration", value: `${session.duration} min`, icon: "timer" },
            { label: "Distance", value: `${session.distance} km`, icon: "straighten" },
            { label: "GPS Distance", value: `${session.gpsDistance} km`, icon: "gps_fixed" },
            { label: "Avg Speed", value: `${session.avgSpeed} km/h`, icon: "speed" },
            { label: "Status", value: session.status, icon: "info" },
          ].map(({ label, value, icon }) => (
            <Box
              key={label}
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                py: 0.6,
                borderBottom: "0.5px solid #f0f0f0",
              }}
            >
              <Box display="flex" alignItems="center" gap={0.5}>
                <Icon sx={{ fontSize: 14, color: "info.main" }}>{icon}</Icon>
                <MDTypography
                  variant="caption"
                  color="text"
                  sx={{ opacity: 0.65, fontSize: "0.7rem" }}
                >
                  {label}
                </MDTypography>
              </Box>
              <MDTypography variant="caption" fontWeight="bold" sx={{ fontSize: "0.75rem" }}>
                {value}
              </MDTypography>
            </Box>
          ))}

          {/* Locations */}
          <Box mt={1.5}>
            <MDTypography
              variant="caption"
              color="text"
              sx={{
                opacity: 0.55,
                fontSize: "0.65rem",
                textTransform: "uppercase",
                letterSpacing: 1,
              }}
            >
              Start Location
            </MDTypography>
            <MDTypography
              variant="caption"
              display="block"
              sx={{ fontSize: "0.7rem", mt: 0.3, lineHeight: 1.4 }}
            >
              {session.startLocation || "—"}
            </MDTypography>
          </Box>
          <Box mt={1}>
            <MDTypography
              variant="caption"
              color="text"
              sx={{
                opacity: 0.55,
                fontSize: "0.65rem",
                textTransform: "uppercase",
                letterSpacing: 1,
              }}
            >
              End Location
            </MDTypography>
            <MDTypography
              variant="caption"
              display="block"
              sx={{ fontSize: "0.7rem", mt: 0.3, lineHeight: 1.4 }}
            >
              {session.endLocation || "—"}
            </MDTypography>
          </Box>

          {/* Trip summary */}
          <Box mt={2} p={1.5} sx={{ background: "#f5f8ff", borderRadius: 2 }}>
            <MDTypography
              variant="caption"
              fontWeight="bold"
              sx={{
                fontSize: "0.65rem",
                opacity: 0.5,
                textTransform: "uppercase",
                letterSpacing: 1,
                display: "block",
                mb: 0.5,
              }}
            >
              Daily Summary
            </MDTypography>
            {[
              { label: "Total Distance", value: `${record.totalDistance} km` },
              { label: "Total Duration", value: formatDuration(record.totalDuration) },
              { label: "Date", value: record.repDate },
              { label: "Vehicle", value: record.vehNum },
            ].map(({ label, value }) => (
              <Box key={label} display="flex" justifyContent="space-between" py={0.3}>
                <MDTypography variant="caption" sx={{ fontSize: "0.68rem", opacity: 0.6 }}>
                  {label}
                </MDTypography>
                <MDTypography variant="caption" fontWeight="bold" sx={{ fontSize: "0.68rem" }}>
                  {value}
                </MDTypography>
              </Box>
            ))}
          </Box>
        </Grid>

        {/* Right: map */}
        <Grid item xs={12} md={8}>
          <MDTypography variant="h6" gutterBottom>
            Vehicle Movement — Session {activeSession + 1}
          </MDTypography>
          <SessionMap
            key={`${record.imei}-${activeSession}`}
            session={session}
            vehNum={record.vehNum}
            imei={record.imei}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

SessionDetailPanel.propTypes = {
  record: PropTypes.object.isRequired,
};

// ─── Date Filter Bar ──────────────────────────────────────────────────────────
const DateFilterBar = ({
  startDate,
  endDate,
  imei,
  onStartDate,
  onEndDate,
  onImei,
  onFetch,
  isLoading,
  imeiList, // New Prop
  imeiLoading, // New Prop
}) => (
  <Box
    display="flex"
    flexWrap="wrap"
    gap={2}
    alignItems="center"
    mb={2.5}
    sx={{ p: 2, background: "#f8f9ff", borderRadius: 2, border: "1px solid #e8eaf6" }}
  >
    <Autocomplete
      options={imeiList}
      loading={imeiLoading}
      getOptionLabel={(option) =>
        option.vehnum ? `${option.vehnum} (${option.imei})` : option.imei
      }
      // Match the current string imei to the object in the list
      value={imeiList.find((item) => item.imei === imei) || null}
      onChange={(event, newValue) => {
        onImei(newValue ? newValue.imei : "");
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          label="Select Vehicle/IMEI"
          size="small"
          sx={{ minWidth: 250 }}
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {imeiLoading ? <CircularProgress color="inherit" size={20} /> : null}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
    />
    <TextField
      label="Start Date"
      type="date"
      size="small"
      value={startDate}
      onChange={(e) => onStartDate(e.target.value)}
      InputLabelProps={{ shrink: true }}
    />
    <TextField
      label="End Date"
      type="date"
      size="small"
      value={endDate}
      onChange={(e) => onEndDate(e.target.value)}
      InputLabelProps={{ shrink: true }}
    />
    <MDButton
      variant="gradient"
      color="info"
      size="small"
      onClick={onFetch}
      disabled={isLoading || !imei || !startDate || !endDate}
      startIcon={isLoading ? <CircularProgress size={14} color="inherit" /> : <Icon>search</Icon>}
    >
      {isLoading ? "Fetching…" : "Get Report"}
    </MDButton>
  </Box>
);

DateFilterBar.propTypes = {
  startDate: PropTypes.string.isRequired,
  endDate: PropTypes.string.isRequired,
  imei: PropTypes.string.isRequired,
  onStartDate: PropTypes.func.isRequired,
  onEndDate: PropTypes.func.isRequired,
  onImei: PropTypes.func.isRequired,
  onFetch: PropTypes.func.isRequired,
  isLoading: PropTypes.bool.isRequired,
  imeiList: PropTypes.array.isRequired,
  imeiLoading: PropTypes.bool.isRequired,
};

// ─── Main Component ───────────────────────────────────────────────────────────
function HourlyReport({ accountId }) {
  const today = new Date().toISOString().slice(0, 10);
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);

  const [imei, setImei] = useState("869356078380744");
  const [startDate, setStartDate] = useState(yesterday);
  const [endDate, setEndDate] = useState(today);

  const [records, setRecords] = useState([]); // array of daily records from API
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [expandedId, setExpandedId] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [imeiList, setImeiList] = useState([]); // List for dropdown
  const [imeiLoading, setImeiLoading] = useState(false);

  useEffect(() => {
    const fetchImeis = async () => {
      setImeiLoading(true);
      try {
        // accountId is passed as a prop to HourlyReport
        const res = await ApiService.getImeiDropdown(accountId);

        // Based on your ApiService.js, the data is at: res.data.response.vehicles
        const vehicles = res?.data?.response?.vehicles || [];
        setImeiList(vehicles);

        // Optional: Set the first IMEI as default if none selected
        if (vehicles.length > 0 && !imei) {
          setImei(vehicles[0].imei);
        }
      } catch (err) {
        console.error("Failed to fetch IMEI list:", err);
      } finally {
        setImeiLoading(false);
      }
    };

    fetchImeis();
  }, [accountId]);

  // Format date for API: "DD/MM/YYYY"
  const formatDateForApi = (isoDate) => {
    if (!isoDate) return "";
    const [y, m, d] = isoDate.split("-");
    return `${d}/${m}/${y}`;
  };

  const fetchReport = async () => {
    if (!imei || !startDate || !endDate) return;
    setIsLoading(true);
    setError(null);
    setRecords([]);
    setExpandedId(null);

    try {
      const payload = {
        imei,
        startDate: formatDateForApi(startDate),
        endDate: formatDateForApi(endDate),
      };

      const res = await ApiService.getWorkingHourReport(payload);
      const data = res?.data?.data || [];

      if (!data.length) {
        setError("No data found for the selected filters.");
      } else {
        setRecords(data);
      }
    } catch (err) {
      console.error("Working hour report error:", err);
      setError("Failed to fetch report. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-fetch on mount
  useEffect(() => {
    fetchReport();
  }, []);

  // Filter records by search
  const filteredRecords = useMemo(() => {
    if (!searchTerm) return records;
    const term = searchTerm.toLowerCase();
    return records.filter(
      (r) =>
        r.imei?.toLowerCase().includes(term) ||
        r.vehNum?.toLowerCase().includes(term) ||
        r.repDate?.includes(term)
    );
  }, [records, searchTerm]);

  // Each record may have multiple sessions — flatten for table display
  // But we show one row per record (daily), expandable to sessions
  const paginatedRecords = filteredRecords.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <MDBox pt={6} pb={3} ml={11}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Card>
            {/* Header */}
            <MDBox
              mx={2}
              mt={-3}
              py={3}
              px={2}
              variant="gradient"
              bgColor="info"
              borderRadius="lg"
              coloredShadow="info"
              display="flex"
              justifyContent="space-between"
              alignItems="center"
            >
              <MDBox display="flex" alignItems="center" gap={1}>
                <Icon sx={{ color: "#fff", fontSize: 22 }}>directions_car</Icon>
                <MDTypography variant="h6" color="white">
                  Working Hour Report
                </MDTypography>
              </MDBox>
              <MDTypography variant="caption" color="white" sx={{ opacity: 0.8 }}>
                {records.length} record{records.length !== 1 ? "s" : ""} loaded
              </MDTypography>
            </MDBox>

            <MDBox p={3}>
              {/* Date / IMEI filter */}
              <DateFilterBar
                imei={imei}
                onImei={setImei}
                startDate={startDate}
                onStartDate={setStartDate}
                endDate={endDate}
                onEndDate={setEndDate}
                onFetch={fetchReport}
                isLoading={isLoading}
                imeiList={imeiList} // Pass list
                imeiLoading={imeiLoading} // Pass loading state
              />

              {/* Search bar */}
              <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <MDTypography variant="button" color="text" fontWeight="regular">
                  Showing <strong>{filteredRecords.length}</strong> record(s)
                </MDTypography>
                <TextField
                  size="small"
                  placeholder="Search IMEI, vehicle, date…"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Icon>search</Icon>
                      </InputAdornment>
                    ),
                  }}
                  sx={{ minWidth: 260 }}
                />
              </MDBox>

              {/* Error */}
              {error && (
                <Box
                  sx={{
                    p: 2,
                    mb: 2,
                    background: "#fff3e0",
                    borderRadius: 2,
                    border: "1px solid #ffe0b2",
                  }}
                >
                  <MDTypography variant="caption" color="warning">
                    {error}
                  </MDTypography>
                </Box>
              )}

              {/* Loading */}
              {isLoading && (
                <Box display="flex" justifyContent="center" alignItems="center" py={4}>
                  <CircularProgress size={32} />
                  <MDTypography variant="button" sx={{ ml: 2 }}>
                    Fetching report…
                  </MDTypography>
                </Box>
              )}

              {/* Table */}
              {!isLoading && filteredRecords.length > 0 && (
                <TableContainer
                  sx={{ boxShadow: "none", border: "1px solid #f0f2f5", borderRadius: 2 }}
                >
                  <Table sx={{ tableLayout: "fixed", width: "100%" }}>
                    <colgroup>
                      <col style={{ width: "10%" }} />
                      <col style={{ width: "14%" }} />
                      <col style={{ width: "14%" }} />
                      <col style={{ width: "12%" }} />
                      <col style={{ width: "11%" }} />
                      <col style={{ width: "11%" }} />
                      <col style={{ width: "11%" }} />
                      <col style={{ width: "8%" }} />
                    </colgroup>
                    <TableHead sx={tableHeadSx}>
                      <TableRow>
                        <TableCell align="center">Actions</TableCell>
                        <TableCell>IMEI</TableCell>
                        <TableCell>Vehicle No.</TableCell>
                        <TableCell align="center">Date</TableCell>
                        <TableCell align="center">Sessions</TableCell>
                        <TableCell align="center">Total Dist.</TableCell>
                        <TableCell align="center">Total Duration</TableCell>
                        <TableCell align="center">Status</TableCell>
                      </TableRow>
                    </TableHead>

                    <TableBody sx={tableBodySx}>
                      {paginatedRecords.map((record) => {
                        const isExpanded = expandedId === record.id;

                        return (
                          <React.Fragment key={record.id}>
                            {/* Main row */}
                            <TableRow
                              sx={{
                                "& > *": { borderBottom: "unset" },
                                backgroundColor: isExpanded ? "#f1f8ff" : "inherit",
                              }}
                            >
                              <TableCell align="center">
                                <Tooltip title={isExpanded ? "Collapse" : "View Sessions & Map"}>
                                  <IconButton
                                    size="small"
                                    onClick={() =>
                                      setExpandedId((prev) =>
                                        prev === record.id ? null : record.id
                                      )
                                    }
                                    color={isExpanded ? "info" : "default"}
                                  >
                                    <Icon>{isExpanded ? "expand_less" : "expand_more"}</Icon>
                                  </IconButton>
                                </Tooltip>
                              </TableCell>
                              <TableCell>
                                <MDTypography
                                  variant="caption"
                                  fontWeight="medium"
                                  sx={{ fontFamily: "monospace", fontSize: "0.75rem" }}
                                >
                                  {record.imei}
                                </MDTypography>
                              </TableCell>
                              <TableCell>
                                <MDTypography variant="caption" fontWeight="bold" color="info">
                                  {record.vehNum || "—"}
                                </MDTypography>
                              </TableCell>
                              <TableCell align="center">
                                <MDTypography variant="caption">
                                  {record.repDate || "—"}
                                </MDTypography>
                              </TableCell>
                              <TableCell align="center">
                                <Chip
                                  label={`${record.sessions?.length ?? 0} session${record.sessions?.length !== 1 ? "s" : ""}`}
                                  size="small"
                                  color="primary"
                                  variant="outlined"
                                  sx={{ fontSize: "0.68rem" }}
                                />
                              </TableCell>
                              <TableCell align="center">
                                <MDTypography variant="caption" fontWeight="bold">
                                  {record.totalDistance ?? "—"} km
                                </MDTypography>
                              </TableCell>
                              <TableCell align="center">
                                <MDTypography variant="caption">
                                  {formatDuration(record.totalDuration)}
                                </MDTypography>
                              </TableCell>
                              <TableCell align="center">
                                <Chip
                                  label={
                                    record.sessions?.every((s) => s.status === "COMPLETE")
                                      ? "Complete"
                                      : "Partial"
                                  }
                                  size="small"
                                  color={
                                    record.sessions?.every((s) => s.status === "COMPLETE")
                                      ? "success"
                                      : "warning"
                                  }
                                  sx={{ fontSize: "0.65rem" }}
                                />
                              </TableCell>
                            </TableRow>

                            {/* Expanded row */}
                            <TableRow>
                              <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={8}>
                                <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                                  <SessionDetailPanel record={record} />
                                </Collapse>
                              </TableCell>
                            </TableRow>
                          </React.Fragment>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}

              {/* Pagination */}
              {!isLoading && filteredRecords.length > 0 && (
                <TablePagination
                  rowsPerPageOptions={[10, 25, 50]}
                  component="div"
                  count={filteredRecords.length}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onPageChange={(_, p) => setPage(p)}
                  onRowsPerPageChange={(e) => {
                    setRowsPerPage(parseInt(e.target.value, 10));
                    setPage(0);
                  }}
                />
              )}
            </MDBox>
          </Card>
        </Grid>
      </Grid>
    </MDBox>
  );
}

HourlyReport.propTypes = {
  accountId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
};

export default HourlyReport;

