import React, { useState, useMemo } from "react";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";

// Material Dashboard 2 React example components (Sidebar and Navbar wrappers)
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";

// Material UI components
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import TextField from "@mui/material/TextField";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Icon from "@mui/material/Icon";

// Placeholder for a Chatbot Icon URL
const CHATBOT_ICON_PLACEHOLDER = "https://cdn-icons-png.flaticon.com/512/4712/4712001.png";

function Alerts() {
  // --- ALERT LOGS FORM STATE ---
  const [account, setAccount] = useState("");
  const [vehicles, setVehicles] = useState("");
  const [alertType, setAlertType] = useState("");
  const [alertMode, setAlertMode] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  // Handler for Alert Logs form submission
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

  // Inline style override for the main content (as per original code)
  const overrideStyle = {
    padding: "0 !important",
    margin: "0 !important",
  };

  // 🚀 CUSTOM STYLING OBJECT FOR FORM FIELDS (Kept the styles from previous response and added variant fix below)
  const customFieldStyles = {
    "& .MuiOutlinedInput-root": {
      borderRadius: "8px", // More rounded corners
      "& fieldset": {
        borderColor: "#e0e0e0", // Default border color
      },
      "&:hover fieldset": {
        borderColor: "#bdbdbd", // Hover border color
      },
      "&.Mui-focused fieldset": {
        borderColor: "#1A73E8", // Focused border color: MD Info Blue
        borderWidth: "1px", // Keep border thin
      },
    },
    "& .MuiInputLabel-root": {
      color: "#9e9e9e", // Subtle gray label color
      "&.Mui-focused": {
        color: "#1A73E8", // Focused label color: MD Info Blue
      },
    },
    // Style for Select component helper text/label to match
    "& .MuiInputBase-root": {
      borderRadius: "8px",
    },
  };

  // --- CHATBOT STATE & LOGIC ---
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

    // 1. Add user message
    const newUserMessage = { type: "user", text: imeiInput.trim() };
    setMessages((prev) => [...prev, newUserMessage]);

    // 2. Clear input
    setImeiInput("");

    // 3. Simulate API call/processing delay and show bot response
    setTimeout(() => {
      const botResponse = {
        type: "bot",
        text: `Thank you. The IMEI **${imeiInput.trim()}** has been successfully identified. What would you like to do next?`,
      };
      setMessages((prev) => [...prev, botResponse]);
      setChatStep(CHAT_STEP.SHOW_OPTIONS); // Move to the next step
    }, 1000);
  };

  const handleOptionSelect = (option) => {
    // 1. Add user message
    const newUserMessage = { type: "user", text: option };
    setMessages((prev) => [...prev, newUserMessage]);

    // 2. Simulate action and close conversation
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
      setChatStep(CHAT_STEP.COMPLETE); // Mark as complete
    }, 1000);
  };

  // --- INLINE STYLE OBJECTS FOR CHATBOT (Unchanged) ---
  const iconStyle = {
    position: "fixed",
    bottom: "30px",
    right: "30px",
    width: "60px",
    height: "60px",
    borderRadius: "50%",
    cursor: "pointer",
    zIndex: 1000,
    backgroundColor: "#1A73E8", // MD Info color
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
    gap: "10px", // Space between messages/elements
  };

  const footerStyle = {
    padding: "10px 15px",
    borderTop: "1px solid #eee",
    display: "flex",
    gap: "8px",
  };

  const inputStyle = {
    flexGrow: 1,
    padding: "8px",
    border: "1px solid #ccc",
    borderRadius: "4px",
  };

  const sendButtonStyle = {
    backgroundColor: "#1A73E8",
    color: "white",
    border: "none",
    padding: "8px 15px",
    borderRadius: "4px",
    cursor: "pointer",
  };

  const getMessageStyle = (type) => ({
    maxWidth: "80%",
    padding: "8px 12px",
    borderRadius: "18px",
    wordWrap: "break-word",
    margin: "0",
    alignSelf: type === "user" ? "flex-end" : "flex-start",
    backgroundColor: type === "user" ? "#1A73E8" : "#e9e9e9",
    color: type === "user" ? "white" : "#333",
    borderBottomLeftRadius: type === "user" ? "18px" : "2px",
    borderBottomRightRadius: type === "user" ? "2px" : "18px",
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

      {/* Main Content Wrapper (Alerts form and results) */}
      <MDBox py={3} style={{ width: "65%", maxWidth: "none", padding: "0 !important" }}>
        <Grid
          container
          spacing={3}
          style={{ width: "155%", maxWidth: "none", margin: "0 !important" }}
        >
          <Grid item xs={12} style={overrideStyle}>
            <Card id="alert-logs-form" style={overrideStyle}>
              {/* ALERT LOGS Header */}
              <MDBox pt={2} px={2}>
                <MDTypography variant="h6" fontWeight="medium">
                  ALERT LOGS
                </MDTypography>
              </MDBox>

              <MDBox p={2}>
                <form onSubmit={handleSubmit}>
                  <MDBox mb={4}>
                    <Grid container spacing={3}>
                      {/* ACCOUNT SELECT - VARIANT ADDED */}
                      <Grid item xs={12} md={6}>
                        {/* 👈 Added variant="outlined" */}
                        <FormControl fullWidth sx={customFieldStyles} variant="outlined">
                          <InputLabel>Account</InputLabel>
                          <Select
                            label="Account"
                            value={account}
                            onChange={(e) => setAccount(e.target.value)}
                          >
                            <MenuItem value="">Select Account</MenuItem>
                            <MenuItem value="account1">Account 1</MenuItem>
                            <MenuItem value="account2">Account 2</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                      {/* VEHICLES SELECT - VARIANT ADDED */}
                      <Grid item xs={12} md={6}>
                        {/* 👈 Added variant="outlined" */}
                        <FormControl fullWidth sx={customFieldStyles} variant="outlined">
                          <InputLabel>Vehicles</InputLabel>
                          <Select
                            label="Vehicles"
                            value={vehicles}
                            onChange={(e) => setVehicles(e.target.value)}
                          >
                            <MenuItem value="">Select Vehicles (0)</MenuItem>
                            <MenuItem value="vehicle1">Vehicle A</MenuItem>
                            <MenuItem value="vehicle2">Vehicle B</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                    </Grid>
                  </MDBox>
                  <MDBox mb={4}>
                    <Grid container spacing={3}>
                      {/* ALERT TYPE SELECT - VARIANT ADDED */}
                      <Grid item xs={12} md={6}>
                        {/* 👈 Added variant="outlined" */}
                        <FormControl fullWidth sx={customFieldStyles} variant="outlined">
                          <InputLabel>Alert Type</InputLabel>
                          <Select
                            label="Alert Type"
                            value={alertType}
                            onChange={(e) => setAlertType(e.target.value)}
                          >
                            <MenuItem value="">Alert Type (0)</MenuItem>
                            <MenuItem value="type1">Over Speed</MenuItem>
                            <MenuItem value="type2">Geo-fence Exit</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                      {/* ALERT MODE SELECT - VARIANT ADDED */}
                      <Grid item xs={12} md={6}>
                        {/* 👈 Added variant="outlined" */}
                        <FormControl fullWidth sx={customFieldStyles} variant="outlined">
                          <InputLabel>Alert Mode</InputLabel>
                          <Select
                            label="Alert Mode"
                            value={alertMode}
                            onChange={(e) => setAlertMode(e.target.value)}
                          >
                            <MenuItem value="">Select Mode</MenuItem>
                            <MenuItem value="sms">SMS</MenuItem>
                            <MenuItem value="email">Email</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                    </Grid>
                  </MDBox>
                  <MDBox mb={4}>
                    <Grid container spacing={3}>
                      {/* FROM DATE INPUT - LABEL REMOVED/FIELD MODIFIED */}
                      <Grid item xs={12} md={6}>
                        <MDTypography variant="caption" display="block" mb={0.5}>
                          From date
                        </MDTypography>
                        <TextField
                          type="datetime-local"
                          fullWidth
                          value={fromDate}
                          onChange={(e) => setFromDate(e.target.value)}
                          sx={customFieldStyles}
                          variant="outlined"
                          InputProps={{
                            startAdornment: (
                              <Icon sx={{ mr: 1, color: "text.secondary" }}>calendar_today</Icon>
                            ),
                          }}
                        />
                      </Grid>
                      {/* TO DATE INPUT - LABEL REMOVED/FIELD MODIFIED */}
                      <Grid item xs={12} md={6}>
                        <MDTypography variant="caption" display="block" mb={0.5}>
                          To date
                        </MDTypography>
                        <TextField
                          type="datetime-local"
                          fullWidth
                          value={toDate}
                          onChange={(e) => setToDate(e.target.value)}
                          sx={customFieldStyles}
                          variant="outlined"
                          InputProps={{
                            startAdornment: (
                              <Icon sx={{ mr: 1, color: "text.secondary" }}>calendar_today</Icon>
                            ),
                          }}
                        />
                      </Grid>
                    </Grid>
                  </MDBox>

                  {/* Submit Button */}
                  <MDBox>
                    <Grid container>
                      <Grid item xs={12} sx={{ textAlign: "center" }}>
                        <MDButton type="submit" variant="gradient" color="info" sx={{ px: 5 }}>
                          Submit
                        </MDButton>
                      </Grid>
                    </Grid>
                  </MDBox>
                </form>
              </MDBox>
            </Card>
          </Grid>
        </Grid>

        {/* --- ALERT LOGS RESULTS CARD --- */}
        <Grid
          container
          spacing={3}
          mt={4}
          style={{ width: "155%", maxWidth: "none", margin: "16px 0 0 0 !important" }}
        >
          <Grid item xs={12} style={overrideStyle}>
            <Card style={overrideStyle}>
              <MDBox pt={2} px={2}>
                <MDTypography variant="h6" fontWeight="medium">
                  Alert Logs Results
                </MDTypography>
              </MDBox>
              <MDBox p={2}>
                <MDTypography variant="body2">
                  Your alert logs data will appear here after submission. You can integrate a
                  **DataTable** here.
                </MDTypography>
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </MDBox>

      {/* --- START CHATBOT INTEGRATION SECTION (Unchanged) --- */}
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
          <button style={closeBtnStyle} onClick={toggleChatbot}>
            &times;
          </button>
        </div>
        <div style={bodyStyle}>
          {messages.map((msg, index) => (
            <div key={index} style={getMessageStyle(msg.type)}>
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

        <div style={footerStyle}>
          {chatStep === CHAT_STEP.ASK_IMEI ? (
            <>
              <input
                type="text"
                placeholder="Enter IMEI (e.g., 123456)"
                value={imeiInput}
                onChange={(e) => setImeiInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleImeiSubmit()}
                style={inputStyle}
              />
              <button onClick={handleImeiSubmit} style={sendButtonStyle}>
                Send
              </button>
            </>
          ) : (
            <input
              type="text"
              placeholder="Conversation is complete"
              disabled
              style={{ ...inputStyle, backgroundColor: "#f5f5f5", color: "#999" }}
            />
          )}
        </div>
      </div>
      {/* --- END CHATBOT INTEGRATION SECTION --- */}
    </DashboardLayout>
  );
}

export default Alerts;
