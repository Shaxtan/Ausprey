import { useState, useEffect, useRef } from "react";
import ApiService from "../../services/ApiService";
import { callAlert } from "../../services/CommonService";

export default function useLiveLoadGraphLogic() {
  const [imei, setImei] = useState("");
  const [imeis, setImeis] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(false);
  const intervalRef = useRef(null);

  // Fetch IMEIs for the dropdown on mount
  useEffect(() => {
    ApiService.getImeiDropdown(1, true)
      .then((res) => {
        const list = res?.data?.response?.vehicles || [];
        setImeis(list.map((v) => ({ value: v.imei, label: `${v.imei} (${v.vehnum})` })));
      })
      .catch(() => callAlert("Error", "Could not load devices."));

    return () => clearInterval(intervalRef.current);
  }, []);

  const fetchLiveData = (targetImei) => {
    if (!targetImei) return;
    setLoading(true);

    ApiService.getLiveLoadGraph(targetImei)
      .then((res) => {
        if (res.data?.resultCode === 1) {
          const rows = res.data.data.map((d) => ({
            time: new Date(d.deviceTime).toLocaleTimeString(),
            V1: d.analog?.[0] || 0,
            V2: d.analog?.[1] || 0,
            V3: d.analog?.[2] || 0,
            V4: d.analog?.[3] || 0,
            Average: d.average,
          }));
          // We keep the last 20-30 points for a "live" feel
          setChartData(rows);
        }
      })
      .finally(() => setLoading(false));
  };

  const handleStartMonitor = (selectedImei) => {
    setImei(selectedImei);
    fetchLiveData(selectedImei);

    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => fetchLiveData(selectedImei), 30000);
  };

  return { imei, imeis, chartData, loading, handleStartMonitor };
}
