export interface FileData {
  name: string;
  headers: string[];
  data: any[]; // Array of objects
}

export interface MappingConfig {
  refMatchColumn: string;
  refEmailColumn: string;
  targetMatchColumn: string;
  filterEnabled?: boolean;
  filterColumn?: string;
  filterValue?: string;
}

export interface ProcessedResult {
  totalInput: number;
  processed: number;
  matched: number;
  csvContent: string;
  preview: string[][];
}

export enum AppStep {
  UPLOAD = 0,
  MAPPING = 1,
  PREVIEW = 2,
}