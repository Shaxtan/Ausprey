import React, { useState } from "react";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import MDBox from "components/MDBox";
import Card from "@mui/material/Card";
import DataTable from "examples/Tables/DataTable";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";

// 1. **CORRECTION 1: Corrected Import Path for Data**
// It needs to look inside the 'data' folder for the correct file.
import dataTableData from "./data/authorstablesdata";

// 2. **CORRECTION 2: Corrected Import Path for TripReport**
// It needs to look inside the 'data' folder for the correct file.
import TripReport from "./data/TripReport";

function Tables() {
  // State to control the modal visibility
  const [modalOpen, setModalOpen] = useState(false);
  // State to store the ID of the trip to be displayed in the report
  const [selectedTripId, setSelectedTripId] = useState(null);

  // Handler to open the modal and set the trip ID
  const handleOpenModal = (tripId) => {
    setSelectedTripId(tripId);
    setModalOpen(true);
  };

  // Handler to close the modal and clear the trip ID
  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedTripId(null);
  };

  // 3. Get the table data, passing the handler function
  // This line should now execute correctly as dataTableData should be the function exported from the data file.
  const { columns, rows } = dataTableData(handleOpenModal);

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox pt={6} pb={3}>
        <Card>
          <MDBox p={3} lineHeight={1}>
            {/* ... Card Header Content ... */}
          </MDBox>
          <MDBox>
            <DataTable
              table={{ columns, rows }}
              isSorted={true}
              entriesPerPage={true}
              showTotalEntries={true}
              noEndBorder
            />
          </MDBox>
        </Card>
      </MDBox>

      {/* 4. The Modal/Dialog Implementation */}
      <Dialog open={modalOpen} onClose={handleCloseModal} maxWidth="lg" fullWidth scroll="body">
        <DialogTitle sx={{ m: 0, p: 2 }}>
          Trip Report Viewer (Trip ID: {selectedTripId})
          <IconButton
            aria-label="close"
            onClick={handleCloseModal}
            sx={{
              position: "absolute",
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ p: 0 }}>
          {/* 5. Conditionally Render the TripReport Component with the State ID */}
          {selectedTripId && <TripReport tripId={selectedTripId} />}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}

export default Tables;
