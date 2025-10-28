import axios from "axios";
import authHeader from "./auth-header";
import { callAlert } from "./CommonService";

const SERVICES = {
  main: process.env.REACT_APP_BASE_URL + ":8070",
  report: process.env.REACT_APP_BASE_URL + ":8099",
  dashboard: process.env.REACT_APP_BASE_URL + ":8075", // Dashboard API base URL
};

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

  getLiveData(accid, imei, callback) {
    const url = `${SERVICES.report}/device-track/live-track`;
    return axios
      .get(url, { params: { accid, imei } })
      .then((res) => callback(res))
      .catch((err) => {
        callback({ message: err.message });
        callAlert("Error", err.message);
      });
  }

  getDashboardData(data = {}, callback, header = true, accid = 1) {
    return this.postRequest(
      "/reports/report/dashboard",
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
  getTrackPlayHistory(data = {}, header = true) {
    return this.postRequest("/reports/trackPlayHistory", data, header, SERVICES.dashboard)
      .then((res) => {
        // Normalize the response to match MapView's expected structure
        const normalizedData = (res?.data?.data || []).map((item) => ({
          name: item.vehicleNumber || item.imei,
          lat: item.latitude,
          lng: item.longitude,
          ts: item.deviceTime,
          speed: item.speed,
          status: item.ign === "Y" ? "MOTION" : item.speed > 0 ? "MOTION" : "STOP", // Infer status
        }));
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
  getVehicleImeis(accid = 1, header = true) {
    return this.getRequest(`/reports/report/imeis?accid=${accid}`, null, header, SERVICES.dashboard)
      .then((res) => {
        const imeis = res?.data?.data?.imeis || [];
        return {
          ...res,
          data: {
            response: {
              vehicles: imeis.map((imei) => ({ id: imei })),
            },
          },
        };
      })
      .catch((error) => {
        callAlert("Error", error?.message || "Failed to fetch vehicle IMEIs");
        throw error;
      });
  }
}

export { SERVICES };
export default new ApiService();
