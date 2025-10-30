import React, { useState, useEffect, useMemo } from "react";
import PropTypes from "prop-types"; // 👈 Import PropTypes
import ApiService from "../../../../services/ApiService";

// @mui material components
import Card from "@mui/material/Card";
import Icon from "@mui/material/Icon";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import CircularProgress from "@mui/material/CircularProgress";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

// Material Dashboard 2 React examples
import DataTable from "examples/Tables/DataTable";

// =========================================================================
// Helper Components with FIXED propTypes
// =========================================================================

const DataCell = ({ text, color = "text", fontWeight = "medium" }) => (
  <MDTypography variant="caption" color={color} fontWeight={fontWeight}>
    {text}
  </MDTypography>
);

// Prop-types validation for DataCell
DataCell.propTypes = {
  text: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  color: PropTypes.string,
  fontWeight: PropTypes.string,
};

const Status = ({ status }) => {
  let color;
  // Map internal GPS status to display status
  if (status === "Active") {
    color = "success";
  } else if (status === "Inactive") {
    color = "error";
  } else {
    color = "warning"; // Catch-all
  }

  return (
    <MDBox lineHeight={1}>
      <MDTypography variant="caption" color={color} fontWeight="bold" status={status}>
        {status}
      </MDTypography>
    </MDBox>
  );
};

// Prop-types validation for Status
Status.propTypes = {
  status: PropTypes.string.isRequired,
};

const Ignition = ({ status }) => {
  // Status prop here is the speed (number) used to determine ignition on/off
  const ignitionStatus = status > 0 ? "On" : "Off";
  let color = ignitionStatus === "On" ? "success" : "error";
  return (
    <MDTypography variant="caption" color={color} fontWeight="bold">
      {ignitionStatus}
    </MDTypography>
  );
};

// Prop-types validation for Ignition
Ignition.propTypes = {
  status: PropTypes.number.isRequired,
};

// Define the fixed table columns structure
const tableColumns = [
  { Header: "No", accessor: "no", width: "5%", align: "left" },
  { Header: "VEHICLE NO.", accessor: "vehicleNo", width: "10%", align: "left" },
  { Header: "VEHICLE NAME", accessor: "vehicleName", width: "12%", align: "left" },
  { Header: "GPS STATUS", accessor: "gpsStatus", width: "8%", align: "center" },
  { Header: "IGNITION", accessor: "ignitionStatus", width: "8%", align: "center" },
  { Header: "IMEI", accessor: "imei", width: "12%", align: "center" },
  { Header: "LATITUDE", accessor: "latitude", width: "10%", align: "center" },
  { Header: "LONGITUDE", accessor: "longitude", width: "10%", align: "center" },
  { Header: "ADDRESS", accessor: "address", width: "20%", align: "left" },
  { Header: "AVG. SPEED", accessor: "avgSpeed", width: "7%", align: "center" },
  { Header: "CURRENT SPEED", accessor: "currentSpeed", width: "8%", align: "center" },
];

function Projects() {
  const [menu, setMenu] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [allRows, setAllRows] = useState([]);

  const columns = tableColumns;

  const openMenu = ({ currentTarget }) => setMenu(currentTarget);
  const closeMenu = () => setMenu(null);

  // API Data Fetching Logic
  useEffect(() => {
    setLoading(true);
    ApiService.getDashboardData(
      {},
      (res) => {
        if (res?.data?.resultCode === 1 && res?.data?.data) {
          const { data } = res.data.data;

          // Data Transformation to DataTable Row Format
          const fetchedRows = data.map((item, index) => {
            const gpsDisplay = item.gps === "A" ? "Active" : item.gps === "V" ? "Inactive" : "N/A";

            const currentSpeedValue = item.speed !== null ? item.speed : 0;
            const avgSpeedValue = item.avg !== null ? item.avg : 0;

            // Map data to the DataCell/Status/Ignition components for the DataTable
            return {
              no: <DataCell text={String(index + 1)} />,
              vehicleNo: <DataCell text={item.vehnum || "N/A"} fontWeight="bold" />,
              vehicleName: <DataCell text={item.name || "N/A"} />,
              gpsStatus: <Status status={gpsDisplay} />,
              ignitionStatus: <Ignition status={currentSpeedValue} />,
              imei: <DataCell text={item.imei || "N/A"} />,
              latitude: <DataCell text={item.lat ? `${item.lat.toFixed(6)}°` : "N/A"} />,
              longitude: <DataCell text={item.lng ? `${item.lng.toFixed(6)}°` : "N/A"} />,
              address: <DataCell text={item.address || "N/A"} />,
              avgSpeed: <DataCell text={item.avg !== null ? `${avgSpeedValue} km/h` : "N/A"} />,
              currentSpeed: (
                <DataCell
                  text={item.speed !== null ? `${currentSpeedValue} km/h` : "N/A"}
                  color={currentSpeedValue > 0 ? "success" : "text"}
                  fontWeight="bold"
                />
              ),
            };
          });

          setAllRows(fetchedRows);
        } else {
          console.error("Trip data fetch failed:", res?.message || "Unknown error");
          setAllRows([]);
        }
        setLoading(false);
      },
      true,
      1
    );
  }, []);
  // End of API Data Fetching Logic

  // === Filtering Logic ===
  const filteredRows = useMemo(() => {
    if (!searchTerm || !allRows.length) {
      return allRows;
    }

    const lowerCaseSearchTerm = searchTerm.toLowerCase();

    return allRows.filter((row) => {
      // Helper function to safely extract text from the React component wrapper
      const extractText = (component) => {
        if (component && component.props) {
          if (component.props.text) return String(component.props.text);
          if (component.props.status) return String(component.props.status);
        }
        return "";
      };

      // Extract text content from the row objects
      const vehicleNo = extractText(row.vehicleNo).toLowerCase();
      const vehicleName = extractText(row.vehicleName).toLowerCase();
      const imei = extractText(row.imei).toLowerCase();
      const address = extractText(row.address).toLowerCase();
      const gpsStatus = extractText(row.gpsStatus).toLowerCase();

      // Search across relevant columns
      return (
        vehicleNo.includes(lowerCaseSearchTerm) ||
        vehicleName.includes(lowerCaseSearchTerm) ||
        imei.includes(lowerCaseSearchTerm) ||
        address.includes(lowerCaseSearchTerm) ||
        gpsStatus.includes(lowerCaseSearchTerm)
      );
    });
  }, [allRows, searchTerm]);
  // =======================

  const renderMenu = (
    <Menu
      id="simple-menu"
      anchorEl={menu}
      anchorOrigin={{ vertical: "top", horizontal: "left" }}
      transformOrigin={{ vertical: "top", horizontal: "right" }}
      open={Boolean(menu)}
      onClose={closeMenu}
    >
      <MenuItem onClick={closeMenu}>Action</MenuItem>
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
          table={{ columns, rows: filteredRows }} // Pass the fetched/filtered rows
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
