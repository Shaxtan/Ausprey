// useLoadCellReportLogic.js

import { useState, useEffect, useRef } from "react";
// Assuming these services are available relative to this hook's location
import ApiService, { SERVICES } from "../../services/ApiService";
import { callAlert } from "../../services/CommonService";

// --- UTILITY FUNCTIONS ---

// Format date for display
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

// Format local datetime string for the HTML Input element
const getDateString = (date, hour, minute, second = 0) => {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const hh = String(hour).padStart(2, "0");
  const mi = String(minute).padStart(2, "0");
  const ss = String(second).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}T${hh}:${mi}:${ss}`; // <-- "T" for datetime-local
};

// Format date-time for the API payload (Local string format "YYYY-MM-DD HH:MM:SS")
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

// Format deviceTime timestamp for chart display
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
  const [imei, setImei] = useState("867747073085688");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [chartData, setChartData] = useState([]);
  const [dateRange, setDateRange] = useState("");
  const [showDownloadOptions, setShowDownloadOptions] = useState(false);
  const [showAverage, setShowAverage] = useState(true);
  const [showData, setShowData] = useState(false);
  const [exportFormat, setExportFormat] = useState("");
  const intervalRef = useRef(null);

  // --- API & DATA HANDLER ---
  const fetchData = (imeiValue, startTime, endTime) => {
    // Clear old interval
    if (intervalRef.current) clearInterval(intervalRef.current);

    // 1. Validation (partially repeated for interval, but handled mainly by handleSubmit)
    if (!imeiValue.trim() || !startTime || !endTime) return;

    // 2. Set Date Range Display
    setDateRange(
      `Data from: ${formatDateTimeDisplay(startTime)} to ${formatDateTimeDisplay(endTime)}`
    );

    // 3. Build Payload with LOCAL time strings
    let payload = {
      imei: imeiValue,
      startDate: toLocalString(startTime),
      endDate: toLocalString(endTime),
    };

    // 4. Make API Request
    ApiService.postRequest("/device-track/load-graph", payload, true, SERVICES.report)
      .then((res) => {
        if (res.data?.resultCode === 1) {
          // 5. Transform API Response Data for Chart
          const rows = res.data.data.map((d) => {
            const ts = convertTime(new Date(d.deviceTime));
            return {
              time: ts,
              V1: d.analog?.[0] || 0,
              V2: d.analog?.[1] || 0,
              V3: d.analog?.[2] || 0,
              V4: d.analog?.[3] || 0,
              Average: d.average,
            };
          });
          setChartData(rows);
          setShowDownloadOptions(true);
          // callAlert("Success", "Data fetched successfully!"); // Re-enable if desired
        } else {
          setChartData([]);
          setShowDownloadOptions(false);
          callAlert("Error", res.data?.message || "Failed to fetch data.");
        }
      })
      .catch((error) => {
        setChartData([]);
        setShowDownloadOptions(false);
        callAlert("Error", error?.response?.data?.message || "An API error occurred.");
      });
  };

  // --- SUBMIT HANDLER (kicks off the process and interval) ---
  const handleSubmit = (e) => {
    e.preventDefault();

    // Initial validation check
    if (!imei.trim()) {
      callAlert("Error", "Enter IMEI");
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

    // Initial fetch
    fetchData(imei, fromDate, toDate);

    // Setup Interval for recurring fetch
    intervalRef.current = setInterval(
      () => fetchData(imei, fromDate, toDate),
      60000 // Every 60 seconds
    );
  };

  // --- EFFECTS ---

  // Set default dates on load
  useEffect(() => {
    const now = new Date();
    const from = getDateString(now, 0, 0, 0); // Start of day
    const to = getDateString(now, 23, 59, 59); // End of day
    setFromDate(from);
    setToDate(to);

    // Cleanup function to clear interval when component unmounts
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  // --- RETURN ---
  return {
    // State
    imei,
    setImei,
    fromDate,
    setFromDate,
    toDate,
    setToDate,
    chartData,
    setChartData,
    dateRange,
    setDateRange,
    showDownloadOptions,
    setShowDownloadOptions,
    showAverage,
    setShowAverage,
    showData,
    setShowData,
    exportFormat,
    setExportFormat,
    // Handlers
    handleSubmit,
  };
}
