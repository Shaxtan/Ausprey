// src/pages/dashboard/dashUtils.js
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

/* ---------- CSV ---------- */
export const exportCSV = (data, filename) => {
  const header = Object.keys(data[0]);
  const csvRows = [
    header.join(","),
    ...data.map((row) => header.map((field) => `"${row[field] ?? ""}"`).join(",")),
  ];
  const blob = new Blob([csvRows.join("\n")], { type: "text/csv;charset=utf-8" });
  saveAs(blob, filename);
};

/* ---------- EXCEL ---------- */
export const exportExcel = (data, filename) => {
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Report");
  const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  const blob = new Blob([excelBuffer], {
    type: "application/octet-stream",
  });
  saveAs(blob, filename);
};

/* ---------- PDF (synchronous – image pre-loaded) ---------- */
let logoImage = null;
const logoUrl = "/logos/auspre-logo.jpg";

const loadLogo = () =>
  new Promise((resolve) => {
    if (logoImage) return resolve(logoImage);
    const img = new Image();
    img.src = logoUrl;
    img.onload = () => {
      logoImage = img;
      resolve(img);
    };
    img.onerror = () => resolve(null); // fallback – no logo
  });

export const exportPDF = async (data, filename = "report.pdf") => {
  if (!Array.isArray(data) || data.length === 0) {
    alert("No data available to download.");
    return;
  }

  // 1. Change orientation to 'landscape' (l) instead of 'portrait' (p)
  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4",
  });

  const img = await loadLogo();

  // Header adjustments for landscape width (~297mm)
  if (img) doc.addImage(img, "JPEG", 10, 5, 35, 25);

  const timestamp = new Date().toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    hour12: true,
  });
  doc.setFontSize(9);
  doc.setTextColor(100);
  doc.text(`Downloaded on: ${timestamp}`, 240, 20); // Moved further right

  const headers = [
    [
      "Acc Name",
      "Veh No",
      "IMEI",
      "Sim No",
      "Date/Time",
      "Address",
      "Lat",
      "Lng",
      "GPS",
      "Ign",
      "Load",
      "Speed",
    ],
  ];

  const rows = data.map((item) => [
    item.accountName,
    item.vehnum,
    item.imei,
    item.simNo,
    item.devTs,
    item.address,
    item.lat,
    item.lng,
    item.gps,
    item.ign,
    item.avg,
    item.speed,
  ]);

  autoTable(doc, {
    head: headers,
    body: rows,
    startY: 35,
    margin: { left: 10, right: 10 },
    styles: {
      fontSize: 7, // Reduce font size to prevent squashing
      cellPadding: 2,
      overflow: "linebreak", // Ensure text wraps inside cells
    },
    headStyles: {
      fillColor: [20, 110, 180], // Your theme blue
      textColor: 255,
      fontSize: 7,
      halign: "center",
    },
    columnStyles: {
      5: { cellWidth: 60 }, // Give the 'Address' column more width
      0: { cellWidth: 25 }, // Account Name
      1: { cellWidth: 20 }, // Vehicle No
    },
    didDrawPage: (data) => {
      const pageHeight = doc.internal.pageSize.height;
      doc.setFontSize(8);
      doc.setTextColor(150);
      const footer = `© 2025 ${process.env.REACT_APP_PROJECT_NAME || "Your Project"}`;
      const w = doc.getTextWidth(footer);
      doc.text(footer, (doc.internal.pageSize.width - w) / 2, pageHeight - 5);
    },
  });

  doc.save(filename);
};
