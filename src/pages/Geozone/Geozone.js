// src/pages/Geozone/Geozone.js
import React, { useEffect, useRef, useState, useCallback } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import MDBox from "../../assets/components/MDBox";
import MDTypography from "../../assets/components/MDTypography";
import MDInput from "../../assets/components/MDInput";
import DashboardLayout from "../../assets/components/examples/LayoutContainers/DashboardLayout";
import DashboardNavbarWithAccountContext from "../../assets/components/examples/Navbars/DashboardNavbar/DashboardNavbarWithAccountContext";

import Card from "@mui/material/Card";
import Icon from "@mui/material/Icon";
import IconButton from "@mui/material/IconButton";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Divider from "@mui/material/Divider";

import { useAccount } from "context/AccountContext";
import ApiService from "../../services/ApiService";

// -----------------------------
// Tile Layer
// -----------------------------
const createTileLayers = () => ({
  OpenStreet: L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: "© OpenStreetMap contributors",
  }),
});

const indiaCenter = { lat: 22.5589409, lng: 75.6089374 };

const Geozone = () => {
  const { selectedAccountId } = useAccount();
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);

  const [searchValue, setSearchValue] = useState("");
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshTime, setLastRefreshTime] = useState(Date.now());

  // right panel toggle state
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(true);

  // drawing tools
  const [activeTool, setActiveTool] = useState(null);
  const activeToolRef = useRef(null);

  // circle drawing state kept in refs for map event handlers
  const isDrawingRef = useRef(false);
  const circleCenterRef = useRef(null);
  const tempCircleRef = useRef(null);

  // NEW: Ref to store existing geozone layers for lookups
  const circlesRef = useRef({});

  const fetchGeozones = useCallback(async () => {
    setLoading(true);
    try {
      const data = await ApiService.getViewDetailed();
      setTrips(data);
    } catch (error) {
      console.error("Failed to load geozones");
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch data on mount or when account changes
  useEffect(() => {
    fetchGeozones();
  }, [fetchGeozones, selectedAccountId]);

  // keep ref in sync with state
  useEffect(() => {
    activeToolRef.current = activeTool;
  }, [activeTool]);

  // -----------------------------
  // NEW: Sync Trips to Map
  // -----------------------------
  useEffect(() => {
    if (!mapRef.current || trips.length === 0) return;

    // Clear previous layers before re-drawing
    Object.values(circlesRef.current).forEach((layer) => mapRef.current.removeLayer(layer));
    circlesRef.current = {};

    trips.forEach((gz) => {
      if (gz.location?.coordinates && (gz.type === "CIRCLE" || gz.radius)) {
        const [lng, lat] = gz.location.coordinates;

        const circle = L.circle([lat, lng], {
          radius: gz.radius || 100,
          color: "#1976d2",
          fillOpacity: 0.2,
        }).addTo(mapRef.current);

        // Standard Display Popup
        circle.bindPopup(`
          <div style="padding: 5px;">
            <strong style="font-size: 14px;">${gz.name}</strong><br/>
            <span style="font-size: 12px; color: #666;">Category: ${gz.category}</span><br/>
            <span style="font-size: 12px; color: #666;">Radius: ${gz.radius}m</span>
          </div>
        `);

        // Store by ID so we can trigger it from the list
        circlesRef.current[gz.id] = circle;
      }
    });
  }, [trips]);

  // -----------------------------
  // NEW: Handle Zoom and Show
  // -----------------------------
  const handleSelectGeozone = (geozone) => {
    if (!mapRef.current || !geozone.location?.coordinates) return;

    const [lng, lat] = geozone.location.coordinates;

    // Fly to location
    mapRef.current.flyTo([lat, lng], 16, {
      animate: true,
      duration: 1.5,
    });

    // Open existing popup
    const layer = circlesRef.current[geozone.id];
    if (layer) {
      layer.openPopup();
    }
  };

  // -----------------------------
  // Init map
  // -----------------------------
  useEffect(() => {
    if (mapRef.current || !mapContainerRef.current) return;

    const baseMaps = createTileLayers();

    const map = L.map(mapContainerRef.current, {
      center: [indiaCenter.lat, indiaCenter.lng],
      zoom: 5,
      layers: [baseMaps.OpenStreet],
      zoomControl: true,
    });

    mapRef.current = map;
    L.control.scale().addTo(map);

    const disableMapInteractions = () => {
      map.dragging.disable();
      map.touchZoom.disable();
      map.scrollWheelZoom.disable();
      map.doubleClickZoom.disable();
      map.boxZoom.disable();
      map.keyboard.disable();
      if (map.tap) map.tap.disable();
    };

    const enableMapInteractions = () => {
      map.dragging.enable();
      map.touchZoom.enable();
      map.scrollWheelZoom.enable();
      map.doubleClickZoom.enable();
      map.boxZoom.enable();
      map.keyboard.enable();
      if (map.tap) map.tap.enable();
    };

    // -----------------------------
    // Creation Popup Logic
    // -----------------------------
    const openCirclePopup = (circle) => {
      const radius = Math.round(circle.getRadius());
      const latLng = circle.getLatLng();

      const popupContent = `
    <div id="geozone-form" style="min-width: 240px; font-family: sans-serif; padding: 10px;">
      <h4 style="margin: 0 0 10px;">Create Geozone</h4>
      <input id="pop-name" type="text" placeholder="Name (e.g. testgeo)" style="width:100%; margin-bottom:8px; padding:5px; border:1px solid #ccc; border-radius:4px;"/>
      <input id="pop-category" type="text" placeholder="Category (e.g. OFFICE)" style="width:100%; margin-bottom:8px; padding:5px; border:1px solid #ccc; border-radius:4px;"/>
      <input id="pop-client" type="text" placeholder="Client (e.g. AUSPREY)" style="width:100%; margin-bottom:8px; padding:5px; border:1px solid #ccc; border-radius:4px;"/>
      <input id="pop-mobile" type="text" placeholder="Mobile Number" style="width:100%; margin-bottom:8px; padding:5px; border:1px solid #ccc; border-radius:4px;"/>
      <div style="font-size: 11px; color: #666; margin-bottom: 10px;">
        Radius: ${radius}m | Lat: ${latLng.lat.toFixed(4)}
      </div>
      <div style="display:flex; justify-content: flex-end; gap: 5px;">
        <button id="pop-cancel" style="background:#eee; border:none; padding:6px 12px; cursor:pointer; border-radius:4px;">Cancel</button>
        <button id="pop-done" style="background:#1976d2; color:white; border:none; padding:6px 12px; cursor:pointer; border-radius:4px;">Done</button>
      </div>
    </div>
  `;

      // Bind the popup
      circle.bindPopup(popupContent);

      // Open it
      circle.openPopup();

      // IMPORTANT: Listen for when the popup is actually added to the DOM
      circle.on("popupopen", () => {
        const doneBtn = document.getElementById("pop-done");
        const cancelBtn = document.getElementById("pop-cancel");

        if (doneBtn) {
          doneBtn.onclick = async () => {
            // Disable button to prevent double clicks
            doneBtn.disabled = true;
            doneBtn.innerText = "Saving...";

            const name = document.getElementById("pop-name").value;
            const category = document.getElementById("pop-category").value;
            const client = document.getElementById("pop-client").value;
            const mobile = document.getElementById("pop-mobile").value;

            const payload = {
              name: name || "Unnamed Geozone",
              category: category || "GENERAL",
              client: client || "DEFAULT",
              type: "CIRCLE",
              mobileno: mobile || "0",
              accid: selectedAccountId || 1,
              radius: radius,
              location: {
                x: latLng.lng,
                y: latLng.lat,
                type: "Point",
                coordinates: [latLng.lng, latLng.lat],
              },
            };

            console.log("Submitting Payload:", payload);

            try {
              await ApiService.createGeofence(payload);
              circle.closePopup();
              // Refresh the list
              fetchGeozones();
            } catch (error) {
              console.error("API Error:", error);
              alert("Failed to save geozone. Check console for details.");
              doneBtn.disabled = false;
              doneBtn.innerText = "Done";
            }
          };
        }

        if (cancelBtn) {
          cancelBtn.onclick = () => {
            circle.closePopup();
            if (mapRef.current) {
              mapRef.current.removeLayer(circle);
            }
          };
        }
      });
    };

    const handleMouseDown = (e) => {
      if (activeToolRef.current !== "place") return;
      isDrawingRef.current = true;
      circleCenterRef.current = e.latlng;
      disableMapInteractions();
      const circle = L.circle(e.latlng, {
        radius: 10,
        color: "#1976d2",
        fillColor: "#1976d2",
        fillOpacity: 0.2,
      }).addTo(map);
      tempCircleRef.current = circle;
    };

    const handleMouseMove = (e) => {
      if (!isDrawingRef.current || activeToolRef.current !== "place") return;
      if (!circleCenterRef.current || !tempCircleRef.current) return;
      const radius = map.distance(circleCenterRef.current, e.latlng);
      tempCircleRef.current.setRadius(radius);
    };

    const finishDrawing = () => {
      if (!isDrawingRef.current) return;
      isDrawingRef.current = false;
      if (tempCircleRef.current) {
        openCirclePopup(tempCircleRef.current);
        tempCircleRef.current = null;
      }
      circleCenterRef.current = null;
      enableMapInteractions();
      activeToolRef.current = null;
      setActiveTool(null);
    };

    const handleMouseUp = () => {
      if (activeToolRef.current !== "place") return;
      finishDrawing();
    };

    map.on("mousedown", handleMouseDown);
    map.on("mousemove", handleMouseMove);
    map.on("mouseup", handleMouseUp);

    return () => {
      map.off("mousedown", handleMouseDown);
      map.off("mousemove", handleMouseMove);
      map.off("mouseup", handleMouseUp);
      map.remove();
      mapRef.current = null;
    };
  }, []);

  const handleManualRefresh = useCallback(() => {
    setIsRefreshing(true);
    fetchGeozones().then(() => {
      setIsRefreshing(false);
      setLastRefreshTime(Date.now());
    });
  }, [fetchGeozones]);

  const handleSearchKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
    }
  };

  const handleEditTrip = (e, trip) => {
    e.stopPropagation(); // Stop flyTo when clicking edit
    console.log("Edit trip:", trip);
  };

  const handleDeleteTrip = (e, trip) => {
    e.stopPropagation(); // Stop flyTo when clicking delete
    setTrips((prev) => prev.filter((t) => t.id !== trip.id));
  };

  const bottomIcons = ["place", "polyline", "route", "layers", "settings"];

  return (
    <DashboardLayout>
      <DashboardNavbarWithAccountContext
        onManualRefresh={handleManualRefresh}
        isRefreshing={isRefreshing}
        lastRefreshTime={lastRefreshTime}
      />

      <MDBox
        sx={{
          position: "relative",
          height: "calc(90vh - 64px)",
          width: "100%",
          overflow: "hidden",
        }}
      >
        <div
          ref={mapContainerRef}
          style={{
            height: "100%",
            width: "100%",
            cursor: activeTool === "place" ? "crosshair" : "grab",
          }}
        />

        {/* Search Bar */}
        <MDBox
          sx={{
            position: "absolute",
            top: 24,
            left: 50,
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            gap: 1.5,
          }}
        >
          <Card
            sx={{
              p: 1,
              px: 1.5,
              display: "flex",
              alignItems: "center",
              boxShadow: 6,
              minWidth: 280,
            }}
          >
            <Icon sx={{ mr: 1.5, color: "text.secondary" }}>search</Icon>
            <MDInput
              variant="standard"
              fullWidth
              placeholder="Enter a location or lat/long"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              InputProps={{ disableUnderline: true, sx: { fontSize: "0.875rem" } }}
            />
          </Card>

          <Card sx={{ p: 0.5, display: "flex", alignItems: "center", boxShadow: 6 }}>
            <IconButton size="small" onClick={() => setIsRightPanelOpen((prev) => !prev)}>
              <Icon fontSize="small">{isRightPanelOpen ? "chevron_right" : "chevron_left"}</Icon>
            </IconButton>
          </Card>
        </MDBox>

        {/* Right Panel */}
        {isRightPanelOpen && (
          <MDBox
            sx={{
              position: "absolute",
              top: 24,
              right: 24,
              bottom: 24,
              zIndex: 1000,
              width: "430px",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Card sx={{ height: "60%", display: "flex", flexDirection: "column", boxShadow: 6 }}>
              <MDBox
                p={1.5}
                borderBottom="1px solid #eee"
                display="flex"
                alignItems="center"
                justifyContent="space-between"
              >
                <MDTypography variant="button" fontWeight="medium">
                  Trips
                </MDTypography>
                <IconButton size="small">
                  <Icon fontSize="small">add</Icon>
                </IconButton>
              </MDBox>

              <List dense sx={{ flex: 1, overflow: "auto", p: 0 }}>
                {trips.map((geozone, index) => (
                  <React.Fragment key={geozone.id}>
                    <ListItem
                      button // Makes the item clickable
                      onClick={() => handleSelectGeozone(geozone)}
                      sx={{
                        px: 1.5,
                        py: 1,
                        alignItems: "flex-start",
                        transition: "background 0.2s",
                        "&:hover": { backgroundColor: "#f8f9fa" },
                      }}
                      secondaryAction={
                        <MDBox sx={{ display: "flex", gap: 0.5 }}>
                          <IconButton size="small" onClick={(e) => handleEditTrip(e, geozone)}>
                            <Icon fontSize="small">edit</Icon>
                          </IconButton>
                          <IconButton size="small" onClick={(e) => handleDeleteTrip(e, geozone)}>
                            <Icon fontSize="small">delete</Icon>
                          </IconButton>
                        </MDBox>
                      }
                    >
                      <ListItemIcon sx={{ minWidth: 32, mt: 0.2 }}>
                        <Icon fontSize="small" color="primary">
                          {geozone.type === "CIRCLE" ? "radio_button_unchecked" : "place"}
                        </Icon>
                      </ListItemIcon>

                      <ListItemText
                        primary={
                          <MDTypography variant="body2" fontWeight="medium">
                            {geozone.name}
                          </MDTypography>
                        }
                        secondary={
                          <MDBox>
                            <MDTypography variant="caption" color="text.secondary" display="block">
                              Category: {geozone.category} | Client: {geozone.client}
                            </MDTypography>
                            <MDTypography variant="caption" color="info" fontWeight="bold">
                              Radius: {geozone.radius}m
                            </MDTypography>
                          </MDBox>
                        }
                      />
                    </ListItem>
                    {index < trips.length - 1 && <Divider component="li" />}
                  </React.Fragment>
                ))}
              </List>
            </Card>
          </MDBox>
        )}

        {/* Bottom Toolbar */}
        <MDBox sx={{ position: "absolute", left: 24, bottom: 24, zIndex: 1000 }}>
          <Card
            sx={{ px: 1.5, py: 0.75, display: "flex", gap: 0.5, boxShadow: 6, borderRadius: 2 }}
          >
            {bottomIcons.map((iconName) => (
              <IconButton
                key={iconName}
                size="small"
                onClick={() => {
                  if (iconName === "place") {
                    setActiveTool((prev) => (prev === "place" ? null : "place"));
                  }
                }}
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: 1.5,
                  backgroundColor: activeTool === iconName ? "#e3f2fd" : "#f5f5f5",
                  "&:hover": { backgroundColor: "#e3f2fd" },
                }}
              >
                <Icon fontSize="small">{iconName}</Icon>
              </IconButton>
            ))}
          </Card>
        </MDBox>
      </MDBox>
    </DashboardLayout>
  );
};

export default Geozone;
