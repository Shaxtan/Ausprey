import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useLoadCellReportLogic from "./useLiveLoadGraphLogic";
import ReactSelect from "react-select";

// Material Dashboard 2 React components
import MDBox from "../../../src/assets/components/MDBox";
import MDTypography from "../../../src/assets/components/MDTypography";
import MDButton from "../../../src/assets/components/MDButton";
import MDInput from "../../../src/assets/components/MDInput";

// Material Dashboard 2 React example components
import DashboardLayout from "../../../src/assets/components/examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "../../../src/assets/components/examples/Navbars/DashboardNavbar";

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
import CircularProgress from "@mui/material/CircularProgress";

// Recharts
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

// Export utils
import { exportCSV, exportExcel, exportPDF } from "../../../src/pages/utils/exportUtils";

// API Service
import ApiService from "../../../src/services/ApiService";

// Chatbot Icon
const CHATBOT_ICON_PLACEHOLDER = "https://cdn-icons-png.flaticon.com/512/4712/4712001.png";

function LiveLoadGraph() {
  const {
    imei,
    setImei,
    imeis, // fallback list from the hook (used when no account is selected)
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

  const navigate = useNavigate();

  // ─── Account & IMEI state ───────────────────────────────────────────────────
  const [accounts, setAccounts] = useState([]);
  const [selectedAccountId, setSelectedAccountId] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshTime, setLastRefreshTime] = useState(Date.now());

  // Local imeiOptions driven by selected account; falls back to hook's list
  const [imeiOptions, setImeiOptions] = useState([]);

  // ─── Fetch accounts on mount ────────────────────────────────────────────────
  useEffect(() => {
    ApiService.getAccountDropdown((res) => {
      if (res?.data?.resultCode === 1) {
        const mapped = res.data.data.map((acc) => ({
          id: String(acc.accid ?? acc.id ?? ""),
          name: acc.accountName ?? acc.name ?? String(acc.accid ?? acc.id),
        }));
        setAccounts(mapped);

        // ✅ Auto-select the logged-in user's account
        try {
          const user = JSON.parse(localStorage.getItem("userDetails") || "{}");
          const loggedInAccountId = String(user?.accountId || user?.accid || "");

          const match = mapped.find((acc) => acc.id === loggedInAccountId);

          if (match) {
            setSelectedAccountId(match.id);
          } else if (mapped.length > 0) {
            setSelectedAccountId(mapped[0].id); // fallback to first
          }
        } catch {
          if (mapped.length > 0) setSelectedAccountId(mapped[0].id);
        }
      }
    });
  }, []);

  // ─── Sync fallback imeis from hook when no account is selected ──────────────
  useEffect(() => {
    if (!selectedAccountId) {
      setImeiOptions((imeis || []).map((o) => ({ value: o.value, label: o.label })));
    }
  }, [imeis, selectedAccountId]);

  // ─── Fetch IMEIs whenever the selected account changes ──────────────────────
  useEffect(() => {
    if (!selectedAccountId) return;

    setImei(""); // reset previously selected IMEI
    setImeiOptions([]); // clear while loading

    ApiService.getImeiDropdown(selectedAccountId)
      .then((res) => {
        const vehicles = res?.data?.response?.vehicles || [];
        setImeiOptions(
          vehicles.map((v) => ({
            value: v.imei,
            label: v.vehnum ? `${v.vehnum} (${v.imei})` : v.imei,
          }))
        );
      })
      .catch(() => {
        setImeiOptions([]);
      });
  }, [selectedAccountId]);

  // ─── Navbar handlers ────────────────────────────────────────────────────────
  const handleAccountChange = (e) => {
    setSelectedAccountId(String(e.target.value));
  };

  const handleManualRefresh = () => {
    setIsRefreshing(true);
    setLastRefreshTime(Date.now());
    setTimeout(() => setIsRefreshing(false), 1500);
  };

  // ─── Misc local state ───────────────────────────────────────────────────────
  const [downloading, setDownloading] = useState(false);

  // ─── Chatbot logic ──────────────────────────────────────────────────────────
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

  const toggleChatbot = () => setIsChatbotOpen(!isChatbotOpen);

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
        botResponseText = "You selected **Alert Logs**. Redirecting you to the Alerts page now...";
        navigate("/alerts");
      } else if (option === "Track/Play") {
        botResponseText =
          "You selected **Track/Play**. Redirecting you to the device tracking view now...";
        navigate("/notifications");
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

  // ─── Chatbot styles ─────────────────────────────────────────────────────────
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

  // ─── Average colour config ──────────────────────────────────────────────────
  const getAverageColorConfig = () => {
    if (chartData.length === 0) return null;
    const latestAvg = parseFloat(chartData[chartData.length - 1].Average);
    if (latestAvg > 100) {
      return { stroke: "#d32f2f", fill: "#ffcdd2", labelColor: "error", labelText: "High Load" };
    } else if (latestAvg > 50) {
      return {
        stroke: "#388e3c",
        fill: "#c8e6c9",
        labelColor: "success",
        labelText: "Moderate Load",
      };
    } else {
      return { stroke: "#1976d2", fill: "#bbdefb", labelColor: "info", labelText: "Low Load" };
    }
  };

  const averageConfig = showAverage && chartData.length > 0 ? getAverageColorConfig() : null;

  // ─── Render ─────────────────────────────────────────────────────────────────
  return (
    <DashboardLayout>
      {/* ── Navbar – now receives account props ── */}
      <DashboardNavbar
        handleAccountChange={handleAccountChange}
        selectedAccountId={selectedAccountId}
        accounts={accounts}
        onManualRefresh={handleManualRefresh}
        isRefreshing={isRefreshing}
        lastRefreshTime={lastRefreshTime}
      />

      <MDBox py={3}>
        {/* ── Search + Format + Download in ONE row ── */}
        <Grid container spacing={3} mb={4}>
          <Grid item xs={12}>
            <Card>
              <MDBox pt={3} px={3}>
                <MDTypography variant="h6" fontWeight="medium">
                  Search Live Load Cell Data
                </MDTypography>
              </MDBox>

              <MDBox p={3}>
                <form onSubmit={handleSubmit}>
                  <Grid container spacing={3} alignItems="flex-end">
                    {/* ── Searchable IMEI dropdown (filtered by selected account) ── */}
                    <Grid item xs={12} md={3}>
                      <MDBox mb={0.5}>
                        <MDTypography variant="caption" display="block" mb={0.5} fontWeight="bold">
                          Select IMEI
                          {!selectedAccountId && (
                            <MDTypography
                              component="span"
                              variant="caption"
                              color="text"
                              fontWeight="regular"
                              ml={0.5}
                            >
                              (select an account first)
                            </MDTypography>
                          )}
                        </MDTypography>
                      </MDBox>

                      <ReactSelect
                        options={imeiOptions}
                        value={imeiOptions.find((opt) => opt.value === imei) || null}
                        onChange={(selected) => setImei(selected ? selected.value : "")}
                        placeholder={
                          selectedAccountId
                            ? imeiOptions.length === 0
                              ? "Loading IMEIs…"
                              : "Search IMEI..."
                            : "Select account first"
                        }
                        isClearable
                        isSearchable
                        isDisabled={!selectedAccountId}
                        menuPortalTarget={document.body}
                        styles={{
                          control: (base, state) => ({
                            ...base,
                            minHeight: 40,
                            borderRadius: 4,
                            fontSize: "0.875rem",
                            borderColor: state.isFocused ? "#1A73E8" : "#d2d6da",
                            boxShadow: "none",
                            "&:hover": { borderColor: state.isFocused ? "#1A73E8" : "#b3b3b3" },
                          }),
                          placeholder: (base) => ({
                            ...base,
                            fontSize: "0.875rem",
                            color: "#adb5bd",
                          }),
                          singleValue: (base) => ({ ...base, fontSize: "0.875rem" }),
                          menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                        }}
                      />
                    </Grid>

                    {/* ── Average, Data, Search ── */}
                    <Grid
                      item
                      xs={12}
                      md={4}
                      sx={{ display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap" }}
                    >
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
                      />
                      <MDButton type="submit" variant="gradient" color="info">
                        Search
                      </MDButton>
                    </Grid>

                    {/* ── Format + Download aligned to right end ── */}
                    <Grid
                      item
                      xs={12}
                      md={5}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "flex-end",
                        gap: 2,
                        flexWrap: "wrap",
                      }}
                    >
                      {showDownloadOptions && chartData.length > 0 && (
                        <>
                          <MDTypography variant="button" fontWeight="bold">
                            Format:
                          </MDTypography>

                          <FormControl variant="outlined" size="small" sx={{ minWidth: 150 }}>
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
                        </>
                      )}
                    </Grid>
                  </Grid>
                </form>
              </MDBox>
            </Card>
          </Grid>
        </Grid>

        {/* ── Both Graphs Side by Side ── */}
        <Grid container spacing={3}>
          {/* ── Load Cell Graph ── */}
          <Grid item xs={12} md={6}>
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

                {averageConfig && (
                  <MDBox textAlign="center" mb={3}>
                    <MDTypography variant="h5" fontWeight="bold" color={averageConfig.labelColor}>
                      Current Average Load:{" "}
                      {parseFloat(chartData[chartData.length - 1].Average).toFixed(2)} tons
                    </MDTypography>
                    <MDTypography variant="caption" color="text.secondary">
                      Status: {averageConfig.labelText}
                    </MDTypography>
                  </MDBox>
                )}

                <MDBox sx={{ width: "100%", height: { xs: 450, sm: 500, md: 550 } }}>
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
                        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                        <XAxis
                          dataKey="time"
                          tick={{ fontSize: 12 }}
                          tickFormatter={(value) => {
                            const date = new Date(value);
                            return `${date.getHours()}:${String(date.getMinutes()).padStart(2, "0")}`;
                          }}
                        />
                        <YAxis yAxisId="left" tick={{ fontSize: 12 }} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#fff",
                            border: "1px solid #ccc",
                            borderRadius: 4,
                          }}
                          labelStyle={{ fontWeight: "bold" }}
                        />
                        <Legend wrapperStyle={{ paddingTop: "20px" }} iconType="line" />

                        {showData && (
                          <>
                            <Area
                              yAxisId="left"
                              type="monotone"
                              dataKey="V1"
                              stroke="#8884d8"
                              fill="#8884d8"
                              fillOpacity={0.15}
                              strokeWidth={1}
                              dot={false}
                              name="Load Cell 1"
                            />
                            <Area
                              yAxisId="left"
                              type="monotone"
                              dataKey="V2"
                              stroke="#82ca9d"
                              fill="#82ca9d"
                              fillOpacity={0.15}
                              strokeWidth={1}
                              dot={false}
                              name="Load Cell 2"
                            />
                            <Area
                              yAxisId="left"
                              type="monotone"
                              dataKey="V3"
                              stroke="#ffc658"
                              fill="#ffc658"
                              fillOpacity={0.15}
                              strokeWidth={1}
                              dot={false}
                              name="Load Cell 3"
                            />
                            <Area
                              yAxisId="left"
                              type="monotone"
                              dataKey="V4"
                              stroke="#ce7e00"
                              fill="#ce7e00"
                              fillOpacity={0.15}
                              strokeWidth={1}
                              dot={false}
                              name="Load Cell 4"
                            />
                          </>
                        )}

                        {averageConfig && (
                          <Area
                            yAxisId="left"
                            type="monotone"
                            dataKey="Average"
                            stroke={averageConfig.stroke}
                            strokeWidth={2}
                            fill={averageConfig.fill}
                            fillOpacity={0.25}
                            dot={false}
                            activeDot={{ r: 5 }}
                            name="Average Load"
                            isAnimationActive={false}
                          />
                        )}
                      </AreaChart>
                    </ResponsiveContainer>
                  )}
                </MDBox>
              </MDBox>
            </Card>
          </Grid>

          {/* ── Load Percent Graph ── */}
          <Grid item xs={12} md={6}>
            <Card>
              <MDBox pt={3} px={3}>
                <MDTypography variant="h6" fontWeight="medium">
                  Load Percentage (%)
                </MDTypography>
              </MDBox>

              <MDBox p={3}>
                {dateRange && (
                  <MDTypography variant="body2" fontWeight="bold" align="center" mb={2}>
                    {dateRange}
                  </MDTypography>
                )}

                {chartData.length > 0 && (
                  <MDBox textAlign="center" mb={3}>
                    <MDTypography variant="h5" fontWeight="bold" color="secondary">
                      Latest Load %:{" "}
                      {parseFloat(chartData[chartData.length - 1].LoadPercent).toFixed(1)}%
                    </MDTypography>
                    <MDTypography variant="caption" color="text.secondary">
                      Range: 0% – 100%
                    </MDTypography>
                  </MDBox>
                )}

                <MDBox sx={{ width: "100%", height: { xs: 450, sm: 500, md: 550 } }}>
                  {chartData.length === 0 ? (
                    <MDTypography textAlign="center" color="text.secondary" mt={8}>
                      Please select the date range for which you want to see the Load Percentage.
                    </MDTypography>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={chartData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 10 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                        <XAxis
                          dataKey="time"
                          tick={{ fontSize: 12 }}
                          tickFormatter={(value) => {
                            const date = new Date(value);
                            return `${date.getHours()}:${String(date.getMinutes()).padStart(2, "0")}`;
                          }}
                        />
                        <YAxis
                          domain={[0, 100]}
                          tickFormatter={(v) => `${v}%`}
                          tick={{ fontSize: 12 }}
                        />
                        <Tooltip
                          formatter={(value) => [`${Number(value).toFixed(1)}%`, "Load %"]}
                          contentStyle={{
                            backgroundColor: "#fff",
                            border: "1px solid #ccc",
                            borderRadius: 4,
                          }}
                          labelStyle={{ fontWeight: "bold" }}
                        />
                        <Legend wrapperStyle={{ paddingTop: "20px" }} iconType="line" />
                        <Area
                          type="monotone"
                          dataKey="LoadPercent"
                          stroke="#7b1fa2"
                          fill="#e1bee7"
                          fillOpacity={0.35}
                          strokeWidth={2}
                          dot={false}
                          activeDot={{ r: 5 }}
                          name="Load %"
                          isAnimationActive={false}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  )}
                </MDBox>
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </MDBox>

      {/* ── Chatbot toggle icon ── */}
      <div style={iconStyle} onClick={toggleChatbot}>
        <img
          src={CHATBOT_ICON_PLACEHOLDER}
          alt="Chatbot Icon"
          style={{ width: 30, height: 30, filter: "invert(1)" }}
        />
      </div>

      {/* ── Chatbot widget ── */}
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

export default LiveLoadGraph;
