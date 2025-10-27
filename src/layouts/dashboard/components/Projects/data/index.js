/* eslint-disable react/prop-types */
/* eslint-disable react/function-component-definition */
/**
=========================================================
* Material Dashboard 2 React - v2.2.0
=========================================================

* Product Page: https://www.creative-tim.com/product/material-dashboard-react
* Copyright 2023 Creative Tim (https://www.creative-tim.com)

Coded by www.creative-tim.com

 =========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
*/

// @mui material components
import Tooltip from "@mui/material/Tooltip";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDAvatar from "components/MDAvatar";
import MDProgress from "components/MDProgress";

// Images (These are no longer relevant to your new data, but kept for function structure)
import logoXD from "assets/images/small-logos/logo-xd.svg";
import logoAtlassian from "assets/images/small-logos/logo-atlassian.svg";
import logoSlack from "assets/images/small-logos/logo-slack.svg";
import logoSpotify from "assets/images/small-logos/logo-spotify.svg";
import logoJira from "assets/images/small-logos/logo-jira.svg";
import logoInvesion from "assets/images/small-logos/logo-invision.svg";
import team1 from "assets/images/team-1.jpg";
import team2 from "assets/images/team-2.jpg";
import team3 from "assets/images/team-3.jpg";
import team4 from "assets/images/team-4.jpg";

export default function data() {
  const avatars = (members) =>
    members.map(([image, name]) => (
      <Tooltip key={name} title={name} placeholder="bottom">
        <MDAvatar
          src={image}
          alt="name"
          size="xs"
          sx={{
            border: ({ borders: { borderWidth }, palette: { white } }) =>
              `${borderWidth[2]} solid ${white.main}`,
            cursor: "pointer",
            position: "relative",

            "&:not(:first-of-type)": {
              ml: -1.25,
            },

            "&:hover, &:focus": {
              zIndex: "10",
            },
          }}
        />
      </Tooltip>
    ));

  const Company = ({ image, name }) => (
    <MDBox display="flex" alignItems="center" lineHeight={1}>
      <MDAvatar src={image} name={name} size="sm" />
      <MDTypography variant="button" fontWeight="medium" ml={1} lineHeight={1}>
        {name}
      </MDTypography>
    </MDBox>
  );

  return {
    columns: [
      { Header: "IMEI NUMBER", accessor: "imeiNumber", width: "30%", align: "left" },
      { Header: "ACCOUNT NUMBER", accessor: "accountNumber", width: "30%", align: "left" },
      { Header: "VIA", accessor: "via", align: "center" },
      { Header: "ROUTE", accessor: "route", align: "center" },
    ],

    rows: [
      {
        imeiNumber: (
          <MDTypography variant="caption" color="text" fontWeight="medium">
            913280183713
          </MDTypography>
        ),
        accountNumber: (
          <MDTypography variant="caption" color="text" fontWeight="medium">
            ACC-001034
          </MDTypography>
        ),
        via: (
          <MDTypography variant="caption" color="info" fontWeight="medium">
            API Gateway
          </MDTypography>
        ),
        route: (
          <MDTypography variant="caption" color="text" fontWeight="medium">
            New York -&gt; Miami
          </MDTypography>
        ),
      },
      {
        imeiNumber: (
          <MDTypography variant="caption" color="text" fontWeight="medium">
            883018277209
          </MDTypography>
        ),
        accountNumber: (
          <MDTypography variant="caption" color="text" fontWeight="medium">
            ACC-001035
          </MDTypography>
        ),
        via: (
          <MDTypography variant="caption" color="dark" fontWeight="medium">
            Manual Upload
          </MDTypography>
        ),
        route: (
          <MDTypography variant="caption" color="text" fontWeight="medium">
            Chicago -&gt; Dallas
          </MDTypography>
        ),
      },
      {
        imeiNumber: (
          <MDTypography variant="caption" color="text" fontWeight="medium">
            771123456789
          </MDTypography>
        ),
        accountNumber: (
          <MDTypography variant="caption" color="text" fontWeight="medium">
            ACC-001036
          </MDTypography>
        ),
        via: (
          <MDTypography variant="caption" color="info" fontWeight="medium">
            API Gateway
          </MDTypography>
        ),
        route: (
          <MDTypography variant="caption" color="text" fontWeight="medium">
            Denver -&gt; Phoenix
          </MDTypography>
        ),
      },
      {
        imeiNumber: (
          <MDTypography variant="caption" color="text" fontWeight="medium">
            664590123456
          </MDTypography>
        ),
        accountNumber: (
          <MDTypography variant="caption" color="text" fontWeight="medium">
            ACC-001037
          </MDTypography>
        ),
        via: (
          <MDTypography variant="caption" color="info" fontWeight="medium">
            API Gateway
          </MDTypography>
        ),
        route: (
          <MDTypography variant="caption" color="text" fontWeight="medium">
            Houston -&gt; Atlanta
          </MDTypography>
        ),
      },
      {
        imeiNumber: (
          <MDTypography variant="caption" color="text" fontWeight="medium">
            550019283746
          </MDTypography>
        ),
        accountNumber: (
          <MDTypography variant="caption" color="text" fontWeight="medium">
            ACC-001038
          </MDTypography>
        ),
        via: (
          <MDTypography variant="caption" color="dark" fontWeight="medium">
            Manual Upload
          </MDTypography>
        ),
        route: (
          <MDTypography variant="caption" color="text" fontWeight="medium">
            Seattle -&gt; Portland
          </MDTypography>
        ),
      },
      {
        imeiNumber: (
          <MDTypography variant="caption" color="text" fontWeight="medium">
            447890123456
          </MDTypography>
        ),
        accountNumber: (
          <MDTypography variant="caption" color="text" fontWeight="medium">
            ACC-001039
          </MDTypography>
        ),
        via: (
          <MDTypography variant="caption" color="info" fontWeight="medium">
            API Gateway
          </MDTypography>
        ),
        route: (
          <MDTypography variant="caption" color="text" fontWeight="medium">
            Boston -&gt; Philadelphia
          </MDTypography>
        ),
      },
      {
        imeiNumber: (
          <MDTypography variant="caption" color="text" fontWeight="medium">
            331234509876
          </MDTypography>
        ),
        accountNumber: (
          <MDTypography variant="caption" color="text" fontWeight="medium">
            ACC-001040
          </MDTypography>
        ),
        via: (
          <MDTypography variant="caption" color="info" fontWeight="medium">
            API Gateway
          </MDTypography>
        ),
        route: (
          <MDTypography variant="caption" color="text" fontWeight="medium">
            San Diego -&gt; LA
          </MDTypography>
        ),
      },
      {
        imeiNumber: (
          <MDTypography variant="caption" color="text" fontWeight="medium">
            229876543210
          </MDTypography>
        ),
        accountNumber: (
          <MDTypography variant="caption" color="text" fontWeight="medium">
            ACC-001041
          </MDTypography>
        ),
        via: (
          <MDTypography variant="caption" color="dark" fontWeight="medium">
            Manual Upload
          </MDTypography>
        ),
        route: (
          <MDTypography variant="caption" color="text" fontWeight="medium">
            Miami -&gt; Orlando
          </MDTypography>
        ),
      },
      {
        imeiNumber: (
          <MDTypography variant="caption" color="text" fontWeight="medium">
            110055447788
          </MDTypography>
        ),
        accountNumber: (
          <MDTypography variant="caption" color="text" fontWeight="medium">
            ACC-001042
          </MDTypography>
        ),
        via: (
          <MDTypography variant="caption" color="info" fontWeight="medium">
            API Gateway
          </MDTypography>
        ),
        route: (
          <MDTypography variant="caption" color="text" fontWeight="medium">
            Dallas -&gt; Austin
          </MDTypography>
        ),
      },
      {
        imeiNumber: (
          <MDTypography variant="caption" color="text" fontWeight="medium">
            006789123456
          </MDTypography>
        ),
        accountNumber: (
          <MDTypography variant="caption" color="text" fontWeight="medium">
            ACC-001043
          </MDTypography>
        ),
        via: (
          <MDTypography variant="caption" color="dark" fontWeight="medium">
            Manual Upload
          </MDTypography>
        ),
        route: (
          <MDTypography variant="caption" color="text" fontWeight="medium">
            Las Vegas -&gt; Reno
          </MDTypography>
        ),
      },
    ],
  };
}
