import React, { useCallback } from 'react';
import { Upload, FileSpreadsheet, CheckCircle, XCircle } from 'lucide-react';
import { FileData } from '../types';
import { parseExcel } from '../services/excelService';

interface DropZoneProps {
  label: string;
  description: string;
  onFileLoaded: (data: FileData) => void;
  currentFile: FileData | null;
  colorClass: string;
}

export const DropZone: React.FC<DropZoneProps> = ({ 
  label, 
  description, 
  onFileLoaded, 
  currentFile,
  colorClass
}) => {
  const [isDragging, setIsDragging] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);

  const processFile = useCallback(async (file: File) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await parseExcel(file);
      onFileLoaded(data);
    } catch (err) {
      setError("Failed to parse Excel file. Ensure it is a valid .xlsx or .xls file.");
    } finally {
      setIsLoading(false);
    }
  }, [onFileLoaded]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  }, [processFile]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      className={`relative border-2 border-dashed rounded-xl p-8 transition-all duration-200 cursor-pointer group
        ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-slate-300 hover:border-slate-400 bg-white'}
        ${currentFile ? `border-${colorClass}-500 bg-${colorClass}-50` : ''}
      `}
    >
      <input
        type="file"
        accept=".xlsx, .xls, .csv"
        onChange={handleChange}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
      />
      
      <div className="flex flex-col items-center justify-center text-center space-y-3">
        {isLoading ? (
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        ) : currentFile ? (
          <>
            <div className={`p-3 rounded-full bg-${colorClass}-100 text-${colorClass}-600`}>
              <CheckCircle size={32} />
            </div>
            <div>
              <p className="font-semibold text-slate-900">{currentFile.name}</p>
              <p className="text-sm text-slate-500">{currentFile.data.length} rows loaded</p>
            </div>
          </>
        ) : (
          <>
             <div className={`p-3 rounded-full ${isDragging ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-400 group-hover:bg-slate-200'}`}>
              <FileSpreadsheet size={32} />
            </div>
            <div>
              <p className="font-medium text-slate-900">{label}</p>
              <p className="text-sm text-slate-500 mt-1">{description}</p>
            </div>
          </>
        )}

        {error && (
          <div className="absolute -bottom-12 left-0 right-0 flex items-center justify-center text-red-500 text-sm">
            <XCircle size={16} className="mr-1" /> {error}
          </div>
        )}
      </div>
    </div>
  );
};