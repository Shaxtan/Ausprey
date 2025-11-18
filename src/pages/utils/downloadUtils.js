// src/utils/downloadUtils.js
import jsPDF from "jspdf";
import "jspdf-autotable"; // ← this registers autoTable globally
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

/* -------------------------------------------------
   Helper: Format timestamp for display
------------------------------------------------- */
const formatTimestamp = (ts) => {
  return new Date(ts).toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
};

/* -------------------------------------------------
   CSV Export
------------------------------------------------- */
export const exportCSV = (data, filename = "report.csv") => {
  if (!data || data.length === 0) {
    alert("No data to export.");
    return;
  }

  const headers = ["Status", "Speed (km/h)", "Timestamp", "Latitude", "Longitude"];
  const rows = data.map((row) => [
    row.status,
    row.speed ?? "N/A",
    formatTimestamp(row.ts),
    row.lat,
    row.lng,
  ]);

  const csvContent = [
    headers.join(","),
    ...rows.map((r) => r.map((field) => `"${field}"`).join(",")),
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  saveAs(blob, filename);
};

/* -------------------------------------------------
   Excel Export
------------------------------------------------- */
export const exportExcel = (data, filename = "report.xlsx") => {
  if (!data || data.length === 0) {
    alert("No data to export.");
    return;
  }

  const formatted = data.map((row) => ({
    Status: row.status,
    "Speed (km/h)": row.speed ?? "N/A",
    Timestamp: formatTimestamp(row.ts),
    Latitude: row.lat,
    Longitude: row.lng,
  }));

  const ws = XLSX.utils.json_to_sheet(formatted);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Track Report");
  const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
  saveAs(blob, filename);
};

/* -------------------------------------------------
   PDF Export (with logo, timestamp, footer)
------------------------------------------------- */
export const exportPDF = (data, filename = "report.pdf") => {
  if (!data || data.length === 0) {
    alert("No data to export.");
    return;
  }

  const doc = new jsPDF({ orientation: "landscape" });
  const logoPath = "/logos/auspre-logo.jpg"; // from public folder

  const img = new Image();
  img.crossOrigin = "anonymous"; // needed if logo is external
  img.src = logoPath;

  const addContent = () => {
    // Logo
    try {
      doc.addImage(img, "JPEG", 10, 8, 40, 30);
    } catch (err) {
      console.warn("Logo failed to load:", err);
    }

    // Timestamp (top-right)
    const now = new Date().toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      hour12: true,
    });
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Downloaded on: ${now}`, 200, 20);

    // Table
    const head = [["Status", "Speed (km/h)", "Timestamp", "Latitude", "Longitude"]];
    const body = data.map((item) => [
      item.status,
      item.speed ?? "N/A",
      formatTimestamp(item.ts),
      item.lat,
      item.lng,
    ]);

    doc.autoTable({
      head,
      body,
      startY: 45,
      theme: "grid",
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [33, 150, 243] },
      margin: { bottom: 30 },
      didDrawPage: (data) => {
        const pageHeight = doc.internal.pageSize.height;
        doc.setFontSize(9);
        doc.setTextColor(150);
        const footer = `© 2025 ${process.env.REACT_APP_PROJECT_NAME || "Ausprey"}`;
        const textWidth = doc.getTextWidth(footer);
        doc.text(footer, (doc.internal.pageSize.width - textWidth) / 2, pageHeight - 10);
      },
    });

    doc.save(filename);
  };

  img.onload = addContent;
  img.onerror = () => {
    console.warn("Logo not found, exporting without logo.");
    addContent();
  };
};
