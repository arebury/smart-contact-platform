import * as XLSX from "xlsx";
import { toast } from "sonner";

/**
 * Shared XLSX export helper (DD#296)
 *
 * Encapsulates the repeated pattern across AgentsListPage and GroupsListPage:
 *  - Build worksheet from header + rows
 *  - Auto-fit column widths
 *  - Style header row (bold, grey fill, bottom border)
 *  - Write file with timestamped filename
 *  - Show success toast
 */
export function exportToXlsx({
  headers,
  rows,
  sheetName,
  filePrefix,
}: {
  headers: string[];
  rows: (string | number)[][];
  sheetName: string;
  filePrefix: string;
}) {
  const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);

  /* Auto-fit column widths */
  ws["!cols"] = headers.map((h, i) => {
    let max = h.length;
    for (const row of rows) {
      const len = String(row[i] ?? "").length;
      if (len > max) max = len;
    }
    return { wch: Math.min(max + 2, 50) };
  });

  /* Style header row — bold + light grey fill */
  const headerRange = XLSX.utils.decode_range(ws["!ref"] || "A1");
  for (let c = headerRange.s.c; c <= headerRange.e.c; c++) {
    const addr = XLSX.utils.encode_cell({ r: 0, c });
    if (!ws[addr]) continue;
    ws[addr].s = {
      font: { bold: true, sz: 11 },
      fill: { fgColor: { rgb: "F3F4F6" } },
      alignment: { horizontal: "left", vertical: "center" },
      border: {
        bottom: { style: "thin", color: { rgb: "D1D5DB" } },
      },
    };
  }

  const wb = XLSX.utils.book_new();
  const dateStr = new Date().toISOString().slice(0, 10);
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  XLSX.writeFile(wb, `${filePrefix}_${dateStr}.xlsx`);
  toast.success(`${rows.length} ${sheetName.toLowerCase()} exportados a Excel`);
}
