import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-polylinedecorator";
import "leaflet-geometryutil";
import simplify from "simplify-js";
import ApiService from "../../services/ApiService";
import { getRotatingTruckHtml } from "../LiveTrack/LiveTrack.styles";
import MDBox from "../../assets/components/MDBox";
import MDTypography from "../../assets/components/MDTypography";
import CircularProgress from "@mui/material/CircularProgress";
import Icon from "@mui/material/Icon";
import PropTypes from "prop-types";

/* -------------------------------------------------
   HELPER
------------------------------------------------- */
const formatTimestamp = (input) => {
  const d = new Date(input);
  if (isNaN(d)) return input ?? "—";
  const pad = (n) => String(n).padStart(2, "0");
  return `${pad(d.getDate())}-${pad(d.getMonth() + 1)}-${d.getFullYear()} ${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
};

/* -------------------------------------------------
   COMPONENT
------------------------------------------------- */
const MiniTrackPlayer = ({ imei, fromDate, toDate, isPlaying }) => {
  const mapRef = useRef(null);
  const layerRef = useRef(null);
  const animationTimerRef = useRef(null);
  const mapId = useRef(`map-${Math.random().toString(36).substr(2, 9)}`);

  // Ref to persist animation state (index and marker) between play/pause toggles
  const playbackRef = useRef({
    idx: 0,
    points: [],
    marker: null,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [totalPoints, setTotalPoints] = useState(0);

  // ─── NEW: live playback info state ───────────────────────────────────────────
  const [currentInfo, setCurrentInfo] = useState(null); // current GPS record
  const [currentIdx, setCurrentIdx] = useState(0); // current index for progress bar

  // 1. Initialize Map
  useEffect(() => {
    if (!mapRef.current) {
      const map = L.map(mapId.current, { zoomControl: true }).setView([22.5, 75.6], 5);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(map);
      layerRef.current = L.layerGroup().addTo(map);
      mapRef.current = map;
    }

    return () => {
      if (animationTimerRef.current) clearTimeout(animationTimerRef.current);
      if (mapRef.current) mapRef.current.remove();
    };
  }, []);

  // 2. Fetch and Setup static layers when dates/imei change
  useEffect(() => {
    const fetchAndSetup = async () => {
      if (!imei || !fromDate || !toDate) return;

      setIsLoading(true);
      if (animationTimerRef.current) clearTimeout(animationTimerRef.current);
      layerRef.current.clearLayers();

      // Reset playback reference and panel state
      playbackRef.current = { idx: 0, points: [], marker: null };
      setCurrentInfo(null);
      setCurrentIdx(0);
      setTotalPoints(0);

      try {
        const payload = { imei, startTime: fromDate, endTime: toDate };
        const res = await ApiService.getTrackPlayHistory(payload);
        const points = res?.data?.response?.report || [];

        if (points.length < 2) return;

        setTotalPoints(points.length);

        // Draw static Polyline
        const latLngs = points.map((p) => [+p.lat, +p.lng]);
        const line = L.polyline(latLngs, { color: "#3388ff", weight: 4 }).addTo(layerRef.current);
        mapRef.current.fitBounds(line.getBounds(), { padding: [30, 30] });

        // Initialize Marker at start point
        const marker = L.marker([+points[0].lat, +points[0].lng], {
          icon: L.divIcon({
            className: "rotating-truck-container",
            html: getRotatingTruckHtml(points[0].status, 0),
            iconSize: [30, 30],
            iconAnchor: [15, 15],
          }),
        }).addTo(layerRef.current);

        // Store data in ref for the animation loop
        playbackRef.current.points = points;
        playbackRef.current.marker = marker;

        // Show first point info in panel immediately
        setCurrentInfo(points[0]);
      } catch (err) {
        console.error("MiniPlayer Error:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAndSetup();
  }, [imei, fromDate, toDate]);

  // 3. Animation Logic triggered by isPlaying prop
  useEffect(() => {
    const step = () => {
      const { idx, points, marker } = playbackRef.current;
      const map = mapRef.current;

      if (!points || !marker || !map || idx >= points.length) {
        if (animationTimerRef.current) clearTimeout(animationTimerRef.current);
        return;
      }

      const p = points[idx];
      const lat = +p.lat;
      const lng = +p.lng;

      // 1. Move the marker
      marker.setLatLng([lat, lng]);

      // 2. Auto-pan & zoom
      map.setView([lat, lng], 16, {
        animate: true,
        pan: { duration: 0.5 },
      });

      // Calculate bearing for rotation
      if (idx > 0) {
        const bearing = L.GeometryUtil.bearing(
          L.latLng(+points[idx - 1].lat, +points[idx - 1].lng),
          L.latLng(lat, lng)
        );
        marker.setIcon(
          L.divIcon({
            className: "rotating-truck-container",
            html: getRotatingTruckHtml(p.status, bearing - 90),
            iconSize: [30, 30],
            iconAnchor: [15, 15],
          })
        );
      }

      // ─── NEW: update panel state ────────────────────────────────────────────
      setCurrentInfo(p);
      setCurrentIdx(idx);
      // ────────────────────────────────────────────────────────────────────────

      playbackRef.current.idx++;
      animationTimerRef.current = setTimeout(step, 500);
    };

    if (isPlaying) {
      step();
    } else {
      if (animationTimerRef.current) clearTimeout(animationTimerRef.current);
    }

    return () => {
      if (animationTimerRef.current) clearTimeout(animationTimerRef.current);
    };
  }, [isPlaying]);

  /* ── Derived values for the info panel ─────────────────────────────────── */
  const progressPct = totalPoints > 1 ? Math.round((currentIdx / (totalPoints - 1)) * 100) : 0;

  const statusColor =
    currentInfo?.status === "MOTION"
      ? { bg: "#e8f5e9", text: "#2e7d32" }
      : currentInfo?.status === "STOP"
        ? { bg: "#ffebee", text: "#c62828" }
        : { bg: "#fff8e1", text: "#f57f17" };

  /* ── Info panel rows helper ─────────────────────────────────────────────── */
  const InfoRow = ({ icon, label, value }) => (
    <MDBox
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        py: 0.4,
        borderBottom: "0.5px solid #f0f0f0",
      }}
    >
      <MDBox sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
        <Icon sx={{ fontSize: 13, color: "info.main" }}>{icon}</Icon>
        <MDTypography variant="caption" color="text" sx={{ fontSize: "0.65rem", opacity: 0.6 }}>
          {label}
        </MDTypography>
      </MDBox>
      <MDTypography variant="caption" fontWeight="bold" sx={{ fontSize: "0.68rem" }}>
        {value}
      </MDTypography>
    </MDBox>
  );
  // props

  InfoRow.propTypes = {
    icon: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  };

  /* ── Render ─────────────────────────────────────────────────────────────── */
  return (
    <MDBox position="relative" height="100%" width="100%" sx={{ overflow: "hidden" }}>
      {/* Loading overlay */}
      {isLoading && (
        <MDBox
          sx={{
            position: "absolute",
            zIndex: 1000,
            top: "50%",
            left: "45%",
            transform: "translate(-50%, -50%)",
          }}
        >
          <CircularProgress size={30} />
        </MDBox>
      )}

      {/* Map */}
      <div id={mapId.current} style={{ height: "100%", width: "100%", borderRadius: "8px" }} />

      {/* ── RIGHT INFO PANEL ──────────────────────────────────────────────── */}
      {totalPoints > 0 && (
        <MDBox
          sx={{
            position: "absolute",
            top: 10,
            right: 10,
            width: 220,
            zIndex: 1000,
            display: "flex",
            flexDirection: "column",
            gap: 1,
            pointerEvents: "none", // allow map interaction through the panel
          }}
        >
          {/* ── Trip summary card ── */}
          <MDBox
            sx={{
              background: "rgba(255,255,255,0.97)",
              borderRadius: 2,
              boxShadow: "0 2px 8px rgba(0,0,0,0.14)",
              p: 1.5,
              pointerEvents: "auto",
            }}
          >
            <MDTypography
              variant="caption"
              fontWeight="bold"
              sx={{
                fontSize: "0.6rem",
                opacity: 0.45,
                textTransform: "uppercase",
                letterSpacing: 1,
                display: "block",
                mb: 0.5,
              }}
            >
              Trip Range
            </MDTypography>
            <InfoRow
              icon="schedule"
              label="From"
              value={fromDate ? new Date(fromDate).toLocaleString() : "—"}
            />
            <InfoRow
              icon="flag"
              label="To"
              value={toDate ? new Date(toDate).toLocaleString() : "—"}
            />
            <InfoRow icon="pin_drop" label="Points" value={`${totalPoints}`} />
          </MDBox>

          {/* ── Live playback card ── */}
          <MDBox
            sx={{
              background: "rgba(255,255,255,0.97)",
              borderRadius: 2,
              boxShadow: "0 2px 8px rgba(0,0,0,0.14)",
              p: 1.5,
              pointerEvents: "auto",
            }}
          >
            {/* Live dot + label */}
            <MDBox sx={{ display: "flex", alignItems: "center", gap: 0.8, mb: 1 }}>
              <MDBox
                sx={{
                  width: 7,
                  height: 7,
                  borderRadius: "50%",
                  background: isPlaying ? "#4caf50" : "#bdbdbd",
                  transition: "background 0.3s",
                  // pulsing when playing
                  animation: isPlaying ? "pulse 1.2s ease-in-out infinite" : "none",
                  "@keyframes pulse": {
                    "0%, 100%": { opacity: 1 },
                    "50%": { opacity: 0.3 },
                  },
                }}
              />
              <MDTypography
                variant="caption"
                fontWeight="bold"
                sx={{
                  fontSize: "0.6rem",
                  opacity: 0.45,
                  textTransform: "uppercase",
                  letterSpacing: 1,
                }}
              >
                {isPlaying ? "Live Playback" : "Paused"}
              </MDTypography>
            </MDBox>

            {/* Speed + Status */}
            <MDBox sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0.8, mb: 1 }}>
              <MDBox sx={{ background: "#f5f5f5", borderRadius: 1.5, p: 0.8 }}>
                <MDTypography
                  variant="caption"
                  sx={{ fontSize: "0.58rem", opacity: 0.5, display: "block" }}
                >
                  Speed
                </MDTypography>
                <MDTypography variant="caption" fontWeight="bold" sx={{ fontSize: "0.95rem" }}>
                  {currentInfo?.speed ?? "—"}
                  <span style={{ fontSize: "0.55rem", fontWeight: 400, marginLeft: 2 }}>km/h</span>
                </MDTypography>
              </MDBox>
              <MDBox sx={{ background: "#f5f5f5", borderRadius: 1.5, p: 0.8 }}>
                <MDTypography
                  variant="caption"
                  sx={{ fontSize: "0.58rem", opacity: 0.5, display: "block" }}
                >
                  Status
                </MDTypography>
                {currentInfo?.status ? (
                  <MDBox
                    sx={{
                      display: "inline-block",
                      mt: 0.3,
                      px: 0.7,
                      py: 0.2,
                      borderRadius: 10,
                      fontSize: "0.58rem",
                      fontWeight: 700,
                      background: statusColor.bg,
                      color: statusColor.text,
                    }}
                  >
                    {currentInfo.status}
                  </MDBox>
                ) : (
                  <MDTypography variant="caption" fontWeight="bold" sx={{ fontSize: "0.68rem" }}>
                    —
                  </MDTypography>
                )}
              </MDBox>
            </MDBox>

            {/* Detail rows */}
            <InfoRow
              icon="access_time"
              label="Timestamp"
              value={currentInfo?.ts ? formatTimestamp(currentInfo.ts) : "—"}
            />
            <InfoRow
              icon="my_location"
              label="Latitude"
              value={currentInfo?.lat ? (+currentInfo.lat).toFixed(5) : "—"}
            />
            <InfoRow
              icon="my_location"
              label="Longitude"
              value={currentInfo?.lng ? (+currentInfo.lng).toFixed(5) : "—"}
            />

            {/* Progress bar */}
            <MDBox sx={{ mt: 1 }}>
              <MDBox sx={{ display: "flex", justifyContent: "space-between", mb: 0.3 }}>
                <MDTypography variant="caption" sx={{ fontSize: "0.58rem", opacity: 0.5 }}>
                  Progress
                </MDTypography>
                <MDTypography variant="caption" sx={{ fontSize: "0.58rem", opacity: 0.5 }}>
                  {progressPct}%
                </MDTypography>
              </MDBox>
              <MDBox sx={{ height: 5, background: "#eeeeee", borderRadius: 3, overflow: "hidden" }}>
                <MDBox
                  sx={{
                    height: "100%",
                    width: `${progressPct}%`,
                    background: "linear-gradient(90deg,#1976d2,#42a5f5)",
                    borderRadius: 3,
                    transition: "width 0.4s ease",
                  }}
                />
              </MDBox>

              {/* Point counter */}
              <MDTypography
                variant="caption"
                sx={{
                  fontSize: "0.58rem",
                  opacity: 0.4,
                  display: "block",
                  textAlign: "right",
                  mt: 0.3,
                }}
              >
                {currentIdx + 1} / {totalPoints}
              </MDTypography>
            </MDBox>
          </MDBox>
        </MDBox>
      )}
    </MDBox>
  );
};

MiniTrackPlayer.propTypes = {
  imei: PropTypes.string.isRequired,
  fromDate: PropTypes.string.isRequired,
  toDate: PropTypes.string.isRequired,
  isPlaying: PropTypes.bool.isRequired,
};

MiniTrackPlayer.defaultProps = {
  isPlaying: false,
};

export default MiniTrackPlayer;
