import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import ApiService from "../../../../services/ApiService";

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
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";

import MDBox from "../../../../assets/components/MDBox";
import MDTypography from "../../../../assets/components/MDTypography";
import MDButton from "../../../../assets/components/MDButton";

import DataTable from "../../../../assets/components/examples/Tables/DataTable";
import { exportCSV, exportExcel, exportPDF } from "./dashUtils";

import {
  checkboxBaseSx,
  tablePaginationHideSelectSx,
  clickableTextSx,
  addressMapLinkSx,
} from "./Projects.styles";


const scrollContainerSx = {
  height: "calc(100vh - 160px)",
  overflowY: "auto",
  overflowX: "hidden",
  paddingBottom: "20px",
  position: "relative",
  "&::-webkit-scrollbar": {
    width: "6px",
  },
  "&::-webkit-scrollbar-track": {
    background: "#f1f1f1",
  },
  "&::-webkit-scrollbar-thumb": {
    background: "#888",
    borderRadius: "4px",
  },
};

const btnStyle = {
  minWidth: "auto",
  padding: "4px 8px",
  fontSize: "0.7rem",
  textTransform: "none",
  whiteSpace: "nowrap",
  display: "flex",
  alignItems: "center",
  gap: "4px",
};

const stickyCardSx = (zIndex) => ({
  position: "sticky",
  top: 0,
  zIndex,
  minHeight: "100%",
  marginBottom: 0,
  boxShadow: "0 -5px 20px rgba(0,0,0,0.1)",
  backgroundColor: "#fff",
  borderTop: "1px solid rgba(0,0,0,0.1)",
  transition: "transform 0.3s ease",
});


const DataCell = ({ text, color = "text", fontWeight = "medium", isClickable, onClick }) => {
  if (isClickable) {
    return (
      <MDTypography
        variant="caption"
        color="info"
        fontWeight="bold"
        sx={clickableTextSx}
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

const LockUnlock = ({ isLocked, deviceStatus, elkType }) => {
  let iconName, color, tooltipText;

  if (elkType === "U" || elkType === "L") {
    if (elkType === "L") {
      iconName = "lock";
      color = "success";
      tooltipText = "Device Status: LOCKED (Ready to Unlock)";
    } else {
      iconName = "lock_open";
      color = "error";
      tooltipText = "Device Status: UNLOCKED";
    }
  } else {
    switch (deviceStatus) {
      case "ROPE_CUT":
        iconName = "gpp_bad";
        color = "error";
        tooltipText = "Device Alert: Rope Cut Detected";
        break;
      case "CASE_TAMPER":
        iconName = "lock_person";
        color = "warning";
        tooltipText = "Device Alert: Case Tamper / String Tamper";
        break;
      case "ROPE_INSERT":
        iconName = "lock_reset";
        color = "info";
        tooltipText = "Device Status: Rope Inserted / Pending Lock";
        break;
      default:
        iconName = isLocked ? "lock" : "lock_open";
        color = isLocked ? "error" : "success";
        tooltipText = isLocked
          ? "Trip Status: Locked (Ready to Unlock)"
          : "Trip Status: Unlocked";
        break;
    }
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
  elkType: PropTypes.string,
};

const AddressCell = ({ item }) => (
  <MDBox display="flex" flexDirection="column" alignItems="flex-start" lineHeight={1.4}>
    {item.address && item.address !== "NA" && item.address.trim() !== "" ? (
      <MDTypography variant="caption" color="text">
        {item.address}
      </MDTypography>
    ) : item.lat && item.lng && !isNaN(item.lat) && !isNaN(item.lng) ? (
      <MDTypography
        variant="caption"
        color="info"
        fontWeight="bold"
        sx={addressMapLinkSx}
        onClick={() =>
          window.open(
            `https://www.google.com/maps?q=${item.lat.toFixed(6)},${item.lng.toFixed(6)}`,
            "_blank",
            "noopener,noreferrer"
          )
        }
      >
        Open in Google Maps ↗
      </MDTypography>
    ) : (
      <MDTypography variant="caption" color="textSecondary" fontSize="0.7rem" mt={0.5}>
        No coordinates available
      </MDTypography>
    )}
  </MDBox>
);

AddressCell.propTypes = { item: PropTypes.object };


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


const getBackendStatus = (item) => {
  const ignOn = item.ign === "Y";
  const speed = Number(item.speed) || 0;

  const rawTs = item.devTs || item.cts;
  if (rawTs) {
    const deviceTime = new Date(rawTs);
    if (!isNaN(deviceTime.getTime())) {
      const diffMs = Date.now() - deviceTime.getTime();
      const oneHourMs = 60 * 60 * 1000;
      if (diffMs > oneHourMs) return "offline";
    }
  }

  if (!ignOn) return "stopped";
  if (speed > 5) return "motion";
  return "idle";
};


function Projects({ accountId }) {
  const navigate = useNavigate();

  const [menu, setMenu] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  const [allVtsRows, setAllVtsRows] = useState([]);
  const [allElkRows, setAllElkRows] = useState([]);
  const [unreachableRows, setUnreachableRows] = useState([]);
  const [selectedRows, setSelectedRows] = useState({});
  const [pageSize, setPageSize] = useState(10);

  const [vtsTab, setVtsTab] = useState("all");
  const [elkTab, setElkTab] = useState("all"); 

  const [unlockDialog, setUnlockDialog] = useState({
    open: false,
    imei: null,
    vehicleNo: "",
    isBulk: false,
    bulkCount: 0,
    bulkImeis: [],
    bulkLockedCount: 0,
    action: "unlock",
  });

  const openMenu = ({ currentTarget }) => setMenu(currentTarget);
  const closeMenu = () => setMenu(null);

  const handleToggleSelect = useCallback((imei) => {
    setSelectedRows((prev) => ({ ...prev, [imei]: !prev[imei] }));
  }, []);

  const handleImeiClick = useCallback(
    (imei, accId) => {
      if (!imei || imei === "N/A") return;
      const targetAccountId = accId || accountId;
      navigate(`/live-track?imei=${imei}`, {
        state: { targetImei: imei, targetAccountId },
      });
    },
    [navigate, accountId]
  );


  const fetchVtsData = useCallback(
    (currentAccountId) => {
      ApiService.getDashboardData({ accid: currentAccountId }, (res) => {
        if (res?.data?.resultCode === 1 && res?.data?.data?.data?.VTS?.available) {
          const devices = res.data.data.data.VTS.available;
          const fetchedRows = devices.map((item, index) => {
            const imei = item.imei || "N/A";
            const speed = Number(item.speed) || 0;
            const isLocked = speed === 0 && item.ign === "Y";
            const gpsDisplay = item.gps === "A" ? "Active" : "Inactive";

            const vehicleStatus = getBackendStatus(item);

            return {
              no: (
                <MDBox display="flex" alignItems="center" gap={0.5}>
                  <Icon
                    fontSize="small"
                    color={vehicleStatus === "offline" ? "error" : "success"}
                  >
                    {vehicleStatus === "offline" ? "offline_bolt" : "online_prediction"}
                  </Icon>
                  <MDTypography
                    variant="caption"
                    fontWeight="bold"
                    color={vehicleStatus === "offline" ? "error" : "success"}
                  >
                    {index + 1}
                  </MDTypography>
                </MDBox>
              ),
              accountName: (
                <DataCell text={item.accountName || "N/A"} fontWeight="medium" />
              ),
              vehicleNo: (
                <DataCell
                  text={item.vehnum || item.name || "N/A"}
                  fontWeight="bold"
                  isClickable
                  onClick={() => handleImeiClick(imei, item.accid)}
                />
              ),
              gpsStatus: <Status status={gpsDisplay} />,
              ignitionStatus: <Ignition status={item.ign === "Y" ? 1 : 0} />,
              imei: (
                <DataCell
                  text={imei}
                  isClickable
                  onClick={() => handleImeiClick(imei, item.accid)}
                />
              ),
              simNo: <DataCell text={item.simNo || "N/A"} />,
              date: <DataCell text={item.devTs || item.cts || "N/A"} />,
              latitude: (
                <DataCell text={item.lat ? `${item.lat.toFixed(6)}°` : "N/A"} />
              ),
              longitude: (
                <DataCell text={item.lng ? `${item.lng.toFixed(6)}°` : "N/A"} />
              ),
              address: <AddressCell item={item} />,
              avgSpeed: (
                <DataCell
                  text={item.avg !== null && item.avg !== 0 ? item.avg : "N/A"}
                />
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
              _speed: speed,
              _status: vehicleStatus,
            };
          });
          setAllVtsRows(fetchedRows);
        } else {
          setAllVtsRows([]);
        }
      });
    },
    [handleImeiClick]
  );

  const fetchElkData = useCallback(
    (currentAccountId) => {
      ApiService.getDashboardData({ accid: currentAccountId }, (res) => {
        if (res?.data?.resultCode === 1 && res?.data?.data?.data?.ELK?.available) {
          const devices = res.data.data.data.ELK.available;
          const fetchedRows = devices.map((item, index) => {
            const imei = item.imei || "N/A";
            const speed = Number(item.speed) || 0;
            const elkTypeStatus = item.type;
            const isLocked = elkTypeStatus === "L";
            const isOnline = item.ign === "Y";

            const status = getBackendStatus(item);

            return {
              no: (
                <MDBox display="flex" alignItems="center" gap={0.5}>
                  <Icon fontSize="small" color={isLocked ? "error" : "success"}>
                    {isLocked ? "offline_bolt" : "online_prediction"}
                  </Icon>
                  <MDTypography
                    variant="caption"
                    fontWeight="bold"
                    color={isLocked ? "error" : "success"}
                  >
                    {index + 1}
                  </MDTypography>
                </MDBox>
              ),
              accountName: (
                <DataCell text={item.accountName || "N/A"} fontWeight="medium" />
              ),
              vehicleNo: (
                <DataCell
                  text={item.vehnum || item.name || "N/A"}
                  fontWeight="bold"
                  isClickable
                  onClick={() => handleImeiClick(imei, item.accid)}
                />
              ),
              imei: (
                <DataCell
                  text={imei}
                  isClickable
                  onClick={() => handleImeiClick(imei, item.accid)}
                />
              ),
              simNo: <DataCell text={item.simNo || "N/A"} />,
              date: <DataCell text={item.devTs || item.cts || "N/A"} />,
              latitude: (
                <DataCell text={item.lat ? `${item.lat.toFixed(6)}°` : "N/A"} />
              ),
              longitude: (
                <DataCell text={item.lng ? `${item.lng.toFixed(6)}°` : "N/A"} />
              ),
              address: <AddressCell item={item} />,
              currentSpeed: (
                <DataCell
                  text={`${speed} km/h`}
                  color={speed > 0 ? "success" : "text"}
                  fontWeight="bold"
                />
              ),
              gpsStatus: (
                <Status status={item.gps === "A" ? "Active" : "Inactive"} />
              ),
              lockUnlock: (
                <LockUnlock
                  isLocked={isLocked}
                  deviceStatus={item.status || null}
                  elkType={elkTypeStatus}
                />
              ),
              checkbox: null,
              _imei: imei,
              _isLockedInitial: isLocked,
              _isOnline: isOnline,
              _status: status, 
            };
          });
          setAllElkRows(fetchedRows);
        } else {
          setAllElkRows([]);
        }
      });
    },
    [handleImeiClick]
  );

  const fetchUnreachableData = useCallback(
    (currentAccountId) => {
      ApiService.getUnreachableDevices({ accid: currentAccountId }, (res) => {
        const devices = res?.data?.data || [];
        if (res?.data?.resultCode === 1 && Array.isArray(devices)) {
          const fetchedRows = devices.map((item, index) => {
            const imei = item.imei || "N/A";
            return {
              no: <DataCell text={index + 1} fontWeight="bold" />,
              accountName: (
                <DataCell text={item.accountName || "N/A"} fontWeight="medium" />
              ),
              accountId: <DataCell text={item.accid || "N/A"} />,
              vehicleNo: (
                <DataCell
                  text={item.vehnum || "N/A"}
                  fontWeight="bold"
                  isClickable
                  onClick={() => handleImeiClick(imei, item.accid)}
                />
              ),
              imei: (
                <DataCell
                  text={imei}
                  isClickable
                  onClick={() => handleImeiClick(imei, item.accid)}
                />
              ),
              deviceType: <DataCell text={item.deviceType || "N/A"} />,
              createdOn: <DataCell text={item.createdOn || "N/A"} />,
            };
          });
          setUnreachableRows(fetchedRows);
        } else {
          setUnreachableRows([]);
        }
      });
    },
    [handleImeiClick]
  );

  useEffect(() => {
    setLoading(true);
    fetchVtsData(accountId);
    fetchElkData(accountId);
    fetchUnreachableData(accountId);
    const t = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(t);
  }, [accountId, fetchVtsData, fetchElkData, fetchUnreachableData]);


  const {
    filteredVts,
    filteredElk,
    filteredUnreachable,
    vtsAllCount,
    vtsMotionCount,
    vtsIdleCount,
    vtsStoppedCount,
    vtsOfflineCount,
    elkAllCount,
    elkMotionCount,
    elkIdleCount,
    elkStoppedCount,
    elkOfflineCount,
  } = useMemo(() => {
    const matchesSearch = (row) => {
      if (!searchTerm) return true;
      const term = searchTerm.toLowerCase();
      const fields = [
        row.accountName?.props?.text,
        row.vehicleNo?.props?.text,
        row._imei,
        row.address?.props?.children?.props?.children,
      ].filter(Boolean);
      return fields.some((f) => String(f).toLowerCase().includes(term));
    };

    const vtsFilteredByStatus = allVtsRows.filter((row) => {
      if (vtsTab === "all") return true;
      if (vtsTab === "motion") return row._status === "motion";
      if (vtsTab === "idle") return row._status === "idle";
      if (vtsTab === "stopped") return row._status === "stopped";
      if (vtsTab === "offline") return row._status === "offline";
      return true;
    });

    const vts = vtsFilteredByStatus.filter(matchesSearch).map((row) => ({
      ...row,
      checkbox: (
        <MDBox display="flex" justifyContent="center">
          <Checkbox
            checked={!!selectedRows[row._imei]}
            onChange={() => handleToggleSelect(row._imei)}
            color="primary"
            sx={checkboxBaseSx}
          />
        </MDBox>
      ),
    }));

    const elkFilteredByStatus = allElkRows.filter((row) => {
      if (elkTab === "all") return true;
      if (elkTab === "motion") return row._status === "motion";
      if (elkTab === "idle") return row._status === "idle";
      if (elkTab === "stopped") return row._status === "stopped";
      if (elkTab === "offline") return row._status === "offline";
      return true;
    });

    const elk = elkFilteredByStatus.filter(matchesSearch).map((row) => ({
      ...row,
      checkbox: (
        <MDBox display="flex" justifyContent="center">
          <Checkbox
            checked={!!selectedRows[row._imei]}
            onChange={() => handleToggleSelect(row._imei)}
            color="primary"
            sx={checkboxBaseSx}
          />
        </MDBox>
      ),
    }));

    const unreachable = unreachableRows.filter((row) => {
      if (!searchTerm) return true;
      const term = searchTerm.toLowerCase();
      const fields = [
        row.accountName?.props?.text,
        row.vehicleNo?.props?.text,
        row.imei?.props?.text,
      ].filter(Boolean);
      return fields.some((f) => String(f).toLowerCase().includes(term));
    });

    const vtsAll = allVtsRows.length;
    const vtsMotion = allVtsRows.filter((row) => row._status === "motion").length;
    const vtsIdle = allVtsRows.filter((row) => row._status === "idle").length;
    const vtsStopped = allVtsRows.filter((row) => row._status === "stopped").length;
    const vtsOffline = allVtsRows.filter((row) => row._status === "offline").length;

    const elkAll = allElkRows.length;
    const elkMotion = allElkRows.filter((row) => row._status === "motion").length;
    const elkIdle = allElkRows.filter((row) => row._status === "idle").length;
    const elkStopped = allElkRows.filter((row) => row._status === "stopped").length;
    const elkOffline = allElkRows.filter((row) => row._status === "offline").length;

    return {
      filteredVts: vts,
      filteredElk: elk,
      filteredUnreachable: unreachable,
      vtsAllCount: vtsAll,
      vtsMotionCount: vtsMotion,
      vtsIdleCount: vtsIdle,
      vtsStoppedCount: vtsStopped,
      vtsOfflineCount: vtsOffline,
      elkAllCount: elkAll,
      elkMotionCount: elkMotion,
      elkIdleCount: elkIdle,
      elkStoppedCount: elkStopped,
      elkOfflineCount: elkOffline,
    };
  }, [
    allVtsRows,
    allElkRows,
    unreachableRows,
    searchTerm,
    selectedRows,
    handleToggleSelect,
    vtsTab,
    elkTab,
  ]);


  const handleBulkUnlockClick = () => {
    closeMenu();
    const imeisSelected = Object.keys(selectedRows).filter((imei) => selectedRows[imei]);
    if (imeisSelected.length === 0) {
      alert("No devices selected.");
      return;
    }

    const lockedImeisSet = new Set(
      allElkRows.filter((row) => row._isLockedInitial).map((row) => row._imei)
    );
    const selectedLockedCount = imeisSelected.filter((i) => lockedImeisSet.has(i)).length;
    const action = selectedLockedCount > 0 ? "unlock" : "lock";

    setUnlockDialog({
      open: true,
      imei: null,
      vehicleNo: "",
      isBulk: true,
      bulkCount: imeisSelected.length,
      bulkImeis: imeisSelected,
      bulkLockedCount: selectedLockedCount,
      action,
    });
  };

  const handleConfirmUnlock = () => {
    const { imei, isBulk, bulkImeis, action } = unlockDialog;
    setUnlockDialog((p) => ({ ...p, open: false }));

    const imeisToSend = isBulk ? bulkImeis : imei ? [imei] : [];
    if (!imeisToSend.length) return;

    const command = action === "lock" ? "LOCK" : "UNLOCK";

    imeisToSend.forEach((targetImei) => {
      ApiService.sendCommand({ imei: targetImei, command }, () => {});
    });

    alert(`${command} command initiated for ${imeisToSend.length} device(s).`);

    if (isBulk) setSelectedRows({});

    fetchVtsData(accountId);
    fetchElkData(accountId);
  };

  const handleExportData = (format) => {
    closeMenu();

    const allRows = [...filteredVts, ...filteredElk, ...filteredUnreachable];

    const dataToExport = allRows.map((row) => ({
      accountName: row.accountName?.props?.text || "",
      vehnum: row.vehicleNo?.props?.text || "",
      imei: row._imei || row.imei?.props?.text || "",
      simNo: row.simNo?.props?.text || "",
      devTs: row.date?.props?.text || "",
      address: row.address?.props?.item?.address || "N/A",
      lat: row.latitude?.props?.text || "",
      lng: row.longitude?.props?.text || "",
    }));

    if (!dataToExport.length) {
      alert("No data available to export.");
      return;
    }

    const filename = `Dashboard_Report_${new Date().toISOString().split("T")[0]}`;

    switch (format) {
      case "csv":
        exportCSV(dataToExport, `${filename}.csv`);
        break;
      case "excel":
        exportExcel(dataToExport, `${filename}.xlsx`);
        break;
      case "pdf":
        exportPDF(dataToExport, `${filename}.pdf`);
        break;
      default:
        break;
    }
  };

  if (loading) {
    return (
      <Card>
        <MDBox
          p={3}
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="200px"
        >
          <CircularProgress color="info" size={30} />
          <MDTypography variant="h6" ml={2}>
            Loading Dashboard...
          </MDTypography>
        </MDBox>
      </Card>
    );
  }

  const selectedCount = Object.values(selectedRows).filter(Boolean).length;

  const dialogTitle =
    unlockDialog.action === "lock" ? "Confirm Lock?" : "Confirm Unlock?";

  const dialogContent = unlockDialog.isBulk ? (
    <>
      Are you sure you want to <strong>{unlockDialog.action}</strong>{" "}
      <strong>{unlockDialog.bulkCount}</strong> selected devices?
    </>
  ) : (
    <>
      Are you sure you want to <strong>{unlockDialog.action}</strong> device{" "}
      <strong>{unlockDialog.vehicleNo}</strong> (IMEI: {unlockDialog.imei})?
    </>
  );

  return (
    <MDBox>
      <Card sx={{ mb: 1 }}>
        <MDBox p={2} display="flex" justifyContent="space-between" alignItems="center">
          <MDBox>
            <MDTypography variant="h5" fontWeight="medium">
              Trips List
            </MDTypography>
            <MDTypography variant="button" color="text">
              {filteredVts.length + filteredElk.length + filteredUnreachable.length} total
              rows
            </MDTypography>
          </MDBox>

          <MDBox display="flex" gap={2} alignItems="center">
            {selectedCount > 0 && (
              <MDButton
                size="small"
                variant="gradient"
                color="error"
                onClick={handleBulkUnlockClick}
              >
                Unlock / Lock Selected ({selectedCount})
              </MDButton>
            )}

            <TextField
              size="small"
              variant="outlined"
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

            <FormControl variant="outlined" size="small" sx={{ minWidth: 90 }}>
              <Select
                value={pageSize}
                onChange={(e) => setPageSize(e.target.value)}
                displayEmpty
                sx={{ height: "40px" }}
              >
                <MenuItem value={10}>10</MenuItem>
                <MenuItem value={20}>20</MenuItem>
                <MenuItem value={50}>50</MenuItem>
                <MenuItem value={100}>100</MenuItem>
              </Select>
            </FormControl>

            <IconButton onClick={openMenu}>
              <Icon>more_vert</Icon>
            </IconButton>
            <Menu anchorEl={menu} open={Boolean(menu)} onClose={closeMenu}>
              <MenuItem onClick={() => handleExportData("csv")}>Export CSV</MenuItem>
              <MenuItem onClick={() => handleExportData("excel")}>Export Excel</MenuItem>
              <MenuItem onClick={() => handleExportData("pdf")}>Export PDF</MenuItem>
            </Menu>
          </MDBox>
        </MDBox>
      </Card>

      <MDBox sx={scrollContainerSx}>
        <Card sx={stickyCardSx(10)}>
          <MDBox p={3} pb={0}>
            <MDBox display="flex" alignItems="center" justifyContent="space-between" mb={2}>
              <MDBox display="flex" alignItems="center" gap={1}>
                <Icon color="info" fontSize="large">
                  local_shipping
                </Icon>
                <MDBox>
                  <MDTypography variant="h6" color="info">
                    VTS Vehicles
                  </MDTypography>
                  <MDTypography variant="caption" color="text">
                    Live Trip Report
                  </MDTypography>
                </MDBox>
              </MDBox>

              <MDBox display="flex" alignItems="center" gap={2}>
                <MDTypography variant="button" fontWeight="bold">
                  {filteredVts.length} rows
                </MDTypography>

                <MDBox
                  display="flex"
                  alignItems="center"
                  gap={0.5}
                  sx={{
                    border: "1px solid #e0e0e0",
                    borderRadius: "8px",
                    padding: "2px",
                    backgroundColor: "#f5f5f5",
                    flexWrap: "nowrap",
                    overflowX: "auto",
                  }}
                >
                  <MDButton
                    size="small"
                    variant={vtsTab === "all" ? "gradient" : "text"}
                    color={vtsTab === "all" ? "info" : "dark"}
                    onClick={() => setVtsTab("all")}
                    sx={btnStyle}
                  >
                    All ({vtsAllCount})
                  </MDButton>

                  <MDButton
                    size="small"
                    variant={vtsTab === "motion" ? "gradient" : "text"}
                    color={vtsTab === "motion" ? "success" : "dark"}
                    onClick={() => setVtsTab("motion")}
                    sx={btnStyle}
                  >
                    <Icon fontSize="small">directions_run</Icon>
                    Motion ({vtsMotionCount})
                  </MDButton>

                  <MDButton
                    size="small"
                    variant={vtsTab === "idle" ? "gradient" : "text"}
                    color={vtsTab === "idle" ? "warning" : "dark"}
                    onClick={() => setVtsTab("idle")}
                    sx={btnStyle}
                  >
                    <Icon fontSize="small">hourglass_empty</Icon>
                    Idle ({vtsIdleCount})
                  </MDButton>

                  <MDButton
                    size="small"
                    variant={vtsTab === "stopped" ? "gradient" : "text"}
                    color={vtsTab === "stopped" ? "error" : "dark"}
                    onClick={() => setVtsTab("stopped")}
                    sx={btnStyle}
                  >
                    <Icon fontSize="small">stop</Icon>
                    Stopped ({vtsStoppedCount})
                  </MDButton>

                  <MDButton
                    size="small"
                    variant={vtsTab === "offline" ? "gradient" : "text"}
                    color={vtsTab === "offline" ? "error" : "dark"}
                    onClick={() => setVtsTab("offline")}
                    sx={btnStyle}
                  >
                    <Icon fontSize="small">offline_bolt</Icon>
                    Offline ({vtsOfflineCount})
                  </MDButton>
                </MDBox>
              </MDBox>
            </MDBox>
          </MDBox>

          <MDBox p={3}>
            <DataTable
              table={{ columns: VTS_COLUMNS, rows: filteredVts }}
              isSorted={false}
              entriesPerPage={{ defaultValue: pageSize, entries: [pageSize] }}
              showTotalEntries
              pagination={{ variant: "gradient", color: "info" }}
              noEndBorder
              sx={tablePaginationHideSelectSx}
            />
          </MDBox>
        </Card>

        <Card sx={stickyCardSx(20)}>
          <MDBox p={3} pb={0}>
            <MDBox display="flex" alignItems="center" justifyContent="space-between" mb={2}>
              <MDBox display="flex" alignItems="center" gap={1}>
                <Icon color="warning" fontSize="large">
                  lock
                </Icon>
                <MDBox>
                  <MDTypography variant="h6" color="warning">
                    Padlock Devices
                  </MDTypography>
                  <MDTypography variant="caption" color="text">
                    Lock status overview
                  </MDTypography>
                </MDBox>
              </MDBox>

              <MDBox display="flex" alignItems="center" gap={2}>
                <MDTypography variant="button" fontWeight="bold">
                  {filteredElk.length} rows
                </MDTypography>

                <MDBox
                  display="flex"
                  gap={0.5}
                  sx={{
                    border: "1px solid #e0e0e0",
                    borderRadius: "8px",
                    padding: "2px",
                    backgroundColor: "#f5f5f5",
                  }}
                >
                  <MDButton
                    size="small"
                    variant={elkTab === "all" ? "gradient" : "text"}
                    color={elkTab === "all" ? "warning" : "dark"}
                    onClick={() => setElkTab("all")}
                    sx={btnStyle}
                  >
                    All ({elkAllCount})
                  </MDButton>

                  <MDButton
                    size="small"
                    variant={elkTab === "motion" ? "gradient" : "text"}
                    color={elkTab === "motion" ? "success" : "dark"}
                    onClick={() => setElkTab("motion")}
                    sx={btnStyle}
                  >
                    <Icon fontSize="small">directions_run</Icon>
                    Motion ({elkMotionCount})
                  </MDButton>

                  <MDButton
                    size="small"
                    variant={elkTab === "idle" ? "gradient" : "text"}
                    color={elkTab === "idle" ? "warning" : "dark"}
                    onClick={() => setElkTab("idle")}
                    sx={btnStyle}
                  >
                    <Icon fontSize="small">hourglass_empty</Icon>
                    Idle ({elkIdleCount})
                  </MDButton>

                  <MDButton
                    size="small"
                    variant={elkTab === "stopped" ? "gradient" : "text"}
                    color={elkTab === "stopped" ? "error" : "dark"}
                    onClick={() => setElkTab("stopped")}
                    sx={btnStyle}
                  >
                    <Icon fontSize="small">stop</Icon>
                    Stopped ({elkStoppedCount})
                  </MDButton>

                  <MDButton
                    size="small"
                    variant={elkTab === "offline" ? "gradient" : "text"}
                    color={elkTab === "offline" ? "error" : "dark"}
                    onClick={() => setElkTab("offline")}
                    sx={btnStyle}
                  >
                    <Icon fontSize="small">offline_bolt</Icon>
                    Offline ({elkOfflineCount})
                  </MDButton>
                </MDBox>
              </MDBox>
            </MDBox>
          </MDBox>

          <MDBox p={3}>
            <DataTable
              table={{ columns: ELK_COLUMNS, rows: filteredElk }}
              isSorted={false}
              entriesPerPage={{ defaultValue: pageSize, entries: [pageSize] }}
              showTotalEntries
              pagination={{ variant: "gradient", color: "warning" }}
              noEndBorder
              sx={tablePaginationHideSelectSx}
            />
          </MDBox>
        </Card>

        <Card sx={stickyCardSx(30)}>
          <MDBox p={3} pb={0}>
            <MDBox display="flex" alignItems="center" justifyContent="space-between">
              <MDBox display="flex" alignItems="center" gap={1}>
                <Icon color="error" fontSize="large">
                  signal_wifi_off
                </Icon>
                <MDBox>
                  <MDTypography variant="h6" color="error">
                    Unreachable Devices
                  </MDTypography>
                  <MDTypography variant="caption" color="text">
                    Offline / no data
                  </MDTypography>
                </MDBox>
              </MDBox>
              <MDTypography variant="button" fontWeight="bold">
                {filteredUnreachable.length} rows
              </MDTypography>
            </MDBox>
          </MDBox>

          <MDBox p={3}>
            <DataTable
              table={{ columns: UNREACHABLE_COLUMNS, rows: filteredUnreachable }}
              isSorted={false}
              entriesPerPage={{ defaultValue: pageSize, entries: [pageSize] }}
              showTotalEntries
              pagination={{ variant: "gradient", color: "error" }}
              noEndBorder
              sx={tablePaginationHideSelectSx}
            />
          </MDBox>
        </Card>
      </MDBox>

      <Dialog
        open={unlockDialog.open}
        onClose={() => setUnlockDialog((p) => ({ ...p, open: false }))}
      >
        <DialogTitle>{dialogTitle}</DialogTitle>
        <DialogContent>
          <DialogContentText>{dialogContent}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <MDButton
            onClick={() => setUnlockDialog((p) => ({ ...p, open: false }))}
            color="dark"
          >
            Cancel
          </MDButton>
          <MDButton onClick={handleConfirmUnlock} color="info" autoFocus>
            Confirm
          </MDButton>
        </DialogActions>
      </Dialog>
    </MDBox>
  );
}

Projects.propTypes = {
  accountId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
};

export default Projects;
