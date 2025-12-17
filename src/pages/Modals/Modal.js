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

export const Status = ({ status }) => {
  let color = "info";
  if (status === "Critical" || status === "Error") color = "error";
  if (status === "Warning") color = "warning";
  if (status === "Informational") color = "info";

  return (
    <MDBox lineHeight={1}>
      <MDTypography variant="caption" color={color} fontWeight="bold">
        {status}
      </MDTypography>
    </MDBox>
  );
};

Status.propTypes = {
  status: PropTypes.string.isRequired,
};

function CustomTable({ title, columns, rows }) {
  const [menu, setMenu] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [pageSize, setPageSize] = useState(10);

  const openMenu = ({ currentTarget }) => setMenu(currentTarget);
  const closeMenu = () => setMenu(null);

  const handlePageSizeChange = (event) => {
    setPageSize(event.target.value);
  };

  const filteredRows = useMemo(() => {
    if (!searchTerm) return rows;
    const term = searchTerm.toLowerCase();
    return rows.filter((row) => {
      const values = Object.values(row).map((val) => {
        if (typeof val === "object" && val !== null && val.props && val.props.text) {
          return val.props.text;
        }
        return val;
      });
      return values.some((val) => String(val).toLowerCase().includes(term));
    });
  }, [rows, searchTerm]);

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
};

const AlertModal = ({ open, onClose, title, alertData }) => {
  // 1. Define columns to match your API response keys (accessors)
  const columns = [
    { Header: "Vehicle", accessor: "vehicle", width: "15%" },
    { Header: "IMEI", accessor: "imei", width: "15%" },
    { Header: "Type", accessor: "type", width: "10%" },
    { Header: "Message", accessor: "message", width: "40%" },
    { Header: "Time", accessor: "time", width: "20%" },
  ];

  // 2. Map the raw API data (alertData) to your Table Components
  const rows = useMemo(() => {
    if (!alertData) return [];

    return alertData.map((item) => ({
      vehicle: <DataCell text={item.vehicleNumber || "N/A"} fontWeight="bold" />,
      imei: <DataCell text={item.imei} />,
      // Mapping "type" to your Status component colors
      type: <DataCell text={item.type} />,
      message: <DataCell text={item.message} />,
      time: <DataCell text={item.deviceTime} />,
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
        {/* Pass the dynamic rows here */}
        <CustomTable title="Filtered Alerts" columns={columns} rows={rows} />
      </DialogContent>
    </Dialog>
  );
};

// Update PropTypes to include the data and title from Dashboard
AlertModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.string,
  alertData: PropTypes.array,
};

export default AlertModal;
