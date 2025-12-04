import * as XLSX from 'xlsx';
import { FileData, MappingConfig, ProcessedResult } from '../types';

export const parseExcel = async (file: File): Promise<FileData> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        
        // Convert to JSON
        const jsonData = XLSX.utils.sheet_to_json(sheet, { defval: "" });
        
        if (jsonData.length === 0) {
          reject(new Error("File appears to be empty"));
          return;
        }

        // Extract headers from the first row key
        const headers = Object.keys(jsonData[0] as object);

        resolve({
          name: file.name,
          headers,
          data: jsonData,
        });
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = (error) => reject(error);
    reader.readAsBinaryString(file);
  });
};

export const processMatching = (
  refFile: FileData,
  targetFile: FileData,
  mapping: MappingConfig
): ProcessedResult => {
  // Create a lookup map for the reference file
  // Key: Normalized Match Column Value -> Value: Email
  const referenceMap = new Map<string, string>();

  refFile.data.forEach((row) => {
    const key = String(row[mapping.refMatchColumn] || "").trim().toLowerCase();
    const email = String(row[mapping.refEmailColumn] || "").trim();
    if (key && email) {
      referenceMap.set(key, email);
    }
  });

  let matchedCount = 0;
  let processedCount = 0;
  const csvRows: string[] = [];
  const previewRows: string[][] = [];

  // Iterate target file
  targetFile.data.forEach((row) => {
    // Apply Filter if enabled
    if (mapping.filterEnabled && mapping.filterColumn && mapping.filterValue) {
      const cellValue = String(row[mapping.filterColumn] || "").trim().toUpperCase();
      const filterTarget = mapping.filterValue.trim().toUpperCase();
      
      // If the cell value does not contain the filter target, skip this row
      if (!cellValue.includes(filterTarget)) {
        return;
      }
    }

    processedCount++;
    const key = String(row[mapping.targetMatchColumn] || "").trim().toLowerCase();
    const foundEmail = referenceMap.get(key) || "";

    if (foundEmail) matchedCount++;

    // Format: ,,email,, 
    // This implies 5 columns, with email in the 3rd index (index 2).
    // CSV structure: col1, col2, col3, col4, col5
    // Value:  , , foundEmail, , 
    const csvRow = `,,${foundEmail},,`;
    csvRows.push(csvRow);

    if (previewRows.length < 10) {
      previewRows.push(["", "", foundEmail, "", ""]);
    }
  });

  const csvContent = csvRows.join("\n");

  return {
    totalInput: targetFile.data.length,
    processed: processedCount,
    matched: matchedCount,
    csvContent,
    preview: previewRows,
  };
};

export const downloadCSV = (content: string, filename: string) => {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};