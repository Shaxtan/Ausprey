


import React, { useState, useMemo } from "react";
import PropTypes from "prop-types";

// MUI Components
import Card from "@mui/material/Card";
import Icon from "@mui/material/Icon";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import Select from "@mui/material/Select";
import FormControl from "@mui/material/FormControl";

// MD Components (Assumed path - adjust if necessary)
import MDBox from "../../assets/components/MDBox"; // Adjust path as needed
import MDTypography from "../../assets/components/MDTypography"; // Adjust path as needed
import DataTable from "../../assets/components/examples/Tables/DataTable"; // Adjust path as needed

// --- Helper Components ---

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

// FIX: Added PropTypes for DataCell
DataCell.propTypes = {
  text: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  color: PropTypes.string,
  fontWeight: PropTypes.string,
  isClickable: PropTypes.bool,
  onClick: PropTypes.func,
};

export const Status = ({ status }) => {
  const color = status === "Active" ? "success" : status === "Inactive" ? "error" : "warning";
  return (
    <MDBox lineHeight={1}>
      <MDTypography variant="caption" color={color} fontWeight="bold">
        {status}
      </MDTypography>
    </MDBox>
  );
};

// FIX: Added PropTypes for Status
Status.propTypes = {
  status: PropTypes.string.isRequired,
};

// --- Main Component ---

function CustomTable({ title, columns, rows }) {
  const [menu, setMenu] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [pageSize, setPageSize] = useState(10);

  const openMenu = ({ currentTarget }) => setMenu(currentTarget);
  const closeMenu = () => setMenu(null);

  const handlePageSizeChange = (event) => {
    setPageSize(event.target.value);
  };

  // Generic Search Logic
  const filteredRows = useMemo(() => {
    if (!searchTerm) return rows;

    const term = searchTerm.toLowerCase();
    return rows.filter((row) => {
      // Create an array of values from the row object to search through
      const values = Object.values(row).map((val) => {
        // If the value is a React component (like DataCell), try to grab props.text
        if (typeof val === "object" && val !== null && val.props && val.props.text) {
          return val.props.text;
        }
        // If it's a primitive
        return val;
      });
      
      return values.some((val) => String(val).toLowerCase().includes(term));
    });
  }, [rows, searchTerm]);

  return (
    <Card sx={{ height: "100%", mt: 3, overflow: "visible" }}>
      <MDBox position="relative" px={3} pt={3} pb={1}>
        
        {/* Header Section */}
        <MDBox display="flex" justifyContent="space-between" alignItems="center" mt={1.5}>
          
          {/* Title Area */}
          <MDBox display="flex" alignItems="center" width="100%">
            <MDBox mr={3}>
              <MDTypography variant="h6">
                {title}
                <MDTypography variant="button" color="text" ml={1}>
                  (<strong>{filteredRows.length}</strong> displayed)
                </MDTypography>
              </MDTypography>
            </MDBox>

            {/* Actions Area (Search, Page Size, Menu) */}
            <MDBox
              ml="auto"
              mr={2}
              width="50%" 
              display="flex"
              alignItems="center"
              justifyContent="flex-end"
            >
              {/* Search Bar */}
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
                  <MenuItem value={100}>100</MenuItem>
                </Select>
              </FormControl>
            </MDBox>

            {/* More Menu Icon */}
            <MDBox>
              <Icon sx={{ cursor: "pointer" }} fontSize="small" onClick={openMenu}>
                more_vert
              </Icon>
            </MDBox>
          </MDBox>

          {/* Menu Dropdown */}
          <Menu anchorEl={menu} open={Boolean(menu)} onClose={closeMenu}>
            <MenuItem onClick={closeMenu}>Refresh</MenuItem>
            <MenuItem onClick={closeMenu}>Export CSV</MenuItem>
            <MenuItem onClick={closeMenu}>Print</MenuItem>
          </Menu>
        </MDBox>
      </MDBox>

      {/* Table Section */}
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

// PropTypes for the Main Table Component
CustomTable.propTypes = {
  title: PropTypes.string.isRequired,
  columns: PropTypes.array.isRequired,
  rows: PropTypes.array.isRequired,
};

export default CustomTable;