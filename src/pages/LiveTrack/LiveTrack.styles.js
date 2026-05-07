// src/LiveTrack/LiveTrack.styles.js

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
    color: "#000000 !important",
    borderColor: "#000000 !important",
    "& .material-icons-round": { color: "#000000 !important" },
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
    height: "calc(100vh - 64px)",
    minHeight: 0,
    alignItems: "stretch",
    position: "relative",
  }),

  // --- Left Panel ---
  leftPanelContainer: (width) => ({
    width: { xs: "100%", sm: `${width * 0.6}px` },
    flexShrink: 0,
    display: { xs: "block", sm: "flex" },
    flexDirection: "column",
    gap: 0,
    zIndex: 1500,
    position: "relative",
    transition: "width 200ms ease",
    height: "100%",
    minHeight: 0,
    marginLeft: -4,
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
    flexGrow: 1,
    minHeight: 0,
    display: "flex",
    flexDirection: "column",
  },

  tableContainer: {
    flexGrow: 1,
    minHeight: 0,
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
    minHeight: 0,
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

/**
 * getRotatingTruckHtml
 *
 * Renders the truck marker div that is placed inside a Leaflet divIcon.
 *
 * BEARING CONVENTION
 * ------------------
 * The `bearing` parameter received here is already the *CSS rotation angle*
 * (i.e. the geographic bearing minus 90°, applied in LiveTrack.js before
 * calling this function). This keeps the style file free of navigation math.
 *
 * WHY −90°?
 * The flaticon truck image (1048329.png) faces East (right) at 0° CSS rotation.
 * Geographic bearing 0° = North. So we subtract 90° in the caller to align the
 * icon's nose with the direction of travel.
 *
 * SMOOTH ROTATION
 * ---------------
 * `transition: transform 0.8s ease-out` makes the truck rotate gracefully
 * when the bearing changes, avoiding the jarring snap of the original code.
 */
export const getRotatingTruckHtml = (status, bearing = 0, isHighlighted = false) => {
  const TRUCK_ICON_URL = "https://cdn-icons-png.flaticon.com/512/1048/1048329.png";

  return `
    <div style="
      width: 40px;
      height: 40px;
      transform: rotate(${bearing}deg);
      transition: transform 0.15s linear;   /* ← shorter, snappier */
      display: flex;
      justify-content: center;
      align-items: center;
      filter: drop-shadow(0px 2px 4px rgba(0,0,0,0.3));
    ">
      <img src="${TRUCK_ICON_URL}" style="width: 100%; height: 100%;" />
    </div>
  `;
};

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

export const getVehicleMarkerHtml = (status) => {
  const color = status === "Running" ? "#4caf50" : status === "Stopped" ? "#f44336" : "#ff9800";

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
