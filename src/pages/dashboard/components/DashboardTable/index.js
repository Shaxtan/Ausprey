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

// Helper Components
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

const tableColumns = [
  { Header: "No", accessor: "no", width: "5%", align: "left" },
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
  { Header: "LOCK STATUS", accessor: "lockUnlock", width: "8%", align: "center" },
  { Header: "UNLOCK", accessor: "checkbox", width: "5%", align: "center" },
];

// =====================================================================================
// MAIN COMPONENT
// =====================================================================================

function Projects() {
  const [menu, setMenu] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [allRows, setAllRows] = useState([]);
  const [selectedRows, setSelectedRows] = useState({});

  const openMenu = ({ currentTarget }) => setMenu(currentTarget);
  const closeMenu = () => setMenu(null);

  const handleBulkUnlock = () => {
    closeMenu();
    const imeiToUnlock = Object.keys(selectedRows).filter((imei) => selectedRows[imei]);

    if (imeiToUnlock.length > 0) {
      console.log(`Bulk unlock for: ${imeiToUnlock.join(", ")}`);
      alert(`UNLOCK command sent for ${imeiToUnlock.length} trip(s).`);
      setSelectedRows({});
    } else {
      alert("No trips selected.");
    }
  };

  const handleToggleSelect = useCallback((imei) => {
    setSelectedRows((prev) => ({ ...prev, [imei]: !prev[imei] }));
  }, []);

  // Fetch API Data
  useEffect(() => {
    setLoading(true);
    ApiService.getDashboardData(
      {},
      (res) => {
        if (res?.data?.resultCode === 1 && res?.data?.data) {
          const { data } = res.data.data;

          const fetchedRows = data.map((item, index) => {
            const gpsDisplay = item.gps === "A" ? "Active" : item.gps === "V" ? "Inactive" : "N/A";

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
              vehicleNo: <DataCell text={item.vehnum || "N/A"} fontWeight="bold" />,
              gpsStatus: <Status status={gpsDisplay} />,
              ignitionStatus: <Ignition status={item.ign === "Y" ? 1 : 0} />,
              imei: <DataCell text={imei} />,
              date: <DataCell text={item.devTs || "N/A"} />,
              latitude: <DataCell text={item.lat ? `${item.lat.toFixed(6)}°` : "N/A"} />,
              longitude: <DataCell text={item.lng ? `${item.lng.toFixed(6)}°` : "N/A"} />,
              address: <DataCell text={item.address || "N/A"} />,
              avgSpeed: <DataCell text={item.avg !== null ? item.avg : "N/A"} />,
              currentSpeed: (
                <DataCell
                  text={item.speed !== null ? `${item.speed} km/h` : "N/A"}
                  color={item.speed > 0 ? "success" : "text"}
                  fontWeight="bold"
                />
              ),
              lockUnlock: <LockUnlock isLocked={isLocked} deviceStatus={deviceStatus} />,
              checkbox: null,
              _isLockedInitial: isLocked,
              _deviceStatus: deviceStatus,
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
    return allRows.map((row) => {
      const imei = row.imei?.props?.text;
      if (!imei) return row;

      const isStandardUnlocked = row._isLockedInitial === false && row._deviceStatus === null;

      const checkboxComponent = isStandardUnlocked ? (
        <MDTypography variant="caption" color="text">-</MDTypography>
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
    }).filter((row) => {
      if (!searchTerm) return true;
      const term = searchTerm.toLowerCase();
      const fields = [
        row.vehicleNo?.props?.text,
        row.imei?.props?.text,
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
          <MDTypography variant="h6" ml={2}>Fetching Live Trip Data...</MDTypography>
        </MDBox>
      </Card>
    );
  }

  return (
    <Card>
      <MDBox display="flex" justifyContent="space-between" alignItems="center" p={3}>
        
        <MDBox display="flex" alignItems="center" width="100%">

          {/* TITLE */}
          <MDBox mr={3}>
            <MDTypography variant="h6" gutterBottom>Trip Report Table</MDTypography>
            <MDTypography variant="button" color="text">
              <strong>{filteredRows.length}</strong> trips displayed
            </MDTypography>
          </MDBox>

          {/* ➕ NEW BUTTONS ADDED HERE */}
          <MDBox display="flex" gap={1} ml={2}>
            <MDButton
              variant="gradient"
              color="success"
              size="small"
              startIcon={<Icon>add</Icon>}
              onClick={() => console.log("New Trip Clicked")}
            >
              New Trip
            </MDButton>

            <MDButton
              variant="outlined"
              color="info"
              size="small"
              startIcon={<Icon>map</Icon>}
              onClick={() => console.log("Map View Clicked")}
            >
              Map View
            </MDButton>
          </MDBox>

          {/* SEARCH BAR */}
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

          {/* MENU */}
          <MDBox>
            <Icon sx={{ cursor: "pointer" }} fontSize="small" onClick={openMenu}>
              more_vert
            </Icon>
          </MDBox>

        </MDBox>

        {/* MENU DROPDOWN */}
        <Menu anchorEl={menu} open={Boolean(menu)} onClose={closeMenu}>
          <MenuItem onClick={handleBulkUnlock}>Bulk Unlock</MenuItem>
          <MenuItem onClick={closeMenu}>Refresh</MenuItem>
          <MenuItem onClick={closeMenu}>Export</MenuItem>
        </Menu>

      </MDBox>

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
