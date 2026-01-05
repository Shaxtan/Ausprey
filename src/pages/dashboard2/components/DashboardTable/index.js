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
import Fade from "@mui/material/Fade"; // Animation for the action bar

// Material Dashboard 2 React components
import MDBox from "../../../../assets/components/MDBox";
import MDTypography from "../../../../assets/components/MDTypography";
import MDButton from "../../../../assets/components/MDButton";

// Material Dashboard 2 React examples
import DataTable from "../../../../assets/components/examples/Tables/DataTable";

// =====================================================================================
// 🔥 5 MOCK DATA ENTRIES FOR E-LOCK
// =====================================================================================
const MOCK_ELOCK_DATA = {
    resultCode: 1,
    message: "SUCCESS",
    data: {
        data: {
            ELOCK: {
                available: [
                    {
                        imei: "868373076491001",
                        vehnum: "GJ01-AA-1111",
                        accountName: "Logistics One",
                        devTs: "2025-12-10 12:30:00",
                        lat: 23.0225,
                        lng: 72.5714,
                        address: "Ahmedabad, Gujarat, India",
                        speed: 0,
                        ign: "Y", // Locked
                        gps: "A",
                        simNo: "9876543210",
                        avg: 0,
                        deviceType: "ELOCK"
                    },
                    {
                        imei: "868373076491002",
                        vehnum: "MH12-BB-2222",
                        accountName: "Pune Transporters",
                        devTs: "2025-12-10 12:31:15",
                        lat: 18.5204,
                        lng: 73.8567,
                        address: "Pune, Maharashtra, India",
                        speed: 45,
                        ign: "Y",
                        gps: "A",
                        simNo: "9876543211",
                        avg: 42,
                        deviceType: "ELOCK"
                    },
                    {
                        imei: "868373076491003",
                        vehnum: "KA05-CC-3333",
                        accountName: "Bangalore Cargo",
                        devTs: "2025-12-10 12:32:10",
                        lat: 12.9716,
                        lng: 77.5946,
                        address: "Bengaluru, Karnataka, India",
                        speed: 0,
                        ign: "N",
                        gps: "V",
                        simNo: "9876543212",
                        avg: 0,
                        deviceType: "ELOCK"
                    },
                    {
                        imei: "868373076491004",
                        vehnum: "DL01-DD-4444",
                        accountName: "Delhi Freight",
                        devTs: "2025-12-10 12:33:45",
                        lat: 28.7041,
                        lng: 77.1025,
                        address: "New Delhi, Delhi, India",
                        speed: 60,
                        ign: "Y",
                        gps: "A",
                        simNo: "9876543213",
                        avg: 55,
                        deviceType: "ELOCK"
                    },
                    {
                        imei: "868373076491005",
                        vehnum: "RJ14-EE-5555",
                        accountName: "Jaipur Logistics",
                        devTs: "2025-12-10 12:34:20",
                        lat: 26.9124,
                        lng: 75.7873,
                        address: "Jaipur, Rajasthan, India",
                        speed: 0,
                        ign: "Y",
                        gps: "A",
                        simNo: "9876543214",
                        avg: 0,
                        deviceType: "ELOCK"
                    }
                ]
            }
        }
    }
};

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
        default:
            iconName = isLocked ? "lock" : "lock_open";
            color = isLocked ? "error" : "success";
            tooltipText = isLocked
                ? "**Trip Status: Locked**"
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

const ELOCK_COLUMNS = [
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

// =====================================================================================
// MAIN COMPONENT
// =====================================================================================

function Projects({ accountId }) {
    const navigate = useNavigate();

    const [menu, setMenu] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(true);
    
    // Data States
    const [allVtsRows, setAllVtsRows] = useState([]);
    const [allElockRows, setAllElockRows] = useState([]); 
    const [selectedRows, setSelectedRows] = useState({});
    
    // Filter State: "vts" or "elock"
    const [tripFilterType, setTripFilterType] = useState("vts");

    // 🔥 Page Size State
    const [pageSize, setPageSize] = useState(10);

    const openMenu = ({ currentTarget }) => setMenu(currentTarget);
    const closeMenu = () => setMenu(null);

    // 🔥 Handle Dropdown Change
    const handlePageSizeChange = (event) => {
        setPageSize(event.target.value);
    };

    // Calculate how many are selected
    const selectedCount = Object.values(selectedRows).filter(Boolean).length;

    // 🔥 ACTION BUTTON HANDLER (Appears when items are selected)
    const handleUnlockAction = () => {
        const imeiToUnlock = Object.keys(selectedRows).filter((imei) => selectedRows[imei]);
        if (imeiToUnlock.length > 0) {
            // HERE YOU WOULD CALL YOUR UNLOCK API
            alert(`SUCCESS: Sent UNLOCK command to ${imeiToUnlock.length} device(s).\nIMEIs: ${imeiToUnlock.join(", ")}`);
            setSelectedRows({}); // Clear selection after action
        }
    };

    const handleClearSelection = () => {
        setSelectedRows({});
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
                                        <MDTypography variant="caption" fontWeight="bold" color={item.ign === "Y" ? "success" : "error"}>
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
                                address: <DataCell text={item.address && item.address !== "NA" ? item.address : "Location Not Available"} />,
                                avgSpeed: <DataCell text={item.avg !== null && item.avg !== 0 ? item.avg : "N/A"} />,
                                currentSpeed: <DataCell text={`${speed} km/h`} color={speed > 0 ? "success" : "text"} fontWeight="bold" />,
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

    const fetchElockData = useCallback(
        () => {
            setLoading(true);
            setTimeout(() => {
                const res = MOCK_ELOCK_DATA; // Load from local constant

                if (res?.resultCode === 1 && res?.data?.data?.ELOCK?.available) {
                    const devices = res.data.data.ELOCK.available;
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
                                    <MDTypography variant="caption" fontWeight="bold" color={item.ign === "Y" ? "success" : "error"}>
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
                            address: <DataCell text={item.address && item.address !== "NA" ? item.address : "Location Not Available"} />,
                            avgSpeed: <DataCell text={item.avg !== null && item.avg !== 0 ? item.avg : "N/A"} />,
                            currentSpeed: <DataCell text={`${speed} km/h`} color={speed > 0 ? "success" : "text"} fontWeight="bold" />,
                            lockUnlock: <LockUnlock isLocked={isLocked} deviceStatus={null} />,
                            checkbox: null,
                            _imei: imei,
                            _isLockedInitial: isLocked,
                        };
                    });
                    setAllElockRows(fetchedRows);
                    setSelectedRows({});
                } else {
                    setAllElockRows([]);
                }
                setLoading(false);
            }, 500); 
        },
        [handleImeiClick]
    );

    useEffect(() => {
        if (tripFilterType === "vts") {
            fetchVtsData(accountId);
        } else if (tripFilterType === "elock") {
            fetchElockData();
        }
    }, [tripFilterType, accountId, fetchVtsData, fetchElockData]);

    const currentRows = tripFilterType === "vts" ? allVtsRows : allElockRows;
    const currentColumns = tripFilterType === "vts"
        ? [...VTS_COLUMNS, { Header: "LOCK STATUS", accessor: "lockUnlock", width: "8%", align: "center" }, { Header: "UNLOCK", accessor: "checkbox", width: "5%", align: "center" }]
        : [...ELOCK_COLUMNS, { Header: "LOCK STATUS", accessor: "lockUnlock", width: "8%", align: "center" }, { Header: "UNLOCK", accessor: "checkbox", width: "5%", align: "center" }];

    const filteredRows = useMemo(() => {
        return currentRows
            .map((row) => {
                const imei = row._imei;
                const checkboxComponent = row._isLockedInitial ? (
                    <MDBox display="flex" justifyContent="center">
                        <Checkbox
                            checked={!!selectedRows[imei]}
                            // 🔥 FIXED: Added onClick with stopPropagation to ensure checkbox works inside table
                            onClick={(e) => e.stopPropagation()} 
                            onChange={() => handleToggleSelect(imei)}
                            color="error"
                        />
                    </MDBox>
                ) : (
                    <MDTypography variant="caption" color="text">-</MDTypography>
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
    }, [currentRows, searchTerm, selectedRows, handleToggleSelect]);

    if (loading) {
        return (
            <Card>
                <MDBox p={3} display="flex" justifyContent="center" alignItems="center" minHeight="200px">
                    <CircularProgress color="info" size={30} />
                    <MDTypography variant="h6" ml={2}>
                        {tripFilterType === "vts" ? "Fetching Live VTS Data..." : "Fetching Live E-LOCK Data..."}
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
                        top: -18,
                        left: 24,
                        backgroundColor: theme.palette.background.paper,
                        borderRadius: "16px",
                        boxShadow: theme.shadows[3],
                        overflow: "hidden",
                    })}
                >
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
                        variant={tripFilterType === "elock" ? "contained" : "text"}
                        color={tripFilterType === "elock" ? "warning" : "dark"}
                        size="small"
                        onClick={() => setTripFilterType("elock")}
                        sx={{ borderRadius: 0, px: 2, py: 1, minWidth: "130px", boxShadow: "none" }}
                    >
                        E-LOCK
                    </MDButton>
                </MDBox>

                {/* 🔥 DYNAMIC ACTION BAR / SEARCH BAR */}
                <MDBox display="flex" justifyContent="space-between" alignItems="center" mt={1.5} minHeight="50px">
                    <MDBox display="flex" alignItems="center" width="100%">
                        
                        {/* Title Section */}
                        <MDBox mr={3}>
                            <MDTypography variant="h6">
                                {tripFilterType === "vts" ? "Live VTS Report" : "Live E-LOCK Report"}
                                <MDTypography variant="button" color="text" ml={1}>
                                    (<strong>{filteredRows.length}</strong> {tripFilterType === "vts" ? "trips" : "locks"} displayed)
                                </MDTypography>
                            </MDTypography>
                        </MDBox>

                        <MDBox ml="auto" mr={2} width="50%" display="flex" alignItems="center" justifyContent="flex-end">
                            
                            {/* 🔥 CONDITIONAL RENDER: Show Action Button if items selected, else show Search */}
                            {selectedCount > 0 ? (
                                <Fade in={selectedCount > 0}>
                                    <MDBox display="flex" alignItems="center" bgcolor="grey.100" borderRadius="md" px={2} py={0.5}>
                                        <MDTypography variant="button" fontWeight="bold" color="text" mr={2}>
                                            {selectedCount} Selected
                                        </MDTypography>
                                        <MDButton 
                                            variant="gradient" 
                                            color="error" 
                                            size="small" 
                                            startIcon={<Icon>lock_open</Icon>}
                                            onClick={handleUnlockAction}
                                            sx={{ mr: 1 }}
                                        >
                                            UNLOCK SELECTED
                                        </MDButton>
                                        <IconButton size="small" onClick={handleClearSelection}>
                                            <Icon color="secondary">close</Icon>
                                        </IconButton>
                                    </MDBox>
                                </Fade>
                            ) : (
                                <Fade in={selectedCount === 0}>
                                    <MDBox display="flex" width="100%" alignItems="center" justifyContent="flex-end">
                                        {/* Search Box */}
                                        <MDBox flexGrow={1} mr={2}>
                                            <TextField
                                                fullWidth
                                                size="small"
                                                variant="outlined"
                                                placeholder="Search by Vehicle, IMEI..."
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

                                        {/* Dropdown */}
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
                                </Fade>
                            )}
                        </MDBox>

                        {/* Menu Options (Always visible) */}
                        <MDBox>
                            <Icon sx={{ cursor: "pointer" }} fontSize="small" onClick={openMenu}>
                                more_vert
                            </Icon>
                        </MDBox>
                    </MDBox>

                    <Menu anchorEl={menu} open={Boolean(menu)} onClose={closeMenu}>
                        <MenuItem onClick={handleBulkUnlock}>Bulk Unlock (All)</MenuItem>
                        <MenuItem onClick={closeMenu}>Refresh</MenuItem>
                        <MenuItem onClick={closeMenu}>Export</MenuItem>
                    </Menu>
                </MDBox>
            </MDBox>

            {/* --------------------------------- TABLE --------------------------------- */}
            <MDBox>
                <DataTable
                    key={pageSize}
                    table={{ columns: currentColumns, rows: filteredRows }}
                    isSorted={false}
                    entriesPerPage={{ defaultValue: pageSize, entries: [pageSize] }}
                    showTotalEntries={true}
                    pagination={{ variant: "gradient", color: "info" }}
                    noEndBorder
                    sx={{ "& .MuiTablePagination-selectLabel, & .MuiTablePagination-input": { display: "none" } }}
                />
            </MDBox>
        </Card>
    );
}
Projects.propTypes = {
    accountId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
};

export default Projects;