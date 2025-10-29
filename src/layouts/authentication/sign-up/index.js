import { useEffect } from "react";
// FIX: Import 'Link' and 'useNavigate' from 'react-router-dom'
import { Link, useNavigate } from "react-router-dom";

// @mui material components
import Card from "@mui/material/Card";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

// Authentication layout components
import CoverLayout from "layouts/authentication/components/CoverLayout";

// Images
import bgImage from "assets/images/bg-sign-up-cover.jpeg"; // Reusing the Sign Up image

// ⚠️ IMPORTANT: Adjust the path to your AuthService file based on your project structure
import { removeTokenFromLocalStorage } from "../../../services/AuthService";

function SignOut() {
  const navigate = useNavigate();

  // The Sign Out logic executes immediately when the component mounts
  useEffect(() => {
    // 1. Clear the authentication token
    removeTokenFromLocalStorage();

    // 2. Redirect the user to the Sign In page
    // Using replace: true prevents back navigation to a protected page.
    navigate("/authentication/sign-in", { replace: true });

    // Optional: Reload the page to ensure all application state is fully reset
    setTimeout(() => window.location.reload(), 0);
  }, [navigate]);

  return (
    <CoverLayout image={bgImage}>
      <Card>
        <MDBox
          variant="gradient"
          bgColor="info"
          borderRadius="lg"
          coloredShadow="info"
          mx={2}
          mt={-3}
          p={3}
          mb={1}
          textAlign="center"
        >
          <MDTypography variant="h4" fontWeight="medium" color="white" mt={1}>
            Signing Out...
          </MDTypography>
          <MDTypography display="block" variant="button" color="white" my={1}>
            Clearing session data. Redirecting you now.
          </MDTypography>
        </MDBox>

        {/* Simplified card body */}
        <MDBox pt={4} pb={3} px={3} textAlign="center">
          <MDTypography variant="body2" color="text">
            If you are not redirected automatically, please click below.
          </MDTypography>

          <MDBox mt={3}>
            {/* Fallback link (Uses the imported Link component) */}
            <MDTypography
              component={Link}
              to="/authentication/sign-in"
              variant="button"
              color="info"
              fontWeight="medium"
              textGradient
            >
              Go to Sign In Page
            </MDTypography>
          </MDBox>
        </MDBox>
      </Card>
    </CoverLayout>
  );
}

// Renaming the export to match the component's actual function
export default SignOut;
