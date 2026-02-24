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

// -----------------------------
// Mock trip data
// -----------------------------
const mockTrips = [
  { id: 1, name: "Associates wines pvt ltd", category: "Select" },
  { id: 2, name: "kidderpore IML Depot", category: "DISTILLERY" },
  { id: 3, name: "Agarpara depot", category: "DISTILLERY" },
  { id: 4, name: "Ranidanga Depo WBEX", category: "DISTILLERY" },
  { id: 5, name: "IOCL Bhubaneswar", category: "DISTILLERY" },
];

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
  const [activeTool, setActiveTool] = useState(null); // "place" | null
  const activeToolRef = useRef(null);

  // circle drawing state kept in refs for map event handlers
  const isDrawingRef = useRef(false);
  const circleCenterRef = useRef(null);
  const tempCircleRef = useRef(null);
  const circlesRef = useRef([]);

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

    // helper to open popup with form on a circle
    const openCirclePopup = (circle) => {
      const radius = Math.round(circle.getRadius());
      const latLng = circle.getLatLng();

      const popupContent = `
    <div style="min-width: 240px; font-family: sans-serif; padding: 10px;">
      <h4 style="margin: 0 0 10px;">Create Geozone</h4>
      <input id="pop-name" type="text" placeholder="Name (e.g. testgeo)" style="width:100%; margin-bottom:8px; padding:5px;"/>
      <input id="pop-category" type="text" placeholder="Category (e.g. OFFICE)" style="width:100%; margin-bottom:8px; padding:5px;"/>
      <input id="pop-client" type="text" placeholder="Client (e.g. AUSPREY)" style="width:100%; margin-bottom:8px; padding:5px;"/>
      <input id="pop-mobile" type="text" placeholder="Mobile Number" style="width:100%; margin-bottom:8px; padding:5px;"/>
      <div style="font-size: 11px; color: #666; margin-bottom: 10px;">
        Radius: ${radius}m | Lat: ${latLng.lat.toFixed(4)}
      </div>
      <div style="display:flex; justify-content: flex-end; gap: 5px;">
        <button id="pop-cancel" style="background:#eee; border:none; padding:5px 10px; cursor:pointer;">Cancel</button>
        <button id="pop-done" style="background:#1976d2; color:white; border:none; padding:5px 10px; cursor:pointer;">Done</button>
      </div>
    </div>
  `;

      circle.bindPopup(popupContent).openPopup();

      circle.on("popupopen", () => {
        document.getElementById("pop-done").onclick = async () => {
          const name = document.getElementById("pop-name").value;
          const category = document.getElementById("pop-category").value;
          const client = document.getElementById("pop-client").value;
          const mobile = document.getElementById("pop-mobile").value;

          const payload = {
            id: "string", // Backend usually generates this, or use Date.now().toString()
            name: name || "Unnamed Geozone",
            category: category || "GENERAL",
            client: client || "DEFAULT",
            type: "CIRCLE",
            mobileno: mobile || "0",
            accid: selectedAccountId || 1, // Using context ID
            radius: radius,
            location: {
              x: latLng.lng, // Longitude
              y: latLng.lat, // Latitude
              type: "Point",
              coordinates: [latLng.lng, latLng.lat],
            },
          };

          try {
            await ApiService.createGeofence(payload);
            circle.closePopup();
            // Refresh the sidebar list to show the new geozone
            fetchGeozones();
          } catch (error) {
            console.error("API Error:", error);
          }
        };

        document.getElementById("pop-cancel").onclick = () => {
          circle.closePopup();
          mapRef.current.removeLayer(circle);
        };
      });
    };

    // ----- circle draw handlers -----
    const handleMouseDown = (e) => {
      if (activeToolRef.current !== "place") return;

      isDrawingRef.current = true;
      circleCenterRef.current = e.latlng;

      // stop map from moving while drawing
      disableMapInteractions();

      // create initial tiny circle
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

      const center = circleCenterRef.current;
      const currentLatLng = e.latlng;

      const radius = map.distance(center, currentLatLng); // meters
      tempCircleRef.current.setRadius(radius);
    };

    const finishDrawing = () => {
      if (!isDrawingRef.current) return;
      isDrawingRef.current = false;

      if (tempCircleRef.current) {
        const circle = tempCircleRef.current;

        circlesRef.current.push(circle);

        // open popup on this circle with form immediately
        openCirclePopup(circle);

        tempCircleRef.current = null;
      }

      circleCenterRef.current = null;

      // re-enable map interactions
      enableMapInteractions();

      // exit place mode after one circle
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

      if (tempCircleRef.current) {
        map.removeLayer(tempCircleRef.current);
      }

      map.remove();
      mapRef.current = null;
      circlesRef.current = [];
    };
  }, []);

  // -----------------------------
  // Manual refresh handler
  // -----------------------------
  const handleManualRefresh = useCallback(() => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      setLastRefreshTime(Date.now());
    }, 800);
  }, []);

  // -----------------------------
  // Search handler
  // -----------------------------
  const handleSearchKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      // TODO: parse/center map
    }
  };

  // -----------------------------
  // Action handlers
  // -----------------------------
  const handleEditTrip = (trip) => {
    console.log("Edit trip:", trip);
  };

  const handleDeleteTrip = (trip) => {
    setTrips((prev) => prev.filter((t) => t.id !== trip.id));
  };

  const bottomIcons = ["place", "polyline", "route", "layers", "settings"];

  // inline style for map cursor depending on activeTool
  const mapContainerStyle = {
    height: "100%",
    width: "100%",
    cursor: activeTool === "place" ? "crosshair" : "grab",
  };

  return (
    <DashboardLayout>
      <DashboardNavbarWithAccountContext
        onManualRefresh={handleManualRefresh}
        isRefreshing={isRefreshing}
        lastRefreshTime={lastRefreshTime}
      />

      {/* Non-scrollable main area (clamped to viewport minus navbar) */}
      <MDBox
        sx={{
          position: "relative",
          height: "calc(90vh - 64px)",
          width: "100%",
          overflow: "hidden",
        }}
      >
        {/* Map */}
        <div ref={mapContainerRef} style={mapContainerStyle} />

        {/* Top-left search bar + toggle button for right panel */}
        <MDBox
          sx={{
            position: "absolute",
            top: 24,
            left: 50,
            zIndex: 1000,
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            gap: 1.5,
          }}
        >
          {/* Search card */}
          <Card
            sx={{
              p: 1,
              px: 1.5,
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              boxShadow: 6,
              minWidth: 280,
              maxWidth: 360,
            }}
          >
            <Icon
              sx={{
                mr: 1.5,
                color: "text.secondary",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              search
            </Icon>
            <MDInput
              variant="standard"
              fullWidth
              placeholder="Enter a location or lat/long"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              InputProps={{
                disableUnderline: true,
                sx: { fontSize: "0.875rem" },
              }}
            />
          </Card>

          {/* Toggle button to show/hide right panel */}
          <Card
            sx={{
              p: 0.5,
              display: "flex",
              alignItems: "center",
              boxShadow: 6,
            }}
          >
            <IconButton size="small" onClick={() => setIsRightPanelOpen((prev) => !prev)}>
              <Icon fontSize="small">{isRightPanelOpen ? "chevron_right" : "chevron_left"}</Icon>
            </IconButton>
          </Card>
        </MDBox>

        {/* Right-side toggleable list panel */}
        {isRightPanelOpen && (
          <MDBox
            sx={{
              position: "absolute",
              top: 24,
              right: 24,
              bottom: 24,
              zIndex: 1000,
              width: "430px",
              maxWidth: "90vw",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Card
              sx={{
                height: "60%",
                display: "flex",
                flexDirection: "column",
                boxShadow: 6,
              }}
            >
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

              <List
                dense
                sx={{
                  flex: 1,
                  overflow: "auto",
                  p: 0,
                }}
              >
                {trips.map((geozone, index) => (
                  <React.Fragment key={geozone.id}>
                    <ListItem
                      sx={{ px: 1.5, py: 1, alignItems: "flex-start" }}
                      disableGutters
                      secondaryAction={
                        <MDBox sx={{ display: "flex", gap: 0.5 }}>
                          <IconButton size="small" onClick={() => handleEditTrip(geozone)}>
                            <Icon fontSize="small">edit</Icon>
                          </IconButton>
                          <IconButton size="small" onClick={() => handleDeleteTrip(geozone)}>
                            <Icon fontSize="small">delete</Icon>
                          </IconButton>
                        </MDBox>
                      }
                    >
                      <ListItemIcon sx={{ minWidth: 32, mt: 0.2 }}>
                        <Icon fontSize="small" color="primary">
                          {/* Change icon based on type if needed */}
                          {geozone.type === "CIRCLE" ? "radio_button_unchecked" : "shutter_speed"}
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

        {/* Bottom-left horizontal rectangular bar with 5 icons */}
        <MDBox
          sx={{
            position: "absolute",
            left: 24,
            bottom: 24,
            zIndex: 1000,
          }}
        >
          <Card
            sx={{
              px: 1.5,
              py: 0.75,
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              gap: 0.5,
              boxShadow: 6,
              borderRadius: 2,
            }}
          >
            {bottomIcons.map((iconName, idx) => (
              <IconButton
                key={iconName + idx}
                size="small"
                title={iconName === "place" ? "Create circle" : ""}
                onClick={() => {
                  if (iconName === "place") {
                    setActiveTool((prev) => (prev === "place" ? null : "place"));
                  }
                  // later: handle polyline, route, etc.
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
