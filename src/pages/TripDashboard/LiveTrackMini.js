// src/TripDashboard/LiveTrackMini.js
import React, { useEffect, useState, useRef } from "react";
import L from "leaflet";
import PropTypes from "prop-types";
import { MapContainer, TileLayer, Marker, Polyline, useMap } from "react-leaflet";
import ApiService from "../../services/ApiService";
import { getRotatingTruckHtml } from "../LiveTrack/LiveTrack.styles"; // Reuse your styles!

function MapUpdater({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) map.flyTo(center, 15);
  }, [center, map]);
  return null;
}
// 2. Add validation for MapUpdater
MapUpdater.propTypes = {
  center: PropTypes.arrayOf(PropTypes.number).isRequired,
};

export default function LiveTrackMini({ imei, accountId }) {
  const [deviceData, setDeviceData] = useState(null);
  const [route, setRoute] = useState([]);
  const intervalRef = useRef(null);

  const fetchUpdate = async () => {
    try {
      const response = await ApiService.testData(accountId, imei);
      const rawData = response?.data?.data;
      if (rawData) {
        const newPos = [rawData.lat, rawData.lng];
        setDeviceData(rawData);
        setRoute((prev) => [...prev, newPos].slice(-50)); // Keep last 50 points
      }
    } catch (error) {
      console.error("Live update failed", error);
    }
  };

  useEffect(() => {
    fetchUpdate();
    intervalRef.current = setInterval(fetchUpdate, 30000);
    return () => clearInterval(intervalRef.current);
  }, [imei, accountId]);

  if (!deviceData) return <div>Loading Live Feed...</div>;

  const currentPos = [deviceData.lat, deviceData.lng];

  return (
    <MapContainer center={currentPos} zoom={15} style={{ height: "400px", width: "100%" }}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <MapUpdater center={currentPos} />
      <Polyline positions={route} color="blue" />
      <Marker
        position={currentPos}
        icon={L.divIcon({
          className: "custom-truck",
          // 1. Use deviceData.disha here
          // 2. Default to 0 if disha is undefined
          html: getRotatingTruckHtml(
            deviceData.ign === "Y" ? "Running" : "Stopped",
            deviceData.disha || 0,
            true
          ),
          iconSize: [40, 40],
          iconAnchor: [20, 20],
        })}
      />
    </MapContainer>
  );
}
// 3. Add validation for LiveTrackMini
LiveTrackMini.propTypes = {
  imei: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  accountId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
};
