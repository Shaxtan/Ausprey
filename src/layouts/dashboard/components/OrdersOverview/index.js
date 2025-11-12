/**
=========================================================
* Material Dashboard 2 React - v2.2.0
=========================================================
... (Copyright Notice) ...
*/

// @mui material components
import React, { useState, useMemo, useCallback } from "react";
import PropTypes from "prop-types"; // Required for PropTypes validation
import Card from "@mui/material/Card";
import Icon from "@mui/material/Icon";
import Modal from "@mui/material/Modal";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

// Material Dashboard 2 React example components
import TimelineItem from "examples/Timeline/TimelineItem";

// Recharts components for the heatmap visualization
import { ScatterChart, Scatter, XAxis, YAxis, ZAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';


// --- MOCK DATA ---
const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const topDevicesData = [
  {
    rank: 1,
    imei: "871234567890123",
    distance: "12,500 km",
    color: "success",
    icon: "military_tech",
    label: "Top Performer - Longest Distance",
    deviceColor: '#4CAF50', // New: Specific color for chart
  },
  {
    rank: 2,
    imei: "871234567890245",
    distance: "11,900 km",
    color: "info",
    icon: "trending_up",
    label: "High Mileage",
    deviceColor: '#2196F3', // New: Specific color for chart
  },
  {
    rank: 3,
    imei: "871234567890356",
    distance: "10,210 km",
    color: "primary",
    icon: "trending_up",
    label: "Consistent Runner",
    deviceColor: '#9C27B0', // New: Specific color for chart
  },
  {
    rank: 4,
    imei: "871234567890478",
    distance: "9,850 km",
    color: "dark",
    icon: "directions_car",
    label: "Above Average",
    deviceColor: '#344767', // New: Specific color for chart
  },
  {
    rank: 5,
    imei: "871234567890590",
    distance: "8,100 km",
    color: "text",
    icon: "directions_car",
    label: "Average Range",
    deviceColor: '#607D8B', // New: Specific color for chart
  },
];

const mockHeatmapData = {
  "871234567890123": [
    { dayIndex: 0, day: 'Mon', hour: 8, intensity: 0.95, device: 1 },
    { dayIndex: 0, day: 'Mon', hour: 17, intensity: 0.8, device: 1 },
    { dayIndex: 1, day: 'Tue', hour: 9, intensity: 0.7, device: 1 },
    { dayIndex: 2, day: 'Wed', hour: 18, intensity: 0.9, device: 1 },
    { dayIndex: 4, day: 'Fri', hour: 16, intensity: 0.6, device: 1 },
    { dayIndex: 5, day: 'Sat', hour: 10, intensity: 0.2, device: 1 },
  ],
  "871234567890245": [
    { dayIndex: 0, day: 'Mon', hour: 19, intensity: 0.5, device: 2 },
    { dayIndex: 1, day: 'Tue', hour: 20, intensity: 0.95, device: 2 },
    { dayIndex: 3, day: 'Thu', hour: 17, intensity: 0.8, device: 2 },
    { dayIndex: 6, day: 'Sun', hour: 14, intensity: 0.7, device: 2 },
  ],
  "871234567890356": [
    { dayIndex: 2, day: 'Wed', hour: 12, intensity: 0.8, device: 3 },
    { dayIndex: 4, day: 'Fri', hour: 9, intensity: 0.6, device: 3 },
  ],
  "871234567890478": [
    { dayIndex: 5, day: 'Sat', hour: 18, intensity: 0.4, device: 4 },
    { dayIndex: 1, day: 'Tue', hour: 11, intensity: 0.3, device: 4 },
  ],
  "871234567890590": [
    { dayIndex: 0, day: 'Mon', hour: 17, intensity: 0.2, device: 5 },
    { dayIndex: 3, day: 'Thu', hour: 13, intensity: 0.1, device: 5 },
  ],
};

// Function to map intensity (0.0 - 1.0) to a color
const getColor = (intensity) => {
  if (intensity > 0.8) return '#4CAF50'; 
  if (intensity > 0.6) return '#8BC34A';
  if (intensity > 0.4) return '#FFEB3B'; 
  if (intensity > 0.2) return '#FF9800';
  return '#B0BEC5'; 
};

// --- CUSTOM RECHARTS COMPONENTS ---

// 1. Custom Tooltip Component 
const CustomTooltip = ({ active, payload, selectedDevices }) => {
    if (active && payload && payload.length) {
        const dataPoint = payload[0].payload;
        // Find the device object using the 'device' property added to mock data
        const device = selectedDevices.find(d => d.rank === dataPoint.device);

        return (
            <div style={{ backgroundColor: '#fff', border: '1px solid #ccc', padding: '10px' }}>
                <p style={{ margin: 0, color: device ? device.deviceColor : '#000' }}>**Device:** #{dataPoint.device} (IMEI: ...{device ? device.imei.slice(-4) : 'Unknown'})</p>
                <p style={{ margin: 0 }}>**Day:** {dataPoint.day}</p>
                <p style={{ margin: 0 }}>**Hour:** {dataPoint.hour}:00</p>
                <p style={{ margin: 0 }}>**Activity:** {(dataPoint.intensity * 100).toFixed(0)}%</p>
            </div>
        );
    }
    return null;
};

CustomTooltip.propTypes = {
    active: PropTypes.bool,
    payload: PropTypes.arrayOf(
        PropTypes.shape({
            payload: PropTypes.shape({
                day: PropTypes.string,
                hour: PropTypes.number,
                intensity: PropTypes.number,
                device: PropTypes.number, // Added device rank
            }),
        })
    ),
    selectedDevices: PropTypes.arrayOf(PropTypes.object).isRequired,
};


// 2. Custom Scatter Shape Renderer 
const HeatmapRectShape = (props) => {
    const { cx, cy, payload } = props;
    
    // Use the color logic based on intensity
    const fill = getColor(payload.intensity); 

    return (
        <rect
            x={cx - 15}
            y={cy - 15}
            width={30}
            height={30}
            fill={fill}
        />
    );
};

HeatmapRectShape.propTypes = {
    cx: PropTypes.number,
    cy: PropTypes.number,
    payload: PropTypes.shape({
        intensity: PropTypes.number,
    }),
};


// --- HEATMAP CHART COMPONENT ---
const HeatmapChart = ({ data, imei, selectedDevices }) => {
    const maxIntensity = 1.0; 

    return (
        <MDBox sx={{ width: '100%', height: 350 }}>
            <MDTypography variant="subtitle2" sx={{ textAlign: 'center', mb: 1 }}>
                Aggregated Daily/Hourly Activity
            </MDTypography>
            <ResponsiveContainer width="100%" height="100%">
                <ScatterChart 
                    margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                >
                    <CartesianGrid />
                    <XAxis 
                        type="number" 
                        dataKey="hour" 
                        name="Hour" 
                        unit=":00" 
                        domain={[0, 23]}
                        tickCount={12}
                        label={{ value: 'Time of Day (Hour)', position: 'bottom' }}
                    />
                    <YAxis 
                        type="number" 
                        dataKey="dayIndex" 
                        name="Day" 
                        domain={[0, 6]} 
                        tickFormatter={(val) => days[val]}
                        height={30}
                        label={{ value: 'Day of Week', angle: -90, position: 'left' }}
                    />
                    <ZAxis 
                        type="number" 
                        dataKey="intensity" 
                        name="Intensity" 
                        range={[50, 400]} 
                        domain={[0, maxIntensity]}
                    />
                    {/* Pass selectedDevices to the CustomTooltip for contextual info */}
                    <Tooltip cursor={{ strokeDasharray: '3 3' }} content={<CustomTooltip selectedDevices={selectedDevices} />} />
                    
                    <Scatter 
                        name="All Selected Activity" 
                        data={data} 
                        fill="#8884d8"
                        shape={HeatmapRectShape}
                    />
                </ScatterChart>
            </ResponsiveContainer>
        </MDBox>
    );
};

// PropTypes validation for the main component 
HeatmapChart.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      dayIndex: PropTypes.number,
      day: PropTypes.string,
      hour: PropTypes.number,
      intensity: PropTypes.number,
      device: PropTypes.number, // Added device rank
    })
  ).isRequired,
  imei: PropTypes.string, // No longer strictly needed but kept for legacy
  selectedDevices: PropTypes.arrayOf(PropTypes.object).isRequired, // New: Array of selected device objects
};

// Style for the modal 
const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 750, 
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
  borderRadius: '8px',
};


function OrdersOverview() {
  const [openModal, setOpenModal] = useState(false);
  const [selectedDevices, setSelectedDevices] = useState([]);
  const [heatmapData, setHeatmapData] = useState([]);

  // Use useCallback to prevent re-creation on every render
  const handleDeviceClick = useCallback((device) => {
    // Check if the device is already selected
    const isSelected = selectedDevices.some(d => d.imei === device.imei);

    if (isSelected) {
      // If selected, remove it
      setSelectedDevices(prev => prev.filter(d => d.imei !== device.imei));
    } else {
      // If not selected, add it
      setSelectedDevices(prev => [...prev, device]);
    }
  }, [selectedDevices]);

  // Aggregates data from all selected devices
  const aggregateHeatmapData = useMemo(() => {
    return selectedDevices.flatMap(device => {
      return mockHeatmapData[device.imei] || [];
    });
  }, [selectedDevices]);

  // Handle opening modal after aggregation
  const handleOpenModal = () => {
    if (selectedDevices.length === 0) return; // Prevent opening if nothing is selected
    setHeatmapData(aggregateHeatmapData);
    setOpenModal(true);
  };
  
  const handleCloseModal = () => {
    setOpenModal(false);
    setHeatmapData([]);
  };

  return (
    <Card sx={{ height: "100%" }}>
      <MDBox pt={3} px={3}>
        <MDTypography variant="h6" fontWeight="medium">
          Top Distance Performers (Multi-Select Enabled)
        </MDTypography>
        <MDBox mt={0} mb={2}>
          <MDTypography variant="button" color="text" fontWeight="regular">
            <MDTypography display="inline" variant="body2" verticalAlign="middle">
              <Icon sx={{ color: ({ palette: { info } }) => info.main }}>local_shipping</Icon>{" "}
            </MDTypography>
            &nbsp;
            <MDTypography variant="button" color="text" fontWeight="medium">
              Click devices to select.
            </MDTypography>{" "}
            {/* FIX: Escaped the single quotes here */}
            Then click **&apos;Analyze Selected&apos;** below. 
          </MDTypography>
        </MDBox>
      </MDBox>

      <MDBox p={2}>
        {topDevicesData.map((device, index) => {
          const isSelected = selectedDevices.some(d => d.imei === device.imei);
          return (
            <div 
              key={device.imei} 
              onClick={() => handleDeviceClick(device)} 
              style={{ 
                cursor: 'pointer',
                // Highlight selected items
                border: isSelected ? '2px solid' : 'none',
                borderColor: isSelected ? device.deviceColor : 'transparent',
                borderRadius: '8px',
                padding: '2px', 
                marginBottom: '4px'
              }}
            >
              <TimelineItem
                color={device.color}
                icon={device.icon}
                title={`#${device.rank}: Device *${device.imei.slice(-4)}* - ${device.distance}`}
                dateTime={isSelected ? `SELECTED: ${device.label}` : device.label}
                lastItem={index === topDevicesData.length - 1}
              />
            </div>
          );
        })}
      </MDBox>

      {/* New: Action Button to Open Modal for Selected Devices */}
      <MDBox px={3} pb={2} pt={1} display="flex" justifyContent="space-between" alignItems="center">
        <MDTypography variant="caption" color="text">
          {selectedDevices.length} device(s) selected
        </MDTypography>
        <MDTypography 
          variant="button" 
          fontWeight="bold" 
          color={selectedDevices.length > 0 ? "info" : "secondary"}
          sx={{ cursor: selectedDevices.length > 0 ? 'pointer' : 'default' }}
          onClick={handleOpenModal}
          disabled={selectedDevices.length === 0}
        >
          Analyze Selected ({selectedDevices.length}) <Icon sx={{ ml: 1 }}>trending_up</Icon>
        </MDTypography>
      </MDBox>


      {/* The Pop-up Modal Component */}
      <Modal
        open={openModal}
        onClose={handleCloseModal}
        aria-labelledby="device-heatmap-title"
        aria-describedby="device-heatmap-description"
      >
        <Box sx={modalStyle}>
          <MDTypography id="device-heatmap-title" variant="h5" component="h2" mb={2}>
            Device Activity Analysis
          </MDTypography>
          
          <IconButton
            aria-label="close"
            onClick={handleCloseModal}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>

          {selectedDevices.length > 0 && (
            <Box id="device-heatmap-description">
              <MDTypography variant="subtitle1" fontWeight="bold">
                Selected Devices ({selectedDevices.length}):
              </MDTypography>
              <List dense sx={{ maxHeight: 80, overflowY: 'auto', mb: 2, border: '1px solid #eee', borderRadius: '4px' }}>
                {selectedDevices.map(device => (
                  <ListItem key={device.imei} sx={{ py: 0, px: 1 }}>
                    <Box sx={{ width: 10, height: 10, bgcolor: device.deviceColor, mr: 1, borderRadius: '50%' }} />
                    <ListItemText primary={`#${device.rank} (IMEI: ...${device.imei.slice(-4)}) - ${device.distance}`} sx={{ my: 0 }} />
                  </ListItem>
                ))}
              </List>

              <HeatmapChart 
                data={heatmapData} 
                imei={selectedDevices[0].imei} // Passing the first IMEI as a dummy prop
                selectedDevices={selectedDevices} // Passing the array of selected devices
              />
              
            </Box>
          )}
        </Box>
      </Modal>
    </Card>
  );
}

export default OrdersOverview;