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
  title = "Create Trip",
}) => {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{title}</DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={2} mt={0.5}>
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
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Account Name"
              value={form.accountName}
              onChange={onFieldChange("accountName")}
              size="small"
              error={!!errors.accountName}
              helperText={errors.accountName}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Source"
              value={form.source}
              onChange={onFieldChange("source")}
              size="small"
              error={!!errors.source}
              helperText={errors.source}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Destination"
              value={form.destination}
              onChange={onFieldChange("destination")}
              size="small"
              error={!!errors.destination}
              helperText={errors.destination}
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
              helperText={errors.imei}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Driver Name"
              value={form.driver}
              onChange={onFieldChange("driver")}
              size="small"
              error={!!errors.driver}
              helperText={errors.driver}
            />
          </Grid>
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
  form: PropTypes.shape({
    vehicleNumber: PropTypes.string,
    accountName: PropTypes.string,
    source: PropTypes.string,
    destination: PropTypes.string,
    imei: PropTypes.string,
    driver: PropTypes.string,
  }).isRequired,
  errors: PropTypes.object.isRequired,
  onClose: PropTypes.func.isRequired,
  onFieldChange: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  title: PropTypes.string,
};

export default CreateTripDialog;



// import React from "react";
// import PropTypes from "prop-types";

// import Dialog from "@mui/material/Dialog";
// import DialogTitle from "@mui/material/DialogTitle";
// import DialogContent from "@mui/material/DialogContent";
// import DialogActions from "@mui/material/DialogActions";
// import Grid from "@mui/material/Grid";
// import TextField from "@mui/material/TextField";
// import Button from "@mui/material/Button";

// const CreateTripDialog = ({
//   open,
//   form,
//   errors,
//   fields,
//   onClose,
//   onFieldChange,
//   onSubmit,
//   title = "Create Trip",
// }) => {
//   return (
//     <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
//       <DialogTitle>{title}</DialogTitle>
//       <DialogContent dividers>
//         <Grid container spacing={2} mt={0.5}>
//           {fields.map((field) => (
//             <Grid key={field.name} item xs={12} sm={6}>
//               <TextField
//                 fullWidth
//                 label={field.label}
//                 value={form[field.name] ?? ""}
//                 onChange={onFieldChange(field.name)}
//                 size="small"
//                 error={!!errors[field.name]}
//                 helperText={errors[field.name] || " "}
//                 required={!!field.required}
//               />
//             </Grid>
//           ))}
//         </Grid>
//       </DialogContent>
//       <DialogActions>
//         <Button onClick={onClose} color="inherit">
//           Cancel
//         </Button>
//         <Button onClick={onSubmit} variant="contained" color="primary">
//           Create
//         </Button>
//       </DialogActions>
//     </Dialog>
//   );
// };

// CreateTripDialog.propTypes = {
//   open: PropTypes.bool.isRequired,
//   // form object like { vehnum: '', imei: '', source: '', ... }
//   form: PropTypes.object.isRequired,
//   // errors object like { vehnum: 'Required', imei: '', ... }
//   errors: PropTypes.object.isRequired,
//   // fields from admin config, e.g. [{ name: 'vehnum', label: 'Vehicle Number', required: true }]
//   fields: PropTypes.arrayOf(
//     PropTypes.shape({
//       name: PropTypes.string.isRequired,   // matches API key e.g. "vehnum"
//       label: PropTypes.string.isRequired,  // label to show in UI
//       required: PropTypes.bool,            // whether to validate as required
//     })
//   ).isRequired,
//   onClose: PropTypes.func.isRequired,
//   onFieldChange: PropTypes.func.isRequired, // (name) => (e) => {}
//   onSubmit: PropTypes.func.isRequired,
//   title: PropTypes.string,
// };

// export default CreateTripDialog;
