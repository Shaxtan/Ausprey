import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-polylinedecorator";
import "leaflet-geometryutil";
import simplify from "simplify-js";
import ApiService from "../../services/ApiService";
import { getRotatingTruckHtml } from "../LiveTrack/LiveTrack.styles";
import MDBox from "../../assets/components/MDBox";
import CircularProgress from "@mui/material/CircularProgress";
import MDTypography from "../../assets/components/MDTypography";
import PropTypes from "prop-types";

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

      // Reset playback reference
      playbackRef.current = { idx: 0, points: [], marker: null };

      try {
        const payload = { imei, startTime: fromDate, endTime: toDate };
        const res = await ApiService.getTrackPlayHistory(payload);
        const points = res?.data?.response?.report || [];

        if (points.length < 2) return;

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

      if (!points || !marker || idx >= points.length) {
        if (animationTimerRef.current) clearTimeout(animationTimerRef.current);
        return;
      }

      const p = points[idx];
      marker.setLatLng([+p.lat, +p.lng]);

      // Calculate bearing for rotation
      if (idx > 0) {
        const bearing = L.GeometryUtil.bearing(
          L.latLng(+points[idx - 1].lat, +points[idx - 1].lng),
          L.latLng(+p.lat, +p.lng)
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

      playbackRef.current.idx++;
      animationTimerRef.current = setTimeout(step, 100);
    };

    if (isPlaying) {
      step(); // Start or Resume animation
    } else {
      if (animationTimerRef.current) clearTimeout(animationTimerRef.current); // Pause
    }

    return () => {
      if (animationTimerRef.current) clearTimeout(animationTimerRef.current);
    };
  }, [isPlaying]);

  return (
    <MDBox position="relative" height="100%" width="100%">
      {isLoading && (
        <MDBox sx={{ position: "absolute", zIndex: 1000, top: "50%", left: "45%" }}>
          <CircularProgress size={30} />
        </MDBox>
      )}
      <div id={mapId.current} style={{ height: "100%", width: "100%", borderRadius: "8px" }} />
    </MDBox>
  );
};

MiniTrackPlayer.propTypes = {
  imei: PropTypes.string.isRequired,
  fromDate: PropTypes.string.isRequired,
  toDate: PropTypes.string.isRequired,
  isPlaying: PropTypes.bool.isRequired, // Added isPlaying validation
};

// Default prop to prevent errors if parent doesn't pass it immediately
MiniTrackPlayer.defaultProps = {
  isPlaying: false,
};

export default MiniTrackPlayer;
