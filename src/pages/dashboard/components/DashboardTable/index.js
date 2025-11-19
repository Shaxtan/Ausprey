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

// Material Dashboard 2 React examples
import DataTable from "../../../../assets/components/examples/Tables/DataTable";

// =========================================================================
// Helper Components
// =========================================================================

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
  let color = status === "Active" ? "success" : status === "Inactive" ? "error" : "warning";
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
  let color = ignitionStatus === "On" ? "success" : "error";
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

// Table Columns (with Lock & Checkbox)
const tableColumns = [
  { Header: "No", accessor: "no", width: "5%", align: "left" },
  { Header: "VEHICLE NO.", accessor: "vehicleNo", width: "10%", align: "left" },
  { Header: "GPS STATUS", accessor: "gpsStatus", width: "8%", align: "center" },
  { Header: "IGNITION", accessor: "ignitionStatus", width: "8%", align: "center" },
  { Header: "IMEI", accessor: "imei", width: "12%", align: "center" },
  { Header: "DATE/TIME", accessor: "date", width: "12%", align: "center" },
  { Header: "LATITUDE", accessor: "latitude", width: "10%", align: "center" },
  { Header: "LONGITUDE", accessor: "longitude", width: "10%", align: "center" },
  { Header: "ADDRESS", accessor: "address", width: "20%", align: "left" },
  { Header: "LOAD SENSOR", accessor: "avgSpeed", width: "7%", align: "center" },
  { Header: "CURRENT SPEED", accessor: "currentSpeed", width: "8%", align: "center" },
  { Header: "LOCK STATUS", accessor: "lockUnlock", width: "8%", align: "center" },
  { Header: "UNLOCK", accessor: "checkbox", width: "5%", align: "center" },
];

// =========================================================================
// Main Component
// =========================================================================

function Projects() {
  const [menu, setMenu] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [allRows, setAllRows] = useState([]);
  const [selectedRows, setSelectedRows] = useState({});

  const openMenu = ({ currentTarget }) => setMenu(currentTarget);
  const closeMenu = () => setMenu(null);

  // Bulk Unlock Handler
  const handleBulkUnlock = () => {
    closeMenu();
    const imeiToUnlock = Object.keys(selectedRows).filter((imei) => selectedRows[imei]);

    if (imeiToUnlock.length > 0) {
      console.log(`Initiating bulk unlock for IMEIs: ${imeiToUnlock.join(", ")}`);
      alert(`UNLOCK command sent for ${imeiToUnlock.length} trip(s). Status will update shortly.`);

      // TODO: Uncomment when API is ready
      // ApiService.unlockDevices(imeiToUnlock).then(...)

      setSelectedRows({});
    } else {
      alert("No trips selected for unlock.");
    }
  };

  const handleToggleSelect = useCallback((imei) => {
    setSelectedRows((prev) => ({ ...prev, [imei]: !prev[imei] }));
  }, []);

  const handleToggleSelectAll = useCallback(() => {
    const unlockableImeis = allRows
      .filter((row) => {
        const imei = row.imei?.props?.text;
        const isLocked = row._isLockedInitial;
        const deviceStatus = row._deviceStatus;
        return imei && (isLocked || deviceStatus); // Can unlock if locked OR has alert
      })
      .map((row) => row.imei.props.text);

    const allSelected = unlockableImeis.every((imei) => selectedRows[imei]);
    const newSelection = unlockableImeis.reduce(
      (acc, imei) => ({
        ...acc,
        [imei]: !allSelected,
      }),
      {}
    );

    setSelectedRows((prev) => ({
      ...prev,
      ...newSelection,
    }));
  }, [allRows, selectedRows]);

  // Fetch Real Data from API
  useEffect(() => {
    setLoading(true);
    ApiService.getDashboardData(
      {},
      (res) => {
        if (res?.data?.resultCode === 1 && res?.data?.data) {
          const { data } = res.data.data;

          const fetchedRows = data.map((item, index) => {
            const gpsDisplay = item.gps === "A" ? "Active" : item.gps === "V" ? "Inactive" : "N/A";

            // === Determine Device Status & Lock State ===
            let deviceStatus = null;
            let isLocked = false;

            if (item.rope_cut_only) {
              deviceStatus = "ROPE_CUT";
              isLocked = true;
            } else if (item.case_tamper) {
              deviceStatus = "CASE_TAMPER";
              isLocked = true;
            } else if (item.rope_insert_only) {
              deviceStatus = "ROPE_INSERT";
              isLocked = true;
            } else if (item.is_locked !== undefined) {
              isLocked = item.is_locked;
            }

            const imei = item.imei || "N/A";

            return {
              no: <DataCell text={String(index + 1)} />,
              vehicleNo: <DataCell text={item.vehnum || "N/A"} fontWeight="bold" />,
              gpsStatus: <Status status={gpsDisplay} />,
              ignitionStatus: <Ignition status={item.ign === "Y" ? 1 : 0} />,
              imei: <DataCell text={imei} />,
              date: <DataCell text={item.devTs || "N/A"} />,
              latitude: <DataCell text={item.lat ? `${item.lat.toFixed(6)}°` : "N/A"} />,
              longitude: <DataCell text={item.lng ? `${item.lng.toFixed(6)}°` : "N/A"} />,
              address: <DataCell text={item.address || "N/A"} />,
              avgSpeed: <DataCell text={item.avg !== null ? String(item.avg) : "N/A"} />,
              currentSpeed: (
                <DataCell
                  text={item.speed !== null ? `${item.speed} km/h` : "N/A"}
                  color={item.speed > 0 ? "success" : "text"}
                  fontWeight="bold"
                />
              ),
              lockUnlock: <LockUnlock isLocked={isLocked} deviceStatus={deviceStatus} />,
              checkbox: null, // Will be filled in filteredRows
              _isLockedInitial: isLocked,
              _deviceStatus: deviceStatus,
            };
          });

          setAllRows(fetchedRows);
          setSelectedRows({}); // Reset selection
        } else {
          console.error("Failed to fetch trip data:", res);
          setAllRows([]);
        }
        setLoading(false);
      },
      true,
      1
    );
  }, []);

  // Filtered + Reactive Rows (with conditional checkbox)
  const filteredRows = useMemo(() => {
    return allRows
      .map((row) => {
        const imei = row.imei?.props?.text;
        if (!imei) return row;

        const isStandardUnlocked = row._isLockedInitial === false && row._deviceStatus === null;

        const checkboxComponent = isStandardUnlocked ? (
          <MDTypography variant="caption" color="text">
            -
          </MDTypography>
        ) : (
          <MDBox display="flex" justifyContent="center">
            <Checkbox
              checked={!!selectedRows[imei]}
              onChange={() => handleToggleSelect(imei)}
              color="info"
            />
          </MDBox>
        );

        return { ...row, checkbox: checkboxComponent };
      })
      .filter((row) => {
        if (!searchTerm) return true;
        const term = searchTerm.toLowerCase();
        const fields = [
          row.vehicleNo?.props?.text,
          row.imei?.props?.text,
          row.address?.props?.text,
          row.gpsStatus?.props?.status,
        ].filter(Boolean);

        return fields.some((field) => String(field).toLowerCase().includes(term));
      });
  }, [allRows, searchTerm, selectedRows, handleToggleSelect]);

  // Dynamic Select All Header
  const unlockableCount = allRows.filter((r) => {
    const imei = r.imei?.props?.text;
    return imei && (r._isLockedInitial || r._deviceStatus);
  }).length;

  const selectedCount = Object.values(selectedRows).filter(Boolean).length;
  const allSelected = unlockableCount > 0 && selectedCount === unlockableCount;

  const dynamicColumns = useMemo(() => {
    const headerCheckbox =
      unlockableCount > 0 ? (
        <Tooltip title={allSelected ? "Deselect All" : "Select All Unlockable Trips"}>
          <Checkbox
            checked={allSelected}
            indeterminate={selectedCount > 0 && !allSelected}
            onChange={handleToggleSelectAll}
            color="info"
          />
        </Tooltip>
      ) : (
        <MDTypography variant="caption" color="text">
          -
        </MDTypography>
      );

    return tableColumns.map((col) =>
      col.accessor === "checkbox" ? { ...col, Header: headerCheckbox } : col
    );
  }, [unlockableCount, selectedCount, allSelected, handleToggleSelectAll]);

  const renderMenu = (
    <Menu
      anchorEl={menu}
      open={Boolean(menu)}
      onClose={closeMenu}
      anchorOrigin={{ vertical: "top", horizontal: "left" }}
      transformOrigin={{ vertical: "top", horizontal: "right" }}
    >
      <MenuItem onClick={handleBulkUnlock} disabled={selectedCount === 0}>
        Perform Bulk **UNLOCK** on **{selectedCount}** Trip{selectedCount !== 1 ? "s" : ""}
      </MenuItem>
      <MenuItem onClick={closeMenu}>Refresh Data</MenuItem>
      <MenuItem onClick={closeMenu}>Export</MenuItem>
    </Menu>
  );

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
      <MDBox display="flex" justifyContent="space-between" alignItems="center" p={3}>
        <MDBox display="flex" alignItems="center" width="100%">
          <MDBox mr={3}>
            <MDTypography variant="h6" gutterBottom>
              Live Device Status Report
            </MDTypography>
            <MDTypography variant="button" fontWeight="regular" color="text">
              <strong>{filteredRows.length}</strong> trip{filteredRows.length !== 1 ? "s" : ""}{" "}
              displayed
            </MDTypography>
          </MDBox>

          <MDBox ml="auto" mr={2} width="50%">
            <TextField
              fullWidth
              size="small"
              variant="outlined"
              placeholder="Search by Vehicle No., IMEI, Address..."
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
            <Icon
              sx={{ cursor: "pointer", fontWeight: "bold" }}
              fontSize="small"
              onClick={openMenu}
            >
              more_vert
            </Icon>
          </MDBox>
        </MDBox>
        {renderMenu}
      </MDBox>

      <MDBox>
        {filteredRows.length === 0 ? (
          <MDBox p={6} textAlign="center">
            <Icon sx={{ fontSize: 60, color: "text.secondary", mb: 2 }}>search_off</Icon>
            <MDTypography variant="h6" color="text.secondary">
              {searchTerm ? `No trips match "${searchTerm}"` : "No trip data available"}
            </MDTypography>
          </MDBox>
        ) : (
          <DataTable
            table={{ columns: dynamicColumns, rows: filteredRows }}
            showTotalEntries={false}
            isSorted={false}
            noEndBorder
            entriesPerPage={false}
          />
        )}
      </MDBox>
    </Card>
  );
}

export default Projects;
