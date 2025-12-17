// src/.../Projects.styles.js

export const checkboxBaseSx = {
  "& .MuiSvgIcon-root": {
    fontSize: 22,
  },
};

export const filterToggleBoxSx = (theme) => ({
  position: "absolute",
  top: -18,
  left: 24,
  backgroundColor: theme.palette.background.paper,
  borderRadius: "16px",
  boxShadow: theme.shadows[3],
  overflow: "hidden",
});

export const filterToggleButtonSx = {
  borderRadius: 0,
  px: 2,
  py: 1,
  minWidth: "110px",
  boxShadow: "none",
};

export const unreachableToggleButtonSx = {
  ...filterToggleButtonSx,
  minWidth: "130px",
};

export const tableCardSx = {
  height: "100%",
  mt: 3,
  overflow: "visible",
};

export const tablePaginationHideSelectSx = {
  "& .MuiTablePagination-selectLabel, & .MuiTablePagination-input": {
    display: "none",
  },
};

export const clickableTextSx = {
  cursor: "pointer",
  textDecoration: "underline",
};

export const addressMapLinkSx = {
  cursor: "pointer",
  textDecoration: "underline",
  mt: 0.5,
  "&:hover": { color: "primary.main" },
};
