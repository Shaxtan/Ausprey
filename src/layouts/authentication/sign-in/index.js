import { useState } from "react";
// react-router-dom components
import { Link, useNavigate } from "react-router-dom";
// @mui material components
import Card from "@mui/material/Card";
import Switch from "@mui/material/Switch";
import Grid from "@mui/material/Grid";
import MuiLink from "@mui/material/Link";
// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";

// Authentication layout components
import BasicLayout from "layouts/authentication/components/BasicLayout";

// Images
import bgImage from "assets/images/bg-sign-in-basic.jpeg";

// =================================================================
// CORRECTED IMPORTS: Resolved "Module not found" errors
// Using '../../../' to navigate from 'src/layouts/authentication/sign-in' to 'src/services'
import apiService from "../../../services/ApiService";
import { saveTokenInLocalStorage } from "../../../services/AuthService";
import { callAlertConfirm } from "../../../services/CommonService";
// =================================================================

// Get environment variable
const PROJECT_NAME = process.env.REACT_APP_PROJECT_NAME;

function Basic() {
  const [rememberMe, setRememberMe] = useState(false);

  // State from the original Login component
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

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
      .postRequest("/users/signin", { username, password, signInHere: true }, false)
      .then((response) => {
        setIsLoading(false);
        if (response?.data.resultCode === 208) {
          // Logic for concurrent login prevention or similar
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

          // Navigation logic based on PROJECT_NAME
          if (PROJECT_NAME === "ALOK") {
            navigate("/load-cell-report");
          } else {
            navigate("/dashboard");
          }
          // The original component reloads the page after navigation
          setTimeout(() => window.location.reload(), 0);
        } else {
          // Handle other unsuccessful login responses
          setError(response?.data?.message || "Login failed.");
        }
      })
      .catch((err) => {
        // console.error("Login API Error:", err);
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
    <BasicLayout image={bgImage}>
      <Card>
        <MDBox
          variant="gradient"
          bgColor="info"
          borderRadius="lg"
          coloredShadow="info"
          mx={2}
          mt={-3}
          p={2}
          mb={1}
          textAlign="center"
        >
          <MDTypography variant="h4" fontWeight="medium" color="white" mt={1}>
            Sign in
          </MDTypography>
        </MDBox>
        <MDBox pt={4} pb={3} px={3}>
          <MDBox component="form" role="form" onSubmit={handleSubmit}>
            <MDBox mb={2}>
              <MDInput
                type="text"
                label="Username/E-mail"
                fullWidth
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={isLoading}
              />
            </MDBox>
            <MDBox mb={2}>
              <MDInput
                type="password"
                label="Password"
                fullWidth
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
            </MDBox>

            {/* Display error message */}
            {error && (
              <MDBox mb={2} textAlign="center">
                <MDTypography variant="caption" color="error">
                  {error}
                </MDTypography>
              </MDBox>
            )}

            <MDBox display="flex" alignItems="center" ml={-1}>
              <Switch checked={rememberMe} onChange={handleSetRememberMe} />
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
            <MDBox mt={4} mb={1}>
              <MDButton
                variant="gradient"
                color="info"
                fullWidth
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? "Logging in..." : "sign in"}
              </MDButton>
            </MDBox>

            {/* Forgot Password Link */}
            <MDBox mt={2} textAlign="center">
              <MDTypography
                variant="button"
                component={Link}
                onClick={handleForgotPassword}
                sx={{ cursor: "pointer" }}
                color="info"
                fontWeight="medium"
                textGradient
              >
                Forgot your password?
              </MDTypography>
            </MDBox>

            {/* <MDBox mt={3} mb={1} textAlign="center">
              <MDTypography variant="button" color="text">
                Don&apos;t have an account?{" "}
                <MDTypography
                  component={Link}
                  to="/authentication/sign-up"
                  variant="button"
                  color="info"
                  fontWeight="medium"
                  textGradient
                >
                  Sign up
                </MDTypography>
              </MDTypography>
            </MDBox> */}
          </MDBox>
        </MDBox>
      </Card>
    </BasicLayout>
  );
}
export default Basic;
