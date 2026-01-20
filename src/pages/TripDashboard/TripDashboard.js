import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";

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

import MDBox from "../../assets/components/MDBox";
import MDTypography from "../../assets/components/MDTypography";
import MDButton from "../../assets/components/MDButton";
import ApiService from "../../services/ApiService";

import CreateTripDialog from "./CreateTripDialog";

const LEAFLET_CSS = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.css";
const LEAFLET_JS = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.js";

const clickableTextSx = {
  cursor: "pointer",
  "&:hover": { textDecoration: "underline", color: "#1A73E8" },
};

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

// --- MOCK DATA ---
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
      { lat: 19.076, lng: 72.8777 },
      { lat: 18.9, lng: 73.2 },
      { lat: 18.7, lng: 73.4 },
      { lat: 18.5204, lng: 73.8567 },
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
      { lat: 28.6139, lng: 77.209 },
      { lat: 28.3, lng: 76.8 },
      { lat: 27.5, lng: 76.9 },
      { lat: 26.9124, lng: 75.7873 },
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
      { lat: 12.9716, lng: 77.5946 },
      { lat: 12.6, lng: 78.5 },
      { lat: 12.2, lng: 79.2 },
      { lat: 13.0827, lng: 80.2707 },
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
      { lat: 23.0225, lng: 72.5714 },
      { lat: 22.8, lng: 72.9 },
      { lat: 22.5, lng: 73.0 },
      { lat: 22.3072, lng: 73.1812 },
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
      { lat: 13.0827, lng: 80.2707 },
      { lat: 12.4, lng: 79.8 },
      { lat: 11.8, lng: 78.6 },
      { lat: 11.0168, lng: 76.9558 },
    ],
  },
];

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
    markerRef.current.bindPopup(`<b>${vehicleNumber}</b><br>Trip: ${tripId}`).openPopup();

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

  useEffect(() => {
    if (!markerRef.current || !mapInstanceRef.current) return;
    const L = window.L;
    const pt = currentPoint;
    const newLatLng = L.latLng(pt.lat, pt.lng);
    markerRef.current.setLatLng(newLatLng);
    mapInstanceRef.current.panTo(newLatLng, { animate: true, duration: 0.5 });
  }, [currentPoint]);

  return (
    <div ref={mapRef} style={{ width: "100%", height: "400px", borderRadius: "8px", zIndex: 1 }} />
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
              <MDTypography variant="button" color="text" sx={{ fontSize: "0.75rem" }}>
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

  // CREATE TRIP DIALOG STATE
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    vehicleNumber: "",
    accountName: "",
    source: "",
    destination: "",
    imei: "",
    driver: "",
  });
  const [createErrors, setCreateErrors] = useState({});

  const openMenu = ({ currentTarget }) => setMenu(currentTarget);
  const closeMenu = () => setMenu(null);
  // Add these state variables inside TripDashboard
  const [dynamicFields, setDynamicFields] = useState([]); // Array of {key, label, type}

  // Fetch template on component mount or when opening Dialog
  useEffect(() => {
    ApiService.getTripTemplate(1).then((res) => {
      if (res?.data?.resultCode === 1) {
        const fieldMap = res.data.data.fieldMap;

        // 1. Convert Object to Array: [{ key: "cemobile", type: "MOBILE", label: "Consignee Mobile" }]
        const parsedFields = Object.keys(fieldMap).map((key) => {
          const [type, label] = fieldMap[key].split("~");
          return { key, type, label };
        });

        setDynamicFields(parsedFields);

        // 2. IMPORTANT: Pre-fill createForm with these dynamic keys
        setCreateForm((prev) => {
          const dynamicState = { ...prev };
          parsedFields.forEach((field) => {
            if (!(field.key in dynamicState)) {
              dynamicState[field.key] = ""; // Initialize dynamic field
            }
          });
          return dynamicState;
        });
      }
    });
  }, []);

  const handleCreateDialogSubmit = () => {
    // 1. Build the optMap: The API expects "Label": "User Value"
    const optMap = {};
    dynamicFields.forEach((field) => {
      // We use field.key to get the value from the form state,
      // but field.label as the key for the API payload
      optMap[field.label] = createForm[field.key] || "";
    });

    // 2. Build the final payload
    const payload = {
      tripsList: [
        {
          accid: 1,
          imei: createForm.imei,
          vehNum: createForm.vehicleNumber,
          source: { id: "S1", name: createForm.source, lat: 0, lng: 0 },
          destination: { id: "D1", name: createForm.destination, lat: 0, lng: 0 },
          optMap: optMap, // This now contains the dynamic fields
          status: "In Transit",
          cts: new Date().toISOString(),
          createdby: "Admin",
          alerts: { maxSpeed: 80, sms: [], email: [], maxSleep: 0 },
        },
      ],
    };

    ApiService.createTrip(payload)
      .then(() => {
        alert("Trip Created successfully!");
        handleCreateDialogClose();
      })
      .catch((err) => console.error("Creation failed", err));
  };

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

          const nextStepIndex = t.progressIndex < maxStepIndex ? t.progressIndex + 1 : maxStepIndex;
          const nextRouteIndex = t.routeIndex < maxRouteIndex ? t.routeIndex + 1 : maxRouteIndex;

          const reachedEnd = nextStepIndex === maxStepIndex && nextRouteIndex === maxRouteIndex;

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
        prev.map((t) => (t.id === id ? { ...t, status: "Closed", isPlaying: false } : t))
      );
  };

  const toggleTripDetails = (id) => setExpandedTripId((prev) => (prev === id ? null : id));

  const handleImeiClick = (imei) => alert(`Maps to Live Track: ${imei}`);

  const handlePlayProgress = (id) => {
    setTrips((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;
        const maxStepIndex = BASE_STEPS.length - 1;
        const maxRouteIndex = t.route.length - 1;

        const atEnd = t.progressIndex >= maxStepIndex && t.routeIndex >= maxRouteIndex;
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
    setTrips((prev) => prev.map((t) => (t.id === id ? { ...t, isPlaying: false } : t)));
  };

  // OPEN DIALOG
  const handleCreateTrip = () => {
    setCreateDialogOpen(true);
  };

  const handleCreateDialogClose = () => {
    setCreateDialogOpen(false);
    setCreateForm({
      vehicleNumber: "",
      accountName: "",
      source: "",
      destination: "",
      imei: "",
      driver: "",
    });
    setCreateErrors({});
  };

  const handleCreateFieldChange = (field) => (e) => {
    setCreateForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  // const handleCreateDialogSubmit = () => {
  //   const requiredFields = [
  //     "vehicleNumber",
  //     "accountName",
  //     "source",
  //     "destination",
  //     "imei",
  //     "driver",
  //   ];
  //   const newErrors = {};
  //   requiredFields.forEach((f) => {
  //     if (!createForm[f]?.trim()) newErrors[f] = "Required";
  //   });
  //   if (Object.keys(newErrors).length > 0) {
  //     setCreateErrors(newErrors);
  //     return;
  //   }

  //   const newTrip = {
  //     id: `TRP${String(trips.length + 1).padStart(3, "0")}`,
  //     vehicleNumber: createForm.vehicleNumber,
  //     accountName: createForm.accountName,
  //     source: createForm.source,
  //     destination: createForm.destination,
  //     imei: createForm.imei,
  //     createdTime: new Date().toISOString(),
  //     status: "In Transit",
  //     driver: createForm.driver,
  //     distance: "0 km",
  //     eta: "N/A",
  //     route: [
  //       { lat: 19.076, lng: 72.8777 },
  //       { lat: 18.5204, lng: 73.8567 },
  //     ],
  //     progressIndex: 0,
  //     routeIndex: 0,
  //     isPlaying: false,
  //   };

  //   setTrips((prev) => [newTrip, ...prev]);
  //   handleCreateDialogClose();
  // };

  const filteredTrips = useMemo(() => {
    if (!searchTerm) return trips;
    const term = searchTerm.toLowerCase();
    return trips.filter(
      (t) =>
        t.vehicleNumber.toLowerCase().includes(term) || t.accountName.toLowerCase().includes(term)
    );
  }, [trips, searchTerm]);

  const paginatedTrips = filteredTrips.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  // Summary stats for 5 boxes
  const tripStats = useMemo(() => {
    const total = trips.length;
    const inTransit = trips.filter((t) => t.status === "In Transit").length;
    const stopped = trips.filter((t) => t.status === "Stopped").length;
    const alerts = trips.filter((t) => t.status === "Alert").length;
    const unreachable = trips.filter((t) => t.status === "Unreachable").length;
    const atSource = trips.filter((t) => t.status === "At Source").length;
    const atDestination = trips.filter((t) => t.status === "At Destination").length;

    return { total, inTransit, atSource, atDestination, alerts, stopped, unreachable };
  }, [trips]);

  return (
    <MDBox pt={6} pb={3} ml={11}>
      <Grid container spacing={3}>
        {/* QUICK VIEW container */}
        <Grid item xs={12}>
          <div
            style={{
              backgroundColor: "#ffffff",
              borderRadius: "16px",
              boxShadow: "0 18px 45px rgba(15, 23, 42, 0.12)",
              overflow: "hidden",
              marginBottom: "44px",
              border: "1px solid #e5e7eb",
            }}
          >
            {/* Header */}
            <div
              style={{
                background: "linear-gradient(135deg, #1A73E8 0%, #49a3f1 50%, #63b3ed 100%)",
                margin: "16px",
                marginTop: "14px",
                padding: "14px 22px",
                borderRadius: "14px",
                boxShadow: "0 10px 30px rgba(26, 115, 232, 0.45)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <h6
                style={{
                  color: "#ffffff",
                  fontSize: "0.95rem",
                  fontWeight: 600,
                  margin: 0,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                }}
              >
                Quick View
              </h6>
            </div>

            {/* Stats Grid */}
            <div style={{ padding: "20px 24px 24px" }}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
                  gap: "18px",
                }}
              >
                {[
                  {
                    label: "Total Trips",
                    value: tripStats.total,
                    icon: "list_alt",
                    iconBg: "#e3f2fd",
                    iconColor: "#1976d2",
                    valueColor: "#111827",
                    subtitle: "All trips in the system",
                  },
                  {
                    label: "In Transit",
                    value: tripStats.inTransit,
                    icon: "local_shipping",
                    iconBg: "#e3f2fd",
                    iconColor: "#1d4ed8",
                    valueColor: "#1d4ed8",
                    subtitle: "Vehicles currently moving",
                  },
                  {
                    label: "At Source",
                    value: tripStats.stopped,
                    icon: "stop_circle",
                    iconBg: "#fff3e0",
                    iconColor: "#f57c00",
                    valueColor: "#f57c00",
                    subtitle: "Ignition off / halted",
                  },
                  {
                    label: "At Destination",
                    value: tripStats.atDestination,
                    icon: "flag",
                    iconBg: "#e0f7fa",
                    iconColor: "#006064",
                    valueColor: "#006064",
                    subtitle: "Trips completed",
                  },
                  {
                    label: "Alerts",
                    value: tripStats.alerts,
                    icon: "warning",
                    iconBg: "#ffebee",
                    iconColor: "#d32f2f",
                    valueColor: "#d32f2f",
                    subtitle: "Trips needing attention",
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    style={{
                      backgroundColor: "#ffffff",
                      borderRadius: "14px",
                      padding: "16px 18px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      columnGap: "14px",
                      border: "1px solid #e5e7eb",
                      boxShadow: "0 4px 12px rgba(15, 23, 42, 0.06)",
                      transition:
                        "transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-3px)";
                      e.currentTarget.style.boxShadow = "0 14px 28px rgba(15, 23, 42, 0.16)";
                      e.currentTarget.style.borderColor = "#bfdbfe";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = "0 4px 12px rgba(15, 23, 42, 0.06)";
                      e.currentTarget.style.borderColor = "#e5e7eb";
                    }}
                  >
                    {/* Icon / badge */}
                    <div
                      style={{
                        backgroundColor: item.iconBg,
                        borderRadius: "12px",
                        padding: "10px",
                        minWidth: "44px",
                        minHeight: "44px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Icon
                        style={{
                          color: item.iconColor,
                          fontSize: "26px",
                        }}
                      >
                        {item.icon}
                      </Icon>
                    </div>

                    {/* Text content */}
                    <div style={{ flex: 1, textAlign: "right" }}>
                      <p
                        style={{
                          margin: "0 0 4px 0",
                          fontSize: "0.72rem",
                          fontWeight: 600,
                          color: "#6b7280",
                          textTransform: "uppercase",
                          letterSpacing: "0.08em",
                        }}
                      >
                        {item.label}
                      </p>
                      <h5
                        style={{
                          margin: 0,
                          fontSize: "1.45rem",
                          fontWeight: 700,
                          color: item.valueColor,
                          lineHeight: 1.1,
                        }}
                      >
                        {item.value}
                      </h5>
                      <p
                        style={{
                          margin: "4px 0 0 0",
                          fontSize: "0.7rem",
                          color: "#9ca3af",
                        }}
                      >
                        {item.subtitle}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Grid>

        {/* Existing Trip Dashboard card */}
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
              display="flex"
              justifyContent="space-between"
              alignItems="center"
            >
              <MDTypography variant="h6" color="white">
                Trip Dashboard
              </MDTypography>

              <MDBox display="flex" gap={1}>
                <MDButton variant="contained" color="white" size="small" onClick={handleCreateTrip}>
                  Create Trip
                </MDButton>
                <MDButton variant="contained" color="white" size="small" onClick={handleCreateTrip}>
                  Create Bulk Trip
                </MDButton>
              </MDBox>
            </MDBox>

            <MDBox p={3}>
              <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <MDBox display="flex" alignItems="center">
                  <MDTypography variant="button" color="text" fontWeight="regular">
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
                              <MDBox display="flex" justifyContent="center" gap={1}>
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
                                    <Icon>{isExpanded ? "expand_less" : "expand_more"}</Icon>
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
                              <DataCell text={trip.createdTime.split(" ")[1]} align="center" />
                            </TableCell>
                          </TableRow>

                          <TableRow>
                            <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={8}>
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
                                        <MDTypography variant="h6">Trip Progress</MDTypography>
                                        <Box display="flex" gap={1}>
                                          <Button
                                            size="small"
                                            variant="contained"
                                            color="success"
                                            startIcon={<Icon>play_arrow</Icon>}
                                            onClick={() => handlePlayProgress(trip.id)}
                                            disabled={isPlaying}
                                          >
                                            Play
                                          </Button>
                                          <Button
                                            size="small"
                                            variant="outlined"
                                            color="inherit"
                                            startIcon={<Icon>pause</Icon>}
                                            onClick={() => handlePauseProgress(trip.id)}
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
                                      <Box display="grid" gridTemplateColumns="1fr 1fr" gap={2}>
                                        <Box>
                                          <MDTypography variant="caption" color="text">
                                            Status
                                          </MDTypography>
                                          <MDTypography
                                            variant="body2"
                                            fontWeight="bold"
                                            color={trip.status === "Completed" ? "success" : "info"}
                                          >
                                            {trip.status}
                                          </MDTypography>
                                        </Box>
                                        <Box>
                                          <MDTypography variant="caption" color="text">
                                            Driver
                                          </MDTypography>
                                          <MDTypography variant="body2">{trip.driver}</MDTypography>
                                        </Box>
                                        <Box>
                                          <MDTypography variant="caption" color="text">
                                            ETA
                                          </MDTypography>
                                          <MDTypography variant="body2">{trip.eta}</MDTypography>
                                        </Box>
                                        <Box>
                                          <MDTypography variant="caption" color="text">
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

      {/* CREATE TRIP DIALOG (separated) */}
      <CreateTripDialog
        open={createDialogOpen}
        form={createForm}
        errors={createErrors}
        dynamicFields={dynamicFields} // Ensure this is passed!
        onClose={handleCreateDialogClose}
        onFieldChange={handleCreateFieldChange}
        onSubmit={handleCreateDialogSubmit}
      />
    </MDBox>
  );
}

TripDashboard.propTypes = {
  accountId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
};

export default TripDashboard;
