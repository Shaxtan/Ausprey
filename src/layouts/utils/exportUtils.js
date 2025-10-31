// src/utils/exportUtils.js
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

  const doc = new jsPDF();
  const img = await loadLogo();

  // ---- Header (logo + timestamp) ----
  if (img) doc.addImage(img, "JPEG", 9, 9, 40, 30);

  const timestamp = new Date().toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    hour12: true,
  });
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Downloaded on: ${timestamp}`, 133, 26);

  // ---- Table ----
  const headers = [["Time", "V1", "V2", "V3", "V4", "Average"]];
  const rows = data.map((item) => [item.time, item.V1, item.V2, item.V3, item.V4, item.Average]);

  autoTable(doc, {
    head: headers,
    body: rows,
    startY: 45,
    margin: { bottom: 30 },
    didDrawPage: (data) => {
      const pageHeight = doc.internal.pageSize.height;
      doc.setFontSize(10);
      doc.setTextColor(150);
      const footer = `© 2025 ${process.env.REACT_APP_PROJECT_NAME || "Your Project"}`;
      const w = doc.getTextWidth(footer);
      doc.text(footer, (doc.internal.pageSize.width - w) / 2, pageHeight - 10);
    },
  });

  doc.save(filename);
};
