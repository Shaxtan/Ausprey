import React from "react";
import PropTypes from "prop-types";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  AreaChart,
  Area,
  BarChart,
  Bar,
} from "recharts";
import { Container, Row, Col, Card } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";

// ----------------------------------------------------------------------
// InfoCard Component (Corrected for Modal context)
// ----------------------------------------------------------------------

const InfoCard = ({ label, value, colors, chart }) => {
  return (
    <Col md={3} className="mb-4">
      <Card
        className="shadow-sm border-0 rounded-4 text-white p-3"
        style={{
          background: `linear-gradient(135deg, ${colors[0]}, ${colors[1]})`,
          minHeight: "140px",
          cursor: "default",
        }}
      >
        <div className="d-flex flex-column justify-content-between h-100">
          <div>
            <Card.Text className="small text-uppercase mb-1">{label}</Card.Text>
            <Card.Title className="h5 fw-bold">{value}</Card.Title>
          </div>
          <div style={{ height: "50px" }}>{chart}</div>
        </div>
      </Card>
    </Col>
  );
};

// PropType validation for InfoCard
InfoCard.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  colors: PropTypes.arrayOf(PropTypes.string).isRequired,
  chart: PropTypes.node,
};

// ----------------------------------------------------------------------
// Custom Tooltip for Recharts (unchanged)
// ----------------------------------------------------------------------

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div
        style={{
          background: "white",
          padding: "8px",
          borderRadius: "6px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
        }}
      >
        <p style={{ fontWeight: "bold", marginBottom: "4px" }}>{label}</p>
        {payload.map((pld, index) => (
          <p
            key={index}
            style={{
              color: pld.payload.colorStart || pld.color || pld.fill,
              margin: 0,
            }}
          >
            {pld.name}: {pld.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// PropType validation for CustomTooltip
CustomTooltip.propTypes = {
  active: PropTypes.bool,
  payload: PropTypes.arrayOf(PropTypes.object),
  label: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

// ----------------------------------------------------------------------
// Sample Data (unchanged)
// ----------------------------------------------------------------------

const fuelData = [
  { name: "Consumed (65%)", value: 65, colorStart: "#FF6B6B", colorEnd: "#DE483C" },
  { name: "Remaining (35%)", value: 35, colorStart: "#4ECDC4", colorEnd: "#25A69A" },
];

const fuelTrendData = [
  { day: "Mon", fuel: 50, lastMonthFuel: 45 },
  { day: "Tue", fuel: 55, lastMonthFuel: 50 },
  { day: "Wed", fuel: 52, lastMonthFuel: 53 },
  { day: "Thu", fuel: 60, lastMonthFuel: 58 },
  { day: "Fri", fuel: 58, lastMonthFuel: 62 },
  { day: "Sat", fuel: 54, lastMonthFuel: 50 },
  { day: "Sun", fuel: 57, lastMonthFuel: 55 },
];

const speedData = [
  { trip: "Trip 1", speed: 60, speedLimit: 80 },
  { trip: "Trip 2", speed: 75, speedLimit: 80 },
  { trip: "Trip 3", speed: 55, speedLimit: 80 },
  { trip: "Trip 4", speed: 90, speedLimit: 80 },
  { trip: "Trip 5", speed: 85, speedLimit: 80 },
  { trip: "Trip 6", speed: 68, speedLimit: 80 },
  { trip: "Trip 7", speed: 72, speedLimit: 80 },
];

const vehicleUsageData = [
  { month: "Apr", deviceA: 70, deviceB: 60 },
  { month: "May", deviceA: 80, deviceB: 75 },
  { month: "Jun", deviceA: 65, deviceB: 68 },
  { month: "Jul", deviceA: 90, deviceB: 85 },
  { month: "Aug", deviceA: 75, deviceB: 70 },
  { month: "Sep", deviceA: 95, deviceB: 88 },
];

// ----------------------------------------------------------------------
// TripReport Main Component (Corrected)
// ----------------------------------------------------------------------

// Component correctly accepts tripId as a prop
export default function TripReport({ tripId }) {
  // Use a default value for safety if tripId is somehow missing
  const displayTripId = tripId || "N/A";

  const infoCardsData = [
    {
      label: "Vehicle Number",
      value: "MH12-AB-1234",
      colors: ["#36d1dc", "#5b86e5"],
      chart: (
        <ResponsiveContainer width="100%" height={50}>
          <AreaChart data={[{ v: 3 }, { v: 4 }, { v: 6 }, { v: 5 }]}>
            <Area type="monotone" dataKey="v" stroke="white" fill="rgba(255,255,255,0.6)" />
          </AreaChart>
        </ResponsiveContainer>
      ),
    },
    {
      label: "IMEI Number",
      value: "862950123456789",
      colors: ["#56ab2f", "#a8e063"],
      chart: (
        <ResponsiveContainer width="100%" height={50}>
          <LineChart data={[{ v: 2 }, { v: 5 }, { v: 3 }, { v: 7 }]}>
            <Line type="monotone" dataKey="v" stroke="white" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      ),
    },
    {
      label: "Trip ID",
      // Correctly displays the tripId received from props
      value: displayTripId,
      colors: ["#667eea", "#764ba2"],
      chart: (
        <ResponsiveContainer width="100%" height={50}>
          <BarChart data={[{ v: 5 }, { v: 2 }, { v: 7 }, { v: 4 }]}>
            <Bar dataKey="v" fill="rgba(255,255,255,0.8)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      ),
    },
    {
      label: "Active Alerts",
      value: 12,
      colors: ["#ff6a00", "#ee0979"],
      chart: (
        <ResponsiveContainer width="100%" height={50}>
          <BarChart data={[{ v: 4 }, { v: 6 }, { v: 3 }, { v: 5 }]}>
            <Bar dataKey="v" fill="rgba(255,255,255,0.8)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      ),
    },
  ];

  return (
    <Container fluid className="py-2">
      {/* Header (Simplified since DialogTitle handles the main title) */}
      <Row className="mb-3">
        <Col>
          <h5 className="h5 fw-bold text-dark">Report Details for: {displayTripId}</h5>
        </Col>
      </Row>

      {/* Row 1: Gradient Info Cards (Vehicle, IMEI, Trip ID, Alerts) */}
      <Row className="mb-4">
        {infoCardsData.map((card, idx) => (
          <InfoCard key={idx} {...card} />
        ))}
      </Row>

      {/* Row 2: Vehicle Usage (8 col) + Fuel Percentage (4 col) */}
      <Row className="mb-4">
        {/* Vehicle Usage Comparison (6 Months) */}
        <Col md={8}>
          <Card className="shadow-sm border-0 rounded-4 h-100 p-4">
            <Card.Title className="h6 fw-bold text-center text-muted mb-4">
              Vehicle Usage Comparison (6 Months)
            </Card.Title>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={vehicleUsageData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <defs>
                  <linearGradient id="colorDeviceA" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="10%" stopColor="#667eea" stopOpacity={0.8} />
                    <stop offset="90%" stopColor="#764ba2" stopOpacity={0.2} />
                  </linearGradient>
                  <linearGradient id="colorDeviceB" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="10%" stopColor="#ff6a00" stopOpacity={0.8} />
                    <stop offset="90%" stopColor="#ee0979" stopOpacity={0.2} />
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  dataKey="deviceA"
                  stroke="#667eea"
                  strokeWidth={3}
                  fill="url(#colorDeviceA)"
                  name="Device A"
                />
                <Area
                  type="monotone"
                  dataKey="deviceB"
                  stroke="#ff6a00"
                  strokeWidth={3}
                  fill="url(#colorDeviceB)"
                  name="Device B"
                />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        {/* Fuel Percentage Pie Chart */}
        <Col md={4}>
          <Card className="shadow-sm border-0 rounded-4 h-100 p-4">
            <Card.Title className="h6 fw-bold text-center text-muted mb-4">
              Fuel Percentage
            </Card.Title>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <defs>
                  {fuelData.map((entry, index) => (
                    <linearGradient
                      key={`gradient-${index}`}
                      id={`gradient${entry.name.replace(/\s/g, "")}`}
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor={entry.colorStart} stopOpacity={0.9} />
                      <stop offset="95%" stopColor={entry.colorEnd} stopOpacity={0.8} />
                    </linearGradient>
                  ))}
                </defs>
                <Pie
                  data={fuelData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  dataKey="value"
                >
                  {fuelData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={`url(#gradient${entry.name.replace(/\s/g, "")})`}
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      {/* Row 3: Average Speed (6 col) + Average Fuel Trend (6 col) */}
      <Row>
        {/* Average Speed Bar Chart */}
        <Col md={6}>
          <Card className="shadow-sm border-0 rounded-4 h-100 p-4">
            <Card.Title className="h6 fw-bold text-center text-muted mb-4">
              Average Speed (km/h)
            </Card.Title>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={speedData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="trip" />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <defs>
                  <linearGradient id="colorSpeedActual" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="20%" stopColor="#FF6B6B" stopOpacity={0.9} />
                    <stop offset="80%" stopColor="#ff9a9e" stopOpacity={0.6} />
                  </linearGradient>
                  <linearGradient id="colorSpeedLimit" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="20%" stopColor="#4ECDC4" stopOpacity={0.9} />
                    <stop offset="80%" stopColor="#7be495" stopOpacity={0.6} />
                  </linearGradient>
                </defs>
                <Bar
                  dataKey="speed"
                  fill="url(#colorSpeedActual)"
                  name="Actual Speed"
                  barSize={20}
                  radius={[10, 10, 0, 0]}
                />
                <Bar
                  dataKey="speedLimit"
                  fill="url(#colorSpeedLimit)"
                  name="Speed Limit"
                  barSize={20}
                  radius={[10, 10, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        {/* Average Fuel (Consumption) Trend Line Chart */}
        <Col md={6}>
          <Card className="shadow-sm border-0 rounded-4 h-100 p-4">
            <Card.Title className="h6 fw-bold text-center text-muted mb-4">
              Average Fuel Trend
            </Card.Title>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={fuelTrendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <defs>
                  <linearGradient id="fuelThisMonth" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="5%" stopColor="#FF6B6B" stopOpacity={0.9} />
                    <stop offset="95%" stopColor="#DE483C" stopOpacity={0.8} />
                  </linearGradient>
                  <linearGradient id="fuelLastMonth" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="5%" stopColor="#4ECDC4" stopOpacity={0.9} />
                    <stop offset="95%" stopColor="#25A69A" stopOpacity={0.8} />
                  </linearGradient>
                </defs>
                <Line
                  type="monotone"
                  dataKey="fuel"
                  stroke="url(#fuelThisMonth)"
                  strokeWidth={3}
                  dot={{ r: 5 }}
                  name="Fuel Today"
                />
                <Line
                  type="monotone"
                  dataKey="lastMonthFuel"
                  stroke="url(#fuelLastMonth)"
                  strokeWidth={3}
                  dot={{ r: 5 }}
                  name="Fuel Avg"
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

// PropType validation for the new prop
TripReport.propTypes = {
  tripId: PropTypes.string.isRequired,
};
