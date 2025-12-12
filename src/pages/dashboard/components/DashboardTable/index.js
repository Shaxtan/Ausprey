import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
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
import Select from "@mui/material/Select";
import FormControl from "@mui/material/FormControl";

// Material Dashboard 2 React components
import MDBox from "../../../../assets/components/MDBox";
import MDTypography from "../../../../assets/components/MDTypography";
import MDButton from "../../../../assets/components/MDButton";

// Material Dashboard 2 React examples
import DataTable from "../../../../assets/components/examples/Tables/DataTable";

// =====================================================================================
// HELPER COMPONENTS
// =====================================================================================

const DataCell = ({ text, color = "text", fontWeight = "medium", isClickable, onClick }) => {
  if (isClickable) {
    return (
      <MDTypography
        variant="caption"
        color="info"
        fontWeight="bold"
        sx={{ cursor: "pointer", textDecoration: "underline" }}
        onClick={onClick}
      >
        {text}
      </MDTypography>
    );
  }
  return (
    <MDTypography variant="caption" color={color} fontWeight={fontWeight}>
      {text}
    </MDTypography>
  );
};
DataCell.propTypes = {
  text: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  color: PropTypes.string,
  fontWeight: PropTypes.string,
  isClickable: PropTypes.bool,
  onClick: PropTypes.func,
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
// TABLE COLUMNS
// =====================================================================================

const VTS_COLUMNS = [
  { Header: "No", accessor: "no", width: "5%", align: "left" },
  { Header: "Acc Name", accessor: "accountName", width: "12%", align: "left" },
  { Header: "VEHICLE NO.", accessor: "vehicleNo", width: "10%", align: "left" },
  { Header: "IMEI", accessor: "imei", width: "12%", align: "center" },
  { Header: "SIM NO", accessor: "simNo", width: "12%", align: "center" },
  { Header: "DATE/TIME", accessor: "date", width: "12%", align: "center" },
  { Header: "ADDRESS", accessor: "address", width: "20%", align: "left" },
  { Header: "LATITUDE", accessor: "latitude", width: "10%", align: "center" },
  { Header: "LONGITUDE", accessor: "longitude", width: "10%", align: "center" },
  { Header: "GPS STATUS", accessor: "gpsStatus", width: "8%", align: "center" },
  { Header: "IGNITION", accessor: "ignitionStatus", width: "8%", align: "center" },
  { Header: "LOAD SENSOR", accessor: "avgSpeed", width: "7%", align: "center" },
  { Header: "CURRENT SPEED", accessor: "currentSpeed", width: "8%", align: "center" },
];
const ELK_COLUMNS = [
  { Header: "No", accessor: "no", width: "5%", align: "left" },
  { Header: "Acc Name", accessor: "accountName", width: "12%", align: "left" },
  { Header: "VEHICLE NO.", accessor: "vehicleNo", width: "10%", align: "left" },
  { Header: "IMEI", accessor: "imei", width: "12%", align: "center" },
  { Header: "SIM NO", accessor: "simNo", width: "12%", align: "center" },
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

const UNREACHABLE_COLUMNS = [
  { Header: "No", accessor: "no", width: "5%", align: "left" },
  { Header: "Acc Name", accessor: "accountName", width: "18%", align: "left" },
  { Header: "Acc ID", accessor: "accountId", width: "10%", align: "left" },
  { Header: "VEHICLE NO.", accessor: "vehicleNo", width: "12%", align: "left" },
  { Header: "IMEI", accessor: "imei", width: "15%", align: "center" },
  { Header: "Dev Type", accessor: "deviceType", width: "15%", align: "left" },
  { Header: "Created On", accessor: "createdOn", width: "15%", align: "left" },
];

// =====================================================================================
// MAIN COMPONENT
// =====================================================================================

function Projects({ accountId }) {
  const navigate = useNavigate();

  const [menu, setMenu] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [allVtsRows, setAllVtsRows] = useState([]);
  const [allElkRows, setAllElkRows] = useState([]);
  const [unreachableRows, setUnreachableRows] = useState([]);
  const [selectedRows, setSelectedRows] = useState({});
  const [tripFilterType, setTripFilterType] = useState("vts");

  // 🔥 Page Size State
  const [pageSize, setPageSize] = useState(10);

  const openMenu = ({ currentTarget }) => setMenu(currentTarget);
  const closeMenu = () => setMenu(null);

  // 🔥 Handle Dropdown Change
  const handlePageSizeChange = (event) => {
    setPageSize(event.target.value);
  };

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

  const handleImeiClick = useCallback(
    (imei) => {
      navigate(`/live-track?imei=${imei}`);
    },
    [navigate]
  );

  // -----------------------------------------------------------------------------------
  // Data Fetching Functions
  // -----------------------------------------------------------------------------------

  const fetchVtsData = useCallback(
    (currentAccountId) => {
      setLoading(true);
      ApiService.getDashboardData(
        { accid: currentAccountId },
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
                  <MDBox display="flex" alignItems="center" gap={0.5} justifyContent="flex-start">
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
                accountName: <DataCell text={item.accountName || "N/A"} fontWeight="medium" />,
                // 🔥 UPDATED: Clickable Vehicle No
                vehicleNo: (
                  <DataCell
                    text={item.vehnum || item.name || "N/A"}
                    fontWeight="bold"
                    isClickable={true}
                    onClick={() => handleImeiClick(imei)}
                  />
                ),
                gpsStatus: <Status status={gpsDisplay} />,
                ignitionStatus: <Ignition status={item.ign === "Y" ? 1 : 0} />,
                imei: (
                  <DataCell text={imei} isClickable={true} onClick={() => handleImeiClick(imei)} />
                ),
                simNo: <DataCell text={item.simNo || "N/A"} fontWeight="medium" />,
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
                checkbox: null,
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
    [handleImeiClick]
  );
  const fetchElkData = useCallback(
    (currentAccountId) => {
      setLoading(true);
      ApiService.getDashboardData(
        { accid: currentAccountId },
        (res) => {
          if (res?.data?.resultCode === 1 && res?.data?.data?.data?.ELK?.available) {
            const devices = res.data.data.data.ELK.available;
            const fetchedRows = devices.map((item, index) => {
              const gpsDisplay = item.gps === "A" ? "Active" : "Inactive";
              const imei = item.imei || "N/A";
              const speed = Number(item.speed) || 0;
              const isLocked = speed === 0 && item.ign === "Y";

              return {
                no: (
                  <MDBox display="flex" alignItems="center" gap={0.5} justifyContent="flex-start">
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
                accountName: <DataCell text={item.accountName || "N/A"} fontWeight="medium" />,
                vehicleNo: <DataCell text={item.vehnum || item.name || "N/A"} fontWeight="bold" />,
                gpsStatus: <Status status={gpsDisplay} />,
                ignitionStatus: <Ignition status={item.ign === "Y" ? 1 : 0} />,
                imei: (
                  <DataCell text={imei} isClickable={true} onClick={() => handleImeiClick(imei)} />
                ),
                simNo: <DataCell text={item.simNo || "N/A"} fontWeight="medium" />,
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
                checkbox: null,
                _imei: imei,
                _isLockedInitial: isLocked,
              };
            });
            setAllElkRows(fetchedRows);
            setSelectedRows({});
          } else {
            setAllElkRows([]);
          }
          setLoading(false);
        },
        true,
        1
      );
    },
    [handleImeiClick]
  );

  const fetchUnreachableData = useCallback(
    (currentAccountId) => {
      setLoading(true);
      ApiService.getUnreachableDevices({ accid: currentAccountId }, (res) => {
        const unreachableDevices = res?.data?.data || [];
        if (res?.data?.resultCode === 1 && Array.isArray(unreachableDevices)) {
          const fetchedRows = unreachableDevices.map((item, index) => {
            const imei = item.imei || "N/A";
            return {
              no: <DataCell text={index + 1} fontWeight="bold" />,
              accountName: <DataCell text={item.accountName || "N/A"} fontWeight="medium" />,
              accountId: <DataCell text={item.accid || "N/A"} fontWeight="medium" />,
              // 🔥 UPDATED: Clickable Vehicle No
              vehicleNo: (
                <DataCell
                  text={item.vehnum || "N/A"}
                  fontWeight="bold"
                  isClickable={true}
                  onClick={() => handleImeiClick(imei)}
                />
              ),
              imei: (
                <DataCell text={imei} isClickable={true} onClick={() => handleImeiClick(imei)} />
              ),
              deviceType: <DataCell text={item.deviceType || "N/A"} fontWeight="medium" />,
              createdOn: <DataCell text={item.createdOn || "N/A"} fontWeight="medium" />,
            };
          });
          setUnreachableRows(fetchedRows);
        } else {
          setUnreachableRows([]);
        }
        setLoading(false);
      });
    },
    [handleImeiClick]
  );

  useEffect(() => {
    if (tripFilterType === "vts") {
      fetchVtsData(accountId);
    } else if (tripFilterType === "elk") {
      fetchElkData(accountId);
    } else if (tripFilterType === "unreachable") {
      fetchUnreachableData(accountId);
    }
  }, [tripFilterType, accountId, fetchVtsData, fetchUnreachableData, fetchElkData]);

  // const currentRows = tripFilterType === "vts" ? allVtsRows : unreachableRows;
  // const currentColumns = tripFilterType === "vts"
  //     ? [...VTS_COLUMNS,

  //     ]
  //     : UNREACHABLE_COLUMNS;

  // Create a map for rows
  const rowsByType = {
    vts: allVtsRows,
    elk: allElkRows, // <-- add your ELK rows array
    unreachable: unreachableRows,
  };

  // Create a map for columns
  const columnsByType = {
    vts: VTS_COLUMNS,
    elk: ELK_COLUMNS, // <-- add your ELK columns array
    unreachable: UNREACHABLE_COLUMNS,
  };

  // Resolve based on tripFilterType
  const currentRows = rowsByType[tripFilterType] || [];
  const currentColumns = columnsByType[tripFilterType] || [];

  const filteredRows = useMemo(() => {
    if (tripFilterType === "vts") {
      return currentRows
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
          return {
            ...row,
            lockUnlock: row.lockUnlock,
            checkbox: checkboxComponent,
          };
        })
        .filter((row) => {
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
    } else if (tripFilterType === "elk") {
      return currentRows
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
          return {
            ...row,
            lockUnlock: row.lockUnlock,
            checkbox: checkboxComponent,
          };
        })
        .filter((row) => {
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
    if (tripFilterType === "unreachable") {
      return currentRows.filter((row) => {
        if (!searchTerm) return true;
        const term = searchTerm.toLowerCase();
        const fields = [
          row.accountName?.props?.text,
          row.accountId?.props?.text,
          row.vehicleNo?.props?.text,
          row.imei?.props?.text,
          row.deviceType?.props?.text,
        ].filter(Boolean);
        return fields.some((f) => String(f).toLowerCase().includes(term));
      });
    }
    return [];
  }, [currentRows, searchTerm, selectedRows, handleToggleSelect, tripFilterType]);

  if (loading) {
    return (
      <Card>
        <MDBox p={3} display="flex" justifyContent="center" alignItems="center" minHeight="200px">
          <CircularProgress color="info" size={30} />
          <MDTypography variant="h6" ml={2}>
            {tripFilterType === "vts"
              ? "Fetching Live Trip Data..."
              : "Fetching Unreachable Devices..."}
          </MDTypography>
        </MDBox>
      </Card>
    );
  }

  return (
    <Card sx={{ height: "100%", mt: 3, overflow: "visible" }}>
      {/* --------------------------------- HEADER (TABS) --------------------------------- */}
      <MDBox position="relative" px={3} pt={3} pb={1}>
        <MDBox
          display="inline-flex"
          sx={(theme) => ({
            position: "absolute",
            top: -18, // This moves the tabs up. The mt: 3 on Card ensures space for this.
            left: 24,
            backgroundColor: theme.palette.background.paper,
            borderRadius: "16px",
            boxShadow: theme.shadows[3],
            overflow: "hidden",
          })}
        >
          {/* ... existing buttons ... */}
          <MDButton
            variant={tripFilterType === "vts" ? "contained" : "text"}
            color={tripFilterType === "vts" ? "info" : "dark"}
            size="small"
            onClick={() => setTripFilterType("vts")}
            sx={{ borderRadius: 0, px: 2, py: 1, minWidth: "110px", boxShadow: "none" }}
          >
            VTS
          </MDButton>
          <MDButton
            variant={tripFilterType === "elk" ? "contained" : "text"}
            color={tripFilterType === "elk" ? "info" : "dark"}
            size="small"
            onClick={() => setTripFilterType("elk")}
            sx={{ borderRadius: 0, px: 2, py: 1, minWidth: "110px", boxShadow: "none" }}
          >
            PADLOCK
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
        </MDBox>

        <MDBox display="flex" justifyContent="space-between" alignItems="center" mt={1.5}>
          <MDBox display="flex" alignItems="center" width="100%">
            <MDBox mr={3}>
              <MDTypography variant="h6">
                {tripFilterType === "vts" ? "Live Trip Report Table" : "Unreachable Devices"}
                <MDTypography variant="button" color="text" ml={1}>
                  (<strong>{filteredRows.length}</strong>{" "}
                  {tripFilterType === "vts" ? "trips" : "devices"} displayed)
                </MDTypography>
              </MDTypography>
            </MDBox>

            {/* 🔥 FIXED: Search + Select in Flex Container */}
            <MDBox
              ml="auto"
              mr={2}
              width="50%"
              display="flex"
              alignItems="center"
              justifyContent="flex-end"
            >
              {/* Search Box */}
              <MDBox flexGrow={1} mr={2}>
                <TextField
                  fullWidth
                  size="small"
                  variant="outlined"
                  placeholder={`Search by ${
                    tripFilterType === "vts" ? "Vehicle, IMEI..." : "Vehicle, IMEI..."
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

              {/* 🔥 Dropdown (Right side of Search) */}
              <FormControl variant="outlined" size="small" sx={{ minWidth: 90 }}>
                <Select
                  value={pageSize}
                  onChange={handlePageSizeChange}
                  displayEmpty
                  sx={{ height: "44px" }} // Align height with TextField
                >
                  <MenuItem value={10}>10</MenuItem>
                  <MenuItem value={20}>20</MenuItem>
                  <MenuItem value={50}>50</MenuItem>
                  <MenuItem value={100}>100</MenuItem>
                </Select>
              </FormControl>
            </MDBox>

            <MDBox>
              <Icon sx={{ cursor: "pointer" }} fontSize="small" onClick={openMenu}>
                more_vert
              </Icon>
            </MDBox>
          </MDBox>

          <Menu anchorEl={menu} open={Boolean(menu)} onClose={closeMenu}>
            {tripFilterType === "vts" && (
              <MenuItem onClick={handleBulkUnlock}>Bulk Unlock</MenuItem>
            )}
            <MenuItem onClick={closeMenu}>Refresh</MenuItem>
            <MenuItem onClick={closeMenu}>Export</MenuItem>
          </Menu>
        </MDBox>
      </MDBox>

      {/* <MDBox p={3} mb={0} mt={0} /> */}

      {/* --------------------------------- TABLE --------------------------------- */}
      <MDBox>
        <DataTable
          key={pageSize} // 🔥 Forces update when pageSize changes
          table={{ columns: currentColumns, rows: filteredRows }}
          isSorted={false}
          // 🔥 Using entriesPerPage={false} to HIDE the duplicate internal dropdown ("next line" issue)
          // Note: If you have a specific custom DataTable implementation that needs the entries object to function,
          // you may need to pass the object but hide the internal UI via CSS.
          entriesPerPage={{ defaultValue: pageSize, entries: [pageSize] }}
          showTotalEntries={true}
          pagination={{ variant: "gradient", color: "info" }}
          noEndBorder
          // 🔥 OPTIONAL: Hides the internal "Entries" header if the component still renders it
          sx={{
            "& .MuiTablePagination-selectLabel, & .MuiTablePagination-input": { display: "none" },
          }}
        />
      </MDBox>
    </Card>
  );
}
Projects.propTypes = {
  accountId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
};

export default Projects;
