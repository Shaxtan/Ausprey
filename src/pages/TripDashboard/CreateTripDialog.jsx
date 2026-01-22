import React from "react";
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
  geofenceList = [], // New prop for Geofence dropdown
  title = "Create Trip",
}) => {
  /**
   * Helper function to render fields based on their "type"
   */
  const renderField = (field) => {
    const type = field.type.toUpperCase();

    // 1. Handle GEOFENCE Type as a Dropdown
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

    // 2. Handle DATETIME and Standard TEXT types
    const isDateTime = type === "DATETIME";

    return (
      <TextField
        fullWidth
        size="small"
        label={field.label}
        // If it's a date-time type, we use the native HTML5 picker
        type={isDateTime ? "datetime-local" : "text"}
        value={form[field.key] || ""}
        onChange={onFieldChange(field.key)}
        error={!!errors[field.key]}
        helperText={errors[field.key]}
        placeholder={field.type}
        // Required for datetime-local to display the label correctly
        InputLabelProps={isDateTime ? { shrink: true } : {}}
      />
    );
  };
  const imeiOptions = imeiList.map((option) => ({
    value: option.imei,
    label: option.vehnum ? `${option.vehnum} (${option.imei})` : option.imei,
  }));

  // 2. Custom styles to match Material UI "Small" size
  const customSelectStyles = {
    control: (base, state) => ({
      ...base,
      minHeight: "40px",
      borderRadius: "4px",
      borderColor: state.isFocused ? "#1A73E8" : "#c4c4c4",
      boxShadow: state.isFocused ? "0 0 0 1px #1A73E8" : "none",
      "&:hover": {
        borderColor: "#000",
      },
    }),
    menuPortal: (base) => ({ ...base, zIndex: 9999 }), // Ensures dropdown isn't cut off
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{title}</DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={2} mt={0.5}>
          {/* Static Fields */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Vehicle Number"
              value={form.vehicleNumber}
              onChange={onFieldChange("vehicleNumber")}
              size="small"
              error={!!errors.vehicleNumber}
              helperText={errors.vehicleNumber}
            />
          </Grid>

          {/* Updated IMEI field to be a Dropdown */}
          <Grid item xs={12} sm={6}>
            <MDTypography variant="caption" fontWeight="bold" color="text" ml={0.5}>
              Select IMEI *
            </MDTypography>
            <Select
              options={imeiOptions}
              value={imeiOptions.find((opt) => opt.value === form.imei) || null}
              onChange={(selected) => {
                // Simulate the event structure your onFieldChange expects
                onFieldChange("imei")({ target: { value: selected ? selected.value : "" } });
              }}
              placeholder="Search vehicle or IMEI..."
              isClearable
              isSearchable
              menuPortalTarget={document.body}
              styles={customSelectStyles}
            />
            {errors.imei && (
              <MDTypography variant="caption" color="error" ml={0.5}>
                {errors.imei}
              </MDTypography>
            )}
          </Grid>

          {/* Source Dropdown */}
          <Grid item xs={12} sm={6}>
            <TextField
              select
              fullWidth
              label="Source"
              value={form.source || ""} // Storing ID here
              onChange={onFieldChange("source")}
              size="small"
              error={!!errors.source}
              helperText={errors.source}
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
              value={form.destination || ""} // Storing ID here
              onChange={onFieldChange("destination")}
              size="small"
              error={!!errors.destination}
              helperText={errors.destination}
            >
              {geofenceList.map((geo) => (
                <MenuItem key={geo.id} value={geo.id}>
                  {geo.name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          {/* Dynamic Fields with Datatype Validations/Pickers/Dropdowns */}
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
        <Button onClick={onSubmit} variant="contained" color="primary">
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
  geofenceList: PropTypes.array, // Added PropTypes for geofenceList
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
