import { useState, useEffect } from "react";
// react-router-dom components
import { Link, useNavigate } from "react-router-dom";
// @mui material components
import Card from "@mui/material/Card";
import Switch from "@mui/material/Switch";
import Grid from "@mui/material/Grid";
import MuiLink from "@mui/material/Link";
import Box from "@mui/material/Box";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";

// Images
import bgImage from "assets/images/bg-sign-in-basic.jpeg";

// =================================================================
// CORRECTED IMPORTS
import apiService, { SERVICES } from "../../../services/ApiService";
import { saveTokenInLocalStorage } from "../../../services/AuthService";
import { callAlertConfirm } from "../../../services/CommonService";
// =================================================================

// Get environment variable
const PROJECT_NAME = process.env.REACT_APP_PROJECT_NAME;

function Basic() {
  const [rememberMe, setRememberMe] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  // 🚀 GUARANTEED NO-SCROLL FIX: Use useEffect to target the global body style
  useEffect(() => {
    // Save the original body overflow style
    const originalStyle = document.body.style.overflow;

    // Set overflow to hidden when the component mounts
    document.body.style.overflow = "hidden";

    // Restore the original body overflow style when the component unmounts
    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, []); // Run only once on mount and cleanup on unmount

  const handleSetRememberMe = () => setRememberMe(!rememberMe);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      setError("Please fill out all fields.");
      return;
    }

    setError("");
    setIsLoading(true);

    apiService
      .postRequest("/users/signin", { username, password, signInHere: true }, false, SERVICES.main)
      .then((response) => {
        setIsLoading(false);
        if (response?.data.resultCode === 208) {
          callAlertConfirm(
            "",
            response?.data.message,
            (result) => {
              // Confirmation logic
            },
            false
          );
        } else if (response?.data.data) {
          saveTokenInLocalStorage(response?.data?.data);

          if (PROJECT_NAME === "ALOK") {
            navigate("/load-cell-report");
          } else {
            navigate("/dashboard");
          }
          setTimeout(() => window.location.reload(), 0);
        } else {
          setError(response?.data?.message || "Login failed.");
        }
      })
      .catch((err) => {
        alert("Login failed.");
        setIsLoading(false);
        setError("Login failed. Please check your credentials.");
      });
  };

  const handleForgotPassword = (e) => {
    e.preventDefault();
    navigate("/forget1");
  };

  return (
    // ROOT CONTAINER: Enforces full viewport and centers content
    <Box
      sx={{
        width: "100vw",
        height: "100vh",
        overflow: "hidden", // Local overflow hidden (backup)
        padding: 0,
        marginTop: "-33px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        // Background Image Styling
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url(${bgImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <Card
        sx={{
          maxWidth: 400,
          width: "90%",
          borderRadius: "16px",
          boxShadow: "0 10px 30px rgba(0, 0, 0, 0.5)",
          zIndex: 10,
          backgroundColor: "rgba(255, 255, 255, 0.95)",
        }}
      >
        <MDBox
          variant="gradient"
          bgColor="info"
          borderRadius="12px"
          coloredShadow="info"
          mx={3}
          mt={-4}
          p={3}
          mb={4}
          textAlign="center"
          sx={{
            boxShadow: "0 8px 15px rgba(50, 50, 93, 0.2), 0 3px 6px rgba(0, 0, 0, 0.2)",
          }}
        >
          <MDTypography
            variant="h3"
            fontWeight="900"
            color="white"
            mt={1}
            sx={{
              letterSpacing: "1.5px",
            }}
          >
            LOGIN
          </MDTypography>
        </MDBox>
        <MDBox pt={1} pb={3} px={4}>
          <MDBox component="form" role="form" onSubmit={handleSubmit}>
            <MDBox mb={3}>
              <MDInput
                type="text"
                label="Username / E-mail"
                fullWidth
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={isLoading}
                variant="outlined"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": {
                      borderColor: "#bdbdbd",
                      borderWidth: "1px",
                      transition: "all 0.3s ease",
                    },
                    "&:hover fieldset": {
                      borderColor: "#1976d2",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#1976d2",
                      borderWidth: "2px",
                    },
                    borderRadius: "8px",
                  },
                  // ⭐ REMOVED CONFLICTING STYLES FOR LABEL BASE STATE
                  "& .MuiInputLabel-root": {
                    // color: "#616161", <--- REMOVED
                    // fontWeight: "500", <--- REMOVED
                    "&.Mui-focused": {
                      color: "#1976d2",
                    },
                  },
                }}
              />
            </MDBox>
            <MDBox mb={3}>
              <MDInput
                type="password"
                label="Password"
                fullWidth
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                variant="outlined"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": {
                      borderColor: "#bdbdbd",
                      borderWidth: "1px",
                      transition: "all 0.3s ease",
                    },
                    "&:hover fieldset": {
                      borderColor: "#1976d2",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#1976d2",
                      borderWidth: "2px",
                    },
                    borderRadius: "8px",
                  },
                  // ⭐ REMOVED CONFLICTING STYLES FOR LABEL BASE STATE
                  "& .MuiInputLabel-root": {
                    // color: "#616161", <--- REMOVED
                    // fontWeight: "500", <--- REMOVED
                    "&.Mui-focused": {
                      color: "#1976d2",
                    },
                  },
                }}
              />
            </MDBox>

            {/* Display error message */}
            {error && (
              <MDBox mb={2} textAlign="center">
                <MDTypography
                  variant="caption"
                  color="error"
                  sx={{
                    fontSize: "0.9rem",
                    fontWeight: "bold",
                    color: "#e53935 !important",
                  }}
                >
                  {error}
                </MDTypography>
              </MDBox>
            )}

            <MDBox display="flex" alignItems="center" ml={-1} mb={3}>
              <Switch checked={rememberMe} onChange={handleSetRememberMe} color="info" />
              <MDTypography
                variant="button"
                fontWeight="regular"
                color="text"
                onClick={handleSetRememberMe}
                sx={{ cursor: "pointer", userSelect: "none", ml: -1 }}
              >
                &nbsp;&nbsp;Remember me
              </MDTypography>
            </MDBox>
            <MDBox mt={2} mb={1}>
              <MDButton
                variant="contained"
                color="info"
                fullWidth
                type="submit"
                disabled={isLoading}
                sx={{
                  fontWeight: "900",
                  padding: "12px 0",
                  fontSize: "1rem",
                  letterSpacing: "1px",
                  borderRadius: "8px",
                  boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
                }}
              >
                {isLoading ? "AUTHENTICATING..." : "SIGN IN"}
              </MDButton>
            </MDBox>

            {/* Forgot Password Link */}
            {/* <MDBox mt={2} textAlign="center">
              <MDTypography
                variant="button"
                component={Link}
                onClick={handleForgotPassword}
                sx={{
                  cursor: "pointer",
                  textDecoration: "underline",
                  fontSize: "0.85rem",
                }}
                color="info"
                fontWeight="medium"
                textGradient
              >
                Forgot your password?
              </MDTypography>
            </MDBox> */}
          </MDBox>
        </MDBox>
      </Card>
    </Box>
  );
}

export default Basic;
