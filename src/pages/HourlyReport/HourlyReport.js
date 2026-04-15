import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
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
import Collapse from "@mui/material/Collapse";
import Box from "@mui/material/Box";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TablePagination from "@mui/material/TablePagination";
import Chip from "@mui/material/Chip";

import MDBox from "../../assets/components/MDBox";
import MDTypography from "../../assets/components/MDTypography";
import MDButton from "../../assets/components/MDButton";
import ApiService from "../../services/ApiService";

// Import the new MiniTrackPlayer component
import MiniTrackPlayer from "./MiniTrackPlayer";

// ─── Helpers ───────────────────────────────────────────────────────────────────

/** Convert ISO String or Epoch → readable date-time */
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

/** Format minutes into "Xh Ym" */
const formatDuration = (durationStr) => {
  if (!durationStr) return "—";
  // If already "HH:mm" format from API, just return it
  if (typeof durationStr === "string" && durationStr.includes(":")) return durationStr;
  const minutes = parseInt(durationStr);
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
};

// ─── Styles ────────────────────────────────────────────────────────────────────
const tableHeadSx = {
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
  },
};

const tableBodySx = {
  "& .MuiTableRow-root:hover": { backgroundColor: "#f5f8ff" },
  "& .MuiTableCell-root": {
    padding: "10px 14px",
    fontSize: "0.82rem",
    borderBottom: "1px solid #f0f2f5",
    verticalAlign: "middle",
  },
};

// ─── Session Detail Panel (expanded row content) ──────────────────────────────
const SessionDetailPanel = ({ record }) => {
  const [activeSession, setActiveSession] = useState(0);
  const session = record.sessions[activeSession];

  return (
    <Box sx={{ m: 2, p: 2, background: "#fff", border: "1px solid #e0e0e0", borderRadius: 2 }}>
      <Grid container spacing={3}>
        {/* Left: session info */}
        <Grid item xs={12} md={4}>
          <MDTypography variant="h6" gutterBottom>
            Session Details
          </MDTypography>

          {/* Session tabs */}
          <Box display="flex" flexWrap="wrap" gap={0.8} mb={2}>
            {record.sessions.map((s, i) => (
              <Chip
                key={i}
                label={`Session ${i + 1}`}
                size="small"
                color={activeSession === i ? "info" : "default"}
                onClick={() => setActiveSession(i)}
                sx={{ cursor: "pointer", fontWeight: activeSession === i ? 700 : 400 }}
              />
            ))}
          </Box>

          {/* Session stats */}
          {[
            { label: "Start Time", value: formatTimeDisplay(session.startTime), icon: "schedule" },
            { label: "End Time", value: formatTimeDisplay(session.endTime), icon: "flag" },
            { label: "Duration", value: formatDuration(session.duration), icon: "timer" },
            { label: "Distance", value: `${session.distance} km`, icon: "straighten" },
            { label: "GPS Distance", value: `${session.gpsDistance} km`, icon: "gps_fixed" },
            { label: "Avg Speed", value: `${session.avgSpeed} km/h`, icon: "speed" },
            { label: "Status", value: session.status, icon: "info" },
          ].map(({ label, value, icon }) => (
            <Box
              key={label}
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                py: 0.6,
                borderBottom: "0.5px solid #f0f0f0",
              }}
            >
              <Box display="flex" alignItems="center" gap={0.5}>
                <Icon sx={{ fontSize: 14, color: "info.main" }}>{icon}</Icon>
                <MDTypography
                  variant="caption"
                  color="text"
                  sx={{ opacity: 0.65, fontSize: "0.7rem" }}
                >
                  {label}
                </MDTypography>
              </Box>
              <MDTypography variant="caption" fontWeight="bold" sx={{ fontSize: "0.75rem" }}>
                {value}
              </MDTypography>
            </Box>
          ))}

          {/* Locations */}
          <Box mt={1.5}>
            <MDTypography
              variant="caption"
              color="text"
              sx={{
                opacity: 0.55,
                fontSize: "0.65rem",
                textTransform: "uppercase",
                letterSpacing: 1,
              }}
            >
              Start Location
            </MDTypography>
            <MDTypography
              variant="caption"
              display="block"
              sx={{ fontSize: "0.7rem", mt: 0.3, lineHeight: 1.4 }}
            >
              {session.startLocation || "—"}
            </MDTypography>
          </Box>
          <Box mt={1}>
            <MDTypography
              variant="caption"
              color="text"
              sx={{
                opacity: 0.55,
                fontSize: "0.65rem",
                textTransform: "uppercase",
                letterSpacing: 1,
              }}
            >
              End Location
            </MDTypography>
            <MDTypography
              variant="caption"
              display="block"
              sx={{ fontSize: "0.7rem", mt: 0.3, lineHeight: 1.4 }}
            >
              {session.endLocation || "—"}
            </MDTypography>
          </Box>
        </Grid>

        {/* Right: The Advanced MiniTrackPlayer */}
        <Grid item xs={12} md={8}>
          <MDTypography variant="h6" gutterBottom>
            Playback — Session {activeSession + 1}
          </MDTypography>
          <MDBox
            sx={{ height: 400, borderRadius: 2, overflow: "hidden", border: "1px solid #e0e0e0" }}
          >
            <MiniTrackPlayer
              key={`${record.imei}-${activeSession}`} // Forces component reset on session change
              imei={record.imei}
              fromDate={session.startTime}
              toDate={session.endTime}
            />
          </MDBox>
        </Grid>
      </Grid>
    </Box>
  );
};

SessionDetailPanel.propTypes = {
  record: PropTypes.object.isRequired,
};

// ─── Date Filter Bar ──────────────────────────────────────────────────────────
const DateFilterBar = ({
  startDate,
  endDate,
  imei,
  onStartDate,
  onEndDate,
  onImei,
  onFetch,
  isLoading,
  imeiList,
  imeiLoading,
}) => (
  <Box
    display="flex"
    flexWrap="wrap"
    gap={2}
    alignItems="center"
    mb={2.5}
    sx={{ p: 2, background: "#f8f9ff", borderRadius: 2, border: "1px solid #e8eaf6" }}
  >
    <Autocomplete
      options={imeiList}
      loading={imeiLoading}
      getOptionLabel={(option) =>
        option.vehnum ? `${option.vehnum} (${option.imei})` : option.imei
      }
      value={imeiList.find((item) => item.imei === imei) || null}
      onChange={(event, newValue) => {
        onImei(newValue ? newValue.imei : "");
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          label="Select Vehicle/IMEI"
          size="small"
          sx={{ minWidth: 250 }}
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {imeiLoading ? <CircularProgress color="inherit" size={20} /> : null}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
    />
    <TextField
      label="Start Date"
      type="date"
      size="small"
      value={startDate}
      onChange={(e) => onStartDate(e.target.value)}
      InputLabelProps={{ shrink: true }}
    />
    <TextField
      label="End Date"
      type="date"
      size="small"
      value={endDate}
      onChange={(e) => onEndDate(e.target.value)}
      InputLabelProps={{ shrink: true }}
    />
    <MDButton
      variant="gradient"
      color="info"
      size="small"
      onClick={onFetch}
      disabled={isLoading || !imei || !startDate || !endDate}
      startIcon={isLoading ? <CircularProgress size={14} color="inherit" /> : <Icon>search</Icon>}
    >
      {isLoading ? "Fetching…" : "Get Report"}
    </MDButton>
  </Box>
);

DateFilterBar.propTypes = {
  startDate: PropTypes.string.isRequired,
  endDate: PropTypes.string.isRequired,
  imei: PropTypes.string.isRequired,
  onStartDate: PropTypes.func.isRequired,
  onEndDate: PropTypes.func.isRequired,
  onImei: PropTypes.func.isRequired,
  onFetch: PropTypes.func.isRequired,
  isLoading: PropTypes.bool.isRequired,
  imeiList: PropTypes.array.isRequired,
  imeiLoading: PropTypes.bool.isRequired,
};

// ─── Main Component ───────────────────────────────────────────────────────────
function HourlyReport({ accountId }) {
  const today = new Date().toISOString().slice(0, 10);
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);

  const [imei, setImei] = useState("");
  const [startDate, setStartDate] = useState(yesterday);
  const [endDate, setEndDate] = useState(today);

  const [records, setRecords] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [expandedId, setExpandedId] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [imeiList, setImeiList] = useState([]);
  const [imeiLoading, setImeiLoading] = useState(false);

  useEffect(() => {
    const fetchImeis = async () => {
      setImeiLoading(true);
      try {
        const res = await ApiService.getImeiDropdown(accountId);
        const vehicles = res?.data?.response?.vehicles || [];
        setImeiList(vehicles);
        if (vehicles.length > 0 && !imei) {
          setImei(vehicles[0].imei);
        }
      } catch (err) {
        console.error("Failed to fetch IMEI list:", err);
      } finally {
        setImeiLoading(false);
      }
    };
    fetchImeis();
  }, [accountId]);

  const formatDateForApi = (isoDate) => {
    if (!isoDate) return "";
    const [y, m, d] = isoDate.split("-");
    return `${d}/${m}/${y}`;
  };

  const fetchReport = async () => {
    if (!imei || !startDate || !endDate) return;
    setIsLoading(true);
    setError(null);
    setExpandedId(null);

    try {
      const payload = {
        imei,
        startDate: formatDateForApi(startDate),
        endDate: formatDateForApi(endDate),
      };

      const res = await ApiService.getWorkingHourReport(payload);
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

  useEffect(() => {
    fetchReport();
  }, []);

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

  return (
    <MDBox pt={6} pb={3} ml={11}>
      <Grid container spacing={3}>
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
              <MDBox display="flex" alignItems="center" gap={1}>
                <Icon sx={{ color: "#fff", fontSize: 22 }}>directions_car</Icon>
                <MDTypography variant="h6" color="white">
                  Working Hour Report
                </MDTypography>
              </MDBox>
              <MDTypography variant="caption" color="white" sx={{ opacity: 0.8 }}>
                {records.length} record{records.length !== 1 ? "s" : ""} loaded
              </MDTypography>
            </MDBox>

            <MDBox p={3}>
              <DateFilterBar
                imei={imei}
                onImei={setImei}
                startDate={startDate}
                onStartDate={setStartDate}
                endDate={endDate}
                onEndDate={setEndDate}
                onFetch={fetchReport}
                isLoading={isLoading}
                imeiList={imeiList}
                imeiLoading={imeiLoading}
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
                      <InputAdornment position="start">
                        <Icon>search</Icon>
                      </InputAdornment>
                    ),
                  }}
                  sx={{ minWidth: 260 }}
                />
              </MDBox>

              {error && (
                <Box
                  sx={{
                    p: 2,
                    mb: 2,
                    background: "#fff3e0",
                    borderRadius: 2,
                    border: "1px solid #ffe0b2",
                  }}
                >
                  <MDTypography variant="caption" color="warning">
                    {error}
                  </MDTypography>
                </Box>
              )}

              {isLoading && (
                <Box display="flex" justifyContent="center" alignItems="center" py={4}>
                  <CircularProgress size={32} />
                  <MDTypography variant="button" sx={{ ml: 2 }}>
                    Fetching report…
                  </MDTypography>
                </Box>
              )}

              {!isLoading && filteredRecords.length > 0 && (
                <TableContainer
                  sx={{ boxShadow: "none", border: "1px solid #f0f2f5", borderRadius: 2 }}
                >
                  <Table sx={{ tableLayout: "fixed", width: "100%" }}>
                    <colgroup>
                      <col style={{ width: "10%" }} />
                      <col style={{ width: "14%" }} />
                      <col style={{ width: "14%" }} />
                      <col style={{ width: "12%" }} />
                      <col style={{ width: "11%" }} />
                      <col style={{ width: "11%" }} />
                      <col style={{ width: "11%" }} />
                      <col style={{ width: "8%" }} />
                    </colgroup>
                    <TableHead sx={tableHeadSx}>
                      <TableRow>
                        <TableCell align="center">Actions</TableCell>
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
                      {paginatedRecords.map((record) => {
                        const isExpanded = expandedId === record.id;
                        return (
                          <React.Fragment key={record.id}>
                            <TableRow
                              sx={{
                                "& > *": { borderBottom: "unset" },
                                backgroundColor: isExpanded ? "#f1f8ff" : "inherit",
                              }}
                            >
                              <TableCell align="center">
                                <Tooltip title={isExpanded ? "Collapse" : "View Sessions & Map"}>
                                  <IconButton
                                    size="small"
                                    onClick={() =>
                                      setExpandedId((prev) =>
                                        prev === record.id ? null : record.id
                                      )
                                    }
                                    color={isExpanded ? "info" : "default"}
                                  >
                                    <Icon>{isExpanded ? "expand_less" : "expand_more"}</Icon>
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
                            <TableRow>
                              <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={8}>
                                <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                                  <SessionDetailPanel record={record} />
                                </Collapse>
                              </TableCell>
                            </TableRow>
                          </React.Fragment>
                        );
                      })}
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
    </MDBox>
  );
}

HourlyReport.propTypes = {
  accountId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
};

export default HourlyReport;
