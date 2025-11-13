import React, { useState, useEffect, useMemo, useCallback } from "react";
import PropTypes from "prop-types";
// Removed ApiService import to ensure mock data runs

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
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

// Material Dashboard 2 React examples
import DataTable from "examples/Tables/DataTable";

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
  let color;
  if (status === "Active") {
    color = "success";
  } else if (status === "Inactive") {
    color = "error";
  } else {
    color = "warning";
  }
  return (
    <MDBox lineHeight={1}>
      <MDTypography variant="caption" color={color} fontWeight="bold" status={status}>
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

/**
 * Renders the Lock Status icon with hover descriptions.
 */
const LockUnlock = ({ isLocked, deviceStatus }) => {
  let iconName;
  let color;
  let tooltipText;
  
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
      tooltipText = isLocked ? "**Trip Status: Locked (Ready to Unlock)**" : "**Trip Status: Unlocked**";
      break;
  }

  return (
    <MDBox display="flex" justifyContent="center">
      <Tooltip title={<MDTypography variant="caption" color="light" fontWeight="bold">{tooltipText}</MDTypography>}> 
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

// Table Columns (unchanged)
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

  // Function to handle the bulk unlock action
  const handleBulkUnlock = () => {
    closeMenu();
    const imeiToUnlock = Object.keys(selectedRows).filter(imei => selectedRows[imei]);
    
    if (imeiToUnlock.length > 0) {
      console.log(`**IMPORTANT: Initiating bulk unlock for IMEIs:** ${imeiToUnlock.join(', ')}`);
      // 💡 Placeholder for your API call:
      // ApiService.unlockDevices(imeiToUnlock).then(...)
      
      // After successful unlock, you would typically refresh the table or update the state
      // For demonstration, we'll clear the selection:
      setSelectedRows({}); 
      alert(`UNLOCK command sent for ${imeiToUnlock.length} trip(s). Status will update shortly.`);
    } else {
      alert("No trips selected for unlock.");
    }
  };

  const handleToggleSelect = useCallback((imei) => {
    setSelectedRows((prevSelected) => ({
      ...prevSelected,
      [imei]: !prevSelected[imei],
    }));
  }, []); 

  const handleToggleSelectAll = useCallback(() => {
    const allSelectableImeis = allRows
      .map((row) => row.imei?.props?.text)
      .filter(Boolean)
      .filter(imei => {
        const rowData = allRows.find(r => r.imei?.props?.text === imei);
        const isStandardUnlocked = rowData?._isLockedInitial === false && rowData?._deviceStatus === null;
        return !isStandardUnlocked;
      });

    const totalSelectedRows = allSelectableImeis.filter(imei => selectedRows[imei]).length;
    const allSelected = totalSelectedRows === allSelectableImeis.length;

    let newSelectedRows = {};
    if (!allSelected) {
      newSelectedRows = allSelectableImeis.reduce((acc, imei) => ({ ...acc, [imei]: true }), {});
    } else {
      newSelectedRows = allSelectableImeis.reduce((acc, imei) => ({ ...acc, [imei]: false }), {});
    }
    
    setSelectedRows(prevSelected => {
        const nextSelected = {...prevSelected};
        Object.keys(newSelectedRows).forEach(imei => {
            nextSelected[imei] = newSelectedRows[imei];
        });
        return nextSelected;
    });

  }, [allRows, selectedRows]);

  // 🛑 Data Fetching Logic (MOCK DATA)
  useEffect(() => {
    setLoading(true);
    
    const mockData = [
      { imei: "IMEI1", rope_cut_only: true, case_tamper: false, rope_insert_only: false, is_locked: true, vehnum: "TRIP-RC", speed: 50, avg: 10, gps: "A", ign: "Y", devTs: "2025-11-10 09:00:00", lat: 1, lng: 1, address: "Rope Cut Location" },
      { imei: "IMEI2", rope_cut_only: false, case_tamper: true, rope_insert_only: false, is_locked: true, vehnum: "TRIP-CT", speed: 0, avg: 0, gps: "A", ign: "N", devTs: "2025-11-10 09:05:00", lat: 2, lng: 2, address: "Case Tamper Location" },
      { imei: "IMEI3", rope_cut_only: false, case_tamper: false, rope_insert_only: true, is_locked: true, vehnum: "TRIP-RI", speed: 10, avg: 5, gps: "V", ign: "Y", devTs: "2025-11-10 09:10:00", lat: 3, lng: 3, address: "Rope Insert Location" },
      { imei: "IMEI4", rope_cut_only: false, case_tamper: false, rope_insert_only: false, is_locked: true, vehnum: "TRIP-LOCKED", speed: 20, avg: 15, gps: "A", ign: "Y", devTs: "2025-11-10 09:15:00", lat: 4, lng: 4, address: "Locked Trip Location" },
      // This is the trip where the checkbox will be HIDDEN
      { imei: "IMEI5", rope_cut_only: false, case_tamper: false, rope_insert_only: false, is_locked: false, vehnum: "TRIP-UNLOCKED", speed: 0, avg: 0, gps: "A", ign: "N", devTs: "2025-11-10 09:20:00", lat: 5, lng: 5, address: "Unlocked Trip Location" }, 
      { imei: "IMEI6", rope_cut_only: false, case_tamper: false, rope_insert_only: false, is_locked: true, vehnum: "TRIP-LOCKED-2", speed: 10, avg: 10, gps: "A", ign: "Y", devTs: "2025-11-10 09:25:00", lat: 6, lng: 6, address: "Locked Trip Location 2" },
    ];

    setTimeout(() => {
        const sourceData = mockData;
        const initialSelectedRows = {};
        sourceData.forEach((item) => { initialSelectedRows[item.imei] = false; });
        setSelectedRows(initialSelectedRows);

        const fetchedRows = sourceData.map((item, index) => {
          const gpsDisplay = item.gps === "A" ? "Active" : item.gps === "V" ? "Inactive" : "N/A";
          let deviceStatus = null;
          if (item.rope_cut_only) { deviceStatus = "ROPE_CUT"; } 
          else if (item.case_tamper) { deviceStatus = "CASE_TAMPER"; } 
          else if (item.rope_insert_only) { deviceStatus = "ROPE_INSERT"; } 

          return {
            no: <DataCell text={String(index + 1)} />,
            vehicleNo: <DataCell text={item.vehnum || "N/A"} fontWeight="bold" />,
            gpsStatus: <Status status={gpsDisplay} />,
            ignitionStatus: <Ignition status={item.ign === "Y" ? 1 : 0} />,
            imei: <DataCell text={item.imei || "N/A"} />,
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
            lockUnlock: null,
            checkbox: null,
            _deviceStatus: deviceStatus,
            _isLockedInitial: item.is_locked || false,
          };
        });

        setAllRows(fetchedRows);
        setLoading(false);
    }, 500); 

  }, [handleToggleSelect]); 

// --- Filter and Reactive Row Logic ---
  const filteredRows = useMemo(() => {
    const reactiveRows = allRows.map((row) => {
      const imei = row.imei?.props?.text;
      const deviceStatus = row._deviceStatus; 
      const isLockedStatus = row._isLockedInitial; 

      if (!imei) return row;
      
      // Determine if the trip is in the "Standard Unlocked" state
      const isStandardUnlocked = isLockedStatus === false && deviceStatus === null;

      const lockComponent = (
        <LockUnlock
          isLocked={isLockedStatus} 
          deviceStatus={deviceStatus} 
        />
      );

      // Conditional Checkbox component
      let checkboxComponent;
      if (isStandardUnlocked) {
        checkboxComponent = (
            <MDTypography variant="caption" color="text" fontWeight="regular">
                -
            </MDTypography>
        );
      } else {
        checkboxComponent = (
          <MDBox display="flex" justifyContent="center">
            <Checkbox
              checked={selectedRows[imei] || false} 
              onChange={() => handleToggleSelect(imei)}
              color="info"
            />
          </MDBox>
        );
      }

      return {
        ...row,
        lockUnlock: lockComponent,
        checkbox: checkboxComponent,
      };
    });

    // --- Search Filtering ---
    // (Filtering logic unchanged)
    if (!searchTerm || !reactiveRows.length) { return reactiveRows; }
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    
    return reactiveRows.filter((row) => {
        const extractText = (component) => {
            if (component && component.props) {
                if (component.props.text) return String(component.props.text);
                if (component.props.status) return String(component.props.status);
            }
            return "";
        };
        const vehicleNo = extractText(row.vehicleNo).toLowerCase();
        const imei = extractText(row.imei).toLowerCase();
        const address = extractText(row.address).toLowerCase();
        const gpsStatus = extractText(row.gpsStatus).toLowerCase();

        return (
            vehicleNo.includes(lowerCaseSearchTerm) ||
            imei.includes(lowerCaseSearchTerm) ||
            address.includes(lowerCaseSearchTerm) ||
            gpsStatus.includes(lowerCaseSearchTerm)
        );
    });
  }, [allRows, searchTerm, selectedRows, handleToggleSelect]); 

  // Dynamic Header for the 'Select All' checkbox
  const allSelectableImeis = allRows
    .map((row) => row.imei?.props?.text)
    .filter(Boolean)
    .filter(imei => {
      const rowData = allRows.find(r => r.imei?.props?.text === imei);
      const isStandardUnlocked = rowData?._isLockedInitial === false && rowData?._deviceStatus === null;
      return !isStandardUnlocked;
    });

  const totalSelectedRows = allSelectableImeis.filter(imei => selectedRows[imei]).length;
  const totalSelectableRows = allSelectableImeis.length;
  const isAnyRowSelected = totalSelectedRows > 0;
  const allSelected = totalSelectableRows > 0 && totalSelectedRows === totalSelectedRows;

  const dynamicColumns = useMemo(() => {
    const selectAllCheckbox = (
      <MDBox display="flex" justifyContent="center">
        {totalSelectableRows > 0 ? (
          <Tooltip title={allSelected ? "Deselect All" : "**Select All Unlockable Trips**"}>
            <Checkbox
              checked={allSelected}
              indeterminate={isAnyRowSelected && !allSelected}
              onChange={handleToggleSelectAll}
              color="info"
            />
          </Tooltip>
        ) : (
             <MDTypography variant="caption" color="text" fontWeight="regular">
                -
            </MDTypography>
        )}
      </MDBox>
    );

    return tableColumns.map((col) =>
      col.accessor === "checkbox" ? { ...col, Header: selectAllCheckbox } : col
    );
  }, [allRows, selectedRows, handleToggleSelectAll]);

  // The Bulk Action Menu
  const renderMenu = (
    <Menu
      id="simple-menu"
      anchorEl={menu}
      anchorOrigin={{ vertical: "top", horizontal: "left" }}
      transformOrigin={{ vertical: "top", horizontal: "right" }}
      open={Boolean(menu)}
      onClose={closeMenu}
    >
      {/* 🛑 CRITICAL FIX: The menu item now triggers handleBulkUnlock */}
      <MenuItem onClick={handleBulkUnlock} disabled={!isAnyRowSelected}>
        Perform Bulk **UNLOCK** on **{totalSelectedRows}** Trips
      </MenuItem>
      <MenuItem onClick={closeMenu}>Another action</MenuItem>
      <MenuItem onClick={closeMenu}>Something else</MenuItem>
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
          {/* Title Section */}
          <MDBox mr={3}>
            <MDTypography variant="h6" gutterBottom>
              Trip Information
            </MDTypography>
            <MDBox display="flex" alignItems="center" lineHeight={0}>
              <MDTypography variant="button" fontWeight="regular" color="text">
                &nbsp;
                <strong>{filteredRows.length} total</strong>
                {allRows.length > 0 && ` of ${allRows.length}`} trips displayed
              </MDTypography>
            </MDBox>
          </MDBox>

          {/* Search Bar Section */}
          <MDBox ml="auto" mr={2} width="50%">
            <TextField
              fullWidth
              variant="outlined"
              size="small"
              placeholder="Search by Vehicle No., Name, IMEI, Address, or Status..."
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

          {/* Menu Icon Section */}
          <MDBox color="text" px={2}>
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

      {/* DataTable Section */}
      <MDBox>
        <DataTable
          table={{ columns: dynamicColumns, rows: filteredRows }}
          showTotalEntries={false}
          isSorted={false}
          noEndBorder
          entriesPerPage={false}
        />
      </MDBox>
    </Card>
  );
}

export default Projects;