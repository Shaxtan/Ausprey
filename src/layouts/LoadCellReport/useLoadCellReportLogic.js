// useLoadCellReportLogic.js

import { useState, useEffect, useRef } from "react";
import ApiService, { SERVICES } from "../../services/ApiService";
import { callAlert } from "../../services/CommonService";

// --- UTILITY FUNCTIONS ---
const formatDateTimeDisplay = (dt) => {
  const d = new Date(dt);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  const ss = String(d.getSeconds()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd} ${hh}:${min}:${ss}`;
};

const getDateString = (date, hour, minute, second = 0) => {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const hh = String(hour).padStart(2, "0");
  const mi = String(minute).padStart(2, "0");
  const ss = String(second).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}T${hh}:${mi}:${ss}`;
};

const toLocalString = (dateStr) => {
  const date = new Date(dateStr);
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const hh = String(date.getHours()).padStart(2, "0");
  const mi = String(date.getMinutes()).padStart(2, "0");
  const ss = String(date.getSeconds()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd} ${hh}:${mi}:${ss}`;
};

const convertTime = (timestamp) => {
  const date = new Date(timestamp);
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const hh = String(date.getHours()).padStart(2, "0");
  const min = String(date.getMinutes()).padStart(2, "0");
  const ss = String(date.getSeconds()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd} ${hh}:${min}:${ss}`;
};

// --- CUSTOM HOOK ---
export default function useLoadCellReportLogic() {
  // --- STATE ---
  const [imei, setImei] = useState("868373076396961");
  const [imeis, setImeis] = useState([]); // ← NEW: Dropdown options
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [chartData, setChartData] = useState([]);
  const [dateRange, setDateRange] = useState("");
  const [showDownloadOptions, setShowDownloadOptions] = useState(false);
  const [showAverage, setShowAverage] = useState(true);
  const [showData, setShowData] = useState(false);
  const [exportFormat, setExportFormat] = useState("");
  const intervalRef = useRef(null);

  // --- FETCH IMEIs ON MOUNT ---
  useEffect(() => {
    ApiService.getVehicleImeis(1, true)
      .then((res) => {
        const vehicles = res?.data?.response?.vehicles || [];
        const imeiList = vehicles.map((v) => v.id);

        // Ensure default IMEI is at top
        if (!imeiList.includes("868373076396961")) {
          imeiList.unshift("868373076396961");
        }
        setImeis(imeiList);
      })
      .catch((err) => {
        console.error("Failed to fetch IMEIs:", err);
        callAlert("Error", "Could not load IMEI list.");
      });
  }, []);

  // --- SET DEFAULT DATES ---
  useEffect(() => {
    const now = new Date();
    const from = getDateString(now, 0, 0, 0);
    const to = getDateString(now, 23, 59, 59);
    setFromDate(from);
    setToDate(to);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  // --- DATA FETCHER ---
  const fetchData = (imeiValue, startTime, endTime) => {
    if (intervalRef.current) clearInterval(intervalRef.current);

    if (!imeiValue.trim() || !startTime || !endTime) return;

    setDateRange(
      `Data from: ${formatDateTimeDisplay(startTime)} to ${formatDateTimeDisplay(endTime)}`
    );

    const payload = {
      imei: imeiValue,
      startDate: toLocalString(startTime),
      endDate: toLocalString(endTime),
    };

    ApiService.postRequest("/reports/load-graph", payload, true, SERVICES.dashboard)
      .then((res) => {
        if (res.data?.resultCode === 1) {
          const rows = res.data.data.map((d) => ({
            time: convertTime(new Date(d.deviceTime)),
            V1: d.analog?.[0] || 0,
            V2: d.analog?.[1] || 0,
            V3: d.analog?.[2] || 0,
            V4: d.analog?.[3] || 0,
            Average: d.average,
          }));
          setChartData(rows);
          setShowDownloadOptions(true);
        } else {
          setChartData([]);
          setShowDownloadOptions(false);
          callAlert("Error", res.data?.message || "No data found.");
        }
      })
      .catch((error) => {
        setChartData([]);
        setShowDownloadOptions(false);
        callAlert("Error", error?.response?.data?.message || "API Error");
      });
  };

  // --- SUBMIT HANDLER ---
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!imei.trim()) {
      callAlert("Error", "Select an IMEI");
      return;
    }
    if (!fromDate || !toDate) {
      callAlert("Error", "Select From and To Date-Time");
      return;
    }
    if (new Date(fromDate) > new Date(toDate)) {
      callAlert("Error", "From Date cannot be after To Date");
      return;
    }
    if (!showAverage && !showData) {
      callAlert("Error", "Select at least one of Average or Data to display");
      return;
    }

    fetchData(imei, fromDate, toDate);

    intervalRef.current = setInterval(() => {
      fetchData(imei, fromDate, toDate);
    }, 60000);
  };

  // --- RETURN ALL STATE & HANDLERS ---
  // --- RETURN ALL STATE & HANDLERS ---
  return {
    imei,
    setImei,
    imeis, // THIS WAS MISSING!
    fromDate,
    setFromDate,
    toDate,
    setToDate,
    chartData,
    dateRange,
    showDownloadOptions,
    showAverage,
    setShowAverage,
    showData,
    setShowData,
    exportFormat,
    setExportFormat,
    handleSubmit,
  };
}
