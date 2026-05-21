import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
// import ApiService from "../../../../services/ApiService";

import Card from "@mui/material/Card";
import Icon from "@mui/material/Icon";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
// import CircularProgress from "@mui/material/CircularProgress";
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
  filterToggleBoxSx,
  filterToggleButtonSx,
  tableCardSx,
} from "./Projects.styles";

// helpers / small components

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

const PowerStatus = ({ status }) => {
  const isConnected = status === "Y";
  const text = isConnected ? "Connected" : "Disconnected";
  const color = isConnected ? "success" : "error";

  return (
    <MDTypography variant="caption" color={color} fontWeight="bold">
      {text}
    </MDTypography>
  );
};

PowerStatus.propTypes = { status: PropTypes.string };

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
        tooltipText = isLocked ? "Trip Status: Locked (Ready to Unlock)" : "Trip Status: Unlocked";
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

// columns

const VTS_COLUMNS = [
  { Header: "No", accessor: "no", width: "5%", align: "left" },
  { Header: "Acc Name", accessor: "accountName", width: "12%", align: "left" },
  { Header: "VEHICLE NO.", accessor: "vehicleNo", width: "10%", align: "left" },
  { Header: "IMEI", accessor: "imei", width: "12%", align: "center" },
  { Header: "SIM NO", accessor: "simNo", width: "12%", align: "center" },
  { Header: "POWER", accessor: "power", width: "12%", align: "center" },
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
  ...VTS_COLUMNS.slice(0, 7),
  { Header: "GPS STATUS", accessor: "gpsStatus", width: "8%", align: "center" },
  { Header: "CURRENT SPEED", accessor: "currentSpeed", width: "8%", align: "center" },
  { Header: "Lock Status", accessor: "lockUnlock", width: "8%", align: "center" },
  { Header: "Select", accessor: "checkbox", width: "5%", align: "center" },
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

// util to infer backend status (used for vts/elk tabs)
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

// --- Main Component ---

function Projects({
  accountId,
  vtsData = [],
  elkData = [],
  unreachableData = [],
  lastRefreshTime,
  isRefreshing,
}) {
  const navigate = useNavigate();

  const [menu, setMenu] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  // MAIN TABS: vts / elk / unreachable
  const [tripFilterType, setTripFilterType] = useState("vts");

  // for checkboxes in ELK
  const [selectedRows, setSelectedRows] = useState({});

  // pagination
  const [pageSize, setPageSize] = useState(10);

  // ─── CHANGED: single-select status filter (string, not array) ───────────────
  // "all" | "motion" | "idle" | "stopped" | "offline"
  const [vtsTab, setVtsTab] = useState("all");
  const [elkTab, setElkTab] = useState("all");
  // ────────────────────────────────────────────────────────────────────────────

  // rows mapped from props
  const [allVtsRows, setAllVtsRows] = useState([]);
  const [allElkRows, setAllElkRows] = useState([]);
  const [unreachableRows, setUnreachableRows] = useState([]);

  // dialog for lock/unlock
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

  // Map props to rows
  useEffect(() => {
    // VTS rows
    const vtsRows = (vtsData || []).map((item, index) => {
      const imei = item.imei || "N/A";
      const speed = Number(item.speed) || 0;
      const isLocked = speed === 0 && item.ign === "Y";
      const gpsDisplay = item.gps === "A" ? "Active" : "Inactive";
      const vehicleStatus = getBackendStatus(item);

      return {
        no: (
          <MDBox display="flex" alignItems="center" gap={0.5}>
            <Icon fontSize="small" color={vehicleStatus === "offline" ? "error" : "success"}>
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
        accountName: <DataCell text={item.accountName || "N/A"} fontWeight="medium" />,
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
          <DataCell text={imei} isClickable onClick={() => handleImeiClick(imei, item.accid)} />
        ),
        simNo: <DataCell text={item.simNo || "N/A"} />,
        power: <PowerStatus status={item.powsts} />,
        date: <DataCell text={item.devTs || item.cts || "N/A"} />,
        latitude: <DataCell text={item.lat ? `${item.lat.toFixed(6)}°` : "N/A"} />,
        longitude: <DataCell text={item.lng ? `${item.lng.toFixed(6)}°` : "N/A"} />,
        address: <AddressCell item={item} />,
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
        _speed: speed,
        _status: vehicleStatus,
        _raw: item,
      };
    });
    setAllVtsRows(vtsRows);

    // ELK rows
    const elkRows = (elkData || []).map((item, index) => {
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
        accountName: <DataCell text={item.accountName || "N/A"} fontWeight="medium" />,
        vehicleNo: (
          <DataCell
            text={item.vehnum || item.name || "N/A"}
            fontWeight="bold"
            isClickable
            onClick={() => handleImeiClick(imei, item.accid)}
          />
        ),
        imei: (
          <DataCell text={imei} isClickable onClick={() => handleImeiClick(imei, item.accid)} />
        ),
        simNo: <DataCell text={item.simNo || "N/A"} />,
        power: <PowerStatus status={item.powsts} />,
        date: <DataCell text={item.devTs || item.cts || "N/A"} />,
        latitude: <DataCell text={item.lat ? `${item.lat.toFixed(6)}°` : "N/A"} />,
        longitude: <DataCell text={item.lng ? `${item.lng.toFixed(6)}°` : "N/A"} />,
        address: <AddressCell item={item} />,
        currentSpeed: (
          <DataCell
            text={`${speed} km/h`}
            color={speed > 0 ? "success" : "text"}
            fontWeight="bold"
          />
        ),
        gpsStatus: <Status status={item.gps === "A" ? "Active" : "Inactive"} />,
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
        _raw: item,
      };
    });
    setAllElkRows(elkRows);

    // UNREACHABLE rows
    const unreachableRowsMapped = (unreachableData || []).map((item, index) => {
      const imei = item.imei || "N/A";
      return {
        no: <DataCell text={index + 1} fontWeight="bold" />,
        accountName: <DataCell text={item.accountName || "N/A"} fontWeight="medium" />,
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
          <DataCell text={imei} isClickable onClick={() => handleImeiClick(imei, item.accid)} />
        ),
        deviceType: <DataCell text={item.deviceType || "N/A"} />,
        createdOn: <DataCell text={item.createdOn || "N/A"} />,
        _raw: item,
      };
    });
    setUnreachableRows(unreachableRowsMapped);
  }, [vtsData, elkData, unreachableData, handleImeiClick]);

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
        row.address?.props?.item?.address,
      ].filter(Boolean);
      return fields.some((f) => String(f).toLowerCase().includes(term));
    };

    // ─── CHANGED: single-select filter — compare string directly ──────────────
    const vtsFilteredByStatus = allVtsRows.filter((row) =>
      vtsTab === "all" ? true : row._status === vtsTab
    );

    const vts = vtsFilteredByStatus.filter(matchesSearch).map((row) => ({
      ...row,
      checkbox: null,
    }));

    const elkFilteredByStatus = allElkRows.filter((row) =>
      elkTab === "all" ? true : row._status === elkTab
    );
    // ─────────────────────────────────────────────────────────────────────────

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
    vtsTab,   // CHANGED: was vtsTabs
    elkTab,   // CHANGED: was elkTabs
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
      // ApiService.sendCommand({ imei: targetImei, command }, () => {});
    });

    alert(`${command} command initiated for ${imeisToSend.length} device(s).`);

    if (isBulk) setSelectedRows({});
  };

  // EXPORT BASED ON ACTIVE MAIN TAB
  const handleExport = (format) => {
    closeMenu();

    let rawData;
    let fileName;
    let typeKey;

    if (tripFilterType === "vts") {
      rawData = vtsData;
      fileName = `VTS_Report.${format === "csv" ? "csv" : format === "excel" ? "xlsx" : "pdf"}`;
      typeKey = "vts";
    } else if (tripFilterType === "elk") {
      rawData = elkData;
      fileName = `Padlock_Report.${format === "csv" ? "csv" : format === "excel" ? "xlsx" : "pdf"}`;
      typeKey = "elk";
    } else {
      rawData = unreachableData;
      fileName = `Unreachable_Report.${
        format === "csv" ? "csv" : format === "excel" ? "xlsx" : "pdf"
      }`;
      typeKey = "unreachable";
    }

    const searchFilteredRaw = (rawData || []).filter((item) => {
      let searchStr;
      if (tripFilterType === "unreachable") {
        searchStr = `${item.accountName} ${item.vehnum} ${item.imei}`.toLowerCase();
      } else {
        searchStr = `${item.accountName} ${item.vehnum || item.name} ${item.imei}`.toLowerCase();
      }
      return !searchTerm || searchStr.includes(searchTerm.toLowerCase());
    });

    if (!searchFilteredRaw.length) {
      alert("No data available to export.");
      return;
    }

    if (format === "csv") {
      exportCSV(searchFilteredRaw, fileName);
    } else if (format === "excel") {
      exportExcel(searchFilteredRaw, fileName);
    } else if (format === "pdf") {
      exportPDF(searchFilteredRaw, fileName, typeKey);
    }
  };

  const selectedCount = Object.values(selectedRows).filter(Boolean).length;

  const dialogTitle = unlockDialog.action === "lock" ? "Confirm Lock?" : "Confirm Unlock?";

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

  const activeColumns =
    tripFilterType === "vts"
      ? VTS_COLUMNS
      : tripFilterType === "elk"
        ? ELK_COLUMNS
        : UNREACHABLE_COLUMNS;

  const activeRows =
    tripFilterType === "vts"
      ? filteredVts
      : tripFilterType === "elk"
        ? filteredElk
        : filteredUnreachable;

  return (
    <Card sx={tableCardSx}>
      <MDBox px={3} pt={3}>
        {/* MAIN TAB SWITCHER: VTS / PADLOCK / UNREACHABLE */}
        <MDBox display="inline-flex" sx={filterToggleBoxSx} mb={2}>
          {["vts", "elk", "unreachable"].map((type) => (
            <MDButton
              key={type}
              variant={tripFilterType === type ? "contained" : "text"}
              color={type === "unreachable" ? "warning" : "info"}
              size="small"
              onClick={() => {
                setTripFilterType(type);
                setSelectedRows({});
                setVtsTab("all");   // CHANGED: reset to string "all"
                setElkTab("all");   // CHANGED: reset to string "all"
              }}
              sx={filterToggleButtonSx}
            >
              {type === "elk" ? "PADLOCK" : type.toUpperCase()}
            </MDButton>
          ))}
        </MDBox>

        <MDBox display="flex" justifyContent="space-between" alignItems="center">
          <MDTypography variant="h6">
            {tripFilterType === "vts"
              ? "Live Trip Report"
              : tripFilterType === "elk"
                ? "Padlock Devices"
                : "Unreachable Devices"}
            <MDTypography variant="button" color="text" ml={1}>
              ({activeRows.length} units)
            </MDTypography>
            {isRefreshing && (
              <MDTypography variant="button" color="info" ml={1}>
                Refreshing...
              </MDTypography>
            )}
          </MDTypography>

          <MDBox display="flex" gap={2} alignItems="center">
            {/* STATUS FILTERS — single select */}
            {tripFilterType === "vts" && (
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
                {/* CHANGED: onClick sets a single string, active check is === */}
                <MDButton
                  size="small"
                  variant={vtsTab === "all" ? "gradient" : "text"}
                  color={vtsTab === "all" ? "info" : "dark"}
                  onClick={() => setVtsTab("all")}
                >
                  All ({vtsAllCount})
                </MDButton>
                <MDButton
                  size="small"
                  variant={vtsTab === "motion" ? "gradient" : "text"}
                  color={vtsTab === "motion" ? "success" : "dark"}
                  onClick={() => setVtsTab("motion")}
                >
                  <Icon fontSize="small">directions_run</Icon>
                  Motion ({vtsMotionCount})
                </MDButton>
                <MDButton
                  size="small"
                  variant={vtsTab === "idle" ? "gradient" : "text"}
                  color={vtsTab === "idle" ? "warning" : "dark"}
                  onClick={() => setVtsTab("idle")}
                >
                  <Icon fontSize="small">hourglass_empty</Icon>
                  Idle ({vtsIdleCount})
                </MDButton>
                <MDButton
                  size="small"
                  variant={vtsTab === "stopped" ? "gradient" : "text"}
                  color={vtsTab === "stopped" ? "error" : "dark"}
                  onClick={() => setVtsTab("stopped")}
                >
                  <Icon fontSize="small">stop</Icon>
                  Stopped ({vtsStoppedCount})
                </MDButton>
                <MDButton
                  size="small"
                  variant={vtsTab === "offline" ? "gradient" : "text"}
                  color={vtsTab === "offline" ? "error" : "dark"}
                  onClick={() => setVtsTab("offline")}
                >
                  <Icon fontSize="small">offline_bolt</Icon>
                  Offline ({vtsOfflineCount})
                </MDButton>
              </MDBox>
            )}

            {tripFilterType === "elk" && (
              <MDBox
                display="flex"
                alignItems="center"
                gap={0.5}
                sx={{
                  border: "1px solid #e0e0e0",
                  borderRadius: "8px",
                  padding: "2px",
                  flexWrap: "nowrap",
                  overflowX: "auto",
                }}
              >
                {/* CHANGED: same pattern for elk */}
                <MDButton
                  size="small"
                  variant={elkTab === "all" ? "gradient" : "text"}
                  color={elkTab === "all" ? "warning" : "dark"}
                  onClick={() => setElkTab("all")}
                >
                  All ({elkAllCount})
                </MDButton>
                <MDButton
                  size="small"
                  variant={elkTab === "motion" ? "gradient" : "text"}
                  color={elkTab === "motion" ? "success" : "dark"}
                  onClick={() => setElkTab("motion")}
                >
                  <Icon fontSize="small">directions_run</Icon>
                  Motion ({elkMotionCount})
                </MDButton>
                <MDButton
                  size="small"
                  variant={elkTab === "idle" ? "gradient" : "text"}
                  color={elkTab === "idle" ? "warning" : "dark"}
                  onClick={() => setElkTab("idle")}
                >
                  <Icon fontSize="small">hourglass_empty</Icon>
                  Idle ({elkIdleCount})
                </MDButton>
                <MDButton
                  size="small"
                  variant={elkTab === "offline" ? "gradient" : "text"}
                  color={elkTab === "offline" ? "error" : "dark"}
                  onClick={() => setElkTab("offline")}
                >
                  <Icon fontSize="small">offline_bolt</Icon>
                  Offline ({elkOfflineCount})
                </MDButton>
              </MDBox>
            )}

            {tripFilterType === "elk" && selectedCount > 0 && (
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
            <Menu anchorEl={menu} open={Boolean(menu)} onClose={() => setMenu(null)}>
              <MenuItem onClick={() => handleExport("csv")}>Export CSV</MenuItem>
              <MenuItem onClick={() => handleExport("excel")}>Export Excel</MenuItem>
              <MenuItem onClick={() => handleExport("pdf")}>Export PDF</MenuItem>
            </Menu>
          </MDBox>
        </MDBox>
      </MDBox>

      <MDBox p={2}>
        <DataTable
          table={{ columns: activeColumns, rows: activeRows }}
          isSorted={false}
          entriesPerPage={{ defaultValue: pageSize, entries: [pageSize] }}
          showTotalEntries
          pagination={{ variant: "gradient", color: "info" }}
          noEndBorder
          sx={tablePaginationHideSelectSx}
        />
      </MDBox>

      <Dialog
        open={unlockDialog.open}
        onClose={() => setUnlockDialog({ ...unlockDialog, open: false })}
      >
        <DialogTitle>{dialogTitle}</DialogTitle>
        <DialogContent>
          <DialogContentText>{dialogContent}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <MDButton onClick={() => setUnlockDialog({ ...unlockDialog, open: false })}>
            Cancel
          </MDButton>
          <MDButton onClick={handleConfirmUnlock} color="info">
            Confirm
          </MDButton>
        </DialogActions>
      </Dialog>
    </Card>
  );
}

Projects.propTypes = {
  accountId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  vtsData: PropTypes.arrayOf(PropTypes.object),
  elkData: PropTypes.arrayOf(PropTypes.object),
  unreachableData: PropTypes.arrayOf(PropTypes.object),
  lastRefreshTime: PropTypes.number,
  isRefreshing: PropTypes.bool,
};

export default Projects;
