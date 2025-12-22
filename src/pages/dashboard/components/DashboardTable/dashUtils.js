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

export const exportPDF = async (data, filename = "report.pdf", reportType = "VTS") => {
  if (!Array.isArray(data) || data.length === 0) {
    alert("No data available to download.");
    return;
  }

  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4",
  });

  const img = await loadLogo();
  if (img) doc.addImage(img, "JPEG", 10, 5, 35, 25);

  const timestamp = new Date().toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    hour12: true,
  });
  doc.setFontSize(12);
  doc.setTextColor(20, 110, 180);
  doc.text(`${reportType} Report`, 10, 35);

  doc.setFontSize(9);
  doc.setTextColor(100);
  doc.text(`Downloaded on: ${timestamp}`, 240, 20);

  let headers = [];
  let rows = [];
  let columnWidths = {};

  const sample = data[0];

  if ("accountId" in sample && "deviceType" in sample) {
    // Unreachable Devices
    headers = [["Acc Name", "Acc ID", "Veh No", "IMEI", "Device Type", "Created On"]];
    rows = data.map((item) => [
      item.accountName,
      item.accid,
      item.vehnum,
      item.imei,
      item.deviceType,
      item.createdOn,
    ]);
    columnWidths = {
      0: { cellWidth: 40 },
      1: { cellWidth: 25 },
      2: { cellWidth: 30 },
      3: { cellWidth: 40 },
      4: { cellWidth: 35 },
      5: { cellWidth: 40 },
    };
  } else {
    // VTS or PADLOCK
    // PASTE THE NEW MAPPING HERE:
    headers = [
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
        "Speed",
      ],
    ];
    rows = data.map((item) => [
      item.accountName || "N/A",
      item.vehnum || item.name || "N/A",
      item.imei || "N/A",
      item.simNo || "N/A",
      item.devTs || "N/A",
      item.address || "N/A",
      item.lat || "0",
      item.lng || "0",
      item.gps || "N/A",
      item.ign || "N/A",
      `${item.speed || 0} km/h`,
    ]);
    columnWidths = {
      0: { cellWidth: 30 },
      1: { cellWidth: 25 },
      5: { cellWidth: 60 },
    };
  }

  autoTable(doc, {
    head: headers,
    body: rows,
    startY: 42,
    margin: { left: 10, right: 10 },
    styles: {
      fontSize: 8,
      cellPadding: 3,
      overflow: "linebreak",
    },
    headStyles: {
      fillColor: [20, 110, 180],
      textColor: 255,
      fontSize: 8,
      halign: "center",
    },
    columnStyles: columnWidths,
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
