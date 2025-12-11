import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
// 1. IMPORT PROP-TYPES
import PropTypes from "prop-types"; 

// Material UI Components
import Icon from "@mui/material/Icon";
import SendIcon from "@mui/icons-material/Send";
import MDBox from "../../../src/assets/components/MDBox"; 
import MDButton from "../../../src/assets/components/MDButton"; 
import MDTypography from "../../../src/assets/components/MDTypography"; 
import MDInput from "../../../src/assets/components/MDInput"; 

// Styles
import {
  chatbotIconStyle,
  getWidgetStyle,
  headerStyle,
  closeBtnStyle,
  bodyStyle,
  footerStyle,
  getMessageStyle,
} from "./DashboardStyles"; 

const CHATBOT_ICON_PLACEHOLDER = "https://cdn-icons-png.flaticon.com/512/4712/4712001.png";

const CHAT_STEP = {
  ASK_IMEI: "ask_imei",
  SHOW_OPTIONS: "show_options",
  COMPLETE: "complete",
};

const Chatbot = ({ devices }) => {
  const navigate = useNavigate();
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      type: "bot",
      text: "Hello! I'm your virtual assistant. To begin, please provide the **IMEI** number of the device you want to manage.",
    },
  ]);
  const [imeiInput, setImeiInput] = useState("");
  const [chatStep, setChatStep] = useState(CHAT_STEP.ASK_IMEI);
  const [activeImei, setActiveImei] = useState(null);

  const toggleChatbot = () => {
    setIsChatbotOpen(!isChatbotOpen);
  };

  const handleImeiSubmit = () => {
    const enteredImei = imeiInput.trim();
    if (enteredImei === "") return;

    const newUserMessage = { type: "user", text: enteredImei };
    setMessages((prev) => [...prev, newUserMessage]);
    setImeiInput("");

    // Use the devices prop passed from Dashboard
    // Added safety check: (devices || []) to prevent crash if prop is null
    const safeDevices = devices || [];
    const foundDevice = safeDevices.find((d) => d.imei === enteredImei);

    setTimeout(() => {
      let botResponse;
      let nextStep;

      if (foundDevice) {
        botResponse = {
          type: "bot",
          text: `Thank you. Device **${foundDevice.name}** (IMEI: ${enteredImei}) has been successfully identified. Its current status is **${foundDevice.status.toUpperCase()}**. What would you like to do next?`,
        };
        setActiveImei(enteredImei);
        nextStep = CHAT_STEP.SHOW_OPTIONS;
      } else {
        botResponse = {
          type: "bot",
          text: `I could not find an active device with the IMEI **${enteredImei}**. Please check the number and try again.`,
        };
        nextStep = CHAT_STEP.ASK_IMEI;
        setActiveImei(null);
      }

      setMessages((prev) => [...prev, botResponse]);
      setChatStep(nextStep);
      scrollToBottom();
    }, 1000);
  };

  const handleOptionSelect = (option) => {
    const newUserMessage = { type: "user", text: option };
    setMessages((prev) => [...prev, newUserMessage]);

    setTimeout(() => {
      let botResponseText = "";
      let targetPath = null;

      if (option === "Alert Logs") {
        botResponseText = `You selected **Alert Logs** for IMEI **${activeImei}**. Redirecting you now.`;
        targetPath = `/alerts?imei=${activeImei}`;
      } else if (option === "Track/Play") {
        botResponseText = `You selected **Track/Play** for IMEI **${activeImei}**. Redirecting you to the Live Track map.`;
        targetPath = `/live-track?imei=${activeImei}`;
      } else if (option === "Trip Report") {
        botResponseText = `You selected **Trip Report** for IMEI **${activeImei}**. Redirecting you to the Reports section.`;
        targetPath = `/reports/trip?imei=${activeImei}`;
      } else {
        botResponseText = `You selected **${option}** for IMEI **${activeImei}**. This conversation is now complete. You can close the widget.`;
      }

      const botResponse = {
        type: "bot",
        text: `${botResponseText} This conversation is now complete. You can close the widget.`,
      };
      setMessages((prev) => [...prev, botResponse]);
      setChatStep(CHAT_STEP.COMPLETE);

      if (targetPath) {
        navigate(targetPath);
        setIsChatbotOpen(false);
      }
      scrollToBottom();
    }, 1000);
  };

  const scrollToBottom = () => {
    const body = document.getElementById("chatbot-body-content");
    if (body) body.scrollTop = body.scrollHeight;
  };

  return (
    <>
      {/* Icon Button */}
      <div style={chatbotIconStyle} onClick={toggleChatbot}>
        <img
          src={CHATBOT_ICON_PLACEHOLDER}
          alt="Chatbot Icon"
          style={{ width: 30, height: 30, filter: "invert(1)" }}
        />
      </div>

      {/* Widget Window */}
      <div style={getWidgetStyle(isChatbotOpen)}>
        <div style={headerStyle}>
          <MDTypography variant="h6" color="white" style={{ margin: 0 }}>
            Virtual Assistant
          </MDTypography>
          <button style={closeBtnStyle} onClick={toggleChatbot}>
            &times;
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
              <MDTypography variant="caption" color="text" sx={{ mb: 1 }}>
                Options for IMEI: {activeImei}
              </MDTypography>
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
    </>
  );
};

// 2. DEFINE PROP TYPES HERE
Chatbot.propTypes = {
  devices: PropTypes.array.isRequired, // Defines that 'devices' must be an array
};

export default Chatbot;