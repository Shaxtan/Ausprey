import React, { useState, useEffect, useMemo } from "react";
import PropTypes from "prop-types";
import Autocomplete from "@mui/material/Autocomplete";

import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";
import Icon from "@mui/material/Icon";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import CircularProgress from "@mui/material/CircularProgress";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import Box from "@mui/material/Box";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TablePagination from "@mui/material/TablePagination";
import Chip from "@mui/material/Chip";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import Divider from "@mui/material/Divider";
import Slide from "@mui/material/Slide";

import MDBox from "../../assets/components/MDBox";
import MDTypography from "../../assets/components/MDTypography";
import MDButton from "../../assets/components/MDButton";
import ApiService from "../../services/ApiService";

import MiniTrackPlayer from "./MiniTrackPlayer";

// ─── Modal Slide Transition ───────────────────────────────────────────────────
const SlideTransition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

// ─── Helpers ──────────────────────────────────────────────────────────────────
const formatTimeDisplay = (timeInput) => {
  if (!timeInput) return "—";
  const date = new Date(timeInput);
  if (isNaN(date.getTime())) return timeInput;
  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
};

const formatDuration = (durationStr) => {
  if (!durationStr) return "—";
  if (typeof durationStr === "string" && durationStr.includes(":")) return durationStr;
  const minutes = parseInt(durationStr);
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const COL_WIDTHS = {
  actions:       "6%",
  imei:          "16%",
  vehNum:        "14%",
  date:          "12%",
  sessions:      "11%",
  totalDist:     "11%",
  totalDuration: "13%",
  status:        "10%",
};

const tableHeadSx = {
  display: "table-header-group",
  "& .MuiTableCell-root": {
    backgroundColor: "#f8f9fa",
    color: "#7b809a",
    fontSize: "0.72rem",
    fontWeight: 700,
    opacity: 0.85,
    borderBottom: "1px solid #f0f2f5",
    textTransform: "uppercase",
    letterSpacing: "0.04em",
    padding: "10px 14px",
    whiteSpace: "nowrap",
    boxSizing: "border-box",
  },
};

const tableSx = {
  tableLayout: "fixed",
  width: "100%",
};

const tableBodySx = {
  "& .MuiTableRow-root.data-row:hover": {
    backgroundColor: "#f5f8ff",
    cursor: "pointer",
  },
  "& .MuiTableCell-root": {
    padding: "10px 14px",
    fontSize: "0.82rem",
    borderBottom: "1px solid #f0f2f5",
    verticalAlign: "middle",
    boxSizing: "border-box",
  },
};

// ─── Session Detail Modal ─────────────────────────────────────────────────────
const SessionDetailModal = ({ open, onClose, record }) => {
  const [activeSession, setActiveSession] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  // Reset state whenever the modal opens or the record changes
  useEffect(() => {
    if (open) {
      setActiveSession(0);
      setIsPlaying(false);
    }
  }, [open, record]);

  if (!record) return null;
  const session = record.sessions?.[activeSession];
  if (!session) return null;

  const handleSessionChange = (index) => {
    setActiveSession(index);
    setIsPlaying(false);
  };

  const handleClose = () => {
    setIsPlaying(false);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      TransitionComponent={SlideTransition}
      maxWidth="xl"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          overflow: "hidden",
          boxShadow: "0 24px 80px rgba(0,0,0,0.18)",
          maxWidth: 1400,
          width: "85%",
        },
      }}
    >
      {/* ── Modal Header ── */}
      <DialogTitle
        sx={{
          background: "linear-gradient(135deg, #1A73E8 0%, #0D47A1 100%)",
          color: "#fff",
          px: 3,
          py: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Box display="flex" alignItems="center" gap={1.5}>
          <Icon sx={{ fontSize: 22 }}>directions_car</Icon>
          <Box>
            <MDTypography variant="h6" color="white" sx={{ lineHeight: 1.2 }}>
              Session Details
            </MDTypography>
            <MDTypography
              variant="caption"
              sx={{ color: "rgba(255,255,255,0.75)", fontSize: "0.7rem" }}
            >
              {record.vehNum || record.imei} &nbsp;·&nbsp;{" "}
              {record.repDate?.split("T")[0] || "—"}
            </MDTypography>
          </Box>
        </Box>
        <IconButton onClick={handleClose} size="small" sx={{ color: "#fff" }}>
          <Icon>close</Icon>
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 0, background: "#f7f9fc" }}>
        <Grid container sx={{ minHeight: 650 }}>

          {/* ── Left Panel: Session Info ── */}
          <Grid
            item xs={12} md={3.5}
            sx={{
              background: "#fff",
              borderRight: "1px solid #e8eaf6",
              p: 3,
              display: "flex",
              flexDirection: "column",
              gap: 1,
            }}
          >
            {/* Play/Pause + label */}
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
              <MDTypography
                variant="button"
                fontWeight="bold"
                sx={{ fontSize: "0.78rem", color: "#344767" }}
              >
                Sessions
              </MDTypography>
              <MDButton
                variant="gradient"
                color={isPlaying ? "error" : "success"}
                size="small"
                onClick={() => setIsPlaying((p) => !p)}
                sx={{ px: 1.5, minHeight: "28px", fontSize: "0.7rem" }}
                startIcon={
                  <Icon sx={{ fontSize: "14px !important" }}>
                    {isPlaying ? "pause" : "play_arrow"}
                  </Icon>
                }
              >
                {isPlaying ? "Pause" : "Play"}
              </MDButton>
            </Box>

            {/* Session tabs */}
            <Box display="flex" flexWrap="wrap" gap={0.6} mb={1.5}>
              {record.sessions.map((s, i) => (
                <Chip
                  key={i}
                  label={`Session ${i + 1}`}
                  size="small"
                  color={activeSession === i ? "info" : "default"}
                  onClick={() => handleSessionChange(i)}
                  sx={{
                    cursor: "pointer",
                    fontWeight: activeSession === i ? 700 : 400,
                    fontSize: "0.68rem",
                  }}
                />
              ))}
            </Box>

            <Divider sx={{ mb: 1 }} />

            <MDTypography
              variant="caption"
              sx={{
                opacity: 0.5,
                fontSize: "0.62rem",
                textTransform: "uppercase",
                letterSpacing: 1,
                mb: 0.5,
              }}
            >
              Session {activeSession + 1} Stats
            </MDTypography>

            {/* Stats rows */}
            {[
              { label: "Start Time",   value: formatTimeDisplay(session.startTime), icon: "schedule"  },
              { label: "End Time",     value: formatTimeDisplay(session.endTime),   icon: "flag"       },
              { label: "Duration",     value: formatDuration(session.duration),     icon: "timer"      },
              { label: "Distance",     value: `${session.distance} km`,             icon: "straighten" },
              { label: "GPS Distance", value: `${session.gpsDistance} km`,          icon: "gps_fixed"  },
              { label: "Avg Speed",    value: `${session.avgSpeed} km/h`,           icon: "speed"      },
              { label: "Status",       value: session.status,                       icon: "info"       },
            ].map(({ label, value, icon }) => (
              <Box
                key={label}
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  py: 0.75,
                  borderBottom: "0.5px solid #f0f0f0",
                }}
              >
                <Box display="flex" alignItems="center" gap={0.6}>
                  <Icon sx={{ fontSize: 13, color: "#1A73E8" }}>{icon}</Icon>
                  <MDTypography
                    variant="caption"
                    color="text"
                    sx={{ opacity: 0.65, fontSize: "0.68rem" }}
                  >
                    {label}
                  </MDTypography>
                </Box>
                <MDTypography
                  variant="caption"
                  fontWeight="bold"
                  sx={{ fontSize: "0.72rem", color: "#344767" }}
                >
                  {value}
                </MDTypography>
              </Box>
            ))}

            {/* Locations */}
            <Box mt={1.5}>
              <MDTypography
                variant="caption"
                sx={{
                  opacity: 0.5,
                  fontSize: "0.62rem",
                  textTransform: "uppercase",
                  letterSpacing: 1,
                }}
              >
                Start Location
              </MDTypography>
              <MDTypography
                variant="caption"
                display="block"
                sx={{ fontSize: "0.7rem", mt: 0.3, lineHeight: 1.5, color: "#344767" }}
              >
                {session.startLocation || "—"}
              </MDTypography>
            </Box>
            <Box mt={0.8}>
              <MDTypography
                variant="caption"
                sx={{
                  opacity: 0.5,
                  fontSize: "0.62rem",
                  textTransform: "uppercase",
                  letterSpacing: 1,
                }}
              >
                End Location
              </MDTypography>
              <MDTypography
                variant="caption"
                display="block"
                sx={{ fontSize: "0.7rem", mt: 0.3, lineHeight: 1.5, color: "#344767" }}
              >
                {session.endLocation || "—"}
              </MDTypography>
            </Box>
          </Grid>

          {/* ── Right Panel: Map Playback ── */}
          <Grid
            item xs={12} md={8.5}
            sx={{ p: 2.5, display: "flex", flexDirection: "column", gap: 1.5 }}
          >
            <Box display="flex" alignItems="center" gap={1}>
              <Icon sx={{ color: "#1A73E8", fontSize: 18 }}>map</Icon>
              <MDTypography
                variant="button"
                fontWeight="bold"
                sx={{ fontSize: "0.78rem", color: "#344767" }}
              >
                Playback — Session {activeSession + 1}
              </MDTypography>
            </Box>

            <MDBox
              sx={{
                flex: 1,
                minHeight: 460,
                borderRadius: 2,
                overflow: "hidden",
                border: "1px solid #e0e0e0",
                boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
              }}
            >
              <MiniTrackPlayer
                key={`${record.imei}-${activeSession}`}
                imei={record.imei}
                fromDate={session.startTime}
                toDate={session.endTime}
                isPlaying={isPlaying}
              />
            </MDBox>
          </Grid>
        </Grid>
      </DialogContent>
    </Dialog>
  );
};

SessionDetailModal.propTypes = {
  open:    PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  record:  PropTypes.object,
};

// ─── Date Filter Bar ──────────────────────────────────────────────────────────
const DateFilterBar = ({
  startDate, endDate, imei,
  onStartDate, onEndDate, onImei,
  onFetch, isLoading,
  imeiList, imeiLoading,
  onQuickSelect,
}) => {
  const [selectedQuickDate, setSelectedQuickDate] = useState(null);

  const handleQuickDateClick = (value) => {
    setSelectedQuickDate(value);
    onQuickSelect(value);
  };

  return (
    <Box
      display="flex"
      flexDirection="column"
      gap={2.5}
      mb={3}
      sx={{ p: 3, background: "#f8f9ff", borderRadius: 2, border: "1px solid #e8eaf6" }}
    >
      <Box display="flex" flexWrap="wrap" gap={3} alignItems="center">
        <Autocomplete
          options={imeiList}
          loading={imeiLoading}
          getOptionLabel={(option) =>
            option.vehnum ? `${option.vehnum} (${option.imei})` : option.imei
          }
          value={imeiList.find((item) => item.imei === imei) || null}
          onChange={(_, newValue) => onImei(newValue ? newValue.imei : "")}
          renderInput={(params) => (
            <TextField {...params} label="Select Vehicle" size="medium" sx={{ minWidth: 300 }} />
          )}
        />
        <TextField
          label="Start Date" type="date" size="medium" value={startDate}
          onChange={(e) => onStartDate(e.target.value)}
          InputLabelProps={{ shrink: true }}
        />
        <TextField
          label="End Date" type="date" size="medium" value={endDate}
          onChange={(e) => onEndDate(e.target.value)}
          InputLabelProps={{ shrink: true }}
        />
        <MDButton
          variant="gradient" color="info" size="medium"
          onClick={onFetch}
          disabled={isLoading || !imei || !startDate || !endDate}
        >
          {isLoading ? "Fetching…" : "Get Report"}
        </MDButton>
      </Box>

      <Box display="flex" gap={1.5}>
        {[
          { label: "Today",       value: "today"     },
          { label: "Yesterday",   value: "yesterday" },
          { label: "Last 7 Days", value: "last7"     },
        ].map((btn) => (
          <Chip
            key={btn.value}
            label={btn.label}
            size="medium"
            onClick={() => handleQuickDateClick(btn.value)}
            sx={{
              fontSize: "0.85rem",
              height: "36px",
              cursor: "pointer",
              padding: "0 12px",
              backgroundColor: selectedQuickDate === btn.value ? "#1A73E8" : "transparent",
              color: selectedQuickDate === btn.value ? "#fff" : "#1A73E8",
              borderColor: "#1A73E8",
              fontWeight: selectedQuickDate === btn.value ? 700 : 500,
              "&:hover": {
                backgroundColor: selectedQuickDate === btn.value ? "#0D47A1" : "#e3f2fd",
              },
            }}
            variant="outlined"
            color="info"
          />
        ))}
      </Box>
    </Box>
  );
};

DateFilterBar.propTypes = {
  startDate:     PropTypes.string.isRequired,
  endDate:       PropTypes.string.isRequired,
  imei:          PropTypes.string.isRequired,
  onStartDate:   PropTypes.func.isRequired,
  onEndDate:     PropTypes.func.isRequired,
  onImei:        PropTypes.func.isRequired,
  onFetch:       PropTypes.func.isRequired,
  isLoading:     PropTypes.bool.isRequired,
  imeiList:      PropTypes.array.isRequired,
  imeiLoading:   PropTypes.bool.isRequired,
  onQuickSelect: PropTypes.func.isRequired,
};

// ─── Quick date helper ────────────────────────────────────────────────────────
const getQuickDateRange = (type) => {
  const todayStr = new Date().toISOString().slice(0, 10);
  switch (type) {
    case "today":
      return { start: todayStr, end: todayStr };
    case "yesterday": {
      const y = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
      return { start: y, end: y };
    }
    case "last7":
      return {
        start: new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10),
        end: todayStr,
      };
    default:
      return { start: todayStr, end: todayStr };
  }
};

// ─── Main Component ───────────────────────────────────────────────────────────
function HourlyReport({ accountId }) {
  const today     = new Date().toISOString().slice(0, 10);
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);

  const [imei,           setImei]           = useState("");
  const [startDate,      setStartDate]      = useState(yesterday);
  const [endDate,        setEndDate]        = useState(today);
  const [records,        setRecords]        = useState([]);
  const [isLoading,      setIsLoading]      = useState(false);
  const [error,          setError]          = useState(null);
  const [searchTerm,     setSearchTerm]     = useState("");
  const [page,           setPage]           = useState(0);
  const [rowsPerPage,    setRowsPerPage]    = useState(10);
  const [imeiList,       setImeiList]       = useState([]);
  const [imeiLoading,    setImeiLoading]    = useState(false);
  const [modalOpen,      setModalOpen]      = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);

  useEffect(() => {
    const fetchImeis = async () => {
      setImeiLoading(true);
      try {
        const res      = await ApiService.getImeiDropdown(accountId);
        const vehicles = res?.data?.response?.vehicles || [];
        setImeiList(vehicles);
        if (vehicles.length > 0 && !imei) setImei(vehicles[0].imei);
      } catch (err) {
        console.error("Failed to fetch IMEI list:", err);
      } finally {
        setImeiLoading(false);
      }
    };
    fetchImeis();
  }, [accountId]);

  const handleQuickSelect = (type) => {
    const { start, end } = getQuickDateRange(type);
    setStartDate(start);
    setEndDate(end);
  };

  const formatDateForApi = (isoDate) => {
    if (!isoDate) return "";
    const [y, m, d] = isoDate.split("-");
    return `${d}/${m}/${y}`;
  };

  const fetchReport = async () => {
    if (!imei || !startDate || !endDate) return;
    setIsLoading(true);
    setError(null);
    setModalOpen(false);
    setSelectedRecord(null);
    try {
      const payload = {
        imei,
        startDate: formatDateForApi(startDate),
        endDate:   formatDateForApi(endDate),
      };
      const res  = await ApiService.getWorkingHourReport(payload);
      const data = res?.data?.data || [];
      if (!data.length) {
        setError("No data found for the selected filters.");
        setRecords([]);
      } else {
        setRecords(data);
      }
    } catch (err) {
      console.error("Working hour report error:", err);
      setError("Failed to fetch report. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchReport(); }, []);

  const filteredRecords = useMemo(() => {
    if (!searchTerm) return records;
    const term = searchTerm.toLowerCase();
    return records.filter(
      (r) =>
        r.imei?.toLowerCase().includes(term) ||
        r.vehNum?.toLowerCase().includes(term) ||
        r.repDate?.includes(term)
    );
  }, [records, searchTerm]);

  const paginatedRecords = filteredRecords.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const handleRowClick = (record) => {
    setSelectedRecord(record);
    setModalOpen(true);
  };

  return (
    <MDBox pt={6} pb={3} ml={11}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Card>
            {/* Card header */}
            <MDBox
              mx={2} mt={-3} py={3} px={2}
              variant="gradient" bgColor="info"
              borderRadius="lg" coloredShadow="info"
              display="flex" justifyContent="space-between" alignItems="center"
            >
              <MDBox display="flex" alignItems="center" gap={1}>
                <Icon sx={{ color: "#fff", fontSize: 22 }}>directions_car</Icon>
                <MDTypography variant="h6" color="white">Working Hour Report</MDTypography>
              </MDBox>
              <MDTypography variant="caption" color="white" sx={{ opacity: 0.8 }}>
                {records.length} record{records.length !== 1 ? "s" : ""} loaded
              </MDTypography>
            </MDBox>

            <MDBox p={3}>
              <DateFilterBar
                imei={imei}           onImei={setImei}
                startDate={startDate} onStartDate={setStartDate}
                endDate={endDate}     onEndDate={setEndDate}
                onFetch={fetchReport}
                isLoading={isLoading}
                imeiList={imeiList}   imeiLoading={imeiLoading}
                onQuickSelect={handleQuickSelect}
              />

              <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <MDTypography variant="button" color="text" fontWeight="regular">
                  Showing <strong>{filteredRecords.length}</strong> record(s)
                </MDTypography>
                <TextField
                  size="small"
                  placeholder="Search IMEI, vehicle, date…"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start"><Icon>search</Icon></InputAdornment>
                    ),
                  }}
                  sx={{ minWidth: 260 }}
                />
              </MDBox>

              {error && (
                <Box
                  sx={{
                    p: 2, mb: 2,
                    background: "#fff3e0",
                    borderRadius: 2,
                    border: "1px solid #ffe0b2",
                  }}
                >
                  <MDTypography variant="caption" color="warning">{error}</MDTypography>
                </Box>
              )}

              {isLoading && (
                <Box display="flex" justifyContent="center" alignItems="center" py={4}>
                  <CircularProgress size={32} />
                  <MDTypography variant="button" sx={{ ml: 2 }}>Fetching report…</MDTypography>
                </Box>
              )}

              {!isLoading && filteredRecords.length > 0 && (
                <TableContainer
                  sx={{ boxShadow: "none", border: "1px solid #f0f2f5", borderRadius: 2 }}
                >
                  <Table sx={tableSx}>
                    <colgroup>
                      <col style={{ width: COL_WIDTHS.actions       }} />
                      <col style={{ width: COL_WIDTHS.imei          }} />
                      <col style={{ width: COL_WIDTHS.vehNum        }} />
                      <col style={{ width: COL_WIDTHS.date          }} />
                      <col style={{ width: COL_WIDTHS.sessions      }} />
                      <col style={{ width: COL_WIDTHS.totalDist     }} />
                      <col style={{ width: COL_WIDTHS.totalDuration }} />
                      <col style={{ width: COL_WIDTHS.status        }} />
                    </colgroup>

                    <TableHead sx={tableHeadSx}>
                      <TableRow>
                        <TableCell align="center" />
                        <TableCell>IMEI</TableCell>
                        <TableCell>Vehicle No.</TableCell>
                        <TableCell align="center">Date</TableCell>
                        <TableCell align="center">Sessions</TableCell>
                        <TableCell align="center">Total Dist.</TableCell>
                        <TableCell align="center">Total Duration</TableCell>
                        <TableCell align="center">Status</TableCell>
                      </TableRow>
                    </TableHead>

                    <TableBody sx={tableBodySx}>
                      {paginatedRecords.map((record) => (
                        <TableRow
                          key={record.id}
                          className="data-row"
                          onClick={() => handleRowClick(record)}
                          sx={{
                            cursor: "pointer",
                            userSelect: "none",
                            "&:hover": { backgroundColor: "#f5f8ff" },
                          }}
                        >
                          {/* Icon — stopPropagation so clicking the button alone still works */}
                          <TableCell align="center" onClick={(e) => e.stopPropagation()}>
                            <Tooltip title="View Sessions & Map">
                              <IconButton
                                size="small"
                                onClick={() => handleRowClick(record)}
                              >
                                <Icon sx={{ fontSize: 18 }}>open_in_new</Icon>
                              </IconButton>
                            </Tooltip>
                          </TableCell>

                          <TableCell>
                            <MDTypography
                              variant="caption"
                              fontWeight="medium"
                              sx={{ fontFamily: "monospace", fontSize: "0.75rem" }}
                            >
                              {record.imei}
                            </MDTypography>
                          </TableCell>

                          <TableCell>
                            <MDTypography variant="caption" fontWeight="bold" color="info">
                              {record.vehNum || "—"}
                            </MDTypography>
                          </TableCell>

                          <TableCell align="center">
                            <MDTypography variant="caption">
                              {record.repDate ? record.repDate.split("T")[0] : "—"}
                            </MDTypography>
                          </TableCell>

                          <TableCell align="center">
                            <Chip
                              label={`${record.sessions?.length ?? 0} sessions`}
                              size="small"
                              color="primary"
                              variant="outlined"
                              sx={{ fontSize: "0.68rem" }}
                            />
                          </TableCell>

                          <TableCell align="center">
                            <MDTypography variant="caption" fontWeight="bold">
                              {record.totalDistance ?? "0"} km
                            </MDTypography>
                          </TableCell>

                          <TableCell align="center">
                            <MDTypography variant="caption">
                              {formatDuration(record.totalDuration)}
                            </MDTypography>
                          </TableCell>

                          <TableCell align="center">
                            <Chip
                              label={
                                record.sessions?.every((s) => s.status === "COMPLETE")
                                  ? "Complete"
                                  : "Partial"
                              }
                              size="small"
                              color={
                                record.sessions?.every((s) => s.status === "COMPLETE")
                                  ? "success"
                                  : "warning"
                              }
                              sx={{ fontSize: "0.65rem" }}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}

              {!isLoading && filteredRecords.length > 0 && (
                <TablePagination
                  rowsPerPageOptions={[10, 25, 50]}
                  component="div"
                  count={filteredRecords.length}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onPageChange={(_, p) => setPage(p)}
                  onRowsPerPageChange={(e) => {
                    setRowsPerPage(parseInt(e.target.value, 10));
                    setPage(0);
                  }}
                />
              )}
            </MDBox>
          </Card>
        </Grid>
      </Grid>

      {/* ── Session Detail Modal (rendered outside the Card) ── */}
      <SessionDetailModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        record={selectedRecord}
      />
    </MDBox>
  );
}

HourlyReport.propTypes = {
  accountId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
};

export default HourlyReport;
