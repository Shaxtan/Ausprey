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

import "./TripDashboard.css";

/* Leaflet constants (kept for future use if needed) */
const LEAFLET_CSS =
  "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.css";
const LEAFLET_JS =
  "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.js";

/* Progress steps */
const BASE_STEPS = [
  { key: "Mumbai", label: "Mumbai" },
  { key: "Pune", label: "Pune" },
  { key: "Satara", label: "Satara" },
  { key: "Bhopal", label: "Bhopal" },
  { key: "Mahabaleswar", label: "Mahabaleswar" },
];

/* Mock lock rows for new columns */
const mockLockRows = [
  {
    id: "LOCK001",
    lock: "Lock 1",
    unlock: "Yes",
    partiallyLocked: "No",
    noAlert: "Yes",
    withAlert: "No",
    reachedCenter: "Yes",
    notReached: "No",
    unlockForExam: "Yes",
    notUnlockForExam: "No",
  },
  {
    id: "LOCK002",
    lock: "Lock 2",
    unlock: "No",
    partiallyLocked: "Yes",
    noAlert: "No",
    withAlert: "Yes",
    reachedCenter: "No",
    notReached: "Yes",
    unlockForExam: "No",
    notUnlockForExam: "Yes",
  },
  {
    id: "LOCK003",
    lock: "Lock 3",
    unlock: "Yes",
    partiallyLocked: "No",
    noAlert: "Yes",
    withAlert: "No",
    reachedCenter: "Yes",
    notReached: "No",
    unlockForExam: "No",
    notUnlockForExam: "Yes",
  },
  {
    id: "LOCK004",
    lock: "Lock 4",
    unlock: "No",
    partiallyLocked: "No",
    noAlert: "No",
    withAlert: "Yes",
    reachedCenter: "No",
    notReached: "Yes",
    unlockForExam: "Yes",
    notUnlockForExam: "No",
  },
  {
    id: "LOCK005",
    lock: "Lock 5",
    unlock: "Yes",
    partiallyLocked: "No",
    noAlert: "Yes",
    withAlert: "No",
    reachedCenter: "Yes",
    notReached: "No",
    unlockForExam: "Yes",
    notUnlockForExam: "No",
  },
];

/* Column definitions */
const headerColumns = [
  { key: "lock", label: "Lock", width: "11%" },
  { key: "unlock", label: "Unlock", width: "11%" },
  { key: "partiallyLocked", label: "Partially Locked", width: "13%" },
  { key: "noAlert", label: "No Alert", width: "11%" },
  { key: "withAlert", label: "With Alert", width: "11%" },
  { key: "reachedCenter", label: "Reached Center", width: "13%" },
  { key: "notReached", label: "Not Reached", width: "11%" },
  { key: "unlockForExam", label: "Unlock for Exam", width: "13%" },
  { key: "notUnlockForExam", label: "Not Unlock for Exam", width: "16%" },
];

/* Horizontal tweak for each column (header + main row) */
const lockColumnOffsets = {
  lock: 0,
  unlock: 0,
  partiallyLocked: 0,
  noAlert: 0,
  withAlert: 0, // slight shift to visually center that header + data
  reachedCenter: 0,
  notReached: 0,
  unlockForExam: 0,
  notUnlockForExam: 0,
};

/* Label offsets inside the expanded "Lock Details" grid */
const lockDetailsLabelMl = {
  lock: 2,
  unlock: 2,
  partiallyLocked: 2,
  noAlert: 2,
  withAlert: 10,
  reachedCenter: 2,
  notReached: 2,
  unlockForExam: 2,
  notUnlockForExam: 2,
};

/* Small cell component */
const DataCell = ({
  text,
  color = "text",
  fontWeight = "regular",
  isClickable,
  onClick,
  align = "center",
  sx = {},
}) => (
  <MDBox
    display="flex"
    alignItems="center"
    justifyContent={align === "center" ? "center" : "flex-start"}
    width="100%"
    sx={sx}
  >
    <MDTypography
      variant="caption"
      color={color}
      fontWeight={fontWeight}
      className={isClickable ? "data-cell-clickable" : ""}
      onClick={isClickable ? onClick : undefined}
    >
      {text}
    </MDTypography>
  </MDBox>
);

DataCell.propTypes = {
  text: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  color: PropTypes.string,
  fontWeight: PropTypes.string,
  isClickable: PropTypes.bool,
  onClick: PropTypes.func,
  align: PropTypes.string,
  sx: PropTypes.object,
};

/* Trip progress component */
const TripProgress = ({ steps, currentIndex }) => {
  const fillWidth =
    steps.length > 1 ? (currentIndex / (steps.length - 1)) * 88 : 0;

  return (
    <div className="trip-progress-root">
      <div className="trip-progress-steps">
        <div className="trip-progress-track-bg" />
        <div
          className="trip-progress-track-fill"
          style={{ width: `${fillWidth || 0}%` }}
        />
        {steps.map((step, index) => {
          const isCompleted = index <= currentIndex;
          return (
            <div key={step.key} className="trip-progress-step">
              <div
                className={[
                  "trip-progress-step-circle",
                  isCompleted
                    ? "trip-progress-step-circle-completed"
                    : "trip-progress-step-circle-pending",
                ].join(" ")}
              >
                {isCompleted ? (
                  <Icon sx={{ fontSize: 18 }}>check</Icon>
                ) : (
                  <div className="trip-progress-step-dot" />
                )}
              </div>
              <MDTypography
                variant="button"
                color="text"
                sx={{ fontSize: "0.75rem" }}
              >
                {step.label}
              </MDTypography>
            </div>
          );
        })}
      </div>

      <div className="trip-progress-bottom">
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
      </div>
    </div>
  );
};

TripProgress.propTypes = {
  steps: PropTypes.array.isRequired,
  currentIndex: PropTypes.number.isRequired,
};

/* Leaflet map (kept for future) */
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
    const map = L.map(mapRef.current).setView(
      [startPoint.lat, startPoint.lng],
      7
    );

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

  useEffect(() => {
    if (!markerRef.current || !mapInstanceRef.current) return;
    const L = window.L;
    const pt = currentPoint;
    const newLatLng = L.latLng(pt.lat, pt.lng);
    markerRef.current.setLatLng(newLatLng);
    mapInstanceRef.current.panTo(newLatLng, {
      animate: true,
      duration: 0.5,
    });
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

/* Main component */
function TripDashboard({ accountId }) {
  const navigate = useNavigate();
  const [menu, setMenu] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const [rows, setRows] = useState(mockLockRows);

  const [expandedRowId, setExpandedRowId] = useState(null);
  const [leafletLoaded, setLeafletLoaded] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [lockStats] = useState({
    totalLocks: 120,
    locksReachedCenter: 95,
    locksOpenedForExam: 70,
    locksNotOpenedForExam: 25,
    criticalAlerts: 4,
  });

  const openMenu = ({ currentTarget }) => setMenu(currentTarget);
  const closeMenu = () => setMenu(null);

  /* Filters for each header */
  const [headerFilterAnchor, setHeaderFilterAnchor] = useState(null);
  const [activeHeaderKey, setActiveHeaderKey] = useState(null);
  const [headerFilters, setHeaderFilters] = useState({
    lock: "",
    unlock: "",
    partiallyLocked: "",
    noAlert: "",
    withAlert: "",
    reachedCenter: "",
    notReached: "",
    unlockForExam: "",
    notUnlockForExam: "",
  });

  const handleHeaderClick = (event, key) => {
    setActiveHeaderKey(key);
    setHeaderFilterAnchor(event.currentTarget);
  };

  const handleHeaderFilterClose = () => {
    setHeaderFilterAnchor(null);
    setActiveHeaderKey(null);
  };

  const handleHeaderFilterSelect = (value) => {
    if (activeHeaderKey) {
      setHeaderFilters((prev) => ({
        ...prev,
        [activeHeaderKey]: value,
      }));
    }
    handleHeaderFilterClose();
  };

  /* Load leaflet (kept to avoid breaking imports) */
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

  const handleCreateTrip = () => {
    alert("Create Trip clicked");
  };

  const filteredRows = useMemo(() => {
    let data = rows;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      data = data.filter((r) =>
        Object.values(r).some(
          (v) => String(v).toLowerCase().indexOf(term) !== -1
        )
      );
    }

    Object.entries(headerFilters).forEach(([key, value]) => {
      if (value) {
        data = data.filter((row) => String(row[key]) === value);
      }
    });

    return data;
  }, [rows, searchTerm, headerFilters]);

  const paginatedRows = filteredRows.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const handleRowDetailsToggle = (id) =>
    setExpandedRowId((prev) => (prev === id ? null : id));

  return (
    <MDBox className="trip-dashboard-root">
      <Grid container spacing={3}>
        {/* Lock quick view */}
        <Grid item xs={12}>
          <Card>
            <MDBox
              mx={2}
              mt={-3}
              py={2}
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
                Quick View (Locks)
              </MDTypography>
            </MDBox>

            <div className="lock-quick-view-wrapper">
              <div className="lock-quick-view-grid">
                <div className="lock-quick-view-grid-inner">
                  {[
                    {
                      label: "Total Locks",
                      value: lockStats.totalLocks,
                      icon: "lock",
                      iconBgClass: "icon-bg-blue",
                      iconColorClass: "icon-color-blue-600",
                      valueColorClass: "value-color-dark",
                      subtitle: "All locks in the system",
                    },
                    {
                      label: "Locks Reached Center",
                      value: lockStats.locksReachedCenter,
                      icon: "where_to_vote",
                      iconBgClass: "icon-bg-teal",
                      iconColorClass: "icon-color-teal-600",
                      valueColorClass: "value-color-teal",
                      subtitle: "Locks that reached center",
                    },
                    {
                      label: "Lock Opened for Exam",
                      value: lockStats.locksOpenedForExam,
                      icon: "lock_open",
                      iconBgClass: "icon-bg-green",
                      iconColorClass: "icon-color-green-600",
                      valueColorClass: "value-color-green",
                      subtitle: "Opened at exam location",
                    },
                    {
                      label: "Lock Not Opened for Exam",
                      value: lockStats.locksNotOpenedForExam,
                      icon: "lock_clock",
                      iconBgClass: "icon-bg-amber",
                      iconColorClass: "icon-color-amber-600",
                      valueColorClass: "value-color-amber",
                      subtitle: "Yet to be opened",
                    },
                    {
                      label: "Critical Alerts",
                      value: lockStats.criticalAlerts,
                      icon: "warning",
                      iconBgClass: "icon-bg-red",
                      iconColorClass: "icon-color-red-700",
                      valueColorClass: "value-color-red",
                      subtitle: "Locks needing attention",
                    },
                  ].map((item) => (
                    <div key={item.label} className="lock-quick-card">
                      <div
                        className={[
                          "lock-quick-card-icon",
                          item.iconBgClass,
                        ].join(" ")}
                      >
                        <Icon className={item.iconColorClass} sx={{ fontSize: 26 }}>
                          {item.icon}
                        </Icon>
                      </div>

                      <div className="lock-quick-card-content">
                        <p className="lock-quick-card-label">{item.label}</p>
                        <h5
                          className={[
                            "lock-quick-card-value",
                            item.valueColorClass,
                          ].join(" ")}
                        >
                          {item.value}
                        </h5>
                        <p className="lock-quick-card-subtitle">
                          {item.subtitle}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </Grid>

        {/* Lock table dashboard */}
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
                Lock Dashboard
              </MDTypography>
            </MDBox>

            <MDBox p={3}>
              <div className="trip-dashboard-header">
                <MDBox display="flex" alignItems="center">
                  <MDTypography
                    variant="button"
                    color="text"
                    fontWeight="regular"
                  >
                    Showing <strong>{filteredRows.length}</strong> records
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
                  <Menu
                    anchorEl={menu}
                    open={Boolean(menu)}
                    onClose={closeMenu}
                  >
                    <MenuItem onClick={closeMenu}>Export CSV</MenuItem>
                  </Menu>
                </MDBox>
              </div>

              <TableContainer
                className="trip-table-container"
                sx={{
                  border: "1px solid #e0e0e0",
                  borderRadius: 1,
                  maxHeight: 600,
                  overflow: "auto",
                }}
              >
                <Table
                  stickyHeader
                  sx={{
                    tableLayout: "fixed",
                    width: "100%",
                  }}
                >
                  {/* Fixed column widths */}
                  <colgroup>
                    {headerColumns.map((col) => (
                      <col key={col.key} style={{ width: col.width }} />
                    ))}
                  </colgroup>

                  <TableHead className="trip-table-head">
                    <TableRow>
                      {headerColumns.map((col) => (
                        <TableCell
                          key={col.key}
                          align="center"
                          sx={{
                            bgcolor: "#f5f5f5",
                            fontWeight: "bold",
                            fontSize: "0.875rem",
                            py: 1.5,
                            px: 1,
                            borderBottom: "2px solid #ddd",
                          }}
                        >
                          <MDBox
                            display="inline-flex"
                            alignItems="center"
                            justifyContent="center"
                            className="data-cell-clickable"
                            onClick={(e) => handleHeaderClick(e, col.key)}
                            sx={{
                              width: "100%",
                              cursor: "pointer",
                              ml: lockColumnOffsets[col.key] || 0,
                            }}
                          >
                            <span>{col.label}</span>
                            <Icon sx={{ fontSize: 16, ml: 0.5 }}>
                              arrow_drop_down
                            </Icon>
                          </MDBox>
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>

                  <TableBody className="trip-table-body">
                    {paginatedRows.map((row) => {
                      const isExpanded = expandedRowId === row.id;
                      return (
                        <React.Fragment key={row.id}>
                          <TableRow
                            sx={{
                              "&:hover": { bgcolor: "#f9f9f9" },
                              backgroundColor: isExpanded ? "#f1f8ff" : "inherit",
                            }}
                            onClick={() => handleRowDetailsToggle(row.id)}
                          >
                            <TableCell align="center" sx={{ py: 1.5, px: 1 }}>
                              <DataCell
                                text={row.lock}
                                fontWeight="bold"
                                align="center"
                                sx={{ ml: lockColumnOffsets.lock || 0 }}
                              />
                            </TableCell>
                            <TableCell align="center" sx={{ py: 1.5, px: 1 }}>
                              <DataCell
                                text={row.unlock}
                                align="center"
                                sx={{ ml: lockColumnOffsets.unlock || 0 }}
                              />
                            </TableCell>
                            <TableCell align="center" sx={{ py: 1.5, px: 1 }}>
                              <DataCell
                                text={row.partiallyLocked}
                                align="center"
                                sx={{
                                  ml: lockColumnOffsets.partiallyLocked || 0,
                                }}
                              />
                            </TableCell>
                            <TableCell align="center" sx={{ py: 1.5, px: 1 }}>
                              <DataCell
                                text={row.noAlert}
                                align="center"
                                sx={{ ml: lockColumnOffsets.noAlert || 0 }}
                              />
                            </TableCell>
                            <TableCell align="center" sx={{ py: 1.5, px: 1 }}>
                              <DataCell
                                text={row.withAlert}
                                align="center"
                                sx={{ ml: lockColumnOffsets.withAlert || 0 }}
                              />
                            </TableCell>
                            <TableCell align="center" sx={{ py: 1.5, px: 1 }}>
                              <DataCell
                                text={row.reachedCenter}
                                align="center"
                                sx={{
                                  ml: lockColumnOffsets.reachedCenter || 0,
                                }}
                              />
                            </TableCell>
                            <TableCell align="center" sx={{ py: 1.5, px: 1 }}>
                              <DataCell
                                text={row.notReached}
                                align="center"
                                sx={{ ml: lockColumnOffsets.notReached || 0 }}
                              />
                            </TableCell>
                            <TableCell align="center" sx={{ py: 1.5, px: 1 }}>
                              <DataCell
                                text={row.unlockForExam}
                                align="center"
                                sx={{
                                  ml: lockColumnOffsets.unlockForExam || 0,
                                }}
                              />
                            </TableCell>
                            <TableCell align="center" sx={{ py: 1.5, px: 1 }}>
                              <DataCell
                                text={row.notUnlockForExam}
                                align="center"
                                sx={{
                                  ml: lockColumnOffsets.notUnlockForExam || 0,
                                }}
                              />
                            </TableCell>
                          </TableRow>

                          <TableRow>
                            <TableCell
                              style={{ paddingBottom: 0, paddingTop: 0 }}
                              colSpan={9}
                            >
                              <Collapse
                                in={isExpanded}
                                timeout="auto"
                                unmountOnExit
                              >
                                <div className="trip-details-box">
                                  <MDTypography variant="h6" gutterBottom>
                                    Lock Details
                                  </MDTypography>

                                  <Grid container spacing={6}>
                                    <Grid item xs={6} md={3}>
                                      <MDTypography
                                        variant="caption"
                                        color="text"
                                        sx={{ ml: lockDetailsLabelMl.lock }}
                                      >
                                        Lock
                                      </MDTypography>
                                      <MDTypography
                                        variant="body2"
                                        sx={{ ml: lockDetailsLabelMl.lock }}
                                      >
                                        {row.lock}
                                      </MDTypography>
                                    </Grid>

                                    <Grid item xs={6} md={3}>
                                      <MDTypography
                                        variant="caption"
                                        color="text"
                                        sx={{ ml: lockDetailsLabelMl.unlock }}
                                      >
                                        Unlock
                                      </MDTypography>
                                      <MDTypography
                                        variant="body2"
                                        sx={{ ml: lockDetailsLabelMl.unlock }}
                                      >
                                        {row.unlock}
                                      </MDTypography>
                                    </Grid>

                                    <Grid item xs={6} md={3}>
                                      <MDTypography
                                        variant="caption"
                                        color="text"
                                        sx={{
                                          ml: lockDetailsLabelMl.partiallyLocked,
                                        }}
                                      >
                                        Partially Locked
                                      </MDTypography>
                                      <MDTypography
                                        variant="body2"
                                        sx={{
                                          ml: lockDetailsLabelMl.partiallyLocked,
                                        }}
                                      >
                                        {row.partiallyLocked}
                                      </MDTypography>
                                    </Grid>

                                    <Grid item xs={6} md={3}>
                                      <MDTypography
                                        variant="caption"
                                        color="text"
                                        sx={{ ml: lockDetailsLabelMl.noAlert }}
                                      >
                                        No Alert
                                      </MDTypography>
                                      <MDTypography
                                        variant="body2"
                                        sx={{ ml: lockDetailsLabelMl.noAlert }}
                                      >
                                        {row.noAlert}
                                      </MDTypography>
                                    </Grid>

                                    <Grid item xs={6} md={3}>
                                      <MDTypography
                                        variant="caption"
                                        color="text"
                                        sx={{ ml: lockDetailsLabelMl.withAlert }}
                                      >
                                        With Alert
                                      </MDTypography>
                                      <MDTypography
                                        variant="body2"
                                        sx={{ ml: lockDetailsLabelMl.withAlert }}
                                      >
                                        {row.withAlert}
                                      </MDTypography>
                                    </Grid>

                                    <Grid item xs={6} md={3}>
                                      <MDTypography
                                        variant="caption"
                                        color="text"
                                        sx={{
                                          ml: lockDetailsLabelMl.reachedCenter,
                                        }}
                                      >
                                        Reached Center
                                      </MDTypography>
                                      <MDTypography
                                        variant="body2"
                                        sx={{
                                          ml: lockDetailsLabelMl.reachedCenter,
                                        }}
                                      >
                                        {row.reachedCenter}
                                      </MDTypography>
                                    </Grid>

                                    <Grid item xs={6} md={3}>
                                      <MDTypography
                                        variant="caption"
                                        color="text"
                                        sx={{ ml: lockDetailsLabelMl.notReached }}
                                      >
                                        Not Reached
                                      </MDTypography>
                                      <MDTypography
                                        variant="body2"
                                        sx={{ ml: lockDetailsLabelMl.notReached }}
                                      >
                                        {row.notReached}
                                      </MDTypography>
                                    </Grid>

                                    <Grid item xs={6} md={3}>
                                      <MDTypography
                                        variant="caption"
                                        color="text"
                                        sx={{
                                          ml: lockDetailsLabelMl.unlockForExam,
                                        }}
                                      >
                                        Unlock for Exam
                                      </MDTypography>
                                      <MDTypography
                                        variant="body2"
                                        sx={{
                                          ml: lockDetailsLabelMl.unlockForExam,
                                        }}
                                      >
                                        {row.unlockForExam}
                                      </MDTypography>
                                    </Grid>

                                    <Grid item xs={6} md={3}>
                                      <MDTypography
                                        variant="caption"
                                        color="text"
                                        sx={{
                                          ml: lockDetailsLabelMl.notUnlockForExam,
                                        }}
                                      >
                                        Not Unlock for Exam
                                      </MDTypography>
                                      <MDTypography
                                        variant="body2"
                                        sx={{
                                          ml: lockDetailsLabelMl.notUnlockForExam,
                                        }}
                                      >
                                        {row.notUnlockForExam}
                                      </MDTypography>
                                    </Grid>
                                  </Grid>
                                </div>
                              </Collapse>
                            </TableCell>
                          </TableRow>
                        </React.Fragment>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>

              {/* header filter dropdown */}
              <Menu
                anchorEl={headerFilterAnchor}
                open={Boolean(headerFilterAnchor)}
                onClose={handleHeaderFilterClose}
              >
                {["Option 1", "Option 2", "Option 3", "Option 4", "Option 5"].map(
                  (opt) => (
                    <MenuItem
                      key={opt}
                      onClick={() => handleHeaderFilterSelect(opt)}
                    >
                      {opt}
                    </MenuItem>
                  )
                )}
              </Menu>

              <TablePagination
                rowsPerPageOptions={[10, 25, 50]}
                component="div"
                count={filteredRows.length}
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
