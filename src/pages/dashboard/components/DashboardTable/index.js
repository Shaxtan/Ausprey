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
  // Use 'warning' color for the new 'Unreachable' status
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
// TABLE COLUMNS — Define columns for both tabs
// =====================================================================================

const VTS_COLUMNS = [
  { Header: "No", accessor: "no", width: "5%", align: "left" },
  { Header: "Acc Name", accessor: "accountName", width: "12%", align: "left" },
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

const UNREACHABLE_COLUMNS = [
  { Header: "No", accessor: "no", width: "5%", align: "left" },
  { Header: "Acc ID", accessor: "accountId", width: "10%", align: "left" },
  { Header: "VEHICLE NO.", accessor: "vehicleNo", width: "20%", align: "left" },
  { Header: "IMEI", accessor: "imei", width: "25%", align: "center" },
  { Header: "STATUS", accessor: "unreachableStatus", width: "20%", align: "center" },
];

// =====================================================================================
// MAIN COMPONENT (SAME DESIGN, UPDATED DATA LOGIC)
// =====================================================================================

function Projects({ accountId }) {
  const [menu, setMenu] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [allVtsRows, setAllVtsRows] = useState([]); // Renamed from allRows
  const [unreachableRows, setUnreachableRows] = useState([]); // State for unreachable data
  const [selectedRows, setSelectedRows] = useState({});
  const [tripFilterType, setTripFilterType] = useState("vts"); // 'vts' or 'unreachable'
  // const [activeTripTab, setActiveTripTab] = useState("trip1");

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

  // -----------------------------------------------------------------------------------
  // 3. Data Fetching Functions
  // -----------------------------------------------------------------------------------

  // Fetch VTS Data (Dashboard API)
  const fetchVtsData = useCallback(
    (currentAccountId) => {
      setLoading(true);
      ApiService.getDashboardData(
        { accid: currentAccountId }, // <<< PASSED ACCOUNT ID HERE
        (res) => {
          if (res?.data?.resultCode === 1 && res?.data?.data?.data?.VTS?.available) {
            const devices = res.data.data.data.VTS.available;

            const fetchedRows = devices.map((item, index) => {
              const gpsDisplay = item.gps === "A" ? "Active" : "Inactive";
              const imei = item.imei || "N/A";
              const speed = Number(item.speed) || 0; // Lock logic: speed == 0 (stopped) AND ignition == 'Y'
              const isLocked = speed === 0 && item.ign === "Y";

              return {
                no: (
                  <MDBox display="flex" alignItems="center" gap={0.5}>
                                       {" "}
                    <Icon fontSize="small" color={item.ign === "Y" ? "success" : "error"}>
                                           {" "}
                      {item.ign === "Y" ? "online_prediction" : "offline_bolt"}                   {" "}
                    </Icon>
                                       {" "}
                    <MDTypography
                      variant="caption"
                      fontWeight="bold"
                      color={item.ign === "Y" ? "success" : "error"}
                    >
                                            {index + 1}                   {" "}
                    </MDTypography>
                                     {" "}
                  </MDBox>
                ),
                accountName: <DataCell text={item.accountName || "N/A"} fontWeight="medium" />,
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
                      item.address && item.address !== "NA"
                        ? item.address
                        : "Location Not Available"
                    }
                  />
                ),
                avgSpeed: (
                  <DataCell text={item.avg !== null && item.avg !== 0 ? item.avg : "N/A"} />
                ),
                currentSpeed: (
                  <DataCell
                    text={`${speed} km/h`}
                    color={speed > 0 ? "success" : "text"}
                    fontWeight="bold"
                  />
                ),
                lockUnlock: <LockUnlock isLocked={isLocked} deviceStatus={null} />,
                checkbox: null, // Placeholder to be filled in useMemo
                _imei: imei,
                _isLockedInitial: isLocked,
              };
            });

            setAllVtsRows(fetchedRows);
            setSelectedRows({});
          } else {
            setAllVtsRows([]);
          }
          setLoading(false);
        },
        true,
        1
      );
    },
    [] // Dependencies are empty, as currentAccountId is passed as an argument
  );

  // Fetch Unreachable Devices Data (New API)
  const fetchUnreachableData = useCallback((currentAccountId) => {
    setLoading(true);
    ApiService.getUnreachableDevices(
      { accid: currentAccountId }, // <<< PASSED ACCOUNT ID HERE
      (res) => {
        // 💡 FIX APPLIED HERE: Access data at res.data.data (assuming ApiService fix)
        // If ApiService was NOT fixed, the old path was res?.data?.data?.data
        const unreachableDevices = res?.data?.data || []; // Use || [] to ensure it's an array

        if (res?.data?.resultCode === 1 && Array.isArray(unreachableDevices)) {
          const fetchedRows = unreachableDevices.map((item, index) => ({
            no: <DataCell text={index + 1} fontWeight="bold" />,
            accountId: <DataCell text={item.accid || "N/A"} fontWeight="medium" />,
            vehicleNo: <DataCell text={item.vehnum || "N/A"} fontWeight="bold" />,
            imei: <DataCell text={item.imei || "N/A"} />,
            unreachableStatus: <Status status="Unreachable" />,
          }));
          setUnreachableRows(fetchedRows);
        } else {
          console.warn("Unreachable data structure invalid or resultCode not 1:", res);
          setUnreachableRows([]);
        }
        setLoading(false);
      }
    );
  }, []);

  // -----------------------------------------------------------------------------------
  // 4. Conditional Data Loading
  // -----------------------------------------------------------------------------------

  useEffect(() => {
    if (tripFilterType === "vts") {
      fetchVtsData(accountId);
    } else if (tripFilterType === "unreachable") {
      fetchUnreachableData(accountId);
    }
  }, [tripFilterType, accountId, fetchVtsData, fetchUnreachableData]);

  // -----------------------------------------------------------------------------------
  // 5. Conditional Data Filtering & Column Selection
  // -----------------------------------------------------------------------------------

  // Select the current dataset and columns
  const currentRows = tripFilterType === "vts" ? allVtsRows : unreachableRows;
  const currentColumns = tripFilterType === "vts" ? VTS_COLUMNS : UNREACHABLE_COLUMNS;

  const filteredRows = useMemo(() => {
    // --------------------------------- VTS Filter Logic ---------------------------------
    if (tripFilterType === "vts") {
      return currentRows
        .map((row) => {
          // Add Checkbox and Lock/Unlock columns back to the VTS table data
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

          // VTS requires two extra columns: lockUnlock and checkbox, which must be mapped here.
          return {
            ...row,
            lockUnlock: row.lockUnlock,
            checkbox: checkboxComponent,
          };
        })
        .filter((row) => {
          // VTS Search Logic
          if (!searchTerm) return true;
          const term = searchTerm.toLowerCase();
          const fields = [
            row.accountName?.props?.text,
            row.vehicleNo?.props?.text,
            row._imei,
            row.address?.props?.text,
          ].filter(Boolean);
          return fields.some((f) => String(f).toLowerCase().includes(term));
        });
    }

    // ---------------------------- Unreachable Filter Logic ----------------------------
    if (tripFilterType === "unreachable") {
      return currentRows.filter((row) => {
        // Unreachable Search Logic
        if (!searchTerm) return true;
        const term = searchTerm.toLowerCase();
        const fields = [
          row.accountId?.props?.text,
          row.vehicleNo?.props?.text,
          row.imei?.props?.text,
        ].filter(Boolean);
        return fields.some((f) => String(f).toLowerCase().includes(term));
      });
    }

    return [];
  }, [
    currentRows, // Now depends on whichever array is active (allVtsRows or unreachableRows)
    searchTerm,
    selectedRows,
    handleToggleSelect,
    tripFilterType,
  ]);

  if (loading) {
    return (
      <Card>
        <MDBox p={3} display="flex" justifyContent="center" alignItems="center" minHeight="200px">
          <CircularProgress color="info" size={30} />
          <MDTypography variant="h6" ml={2}>
            {/* Dynamic loading text */}
            {tripFilterType === "vts"
              ? "Fetching Live Trip Data..."
              : "Fetching Unreachable Devices..."}
          </MDTypography>
        </MDBox>
      </Card>
    );
  }

  return (
    <Card>
      {/* --------------------------------- HEADER (TABS) --------------------------------- */}
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
          {/* VTS Tab */}
          <MDButton
            variant={tripFilterType === "vts" ? "contained" : "text"}
            color={tripFilterType === "vts" ? "info" : "dark"}
            size="small"
            onClick={() => setTripFilterType("vts")}
            sx={{ borderRadius: 0, px: 2, py: 1, minWidth: "110px", boxShadow: "none" }}
          >
            VTS
          </MDButton>

          {/* UNREACHABLE Tab */}
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
                {/* Dynamic Title */}
                {tripFilterType === "vts" ? "Live Trip Report Table" : "Unreachable Devices"}
                <MDTypography variant="button" color="text" ml={1}>
                  (<strong>{filteredRows.length}</strong>{" "}
                  {tripFilterType === "vts" ? "trips" : "devices"} displayed)
                </MDTypography>
              </MDTypography>
            </MDBox>

            <MDBox ml="auto" mr={2} width="40%">
              <TextField
                fullWidth
                size="small"
                variant="outlined"
                placeholder={`Search by ${
                  tripFilterType === "vts"
                    ? "Vehicle, IMEI, Address..."
                    : "Vehicle, IMEI, Acc ID..."
                }`}
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
            {/* Bulk Unlock only appears on the VTS tab */}
            {tripFilterType === "vts" && (
              <MenuItem onClick={handleBulkUnlock}>Bulk Unlock</MenuItem>
            )}
            <MenuItem onClick={closeMenu}>Refresh</MenuItem>
            <MenuItem onClick={closeMenu}>Export</MenuItem>
          </Menu>
        </MDBox>
      </MDBox>

      <MDBox p={3} mb={0} mt={0} />

      {/* --------------------------------- TABLE --------------------------------- */}
      <MDBox>
        <DataTable
          table={{ columns: currentColumns, rows: filteredRows }} // Dynamic columns and rows
          isSorted={false}
          entriesPerPage={false}
        />
      </MDBox>
    </Card>
  );
}
Projects.propTypes = {
  // Added propTypes for the new accountId prop
  accountId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
};

export default Projects;
