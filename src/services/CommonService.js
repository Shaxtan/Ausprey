import Swal from "sweetalert2";
import authHeader from "./auth-header";
import axios from "axios";
import ConfigService from "./ConfigService";

import { Helmet } from "react-helmet";
//import { Navigate } from "react-router-dom";
const PROJECT_NAME = process.env.REACT_APP_PROJECT_NAME;

export function callAlert(
  title = "",
  msg = "Unable to fetch the data, Please contact system administrator or try again later!",
  icon = "error", // 'success' | 'error' | 'warning' | 'info' | 'question'
  timer = 10000 // Value 0 for no auto close alert
) {
  let SwalArr = {
    title: title,
    icon: icon,
    // html: msg,
    showCloseButton: true,
    showCancelButton: false,
    focusConfirm: false,
    showConfirmButton: false,
    confirmButtonText: '<i class="fa fa-thumbs-up"></i> Great!',
    confirmButtonAriaLabel: "",
    cancelButtonText: '<i class="fa fa-thumbs-down"></i>',
  };

  if (timer) {
    SwalArr["timer"] = timer;
  }
  return Swal.fire(SwalArr);
}

export function callAlertConfirm(
  title = "",
  text = "",
  callback = null,
  allowOutsideClick = true,
  timer = null, // Value 0 for no auto close alert
  confirmButtonText = "Yes",
  denyButtonText = "No"
) {
  return new Promise((resolve) => {
    if (timer === null) {
      timer = 10000;
    }

    let SwalArr = {
      title: title,
      html: text,
      showDenyButton: true, // Show the "No" button
      showCancelButton: false,
      confirmButtonText: confirmButtonText,
      denyButtonText: denyButtonText,
      icon: "question",
      allowOutsideClick: allowOutsideClick,
      customClass: {
        actions: "my-actions",
        cancelButton: "order-1 right-gap",
        confirmButton: "order-2",
        denyButton: "order-3",
      },
    };

    if (timer) {
      SwalArr["timer"] = timer;
    }

    Swal.fire(SwalArr).then((result) => {
      // Resolve the Promise with true if confirmed, false if denied
      resolve(result.isConfirmed); // This returns true/false depending on button clicked
      if (callback) {
        callback(result.isConfirmed); // Optional callback with the result
      }
    });
  });
}

export function downloadPdfFile(
  url,
  name = "syllabus",
  bodyData = null,
  sendJwt = false,
  method = "GET"
) {
  let headers = {};

  if (sendJwt) {
    headers = authHeader();
  }

  axios({
    url: ConfigService.PUBLIC_URL + url,
    method: method,
    responseType: "blob",
    headers: headers,
    // headers: authHeader(), // Conditionally include JWT token
    data: bodyData ? bodyData : null, // Conditionally send body data
  })
    .then((response) => {
      const link = document.createElement("a");
      const blob = new Blob([response.data], { type: "application/pdf" });
      const downloadUrl = window.URL.createObjectURL(blob);

      link.href = downloadUrl;
      link.download = name + ".pdf"; // Name of the downloaded file
      link.click();

      // Clean up the URL
      window.URL.revokeObjectURL(downloadUrl);
    })
    .catch((error) => {
      console.error("Error downloading the PDF:", error);
    });
}

export function removeModel(id) {
  document.getElementById(id).classList.remove("show");
  let models = document.getElementsByClassName("modal-backdrop")[0];
  models.remove();
  let nFilter = document.getElementById(id);
  nFilter.style.display = "none";
  let body = document.getElementsByClassName("body")[0];
  if (body) {
    body.style.overflow = "auto";
  }
}

export function AlertSuccess(
  title = "",
  text = "",
  callback = null,
  allowOutsideClick = true,
  timer = null, // Value 0 for no auto close alert
  confirmButtonText = "OK"
) {
  if (timer === null) {
    timer = 10000;
  }

  let SwalArr = {
    title: title,
    html: text,
    confirmButtonText: confirmButtonText,
    icon: "success",
    allowOutsideClick: allowOutsideClick,
    customClass: {
      actions: "my-actions",
      confirmButton: "order-2",
    },
  };
  if (timer) {
    SwalArr["timer"] = timer;
  }

  Swal.fire(SwalArr).then((result) => {
    if (callback) {
      callback(result);
    }
  });
}

export const setTitleWebsite = () => {
  document.title = PROJECT_NAME ? PROJECT_NAME : "";
  return <></>;
};

/* 

export function callRedirect( url='' ) {  
    
    
    const navigate = Navigate()
  
        return navigate(url);
      
}
 
 */
