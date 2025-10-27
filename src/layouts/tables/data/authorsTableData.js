/* eslint-disable react/prop-types */
/* eslint-disable react/function-component-definition */

import React from "react";
// Import PropTypes for the ActionButtons component
import PropTypes from "prop-types";
import TripReport from "./TripReport";
// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDBadge from "components/MDBadge";

// --- Mock Data: 10 Entries (unchanged) ---
const MockTripData = [
  {
    no: 1,
    accountName: "Acme Logistics",
    accountNumber: "ACC1001",
    tripId: "TRP001",
    routeId: "RTE456",
    source: "New York",
    destination: "Los Angeles",
    via: "Chicago, Denver",
    driverName: "Sarah Connor",
    imei: "IMEI12345",
    permitNumber: "PN7890",
    loadMaterial: "Electronics",
    permitStartDate: "2025-10-01",
    permitEndDate: "2025-10-31",
  },
  {
    no: 2,
    accountName: "Global Haulers Inc",
    accountNumber: "ACC1002",
    tripId: "TRP002",
    routeId: "RTE123",
    source: "Dallas",
    destination: "Miami",
    via: "Atlanta, Orlando",
    driverName: "John Doe",
    imei: "IMEI67890",
    permitNumber: "PN1234",
    loadMaterial: "Perishables",
    permitStartDate: "2025-10-05",
    permitEndDate: "2025-11-05",
  },
  {
    no: 3,
    accountName: "Coastal Transport",
    accountNumber: "ACC1003",
    tripId: "TRP003",
    routeId: "RTE789",
    source: "Seattle",
    destination: "San Diego",
    via: "Portland, SF",
    driverName: "Elena Rodriguez",
    imei: "IMEI54321",
    permitNumber: "PN0007",
    loadMaterial: "Machinery",
    permitStartDate: "2025-10-10",
    permitEndDate: "2025-12-10",
  },
  {
    no: 4,
    accountName: "Midwest Freight",
    accountNumber: "ACC1004",
    tripId: "TRP004",
    routeId: "RTE901",
    source: "Chicago",
    destination: "Houston",
    via: "St. Louis, Memphis",
    driverName: "Michael B.",
    imei: "IMEI24680",
    permitNumber: "PN3311",
    loadMaterial: "Auto Parts",
    permitStartDate: "2025-10-15",
    permitEndDate: "2025-11-15",
  },
  {
    no: 5,
    accountName: "Southwest Movers",
    accountNumber: "ACC1005",
    tripId: "TRP005",
    routeId: "RTE345",
    source: "Phoenix",
    destination: "Denver",
    via: "Albuquerque",
    driverName: "Jessica Alba",
    imei: "IMEI13579",
    permitNumber: "PN2200",
    loadMaterial: "Textiles",
    permitStartDate: "2025-10-20",
    permitEndDate: "2025-11-20",
  },
  {
    no: 6,
    accountName: "East Coast Cargo",
    accountNumber: "ACC1006",
    tripId: "TRP006",
    routeId: "RTE678",
    source: "Boston",
    destination: "Charlotte",
    via: "NYC, Philadelphia",
    driverName: "Tom Clancy",
    imei: "IMEI08642",
    permitNumber: "PN8877",
    loadMaterial: "Chemicals",
    permitStartDate: "2025-11-01",
    permitEndDate: "2025-12-01",
  },
  {
    no: 7,
    accountName: "Mountain Express",
    accountNumber: "ACC1007",
    tripId: "TRP007",
    routeId: "RTE007",
    source: "Salt Lake City",
    destination: "Boise",
    via: "Provo",
    driverName: "Liam Neeson",
    imei: "IMEI97531",
    permitNumber: "PN6543",
    loadMaterial: "Raw Materials",
    permitStartDate: "2025-11-10",
    permitEndDate: "2025-12-10",
  },
  {
    no: 8,
    accountName: "Metro Delivery",
    accountNumber: "ACC1008",
    tripId: "TRP008",
    routeId: "RTE210",
    source: "San Antonio",
    destination: "New Orleans",
    via: "Shreveport",
    driverName: "Mary Jane",
    imei: "IMEI11223",
    permitNumber: "PN4455",
    loadMaterial: "Furniture",
    permitStartDate: "2025-11-15",
    permitEndDate: "2025-12-15",
  },
  {
    no: 9,
    accountName: "Global Haulers Inc",
    accountNumber: "ACC1002",
    tripId: "TRP009",
    routeId: "RTE123",
    source: "Miami",
    destination: "Dallas",
    via: "Atlanta, Nashville",
    driverName: "John Doe",
    imei: "IMEI67890",
    permitNumber: "PN1234",
    loadMaterial: "Perishables",
    permitStartDate: "2025-11-20",
    permitEndDate: "2025-12-20",
  },
  {
    no: 10,
    accountName: "Acme Logistics",
    accountNumber: "ACC1001",
    tripId: "TRP010",
    routeId: "RTE456",
    source: "Los Angeles",
    destination: "New York",
    via: "Dallas, St. Louis",
    driverName: "Sarah Connor",
    imei: "IMEI12345",
    permitNumber: "PN7890",
    loadMaterial: "Electronics",
    permitStartDate: "2025-11-25",
    permitEndDate: "2025-12-25",
  },
];
// --- End Mock Data ---

// Helper component for simple text output
const DataCell = ({ text, color = "text", fontWeight = "regular" }) => (
  <MDTypography variant="caption" color={color} fontWeight={fontWeight}>
    {text}
  </MDTypography>
);

// Helper components (re-purposed)
const RouteMaterial = ({ routeId, material }) => (
  <MDBox lineHeight={1} textAlign="left">
    <MDTypography display="block" variant="caption" color="dark" fontWeight="medium">
      {routeId}
    </MDTypography>
    <MDTypography variant="caption" color="text">
      Load: <MDBadge badgeContent={material} color="info" variant="gradient" size="xs" />
    </MDTypography>
  </MDBox>
);

const PermitInfo = ({ permitNumber, start, end }) => (
  <MDBox lineHeight={1} textAlign="center">
    <MDTypography display="block" variant="caption" color="text" fontWeight="medium">
      {permitNumber}
    </MDTypography>
    <MDTypography variant="caption" color="text">
      {start} to {end}
    </MDTypography>
  </MDBox>
);

const TripGeography = ({ source, destination }) => (
  <MDBox lineHeight={1} textAlign="left">
    <MDTypography display="block" variant="caption" color="dark" fontWeight="medium">
      {source}
    </MDTypography>
    <MDTypography variant="caption" color="text">
      {destination}
    </MDTypography>
  </MDBox>
);

// --- MODIFIED ActionButtons COMPONENT ---
const ActionButtons = ({ tripId, onOpenModal }) => (
  <MDBox display="flex" alignItems="center" lineHeight={1} justifyContent="center">
    {/* 1. Trip Report Button (Opens Modal) */}
    <MDTypography
      component="a"
      // Calls the passed-in handler with the tripId.
      onClick={() => onOpenModal(tripId)}
      variant="caption"
      color="dark"
      fontWeight="medium"
      sx={{ mr: 1, textDecoration: "none", cursor: "pointer" }}
      title={`View Report for ${tripId}`}
    >
      <i className="material-icons" style={{ fontSize: "18px" }}>
        receipt_long
      </i>
    </MDTypography>

    <MDTypography
      component="a"
      href="#"
      variant="caption"
      color="error"
      fontWeight="medium"
      sx={{ mr: 1 }}
      title="Active Alert"
    >
      <i className="material-icons" style={{ fontSize: "18px" }}>
        notifications_active
      </i>
    </MDTypography>
    <MDTypography
      component="a"
      href="#"
      variant="caption"
      color="info"
      fontWeight="medium"
      title="Track Playback"
    >
      <i className="material-icons" style={{ fontSize: "18px" }}>
        timeline
      </i>
    </MDTypography>
  </MDBox>
);

// Add PropTypes for the ActionButtons component
ActionButtons.propTypes = {
  tripId: PropTypes.string.isRequired,
  onOpenModal: PropTypes.func.isRequired,
};

// --- CORRECTED data EXPORT FUNCTION ---
export default function data(onOpenModal) {
  // 💡 FIX: Provide a safe, non-crashing function if onOpenModal is undefined.
  const safeOnOpenModal =
    onOpenModal ||
    (() => {
      console.warn("Modal handler 'onOpenModal' was not provided to the table data function.");
    });

  return {
    // 1. Columns restructured to match your exact request
    columns: [
      { Header: "No", accessor: "no", width: "3%", align: "center" },
      { Header: "Account Name", accessor: "accountName", width: "15%", align: "left" },
      { Header: "Account Number", accessor: "accountNumber", width: "10%", align: "left" },
      { Header: "Trip ID", accessor: "tripId", width: "8%", align: "center" },
      { Header: "Route ID", accessor: "routeId", width: "8%", align: "center" },
      { Header: "Source", accessor: "source", width: "10%", align: "left" },
      { Header: "Destination", accessor: "destination", width: "10%", align: "left" },
      { Header: "Via", accessor: "via", width: "12%", align: "left" },
      { Header: "Driver Name", accessor: "driverName", width: "10%", align: "left" },
      { Header: "IMEI", accessor: "imei", width: "10%", align: "center" },
      { Header: "Permit Number", accessor: "permitNumber", width: "10%", align: "center" },
      { Header: "Load Material", accessor: "loadMaterial", width: "10%", align: "left" },
      { Header: "Permit Start Date", accessor: "permitStartDate", width: "10%", align: "center" },
      { Header: "Permit End Date", accessor: "permitEndDate", width: "10%", align: "center" },
      { Header: "Action", accessor: "action", width: "7%", align: "center" },
    ],

    // 2. Rows mapped to the new column structure
    rows: MockTripData.map((report) => ({
      no: <DataCell text={report.no} fontWeight="medium" />,
      accountName: <DataCell text={report.accountName} fontWeight="medium" />,
      accountNumber: <DataCell text={report.accountNumber} />,
      tripId: <DataCell text={report.tripId} color="info" fontWeight="bold" />,
      routeId: <DataCell text={report.routeId} />,
      source: <DataCell text={report.source} fontWeight="medium" />,
      destination: <DataCell text={report.destination} fontWeight="medium" />,
      via: <DataCell text={report.via} />,
      driverName: <DataCell text={report.driverName} fontWeight="medium" />,
      imei: <DataCell text={report.imei} />,
      permitNumber: <DataCell text={report.permitNumber} fontWeight="medium" />,
      loadMaterial: <DataCell text={report.loadMaterial} />,
      permitStartDate: <DataCell text={report.permitStartDate} />,
      permitEndDate: <DataCell text={report.permitEndDate} />,
      // Action column still uses the component for the buttons
      action: <ActionButtons tripId={report.tripId} onOpenModal={safeOnOpenModal} />,
    })),
  };
}
