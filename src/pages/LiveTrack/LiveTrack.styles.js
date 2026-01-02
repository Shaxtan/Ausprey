// src/LiveTrack/LiveTrack.styles.js

// Common Colors
const COLORS = {
  selectedBorder: "rgb(25, 118, 210)",
  hoverBg: "#f5f5f5",
  rowHover: "rgba(25,118,210,0.06)",
  inactiveChip: "#344767",
  noDataChip: "#bdbdbd",
  white: "#FFFFFF",
  scrollTrack: "transparent",
  scrollThumb: "rgba(0, 0, 0, 0.4)",
  scrollThumbHover: "rgba(0, 0, 0, 0.6)",
};

export const styles = {

    stopButton: {
    color: "#000000 !important",       // Text Color
    borderColor: "#000000 !important", // Outline Color
    "& .material-icons-round": { color: "#000000 !important" }, // Icon Color
    "& .material-icons": { color: "#000000 !important" },
  },

    playButton: {
    color: "#FFFFFF !important",
    "& .material-icons-round": { color: "#FFFFFF !important" },
    "& .material-icons": { color: "#FFFFFF !important" },
  },
  // --- Main Layout ---
  dashboardContainer: (isLeftPanelOpen) => ({
    display: "flex",
    gap: isLeftPanelOpen ? 2 : 0,
    px: { xs: 1, sm: 2, md: 3 },
    pb: 2,
    pt: 0,
    height: "calc(100vh - 130px)",
    alignItems: "stretch",
  }),

  // --- Left Panel ---
  leftPanelContainer: (width) => ({
    width: { xs: "100%", sm: `${width}px` },
    flexShrink: 0,
    display: { xs: "block", sm: "block" },
    zIndex: 1500,
    display: "flex",
    flexDirection: "column",
    gap: 0,
    position: "relative",
    transition: "width 200ms ease",
    height: "100%",
  }),

  leftPanelHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    px: 2,
    py: 1,
    background: "transparent",
  },

  collapseButton: {
    borderRadius: 1,
    ml: 1,
    bgcolor: "rgba(0,0,0,0.04)",
    "&:hover": { bgcolor: "rgba(0,0,0,0.06)" },
  },

  expandButtonWrapper: {
    position: "absolute",
    top: 16,
    left: 12,
    zIndex: 1700,
  },

  expandButton: {
    bgcolor: "rgba(0,0,0,0.06)",
    "&:hover": { bgcolor: "rgba(0,0,0,0.09)" },
    boxShadow: 1,
  },

  statusScrollContainer: {
    width: "100%",
    overflowX: "auto",
    pb: 0.5,
    px: 1,
  },

  // --- Status Box Component ---
  statusBox: (isSelected) => ({
    p: 1.5,
    minWidth: 100,
    flexShrink: 0,
    flexGrow: 1,
    textAlign: "center",
    cursor: "pointer",
    transition: "all 0.2s",
    border: `2px solid ${isSelected ? COLORS.selectedBorder : "transparent"}`,
    boxShadow: isSelected
      ? "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)"
      : "none",
    "&:hover": {
      backgroundColor: COLORS.hoverBg,
    },
  }),

  // --- Device Table Component ---
  tableCard: {
    p: 0,
    overflow: "hidden",
    height: "calc(100vh - 250px) !important",
  },

  tableContainer: {
    maxHeight: "calc(100vh - 330px) !important",
    overflow: "auto !important",
    borderRadius: 0,
  },

  tableRoot: {
    tableLayout: "fixed !important",
    borderCollapse: "collapse !important",
    "& thead th": {
      background: "#fafafa !important",
      fontWeight: 700,
      py: "12px !important",
      borderBottom: "1px solid rgba(0,0,0,0.08) !important",
    },
  },

  tableRow: (selected) => ({
    cursor: "pointer",
    "&.Mui-selected": { backgroundColor: `${COLORS.rowHover} !important` },
  }),

  // Helper for table cells to avoid repetition
  cell: (width, align = "center", extra = {}) => ({
    width: `${width} !important`,
    textAlign: `${align} !important`,
    verticalAlign: "middle !important",
    color: "text.primary",
    fontWeight: 700,
    ...extra,
  }),

  // --- Map Area ---
  mapWrapper: {
    position: "relative",
    flexGrow: 1,
    height: "100%",
    borderRadius: 1,
    overflow: "hidden",
    boxShadow: "0 6px 18px rgba(15,15,15,0.08) !important",
    transition: "all 200ms ease",
  },

  // --- Right Overlay Panel ---
  overlayPanel: {
    position: "absolute",
    top: 12,
    right: 12,
    display: "flex",
    flexDirection: "column",
    gap: 1.5,
    width: { xs: "95%", sm: 320 },
    zIndex: 2000,
    maxHeight: "calc(100% - 24px)",
    overflowY: "auto",
    backdropFilter: "saturate(140%) blur(6px)",
    paddingRight: "4px",
    
    // Custom Scrollbar
    "&::-webkit-scrollbar": {
      width: "8px",
    },
    "&::-webkit-scrollbar-track": {
      background: COLORS.scrollTrack,
    },
    "&::-webkit-scrollbar-thumb": {
      background: COLORS.scrollThumb,
      borderRadius: "10px",
    },
    "&::-webkit-scrollbar-thumb:hover": {
      background: COLORS.scrollThumbHover,
    },
  },

  // --- Vehicle Header Box ---
  vehicleHeaderAvatar: {
    width: 170,
    height: 70,
    borderRadius: 0,
    bgcolor: "transparent",
    p: 0,
    overflow: "hidden",
    "& img": {
      objectFit: "cover",
    },
  },

  // --- Info Row ---
  infoRow: {
    display: "flex",
    justifyContent: "space-between",
    py: 0.6,
  },
  
  infoLabelBox: {
    display: "flex",
    gap: 1,
    alignItems: "center",
  },
};

// --- Helper Functions for Dynamic Styles ---

export const getCustomChipStyle = (status) => {
  const normalizedStatus = String(status || "").trim();
  if (normalizedStatus === "Inactive") {
    return { backgroundColor: COLORS.inactiveChip, color: COLORS.white };
  }
  if (normalizedStatus === "No Data" || normalizedStatus === "") {
    return { backgroundColor: COLORS.noDataChip, color: COLORS.white };
  }
  return {};
};

// --- Leaflet Marker HTML Generators ---

export const getVehicleMarkerHtml = (status) => {
  const color =
    status === "Running" ? "#4caf50" : status === "Stopped" ? "#f44336" : "#ff9800";

  return `
    <div style="
      background-color: ${color};
      width: 18px;
      height: 18px;
      border-radius: 50% 50% 50% 0;
      border: 3px solid white;
      box-shadow: 0 2px 8px rgba(0,0,0,0.4);
      transform: rotate(-45deg);
      position: relative;
    ">
      <div style="
        position: absolute;
        top: 3px;
        left: 3px;
        width: 6px;
        height: 6px;
        background: white;
        border-radius: 50%;
      "></div>
    </div>
  `;
};

export const getPlaybackMarkerHtml = () => `
  <div style="
    background-color:purple; 
    width:14px; 
    height:14px; 
    border-radius:50%; 
    border:3px solid white; 
    box-shadow: 0 0 8px rgba(128,0,128,1);
  "></div>
`;