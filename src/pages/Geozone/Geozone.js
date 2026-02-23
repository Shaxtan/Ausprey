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
  const [trips, setTrips] = useState(mockTrips);
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
      const radius = circle.getRadius(); // meters

      const popupContent = `
        <div style="min-width: 220px; font-family: Arial, sans-serif; font-size: 12px;">
          <h4 style="margin: 0 0 8px; font-size: 14px;">Create circle</h4>
          <div style="margin-bottom: 6px;">
            <label style="display:block; margin-bottom:2px;">Circle name</label>
            <input
              id="circle-name-input"
              type="text"
              style="width:100%; padding:4px; box-sizing:border-box; font-size:12px;"
              placeholder="Enter circle name"
            />
          </div>
          <div style="margin-bottom: 6px;">
            <label style="display:block; margin-bottom:2px;">Circle radius (m)</label>
            <input
              id="circle-radius-input"
              type="text"
              value="${radius.toFixed(0)}"
              readonly
              style="width:100%; padding:4px; box-sizing:border-box; font-size:12px; background:#f5f5f5;"
            />
          </div>
          <div style="margin-bottom: 6px;">
            <label style="display:block; margin-bottom:2px;">Mobile number</label>
            <input
              id="circle-mobile-input"
              type="text"
              style="width:100%; padding:4px; box-sizing:border-box; font-size:12px;"
              placeholder="Enter mobile number"
            />
          </div>
          <div style="margin-bottom: 6px;">
            <label style="display:block; margin-bottom:2px;">Category</label>
            <select
              id="circle-category-select"
              style="width:100%; padding:4px; box-sizing:border-box; font-size:12px;"
            >
              <option value="option1">Option 1</option>
              <option value="option2">Option 2</option>
            </select>
          </div>
          <div style="margin-bottom: 8px;">
            <label style="display:block; margin-bottom:2px;">Client</label>
            <select
              id="circle-client-select"
              style="width:100%; padding:4px; box-sizing:border-box; font-size:12px;"
            >
              <option value="clientA">Client A</option>
              <option value="clientB">Client B</option>
            </select>
          </div>
          <div style="display:flex; justify-content:flex-end; gap:6px; margin-top:8px;">
            <button
              id="circle-cancel-btn"
              type="button"
              style="padding:4px 8px; font-size:12px; background:#e0e0e0; border:1px solid #bdbdbd; border-radius:3px; cursor:pointer;"
            >
              Cancel
            </button>
            <button
              id="circle-done-btn"
              type="button"
              style="padding:4px 8px; font-size:12px; background:#1976d2; color:#fff; border:1px solid #1565c0; border-radius:3px; cursor:pointer;"
            >
              Done
            </button>
          </div>
        </div>
      `;

      // bind + OPEN immediately
      circle.bindPopup(popupContent).openPopup();

      circle.on("popupopen", () => {
        const doneBtn = document.getElementById("circle-done-btn");
        const cancelBtn = document.getElementById("circle-cancel-btn");

        if (doneBtn) {
          doneBtn.onclick = () => {
            const nameInput = document.getElementById("circle-name-input");
            const mobileInput = document.getElementById("circle-mobile-input");
            const categorySelect = document.getElementById("circle-category-select");
            const clientSelect = document.getElementById("circle-client-select");

            const payload = {
              name: nameInput ? nameInput.value : "",
              radius,
              mobile: mobileInput ? mobileInput.value : "",
              category: categorySelect ? categorySelect.value : "",
              client: clientSelect ? clientSelect.value : "",
              center: circle.getLatLng(),
            };

            // TODO: send to backend or save in state
            console.log("Circle form data:", payload);

            circle.closePopup();
          };
        }

        if (cancelBtn) {
          cancelBtn.onclick = () => {
            circle.closePopup();

            const mapInstance = mapRef.current;
            if (mapInstance) {
              mapInstance.removeLayer(circle);
            }

            circlesRef.current = circlesRef.current.filter((c) => c !== circle);
          };
        }
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
                {trips.map((trip, index) => (
                  <React.Fragment key={trip.id}>
                    <ListItem
                      sx={{
                        px: 1.5,
                        py: 1,
                        alignItems: "flex-start",
                      }}
                      disableGutters
                      secondaryAction={
                        <MDBox
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 0.5,
                          }}
                        >
                          <IconButton edge="end" size="small" onClick={() => handleEditTrip(trip)}>
                            <Icon fontSize="small">edit</Icon>
                          </IconButton>
                          <IconButton
                            edge="end"
                            size="small"
                            onClick={() => handleDeleteTrip(trip)}
                          >
                            <Icon fontSize="small">delete</Icon>
                          </IconButton>
                        </MDBox>
                      }
                    >
                      <ListItemIcon sx={{ minWidth: 32, mt: 0.2 }}>
                        <Icon fontSize="small" color="primary">
                          local_shipping
                        </Icon>
                      </ListItemIcon>

                      <ListItemText
                        primary={
                          <MDTypography
                            variant="body2"
                            fontWeight="medium"
                            sx={{ lineHeight: 1.3 }}
                          >
                            {trip.name}
                          </MDTypography>
                        }
                        secondary={
                          <MDTypography variant="caption" color="text.secondary">
                            Category: {trip.category}
                          </MDTypography>
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
