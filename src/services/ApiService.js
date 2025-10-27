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
    axios
      .get(base + url, headers)
      .then((res) => {
        if (callback) callback(res);
      })
      .catch((error) => {
        callback({ message: error?.message });
        callAlert("Error", error?.message);
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
}

export { SERVICES };
export default new ApiService();
