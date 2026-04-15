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

const MiniTrackPlayer = ({ imei, fromDate, toDate }) => {
  const mapRef = useRef(null);
  const layerRef = useRef(null);
  const animatedMarkerRef = useRef(null);
  const animationTimerRef = useRef(null);
  const mapId = useRef(`map-${Math.random().toString(36).substr(2, 9)}`);

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

  // 2. Fetch and Draw when dates/imei change
  useEffect(() => {
    const fetchAndDraw = async () => {
      if (!imei || !fromDate || !toDate) return;
      
      setIsLoading(true);
      if (animationTimerRef.current) clearTimeout(animationTimerRef.current);
      layerRef.current.clearLayers();

      try {
        const payload = { imei, startTime: fromDate, endTime: toDate };
        const res = await ApiService.getTrackPlayHistory(payload);
        const points = res?.data?.response?.report || [];

        if (points.length < 2) return;

        // Draw Polyline
        const latLngs = points.map(p => [+p.lat, +p.lng]);
        const line = L.polyline(latLngs, { color: "#3388ff", weight: 4 }).addTo(layerRef.current);
        mapRef.current.fitBounds(line.getBounds(), { padding: [30, 30] });

        // Simple Animation Start
        startAnimation(points);
      } catch (err) {
        console.error("MiniPlayer Error:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAndDraw();
  }, [imei, fromDate, toDate]);

  const startAnimation = (points) => {
    let idx = 0;
    const marker = L.marker([+points[0].lat, +points[0].lng], {
      icon: L.divIcon({
        className: "rotating-truck-container",
        html: getRotatingTruckHtml(points[0].status, 0),
        iconSize: [30, 30],
        iconAnchor: [15, 15],
      }),
    }).addTo(layerRef.current);

    const step = () => {
      if (idx >= points.length) return;
      const p = points[idx];
      marker.setLatLng([+p.lat, +p.lng]);
      
      // Calculate bearing for rotation if not first point
      if (idx > 0) {
        const bearing = L.GeometryUtil.bearing(
          L.latLng(+points[idx-1].lat, +points[idx-1].lng),
          L.latLng(+p.lat, +p.lng)
        );
        marker.setIcon(L.divIcon({
          className: "rotating-truck-container",
          html: getRotatingTruckHtml(p.status, bearing - 90),
          iconSize: [30, 30],
          iconAnchor: [15, 15],
        }));
      }
      
      idx++;
      animationTimerRef.current = setTimeout(step, 100); // 100ms interval
    };
    step();
  };

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

export default MiniTrackPlayer;