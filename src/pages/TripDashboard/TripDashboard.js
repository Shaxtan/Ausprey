import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";

// Material UI Imports
import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";
import Icon from "@mui/material/Icon";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
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

// Custom Components
import MDBox from "../../assets/components/MDBox";
import MDTypography from "../../assets/components/MDTypography";

// Import Leaflet CSS and JS from CDN
const LEAFLET_CSS =
  "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.css";
const LEAFLET_JS =
  "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.js";

// --- STYLES ---

const clickableTextSx = {
  cursor: "pointer",
  "&:hover": { textDecoration: "underline", color: "#1A73E8" },
};

// Fixed Table Layout
const tableSx = {
  tableLayout: "fixed",
  width: "100%",
};

const tableHeadSx = {
  display: "table-header-group",
  "& .MuiTableCell-root": {
    backgroundColor: "#f8f9fa",
    color: "#7b809a",
    fontSize: "0.75rem",
    fontWeight: 700,
    opacity: 0.7,
    borderBottom: "1px solid #f0f2f5",
    textTransform: "uppercase",
    letterSpacing: "0.02em",
    padding: "12px 16px",
  },
};

const tableBodySx = {
  "& .MuiTableRow-root": {
    "&:hover": { backgroundColor: "#f5f5f5" },
  },
  "& .MuiTableCell-root": {
    padding: "12px 16px",
    fontSize: "0.875rem",
    borderBottom: "1px solid #f0f2f5",
    verticalAlign: "middle",
  },
};

// --- HELPER COMPONENT ---
const DataCell = ({
  text,
  color = "text",
  fontWeight = "regular",
  isClickable,
  onClick,
  align = "left",
}) => {
  return (
    <MDBox
      display="flex"
      alignItems="center"
      justifyContent={align === "center" ? "center" : "flex-start"}
    >
      <MDTypography
        variant="caption"
        color={color}
        fontWeight={fontWeight}
        sx={isClickable ? clickableTextSx : {}}
        onClick={isClickable ? onClick : undefined}
      >
        {text}
      </MDTypography>
    </MDBox>
  );
};

DataCell.propTypes = {
  text: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  color: PropTypes.string,
  fontWeight: PropTypes.string,
  isClickable: PropTypes.bool,
  onClick: PropTypes.func,
  align: PropTypes.string,
};

// --- PROGRESS STEPS ---
const BASE_STEPS = [
  { key: "Mumbai", label: "Mumbai" },
  { key: "Pune", label: "Pune" },
  { key: "Satara", label: "Satara" },
  { key: "Bhopal", label: "bhopal" },
  { key: "Mahabaleswar", label: "Mahabaleswar" },
];

// --- MOCK DATA with simple routes (lat/long path) ---
const mockTrips = [
  {
    id: "TRP001",
    vehicleNumber: "MH-12-AB-1234",
    accountName: "Logistics Corp",
    source: "Mumbai",
    destination: "Pune",
    imei: "356938035643809",
    createdTime: "2024-12-27 09:30 AM",
    status: "In Transit",
    driver: "Rajesh Kumar",
    distance: "148 km",
    eta: "2h 15m",
    route: [
      { lat: 19.076, lng: 72.8777 }, // Mumbai
      { lat: 18.9, lng: 73.2 },
      { lat: 18.7, lng: 73.4 },
      { lat: 18.5204, lng: 73.8567 }, // Pune
    ],
  },
  {
    id: "TRP002",
    vehicleNumber: "DL-08-CD-5678",
    accountName: "Express Delivery",
    source: "Delhi",
    destination: "Jaipur",
    imei: "356938035643810",
    createdTime: "2024-12-27 08:15 AM",
    status: "In Transit",
    driver: "Amit Singh",
    distance: "280 km",
    eta: "4h 30m",
    route: [
      { lat: 28.6139, lng: 77.209 }, // Delhi
      { lat: 28.3, lng: 76.8 },
      { lat: 27.5, lng: 76.9 },
      { lat: 26.9124, lng: 75.7873 }, // Jaipur
    ],
  },
  {
    id: "TRP003",
    vehicleNumber: "KA-01-EF-9012",
    accountName: "Swift Transport",
    source: "Bangalore",
    destination: "Chennai",
    imei: "356938035643811",
    createdTime: "2024-12-27 07:45 AM",
    status: "Completed",
    driver: "Suresh Reddy",
    distance: "346 km",
    eta: "Arrived",
    route: [
      { lat: 12.9716, lng: 77.5946 }, // Bangalore
      { lat: 12.6, lng: 78.5 },
      { lat: 12.2, lng: 79.2 },
      { lat: 13.0827, lng: 80.2707 }, // Chennai
    ],
  },
  {
    id: "TRP004",
    vehicleNumber: "GJ-05-GH-3456",
    accountName: "Premium Logistics",
    source: "Ahmedabad",
    destination: "Vadodara",
    imei: "356938035643812",
    createdTime: "2024-12-27 10:00 AM",
    status: "In Transit",
    driver: "Prakash Patel",
    distance: "110 km",
    eta: "1h 45m",
    route: [
      { lat: 23.0225, lng: 72.5714 }, // Ahmedabad
      { lat: 22.8, lng: 72.9 },
      { lat: 22.5, lng: 73.0 },
      { lat: 22.3072, lng: 73.1812 }, // Vadodara
    ],
  },
  {
    id: "TRP005",
    vehicleNumber: "TN-09-IJ-7890",
    accountName: "Metro Freight",
    source: "Chennai",
    destination: "Coimbatore",
    imei: "356938035643813",
    createdTime: "2024-12-27 06:30 AM",
    status: "In Transit",
    driver: "Venkat Raman",
    distance: "502 km",
    eta: "7h 20m",
    route: [
      { lat: 13.0827, lng: 80.2707 }, // Chennai
      { lat: 12.4, lng: 79.8 },
      { lat: 11.8, lng: 78.6 },
      { lat: 11.0168, lng: 76.9558 }, // Coimbatore
    ],
  },
];

// --- MAP COMPONENT WITH MOVING MARKER ---
const LeafletMap = ({ route, currentRouteIndex, vehicleNumber, tripId }) => {
  const mapRef = React.useRef(null);
  const mapInstanceRef = React.useRef(null);
  const markerRef = React.useRef(null);
  const polylineRef = React.useRef(null);

  const currentPoint = route[currentRouteIndex] || route[0];

  useEffect(() => {
    if (!mapRef.current) return;
    if (typeof window.L === "undefined") return;

    const L = window.L;

    // Cleanup previous instance
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
    }

    const startPoint = route[0];
    const map = L.map(mapRef.current).setView([startPoint.lat, startPoint.lng], 7);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap",
      maxZoom: 19,
    }).addTo(map);

    const latLngs = route.map((p) => [p.lat, p.lng]);
    polylineRef.current = L.polyline(latLngs, { color: "#1e88e5" }).addTo(map);
    map.fitBounds(polylineRef.current.getBounds(), { padding: [20, 20] });

    markerRef.current = L.marker([startPoint.lat, startPoint.lng]).addTo(map);
    markerRef.current
      .bindPopup(`<b>${vehicleNumber}</b><br>Trip: ${tripId}`)
      .openPopup();

    mapInstanceRef.current = map;

    setTimeout(() => {
      map.invalidateSize();
    }, 300);

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [route, tripId, vehicleNumber]);

  // Update marker position when currentRouteIndex changes
  useEffect(() => {
    if (!markerRef.current || !mapInstanceRef.current) return;
    const L = window.L;
    const pt = currentPoint;
    const newLatLng = L.latLng(pt.lat, pt.lng);
    markerRef.current.setLatLng(newLatLng);
    mapInstanceRef.current.panTo(newLatLng, { animate: true, duration: 0.5 });
  }, [currentPoint]);

  return (
    <div
      ref={mapRef}
      style={{ width: "100%", height: "400px", borderRadius: "8px", zIndex: 1 }}
    />
  );
};

LeafletMap.propTypes = {
  route: PropTypes.arrayOf(
    PropTypes.shape({
      lat: PropTypes.number,
      lng: PropTypes.number,
    })
  ).isRequired,
  currentRouteIndex: PropTypes.number.isRequired,
  vehicleNumber: PropTypes.string.isRequired,
  tripId: PropTypes.string.isRequired,
};

// --- PROGRESS BAR COMPONENT ---
const TripProgress = ({ steps, currentIndex }) => {
  return (
    <Box sx={{ width: "100%", mb: 3 }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          position: "relative",
          mb: 3,
        }}
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "6%",
            right: "6%",
            height: 4,
            bgcolor: "#e0e0e0",
            zIndex: 0,
          }}
        />
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "6%",
            width: `${(currentIndex / (steps.length - 1)) * 88 || 0}%`,
            height: 4,
            bgcolor: "#4caf50",
            zIndex: 1,
            transition: "width 0.4s ease",
          }}
        />
        {steps.map((step, index) => {
          const isCompleted = index <= currentIndex;
          return (
            <Box
              key={step.key}
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                zIndex: 2,
              }}
            >
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  border: "3px solid",
                  borderColor: isCompleted ? "#4caf50" : "#e0e0e0",
                  bgcolor: isCompleted ? "#4caf50" : "#ffffff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#ffffff",
                  mb: 1,
                  transition: "all 0.3s ease",
                }}
              >
                {isCompleted ? (
                  <Icon sx={{ fontSize: 18 }}>check</Icon>
                ) : (
                  <Box
                    sx={{
                      width: 10,
                      height: 10,
                      borderRadius: "50%",
                      bgcolor: "#e0e0e0",
                    }}
                  />
                )}
              </Box>
              <MDTypography
                variant="button"
                color="text"
                sx={{ fontSize: "0.75rem" }}
              >
                {step.label}
              </MDTypography>
            </Box>
          );
        })}
      </Box>

      <Box
        sx={{
          mt: 2,
          pt: 2,
          borderTop: "1px dashed #e0e0e0",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Box>
          <MDTypography variant="caption" color="text">
            Booked at
          </MDTypography>
          <MDTypography variant="body2" fontWeight="medium">
            Vatika India Sec 82 SO - 122012
          </MDTypography>
        </Box>
        <Box textAlign="center">
          <Icon sx={{ color: "#4caf50", fontSize: 30 }}>local_shipping</Icon>
          <MDTypography variant="body2" fontWeight="medium">
            {steps[currentIndex]?.label || "Booked"}
          </MDTypography>
        </Box>
        <Box textAlign="right">
          <MDTypography variant="caption" color="text">
            Destination
          </MDTypography>
          <MDTypography variant="body2" fontWeight="medium">
            Noida HO - 201301
          </MDTypography>
        </Box>
      </Box>
    </Box>
  );
};

TripProgress.propTypes = {
  steps: PropTypes.array.isRequired,
  currentIndex: PropTypes.number.isRequired,
};

// --- MAIN COMPONENT ---
function TripDashboard({ accountId }) {
  const navigate = useNavigate();
  const [menu, setMenu] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const [trips, setTrips] = useState(
    mockTrips.map((t) => ({
      ...t,
      progressIndex: 0,
      routeIndex: 0,
      isPlaying: false,
    }))
  );

  const [expandedTripId, setExpandedTripId] = useState(null);
  const [leafletLoaded, setLeafletLoaded] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const openMenu = ({ currentTarget }) => setMenu(currentTarget);
  const closeMenu = () => setMenu(null);

  // Load Leaflet
  useEffect(() => {
    if (typeof window.L !== "undefined") {
      setLeafletLoaded(true);
      return;
    }
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = LEAFLET_CSS;
    document.head.appendChild(link);
    const script = document.createElement("script");
    script.src = LEAFLET_JS;
    script.async = true;
    script.onload = () => setLeafletLoaded(true);
    document.head.appendChild(script);
  }, []);

  // Auto advance progress + route
  useEffect(() => {
    const interval = setInterval(() => {
      setTrips((prev) =>
        prev.map((t) => {
          if (!t.isPlaying) return t;

          const maxStepIndex = BASE_STEPS.length - 1;
          const maxRouteIndex = t.route.length - 1;

          const nextStepIndex =
            t.progressIndex < maxStepIndex ? t.progressIndex + 1 : maxStepIndex;
          const nextRouteIndex =
            t.routeIndex < maxRouteIndex ? t.routeIndex + 1 : maxRouteIndex;

          const reachedEnd =
            nextStepIndex === maxStepIndex && nextRouteIndex === maxRouteIndex;

          return {
            ...t,
            progressIndex: nextStepIndex,
            routeIndex: nextRouteIndex,
            isPlaying: reachedEnd ? false : true,
          };
        })
      );
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  const handleUpdateTrip = (id) => alert(`Update Trip: ${id}`);

  const handleCloseTrip = (id) => {
    if (window.confirm("Close trip?"))
      setTrips((prev) =>
        prev.map((t) =>
          t.id === id ? { ...t, status: "Closed", isPlaying: false } : t
        )
      );
  };

  const toggleTripDetails = (id) =>
    setExpandedTripId((prev) => (prev === id ? null : id));

  const handleImeiClick = (imei) => alert(`Maps to Live Track: ${imei}`);

  const handlePlayProgress = (id) => {
    setTrips((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;
        const maxStepIndex = BASE_STEPS.length - 1;
        const maxRouteIndex = t.route.length - 1;

        // restart if already at end
        const atEnd =
          t.progressIndex >= maxStepIndex && t.routeIndex >= maxRouteIndex;
        return {
          ...t,
          progressIndex: atEnd ? 0 : t.progressIndex,
          routeIndex: atEnd ? 0 : t.routeIndex,
          isPlaying: true,
        };
      })
    );
  };

  const handlePauseProgress = (id) => {
    setTrips((prev) =>
      prev.map((t) => (t.id === id ? { ...t, isPlaying: false } : t))
    );
  };

  const filteredTrips = useMemo(() => {
    if (!searchTerm) return trips;
    const term = searchTerm.toLowerCase();
    return trips.filter(
      (t) =>
        t.vehicleNumber.toLowerCase().includes(term) ||
        t.accountName.toLowerCase().includes(term)
    );
  }, [trips, searchTerm]);

  const paginatedTrips = filteredTrips.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <MDBox pt={6} pb={3} ml={11}>
      <Grid container spacing={6}>
        <Grid item xs={12}>
          <Card>
            <MDBox
              mx={2}
              mt={-3}
              py={3}
              px={2}
              variant="gradient"
              bgColor="info"
              borderRadius="lg"
              coloredShadow="info"
            >
              <MDTypography variant="h6" color="white">
                Trip Dashboard
              </MDTypography>
            </MDBox>

            <MDBox p={3}>
              <MDBox
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                mb={3}
              >
                <MDBox display="flex" alignItems="center">
                  <MDTypography
                    variant="button"
                    color="text"
                    fontWeight="regular"
                  >
                    Showing <strong>{filteredTrips.length}</strong> active trips
                  </MDTypography>
                </MDBox>
                <MDBox display="flex" gap={2}>
                  <TextField
                    size="small"
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Icon>search</Icon>
                        </InputAdornment>
                      ),
                    }}
                  />
                  <IconButton onClick={openMenu}>
                    <Icon>more_vert</Icon>
                  </IconButton>
                  <Menu anchorEl={menu} open={Boolean(menu)} onClose={closeMenu}>
                    <MenuItem onClick={closeMenu}>Export CSV</MenuItem>
                  </Menu>
                </MDBox>
              </MDBox>

              <TableContainer
                sx={{
                  boxShadow: "none",
                  border: "1px solid #f0f2f5",
                  borderRadius: "8px",
                  marginLeft: "15px",
                  width: "calc(100% - 15px)",
                }}
              >
                <Table sx={tableSx}>
                  <colgroup>
                    <col style={{ width: "15%" }} />
                    <col style={{ width: "15%" }} />
                    <col style={{ width: "15%" }} />
                    <col style={{ width: "12%" }} />
                    <col style={{ width: "12%" }} />
                    <col style={{ width: "12%" }} />
                    <col style={{ width: "10%" }} />
                    <col style={{ width: "9%" }} />
                  </colgroup>

                  <TableHead sx={tableHeadSx}>
                    <TableRow>
                      <TableCell align="center">Actions</TableCell>
                      <TableCell align="left">Vehicle No</TableCell>
                      <TableCell align="left">Account</TableCell>
                      <TableCell align="left">Source</TableCell>
                      <TableCell align="left">Destination</TableCell>
                      <TableCell align="center">IMEI</TableCell>
                      <TableCell align="center">Trip ID</TableCell>
                      <TableCell align="center">Created</TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody sx={tableBodySx}>
                    {paginatedTrips.map((trip) => {
                      const isExpanded = expandedTripId === trip.id;
                      const state = trips.find((t) => t.id === trip.id);
                      const currentIndex = state?.progressIndex || 0;
                      const routeIndex = state?.routeIndex || 0;
                      const isPlaying = state?.isPlaying || false;

                      return (
                        <React.Fragment key={trip.id}>
                          <TableRow
                            sx={{
                              "& > *": { borderBottom: "unset" },
                              backgroundColor: isExpanded ? "#f1f8ff" : "inherit",
                            }}
                          >
                            <TableCell align="center">
                              <MDBox
                                display="flex"
                                justifyContent="center"
                                gap={1}
                              >
                                <Tooltip title="Update">
                                  <IconButton
                                    size="small"
                                    onClick={() => handleUpdateTrip(trip.id)}
                                    color="info"
                                  >
                                    <Icon>edit</Icon>
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Close">
                                  <IconButton
                                    size="small"
                                    onClick={() => handleCloseTrip(trip.id)}
                                    color="error"
                                  >
                                    <Icon>cancel</Icon>
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Details">
                                  <IconButton
                                    size="small"
                                    onClick={() => toggleTripDetails(trip.id)}
                                    color={isExpanded ? "success" : "default"}
                                  >
                                    <Icon>
                                      {isExpanded ? "expand_less" : "expand_more"}
                                    </Icon>
                                  </IconButton>
                                </Tooltip>
                              </MDBox>
                            </TableCell>
                            <TableCell>
                              <DataCell
                                text={trip.vehicleNumber}
                                fontWeight="bold"
                                isClickable
                                onClick={() => handleImeiClick(trip.imei)}
                              />
                            </TableCell>
                            <TableCell>
                              <DataCell text={trip.accountName} />
                            </TableCell>
                            <TableCell>
                              <DataCell text={trip.source} />
                            </TableCell>
                            <TableCell>
                              <DataCell text={trip.destination} />
                            </TableCell>
                            <TableCell>
                              <DataCell text={trip.imei} align="center" />
                            </TableCell>
                            <TableCell>
                              <DataCell
                                text={trip.id}
                                color="info"
                                fontWeight="bold"
                                align="center"
                              />
                            </TableCell>
                            <TableCell>
                              <DataCell
                                text={trip.createdTime.split(" ")[1]}
                                align="center"
                              />
                            </TableCell>
                          </TableRow>

                          <TableRow>
                            <TableCell
                              style={{ paddingBottom: 0, paddingTop: 0 }}
                              colSpan={8}
                            >
                              <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                                <Box
                                  sx={{
                                    margin: 2,
                                    padding: 2,
                                    backgroundColor: "#fff",
                                    border: "1px solid #e0e0e0",
                                    borderRadius: "8px",
                                  }}
                                >
                                  <Grid container spacing={3}>
                                    <Grid item xs={12}>
                                      <Box
                                        display="flex"
                                        justifyContent="space-between"
                                        alignItems="center"
                                        mb={1}
                                      >
                                        <MDTypography variant="h6">
                                          Trip Progress
                                        </MDTypography>
                                        <Box display="flex" gap={1}>
                                          <Button
                                            size="small"
                                            variant="contained"
                                            color="success"
                                            startIcon={<Icon>play_arrow</Icon>}
                                            onClick={() =>
                                              handlePlayProgress(trip.id)
                                            }
                                            disabled={isPlaying}
                                          >
                                            Play
                                          </Button>
                                          <Button
                                            size="small"
                                            variant="outlined"
                                            color="inherit"
                                            startIcon={<Icon>pause</Icon>}
                                            onClick={() =>
                                              handlePauseProgress(trip.id)
                                            }
                                            disabled={!isPlaying}
                                          >
                                            Pause
                                          </Button>
                                        </Box>
                                      </Box>

                                      <TripProgress
                                        steps={BASE_STEPS}
                                        currentIndex={currentIndex}
                                      />
                                    </Grid>

                                    <Grid item xs={12} md={4}>
                                      <MDTypography variant="h6" gutterBottom>
                                        Trip Details
                                      </MDTypography>
                                      <Box
                                        display="grid"
                                        gridTemplateColumns="1fr 1fr"
                                        gap={2}
                                      >
                                        <Box>
                                          <MDTypography
                                            variant="caption"
                                            color="text"
                                          >
                                            Status
                                          </MDTypography>
                                          <MDTypography
                                            variant="body2"
                                            fontWeight="bold"
                                            color={
                                              trip.status === "Completed"
                                                ? "success"
                                                : "info"
                                            }
                                          >
                                            {trip.status}
                                          </MDTypography>
                                        </Box>
                                        <Box>
                                          <MDTypography
                                            variant="caption"
                                            color="text"
                                          >
                                            Driver
                                          </MDTypography>
                                          <MDTypography variant="body2">
                                            {trip.driver}
                                          </MDTypography>
                                        </Box>
                                        <Box>
                                          <MDTypography
                                            variant="caption"
                                            color="text"
                                          >
                                            ETA
                                          </MDTypography>
                                          <MDTypography variant="body2">
                                            {trip.eta}
                                          </MDTypography>
                                        </Box>
                                        <Box>
                                          <MDTypography
                                            variant="caption"
                                            color="text"
                                          >
                                            Distance
                                          </MDTypography>
                                          <MDTypography variant="body2">
                                            {trip.distance}
                                          </MDTypography>
                                        </Box>
                                      </Box>
                                    </Grid>

                                    <Grid item xs={12} md={8}>
                                      {leafletLoaded ? (
                                        <LeafletMap
                                          route={trip.route}
                                          currentRouteIndex={routeIndex}
                                          vehicleNumber={trip.vehicleNumber}
                                          tripId={trip.id}
                                        />
                                      ) : (
                                        <Box
                                          height="400px"
                                          display="flex"
                                          alignItems="center"
                                          justifyContent="center"
                                          bgcolor="#f5f5f5"
                                        >
                                          <CircularProgress />
                                        </Box>
                                      )}
                                    </Grid>
                                  </Grid>
                                </Box>
                              </Collapse>
                            </TableCell>
                          </TableRow>
                        </React.Fragment>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>

              <TablePagination
                rowsPerPageOptions={[10, 25, 50]}
                component="div"
                count={filteredTrips.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={(e, p) => setPage(p)}
                onRowsPerPageChange={(e) => {
                  setRowsPerPage(parseInt(e.target.value, 10));
                  setPage(0);
                }}
              />
            </MDBox>
          </Card>
        </Grid>
      </Grid>
    </MDBox>
  );
}

TripDashboard.propTypes = {
  accountId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
};

export default TripDashboard;
