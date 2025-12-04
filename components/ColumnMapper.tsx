import React, { useEffect, useState } from 'react';
import { ArrowRight, Wand2, AlertCircle, Filter } from 'lucide-react';
import { FileData, MappingConfig } from '../types';
import { autoDetectMapping } from '../services/geminiService';

interface ColumnMapperProps {
  refFile: FileData;
  targetFile: FileData;
  onConfirm: (mapping: MappingConfig) => void;
  onBack: () => void;
}

export const ColumnMapper: React.FC<ColumnMapperProps> = ({
  refFile,
  targetFile,
  onConfirm,
  onBack,
}) => {
  const [mapping, setMapping] = useState<MappingConfig>({
    refMatchColumn: '',
    refEmailColumn: '',
    targetMatchColumn: '',
    filterEnabled: false,
    filterColumn: '',
    filterValue: 'ARO', // Default as requested
  });
  const [isDetecting, setIsDetecting] = useState(false);

  const handleAutoDetect = async () => {
    setIsDetecting(true);
    const suggestion = await autoDetectMapping(refFile.headers, targetFile.headers);
    
    setMapping(prev => ({
      ...prev,
      refMatchColumn: suggestion.refMatchColumn || prev.refMatchColumn || (refFile.headers.length > 0 ? refFile.headers[0] : ''),
      refEmailColumn: suggestion.refEmailColumn || prev.refEmailColumn || (refFile.headers.length > 1 ? refFile.headers[1] : ''),
      targetMatchColumn: suggestion.targetMatchColumn || prev.targetMatchColumn || (targetFile.headers.length > 0 ? targetFile.headers[0] : ''),
    }));
    setIsDetecting(false);
  };

  // Initial primitive auto-select & Filter Default Logic
  useEffect(() => {
    setMapping(prev => {
      const updates: Partial<MappingConfig> = {};

      // Column Mappings
      if (!prev.refMatchColumn && refFile.headers.length > 0) updates.refMatchColumn = refFile.headers[0];
      if (!prev.refEmailColumn && refFile.headers.length > 0) {
        const emailCol = refFile.headers.find(h => h.toLowerCase().includes('mail'));
        if (emailCol) updates.refEmailColumn = emailCol;
      }
      if (!prev.targetMatchColumn && targetFile.headers.length > 0) updates.targetMatchColumn = targetFile.headers[0];

      // Auto-Detect "ID" column for filtering
      // If we haven't manually set filterEnabled yet (it's strictly false from init)
      // Check if ID column exists
      if (!prev.filterColumn) {
        const idCol = targetFile.headers.find(h => h.trim().toUpperCase() === 'ID');
        if (idCol) {
          updates.filterEnabled = true;
          updates.filterColumn = idCol;
          updates.filterValue = 'ARO';
        } else if (targetFile.headers.length > 0) {
          updates.filterColumn = targetFile.headers[0];
        }
      }

      return { ...prev, ...updates };
    });
  }, [refFile.headers, targetFile.headers]);

  const isValid = mapping.refMatchColumn && mapping.refEmailColumn && mapping.targetMatchColumn;

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Map Data Columns</h2>
          <p className="text-slate-500">Select which columns correspond to the user's name and email.</p>
        </div>
        <button
          onClick={handleAutoDetect}
          disabled={isDetecting}
          className="flex items-center space-x-2 px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-colors disabled:opacity-50"
        >
          {isDetecting ? (
            <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
          ) : (
            <Wand2 size={18} />
          )}
          <span>Auto-Detect with AI</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Reference Column Selection */}
        <div className="space-y-4 p-5 bg-white rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center space-x-2 text-blue-600 mb-2">
            <span className="font-semibold text-sm uppercase tracking-wide">Reference File</span>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Match Key (e.g. Name)
            </label>
            <select
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              value={mapping.refMatchColumn}
              onChange={(e) => setMapping({ ...mapping, refMatchColumn: e.target.value })}
            >
              {refFile.headers.map(h => <option key={h} value={h}>{h}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Value to Extract (e.g. Email)
            </label>
            <select
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              value={mapping.refEmailColumn}
              onChange={(e) => setMapping({ ...mapping, refEmailColumn: e.target.value })}
            >
               {refFile.headers.map(h => <option key={h} value={h}>{h}</option>)}
            </select>
          </div>
        </div>

        {/* Visual Connector */}
        <div className="hidden md:flex flex-col items-center justify-center space-y-2 text-slate-300">
          <ArrowRight size={32} />
          <span className="text-xs font-medium uppercase tracking-widest">Matching</span>
          <ArrowRight size={32} />
        </div>

        {/* Target Column Selection */}
        <div className="space-y-4 p-5 bg-white rounded-xl shadow-sm border border-slate-200">
           <div className="flex items-center space-x-2 text-emerald-600 mb-2">
            <span className="font-semibold text-sm uppercase tracking-wide">Target File</span>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Match Key (e.g. Name)
            </label>
            <select
               className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
              value={mapping.targetMatchColumn}
              onChange={(e) => setMapping({ ...mapping, targetMatchColumn: e.target.value })}
            >
               {targetFile.headers.map(h => <option key={h} value={h}>{h}</option>)}
            </select>
            <p className="text-xs text-slate-500 mt-2">
              The system will look for this value in the Reference file to find the email.
            </p>
          </div>
        </div>
      </div>

      {/* Filtering Section */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2 text-slate-800">
            <Filter size={20} className="text-slate-600" />
            <h3 className="font-semibold text-lg">Filter Target Rows</h3>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              checked={mapping.filterEnabled} 
              onChange={(e) => setMapping({...mapping, filterEnabled: e.target.checked})}
              className="sr-only peer" 
            />
            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            <span className="ml-3 text-sm font-medium text-slate-700">Enable</span>
          </label>
        </div>

        {mapping.filterEnabled && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-300">
             <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Filter Column</label>
                <select
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                  value={mapping.filterColumn}
                  onChange={(e) => setMapping({ ...mapping, filterColumn: e.target.value })}
                >
                   {targetFile.headers.map(h => <option key={h} value={h}>{h}</option>)}
                </select>
             </div>
             <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Row Must Contain</label>
                <input
                  type="text"
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. ARO"
                  value={mapping.filterValue}
                  onChange={(e) => setMapping({ ...mapping, filterValue: e.target.value })}
                />
             </div>
             <div className="md:col-span-2 text-sm text-slate-500 italic">
               * Only rows where <strong>{mapping.filterColumn || "the selected column"}</strong> contains "<strong>{mapping.filterValue || "..."}</strong>" will be included in the output.
             </div>
          </div>
        )}
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start space-x-3">
        <AlertCircle className="text-amber-600 flex-shrink-0 mt-0.5" size={20} />
        <div className="text-sm text-amber-800">
          <p className="font-semibold">Important:</p>
          <p>The system performs a case-insensitive, exact text match. Ensure names are spelled identically in both files.</p>
        </div>
      </div>

      <div className="flex justify-between pt-6">
        <button
          onClick={onBack}
          className="px-6 py-2.5 border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors"
        >
          Back
        </button>
        <button
          onClick={() => onConfirm(mapping)}
          disabled={!isValid}
          className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200 disabled:opacity-50 disabled:shadow-none"
        >
          Process Files
        </button>
      </div>
    </div>
  );
};