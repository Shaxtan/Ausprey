import React, { useState, useEffect, useMemo, useCallback } from "react";
import PropTypes from "prop-types";
import ApiService from "../../../../services/ApiService";

// @mui material components
import Card from "@mui/material/Card";
import Icon from "@mui/material/Icon";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import CircularProgress from "@mui/material/CircularProgress";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import Checkbox from "@mui/material/Checkbox";

// Material Dashboard 2 React components
import MDBox from "../../../../assets/components/MDBox";
import MDTypography from "../../../../assets/components/MDTypography";
import MDButton from "../../../../assets/components/MDButton";

// Material Dashboard 2 React examples
import DataTable from "../../../../assets/components/examples/Tables/DataTable";

// =====================================================================================
// HELPER COMPONENTS (WITH FULL PROPTYPES — ESLINT CLEAN)
// =====================================================================================

const DataCell = ({ text, color = "text", fontWeight = "medium" }) => (
  <MDTypography variant="caption" color={color} fontWeight={fontWeight}>
    {text}
  </MDTypography>
);
DataCell.propTypes = {
  text: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  color: PropTypes.string,
  fontWeight: PropTypes.string,
};

const Status = ({ status }) => {
  const color = status === "Active" ? "success" : status === "Inactive" ? "error" : "warning";
  return (
    <MDBox lineHeight={1}>
      <MDTypography variant="caption" color={color} fontWeight="bold">
        {status}
      </MDTypography>
    </MDBox>
  );
};
Status.propTypes = { status: PropTypes.string.isRequired };

const Ignition = ({ status }) => {
  const ignitionStatus = status > 0 ? "On" : "Off";
  const color = ignitionStatus === "On" ? "success" : "error";
  return (
    <MDTypography variant="caption" color={color} fontWeight="bold">
      {ignitionStatus}
    </MDTypography>
  );
};
Ignition.propTypes = { status: PropTypes.number.isRequired };

const LockUnlock = ({ isLocked, deviceStatus }) => {
  let iconName, color, tooltipText;

  switch (deviceStatus) {
    case "ROPE_CUT":
      iconName = "gpp_bad";
      color = "error";
      tooltipText = "**Device Alert: Rope Cut Detected**";
      break;
    case "CASE_TAMPER":
      iconName = "lock_person";
      color = "warning";
      tooltipText = "**Device Alert: Case Tamper / String Tamper**";
      break;
    case "ROPE_INSERT":
      iconName = "lock_reset";
      color = "info";
      tooltipText = "**Device Status: Rope Inserted / Pending Lock**";
      break;
    default:
      iconName = isLocked ? "lock" : "lock_open";
      color = isLocked ? "error" : "success";
      tooltipText = isLocked
        ? "**Trip Status: Locked (Ready to Unlock)**"
        : "**Trip Status: Unlocked**";
      break;
  }

  return (
    <MDBox display="flex" justifyContent="center">
      <Tooltip
        title={
          <MDTypography variant="caption" color="light" fontWeight="bold">
            {tooltipText}
          </MDTypography>
        }
      >
        <IconButton size="small" color={color}>
          <Icon fontSize="medium">{iconName}</Icon>
        </IconButton>
      </Tooltip>
    </MDBox>
  );
};
LockUnlock.propTypes = {
  isLocked: PropTypes.bool.isRequired,
  deviceStatus: PropTypes.string,
};

// =====================================================================================
// TABLE COLUMNS — NOW WITH "Acc Name"
// =====================================================================================

const tableColumns = [
  { Header: "No", accessor: "no", width: "5%", align: "left" },
  { Header: "Acc Name", accessor: "accountName", width: "12%", align: "left" }, // ← NEW COLUMN
  { Header: "VEHICLE NO.", accessor: "vehicleNo", width: "10%", align: "left" },
  { Header: "IMEI", accessor: "imei", width: "12%", align: "center" },
  { Header: "DATE/TIME", accessor: "date", width: "12%", align: "center" },
  { Header: "ADDRESS", accessor: "address", width: "20%", align: "left" },
  { Header: "LATITUDE", accessor: "latitude", width: "10%", align: "center" },
  { Header: "LONGITUDE", accessor: "longitude", width: "10%", align: "center" },
  { Header: "GPS STATUS", accessor: "gpsStatus", width: "8%", align: "center" },
  { Header: "IGNITION", accessor: "ignitionStatus", width: "8%", align: "center" },
  { Header: "LOAD SENSOR", accessor: "avgSpeed", width: "7%", align: "center" },
  { Header: "CURRENT SPEED", accessor: "currentSpeed", width: "8%", align: "center" },
  // { Header: "LOCK STATUS", accessor: "lockUnlock", width: "8%", align: "center" },
  // { Header: "UNLOCK", accessor: "checkbox", width: "5%", align: "center" },
];

// =====================================================================================
// MAIN COMPONENT (SAME DESIGN, UPDATED DATA LOGIC)
// =====================================================================================

function Projects() {
  const [menu, setMenu] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [allRows, setAllRows] = useState([]);
  const [selectedRows, setSelectedRows] = useState({});
  const [tripFilterType, setTripFilterType] = useState("bts-elock");
  const [activeTripTab, setActiveTripTab] = useState("trip1");

  const openMenu = ({ currentTarget }) => setMenu(currentTarget);
  const closeMenu = () => setMenu(null);

  const handleBulkUnlock = () => {
    closeMenu();
    const imeiToUnlock = Object.keys(selectedRows).filter((imei) => selectedRows[imei]);
    if (imeiToUnlock.length > 0) {
      alert(`UNLOCK command sent for ${imeiToUnlock.length} trip(s).`);
      setSelectedRows({});
    } else {
      alert("No trips selected.");
    }
  };

  const handleToggleSelect = useCallback((imei) => {
    setSelectedRows((prev) => ({ ...prev, [imei]: !prev[imei] }));
  }, []);

  // FETCH FROM NEW API: res.data.data.data.VTS.available
  useEffect(() => {
    setLoading(true);
    ApiService.getDashboardData(
      {},
      (res) => {
        if (res?.data?.resultCode === 1 && res?.data?.data?.data?.VTS?.available) {
          const devices = res.data.data.data.VTS.available;

          const fetchedRows = devices.map((item, index) => {
            const gpsDisplay = item.gps === "A" ? "Active" : "Inactive";
            const imei = item.imei || "N/A";
            const speed = Number(item.speed) || 0;
            const isLocked = speed === 0 && item.ign === "Y";

            return {
              no: (
                <MDBox display="flex" alignItems="center" gap={0.5}>
                  <Icon fontSize="small" color={item.ign === "Y" ? "success" : "error"}>
                    {item.ign === "Y" ? "online_prediction" : "offline_bolt"}
                  </Icon>
                  <MDTypography
                    variant="caption"
                    fontWeight="bold"
                    color={item.ign === "Y" ? "success" : "error"}
                  >
                    {index + 1}
                  </MDTypography>
                </MDBox>
              ),
              accountName: <DataCell text={item.accountName || "N/A"} fontWeight="medium" />, // ← NEW
              vehicleNo: <DataCell text={item.vehnum || item.name || "N/A"} fontWeight="bold" />,
              gpsStatus: <Status status={gpsDisplay} />,
              ignitionStatus: <Ignition status={item.ign === "Y" ? 1 : 0} />,
              imei: <DataCell text={imei} />,
              date: <DataCell text={item.devTs || item.cts || "N/A"} />,
              latitude: <DataCell text={item.lat ? `${item.lat.toFixed(6)}°` : "N/A"} />,
              longitude: <DataCell text={item.lng ? `${item.lng.toFixed(6)}°` : "N/A"} />,
              address: (
                <DataCell
                  text={
                    item.address && item.address !== "NA" ? item.address : "Location Not Available"
                  }
                />
              ),
              avgSpeed: <DataCell text={item.avg !== null && item.avg !== 0 ? item.avg : "N/A"} />,
              currentSpeed: (
                <DataCell
                  text={`${speed} km/h`}
                  color={speed > 0 ? "success" : "text"}
                  fontWeight="bold"
                />
              ),
              lockUnlock: <LockUnlock isLocked={isLocked} deviceStatus={null} />,
              checkbox: null,
              _imei: imei,
              _isLockedInitial: isLocked,
            };
          });

          setAllRows(fetchedRows);
          setSelectedRows({});
        }
        setLoading(false);
      },
      true,
      1
    );
  }, []);

  const filteredRows = useMemo(() => {
    return allRows
      .map((row) => {
        const imei = row._imei;
        const checkboxComponent = row._isLockedInitial ? (
          <MDBox display="flex" justifyContent="center">
            <Checkbox
              checked={!!selectedRows[imei]}
              onChange={() => handleToggleSelect(imei)}
              color="info"
            />
          </MDBox>
        ) : (
          <MDTypography variant="caption" color="text">
            -
          </MDTypography>
        );

        return { ...row, checkbox: checkboxComponent };
      })
      .filter((row) => {
        if (!searchTerm) return true;
        const term = searchTerm.toLowerCase();
        const fields = [
          row.accountName?.props?.text, // ← Now searchable
          row.vehicleNo?.props?.text,
          row._imei,
          row.address?.props?.text,
        ].filter(Boolean);
        return fields.some((f) => String(f).toLowerCase().includes(term));
      });
  }, [allRows, searchTerm, selectedRows, handleToggleSelect]);

  if (loading) {
    return (
      <Card>
        <MDBox p={3} display="flex" justifyContent="center" alignItems="center" minHeight="200px">
          <CircularProgress color="info" size={30} />
          <MDTypography variant="h6" ml={2}>
            Fetching Live Trip Data...
          </MDTypography>
        </MDBox>
      </Card>
    );
  }

  return (
    <Card>
      {/* EXACT SAME HEADER & DESIGN */}
      <MDBox position="relative" px={3} pt={3} pb={1}>
        <MDBox
          display="inline-flex"
          sx={(theme) => ({
            position: "absolute",
            top: -18,
            left: 24,
            backgroundColor: theme.palette.background.paper,
            borderRadius: "16px",
            boxShadow: theme.shadows[3],
            overflow: "hidden",
          })}
        >
          <MDButton
            variant={tripFilterType === "bts-elock" ? "contained" : "text"}
            color={tripFilterType === "bts-elock" ? "info" : "dark"}
            size="small"
            onClick={() => setTripFilterType("bts-elock")}
            sx={{ borderRadius: 0, px: 2, py: 1, minWidth: "110px", boxShadow: "none" }}
          >
            VTS
          </MDButton>

          <MDButton
            variant={tripFilterType === "unreachable" ? "contained" : "text"}
            color={tripFilterType === "unreachable" ? "warning" : "dark"}
            size="small"
            onClick={() => setTripFilterType("unreachable")}
            sx={{ borderRadius: 0, px: 2, py: 1, minWidth: "130px", boxShadow: "none" }}
          >
            UNREACHABLE
          </MDButton>
          {/* 
          <MDButton
            variant={activeTripTab === "trip1" ? "contained" : "text"}
            color="dark"
            size="small"
            onClick={() => setActiveTripTab("trip1")}
            sx={(theme) => ({
              borderRadius: 0,
              px: 2,
              py: 1,
              minWidth: "90px",
              boxShadow: "none",
              bgcolor: activeTripTab === "trip1" ? theme.palette.info.main : "transparent",
              "&:hover": {
                bgcolor:
                  activeTripTab === "trip1" ? theme.palette.info.dark : theme.palette.action.hover,
              },
            })}
          >
            Trip 1
          </MDButton>

          <MDButton
            variant={activeTripTab === "trip2" ? "contained" : "text"}
            color="dark"
            size="small"
            onClick={() => setActiveTripTab("trip2")}
            sx={(theme) => ({
              borderRadius: 0,
              px: 2,
              py: 1,
              minWidth: "90px",
              boxShadow: "none",
              bgcolor: activeTripTab === "trip2" ? theme.palette.success.main : "transparent",
              "&:hover": {
                bgcolor:
                  activeTripTab === "trip2"
                    ? theme.palette.success.dark
                    : theme.palette.action.hover,
              },
            })}
          >
            Trip 2
          </MDButton>

          <MDButton
            variant={activeTripTab === "trip3" ? "contained" : "text"}
            color="dark"
            size="small"
            onClick={() => setActiveTripTab("trip3")}
            sx={(theme) => ({
              borderRadius: 0,
              px: 2,
              py: 1,
              minWidth: "90px",
              boxShadow: "none",
              bgcolor: activeTripTab === "trip3" ? theme.palette.secondary.main : "transparent",
              "&:hover": {
                bgcolor:
                  activeTripTab === "trip3"
                    ? theme.palette.secondary.dark
                    : theme.palette.action.hover,
              },
            })}
          >
            Trip 3
          </MDButton> */}
        </MDBox>

        <MDBox display="flex" justifyContent="space-between" alignItems="center" mt={1.5}>
          <MDBox display="flex" alignItems="center" width="100%">
            <MDBox mr={3}>
              <MDTypography variant="h6">
                Trip Report Table
                <MDTypography variant="button" color="text" ml={1}>
                  (<strong>{filteredRows.length}</strong> trips displayed)
                </MDTypography>
              </MDTypography>
            </MDBox>

            <MDBox ml="auto" mr={2} width="40%">
              <TextField
                fullWidth
                size="small"
                variant="outlined"
                placeholder="Search by Vehicle, IMEI, Address..."
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
            </MDBox>

            <MDBox>
              <Icon sx={{ cursor: "pointer" }} fontSize="small" onClick={openMenu}>
                more_vert
              </Icon>
            </MDBox>
          </MDBox>

          <Menu anchorEl={menu} open={Boolean(menu)} onClose={closeMenu}>
            <MenuItem onClick={handleBulkUnlock}>Bulk Unlock</MenuItem>
            <MenuItem onClick={closeMenu}>Refresh</MenuItem>
            <MenuItem onClick={closeMenu}>Export</MenuItem>
          </Menu>
        </MDBox>
      </MDBox>

      <MDBox p={3} mb={0} mt={0} />

      <MDBox>
        <DataTable
          table={{ columns: tableColumns, rows: filteredRows }}
          isSorted={false}
          entriesPerPage={false}
        />
      </MDBox>
    </Card>
  );
}

export default Projects;
