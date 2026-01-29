import axios from "axios";
import authHeader from "./auth-header";
import { callAlert } from "./CommonService";

// const SERVICES = {
//   main: process.env.REACT_APP_BASE_URL + ":8070",
//   mainn: process.env.REACT_APP_BASE_URL + ":8071",
//   report: process.env.REACT_APP_BASE_URL + ":8075",
//   dashboard: process.env.REACT_APP_BASE_URL + ":8075", //Dashboard
//   template: "http://103.178.113.129:8072",
//   tripOps: "http://103.178.113.129:8011",
// };

const SERVICES = {
  main: process.env.REACT_APP_BASE_URL + "/users",
  mainn: process.env.REACT_APP_BASE_URL + "/accounts",
  report: process.env.REACT_APP_BASE_URL + "/usage",
  // report: 'http://103.178.113.129' + ":8075",
  // dashboard: 'http://103.178.113.129' + ":8075",
  dashboard: process.env.REACT_APP_BASE_URL + "/usage",
  commands: process.env.REACT_APP_BASE_URL + "/commands",
  template: process.env.REACT_APP_BASE_URL + "/template",
  tripOps: process.env.REACT_APP_BASE_URL + "/tripOps",
  geofence: process.env.REACT_APP_BASE_URL + "/geofence",
};

axios.interceptors.response.use(
  (response) => {
    // 💡 Handle backend custom unauthorized response here
    if (response?.data?.resultCode === 500 && response?.data?.message === "Unauthorized") {
      console.warn("⚠️ Backend says unauthorized, redirecting...");
      localStorage.removeItem("userDetails");
      window.location.replace("/authentication/sign-in");
      return Promise.reject("Unauthorized");
    }

    return response; // all good
  },
  (error) => {
    const res = error?.response;

    // Handle standard 401 errors
    if (res?.status === 401) {
      console.warn("⚠️ HTTP 401 detected, redirecting...");
      localStorage.removeItem("userDetails");
      window.location.replace("/authentication/sign-in");
    }
    if (res?.status === 400) {
      console.warn("⚠️ HTTP 401 detected, redirecting...");
      localStorage.removeItem("userDetails");
      window.location.replace("/authentication/sign-in");
    }
    if (res?.status === 403) {
      console.warn("⚠️ HTTP 401 detected, redirecting...");
      localStorage.removeItem("userDetails");
      window.location.replace("/authentication/sign-in");
    }

    return Promise.reject(error);
  }
);

class ApiService {
  getRequest(url, callback = null, header = true, base = SERVICES.main) {
    const headers = header ? { headers: authHeader() } : {};
    return axios
      .get(base + url, headers)
      .then((res) => {
        if (callback) callback(res);
        return res; // Return the response for promise chaining
      })
      .catch((error) => {
        if (callback) callback({ message: error?.message });
        callAlert("Error", error?.message);
        throw error; // Re-throw to allow catch in caller
      });
  }

  postRequest(url, data = {}, header = true, base = SERVICES.main, params = {}) {
    const headers = header ? { headers: authHeader() } : {};
    return axios.post(base + url, data, { ...headers, params });
  }

  deleteRequest(url, header = true, base = SERVICES.main) {
    const headers = header ? { headers: authHeader() } : {};
    return axios.delete(base + url, headers);
  }

  getMockData(url, callback) {
    axios
      .get(url)
      .then((res) => {
        if (callback) callback(res);
      })
      .catch((error) => {
        callback({ message: error.message });
        callAlert("Error", error.message);
      });
  }

  getHistoryTrack(data) {
    return this.postRequest("/device-track/history-track", data, false, SERVICES.report);
  }

  getLiveData(accountId, imei, callback) {
    const url = `${SERVICES.report}/reports/livetrack`;
    return (
      axios
        .get(url + `?accountId=${accountId}&imei=${imei}`)
        // .get(url, { params: { accountId, imei } })
        .then((res) => callback(res))
        .catch((err) => {
          callback({ message: err.message });
          callAlert("Error", err.message);
        })
    );
  }

  getAccountDropdown(callback, header = true) {
    // The URL provided is '/accounts/accountDropdown' and uses SERVICES.main
    return this.getRequest(
      "/accounts/accountDropdown",
      null, // No local success callback passed here, handle in .then()
      header,
      SERVICES.mainn // Use the main service endpoint
    )
      .then((res) => {
        // Check for resultCode and pass data to component callback if successful
        if (res?.data?.resultCode === 1) {
          if (callback) callback(res);
          return res;
        } else {
          callAlert("Error", res?.data?.message || "Failed to fetch account list");
          return res;
        }
      })
      .catch((error) => {
        callAlert("Error", error?.message || "Failed to fetch account dropdown");
        throw error;
      });
  }

  // Existing: getDashboardData
  getDashboardData(data = {}, callback, header = true) {
    // 1. Destructure the accid from the data object
    const { accid } = data;

    return this.postRequest(
      "/reports/report/dashboard",
      data, // Empty data or other body data (kept in case backend needs it)
      header,
      SERVICES.dashboard,
      { accid } // 2. Pass accid as a URL query parameter using the 'params' argument
    )
      .then((res) => {
        if (callback) callback(res);
      })
      .catch((error) => {
        if (callback) callback({ message: error?.message });
        callAlert("Error", error?.message);
      });
  }
  getMapViewData(data = {}, callback, header = true, accid = 1) {
    return this.postRequest(
      "/reports/report/mapview",
      data,
      header,
      SERVICES.dashboard,
      { accid } // Pass accid as query parameter
    )
      .then((res) => {
        if (callback) callback(res);
      })
      .catch((error) => {
        if (callback) callback({ message: error?.message });
        callAlert("Error", error?.message);
      });
  }
  /**
   * --------------------------------------------------------------
   *  getTrackPlayHistory – returns points with a derived status:
   *
   *    speed < 5  && ign == "Y"  →  IDLE
   *    speed < 5  && ign == "N"  →  IDLE
   *    speed == 0               →  STOP
   *    speed > 5  && ign == "Y"  →  MOTION
   *
   *  The UI (LeafletControlsMap) now only reads `status` – no extra
   *  field is needed.
   * --------------------------------------------------------------
   */
  getTrackPlayHistory(data = {}, header = true) {
    return this.postRequest("/reports/trackPlayHistory", data, header, SERVICES.dashboard)
      .then((res) => {
        const raw = res?.data?.data || [];

        const normalizedData = raw.map((item) => {
          const speedNum = Number(item.speed) || 0; // <-- safe number
          const ign = (item.ign || "").toUpperCase(); // <-- "Y" / "N"

          // ────── DERIVE STATUS ──────
          let status = "IDLE"; // default

          if (speedNum === 0) {
            status = "STOP";
          } else if (speedNum > 5 && ign === "Y") {
            status = "MOTION";
          } else if (speedNum < 5) {
            status = "IDLE";
          }
          // ───────────────────────────

          return {
            name: item.vehicleNumber || item.imei,
            lat: item.latitude,
            lng: item.longitude,
            ts: item.deviceTime,
            speed: speedNum,
            status, // <-- derived
          };
        });

        return {
          ...res,
          data: {
            response: {
              report: normalizedData,
            },
          },
        };
      })
      .catch((error) => {
        callAlert("Error", error?.message || "Failed to fetch track play history");
        throw error;
      });
  }
  getImeiDropdown(accid = 1, header = true) {
    return this.getRequest(
      `/reports/report/dropdown?accid=${accid}`,
      null,
      header,
      SERVICES.dashboard
    )
      .then((res) => {
        // FIX: Access the data directly from the API structure you shared
        const list = res?.data?.data?.imeiVehnumList || [];

        return {
          ...res,
          data: {
            // Keep this structure if your Dashboard expect 'response.vehicles'
            response: {
              vehicles: list.map((item) => ({
                imei: item.imei,
                vehnum: item.vehnum,
              })),
            },
          },
        };
      })
      .catch((error) => {
        callAlert("Error", error?.message || "Failed to fetch IMEI dropdown");
        throw error;
      });
  }
  getAllDevices(accountId = null) {
    if (!accountId) {
      try {
        const user = JSON.parse(localStorage.getItem("userDetails") || "{}");
        accountId = user?.accid || 1;
      } catch {
        accountId = 1;
      }
    }

    return this.postRequest(
      "/reports/report/dashboard",
      { accid: accountId },
      true,
      SERVICES.dashboard
    )
      .then((res) => {
        // 1. Extract both lists from the nested response
        const vtsDevices = res?.data?.data?.data?.VTS?.available || [];
        const elkDevices = res?.data?.data?.data?.ELK?.available || [];

        // 2. Combine them into one array
        const allRawDevices = [
          ...vtsDevices.map((d) => ({ ...d, deviceSource: "VTS" })),
          ...elkDevices.map((d) => ({ ...d, deviceSource: "ELK" })),
        ];

        if (allRawDevices.length === 0) {
          console.warn("No devices found in dashboard response");
          return [];
        }

        // 3. Normalize them to the format LiveTrack expects
        const normalizedDevices = allRawDevices.map((d) => {
          const speedNum = Number(d.speed) || 0;
          const ign = (d.ign || "").toUpperCase();
          const lat = parseFloat(d.lat);
          const lng = parseFloat(d.lng);

          // Map status
          let status = "Inactive";
          if (d.deviceSource === "ELK") {
            // For ELK, status might depend on lock state or speed
            status = speedNum > 0 ? "Running" : "Stopped";
          } else {
            if (ign === "Y") {
              status = speedNum > 5 ? "Running" : "Idle";
            } else {
              status = speedNum === 0 ? "Stopped" : "Inactive";
            }
          }

          const location = lat && lng ? `${lat},${lng}` : null;
          const initialRoute = location ? [[lat, lng]] : [];

          return {
            id: d.imei,
            name: d.vehnum || d.name || d.imei,
            tripId: d.deviceSource === "ELK" ? "Padlock" : d.imei,
            status,
            speed: speedNum,
            // ELK might use different battery field, fallback to 50
            battery: d.anl ? Math.round((Number(d.anl) / 4.2) * 100) : 50,
            ignition: ign === "Y",
            lastUpdate: new Date(d.devTs || Date.now()).toLocaleTimeString(),
            driverName: "N/A",
            vehicleType: d.deviceSource === "ELK" ? "Lock" : "Truck",
            route: initialRoute,
            location,
            accountId: d.accid || accountId,
            deviceSource: d.deviceSource, // Carry this over to help LiveTrack logic
            raw: d,
          };
        });

        return normalizedDevices;
      })
      .catch((error) => {
        callAlert("Error", "Failed to load devices");
        console.error("getAllDevices error:", error);
        return [];
      });
  }

  testData(data = {}, header = true) {
    return (
      this.postRequest(
        "/reports/livetrack?accountId=1&imei=869356078374846",
        data,
        header,
        SERVICES.dashboard
        // { accid }
      )
        // .then((res) => {
        //   if (callback) callback(res);
        // })
        .catch((error) => {
          // Only callAlert here, but re-throw the error
          callAlert("Error", error?.message);
          throw error;
        })
    );
  }

  testData(accountId, imei, header = true) {
    // Update the hardcoded URL to use the passed parameters
    return this.postRequest(
      `/reports/livetrack?accountId=${accountId}&imei=${imei}`,
      {}, // Empty data body
      header,
      SERVICES.dashboard
    ).catch((error) => {
      callAlert("Error", error?.message);
      throw error;
    });
  }

  getUnreachableDevices(data = {}, callback, header = true) {
    // 1. Destructure the accid from the data object passed from the component
    const { accid } = data;

    // 2. Use the accid to build a 'params' object for the URL query string
    const urlParams = accid ? { accid } : {};

    return this.postRequest(
      "/reports/report/unrechableDevices", // <-- New Endpoint
      data, // Empty data or other body data (keep for POST structure)
      header,
      SERVICES.dashboard, // Uses the :8075 dashboard base URL
      urlParams // <-- **THIS IS THE CRITICAL CHANGE**
    )
      .then((res) => {
        if (callback) callback(res);
      })
      .catch((error) => {
        if (callback) callback({ message: error?.message });
        callAlert("Error", error?.message || "Failed to fetch unreachable devices");
      });
  }
  getAlertsByAccount(data, callback) {
    return this.postRequest("/alerts/by-account", data, true, SERVICES.dashboard)
      .then((res) => {
        if (callback) callback(res);
        return res;
      })
      .catch((error) => {
        callAlert("Error", error?.message || "Failed to fetch alerts");
        throw error;
      });
  }
  getDbAlerts(accId, callback) {
    return this.postRequest(
      "/alerts/db-alerts",
      {}, // Empty body as per your CURL -d ''
      true,
      SERVICES.dashboard,
      { accid: accId } // Query parameter
    )
      .then((res) => {
        if (callback) callback(res);
        return res;
      })
      .catch((error) => {
        callAlert("Error", error?.message || "Failed to fetch DB alerts");
        throw error;
      });
  }
  // Inside ApiService class
  getTripTemplate(id = null) {
    let accountId = id;

    // If no ID is passed, try to get it from localStorage
    if (!accountId) {
      try {
        const user = JSON.parse(localStorage.getItem("userDetails") || "{}");
        accountId = user?.accid || user?.accountId || 1; // Fallback to 1 if not found
      } catch (e) {
        accountId = 1;
      }
    }

    return this.getRequest(`/trip-template/${accountId}`, null, true, SERVICES.template);
  }

  createTrip(payload) {
    return this.postRequest("/trips/create", payload, true, SERVICES.tripOps);
  }
  // Add this inside the ApiService class
  getGeofences(pageNo = 0) {
    // Use a direct axios call if you need a specific base URL not in SERVICES
    // or add GEOFENCE: "http://103.178.113.129:8012" to your SERVICES object
    // const GEOFENCE_BASE = "http://103.178.113.129:8012";

    return this.postRequest(
      "/geo-fence/view-all",
      { pageNo },
      true, // Set to true if it needs Auth header, false if not
      SERVICES.geofence
    )
      .then((res) => {
        // Return only the data array for easier use in the component
        if (res?.data?.resultCode === 1) {
          return res.data.data; // This is the list of geofences
        }
        return [];
      })
      .catch((err) => {
        console.error("Geofence API Error:", err);
        return [];
      });
  }
  // Add this inside the ApiService class in ApiService.js
  // getLiveLoadGraph(imei) {
  //   return this.postRequest(`/reports/live-load-graph?IMEI=861076080488743`);
  // }
}

export { SERVICES };
export default new ApiService();
