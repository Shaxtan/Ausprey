/**
=========================================================
* Material Dashboard 2  React - v2.2.0
=========================================================
// ... (Copyright and license notice) ...
*/

import { useMemo } from "react";
import PropTypes from "prop-types";

// react-chartjs-2 components
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

// @mui material components
import Card from "@mui/material/Card";
import Icon from "@mui/material/Icon";

// Material Dashboard 2 React components
import MDBox from "../../../MDBox";
import MDTypography from "../../../MDTypography";

// PieChart configurations
import configs from "../PieChart/configs";

ChartJS.register(ArcElement, Tooltip, Legend);

function PieChart({ icon, title, description, height, chart }) {
  // Get initial data and options from the configs file
  const { data, options: baseOptions } = configs(chart.labels || [], chart.datasets || {});

  // --- MODIFICATION: Enable Chart.js Legend on the Right ---
  const legendConfig = {
    // Crucial: Set legend position to 'right'
    position: 'right', 
    labels: {
      usePointStyle: true, // Use a small colored circle/square
      padding: 15,
    },
    align: 'center', // Align legend items (optional)
  };

  // Merge the base options with the new legend configuration
  const options = {
    ...baseOptions,
    responsive: true,
    maintainAspectRatio: false, 
    plugins: {
      ...baseOptions.plugins,
      legend: legendConfig, // Re-enable and configure the legend
    },
  };
  // -----------------------------------------------------------

  // Determine if the icon component is a JSX element or a string
  const isComponentIcon = typeof icon.component !== "string";

  const renderChart = (
    <MDBox py={2} pr={2} pl={icon.component ? 1 : 2}>
      
      {/* 1. HEADER SECTION (Title and Icon ONLY) */}
      {/* We keep the original logic to check for title OR description to render the container, 
          but we ensure DESCRIPTION IS NOT DISPLAYED IN THE HEADER. */}
      {title || description ? ( 
        <MDBox display="flex" px={description ? 1 : 0} pt={description ? 1 : 0}>
          {icon.component && (
            <MDBox
              width="4rem"
              height="4rem"
              bgColor={icon.color || "dark"}
              variant="gradient"
              coloredShadow={icon.color || "dark"}
              borderRadius="xl"
              display="flex"
              justifyContent="center"
              alignItems="center"
              color="white"
              mt={-5}
              mr={2}
            >
              {isComponentIcon ? (
                icon.component
              ) : (
                <Icon fontSize="medium">{icon.component}</Icon>
              )}
            </MDBox>
          )}
          <MDBox mt={icon.component ? -2 : 0}>
            {title && <MDTypography variant="h6">{title}</MDTypography>}
            
            {/* CRUCIAL: If the original description is only used for extra stats 
               and not needed in the header, comment out or remove this section.
               For now, we'll keep the description display here, assuming it's 
               still useful context for the title.
            */}
            {description && (
                <MDBox mb={0}>
                    <MDTypography component="div" variant="button" color="text">
                        {description}
                    </MDTypography>
                </MDBox>
            )}

          </MDBox>
        </MDBox>
      ) : null}
      
      {/* 2. CHART SECTION */}
      {useMemo(
        () => (
          // The MDBox uses the height prop to control the chart area
          // The Chart.js options will now handle placing the legend/colors on the right.
          <MDBox height={height}>
            <Pie data={data} options={options} redraw />
          </MDBox>
        ),
        [chart, height, options]
      )}
    </MDBox>
  );

  return title || description ? <Card>{renderChart}</Card> : renderChart;
}

// ... (Default props and prop types remain the same) ...
PieChart.defaultProps = {
  icon: { color: "info", component: "" },
  title: "",
  description: "",
  height: "150px", 
};

// Typechecking props for the PieChart
PieChart.propTypes = {
  icon: PropTypes.shape({
    color: PropTypes.oneOf([
      "primary",
      "secondary",
      "info",
      "success",
      "warning",
      "error",
      "light",
      "dark",
    ]),
    component: PropTypes.node,
  }),
  title: PropTypes.string,
  description: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  chart: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.array, PropTypes.object])).isRequired,
};
export default PieChart;