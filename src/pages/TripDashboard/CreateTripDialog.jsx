import React, { Fragment } from "react"; // ✅ Changed from just "react"

import PropTypes from "prop-types";
import Select from "react-select";

import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import MenuItem from "@mui/material/MenuItem";
import MDTypography from "../../assets/components/MDTypography";
import MDBox from "../../assets/components/MDBox";

const CreateTripDialog = ({
  open,
  form,
  errors,
  onClose,
  onFieldChange,
  onSubmit,
  dynamicFields = [],
  imeiList = [],
  geofenceList = [],
  waypoints = [], // ✅ NEW
  waypointInOut = {}, // ✅ NEW
  onWaypointChange, // ✅ NEW
  onWaypointTimingChange, // ✅ NEW
  title = "Create Trip",
}) => {
  /**
   * Helper function to render fields based on their "type"
   * and keep styling uniform with other inputs.
   */
  const renderField = (field) => {
    const type = field.type.toUpperCase();
    const isDateTime = type === "DATETIME";

    // GEOFENCE as dropdown
    if (type === "GEOFENCE") {
      return (
        <TextField
          select
          fullWidth
          size="small"
          label={field.label}
          value={form[field.key] || ""}
          onChange={onFieldChange(field.key)}
          error={!!errors[field.key]}
          helperText={errors[field.key] || `Select ${field.label}`}
          InputLabelProps={{ shrink: true }}
          FormHelperTextProps={{ sx: { marginLeft: 0 } }}
          sx={{
            "& .MuiInputBase-root": {
              height: 40,
            },
          }}
        >
          {geofenceList.map((geo) => (
            <MenuItem key={geo.id} value={geo.name}>
              {geo.name}
            </MenuItem>
          ))}
          {geofenceList.length === 0 && <MenuItem disabled>No Geofences Available</MenuItem>}
        </TextField>
      );
    }

    // Add this inside the component (before return)
    const handleTimingChange = (waypointId, field) => (e) => {
      const value = e.target.value;
      onWaypointTimingChange(waypointId, field, value);
    };

    // DATETIME / TEXT
    return (
      <TextField
        fullWidth
        size="small"
        label={field.label}
        type={isDateTime ? "datetime-local" : "text"}
        value={form[field.key] || ""}
        onChange={onFieldChange(field.key)}
        error={!!errors[field.key]}
        helperText={errors[field.key]}
        placeholder={field.type}
        InputLabelProps={isDateTime ? { shrink: true } : { shrink: true }}
        FormHelperTextProps={{ sx: { marginLeft: 0 } }}
        sx={{
          "& .MuiInputBase-root": {
            height: 40,
          },
        }}
      />
    );
  };

  const imeiOptions = imeiList.map((option) => ({
    value: option.imei,
    label: option.vehnum ? `${option.vehnum} (${option.imei})` : option.imei,
  }));

  // Custom styles for react-select to mimic MUI small TextField
  const customSelectStyles = {
    control: (base, state) => ({
      ...base,
      minHeight: 32,
      height: 32,
      borderRadius: 4,
      fontSize: 12,
      borderColor: state.isFocused ? "#1A73E8" : "#c4c4c4",
      boxShadow: state.isFocused ? "0 0 0 1px #1A73E8" : "none",
      "&:hover": {
        borderColor: "#000",
      },
    }),
    valueContainer: (base) => ({
      ...base,
      padding: "0 6px",
    }),
    input: (base) => ({
      ...base,
      margin: 0,
      padding: 0,
    }),
    indicatorsContainer: (base) => ({
      ...base,
      padding: 4,
    }),
    menuPortal: (base) => ({ ...base, zIndex: 9999 }),
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{title}</DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={2} mt={0.5}>
          {/* Vehicle Number */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Vehicle Number"
              value={form.vehicleNumber}
              onChange={onFieldChange("vehicleNumber")}
              size="small"
              error={!!errors.vehicleNumber}
              helperText={errors.vehicleNumber}
              InputLabelProps={{ shrink: true }}
              FormHelperTextProps={{ sx: { marginLeft: 0 } }}
              sx={{
                "& .MuiInputBase-root": {
                  height: 40,
                },
              }}
            />
          </Grid>

          {/* IMEI (react-select) */}
          <Grid item xs={12} sm={6}>
            <MDBox
              display="flex"
              flexDirection="column"
              gap={0.3}
              mt={0} // slightly move up, but less extreme
            >
              {/* <MDTypography
                variant="caption"
                fontWeight="bold"
                color="text"
                ml={0.5}
              >
                Select IMEI *
              </MDTypography> */}

              <Select
                options={imeiOptions}
                value={imeiOptions.find((opt) => opt.value === form.imei) || null}
                onChange={(selected) => {
                  onFieldChange("imei")({
                    target: { value: selected ? selected.value : "" },
                  });
                }}
                placeholder="Search vehicle or IMEI..."
                isClearable
                isSearchable
                menuPortalTarget={document.body}
                styles={{
                  control: (base, state) => ({
                    ...base,
                    minHeight: 40,
                    borderRadius: 4,
                    borderColor: state.isFocused ? "#1A73E8" : "#d2d6da",
                    boxShadow: "none",
                    "&:hover": { borderColor: state.isFocused ? "#1A73E8" : "#b3b3b3" },
                    fontSize: "0.875rem",
                  }),
                  placeholder: (base) => ({
                    ...base,
                    fontSize: "0.875rem",
                    color: "#adb5bd",
                    marginTop: "2px",
                  }),
                  singleValue: (base) => ({
                    ...base,
                    fontSize: "0.875rem",
                  }),
                  menuPortal: (base) => ({
                    ...base,
                    zIndex: 1300,
                  }),
                  menu: (base) => ({
                    ...base,
                    zIndex: 1301,
                  }),
                }}
              />

              {errors.imei && (
                <MDTypography variant="caption" color="error" ml={0.5} mt={0.2}>
                  {errors.imei}
                </MDTypography>
              )}
            </MDBox>
          </Grid>

          {/* Source Dropdown */}
          <Grid item xs={12} sm={6}>
            <TextField
              select
              fullWidth
              label="Source"
              value={form.source || ""}
              onChange={onFieldChange("source")}
              size="small"
              error={!!errors.source}
              helperText={errors.source}
              InputLabelProps={{
                shrink: true,
              }}
              FormHelperTextProps={{
                sx: { marginLeft: 0 },
              }}
              sx={{
                "& .MuiInputBase-root": {
                  height: 40,
                },
              }}
            >
              {geofenceList.map((geo) => (
                <MenuItem key={geo.id} value={geo.id}>
                  {geo.name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          {/* Destination Dropdown */}
          <Grid item xs={12} sm={6}>
            <TextField
              select
              fullWidth
              label="Destination"
              value={form.destination || ""}
              onChange={onFieldChange("destination")}
              size="small"
              error={!!errors.destination}
              helperText={errors.destination}
              InputLabelProps={{
                shrink: true,
              }}
              FormHelperTextProps={{
                sx: { marginLeft: 0 },
              }}
              sx={{
                "& .MuiInputBase-root": {
                  height: 40,
                },
              }}
            >
              {geofenceList.map((geo) => (
                <MenuItem key={geo.id} value={geo.id}>
                  {geo.name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          {/* ✅ WAYPOINTS SECTION - MANDATORY */}
          <Grid item xs={12}>
            <MDTypography variant="body2" color="info" mb={1}>
              {waypoints.length} waypoints selected
            </MDTypography>
            <TextField
              select
              fullWidth
              label="Waypoints * (Required)"
              multiple
              value={waypoints}
              onChange={(e) => onWaypointChange(e.target.value)}
              error={!!errors.waypoints}
              helperText={errors.waypoints || "Hold Ctrl/Cmd to select multiple"}
              SelectProps={{ multiple: true }}
              InputLabelProps={{ shrink: true }}
              size="small"
              sx={{ "& .MuiInputBase-root": { height: 40 } }}
            >
              {geofenceList.map(
                (
                  geo // ✅ FIXED: Use geofenceList
                ) => (
                  <MenuItem key={geo.id} value={geo.id}>
                    {geo.name} {geo.type === "waypoint" ? "⚡" : ""}
                  </MenuItem>
                )
              )}
              {geofenceList.length === 0 && <MenuItem disabled>No Geofences</MenuItem>}
            </TextField>
          </Grid>

          {/* ✅ FIXED WAYPOINT TIMINGS - Dynamic fields for selected waypoints */}
          {waypoints.map((waypointId) => {
            const waypointName = geofenceList.find((g) => g.id === waypointId)?.name || waypointId;

            return (
              <React.Fragment key={waypointId}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label={`In Time - ${waypointName}`}
                    type="time"
                    // Ensure we are accessing the state correctly
                    value={waypointInOut[waypointId]?.in || ""}
                    onChange={(e) => onWaypointTimingChange(waypointId, "in", e.target.value)}
                    size="small"
                    InputLabelProps={{ shrink: true }}
                    // This ensures the browser's time picker doesn't conflict with React
                    inputProps={{ step: 300 }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label={`Out Time - ${waypointName}`}
                    type="time"
                    // Ensure we are accessing the state correctly
                    value={waypointInOut[waypointId]?.out || ""}
                    onChange={(e) => onWaypointTimingChange(waypointId, "out", e.target.value)}
                    size="small"
                    InputLabelProps={{ shrink: true }}
                    // This ensures the browser's time picker doesn't conflict with React
                    inputProps={{ step: 300 }}
                  />
                </Grid>
              </React.Fragment>
            );
          })}

          {/* Dynamic Fields from API */}
          {dynamicFields.length > 0 &&
            dynamicFields.map((field) => (
              <Grid item xs={12} sm={6} key={field.key}>
                {renderField(field)}
              </Grid>
            ))}
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button
          onClick={onSubmit}
          variant="contained"
          color="inherit"
          sx={{
            backgroundColor: "#1976d2", // or any color you want
            color: "#ffffff",
            "&:hover": {
              backgroundColor: "#115293",
            },
          }}
        >
          Create
        </Button>
      </DialogActions>
    </Dialog>
  );
};

CreateTripDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  form: PropTypes.object.isRequired,
  errors: PropTypes.object.isRequired,
  onClose: PropTypes.func.isRequired,
  onFieldChange: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  imeiList: PropTypes.array,
  waypoints: PropTypes.array,
  waypointInOut: PropTypes.object,
  onWaypointChange: PropTypes.func,
  onWaypointTimingChange: PropTypes.func,
  geofenceList: PropTypes.array,
  dynamicFields: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      type: PropTypes.string.isRequired,
    })
  ),
  title: PropTypes.string,
};

export default CreateTripDialog;
