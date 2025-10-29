// Notifications.js
/**
=========================================================
* Material Dashboard 2 React - v2.2.0
=========================================================
* (File header omitted for brevity)
*/

import { useState, useMemo } from "react";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Icon from "@mui/material/Icon";
import SendIcon from "@mui/icons-material/Send";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import MDSnackbar from "components/MDSnackbar";
import MDInput from "components/MDInput";

// Material Dashboard 2 React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";

// 💡 MAP IMPORTS (Only basic Leaflet needed now)
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// ⭐ NEW: Import the custom map component (now containing API logic)
import LeafletControlsMap from "../notifications/LeafletControlsMap"; // Assuming this path is correct
// ------------------------------------------------------------------
// 🚀 LEAFLET ICON FIX (CRUCIAL): Imports and Configuration
// ------------------------------------------------------------------
import iconUrl from "leaflet/dist/images/marker-icon.png";
import iconRetinaUrl from "leaflet/dist/images/marker-icon-2x.png";
import shadowUrl from "leaflet/dist/images/marker-shadow.png";

// Override the default icon settings
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: iconRetinaUrl,
  iconUrl: iconUrl,
  shadowUrl: shadowUrl,
});
// ------------------------------------------------------------------

// Placeholder for a Chatbot Icon URL
const CHATBOT_ICON_PLACEHOLDER = "https://cdn-icons-png.flaticon.com/512/4712/4712001.png";

function Notifications() {
  const [successSB, setSuccessSB] = useState(false);
  const [infoSB, setInfoSB] = useState(false);
  const [warningSB, setWarningSB] = useState(false);
  const [errorSB, setErrorSB] = useState(false); // --- SNACKBAR HANDLERS (Omitted for brevity, assumed correct) ---

  const openSuccessSB = () => setSuccessSB(true);
  const closeSuccessSB = () => setSuccessSB(false);
  const openInfoSB = () => setInfoSB(true);
  const closeInfoSB = () => setInfoSB(false);
  const openWarningSB = () => setWarningSB(true);
  const closeWarningSB = () => setWarningSB(false);
  const openErrorSB = () => setErrorSB(true);
  const closeErrorSB = () => setErrorSB(false);

  const alertContent = (name) => (
    <MDTypography variant="body2" color="white">
            A simple {name} alert with      {" "}
      <MDTypography component="a" href="#" variant="body2" fontWeight="medium" color="white">
                an example link      {" "}
      </MDTypography>
            . Give it a click if you like.    {" "}
    </MDTypography>
  );

  const renderSuccessSB = (
    <MDSnackbar
      color="success"
      icon="check"
      title="Material Dashboard"
      content="Hello, world! This is a notification message"
      dateTime="11 mins ago"
      open={successSB}
      onClose={closeSuccessSB}
      close={closeSuccessSB}
      bgWhite
    />
  );

  const renderInfoSB = (
    <MDSnackbar
      icon="notifications"
      title="Material Dashboard"
      content="Hello, world! This is a notification message"
      dateTime="11 mins ago"
      open={infoSB}
      onClose={closeInfoSB}
      close={closeInfoSB}
    />
  );

  const renderWarningSB = (
    <MDSnackbar
      color="warning"
      icon="star"
      title="Material Dashboard"
      content="Hello, world! This is a notification message"
      dateTime="11 mins ago"
      open={warningSB}
      onClose={closeWarningSB}
      close={closeWarningSB}
      bgWhite
    />
  );

  const renderErrorSB = (
    <MDSnackbar
      color="error"
      icon="warning"
      title="Material Dashboard"
      content="Hello, world! This is a notification message"
      dateTime="11 mins ago"
      open={errorSB}
      onClose={closeErrorSB}
      close={closeErrorSB}
      bgWhite
    />
  ); // ------------------------------------------------------------------ // Map component replacement // ------------------------------------------------------------------

  const ComplexMap = <LeafletControlsMap />; // ------------------------------------------------------------------ // ⭐️ START CHATBOT STATE & LOGIC ⭐️ (Omitted for brevity, assumed correct)
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
    if (imeiInput.trim() === "") return; // 1. Add user message

    const newUserMessage = { type: "user", text: imeiInput.trim() };
    setMessages((prev) => [...prev, newUserMessage]); // 2. Clear input

    setImeiInput(""); // 3. Simulate API call/processing delay and show bot response

    setTimeout(() => {
      const botResponse = {
        type: "bot",
        text: `Thank you. The IMEI **${newUserMessage.text}** has been successfully identified. What would you like to do next?`,
      };
      setMessages((prev) => [...prev, botResponse]);
      setChatStep(CHAT_STEP.SHOW_OPTIONS); // Move to the next step // Scroll to bottom (simulated)
      const body = document.getElementById("chatbot-body-content");
      if (body) body.scrollTop = body.scrollHeight;
    }, 1000);
  };

  const handleOptionSelect = (option) => {
    // 1. Add user message
    const newUserMessage = { type: "user", text: option };
    setMessages((prev) => [...prev, newUserMessage]); // 2. Simulate action and close conversation

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
      setChatStep(CHAT_STEP.COMPLETE); // Mark as complete // Scroll to bottom (simulated)
      const body = document.getElementById("chatbot-body-content");
      if (body) body.scrollTop = body.scrollHeight;
    }, 1000);
  }; // --- INLINE STYLE OBJECTS FOR CHATBOT --- // ... (omitted for brevity)

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
  }; // Helper function to apply message styles based on type

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
  }); // ⭐️ END CHATBOT STATE & LOGIC ⭐️
  return (
    <DashboardLayout>
            <DashboardNavbar /> {/* Navbar is here */}     {" "}
      {/* The negative margin and pt/pb fixes make the map fill the vertical space */}     {" "}
      <MDBox pt={0} pb={0} sx={{ marginTop: 0 }}>
                {/* Alerts Section (Kept for completeness) */}       {" "}
        <Grid container spacing={6} sx={{ display: "none" }}>
          {" "}
          {/* Hiding the alerts section to give max map space */}         {" "}
          <Grid item xs={12} lg={7}>
                        {/* Alerts implementation ... */}         {" "}
          </Grid>
                   {" "}
          <Grid item xs={12} lg={5}>
                        {/* Snackbar buttons ... */}         {" "}
          </Grid>
                 {" "}
        </Grid>
                {/* Map Section */}       {" "}
        <Grid container spacing={6} mt={0}>
                   {" "}
          <Grid item xs={12}>
                       {" "}
            <Card sx={{ minHeight: "calc(100vh - 120px)" }}>
              {" "}
              {/* Adjusted minHeight for better full-page experience */}             {" "}
              <MDBox p={0}>{ComplexMap}</MDBox>           {" "}
            </Card>
                     {" "}
          </Grid>
                 {" "}
        </Grid>
             {" "}
      </MDBox>
            {/* Render the snackbar components */}      {renderSuccessSB}      {renderInfoSB}     {" "}
      {renderWarningSB}      {renderErrorSB}      {/* ⭐️ START CHATBOT INTEGRATION SECTION ⭐️ */} 
          {/* ⭐️ CHATBOT ICON BUTTON */}     {" "}
      <div style={iconStyle} onClick={toggleChatbot}>
               {" "}
        <img
          src={CHATBOT_ICON_PLACEHOLDER}
          alt="Chatbot Icon"
          style={{ width: 30, height: 30, filter: "invert(1)" }}
        />
             {" "}
      </div>
            {/* ⭐️ CHATBOT WIDGET PANEL */}     {" "}
      <div style={widgetStyle}>
               {" "}
        <div style={headerStyle}>
                   {" "}
          <MDTypography variant="h6" color="white" style={{ margin: 0 }}>
                        Virtual Assistant          {" "}
          </MDTypography>
                   {" "}
          <button style={closeBtnStyle} onClick={toggleChatbot}>
                        &times;          {" "}
          </button>
                 {" "}
        </div>
                {/* Chat Body */}       {" "}
        <div id="chatbot-body-content" style={bodyStyle}>
                   {" "}
          {messages.map((msg, index) => (
            <div key={index} style={getMessageStyle(msg.type)}>
                           {" "}
              <MDTypography
                variant="button"
                fontWeight="regular"
                color={msg.type === "user" ? "white" : "dark"}
                dangerouslySetInnerHTML={{
                  __html: msg.text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>"),
                }}
              />
                         {" "}
            </div>
          ))}
                    {/* Quick Links / Options */}         {" "}
          {chatStep === CHAT_STEP.SHOW_OPTIONS && (
            <MDBox mt={1}>
                           {" "}
              <MDButton
                variant="outlined"
                color="info"
                fullWidth
                sx={{ mb: 1.5 }}
                onClick={() => handleOptionSelect("Track/Play")}
              >
                                Track/Play              {" "}
              </MDButton>
                           {" "}
              <MDButton
                variant="outlined"
                color="info"
                fullWidth
                sx={{ mb: 1.5 }}
                onClick={() => handleOptionSelect("Alert Logs")}
              >
                                Alert Logs              {" "}
              </MDButton>
                           {" "}
              <MDButton
                variant="outlined"
                color="info"
                fullWidth
                onClick={() => handleOptionSelect("Trip Report")}
              >
                                Trip Report              {" "}
              </MDButton>
                         {" "}
            </MDBox>
          )}
                 {" "}
        </div>
                {/* Chat Input/Footer */}       {" "}
        <div style={footerStyle}>
                   {" "}
          {chatStep === CHAT_STEP.ASK_IMEI ? (
            <>
                           {" "}
              <MDInput
                type="text"
                placeholder="Enter IMEI (e.g., 123456)"
                value={imeiInput}
                onChange={(e) => setImeiInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleImeiSubmit()}
                size="small"
                fullWidth
              />
                           {" "}
              <MDButton
                variant="gradient"
                color="info"
                iconOnly
                onClick={handleImeiSubmit}
                sx={{ minWidth: "40px", height: "36px" }}
              >
                               {" "}
                <Icon>
                                    <SendIcon />               {" "}
                </Icon>
                             {" "}
              </MDButton>
                         {" "}
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
                 {" "}
        </div>
             {" "}
      </div>
            {/* ⭐️ END CHATBOT INTEGRATION SECTION ⭐️ */}   {" "}
    </DashboardLayout>
  );
}
export default Notifications;
