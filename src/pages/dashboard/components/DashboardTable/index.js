import React, { useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import ApiService from "../../../../services/ApiService";

import {
  Card,
  Icon,
  Menu,
  MenuItem,
  TextField,
  InputAdornment,
  IconButton,
  Tooltip,
  Checkbox,
  Select,
  FormControl,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  CircularProgress,
} from "@mui/material";

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

// --- Sub-Components ---

const DataCell = ({ text, color = "text", fontWeight = "medium", isClickable, onClick }) => (
  <MDTypography
    variant="caption"
    color={isClickable ? "info" : color}
    fontWeight={isClickable ? "bold" : fontWeight}
    sx={isClickable ? clickableTextSx : {}}
    onClick={isClickable ? onClick : undefined}
  >
    {text}
  </MDTypography>
);

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
  return (
    <MDTypography
      variant="caption"
      color={ignitionStatus === "On" ? "success" : "error"}
      fontWeight="bold"
    >
      {ignitionStatus}
    </MDTypography>
  );
};

Ignition.propTypes = { status: PropTypes.number.isRequired };

const AddressCell = ({ item }) => (
  <MDBox display="flex" flexDirection="column" alignItems="flex-start" lineHeight={1.4}>
    {item.address && item.address !== "NA" && item.address.trim() !== "" ? (
      <MDTypography variant="caption" color="text">
        {item.address}
      </MDTypography>
    ) : (
      <>
        {item.lat && item.lng ? (
          <MDTypography
            variant="caption"
            color="info"
            fontWeight="bold"
            sx={addressMapLinkSx}
            onClick={() =>
              window.open(`https://www.google.com/maps?q=${item.lat},${item.lng}`, "_blank")
            }
          >
            Open in Google Maps ↗
          </MDTypography>
        ) : (
          <MDTypography variant="caption" color="textSecondary">
            No coordinates available
          </MDTypography>
        )}
      </>
    )}
  </MDBox>
);

AddressCell.propTypes = {
  item: PropTypes.shape({
    address: PropTypes.string,
    lat: PropTypes.number,
    lng: PropTypes.number,
  }).isRequired,
};

const LockUnlock = ({ isLocked, deviceStatus, elkType }) => {
  let iconName, color, tooltipText;

  // Logic for specific Padlock hardware states
  if (elkType === "U" || elkType === "L") {
    if (elkType === "L") {
      iconName = "lock";
      color = "success";
      tooltipText = "Device Status: LOCKED";
    } else {
      iconName = "lock_open";
      color = "error";
      tooltipText = "Device Status: UNLOCKED";
    }
  } else {
    // Logic for Alert States (Mimicking your older dashboard)
    switch (deviceStatus) {
      case "ROPE_CUT":
        iconName = "gpp_bad";
        color = "error";
        tooltipText = "Alert: Rope Cut Detected";
        break;
      case "CASE_TAMPER":
        iconName = "lock_person";
        color = "warning";
        tooltipText = "Alert: Case Tamper Detected";
        break;
      case "ROPE_INSERT":
        iconName = "lock_reset";
        color = "info";
        tooltipText = "Status: Rope Inserted / Pending";
        break;
      default:
        iconName = isLocked ? "lock" : "lock_open";
        color = isLocked ? "error" : "success";
        tooltipText = isLocked ? "Status: Locked" : "Status: Unlocked";
        break;
    }
  }

  return (
    <Tooltip
      title={
        <MDTypography variant="caption" color="light">
          {tooltipText}
        </MDTypography>
      }
    >
      <IconButton size="small" color={color}>
        <Icon>{iconName}</Icon>
      </IconButton>
    </Tooltip>
  );
};

LockUnlock.propTypes = {
  isLocked: PropTypes.bool.isRequired,
  deviceStatus: PropTypes.string,
  elkType: PropTypes.string,
};

// --- Column Definitions ---
const VTS_COLUMNS = [
  { Header: "No", accessor: "no", width: "5%" },
  { Header: "Acc Name", accessor: "accountName", width: "12%" },
  { Header: "Vehicle No", accessor: "vehicleNo", width: "10%" },
  { Header: "IMEI", accessor: "imei", width: "12%" },
  { Header: "Sim No", accessor: "simNo", width: "12%" },
  { Header: "Date/Time", accessor: "date", width: "12%" },
  { Header: "Address", accessor: "address", width: "20%" },
  { Header: "GPS", accessor: "gpsStatus", width: "8%" },
  { Header: "IGN", accessor: "ignitionStatus", width: "8%" },
  { Header: "Speed", accessor: "currentSpeed", width: "8%" },
];

const ELK_COLUMNS = [
  ...VTS_COLUMNS.slice(0, 7),
  { Header: "Lock Status", accessor: "lockUnlock", width: "8%" },
  { Header: "Select", accessor: "checkbox", width: "5%" },
];

const UNREACHABLE_COLUMNS = [
  { Header: "No", accessor: "no", width: "5%" },
  { Header: "Acc Name", accessor: "accountName", width: "18%" },
  { Header: "Vehicle No", accessor: "vehicleNo", width: "12%" },
  { Header: "IMEI", accessor: "imei", width: "15%" },
  { Header: "Dev Type", accessor: "deviceType", width: "15%" },
  { Header: "Created On", accessor: "createdOn", width: "15%" },
];

// --- Main Component ---

function Projects({
  accountId,
  vtsData = [],
  elkData = [],
  unreachableData = [],
  loading = false,
}) {
  const navigate = useNavigate();
  const [menu, setMenu] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRows, setSelectedRows] = useState({});
  const [tripFilterType, setTripFilterType] = useState("vts");
  const [pageSize, setPageSize] = useState(10);
  const [unlockDialog, setUnlockDialog] = useState({
    open: false,
    isBulk: false,
    action: "unlock",
    bulkImeis: [],
  });

  const handleImeiClick = useCallback(
    (imei, accId) => {
      navigate(`/live-track?imei=${imei}`, {
        state: { targetImei: imei, targetAccountId: accId || accountId },
      });
    },
    [navigate, accountId]
  );

  const handleToggleSelect = useCallback((imei) => {
    setSelectedRows((prev) => ({ ...prev, [imei]: !prev[imei] }));
  }, []);

  // --- Data Mapping ---

  // --- Data Mapping ---

  const allVtsRows = useMemo(() => {
    return vtsData.map((item, index) => {
      const imei = item.imei || "N/A";
      // We generate the search string here for performance
      const searchStr = `${item.accountName} ${item.vehnum || item.name} ${imei} ${
        item.address
      }`.toLowerCase();

      return {
        no: (
          <MDBox display="flex" alignItems="center" gap={0.5}>
            <Icon fontSize="small" color={item.ign === "Y" ? "success" : "error"}>
              {item.ign === "Y" ? "online_prediction" : "offline_bolt"}
            </Icon>
            <MDTypography variant="caption" fontWeight="bold">
              {index + 1}
            </MDTypography>
          </MDBox>
        ),
        accountName: <DataCell text={item.accountName || "N/A"} />,
        vehicleNo: (
          <DataCell
            text={item.vehnum || item.name || "N/A"}
            isClickable
            onClick={() => handleImeiClick(imei, item.accid)}
          />
        ),
        imei: (
          <DataCell text={imei} isClickable onClick={() => handleImeiClick(imei, item.accid)} />
        ),
        simNo: <DataCell text={item.simNo || "N/A"} />,
        date: <DataCell text={item.devTs || "N/A"} />,
        address: <AddressCell item={item} />,
        gpsStatus: <Status status={item.gps === "A" ? "Active" : "Inactive"} />,
        ignitionStatus: <Ignition status={item.ign === "Y" ? 1 : 0} />,
        currentSpeed: (
          <DataCell
            text={`${item.speed || 0} km/h`}
            color={item.speed > 0 ? "success" : "text"}
            fontWeight="bold"
          />
        ),
        _imei: imei,
        _searchStr: searchStr,
      };
    });
  }, [vtsData, handleImeiClick]);

  const allElkRows = useMemo(() => {
    return elkData.map((item, index) => {
      const imei = item.imei || "N/A";

      // Original Logic: Find the details (Address, VehNum) from the VTS data list
      const vtsMatch = vtsData.find((v) => v.imei === imei);

      // We merge the ELK status with the VTS display information
      return {
        no: <DataCell text={index + 1} fontWeight="bold" />,
        accountName: <DataCell text={item.accountName || vtsMatch?.accountName || "N/A"} />,
        vehicleNo: (
          <DataCell
            text={item.vehnum || vtsMatch?.name || "N/A"}
            isClickable
            onClick={() => handleImeiClick(imei, item.accid)}
          />
        ),
        imei: (
          <DataCell text={imei} isClickable onClick={() => handleImeiClick(imei, item.accid)} />
        ),
        simNo: <DataCell text={item.simNo || "N/A"} />,
        date: <DataCell text={item.devTs || "N/A"} />,
        address: <DataCell text={item.address || "N/A"} />,
        lockUnlock: (
          <LockUnlock
            isLocked={item.type === "L"}
            elkType={item.type}
            deviceStatus={item.status} // Important: Passing the raw status string
          />
        ),
        _imei: imei,
        _type: item.type,
        _searchStr: `${item.accountName} ${vtsMatch?.vehnum || ""} ${imei}`.toLowerCase(),
      };
    });
  }, [elkData, vtsData, handleImeiClick]);

  const allUnreachableRows = useMemo(() => {
    return unreachableData.map((item, index) => ({
      no: <DataCell text={index + 1} fontWeight="bold" />,
      accountName: <DataCell text={item.accountName || "N/A"} />,
      vehicleNo: (
        <DataCell
          text={item.vehnum || "N/A"}
          isClickable
          onClick={() => handleImeiClick(item.imei, item.accid)}
        />
      ),
      imei: (
        <DataCell
          text={item.imei || "N/A"}
          isClickable
          onClick={() => handleImeiClick(item.imei, item.accid)}
        />
      ),
      deviceType: <DataCell text={item.deviceType || "N/A"} />,
      createdOn: <DataCell text={item.createdOn || "N/A"} />,
      _searchStr: `${item.accountName} ${item.vehnum} ${item.imei}`.toLowerCase(),
    }));
  }, [unreachableData, handleImeiClick]);

  const filteredRows = useMemo(() => {
    let baseRows =
      tripFilterType === "vts"
        ? allVtsRows
        : tripFilterType === "elk"
        ? allElkRows
        : allUnreachableRows;
    const filtered = baseRows.filter(
      (row) => !searchTerm || row._searchStr?.includes(searchTerm.toLowerCase())
    );

    if (tripFilterType === "elk") {
      return filtered.map((row) => ({
        ...row,
        checkbox: (
          <Checkbox
            checked={!!selectedRows[row._imei]}
            onChange={() => handleToggleSelect(row._imei)}
            sx={checkboxBaseSx}
          />
        ),
      }));
    }
    return filtered;
  }, [
    tripFilterType,
    allVtsRows,
    allElkRows,
    allUnreachableRows,
    searchTerm,
    selectedRows,
    handleToggleSelect,
  ]);

  const handleBulkUnlockClick = () => {
    const selectedImeis = Object.keys(selectedRows).filter((imei) => selectedRows[imei]);
    if (selectedImeis.length === 0) return alert("Please select devices first");
    const firstDev = elkData.find((d) => d.imei === selectedImeis[0]);
    setUnlockDialog({
      open: true,
      isBulk: true,
      bulkCount: selectedImeis.length,
      bulkImeis: selectedImeis,
      action: firstDev?.type === "L" ? "unlock" : "lock",
    });
    setMenu(null);
  };

  const handleConfirmUnlock = () => {
    const { bulkImeis, action } = unlockDialog;
    const commands = bulkImeis.map((imei) => ({
      imei,
      deviceType: 0,
      code: action === "unlock" ? "ULK" : "LCK",
      command: "string",
      type: "string",
      expiry: 0,
    }));
    ApiService.createDeviceCommand({ commands }, (res) => {
      if (res?.data?.resultCode === 1) {
        alert("Command sent successfully!");
        setSelectedRows({});
      }
      setUnlockDialog({ open: false, bulkImeis: [] });
    });
  };

  if (loading) {
    return (
      <Card sx={{ p: 5, textAlign: "center" }}>
        <CircularProgress color="info" />
        <MDTypography variant="h6" mt={2}>
          Syncing Dashboard...
        </MDTypography>
      </Card>
    );
  }

  return (
    <Card sx={tableCardSx}>
      <MDBox px={3} pt={3}>
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
              ({filteredRows.length} units)
            </MDTypography>
          </MDTypography>

          <MDBox display="flex" gap={2} alignItems="center">
            {Object.values(selectedRows).some(Boolean) && (
              <MDButton
                variant="gradient"
                color="dark"
                size="small"
                onClick={handleBulkUnlockClick}
              >
                Command ({Object.values(selectedRows).filter(Boolean).length})
              </MDButton>
            )}
            <TextField
              size="small"
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
            <FormControl size="small">
              <Select value={pageSize} onChange={(e) => setPageSize(e.target.value)}>
                {[10, 20, 50, 100].map((v) => (
                  <MenuItem key={v} value={v}>
                    {v}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <IconButton onClick={(e) => setMenu(e.currentTarget)}>
              <Icon>more_vert</Icon>
            </IconButton>
          </MDBox>
        </MDBox>
      </MDBox>

      <DataTable
        table={{
          columns:
            tripFilterType === "vts"
              ? VTS_COLUMNS
              : tripFilterType === "elk"
              ? ELK_COLUMNS
              : UNREACHABLE_COLUMNS,
          rows: filteredRows,
        }}
        entriesPerPage={{ defaultValue: pageSize, entries: [pageSize] }}
        showTotalEntries
        noEndBorder
        sx={tablePaginationHideSelectSx}
      />

      <Menu anchorEl={menu} open={Boolean(menu)} onClose={() => setMenu(null)}>
        <MenuItem
          onClick={() => {
            setMenu(null);
            exportCSV(filteredRows, "Report.csv");
          }}
        >
          Export CSV
        </MenuItem>
        <MenuItem
          onClick={() => {
            setMenu(null);
            exportExcel(filteredRows, "Report.xlsx");
          }}
        >
          Export Excel
        </MenuItem>
        <MenuItem
          onClick={() => {
            setMenu(null);
            exportPDF(filteredRows, "Report.pdf");
          }}
        >
          Export PDF
        </MenuItem>
      </Menu>

      <Dialog
        open={unlockDialog.open}
        onClose={() => setUnlockDialog({ open: false, bulkImeis: [] })}
      >
        <DialogTitle>Confirm {unlockDialog.action?.toUpperCase()}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to {unlockDialog.action}{" "}
            {unlockDialog.isBulk ? unlockDialog.bulkCount : "this"} device(s)?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <MDButton onClick={() => setUnlockDialog({ open: false, bulkImeis: [] })}>
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
  loading: PropTypes.bool,
};

export default Projects;
