import React, { useState, useMemo } from "react";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";

// Material Dashboard 2 React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";

// Material UI components
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Icon from "@mui/material/Icon";

const CHATBOT_ICON_PLACEHOLDER = "https://cdn-icons-png.flaticon.com/512/4712/4712001.png";

function Alerts() {
  // Form states
  const [account, setAccount] = useState("");
  const [vehicles, setVehicles] = useState("");
  const [alertType, setAlertType] = useState("");
  const [alertMode, setAlertMode] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form Submitted with data:", {
      account,
      vehicles,
      alertType,
      alertMode,
      fromDate,
      toDate,
    });
    alert("Fetching alert logs...");
  };

  // Chatbot state and logic
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
      text: "Hello! I'm your virtual assistant. Please provide the **IMEI** number of the device you want to manage.",
    },
  ]);
  const [imeiInput, setImeiInput] = useState("");
  const [chatStep, setChatStep] = useState(CHAT_STEP.ASK_IMEI);

  const toggleChatbot = () => setIsChatbotOpen(!isChatbotOpen);

  const handleImeiSubmit = () => {
    if (imeiInput.trim() === "") return;

    setMessages((prev) => [...prev, { type: "user", text: imeiInput.trim() }]);
    setImeiInput("");

    setTimeout(() => {
      const botResponse = {
        type: "bot",
        text: `Thank you. The IMEI **${imeiInput.trim()}** has been identified. What would you like to do next?`,
      };
      setMessages((prev) => [...prev, botResponse]);
      setChatStep(CHAT_STEP.SHOW_OPTIONS);
    }, 1000);
  };

  const handleOptionSelect = (option) => {
    setMessages((prev) => [...prev, { type: "user", text: option }]);

    setTimeout(() => {
      let botResponseText =
        option === "Alert Logs"
          ? "You selected **Alert Logs**. I can navigate you to the appropriate section or provide a direct link to the log data."
          : `You selected **${option}**. Opening the corresponding dashboard view for this device.`;

      setMessages((prev) => [
        ...prev,
        {
          type: "bot",
          text: `${botResponseText} This conversation is now complete.`,
        },
      ]);
      setChatStep(CHAT_STEP.COMPLETE);
    }, 1000);
  };

  // Inline styles
  const overrideStyle = { padding: "0", margin: "0" };
  const inputStyleSx = { "& .MuiOutlinedInput-root": { borderRadius: "8px" } };

  const iconStyle = {
    position: "fixed",
    bottom: "30px",
    right: "30px",
    width: "60px",
    height: "60px",
    borderRadius: "50%",
    cursor: "pointer",
    zIndex: 1000,
    backgroundColor: "#1A73E8",
    boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
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
    boxShadow: "0 8px 30px rgba(0,0,0,0.3)",
    zIndex: 999,
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

  const getMessageStyle = (type) => ({
    maxWidth: "80%",
    padding: "8px 12px",
    borderRadius: "18px",
    wordWrap: "break-word",
    margin: 0,
    alignSelf: type === "user" ? "flex-end" : "flex-start",
    backgroundColor: type === "user" ? "#1A73E8" : "#e9e9e9",
    color: type === "user" ? "white" : "#333",
  });

  const quickLinkStyle = {
    padding: "8px",
    marginBottom: "8px",
    backgroundColor: "transparent",
    border: "1px solid #1A73E8",
    color: "#1A73E8",
    borderRadius: "4px",
    cursor: "pointer",
    width: "100%",
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />

      {/* Main Form */}
      <MDBox py={3} style={{ width: "65%", maxWidth: "none" }}>
        <Grid container spacing={3} style={{ width: "155%", margin: 0 }}>
          <Grid item xs={12}>
            <Card style={overrideStyle}>
              <MDBox pt={2} px={2}>
                <MDTypography variant="h6" fontWeight="medium">
                  ALERT LOGS
                </MDTypography>
              </MDBox>

              <MDBox p={2}>
                <form onSubmit={handleSubmit}>
                  <MDBox mb={4}>
                    <Grid container spacing={3}>
                      <Grid item xs={12} md={6}>
                        <MDTypography variant="caption" mb={0.5}>
                          Account
                        </MDTypography>
                        <TextField
                          select
                          fullWidth
                          value={account}
                          onChange={(e) => setAccount(e.target.value)}
                          variant="outlined"
                          sx={inputStyleSx}
                        >
                          <MenuItem value="">Select Account</MenuItem>
                          <MenuItem value="account1">Account 1</MenuItem>
                          <MenuItem value="account2">Account 2</MenuItem>
                        </TextField>
                      </Grid>

                      <Grid item xs={12} md={6}>
                        <MDTypography variant="caption" mb={0.5}>
                          Vehicles
                        </MDTypography>
                        <TextField
                          select
                          fullWidth
                          value={vehicles}
                          onChange={(e) => setVehicles(e.target.value)}
                          variant="outlined"
                          sx={inputStyleSx}
                        >
                          <MenuItem value="">Select Vehicles (0)</MenuItem>
                          <MenuItem value="vehicle1">Vehicle A</MenuItem>
                          <MenuItem value="vehicle2">Vehicle B</MenuItem>
                        </TextField>
                      </Grid>
                    </Grid>
                  </MDBox>

                  <MDBox mb={4}>
                    <Grid container spacing={3}>
                      <Grid item xs={12} md={6}>
                        <MDTypography variant="caption" mb={0.5}>
                          Alert Type
                        </MDTypography>
                        <TextField
                          select
                          fullWidth
                          value={alertType}
                          onChange={(e) => setAlertType(e.target.value)}
                          variant="outlined"
                          sx={inputStyleSx}
                        >
                          <MenuItem value="">Alert Type (0)</MenuItem>
                          <MenuItem value="type1">Over Speed</MenuItem>
                          <MenuItem value="type2">Geo-fence Exit</MenuItem>
                        </TextField>
                      </Grid>

                      <Grid item xs={12} md={6}>
                        <MDTypography variant="caption" mb={0.5}>
                          Alert Mode
                        </MDTypography>
                        <TextField
                          select
                          fullWidth
                          value={alertMode}
                          onChange={(e) => setAlertMode(e.target.value)}
                          variant="outlined"
                          sx={inputStyleSx}
                        >
                          <MenuItem value="">Select Mode</MenuItem>
                          <MenuItem value="sms">SMS</MenuItem>
                          <MenuItem value="email">Email</MenuItem>
                        </TextField>
                      </Grid>
                    </Grid>
                  </MDBox>

                  <MDBox mb={4}>
                    <Grid container spacing={3}>
                      <Grid item xs={12} md={6}>
                        <MDTypography variant="caption" mb={0.5}>
                          From Date
                        </MDTypography>
                        <TextField
                          type="datetime-local"
                          fullWidth
                          value={fromDate}
                          onChange={(e) => setFromDate(e.target.value)}
                          variant="outlined"
                          sx={inputStyleSx}
                          InputProps={{
                            startAdornment: (
                              <Icon sx={{ mr: 1, color: "text.secondary" }}>
                                calendar_today
                              </Icon>
                            ),
                          }}
                        />
                      </Grid>

                      <Grid item xs={12} md={6}>
                        <MDTypography variant="caption" mb={0.5}>
                          To Date
                        </MDTypography>
                        <TextField
                          type="datetime-local"
                          fullWidth
                          value={toDate}
                          onChange={(e) => setToDate(e.target.value)}
                          variant="outlined"
                          sx={inputStyleSx}
                          InputProps={{
                            startAdornment: (
                              <Icon sx={{ mr: 1, color: "text.secondary" }}>
                                calendar_today
                              </Icon>
                            ),
                          }}
                        />
                      </Grid>
                    </Grid>
                  </MDBox>

                  <MDBox textAlign="center">
                    <MDButton type="submit" variant="gradient" color="info" sx={{ px: 5 }}>
                      Submit
                    </MDButton>
                  </MDBox>
                </form>
              </MDBox>
            </Card>
          </Grid>
        </Grid>

        {/* Results Card */}
        <Grid
  container
  spacing={3}
  mt={4}
  style={{ width: "155%", marginLeft: "0%" }} // Adjust as needed
>
  <Grid item xs={12}>
    <Card style={overrideStyle}>
      <MDBox pt={2} px={2}>
        <MDTypography variant="h6" fontWeight="medium">
          Alert Logs Results
        </MDTypography>
      </MDBox>
      <MDBox p={2}>
        <MDTypography variant="body2">
          Your alert logs data will appear here after submission.
        </MDTypography>
      </MDBox>
    </Card>
  </Grid>
</Grid>

      </MDBox>

      {/* Chatbot Section */}
      <div style={iconStyle} onClick={toggleChatbot}>
        <img
          src={CHATBOT_ICON_PLACEHOLDER}
          alt="Chatbot Icon"
          style={{ width: 30, height: 30, filter: "invert(1)" }}
        />
      </div>

      <div style={widgetStyle}>
        <div style={headerStyle}>
          <h4 style={{ margin: 0, fontSize: "1rem" }}>Need Help?</h4>
          <button
            style={{
              background: "none",
              border: "none",
              color: "white",
              fontSize: "1.5rem",
              cursor: "pointer",
            }}
            onClick={toggleChatbot}
          >
            &times;
          </button>
        </div>

        <div
          style={{
            flexGrow: 1,
            padding: "15px",
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            gap: "10px",
          }}
        >
          {messages.map((msg, i) => (
            <div key={i} style={getMessageStyle(msg.type)}>
              <p
                style={{ margin: 0, fontSize: "0.9rem" }}
                dangerouslySetInnerHTML={{
                  __html: msg.text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>"),
                }}
              />
            </div>
          ))}

          {chatStep === CHAT_STEP.SHOW_OPTIONS && (
            <div style={{ marginTop: "10px" }}>
              <button style={quickLinkStyle} onClick={() => handleOptionSelect("Track/Play")}>
                Track/Play
              </button>
              <button style={quickLinkStyle} onClick={() => handleOptionSelect("Alert Logs")}>
                Alert Logs
              </button>
              <button style={quickLinkStyle} onClick={() => handleOptionSelect("Trip Report")}>
                Trip Report
              </button>
            </div>
          )}
        </div>

        <div
          style={{
            padding: "10px 15px",
            borderTop: "1px solid #eee",
            display: "flex",
            gap: "8px",
          }}
        >
          {chatStep === CHAT_STEP.ASK_IMEI ? (
            <>
              <input
                type="text"
                placeholder="Enter IMEI (e.g., 123456)"
                value={imeiInput}
                onChange={(e) => setImeiInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleImeiSubmit()}
                style={{
                  flexGrow: 1,
                  padding: "8px",
                  border: "1px solid #ccc",
                  borderRadius: "4px",
                }}
              />
              <button
                onClick={handleImeiSubmit}
                style={{
                  backgroundColor: "#1A73E8",
                  color: "white",
                  border: "none",
                  padding: "8px 15px",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                Send
              </button>
            </>
          ) : (
            <input
              type="text"
              placeholder="Conversation is complete"
              disabled
              style={{
                flexGrow: 1,
                padding: "8px",
                border: "1px solid #ccc",
                borderRadius: "4px",
                backgroundColor: "#f5f5f5",
                color: "#999",
              }}
            />
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

export default Alerts;
