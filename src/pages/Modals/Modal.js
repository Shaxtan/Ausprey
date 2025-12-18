import React, { useState, useMemo } from "react";
import PropTypes from "prop-types";

import Card from "@mui/material/Card";
import Icon from "@mui/material/Icon";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import Select from "@mui/material/Select";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";

import MDBox from "../../assets/components/MDBox";
import MDTypography from "../../assets/components/MDTypography";
import DataTable from "../../assets/components/examples/Tables/DataTable";

export const DataCell = ({ text, color = "text", fontWeight = "medium", isClickable, onClick }) => {
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

function CustomTable({ title, columns, rows, rawData = [] }) {
  const [menu, setMenu] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [selectedType, setSelectedType] = useState("All");

  const openMenu = ({ currentTarget }) => setMenu(currentTarget);
  const closeMenu = () => setMenu(null);

  const handlePageSizeChange = (event) => {
    setPageSize(event.target.value);
  };

  // Extract unique types from raw API data and format for display
  const uniqueTypes = useMemo(() => {
    const types = new Set();
    rawData.forEach((item) => {
      if (item.type) {
        types.add(item.type.trim().toLowerCase());
      }
    });
    const sorted = Array.from(types).sort();
    return ["All", ...sorted.map((t) => t.toUpperCase())];
  }, [rawData]);

  // Filter rows based on selectedType and searchTerm using raw data
  const filteredRows = useMemo(() => {
    let filtered = rows;

    // Apply Type Filter
    if (selectedType !== "All") {
      const lowerType = selectedType.toLowerCase();
      filtered = rows.filter((row, index) => {
        const originalItem = rawData[index];
        return (
          originalItem && originalItem.type && originalItem.type.trim().toLowerCase() === lowerType
        );
      });
    }

    // Apply Search Filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter((row) => {
        const values = Object.values(row).map((val) => {
          if (React.isValidElement(val) && val.props && val.props.text) {
            return val.props.text;
          }
          return String(val || "");
        });
        return values.some((v) => v.toLowerCase().includes(term));
      });
    }

    return filtered;
  }, [rows, rawData, selectedType, searchTerm]);

  return (
    <Card sx={{ height: "100%", width: "100%", overflow: "hidden", boxShadow: "none" }}>
      <MDBox position="relative" px={3} pt={3} pb={1}>
        <MDBox display="flex" justifyContent="space-between" alignItems="center" mt={1.5}>
          <MDBox display="flex" alignItems="center" width="100%">
            <MDBox mr={3}>
              <MDTypography variant="h6">
                {title}
                <MDTypography variant="button" color="text" ml={1}>
                  (<strong>{filteredRows.length}</strong> displayed)
                </MDTypography>
              </MDTypography>
            </MDBox>

            <MDBox
              ml="auto"
              mr={2}
              width="50%"
              display="flex"
              alignItems="center"
              justifyContent="flex-end"
              gap={2}
            >
              {/* Type Filter Dropdown */}
              <FormControl variant="outlined" size="small" sx={{ minWidth: 140 }}>
                <InputLabel id="type-filter-label">Type</InputLabel>
                <Select
                  labelId="type-filter-label"
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  label="Type"
                  sx={{ height: "44px" }}
                >
                  {uniqueTypes.map((type) => (
                    <MenuItem key={type} value={type}>
                      {type === "All" ? "All Types" : type}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Search Field */}
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

              {/* Page Size Selector */}
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
            <MenuItem onClick={closeMenu}>Refresh</MenuItem>
            <MenuItem onClick={closeMenu}>Export CSV</MenuItem>
          </Menu>
        </MDBox>
      </MDBox>

      <MDBox>
        <DataTable
          key={pageSize}
          table={{ columns: columns, rows: filteredRows }}
          isSorted={true}
          entriesPerPage={{ defaultValue: pageSize, entries: [pageSize] }}
          showTotalEntries={true}
          pagination={{ variant: "gradient", color: "info" }}
          noEndBorder
          sx={{
            "& .MuiTablePagination-selectLabel, & .MuiTablePagination-input": { display: "none" },
          }}
        />
      </MDBox>
    </Card>
  );
}

CustomTable.propTypes = {
  title: PropTypes.string,
  columns: PropTypes.array,
  rows: PropTypes.array,
  rawData: PropTypes.array, // Original alertData for accurate filtering
};

const AlertModal = ({ open, onClose, title, alertData }) => {
  const columns = [
    { Header: "IMEI", accessor: "imei", width: "15%" },
    { Header: "Vehicle", accessor: "vehicle", width: "15%" },
    { Header: "Time", accessor: "time", width: "20%" },
    { Header: "Type", accessor: "type", width: "10%", align: "center" },
    { Header: "Message", accessor: "message", width: "40%" },
  ];

  const rows = useMemo(() => {
    if (!alertData || !Array.isArray(alertData)) return [];

    return alertData.map((item) => ({
      vehicle: <DataCell text={item.vehicleNumber || "N/A"} fontWeight="bold" />,
      imei: <DataCell text={item.imei || "N/A"} />,
      type: <DataCell text={(item.type || "N/A").toUpperCase()} />, // Display uppercase in table
      message: <DataCell text={item.message || "No message"} />,
      time: <DataCell text={item.deviceTime || "N/A"} />,
    }));
  }, [alertData]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <MDBox display="flex" justifyContent="space-between" alignItems="center" p={2} pb={0}>
        <MDTypography variant="h5" sx={{ ml: 2 }}>
          {title}
        </MDTypography>
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </MDBox>
      <DialogContent sx={{ p: 0, pb: 3 }}>
        <CustomTable
          title="Filtered Alerts"
          columns={columns}
          rows={rows}
          rawData={alertData} // Pass original data for correct filtering
        />
      </DialogContent>
    </Dialog>
  );
};

AlertModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.string,
  alertData: PropTypes.array,
};

export default AlertModal;
