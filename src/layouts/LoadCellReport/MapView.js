import React, { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { createTileLayers } from "./createTileLayers"; // Your previous utility function

const MapView = () => {
  const mapRef = useRef(null);
  const zoomDivRef = useRef(null);
  const indiaCenter = { lat: 22.5589409, lng: 75.6089374 };
  const baseMaps = createTileLayers(); // your tile layers like OpenStreet, Mapbox, etc.

  useEffect(() => {
    if (mapRef.current) return; // Prevent re-initializing

    // --- Custom Zoom Control ---
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

    // --- Layers Control & Other Controls ---
    const overlayMaps = {}; // Add overlays if needed

    const map = L.map("mapCanvas", {
      center: [indiaCenter.lat, indiaCenter.lng],
      zoom: 4,
      maxBounds: [
        [-90, -180],
        [90, 180],
      ],
      layers: [baseMaps["OpenStreet"]],
      zoomControl: false, // We'll add our own
    });

    mapRef.current = map;

    // Custom Zoom
    const zoomControl = L.control.zoomview({ position: "topleft" }).addTo(map);

    // Layers Control
    const layersControl = L.control.layers(baseMaps, overlayMaps, { position: "topleft" });
    layersControl.addTo(map);

    // Optional: Simulate delayed addition
    setTimeout(() => {
      layersControl.addTo(map);
    }, 2000);

    // Scale Control
    L.control.scale().addTo(map);

    // Add your own layers if needed
    const poiMarkerLayer = L.layerGroup().addTo(map); // Example
    const geoLayer = L.layerGroup().addTo(map); // Example

    // Zoom event to update ZoomView
    map.on("zoomend", () => {
      if (zoomDivRef.current) {
        zoomDivRef.current.innerHTML = "Zoom: " + map.getZoom();
      }
    });
  }, []);

  return <div id="mapCanvas" style={{ height: "100vh", width: "100%" }}></div>;
};

export default MapView;
