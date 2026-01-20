import React from "react";
import PropTypes from "prop-types";

import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";

const CreateTripDialog = ({
  open,
  form,
  errors,
  onClose,
  onFieldChange,
  onSubmit,
  dynamicFields = [], // Received from Dashboard
  title = "Create Trip",
}) => {
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
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="IMEI"
              value={form.imei}
              onChange={onFieldChange("imei")}
              size="small"
              error={!!errors.imei}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Source"
              value={form.source}
              onChange={onFieldChange("source")}
              size="small"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Destination"
              value={form.destination}
              onChange={onFieldChange("destination")}
              size="small"
            />
          </Grid>

          {/* Dynamic Fields from FieldMap */}
          {dynamicFields.length > 0 &&
            dynamicFields.map((field) => (
              <Grid item xs={12} sm={6} key={field.key}>
                <TextField
                  fullWidth
                  label={field.label} // Shows "Consignee Mobile"
                  value={form[field.key] || ""} // Matches the state key "cemobile"
                  onChange={onFieldChange(field.key)}
                  size="small"
                  placeholder={field.type} // Shows "MOBILE"
                  error={!!errors[field.key]}
                  helperText={errors[field.key]}
                />
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
  dynamicFields: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string.isRequired, // e.g., "cemobile"
      label: PropTypes.string.isRequired, // e.g., "Consignee Mobile"
      type: PropTypes.string.isRequired, // e.g., "MOBILE"
    })
  ),
  title: PropTypes.string,
};

export default CreateTripDialog;
