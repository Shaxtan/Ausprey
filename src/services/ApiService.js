import axios from "axios";
import authHeader from "./auth-header";
import { callAlert } from "./CommonService";

const SERVICES = {
  main: process.env.REACT_APP_BASE_URL + ":8070",
  // report: process.env.REACT_APP_BASE_URL + ":8099",
  report: process.env.REACT_APP_BASE_URL + ":8075",
  dashboard: process.env.REACT_APP_BASE_URL + ":8075", // Dashboard API base URL
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

  getDashboardData(data = {}, callback, header = true) {
    return this.postRequest(
      "/reports/report/dashboard",
      data,
      header,
      SERVICES.dashboard
      // { accid }
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
        // Normalise to the same shape the hook expects
        const list = res?.data?.data?.imeiVehnumList || [];

        return {
          ...res,
          data: {
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
  getAllDevices(accountId = 1) {
    // You are using postRequest for getDashboardData, so we stick to that.
    return this.postRequest(
      "/reports/report/dashboard",
      { accid: accountId }, // Assuming accid is passed in the body
      true,
      SERVICES.dashboard
    )
      .then((res) => {
        const rawDevices = res?.data?.data?.data || [];

        // Normalize the raw API response into the structure needed by LiveTrack.js
        const normalizedDevices = rawDevices.map((d) => {
          const speedNum = Number(d.speed) || 0;
          const ign = (d.ign || "").toUpperCase();

          let status;
          if (ign === "Y") {
            status = speedNum > 5 ? "Running" : "Idle";
          } else {
            status = speedNum === 0 ? "Stopped" : "Inactive";
          }

          // Convert location string to Leaflet array format
          const location = d.lat && d.lng ? `${d.lat},${d.lng}` : null;

          return {
            id: d.imei,
            name: d.vehnum || d.imei,
            tripId: d.imei, // Using IMEI as a dummy tripId for live view
            status: status,
            speed: speedNum,
            battery: d.anl ? Math.round((Number(d.anl) / 4.2) * 100) : 50, // Mocked/calculated battery
            ignition: ign === "Y",
            lastUpdate: new Date(d.devTs).toLocaleTimeString(), // Use device timestamp
            driverName: "N/A", // Placeholder: Needs proper API call if real
            vehicleType: "Truck", // Placeholder
            // Initialize route with the latest position for map rendering
            route: location ? [[d.lat, d.lng]] : [],
            location: location, // Store the lat/lng string
            accountId: d.accid, // Store account ID for live track API call
          };
        });

        // The LiveTrack component expects an array of normalized devices
        return normalizedDevices;
      })
      .catch((error) => {
        callAlert("Error", error?.message || "Failed to fetch device list");
        throw error;
      });
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
}

export { SERVICES };
export default new ApiService();
