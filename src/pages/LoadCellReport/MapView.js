import React, { useEffect, useRef, useState, useMemo } from "react";
import PropTypes from "prop-types"; 
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Material Dashboard 2 React components and layout
import MDBox from "../../assets/components/MDBox";
import MDTypography from "../../assets/components/MDTypography";
import Grid from "@mui/material/Grid";
import Icon from "@mui/material/Icon";
import Card from "@mui/material/Card";
import Collapse from "@mui/material/Collapse"; 
import IconButton from "@mui/material/IconButton";
import DashboardLayout from "../../assets/components/examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "../../assets/components/examples/Navbars/DashboardNavbar";


// ----------------------------------------------------------------------------------
// Helper Functions & Mock Data (FIXED SYNTAX)
// ----------------------------------------------------------------------------------

const createTileLayers = () => {
  return {
    OpenStreet: L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: '© OpenStreetMap contributors',
    }),
  };
};

const mockDevices = [
  { id: 1, name: "Truck 101", status: "Online", lat: 28.6139, lng: 77.2090, icon: "local_shipping", color: "#4CAF50" }, 
  { id: 2, name: "Crane 202", status: "Offline", lat: 19.0760, lng: 72.8777, icon: "construction", color: "#9E9E9E" }, 
  { id: 3, name: "Forklift 303", status: "Idle", lat: 13.0827, lng: 80.2707, icon: "forklift", color: "#FFC107" }, 
  { id: 4, name: "Bus 404", status: "Stopped", lat: 30.7333, lng: 76.7794, icon: "directions_bus", color: "#F44336" }, 
  { id: 5, name: "Truck 505", status: "Online", lat: 28.7041, lng: 77.1025, icon: "local_shipping", color: "#4CAF50" }, 
];

const getStatusCount = (data) => ({
  Online: data.filter(d => d.status === "Online").length,
  Offline: data.filter(d => d.status === "Offline").length,
  Idle: data.filter(d => d.status === "Idle").length,
  Stopped: data.filter(d => d.status === "Stopped").length,
});

const statusIcons = {
  Online: { icon: "wifi", color: "success", hex: "#4CAF50" },
  Offline: { icon: "wifi_off", color: "secondary", hex: "#9E9E9E" },
  Idle: { icon: "schedule", color: "warning", hex: "#FFC107" },
  Stopped: { icon: "do_not_disturb_on", color: "error", hex: "#F44336" },
};

const deviceIcon = (iconName, hexColor) => L.divIcon({
  className: 'custom-device-icon', 
  html: `<i class="material-icons-round" style="font-size: 24px; color: ${hexColor}; text-shadow: 0 0 5px rgba(0, 0, 0, 0.5);">${iconName}</i>`,
  iconSize: [24, 24],
  iconAnchor: [12, 24], 
});

const injectLeafletCustomCss = () => {
    const styleId = 'leaflet-custom-styles';
    if (!document.getElementById(styleId)) {
        const style = document.createElement('style');
        style.id = styleId;
        style.innerHTML = `
            .custom-device-icon {
                background: none !important;
                border: none !important;
                display: flex;
                justify-content: center;
                align-items: center;
                text-align: center;
            }
        `;
        document.head.appendChild(style);
    }
};

// ----------------------------------------------------------------------------------
// Status Card Component
// ----------------------------------------------------------------------------------
const StatusCard = ({ status, count, icon, color, active, onClick }) => {
    const colorName = Object.keys(statusIcons).find(key => statusIcons[key].hex === color) || 'info';
    const activeBorderColor = color; 
    
    const containerStyle = {
      cursor: "pointer", 
      transition: "all 0.2s",
      marginBottom: '8px', 
      padding: '0 4px', 
      width: '50%', 
    };

    const cardStyle = {
      padding: '12px', 
      border: active ? `2px solid ${activeBorderColor}` : '1px solid #ddd',
      opacity: active ? 1 : 0.9,
      boxShadow: active ? `0 6px 10px -4px ${color}80` : '0 1px 3px 0 rgba(0, 0, 0, 0.1)', 
      backgroundColor: active ? '#f5f5f5' : 'white', 
    };

    const iconBoxStyle = {
      background: color, 
      color: 'white',
      borderRadius: '4px', 
      boxShadow: `0 2px 4px -2px ${color}80`, 
      padding: '6px 8px', 
      lineHeight: 1,
      display: 'flex',
      alignItems: 'center',
    };

    return (
      <div style={containerStyle} onClick={onClick}>
        <Card style={cardStyle}>
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <MDTypography variant="caption" fontWeight="medium" color="text" textTransform="uppercase">
                {status}
              </MDTypography>
              <MDTypography variant="h5" fontWeight="bold" color={colorName}>
                {count}
              </MDTypography>
            </div>
            <div style={iconBoxStyle}>
              <Icon fontSize="small">{statusIcons[status].icon}</Icon>
            </div>
          </div>
        </Card>
      </div>
    );
};

StatusCard.propTypes = {
    status: PropTypes.string.isRequired,
    count: PropTypes.number.isRequired,
    icon: PropTypes.string.isRequired,
    color: PropTypes.string.isRequired, 
    active: PropTypes.bool.isRequired,
    onClick: PropTypes.func.isRequired,
};

// ----------------------------------------------------------------------------------
// Main MapView Component
// ----------------------------------------------------------------------------------

const MapView = () => {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const zoomDivRef = useRef(null);
  const markerLayerRef = useRef(L.layerGroup()); 
  const [activeStatus, setActiveStatus] = useState("All"); 
  const [listOpen, setListOpen] = useState(true); 

  const devices = mockDevices;
  const statusCounts = getStatusCount(devices);

  const indiaCenter = { lat: 22.5589409, lng: 75.6089374 };
  const baseMaps = createTileLayers();

  const filteredDevices = useMemo(() => activeStatus === "All" 
    ? devices 
    : devices.filter(d => d.status === activeStatus), [activeStatus, devices]);

  useEffect(() => {
    injectLeafletCustomCss();
  }, []);

  // --- Map Initialization Effect ---
  useEffect(() => {
    if (mapRef.current || !mapContainerRef.current) return; 

    const ZoomView = L.Control.extend({
      onAdd: function (map) {
        const div = L.DomUtil.create("div", "leaflet-zoom-control leaflet-bar-part leaflet-bar");
        div.innerHTML = "Zoom: " + map.getZoom();
        zoomDivRef.current = div;
        return div;
      },
      onRemove: function () {},
    });
    L.control.zoomview = (opts) => new ZoomView(opts);

    const map = L.map(mapContainerRef.current, {
      center: [indiaCenter.lat, indiaCenter.lng],
      zoom: 4,
      maxBounds: [
        [-90, -180],
        [90, 180],
      ],
      layers: [baseMaps["OpenStreet"]],
      zoomControl: false, 
    });

    mapRef.current = map;
    markerLayerRef.current.addTo(map);

    L.control.zoomview({ position: "topleft" }).addTo(map);
    L.control.layers(baseMaps, {}, { position: "topleft" }).addTo(map);
    L.control.scale().addTo(map);

    map.on("zoomend", () => {
      if (zoomDivRef.current) {
        zoomDivRef.current.innerHTML = "Zoom: " + map.getZoom();
      }
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [baseMaps]);


  // --- Marker Update Effect ---
  useEffect(() => {
    if (!mapRef.current) return;

    markerLayerRef.current.clearLayers();

    filteredDevices.forEach(device => {
      const marker = L.marker([device.lat, device.lng], {
        icon: deviceIcon(device.icon, device.color),
      }).bindPopup(`<b>${device.name}</b><br/>Status: ${device.status}`);
      
      markerLayerRef.current.addLayer(marker);
    });

    if (filteredDevices.length > 0) {
      const latLngs = filteredDevices.map(d => [d.lat, d.lng]);
      const bounds = L.latLngBounds(latLngs);
      mapRef.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 10 });
    } else {
       mapRef.current.setView([indiaCenter.lat, indiaCenter.lng], 4);
    }
  }, [filteredDevices]);


  // --- Handler for clicking on a device in the sidebar ---
  const handleDeviceClick = (device) => {
    if (mapRef.current) {
      mapRef.current.flyTo([device.lat, device.lng], 15);
      
      markerLayerRef.current.eachLayer(layer => {
        if (layer.getLatLng().lat === device.lat && layer.getLatLng().lng === device.lng) {
          layer.openPopup();
        }
      });
    }
  };

  const statusCardContainerStyle = {
    display: 'flex',
    flexWrap: 'wrap',
    margin: '0 -4px', 
    marginBottom: '16px',
  };

  const overlayPanelStyle = {
    position: 'absolute', 
    top: '24px',          
    right: '24px',        
    zIndex: 1000,         
    width: '350px',       
  }

  const deviceListItemStyle = (device) => ({
    padding: '8px', 
    margin: '4px 0', 
    borderRadius: '4px', 
    backgroundColor: activeStatus === device.status ? "#e9e9e9" : "#ffffff", 
    borderLeft: `3px solid ${device.color}`, 
    display: "flex",
    alignItems: "center",
    cursor: "pointer",
    transition: "background-color 0.2s",
    '&:hover': {
        backgroundColor: '#f0f0f0',
    }
  });


  return (
    <DashboardLayout>
      <DashboardNavbar />
      {/* MODIFICATION: Changed padding from '24px 0' to '8px 0'.
        This significantly reduces the space above the main map grid, 
        moving the entire content area closer to the DashboardNavbar. 
      */}
      <MDBox style={{ padding: '8px 0' }}> 
        <Grid container spacing={3}>
          
          {/* Map Container (Full width) */}
          <Grid item xs={12}>
            <MDBox style={{ height: "80vh" }}> 
              <Card 
                 style={{ height: "100%", padding: '16px', position: 'relative' }} 
              > 
                <MDTypography variant="h6" fontWeight="bold" style={{ marginBottom: '8px' }}>
                    Location Tracker
                </MDTypography>
                
                {/* Leaflet Map Div */}
                <div 
                  ref={mapContainerRef} 
                  style={{ height: "calc(100% - 30px)", width: "100%" }} 
                />

                {/* Status Panel (Overlay) */}
                {/* NOTE: The top position of this overlay panel is relative to the Card it's inside (24px).
                  The overall effect of moving it up is achieved by reducing the main container's padding.
                */}
                <div style={overlayPanelStyle}>
                    <Card style={{ padding: '16px', borderRadius: '12px', boxShadow: '0 10px 20px rgba(0,0,0,0.1)' }}>
                        <MDTypography variant="h6" fontWeight="bold" style={{ marginBottom: '16px' }}>
                            <Icon style={{ marginRight: '8px', verticalAlign: 'middle' }}>devices</Icon> Device Status Breakdown
                        </MDTypography>

                        {/* Status Cards */}
                        <div style={statusCardContainerStyle}>
                            {Object.keys(statusCounts).map((status) => {
                                const statusData = statusIcons[status];
                                return (
                                    <StatusCard
                                    key={status}
                                    status={status}
                                    count={statusCounts[status]}
                                    icon={statusData.icon}
                                    color={statusData.hex}
                                    active={activeStatus === status}
                                    onClick={() => setActiveStatus(status)}
                                    />
                                );
                            })}
                        </div>

                        {/* All Devices Button */}
                        <div 
                            onClick={() => setActiveStatus("All")} 
                            style={{ cursor: "pointer", marginBottom: '16px' }}
                        >
                            <MDTypography 
                            variant="button" 
                            color={activeStatus === "All" ? "info" : "text"} 
                            fontWeight="bold" 
                            style={{ 
                                display: 'block', 
                                padding: '8px', 
                                textAlign: 'center',
                                border: activeStatus === "All" ? `2px solid #3f51b5` : '1px dashed #ddd',
                                borderRadius: '4px'
                            }}
                            >
                            Show All Devices ({devices.length})
                            </MDTypography>
                        </div>
                        
                        {/* List Header and Collapse Toggle */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '24px', marginBottom: '8px' }}>
                            <MDTypography variant="h6" fontWeight="bold">
                                <Icon style={{ marginRight: '8px', verticalAlign: 'middle' }}>list</Icon> {activeStatus} Devices ({filteredDevices.length})
                            </MDTypography>
                            <IconButton 
                                onClick={() => setListOpen(!listOpen)}
                                size="small"
                            >
                                <Icon>{listOpen ? 'expand_less' : 'expand_more'}</Icon>
                            </IconButton>
                        </div>

                        {/* Device List (Collapsible) */}
                        <Collapse in={listOpen}>
                            <MDBox
                                style={{
                                maxHeight: "30vh",
                                overflowY: "auto",
                                border: "1px solid #f0f0f0",
                                borderRadius: "8px", 
                                padding: "8px", 
                                }}
                            >
                                {filteredDevices.map(device => (
                                    <div
                                        key={device.id}
                                        style={deviceListItemStyle(device)}
                                        onClick={() => handleDeviceClick(device)}
                                    >
                                        <MDTypography variant="caption" color="text" style={{ marginRight: '8px', lineHeight: 0, color: device.color }}>
                                            <Icon fontSize="small">{device.icon}</Icon>
                                        </MDTypography>
                                        <MDTypography variant="button" fontWeight="regular">
                                            {device.name}
                                        </MDTypography>
                                        <MDTypography variant="caption" color="text" style={{ marginLeft: 'auto' }}>
                                            {device.status}
                                        </MDTypography>
                                    </div>
                                ))}
                                {filteredDevices.length === 0 && (
                                    <MDTypography variant="caption" color="text" style={{ textAlign: 'center', display: 'block', padding: '16px' }}>
                                        No devices found for this status.
                                    </MDTypography>
                                )}
                            </MDBox>
                        </Collapse>
                    </Card>
                </div>
              </Card>
            </MDBox>
          </Grid>
        </Grid>
      </MDBox>
    </DashboardLayout>
  );};
  export default MapView;