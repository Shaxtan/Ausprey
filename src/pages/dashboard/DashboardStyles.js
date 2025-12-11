/** * DashboardStyles.js
 * Contains style objects for the Dashboard and Chatbot components.
 */

// MD Info color (approximate based on your previous code)
const PRIMARY_COLOR = "#1A73E8"; 

export const chatbotIconStyle = {
  position: "fixed",
  bottom: "30px",
  right: "30px",
  width: "60px",
  height: "60px",
  borderRadius: "50%",
  cursor: "pointer",
  zIndex: 10000,
  backgroundColor: PRIMARY_COLOR,
  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
};

// We export this as a function because it relies on state (isOpen)
export const getWidgetStyle = (isOpen) => ({
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
  opacity: isOpen ? 1 : 0,
  visibility: isOpen ? "visible" : "hidden",
  transform: isOpen ? "translateY(0)" : "translateY(20px)",
  transition: "opacity 0.3s ease, transform 0.3s ease, visibility 0.3s",
});

export const headerStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "10px 15px",
  backgroundColor: PRIMARY_COLOR,
  color: "white",
  borderTopLeftRadius: "8px",
  borderTopRightRadius: "8px",
};

export const closeBtnStyle = {
  background: "none",
  border: "none",
  color: "white",
  fontSize: "1.5rem",
  cursor: "pointer",
  lineHeight: 1,
};

export const bodyStyle = {
  flexGrow: 1,
  padding: "15px",
  overflowY: "auto",
  display: "flex",
  flexDirection: "column",
  gap: "10px",
};

export const footerStyle = {
  padding: "10px 15px",
  borderTop: "1px solid #eee",
  display: "flex",
  gap: "8px",
};

export const getMessageStyle = (type) => ({
  maxWidth: "80%",
  padding: "8px 12px",
  borderRadius: "18px",
  wordWrap: "break-word",
  margin: "0",
  fontSize: "0.9rem",
  alignSelf: type === "user" ? "flex-end" : "flex-start",
  backgroundColor: type === "user" ? PRIMARY_COLOR : "#e9e9e9",
  color: type === "user" ? "white" : "#333",
  borderBottomLeftRadius: type === "user" ? "18px" : "2px",
  borderBottomRightRadius: type === "user" ? "2px" : "18px",
});