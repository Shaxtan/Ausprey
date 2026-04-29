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
import LinearProgress from "@mui/material/LinearProgress";

import MDBox from "../../assets/components/MDBox";
import MDTypography from "../../assets/components/MDTypography";
import MDButton from "../../assets/components/MDButton";
import ApiService from "../../services/ApiService";

import MiniTrackPlayer from "./MiniTrackPlayer";
import AccountSummaryCharts from "./AccountSummaryCharts";

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
  const minutes = parseInt(durationStr, 10);
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
};

// Format seconds into h m s
const formatSeconds = (seconds) => {
  if (!seconds || seconds === 0) return "0m";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const COL_WIDTHS = {
  actions: "6%",
  imei: "16%",
  vehNum: "14%",
  date: "12%",
  sessions: "11%",
  totalDist: "11%",
  totalDuration: "13%",
  status: "10%",
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

// ─── Account Summary Dashboard ────────────────────────────────────────────────

const StatCard = ({ icon, label, value, color, subValue }) => (
  <Box
    sx={{
      background: "#fff",
      borderRadius: 2.5,
      border: "1px solid #e8eaf6",
      p: 2.5,
      display: "flex",
      alignItems: "center",
      gap: 2,
      boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
      transition: "box-shadow 0.2s",
      "&:hover": { boxShadow: "0 4px 16px rgba(26,115,232,0.10)" },
    }}
  >
    <Box
      sx={{
        width: 48,
        height: 48,
        borderRadius: 2,
        background: `linear-gradient(135deg, ${color}22 0%, ${color}44 100%)`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      <Icon sx={{ color, fontSize: 24 }}>{icon}</Icon>
    </Box>
    <Box>
      <MDTypography
        variant="caption"
        sx={{
          color: "#7b809a",
          fontSize: "0.68rem",
          textTransform: "uppercase",
          letterSpacing: 0.8,
        }}
      >
        {label}
      </MDTypography>
      <MDTypography
        variant="h6"
        fontWeight="bold"
        sx={{ fontSize: "1.25rem", color: "#344767", lineHeight: 1.2 }}
      >
        {value}
      </MDTypography>
      {subValue && (
        <MDTypography variant="caption" sx={{ color: "#7b809a", fontSize: "0.65rem" }}>
          {subValue}
        </MDTypography>
      )}
    </Box>
  </Box>
);

StatCard.propTypes = {
  icon: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  color: PropTypes.string.isRequired,
  subValue: PropTypes.string,
};

const AccountSummaryDashboard = ({
  accountId,
  selectedAccount,
  accountDevices = [],
  devicesLoading,
}) => {
  const [summaryData, setSummaryData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("totalDistance");
  const [sortDir, setSortDir] = useState("desc");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // This extracts the child accounts from the API response safely
  const childAccounts = summaryData?.childAccounts || [];

  // 1. Flatten the entire tree
  const allNestedAccounts = useMemo(() => {
    return childAccounts.length > 0 ? getAllAccounts(childAccounts) : [];
  }, [childAccounts]);

  useEffect(() => {
    const fetchSummary = async () => {
      setIsLoading(true);
      try {
        const now = new Date();
        const yesterday = new Date(now - 86400000);
        const fmt = (d) => {
          const dd = String(d.getDate()).padStart(2, "0");
          const mm = String(d.getMonth() + 1).padStart(2, "0");
          const yyyy = d.getFullYear();
          return `${dd}/${mm}/${yyyy}`;
        };

        let accid = accountId;
        if (!accid) {
          try {
            const user = JSON.parse(localStorage.getItem("userDetails") || "{}");
            accid = user?.accountId || user?.accid || 1;
          } catch {
            accid = 1;
          }
        }

        const res = await ApiService.postRequest(
          `/reports/account-summary-report?accid=${accid}`,
          { startDate: fmt(yesterday), endDate: fmt(now) },
          true,
          ApiService.getDashboardBase
            ? ApiService.getDashboardBase()
            : process.env.REACT_APP_BASE_URL + "/usage"
        );

        const data = res?.data?.data?.[0] || null;
        setSummaryData(data);
      } catch (err) {
        console.error("Account summary error:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSummary();
  }, [accountId]);

  // 2. Filter out "Folder" accounts that just aggregate data
  const chartData = useMemo(() => {
    return allNestedAccounts.filter((acc) => !acc.childAccounts || acc.childAccounts.length === 0);
  }, [allNestedAccounts]);

  const filteredChildren = useMemo(() => {
    let list = childAccounts.filter(
      (a) =>
        !searchTerm ||
        a.accountName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(a.accountId).includes(searchTerm)
    );
    list = [...list].sort((a, b) => {
      const dir = sortDir === "asc" ? 1 : -1;
      return (a[sortBy] - b[sortBy]) * dir;
    });
    return list;
  }, [childAccounts, searchTerm, sortBy, sortDir]);

  const paginated = filteredChildren.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const handleSort = (col) => {
    if (sortBy === col) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortBy(col);
      setSortDir("desc");
    }
  };

  const SortIcon = ({ col }) => (
    <Icon
      sx={{
        fontSize: "14px !important",
        ml: 0.3,
        opacity: sortBy === col ? 1 : 0.3,
        verticalAlign: "middle",
      }}
    >
      {sortBy === col && sortDir === "asc" ? "arrow_upward" : "arrow_downward"}
    </Icon>
  );
  SortIcon.propTypes = {
    col: PropTypes.string.isRequired,
  };

  const maxDist = Math.max(...childAccounts.map((a) => a.totalDistance || 0), 1);
  const maxTime = Math.max(...childAccounts.map((a) => a.totalRunTime || 0), 1);

  if (isLoading) {
    return (
      <Box sx={{ py: 4, display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
        <CircularProgress size={32} />
        <MDTypography variant="caption" color="text">
          Loading account summary…
        </MDTypography>
      </Box>
    );
  }

  if (!summaryData) return null;

  return (
    <Box sx={{ mb: 4 }}>
      {/* Header */}
      <Box display="flex" alignItems="center" gap={1} mb={2.5}>
        <Icon sx={{ color: "#1A73E8", fontSize: 20 }}>analytics</Icon>
        <MDTypography variant="h6" fontWeight="bold" sx={{ fontSize: "0.95rem", color: "#344767" }}>
          Account Summary Dashboard
        </MDTypography>
        <Chip
          label="Last 24 hrs"
          size="small"
          sx={{
            ml: 1,
            fontSize: "0.62rem",
            fontWeight: 700,
            background: "#e3f0ff",
            color: "#1A73E8",
            height: 20,
          }}
        />
        <MDTypography variant="caption" sx={{ ml: "auto", color: "#7b809a", fontSize: "0.7rem" }}>
          {summaryData.accountName}
        </MDTypography>
      </Box>

      {/* Top KPI Cards */}
      <Grid container spacing={2} mb={3}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon="directions_car"
            label="Total Devices"
            value={summaryData.deviceCount?.toLocaleString()}
            color="#1A73E8"
            subValue={`Across ${childAccounts.length} sub-accounts`}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon="straighten"
            label="Total Distance"
            value={`${(summaryData.totalDistance || 0).toLocaleString()} km`}
            color="#00897b"
            subValue="Combined all accounts"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon="timer"
            label="Total Run Time"
            value={formatSeconds(summaryData.totalRunTime)}
            color="#f57c00"
            subValue="Engine-on duration"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon="account_tree"
            label="Sub-Accounts"
            value={childAccounts.length}
            color="#8e24aa"
            subValue="Child accounts tracked"
          />
        </Grid>
      </Grid>

      <AccountSummaryCharts childAccounts={chartData} />

      {/* Sub-accounts table */}
      <Box
        sx={{
          background: "#fff",
          borderRadius: 2.5,
          border: "1px solid #e8eaf6",
          overflow: "hidden",
          boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
        }}
      >
        <Box
          sx={{
            px: 2.5,
            py: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: "1px solid #f0f2f5",
            flexWrap: "wrap",
            gap: 1.5,
          }}
        >
          <MDTypography
            variant="button"
            fontWeight="bold"
            sx={{ fontSize: "0.8rem", color: "#344767" }}
          >
            Sub-Account Breakdown
            <Chip
              label={filteredChildren.length}
              size="small"
              sx={{ ml: 1, fontSize: "0.62rem", height: 18 }}
            />
          </MDTypography>
          <TextField
            size="small"
            placeholder="Search accounts…"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(0);
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Icon sx={{ fontSize: 16 }}>search</Icon>
                </InputAdornment>
              ),
            }}
            sx={{ minWidth: 220 }}
          />
        </Box>

        <TableContainer>
          <Table sx={{ tableLayout: "fixed", width: "100%" }}>
            <colgroup>
              <col style={{ width: "5%" }} />
              <col style={{ width: "28%" }} />
              <col style={{ width: "12%" }} />
              <col style={{ width: "22%" }} />
              <col style={{ width: "22%" }} />
              <col style={{ width: "11%" }} />
            </colgroup>
            <TableHead sx={tableHeadSx}>
              <TableRow>
                <TableCell align="center">#</TableCell>
                <TableCell>Account Name</TableCell>
                <TableCell
                  align="center"
                  onClick={() => handleSort("deviceCount")}
                  sx={{ cursor: "pointer" }}
                >
                  Devices <SortIcon col="deviceCount" />
                </TableCell>
                <TableCell
                  align="center"
                  onClick={() => handleSort("totalDistance")}
                  sx={{ cursor: "pointer" }}
                >
                  Distance (km) <SortIcon col="totalDistance" />
                </TableCell>
                <TableCell
                  align="center"
                  onClick={() => handleSort("totalRunTime")}
                  sx={{ cursor: "pointer" }}
                >
                  Run Time <SortIcon col="totalRunTime" />
                </TableCell>
                <TableCell align="center">Activity</TableCell>
              </TableRow>
            </TableHead>
            <TableBody sx={tableBodySx}>
              {paginated.map((acc, idx) => {
                const distPct = Math.round(((acc.totalDistance || 0) / maxDist) * 100);
                const timePct = Math.round(((acc.totalRunTime || 0) / maxTime) * 100);
                const isActive = acc.totalDistance > 0 || acc.totalRunTime > 0;
                return (
                  <TableRow key={acc.accountId} sx={{ "&:hover": { background: "#f5f8ff" } }}>
                    <TableCell align="center">
                      <MDTypography variant="caption" sx={{ color: "#aaa", fontSize: "0.68rem" }}>
                        {page * rowsPerPage + idx + 1}
                      </MDTypography>
                    </TableCell>
                    <TableCell>
                      <MDTypography
                        variant="caption"
                        fontWeight="medium"
                        sx={{ fontSize: "0.78rem", color: "#344767" }}
                      >
                        {acc.accountName}
                      </MDTypography>
                      <MDTypography
                        variant="caption"
                        display="block"
                        sx={{ fontSize: "0.62rem", color: "#aaa" }}
                      >
                        ID: {acc.accountId}
                      </MDTypography>
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={acc.deviceCount}
                        size="small"
                        sx={{
                          fontSize: "0.68rem",
                          fontWeight: 700,
                          background: "#e3f0ff",
                          color: "#1A73E8",
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1}>
                        <MDTypography
                          variant="caption"
                          fontWeight="bold"
                          sx={{ fontSize: "0.72rem", minWidth: 48, textAlign: "right" }}
                        >
                          {(acc.totalDistance || 0).toLocaleString()}
                        </MDTypography>
                        <Box sx={{ flex: 1 }}>
                          <LinearProgress
                            variant="determinate"
                            value={distPct}
                            sx={{
                              height: 5,
                              borderRadius: 3,
                              background: "#f0f2f5",
                              "& .MuiLinearProgress-bar": {
                                background: "linear-gradient(90deg,#00897b,#4db6ac)",
                                borderRadius: 3,
                              },
                            }}
                          />
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1}>
                        <MDTypography
                          variant="caption"
                          fontWeight="bold"
                          sx={{ fontSize: "0.72rem", minWidth: 52, textAlign: "right" }}
                        >
                          {formatSeconds(acc.totalRunTime)}
                        </MDTypography>
                        <Box sx={{ flex: 1 }}>
                          <LinearProgress
                            variant="determinate"
                            value={timePct}
                            sx={{
                              height: 5,
                              borderRadius: 3,
                              background: "#f0f2f5",
                              "& .MuiLinearProgress-bar": {
                                background: "linear-gradient(90deg,#f57c00,#ffcc02)",
                                borderRadius: 3,
                              },
                            }}
                          />
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={isActive ? "Active" : "Idle"}
                        size="small"
                        color={isActive ? "success" : "default"}
                        sx={{ fontSize: "0.62rem", fontWeight: 700 }}
                      />
                    </TableCell>
                  </TableRow>
                );
              })}

              {paginated.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    <MDTypography variant="caption" color="text">
                      No accounts match your search.
                    </MDTypography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          rowsPerPageOptions={[10, 25, 50]}
          component="div"
          count={filteredChildren.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(_, p) => setPage(p)}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
        />
      </Box>
      {/* ── NEW: Devices for Selected Account Section ── */}
      {selectedAccount && (
        <Box
          sx={{
            mt: 4,
            background: "#fff",
            borderRadius: 2.5,
            border: "1px solid #e8eaf6",
            overflow: "hidden",
            boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
          }}
        >
          <Box
            sx={{
              px: 2.5,
              py: 2,
              borderBottom: "1px solid #f0f2f5",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <MDTypography
              variant="button"
              fontWeight="bold"
              sx={{ fontSize: "0.8rem", color: "#344767" }}
            >
              Devices assigned to: {selectedAccount.accountName}
              <Chip
                label={accountDevices.length}
                size="small"
                sx={{ ml: 1, fontSize: "0.62rem", height: 18 }}
              />
            </MDTypography>
            {devicesLoading && <CircularProgress size={18} />}
          </Box>

          <TableContainer>
            <Table sx={{ tableLayout: "fixed", width: "100%" }}>
              <TableHead sx={tableHeadSx}>
                <TableRow>
                  <TableCell>Device Name / Number</TableCell>
                  <TableCell>IMEI</TableCell>
                  <TableCell align="center">Sim No.</TableCell>
                  <TableCell align="center">Status</TableCell>
                  <TableCell align="center">Joined Date</TableCell>
                </TableRow>
              </TableHead>
              <TableBody sx={tableBodySx}>
                {accountDevices.map((device) => (
                  <TableRow key={device.imei}>
                    <TableCell>
                      <MDTypography variant="caption" fontWeight="bold" color="info">
                        {device.vehicleNumber || device.name}
                      </MDTypography>
                    </TableCell>
                    <TableCell>
                      <MDTypography variant="caption" sx={{ fontFamily: "monospace" }}>
                        {device.imei}
                      </MDTypography>
                    </TableCell>
                    <TableCell align="center">
                      <MDTypography variant="caption">{device.simNo || "—"}</MDTypography>
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={device.status === "A" ? "Active" : "Inactive"}
                        size="small"
                        color={device.status === "A" ? "success" : "default"}
                        sx={{ fontSize: "0.6rem", height: 20 }}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <MDTypography variant="caption">
                        {device.joiningDate ? device.joiningDate.split("T")[0] : "—"}
                      </MDTypography>
                    </TableCell>
                  </TableRow>
                ))}
                {accountDevices.length === 0 && !devicesLoading && (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                      <MDTypography variant="caption" color="text">
                        No specific devices found for this account.
                      </MDTypography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}
    </Box>
  );
};

AccountSummaryDashboard.propTypes = {
  accountId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  selectedAccount: PropTypes.object,
  accountDevices: PropTypes.array, // Add this
  devicesLoading: PropTypes.bool, // Add this
};

// ─── Session Detail Modal ─────────────────────────────────────────────────────
const SessionDetailModal = ({ open, onClose, record }) => {
  const [activeSession, setActiveSession] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

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
              {record.vehNum || record.imei} &nbsp;·&nbsp; {record.repDate?.split("T")[0] || "—"}
            </MDTypography>
          </Box>
        </Box>
        <IconButton onClick={handleClose} size="small" sx={{ color: "#fff" }}>
          <Icon>close</Icon>
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 0, background: "#f7f9fc" }}>
        <Grid container sx={{ minHeight: 650 }}>
          <Grid
            item
            xs={12}
            md={3.5}
            sx={{
              background: "#fff",
              borderRight: "1px solid #e8eaf6",
              p: 3,
              display: "flex",
              flexDirection: "column",
              gap: 1,
            }}
          >
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

            {[
              {
                label: "Start Time",
                value: formatTimeDisplay(session.startTime),
                icon: "schedule",
              },
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
                  py: 0.75,
                  borderBottom: "0.5px solid #f0f0f0",
                }}
              >
                <Box display="flex" alignItems="center" gap={0.6}>
                  <Icon sx={{ fontSize: 13, color: "#1A73E8" }}>{icon}</Icon>
                  <MDTypography
                    variant="caption"
                    sx={{ color: "#000", fontSize: "0.68rem", opacity: 1 }}
                  >
                    {label}
                  </MDTypography>
                </Box>
                <MDTypography
                  variant="caption"
                  fontWeight="bold"
                  sx={{ fontSize: "0.72rem", color: "#000" }}
                >
                  {value}
                </MDTypography>
              </Box>
            ))}

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

          <Grid
            item
            xs={12}
            md={8.5}
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
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  record: PropTypes.object,
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
  onQuickSelect,
  // NEW: account-related props
  accountList,
  accountLoading,
  selectedAccount,
  onAccountChange,
}) => {
  const [selectedQuickDate, setSelectedQuickDate] = useState(null);

  const handleQuickDateClick = (value) => {
    setSelectedQuickDate(value);
    onQuickSelect(value);
  };

  return (
    <Box
      sx={{ p: 2.5, mb: 3, background: "#f7f7fb", borderRadius: 2, border: "1px solid #e3e7ef" }}
    >
      {/* ── Row 1: Account + Vehicle + Dates + Button ── */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "2fr 2.4fr 1.8fr 1.8fr 1.2fr" },
          gap: 2,
          alignItems: "end",
          width: "100%",
        }}
      >
        {/* Account Dropdown — NEW */}
        <Autocomplete
          fullWidth
          options={accountList}
          loading={accountLoading}
          // This handles the text shown in the box once selected
          getOptionLabel={(option) =>
            option.accountName ? `${option.accountName} (${option.id})` : String(option.id)
          }
          value={selectedAccount}
          onChange={(_, newValue) => onAccountChange(newValue)}
          // This makes the dropdown list show Name on top and ID below
          renderOption={(props, option) => (
            <Box component="li" {...props} sx={{ display: "flex", flexDirection: "column", py: 1 }}>
              <MDTypography
                variant="button"
                fontWeight="bold"
                sx={{ fontSize: "0.8rem", color: "#344767" }}
              >
                {option.accountName}
              </MDTypography>
              <MDTypography variant="caption" sx={{ color: "#7b809a", fontSize: "0.65rem" }}>
                Account ID: {option.id} • Type: {option.type}
              </MDTypography>
            </Box>
          )}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Select Account"
              placeholder="Search by name or ID..."
              size="small"
              fullWidth
              InputProps={{
                ...params.InputProps,
                startAdornment: (
                  <>
                    <InputAdornment position="start">
                      <Icon sx={{ fontSize: 16, color: "#7b809a" }}>account_circle</Icon>
                    </InputAdornment>
                    {params.InputProps.startAdornment}
                  </>
                ),
              }}
            />
          )}
          clearOnEscape
          isOptionEqualToValue={(option, value) => option.id === value?.id}
        />

        {/* Vehicle / IMEI Dropdown */}
        <Autocomplete
          fullWidth
          options={imeiList}
          loading={imeiLoading}
          getOptionLabel={(option) =>
            option.vehnum ? `${option.vehnum} (${option.imei})` : option.imei
          }
          value={imeiList.find((item) => item.imei === imei) || null}
          onChange={(_, newValue) => onImei(newValue ? newValue.imei : "")}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Select Vehicle"
              placeholder="Search Vehicle / IMEI"
              size="small"
              fullWidth
            />
          )}
        />

        <TextField
          fullWidth
          label="Start Date"
          type="date"
          size="small"
          value={startDate}
          onChange={(e) => onStartDate(e.target.value)}
          InputLabelProps={{ shrink: true }}
        />
        <TextField
          fullWidth
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
          onClick={onFetch}
          disabled={isLoading || !imei || !startDate || !endDate}
          sx={{
            height: "40px",
            width: "100%",
            minWidth: 0,
            fontSize: "0.75rem",
            fontWeight: 700,
            whiteSpace: "nowrap",
          }}
        >
          {isLoading ? "FETCHING..." : "GET REPORT"}
        </MDButton>
      </Box>

      {/* ── Row 2: Quick date chips ── */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: 1.5,
          mt: 2,
          flexWrap: "wrap",
          width: "100%",
        }}
      >
        {[
          { label: "TODAY", value: "today" },
          { label: "YESTERDAY", value: "yesterday" },
          { label: "LAST 7 DAYS", value: "last7" },
        ].map((btn) => (
          <Chip
            key={btn.value}
            label={btn.label}
            clickable
            onClick={() => handleQuickDateClick(btn.value)}
            variant="outlined"
            sx={{
              height: "30px",
              px: 1,
              borderRadius: "8px",
              fontSize: "0.72rem",
              fontWeight: 700,
              border: "1px solid #1A73E8",
              backgroundColor: selectedQuickDate === btn.value ? "#1A73E8" : "#fff",
              color: selectedQuickDate === btn.value ? "#fff" : "#1A73E8",
              "&:hover": {
                backgroundColor: selectedQuickDate === btn.value ? "#1565c0" : "#eef5ff",
              },
            }}
          />
        ))}
      </Box>

      {/* ── Selected account indicator ── */}
      {selectedAccount && (
        <Box
          sx={{
            mt: 1.5,
            display: "flex",
            alignItems: "center",
            gap: 1,
            px: 1.5,
            py: 0.75,
            background: "#e3f0ff",
            borderRadius: 1.5,
            border: "1px solid #bbdefb",
            width: "fit-content",
          }}
        >
          <Icon sx={{ fontSize: 14, color: "#1A73E8" }}>info</Icon>
          <MDTypography variant="caption" sx={{ fontSize: "0.68rem", color: "#1A73E8" }}>
            Dashboard will show summary for:{" "}
            <strong>{selectedAccount.accountName || selectedAccount.id}</strong>
          </MDTypography>
          <IconButton
            size="small"
            onClick={() => onAccountChange(null)}
            sx={{ p: 0.2, ml: 0.5, color: "#1A73E8" }}
          >
            <Icon sx={{ fontSize: 14 }}>close</Icon>
          </IconButton>
        </Box>
      )}
    </Box>
  );
};

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
  onQuickSelect: PropTypes.func.isRequired,
  // NEW
  accountList: PropTypes.array.isRequired,
  accountLoading: PropTypes.bool.isRequired,
  selectedAccount: PropTypes.object,
  onAccountChange: PropTypes.func.isRequired,
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

// Helper to extract all accounts from a nested tree
const getAllAccounts = (accounts) => {
  let flatList = [];
  accounts.forEach((acc) => {
    flatList.push(acc);
    if (acc.childAccounts && acc.childAccounts.length > 0) {
      flatList = [...flatList, ...getAllAccounts(acc.childAccounts)];
    }
  });
  return flatList;
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
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [imeiList, setImeiList] = useState([]);
  const [imeiLoading, setImeiLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [reportFetched, setReportFetched] = useState(false);

  // ── NEW: account dropdown state ──────────────────────────────────────────
  const [accountList, setAccountList] = useState([]);
  const [accountLoading, setAccountLoading] = useState(false);
  // The currently selected account object (null = none selected → use default accountId)
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [accountDevices, setAccountDevices] = useState([]); //devices based on selected account
  const [devicesLoading, setDevicesLoading] = useState(false);
  // Resolved account ID used for the summary dashboard
  const resolvedAccountId = selectedAccount?.id ?? accountId;

  // Fetch account list on mount
  useEffect(() => {
    const fetchAccounts = async () => {
      setAccountLoading(true);
      try {
        const res = await ApiService.getAccountDropdown();
        // getAccountDropdown returns filtered (status === "A") accounts
        const accounts = res?.data?.data || [];
        // Normalise: ensure each entry has an `id` field
        // Inside HourlyReport -> fetchAccounts
        const normalised = accounts.map((a) => ({
          ...a,
          id: a.id ?? a.accountId ?? a.accid,
          // Map the API "name" field to the "accountName" property used in your UI
          accountName: a.name || "Unnamed Account",
        }));
        setAccountList(normalised);
      } catch (err) {
        console.error("Failed to fetch account list:", err);
      } finally {
        setAccountLoading(false);
      }
    };
    fetchAccounts();
  }, []);

  // Inside HourlyReport function
  useEffect(() => {
    const fetchImeis = async () => {
      setImeiLoading(true);
      try {
        // Use selectedAccount.id if available, else fallback to the default prop accountId
        const targetId = selectedAccount?.id || accountId;

        const res = await ApiService.getImeiDropdown(targetId);
        const vehicles = res?.data?.response?.vehicles || [];

        setImeiList(vehicles);

        // Reset IMEI selection if the current one isn't in the new list
        if (vehicles.length > 0) {
          // Optional: auto-select first vehicle
          // setImei(vehicles[0].imei);
        } else {
          setImei("");
        }
      } catch (err) {
        console.error("Failed to fetch IMEI list:", err);
      } finally {
        setImeiLoading(false);
      }
    };

    fetchImeis();
  }, [selectedAccount, accountId]); // Triggered whenever the account dropdown changes

  // 2. Effect to fetch and filter devices based on selection
  useEffect(() => {
    const syncDevices = async () => {
      // If no account is selected, clear the list
      if (!selectedAccount) {
        setAccountDevices([]);
        return;
      }

      setDevicesLoading(true);
      try {
        // Calls http://103.178.113.129:8071/devices via ApiService
        const res = await ApiService.getAllDevicesByAccount();
        const allDevices = res?.data?.data || [];

        // Filter: only keep devices where accountId matches selectedAccount.id
        const filtered = allDevices.filter(
          (dev) => Number(dev.accountId) === Number(selectedAccount.id)
        );

        setAccountDevices(filtered);
      } catch (err) {
        console.error("Error syncing devices:", err);
      } finally {
        setDevicesLoading(false);
      }
    };

    syncDevices();
  }, [selectedAccount]);

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
      setReportFetched(true);
    } catch (err) {
      console.error("Working hour report error:", err);
      setError("Failed to fetch report. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

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
              {/* ── Vehicle Report Filter (now includes account dropdown) ── */}
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
                onQuickSelect={handleQuickSelect}
                // NEW account props
                accountList={accountList}
                accountLoading={accountLoading}
                selectedAccount={selectedAccount}
                onAccountChange={setSelectedAccount}
              />

              {/* Only show the table section after a report has been fetched */}
              {(reportFetched || records.length > 0) && (
                <>
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
                      <Table sx={tableSx}>
                        <colgroup>
                          <col style={{ width: COL_WIDTHS.actions }} />
                          <col style={{ width: COL_WIDTHS.imei }} />
                          <col style={{ width: COL_WIDTHS.vehNum }} />
                          <col style={{ width: COL_WIDTHS.date }} />
                          <col style={{ width: COL_WIDTHS.sessions }} />
                          <col style={{ width: COL_WIDTHS.totalDist }} />
                          <col style={{ width: COL_WIDTHS.totalDuration }} />
                          <col style={{ width: COL_WIDTHS.status }} />
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
                              <TableCell align="center" onClick={(e) => e.stopPropagation()}>
                                <Tooltip title="View Sessions & Map">
                                  <IconButton size="small" onClick={() => handleRowClick(record)}>
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
                </>
              )}

              {/* Show error even if no report fetched yet */}
              {error && !reportFetched && (
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

              <Divider sx={{ my: 4, borderStyle: "dashed" }} />

              {/*
               * AccountSummaryDashboard:
               * - If an account is selected in the dropdown → use that account's id
               * - Otherwise → fall back to the prop accountId (original behaviour)
               */}
              <AccountSummaryDashboard
                accountId={resolvedAccountId}
                selectedAccount={selectedAccount}
                accountDevices={accountDevices} // Add this line
                devicesLoading={devicesLoading} // Useful for showing a spinner in the table
              />
            </MDBox>
          </Card>
        </Grid>
      </Grid>

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
