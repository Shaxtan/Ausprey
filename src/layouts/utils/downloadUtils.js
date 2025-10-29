import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

export const exportCSV = (data, filename) => {
  const header = Object.keys(data[0]);
  const csvRows = [
    header.join(","),
    ...data.map((row) => header.map((field) => `"${row[field] || ""}"`).join(",")),
  ];
  const blob = new Blob([csvRows.join("\n")], { type: "text/csv" });
  saveAs(blob, filename);
};

export const exportExcel = (data, filename) => {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Report");
  const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
  const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
  saveAs(blob, filename);
};

export const exportPDF = (data, filename = "report.pdf") => {
  const doc = new jsPDF();

  if (!Array.isArray(data) || data.length === 0) {
    alert("No data available to download.");
    return;
  }

  const imageUrl = "/logos/auspre-logo.jpg"; // logo path from public
  const img = new Image();
  img.src = imageUrl;

  img.onload = () => {
    // Add logo
    doc.addImage(img, "JPEG", 9, 9, 40, 30); // x, y, width, height

    // 🔽 Timestamp at top-right
    const timestamp = new Date().toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      hour12: true,
    });

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Downloaded on: ${timestamp}`, 133, 26); // x=150 (right side), y=15

    // Table headers and rows
    const headers = [["Status", "Speed", "Timestamp", "Latitude", "Longitude"]];
    const rows = data.map((item) => [
      item.status,
      item.speed ?? "N/A",
      item.ts,
      item.lat,
      item.lng,
    ]);

    autoTable(doc, {
      head: headers,
      body: rows,
      startY: 30, // push table below logo and timestamp
      margin: { bottom: 30 }, // reserve space for footer
      didDrawPage: function (data) {
        const pageHeight = doc.internal.pageSize.height;

        doc.setFontSize(10);
        doc.setTextColor(150);

        const footerText = `© 2025 ${process.env.REACT_APP_PROJECT_NAME || "Your Project"}`;
        const textWidth = doc.getTextWidth(footerText);
        doc.text(footerText, (doc.internal.pageSize.width - textWidth) / 2, pageHeight - 10);
      },
    });

    doc.save(filename);
  };
};
