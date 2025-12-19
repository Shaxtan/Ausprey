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
  filterToggleBoxSx,
  filterToggleButtonSx,
  unreachableToggleButtonSx,
  tableCardSx,
  tablePaginationHideSelectSx,
  clickableTextSx,
  addressMapLinkSx,
} from "./Projects.styles";

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
      tooltipText = "**Device Status: LOCKED (Ready to Unlock)**";
    } else {
      iconName = "lock_open";
      color = "error";
      tooltipText = "**Device Status: UNLOCKED**";
    }
  } else {
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
  const [pageSize, setPageSize] = useState(10);

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

  const handlePageSizeChange = (event) => {
    setPageSize(event.target.value);
  };

  const handleToggleSelect = useCallback((imei) => {
    setSelectedRows((prev) => ({ ...prev, [imei]: !prev[imei] }));
  }, []);

  const handleBulkUnlockClick = () => {
    closeMenu();

    // FIXED: Corrected the variable name consistency here
    const selectedImeis = Object.keys(selectedRows).filter((imei) => selectedRows[imei]);

    if (selectedImeis.length === 0) {
      alert("No devices selected. Please check the boxes next to the devices you want to act on.");
      return;
    }

    // Determine if we are performing a bulk Unlock or Lock based on the first selected device
    // (Or you can default to "unlock" as the primary action for the dialog title)
    const firstImei = selectedImeis[0];
    const deviceData = allElkRows.find((row) => row._imei === firstImei);
    const action = deviceData?._type === "L" ? "unlock" : "lock";

    setUnlockDialog({
      open: true,
      imei: null,
      vehicleNo: "",
      isBulk: true,
      bulkCount: selectedImeis.length,
      bulkImeis: selectedImeis,
      action: action,
    });
  };

  const handleImeiClick = useCallback(
    (imei, accId) => {
      if (!imei || imei === "N/A") {
        console.warn("Invalid IMEI clicked");
        return;
      }

      const targetAccountId = accId || accountId;

      navigate(`/live-track?imei=${imei}`, {
        state: {
          targetImei: imei,
          targetAccountId,
        },
      });
    },
    [navigate, accountId]
  );

  const handleExportData = (format) => {
    closeMenu();

    if (filteredRows.length === 0) {
      alert("No data available to export.");
      return;
    }

    let dataToExport = [];
    let reportType = "";
    let filenamePrefix = "";

    if (tripFilterType === "vts") {
      reportType = "VTS";
      filenamePrefix = "VTS_Report";
      dataToExport = filteredRows.map((row) => ({
        accountName: row.accountName.props.text || "N/A",
        vehnum: row.vehicleNo.props.text || "N/A",
        imei: row._imei || "N/A",
        simNo: row.simNo.props.text || "N/A",
        devTs: row.date.props.text || "N/A",
        address: row.address.props.item.address || "No Address",
        lat: row.latitude.props.text || "N/A",
        lng: row.longitude.props.text || "N/A",
        gps: row.gpsStatus.props.status || "Inactive",
        ign: row.ignitionStatus.props.status === 1 ? "On" : "Off",
        avg: row.avgSpeed?.props?.text || "N/A",
        speed: row.currentSpeed.props.text.replace(" km/h", "") || "0",
      }));
    } else if (tripFilterType === "elk") {
      reportType = "PADLOCK";
      filenamePrefix = "PADLOCK_Report";
      dataToExport = filteredRows.map((row) => ({
        accountName: row.accountName.props.text || "N/A",
        vehnum: row.vehicleNo.props.text || "N/A",
        imei: row._imei || "N/A",
        simNo: row.simNo.props.text || "N/A",
        devTs: row.date.props.text || "N/A",
        address: row.address.props.item.address || "No Address",
        lat: row.latitude.props.text || "N/A",
        lng: row.longitude.props.text || "N/A",
        speed: row.currentSpeed.props.text.replace(" km/h", "") || "0",
        lockStatus: row._type === "L" ? "Locked" : "Unlocked",
      }));
    } else if (tripFilterType === "unreachable") {
      reportType = "UNREACHABLE";
      filenamePrefix = "UNREACHABLE_Report";
      dataToExport = filteredRows.map((row) => ({
        accountName: row.accountName.props.text || "N/A",
        accountId: row.accountId.props.text || "N/A",
        vehnum: row.vehicleNo.props.text || "N/A",
        imei: row.imei.props.text || "N/A",
        deviceType: row.deviceType.props.text || "N/A",
        createdOn: row.createdOn.props.text || "N/A",
      }));
    }

    const dateStr = new Date().toISOString().split("T")[0];
    const filename = `${filenamePrefix}_${dateStr}.${
      format === "pdf" ? "pdf" : format === "excel" ? "xlsx" : "csv"
    }`;

    switch (format) {
      case "csv":
        exportCSV(dataToExport, filename);
        break;
      case "excel":
        exportExcel(dataToExport, filename);
        break;
      case "pdf":
        exportPDF(dataToExport, filename, reportType); // We'll update exportPDF to accept reportType
        break;
      default:
        break;
    }
  };

  const handleCloseUnlockDialog = () => {
    setUnlockDialog({
      open: false,
      imei: null,
      vehicleNo: "",
      isBulk: false,
      bulkCount: 0,
      bulkImeis: [],
      bulkLockedCount: 0,
      action: "unlock",
    });
  };

  const handleConfirmUnlock = () => {
    const { isBulk, bulkImeis, imei, action } = unlockDialog;
    handleCloseUnlockDialog();

    const targetImeis = isBulk ? bulkImeis : [imei];
    if (targetImeis.length === 0) return;

    // Build the array of command objects for the NEW API
    const commandsList = targetImeis.map((tImei) => {
      // Find the device type from our state
      const device = allElkRows.find((r) => r._imei === tImei);
      const currentType = device?._type || "U";

      // Requirement: L -> ULK, U -> LCK
      const commandCode = currentType === "L" ? "ULK" : "LCK";

      return {
        imei: tImei,
        deviceType: 0,
        code: commandCode,
        command: "",
        type: "",
        expiry: 0,
      };
    });

    // Call the new API endpoint
    ApiService.createDeviceCommand({ commands: commandsList }, (res) => {
      if (res?.data?.resultCode === 1) {
        alert("Command(s) sent successfully!");
        // Refresh the table to show updated status
        if (tripFilterType === "elk") fetchElkData(accountId);
        setSelectedRows({});
      } else {
        alert("Error: " + (res?.data?.message || "Failed to send command"));
      }
    });
  };

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
                vehicleNo: (
                  <DataCell
                    text={item.vehnum || item.name || "N/A"}
                    fontWeight="bold"
                    isClickable={true}
                    onClick={() => handleImeiClick(imei, item.accid)}
                  />
                ),
                gpsStatus: <Status status={gpsDisplay} />,
                ignitionStatus: <Ignition status={item.ign === "Y" ? 1 : 0} />,
                imei: (
                  <DataCell
                    text={imei}
                    isClickable={true}
                    onClick={() => handleImeiClick(imei, item.accid)}
                  />
                ),
                simNo: <DataCell text={item.simNo || "N/A"} fontWeight="medium" />,
                date: <DataCell text={item.devTs || item.cts || "N/A"} />,
                latitude: <DataCell text={item.lat ? `${item.lat.toFixed(6)}°` : "N/A"} />,
                longitude: <DataCell text={item.lng ? `${item.lng.toFixed(6)}°` : "N/A"} />,
                address: <AddressCell item={item} />,
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
      ApiService.getDashboardData({ accid: currentAccountId }, (res) => {
        if (res?.data?.resultCode === 1 && res?.data?.data?.data?.ELK?.available) {
          const devices = res.data.data.data.ELK.available;
          const fetchedRows = devices.map((item, index) => {
            const imei = item.imei || "N/A";
            const speed = Number(item.speed) || 0;
            const elkTypeStatus = item.type;
            const vehicleAccountId = item.accid;

            const isLocked = elkTypeStatus === "L";

            return {
              no: (
                <MDBox display="flex" alignItems="center" gap={0.5} justifyContent="flex-start">
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
                  isClickable={true}
                  onClick={() => handleImeiClick(imei, vehicleAccountId)}
                />
              ),
              imei: (
                <DataCell
                  text={imei}
                  isClickable={true}
                  onClick={() => handleImeiClick(imei, vehicleAccountId)}
                />
              ),
              simNo: <DataCell text={item.simNo || "N/A"} fontWeight="medium" />,
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
              lockUnlock: (
                <LockUnlock
                  isLocked={isLocked}
                  deviceStatus={item.status || null}
                  elkType={elkTypeStatus}
                />
              ),
              checkbox: null,
              _imei: imei,
              _type: item.type, // "L" or "U"
            };
          });
          setAllElkRows(fetchedRows);
          setSelectedRows({});
        } else {
          setAllElkRows([]);
        }
        setLoading(false);
      });
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
              vehicleNo: (
                <DataCell
                  text={item.vehnum || "N/A"}
                  fontWeight="bold"
                  isClickable={true}
                  onClick={() => handleImeiClick(imei, item.accid)}
                />
              ),
              imei: (
                <DataCell
                  text={imei}
                  isClickable={true}
                  onClick={() => handleImeiClick(imei, item.accid)}
                />
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

  const rowsByType = {
    vts: allVtsRows,
    elk: allElkRows,
    unreachable: unreachableRows,
  };

  const columnsByType = {
    vts: VTS_COLUMNS,
    elk: ELK_COLUMNS,
    unreachable: UNREACHABLE_COLUMNS,
  };

  const currentRows = rowsByType[tripFilterType] || [];
  const currentColumns = columnsByType[tripFilterType] || [];

  const filteredRows = useMemo(() => {
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

    if (tripFilterType === "vts") {
      return currentRows
        .map((row) => {
          const imei = row._imei;
          const checkboxComponent = (
            <MDBox display="flex" justifyContent="center">
              <Checkbox
                checked={!!selectedRows[imei]}
                onChange={() => handleToggleSelect(imei)}
                color="primary"
                sx={checkboxBaseSx}
              />
            </MDBox>
          );
          return { ...row, checkbox: checkboxComponent };
        })
        .filter(matchesSearch);
    } else if (tripFilterType === "elk") {
      return currentRows
        .map((row) => {
          const imei = row._imei;
          const checkboxComponent = (
            <MDBox display="flex" justifyContent="center">
              <Checkbox
                checked={!!selectedRows[imei]}
                onChange={() => handleToggleSelect(imei)}
                color="primary"
                inputProps={{ "aria-label": "lock-unlock checkbox" }}
                sx={checkboxBaseSx}
              />
            </MDBox>
          );

          return { ...row, checkbox: checkboxComponent };
        })
        .filter(matchesSearch);
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
        ].filter(Boolean);
        return fields.some((f) => String(f).toLowerCase().includes(term));
      });
    }
    return [];
  }, [currentRows, searchTerm, selectedRows, handleToggleSelect, tripFilterType]);

  const selectedCount = Object.values(selectedRows).filter(Boolean).length;

  if (loading) {
    return (
      <Card>
        <MDBox p={3} display="flex" justifyContent="center" alignItems="center" minHeight="200px">
          <CircularProgress color="info" size={30} />
          <MDTypography variant="h6" ml={2}>
            Loading Data...
          </MDTypography>
        </MDBox>
      </Card>
    );
  }

  const dialogTitle = unlockDialog.action === "lock" ? "Confirm Lock?" : "Confirm Unlock?";

  const dialogMessage = unlockDialog.isBulk ? (
    unlockDialog.action === "lock" ? (
      <>
        Are you sure you want to <strong>lock</strong> <strong>{unlockDialog.bulkCount}</strong>{" "}
        selected device(s)?
      </>
    ) : (
      <>
        Are you sure you want to <strong>unlock</strong> <strong>{unlockDialog.bulkCount}</strong>{" "}
        selected device(s)?
      </>
    )
  ) : unlockDialog.action === "lock" ? (
    <>
      Are you sure you want to <strong>lock</strong> device{" "}
      <strong>{unlockDialog.vehicleNo}</strong> (IMEI: {unlockDialog.imei})?
    </>
  ) : (
    <>
      Are you sure you want to <strong>unlock</strong> device{" "}
      <strong>{unlockDialog.vehicleNo}</strong> (IMEI: {unlockDialog.imei})?
    </>
  );

  return (
    <>
      <Card sx={tableCardSx}>
        <MDBox position="relative" px={3} pt={3} pb={1}>
          <MDBox display="inline-flex" sx={filterToggleBoxSx}>
            <MDButton
              variant={tripFilterType === "vts" ? "contained" : "text"}
              color={tripFilterType === "vts" ? "info" : "dark"}
              size="small"
              onClick={() => {
                setTripFilterType("vts");
                setSelectedRows({});
              }}
              sx={filterToggleButtonSx}
            >
              VTS
            </MDButton>
            <MDButton
              variant={tripFilterType === "elk" ? "contained" : "text"}
              color={tripFilterType === "elk" ? "info" : "dark"}
              size="small"
              onClick={() => {
                setTripFilterType("elk");
                setSelectedRows({});
              }}
              sx={filterToggleButtonSx}
            >
              PADLOCK
            </MDButton>
            <MDButton
              variant={tripFilterType === "unreachable" ? "contained" : "text"}
              color={tripFilterType === "unreachable" ? "warning" : "dark"}
              size="small"
              onClick={() => {
                setTripFilterType("unreachable");
                setSelectedRows({});
              }}
              sx={unreachableToggleButtonSx}
            >
              UNREACHABLE
            </MDButton>
          </MDBox>

          <MDBox display="flex" justifyContent="space-between" alignItems="center" mt={1.5}>
            <MDBox display="flex" alignItems="center" width="100%">
              <MDBox mr={3}>
                <MDTypography variant="h6">
                  {tripFilterType === "vts"
                    ? "Live Trip Report"
                    : tripFilterType === "elk"
                    ? "Padlock Devices"
                    : "Unreachable Devices"}
                  <MDTypography variant="button" color="text" ml={1}>
                    (<strong>{filteredRows.length}</strong> displayed)
                  </MDTypography>
                </MDTypography>
              </MDBox>

              {selectedCount > 0 && (tripFilterType === "vts" || tripFilterType === "elk") && (
                <MDBox ml={2}>
                  <MDButton
                    size="small"
                    variant="gradient"
                    color="dark"
                    onClick={handleBulkUnlockClick}
                  >
                    Lock/Unlock ({selectedCount})
                  </MDButton>
                </MDBox>
              )}

              <MDBox
                ml="auto"
                mr={2}
                width="50%"
                display="flex"
                alignItems="center"
                justifyContent="flex-end"
              >
                <MDBox flexGrow={1} mr={2}>
                  <TextField
                    fullWidth
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
                </MDBox>

                <FormControl variant="outlined" size="small" sx={{ minWidth: 90 }}>
                  <Select
                    value={pageSize}
                    onChange={handlePageSizeChange}
                    displayEmpty
                    sx={{ height: "44px" }}
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
              {/* {(tripFilterType === "vts" || tripFilterType === "elk") && (
                <MenuItem onClick={handleBulkUnlockClick}>Bulk Unlock</MenuItem>
              )} */}
              {/* <MenuItem
                onClick={() => {
                  closeMenu();
                  if (tripFilterType === "vts") fetchVtsData(accountId);
                  if (tripFilterType === "elk") fetchElkData(accountId);
                  if (tripFilterType === "unreachable") fetchUnreachableData(accountId);
                }}
              >
                Refresh
              </MenuItem> */}

              {/* --- NEW EXPORT OPTIONS --- */}
              <hr style={{ margin: "4px 0", opacity: 0.2 }} />
              <MenuItem onClick={() => handleExportData("csv")}>Export CSV</MenuItem>
              <MenuItem onClick={() => handleExportData("excel")}>Export Excel</MenuItem>
              <MenuItem onClick={() => handleExportData("pdf")}>Export PDF</MenuItem>
            </Menu>
          </MDBox>
        </MDBox>

        <MDBox>
          <DataTable
            key={pageSize}
            table={{ columns: currentColumns, rows: filteredRows }}
            isSorted={false}
            entriesPerPage={{ defaultValue: pageSize, entries: [pageSize] }}
            showTotalEntries={true}
            pagination={{ variant: "gradient", color: "info" }}
            noEndBorder
            sx={tablePaginationHideSelectSx}
          />
        </MDBox>

        <Dialog
          open={unlockDialog.open}
          onClose={handleCloseUnlockDialog}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-title">{dialogTitle}</DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description">{dialogMessage}</DialogContentText>
          </DialogContent>
          <DialogActions>
            <MDButton onClick={handleCloseUnlockDialog} color="dark">
              Cancel
            </MDButton>
            <MDButton onClick={handleConfirmUnlock} color="info" autoFocus>
              Confirm
            </MDButton>
          </DialogActions>
        </Dialog>
      </Card>
    </>
  );
}

const AddressCell = ({ item }) => (
  <MDBox display="flex" flexDirection="column" alignItems="flex-start" lineHeight={1.4}>
    {item.address && item.address !== "NA" && item.address.trim() !== "" ? (
      <MDTypography variant="caption" color="text">
        {item.address}
      </MDTypography>
    ) : (
      <>
        <MDTypography variant="caption" color="text" fontStyle="italic">
          {/* Location Not Available */}
        </MDTypography>
        {item.lat && item.lng && !isNaN(item.lat) && !isNaN(item.lng) ? (
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
      </>
    )}
  </MDBox>
);
AddressCell.propTypes = { item: PropTypes.object };

Projects.propTypes = {
  accountId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
};

export default Projects;
