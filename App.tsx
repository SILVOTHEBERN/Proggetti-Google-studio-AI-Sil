import React, { useState } from 'react';
import { DropZone } from './components/DropZone';
import { ColumnMapper } from './components/ColumnMapper';
import { FileData, AppStep, MappingConfig, ProcessedResult } from './types';
import { processMatching, downloadCSV } from './services/excelService';
import { Database, ArrowRight, Download, RefreshCw, CheckCircle2 } from 'lucide-react';

export default function App() {
  const [step, setStep] = useState<AppStep>(AppStep.UPLOAD);
  const [refFile, setRefFile] = useState<FileData | null>(null);
  const [targetFile, setTargetFile] = useState<FileData | null>(null);
  const [result, setResult] = useState<ProcessedResult | null>(null);

  const handleProcess = (mapping: MappingConfig) => {
    if (!refFile || !targetFile) return;
    const res = processMatching(refFile, targetFile, mapping);
    setResult(res);
    setStep(AppStep.PREVIEW);
  };

  const handleDownload = () => {
    if (result) {
      downloadCSV(result.csvContent, `email-match-export-${new Date().getTime()}.csv`);
    }
  };

  const resetApp = () => {
    setStep(AppStep.UPLOAD);
    setRefFile(null);
    setTargetFile(null);
    setResult(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-600 p-2 rounded-lg text-white">
              <Database size={20} />
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-indigo-600">
              EmailMatcher Pro
            </h1>
          </div>
          <div className="flex items-center space-x-4">
             <div className="hidden sm:flex items-center space-x-2 text-sm text-slate-500">
                <span className={`px-2 py-1 rounded ${step === AppStep.UPLOAD ? 'bg-blue-100 text-blue-700 font-medium' : ''}`}>1. Upload</span>
                <ArrowRight size={14} />
                <span className={`px-2 py-1 rounded ${step === AppStep.MAPPING ? 'bg-blue-100 text-blue-700 font-medium' : ''}`}>2. Map</span>
                <ArrowRight size={14} />
                <span className={`px-2 py-1 rounded ${step === AppStep.PREVIEW ? 'bg-blue-100 text-blue-700 font-medium' : ''}`}>3. Export</span>
             </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Step 1: Upload */}
        {step === AppStep.UPLOAD && (
          <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-bold text-slate-900">Upload your datasets</h2>
              <p className="text-lg text-slate-600">Select the master reference file and the target file you want to populate.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <DropZone 
                label="Reference File" 
                description="Contains the complete list with Emails. (Excel/CSV)"
                colorClass="blue"
                currentFile={refFile}
                onFileLoaded={setRefFile}
              />
              <DropZone 
                label="Target File" 
                description="List of users missing their emails. (Excel/CSV)"
                colorClass="emerald"
                currentFile={targetFile}
                onFileLoaded={setTargetFile}
              />
            </div>

            <div className="flex justify-center pt-6">
              <button
                disabled={!refFile || !targetFile}
                onClick={() => setStep(AppStep.MAPPING)}
                className="flex items-center space-x-2 px-8 py-4 bg-slate-900 text-white text-lg font-medium rounded-xl hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 disabled:opacity-50 disabled:shadow-none transform hover:scale-105"
              >
                <span>Continue to Mapping</span>
                <ArrowRight size={20} />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Mapping */}
        {step === AppStep.MAPPING && refFile && targetFile && (
          <ColumnMapper 
            refFile={refFile}
            targetFile={targetFile}
            onBack={() => setStep(AppStep.UPLOAD)}
            onConfirm={handleProcess}
          />
        )}

        {/* Step 3: Result */}
        {step === AppStep.PREVIEW && result && (
          <div className="max-w-4xl mx-auto space-y-8 animate-in zoom-in-95 duration-500">
            
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-8 border-b border-slate-100 bg-slate-50/50">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">Processing Complete</h2>
                    <p className="text-slate-500">Your CSV file has been generated and is ready for download.</p>
                  </div>
                  <div className="flex items-center space-x-6">
                     <div className="text-center">
                        <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Input Rows</p>
                        <p className="text-2xl font-bold text-slate-900">{result.totalInput}</p>
                     </div>
                     <div className="h-10 w-px bg-slate-200"></div>
                     <div className="text-center">
                        <p className="text-sm font-semibold text-blue-600 uppercase tracking-wider">Included</p>
                        <p className="text-2xl font-bold text-blue-600">{result.processed}</p>
                     </div>
                     <div className="h-10 w-px bg-slate-200"></div>
                     <div className="text-center">
                        <p className="text-sm font-semibold text-emerald-600 uppercase tracking-wider">Matched</p>
                        <p className="text-2xl font-bold text-emerald-600">{result.matched}</p>
                     </div>
                  </div>
                </div>
              </div>

              <div className="p-8 space-y-6">
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center">
                    <CheckCircle2 size={16} className="text-blue-500 mr-2" />
                    Preview (First 10 matches)
                  </h3>
                  <div className="bg-slate-900 rounded-lg p-4 overflow-x-auto">
                    <code className="text-sm text-slate-300 font-mono">
                      {result.preview.length > 0 ? result.preview.map((row, i) => (
                        <div key={i} className="whitespace-nowrap">
                          <span className="text-slate-500">Row {i+1}: </span> 
                          <span className="text-slate-600">,,</span>
                          <span className={row[2] ? "text-emerald-400" : "text-red-400"}>
                            {row[2] || "(no match)"}
                          </span>
                          <span className="text-slate-600">,,</span>
                        </div>
                      )) : (
                        <div className="text-slate-500 italic">No rows matched the filter criteria.</div>
                      )}
                    </code>
                  </div>
                   <p className="text-xs text-slate-400 mt-2">Format matches requirement: <span className="font-mono">,,email,,</span></p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <button
                    onClick={handleDownload}
                    disabled={result.processed === 0}
                    className="flex-1 flex items-center justify-center space-x-2 px-6 py-4 bg-emerald-600 text-white text-lg font-medium rounded-xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200 disabled:opacity-50 disabled:shadow-none"
                  >
                    <Download size={22} />
                    <span>Download CSV</span>
                  </button>
                  <button
                    onClick={resetApp}
                    className="flex items-center justify-center space-x-2 px-6 py-4 bg-white border border-slate-300 text-slate-700 font-medium rounded-xl hover:bg-slate-50 transition-colors"
                  >
                    <RefreshCw size={20} />
                    <span>Start Over</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}