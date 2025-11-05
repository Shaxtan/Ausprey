import React, { useState, useMemo } from "react";
// Import the custom hook containing API logic
import useLoadCellReportLogic from "./useLoadCellReportLogic"; // ADJUST PATH AS NEEDED

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import MDInput from "components/MDInput";

// Material Dashboard 2 React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";

// Material UI components
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import TextField from "@mui/material/TextField";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import InputLabel from "@mui/material/InputLabel";
import FormControl from "@mui/material/FormControl";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import Icon from "@mui/material/Icon";
import SendIcon from "@mui/icons-material/Send";
import CircularProgress from "@mui/material/CircularProgress"; // Added

// Recharts for the Graph
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

// Real Export Functions from utils
import { exportCSV, exportExcel, exportPDF } from "../utils/exportUtils";

// Placeholder for a Chatbot Icon URL
const CHATBOT_ICON_PLACEHOLDER = "https://cdn-icons-png.flaticon.com/512/4712/4712001.png";

// --- Main Component ---
function LoadCellReport() {
  // USE CUSTOM HOOK FOR ALL REPORT LOGIC AND STATE
  const {
    imei,
    setImei,
    imeis,
    fromDate,
    setFromDate,
    toDate,
    setToDate,
    showAverage,
    setShowAverage,
    showData,
    setShowData,
    exportFormat,
    setExportFormat,
    chartData,
    dateRange,
    showDownloadOptions,
    handleSubmit,
  } = useLoadCellReportLogic();

  // Download loading state
  const [downloading, setDownloading] = useState(false);

  // CHATBOT STATE & LOGIC (UNCHANGED)
  const CHAT_STEP = useMemo(
    () => ({
      ASK_IMEI: "ask_imei",
      SHOW_OPTIONS: "show_options",
      COMPLETE: "complete",
    }),
    []
  );

  const [isChatbotOpen, setIsChatbotOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      type: "bot",
      text: "Hello! I'm your virtual assistant. To begin, please provide the **IMEI** number of the device you want to manage.",
    },
  ]);
  const [imeiInput, setImeiInput] = useState("");
  const [chatStep, setChatStep] = useState(CHAT_STEP.ASK_IMEI);

  const toggleChatbot = () => {
    setIsChatbotOpen(!isChatbotOpen);
  };

  const handleImeiSubmit = () => {
    if (imeiInput.trim() === "") return;

    const newUserMessage = { type: "user", text: imeiInput.trim() };
    setMessages((prev) => [...prev, newUserMessage]);
    setImeiInput("");

    setTimeout(() => {
      const botResponse = {
        type: "bot",
        text: `Thank you. The IMEI **${newUserMessage.text}** has been successfully identified. What would you like to do next?`,
      };
      setMessages((prev) => [...prev, botResponse]);
      setChatStep(CHAT_STEP.SHOW_OPTIONS);

      const body = document.getElementById("chatbot-body-content");
      if (body) body.scrollTop = body.scrollHeight;
    }, 1000);
  };

  const handleOptionSelect = (option) => {
    const newUserMessage = { type: "user", text: option };
    setMessages((prev) => [...prev, newUserMessage]);

    setTimeout(() => {
      let botResponseText = "";
      if (option === "Alert Logs") {
        botResponseText =
          "You selected **Alert Logs**. I can navigate you to the appropriate section or provide a direct link to the log data.";
      } else {
        botResponseText = `You selected **${option}**. I will now open the corresponding dashboard view for this device.`;
      }

      const botResponse = {
        type: "bot",
        text: `${botResponseText} This conversation is now complete. You can close the widget.`,
      };
      setMessages((prev) => [...prev, botResponse]);
      setChatStep(CHAT_STEP.COMPLETE);

      const body = document.getElementById("chatbot-body-content");
      if (body) body.scrollTop = body.scrollHeight;
    }, 1000);
  };

  // --- CHATBOT STYLES (UNCHANGED) ---
  const iconStyle = {
    position: "fixed",
    bottom: "30px",
    right: "30px",
    width: "60px",
    height: "60px",
    borderRadius: "50%",
    cursor: "pointer",
    zIndex: 10000,
    backgroundColor: "#1A73E8",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  };

  const widgetStyle = {
    position: "fixed",
    bottom: "100px",
    right: "30px",
    width: "350px",
    height: "450px",
    backgroundColor: "#fff",
    borderRadius: "8px",
    boxShadow: "0 8px 30px rgba(0, 0, 0, 0.3)",
    zIndex: 9999,
    display: "flex",
    flexDirection: "column",
    opacity: isChatbotOpen ? 1 : 0,
    visibility: isChatbotOpen ? "visible" : "hidden",
    transform: isChatbotOpen ? "translateY(0)" : "translateY(20px)",
    transition: "opacity 0.3s ease, transform 0.3s ease, visibility 0.3s",
  };

  const headerStyle = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "10px 15px",
    backgroundColor: "#1A73E8",
    color: "white",
    borderTopLeftRadius: "8px",
    borderTopRightRadius: "8px",
  };

  const closeBtnStyle = {
    background: "none",
    border: "none",
    color: "white",
    fontSize: "1.5rem",
    cursor: "pointer",
    lineHeight: 1,
  };

  const bodyStyle = {
    flexGrow: 1,
    padding: "15px",
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  };

  const footerStyle = {
    padding: "10px 15px",
    borderTop: "1px solid #eee",
    display: "flex",
    gap: "8px",
  };

  const getMessageStyle = (type) => ({
    maxWidth: "80%",
    padding: "8px 12px",
    borderRadius: "18px",
    wordWrap: "break-word",
    margin: "0",
    fontSize: "0.9rem",
    alignSelf: type === "user" ? "flex-end" : "flex-start",
    backgroundColor: type === "user" ? "#1A73E8" : "#e9e9e9",
    color: type === "user" ? "white" : "#333",
    borderBottomLeftRadius: type === "user" ? "18px" : "2px",
    borderBottomRightRadius: type === "user" ? "2px" : "18px",
  });

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3}>
        {/* --- Search Form Card --- */}
        <Grid container spacing={3} mb={4}>
          <Grid item xs={12}>
            <Card>
              <MDBox pt={3} px={3}>
                <MDTypography variant="h6" fontWeight="medium">
                  Search Load Cell Data
                </MDTypography>
              </MDBox>
              <MDBox p={3}>
                <form onSubmit={handleSubmit}>
                  <Grid container spacing={3} alignItems="flex-end">
                    {/* IMEI Input */}
                    <Grid item xs={12} md={3}>
                      <FormControl fullWidth size="small" variant="outlined">
                        <InputLabel id="imei-select-label">Select IMEI</InputLabel>
                        <Select
                          labelId="imei-select-label"
                          id="imeiSelect"
                          value={imei}
                          label="Select IMEI"
                          onChange={(e) => setImei(e.target.value)}
                          required
                          size="small"
                          sx={{ height: 40 }}
                        >
                          <MenuItem value="" disabled>
                            -- Select IMEI --
                          </MenuItem>
                          {imeis.map((option) => (
                            <MenuItem key={option.value} value={option.value}>
                              {option.label}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>

                    {/* From Date-Time */}
                    <Grid item xs={12} md={3}>
                      <MDTypography variant="caption" display="block" mb={0.5}>
                        From Date-Time
                      </MDTypography>
                      <TextField
                        type="datetime-local"
                        fullWidth
                        value={fromDate}
                        onChange={(e) => setFromDate(e.target.value)}
                        required
                        InputLabelProps={{ shrink: true }}
                        variant="outlined"
                        size="small"
                      />
                    </Grid>

                    {/* To Date-Time */}
                    <Grid item xs={12} md={3}>
                      <MDTypography variant="caption" display="block" mb={0.5}>
                        To Date-Time
                      </MDTypography>
                      <TextField
                        type="datetime-local"
                        fullWidth
                        value={toDate}
                        onChange={(e) => setToDate(e.target.value)}
                        required
                        InputLabelProps={{ shrink: true }}
                        variant="outlined"
                        size="small"
                      />
                    </Grid>

                    {/* Checkboxes + Search */}
                    <Grid item xs={12} md={3} sx={{ display: "flex", alignItems: "center" }}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={showAverage}
                            onChange={(e) => setShowAverage(e.target.checked)}
                          />
                        }
                        label={
                          <MDTypography variant="button" fontWeight="regular">
                            Average
                          </MDTypography>
                        }
                        sx={{ mr: 1 }}
                      />
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={showData}
                            onChange={(e) => setShowData(e.target.checked)}
                          />
                        }
                        label={
                          <MDTypography variant="button" fontWeight="regular">
                            Data
                          </MDTypography>
                        }
                        sx={{ mr: 2 }}
                      />
                      <MDButton type="submit" variant="gradient" color="info">
                        Search
                      </MDButton>
                    </Grid>
                  </Grid>

                  {/* --- Download Options --- */}
                  {showDownloadOptions && chartData.length > 0 && (
                    <MDBox mt={4} display="flex" justifyContent="flex-end" alignItems="center">
                      <MDTypography variant="button" fontWeight="bold" mr={1.5}>
                        Format:
                      </MDTypography>

                      <FormControl variant="outlined" size="small" sx={{ minWidth: 150, mr: 1.5 }}>
                        <InputLabel id="format-select-label">Select Format</InputLabel>
                        <Select
                          labelId="format-select-label"
                          id="formatSelect"
                          value={exportFormat}
                          label="Select Format"
                          onChange={(e) => setExportFormat(e.target.value)}
                          size="small"
                          sx={{ height: 40 }}
                        >
                          <MenuItem value="">-- Select Format --</MenuItem>
                          <MenuItem value="csv">CSV</MenuItem>
                          <MenuItem value="excel">Excel</MenuItem>
                          <MenuItem value="pdf">PDF</MenuItem>
                        </Select>
                      </FormControl>

                      {/* DOWNLOAD BUTTON WITH LOADING */}
                      <MDButton
                        type="button"
                        variant="gradient"
                        color="success"
                        disabled={!exportFormat || downloading}
                        onClick={async () => {
                          if (!chartData || chartData.length === 0) {
                            alert("No data to export.");
                            return;
                          }

                          setDownloading(true);
                          const baseName = `LoadCellReport_${imei || "data"}_${Date.now()}`;

                          try {
                            if (exportFormat === "csv") {
                              exportCSV(chartData, `${baseName}.csv`);
                            } else if (exportFormat === "excel") {
                              exportExcel(chartData, `${baseName}.xlsx`);
                            } else if (exportFormat === "pdf") {
                              await exportPDF(chartData, `${baseName}.pdf`);
                            }
                          } catch (err) {
                            console.error("Export failed:", err);
                            alert("Export failed. Please try again.");
                          } finally {
                            setDownloading(false);
                          }
                        }}
                      >
                        {downloading ? (
                          <>
                            <CircularProgress size={18} sx={{ mr: 1 }} />
                            Generating...
                          </>
                        ) : (
                          "Download"
                        )}
                      </MDButton>
                    </MDBox>
                  )}
                </form>
              </MDBox>
            </Card>
          </Grid>
        </Grid>

        {/* --- Graph Card --- */}
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card>
              <MDBox pt={3} px={3}>
                <MDTypography variant="h6" fontWeight="medium">
                  Load Cell Graph with Averages
                </MDTypography>
              </MDBox>
              <MDBox p={3}>
                {dateRange && (
                  <MDTypography variant="body2" fontWeight="bold" align="center" mb={2}>
                    {dateRange}
                  </MDTypography>
                )}

                <MDBox sx={{ width: "100%", height: 500 }}>
                  {chartData.length === 0 ? (
                    <MDTypography textAlign="center" color="text.secondary" mt={8}>
                      Please select the date range for which you want to see the Load Cell Data.
                    </MDTypography>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={chartData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 10 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="time" />
                        <YAxis yAxisId="left" />
                        <Tooltip />
                        <Legend />

                        {showData && (
                          <>
                            <Area
                              type="monotone"
                              dataKey="V1"
                              stroke="#8884d8"
                              fill="#8884d8"
                              fillOpacity={0.3}
                              dot={false}
                              name="Load Cell 1"
                            />
                            <Area
                              type="monotone"
                              dataKey="V2"
                              stroke="#82ca9d"
                              fill="#82ca9d"
                              fillOpacity={0.3}
                              dot={false}
                              name="Load Cell 2"
                            />
                            <Area
                              type="monotone"
                              dataKey="V3"
                              stroke="#ffc658"
                              fill="#ffc658"
                              fillOpacity={0.3}
                              dot={false}
                              name="Load Cell 3"
                            />
                            <Area
                              type="monotone"
                              dataKey="V4"
                              stroke="#ce7e00"
                              fill="#ce7e00"
                              fillOpacity={0.3}
                              dot={false}
                              name="Load Cell 4"
                            />
                          </>
                        )}

                        {showAverage && (
                          <Area
                            type="monotone"
                            dataKey="Average"
                            stroke="#0000FF"
                            fill="#0000FF"
                            fillOpacity={0.4}
                            dot={false}
                            name="Average Load"
                          />
                        )}
                      </AreaChart>
                    </ResponsiveContainer>
                  )}
                </MDBox>
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </MDBox>

      {/* CHATBOT WIDGET (UNCHANGED) */}
      <div style={iconStyle} onClick={toggleChatbot}>
        <img
          src={CHATBOT_ICON_PLACEHOLDER}
          alt="Chatbot Icon"
          style={{ width: 30, height: 30, filter: "invert(1)" }}
        />
      </div>

      <div style={widgetStyle}>
        <div style={headerStyle}>
          <MDTypography variant="h6" color="white" style={{ margin: 0 }}>
            Virtual Assistant
          </MDTypography>
          <button style={closeBtnStyle} onClick={toggleChatbot}>
            ×
          </button>
        </div>

        <div id="chatbot-body-content" style={bodyStyle}>
          {messages.map((msg, index) => (
            <div key={index} style={getMessageStyle(msg.type)}>
              <MDTypography
                variant="button"
                fontWeight="regular"
                color={msg.type === "user" ? "white" : "dark"}
                dangerouslySetInnerHTML={{
                  __html: msg.text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>"),
                }}
              />
            </div>
          ))}

          {chatStep === CHAT_STEP.SHOW_OPTIONS && (
            <MDBox mt={1}>
              <MDButton
                variant="outlined"
                color="info"
                fullWidth
                sx={{ mb: 1.5 }}
                onClick={() => handleOptionSelect("Track/Play")}
              >
                Track/Play
              </MDButton>
              <MDButton
                variant="outlined"
                color="info"
                fullWidth
                sx={{ mb: 1.5 }}
                onClick={() => handleOptionSelect("Alert Logs")}
              >
                Alert Logs
              </MDButton>
              <MDButton
                variant="outlined"
                color="info"
                fullWidth
                onClick={() => handleOptionSelect("Trip Report")}
              >
                Trip Report
              </MDButton>
            </MDBox>
          )}
        </div>

        <div style={footerStyle}>
          {chatStep === CHAT_STEP.ASK_IMEI ? (
            <>
              <MDInput
                type="text"
                placeholder="Enter IMEI (e.g., 123456)"
                value={imeiInput}
                onChange={(e) => setImeiInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleImeiSubmit()}
                size="small"
                fullWidth
                autoFocus={isChatbotOpen}
              />
              <MDButton
                variant="gradient"
                color="info"
                iconOnly
                onClick={handleImeiSubmit}
                sx={{ minWidth: "40px", height: "36px" }}
              >
                <Icon>
                  <SendIcon />
                </Icon>
              </MDButton>
            </>
          ) : (
            <MDInput
              type="text"
              placeholder={
                chatStep === CHAT_STEP.COMPLETE
                  ? "Conversation is complete"
                  : "Select an option above"
              }
              disabled
              size="small"
              fullWidth
            />
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

export default LoadCellReport;
