import React, { useState, useEffect } from 'react';
import {
  Category,
  SubProduct,
  BusinessVerticalId,
  FileState,
  ReconRecord,
  ReconJob
} from '../types';
import {
  BUSINESS_VERTICALS,
  CATEGORIES,
  SUB_PRODUCTS,
  getCycleOptionsForCategory
} from '../data/categoriesAndSubProducts';
import {
  Check,
  Calendar,
  Clock,
  UploadCloud,
  FileText,
  Loader2,
  Server,
  Download,
  CheckCircle2,
  ArrowRight,
  QrCode,
  Building2,
  Wallet,
  Send,
  CreditCard,
  Fingerprint,
  ArrowRightLeft,
  Zap,
  Receipt,
  Play
} from 'lucide-react';
import { exportSampleFile } from '../utils/excelExporter';
import { generateReconDataset } from '../utils/mockDataGenerator';

interface SingleScreenReconProps {
  onReconciliationInitiated: (
    subProduct: SubProduct,
    category: Category,
    targetDate: string,
    targetCycle: string,
    files: FileState[],
    matchedRecords: ReconRecord[],
    mismatchedRecords: ReconRecord[],
    job: ReconJob
  ) => void;
  initialVertical?: BusinessVerticalId;
  initialCategoryId?: string;
  initialSubProductId?: string;
  initialDate?: string;
  initialCycle?: string;
}

// Icon helper
const getCategoryIcon = (iconName: string) => {
  switch (iconName) {
    case 'QrCode':
      return <QrCode className="w-6 h-6" />;
    case 'Building2':
      return <Building2 className="w-6 h-6" />;
    case 'Wallet':
      return <Wallet className="w-6 h-6" />;
    case 'Send':
      return <Send className="w-6 h-6" />;
    case 'CreditCard':
      return <CreditCard className="w-6 h-6" />;
    case 'Fingerprint':
      return <Fingerprint className="w-6 h-6" />;
    case 'ArrowRightLeft':
      return <ArrowRightLeft className="w-6 h-6" />;
    case 'Zap':
      return <Zap className="w-6 h-6" />;
    case 'Receipt':
      return <Receipt className="w-6 h-6" />;
    default:
      return <Building2 className="w-6 h-6" />;
  }
};

export const SingleScreenRecon: React.FC<SingleScreenReconProps> = ({
  onReconciliationInitiated,
  initialVertical = 'acquiring',
  initialCategoryId = 'upi',
  initialSubProductId = 'nsdlpaupi',
  initialDate = '2026-07-28',
  initialCycle = 'Cycle 1 (00:00 - 03:00 Window)'
}) => {
  // 1. Vertical State (Acquiring, Issuing, Agency Banking, BBPS)
  const [activeVertical, setActiveVertical] = useState<BusinessVerticalId>(initialVertical);

  // 2. Category State (under the vertical)
  const availableCategories = CATEGORIES.filter((c) => c.verticalId === activeVertical);
  const [selectedCategory, setSelectedCategory] = useState<Category>(() => {
    const found = availableCategories.find((c) => c.id === initialCategoryId);
    return found || availableCategories[0] || CATEGORIES[0];
  });

  // When vertical changes, adjust selected category to the first one available
  const handleSelectVertical = (vertId: BusinessVerticalId) => {
    setActiveVertical(vertId);
    const cats = CATEGORIES.filter((c) => c.verticalId === vertId);
    if (cats.length > 0) {
      setSelectedCategory(cats[0]);
      const subs = SUB_PRODUCTS.filter((sp) => sp.categoryId === cats[0].id);
      if (subs.length > 0) {
        setSelectedSubProduct(subs[0]);
      }
    }
  };

  // 3. Sub-Product State
  const availableSubProducts = SUB_PRODUCTS.filter((sp) => sp.categoryId === selectedCategory.id);
  const [selectedSubProduct, setSelectedSubProduct] = useState<SubProduct>(() => {
    const found = availableSubProducts.find((sp) => sp.id === initialSubProductId);
    return found || availableSubProducts[0] || SUB_PRODUCTS[0];
  });

  // When category changes, select first subproduct
  const handleSelectCategory = (cat: Category) => {
    setSelectedCategory(cat);
    const subs = SUB_PRODUCTS.filter((sp) => sp.categoryId === cat.id);
    if (subs.length > 0) {
      setSelectedSubProduct(subs[0]);
    }
  };

  // Check if POS or Prepaid Card (Bucket Auto-Ingest required)
  const isAutoIngestCategory = selectedCategory?.id === 'pos' || selectedCategory?.id === 'prepaidcard';

  // 4. Date & Settlement Cycle State
  const [targetDate, setTargetDate] = useState<string>(initialDate);
  const [targetCycle, setTargetCycle] = useState<string>(initialCycle);

  // 5. Source Files & Upload State
  const requiredFiles = selectedSubProduct?.requiredFiles || [];
  const hasInternalFiles = requiredFiles.some((f) => f.type === 'internal');
  const [activeFileIndex, setActiveFileIndex] = useState<number>(0);
  const [fileStates, setFileStates] = useState<Record<string, FileState>>({});
  const [isAutoFetchingAll, setIsAutoFetchingAll] = useState<boolean>(false);
  const [isProcessingRecon, setIsProcessingRecon] = useState<boolean>(false);
  const [isIngestingFile, setIsIngestingFile] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  // Reinitialize file states whenever selectedSubProduct changes
  useEffect(() => {
    if (!selectedSubProduct) return;
    const initialStates: Record<string, FileState> = {};
    selectedSubProduct.requiredFiles.forEach((file) => {
      // Default to ready/success for seamless demo, or pending
      initialStates[file.id] = {
        fileId: file.id,
        name: file.name,
        type: file.type,
        channel: file.channel,
        status: 'success',
        recordCount: file.defaultRecordCount,
        previewData: []
      };
    });
    setFileStates(initialStates);
    setActiveFileIndex(0);
    setIsIngestingFile(false);
    setUploadProgress(0);
  }, [selectedSubProduct]);

  const activeFile = requiredFiles[activeFileIndex] || requiredFiles[0];

  // Handle simulated and actual file upload sequence
  const startIngestionSequence = (fileId?: string) => {
    setIsIngestingFile(true);
    setUploadProgress(15);

    if (fileId) {
      setFileStates((prev) => ({
        ...prev,
        [fileId]: {
          ...prev[fileId],
          status: 'fetching'
        }
      }));
    }

    setTimeout(() => {
      setUploadProgress(48);
    }, 400);

    setTimeout(() => {
      setUploadProgress(83);
    }, 850);

    setTimeout(() => {
      setUploadProgress(100);
      setFileStates((prev) => {
        const updated = { ...prev };
        requiredFiles.forEach((rf) => {
          updated[rf.id] = {
            ...updated[rf.id],
            status: 'success',
            recordCount: rf.defaultRecordCount || Math.floor(Math.random() * 5000 + 35000)
          };
        });
        return updated;
      });

      // Complete and initiate reconciliation modal
      setTimeout(() => {
        setIsIngestingFile(false);
        setUploadProgress(0);
        handleExecuteReconciliation();
      }, 500);
    }, 1400);
  };

  const handleFileUpload = (fileId: string) => {
    startIngestionSequence(fileId);
  };

  // Handle GCP Auto-Fetch
  const handleAutoFetchGCP = (fileId: string) => {
    startIngestionSequence(fileId);
  };

  // Auto-fetch all bucket files for POS / Prepaid Card
  const handleStartAutoIngestRecon = () => {
    startIngestionSequence();
  };

  // Check if all files ready
  const allFilesReady = requiredFiles.length > 0 && requiredFiles.every((f) => fileStates[f.id]?.status === 'success');
  const readyFilesCount = requiredFiles.filter((f) => fileStates[f.id]?.status === 'success').length;

  // Handle Execute Reconciliation
  const handleExecuteReconciliation = () => {
    if (!selectedSubProduct || !selectedCategory) return;
    setIsProcessingRecon(true);

    setTimeout(() => {
      const baseRecordCount = selectedSubProduct.requiredFiles[0]?.defaultRecordCount || 15800;
      const { matchedRecords, mismatchedRecords, job } = generateReconDataset(
        selectedSubProduct.id,
        selectedSubProduct.name,
        selectedCategory.name,
        targetDate,
        targetCycle,
        baseRecordCount
      );

      setIsProcessingRecon(false);
      onReconciliationInitiated(
        selectedSubProduct,
        selectedCategory,
        targetDate,
        targetCycle,
        Object.values(fileStates),
        matchedRecords,
        mismatchedRecords,
        job
      );
    }, 700);
  };

  const cycleOptions = getCycleOptionsForCategory(selectedCategory?.id);

  // Synchronize vertical selection when initialVertical prop changes from sidebar
  useEffect(() => {
    setActiveVertical(initialVertical);
    const cats = CATEGORIES.filter((c) => c.verticalId === initialVertical);
    if (cats.length > 0) {
      setSelectedCategory(cats[0]);
      const subs = SUB_PRODUCTS.filter((sp) => sp.categoryId === cats[0].id);
      if (subs.length > 0) {
        setSelectedSubProduct(subs[0]);
      }
    }
  }, [initialVertical]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* 1. CATEGORY SELECTION CARDS ROW (Only shown if vertical has multiple categories) */}
      {availableCategories.length > 1 && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {availableCategories.map((cat) => {
              const isSelected = selectedCategory?.id === cat.id;
              return (
                <div
                  key={cat.id}
                  onClick={() => handleSelectCategory(cat)}
                  className={`relative bg-white rounded-2xl p-5 border transition-all cursor-pointer select-none flex flex-col justify-between h-[104px] ${
                    isSelected
                      ? 'border-2 border-[#10b981] shadow-sm ring-1 ring-[#10b981]/20'
                      : 'border-slate-200 hover:border-slate-300 hover:shadow-xs'
                  }`}
                >
                  {/* Checkmark circle badge when active */}
                  {isSelected && (
                    <div className="absolute top-3.5 right-3.5 w-5 h-5 rounded-full bg-[#10b981] text-white flex items-center justify-center shadow-xs">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                  )}

                  {/* Icon Container with subtle teal background */}
                  <div className="w-10 h-10 rounded-xl bg-[#e6f7f8] text-[#0e8696] flex items-center justify-center">
                    {getCategoryIcon(cat.iconName)}
                  </div>

                  {/* Category Name */}
                  <div className="font-bold text-sm text-[#0f172a]">{cat.name}</div>
                </div>
              );
            })}
          </div>

          {/* DIVIDER LINE */}
          <div className="border-t border-dashed border-slate-200 pt-2" />
        </>
      )}

      {/* 3. SELECT SUB-PRODUCT SECTION */}
      <div>
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
          SELECT SUB-PRODUCT
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {availableSubProducts.map((sp) => {
            const isSelected = selectedSubProduct?.id === sp.id;
            return (
              <div
                key={sp.id}
                onClick={() => setSelectedSubProduct(sp)}
                className={`bg-white rounded-2xl p-4 border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                  isSelected
                    ? 'border-2 border-[#10b981] shadow-xs bg-emerald-50/10'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                }`}
              >
                <div className="min-w-0 pr-2">
                  <div className="font-bold text-sm text-[#0f172a] truncate">{sp.name}</div>
                </div>

                {/* Radio selection circle */}
                <div className="shrink-0">
                  {isSelected ? (
                    <div className="w-5 h-5 rounded-full border-2 border-[#10b981] bg-[#10b981] text-white flex items-center justify-center">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                  ) : (
                    <div className="w-5 h-5 rounded-full border-2 border-slate-300" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. DATE SELECTION & SETTLEMENT CYCLE */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
          <div>
            <h4 className="text-sm font-bold text-[#0f172a]">
              Reconciliation Date & Settlement Cycle
            </h4>
          </div>
          <span className="text-[11px] font-bold text-[#0e8696] bg-[#0e8696]/10 px-3 py-1 rounded-full self-start sm:self-auto">
            {selectedSubProduct?.name}
          </span>
        </div>

        <div className={`grid grid-cols-1 ${isAutoIngestCategory ? 'md:grid-cols-3' : 'md:grid-cols-2'} gap-4 items-end`}>
          {/* Date Picker */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Business Date (T)
            </label>
            <div className="relative">
              <Calendar className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#0e8696]" />
              <input
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 font-semibold text-xs focus:outline-none focus:ring-2 focus:ring-[#0e8696] transition"
                required
              />
            </div>
          </div>

          {/* Settlement Cycle */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Settlement Cycle Window
            </label>
            <div className="relative">
              <Clock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#0e8696]" />
              <select
                value={targetCycle}
                onChange={(e) => setTargetCycle(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 font-semibold text-xs focus:outline-none focus:ring-2 focus:ring-[#0e8696] transition appearance-none cursor-pointer"
              >
                {cycleOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {isAutoIngestCategory && (
            /* Start Reconn button for POS & Prepaid Card */
            <div>
              <button
                type="button"
                onClick={handleStartAutoIngestRecon}
                disabled={isIngestingFile || isProcessingRecon}
                className="w-full py-2.5 px-4 rounded-xl bg-[#00b074] hover:bg-[#009663] text-white font-bold text-xs shadow-md shadow-[#00b074]/20 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>Start Reconciliation</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 5. SOURCE FILE COLLECTION */}
      <div className="space-y-4">


        {/* POS & PREPAID CARD AUTO-INGEST NOTICE BANNER */}
        {isAutoIngestCategory ? (
          <div className="bg-white rounded-2xl p-8 border border-emerald-200 shadow-xs space-y-6 text-center">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-xs border border-emerald-100">
              <Server className="w-7 h-7 text-emerald-600" />
            </div>

            <div className="max-w-xl mx-auto space-y-1.5">
              <h4 className="text-xl font-extrabold text-[#0f172a]">
                All {requiredFiles.length} Files Auto-Ingested from Cloud Bucket
              </h4>
              <p className="text-xs text-slate-500">
                No manual file upload required for {selectedCategory.name}. Files are fetched automatically from bucket.
              </p>
            </div>

            {/* List of 4 required files for Prepaid Card or POS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 max-w-4xl mx-auto pt-2">
              {requiredFiles.map((rf, i) => (
                <div key={rf.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-left space-y-1">
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-400">
                    <span>FILE {i + 1}</span>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  </div>
                  <div className="font-bold text-xs text-[#0f172a] truncate">{rf.name}</div>
                  <div className="text-[10px] text-emerald-600 font-semibold truncate">Auto-Fetch Ready</div>
                </div>
              ))}
            </div>

            {/* Start Reconn CTA Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleStartAutoIngestRecon}
                disabled={isIngestingFile || isProcessingRecon}
                className="px-8 py-3.5 rounded-2xl bg-[#00b074] hover:bg-[#009663] text-white font-bold text-sm shadow-md shadow-[#00b074]/25 transition cursor-pointer flex items-center justify-center gap-2 mx-auto disabled:opacity-50"
              >
                {isIngestingFile ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin text-white" />
                    <span>Auto-Ingesting Files from Bucket ({uploadProgress}%)...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5 fill-white" />
                    <span>Start Reconciliation</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* File Navigation Pills */}
            <div className="flex items-center gap-3 overflow-x-auto pb-1">
              {requiredFiles.map((file, idx) => {
                const isTabActive = activeFileIndex === idx;

                return (
                  <button
                    key={file.id}
                    type="button"
                    onClick={() => setActiveFileIndex(idx)}
                    className={`px-5 py-3 rounded-full text-xs font-bold transition-all flex items-center gap-2.5 whitespace-nowrap cursor-pointer ${
                      isTabActive
                        ? 'bg-[#0f1d2e] text-white shadow-md'
                        : 'bg-[#f0f6fb] text-[#334e68] hover:bg-slate-200'
                    }`}
                  >
                    <span
                      className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold ${
                        isTabActive
                          ? 'bg-[#00a3b8] text-white'
                          : 'bg-[#e2e8f0] text-[#94a3b8]'
                      }`}
                    >
                      {idx + 1}
                    </span>
                    <span className="tracking-tight">
                      File {idx + 1} of {requiredFiles.length}: {file.name}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Main Ingestion Box */}
            {activeFile && (
              <div className="bg-white rounded-2xl p-7 border border-slate-200 shadow-xs space-y-6">
                {/* Header: File Type Badge + File Title + Channel + Sample Download */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-slate-100">
                  <div className="flex items-start gap-3.5">
                    <div className="w-12 h-12 rounded-xl bg-[#e6f7f8] text-[#0e8696] flex items-center justify-center shrink-0">
                      <FileText className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#0e8696]">
                          SOURCE FILE {activeFileIndex + 1} OF {requiredFiles.length}
                        </span>
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-[#e6f7f8] text-[#0e8696] px-2 py-0.5 rounded-md">
                          {activeFile.type === 'counterparty' ? 'COUNTERPARTY BANK FILE' : 'INTERNAL SYSTEM LOG'}
                        </span>
                      </div>
                      <h4 className="text-xl font-bold text-[#0f172a] mt-1">
                        {activeFile.name}
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Channel: {activeFile.channel}
                      </p>
                    </div>
                  </div>

                  {/* Download Sample File */}
                  <div className="flex items-center gap-2 self-start sm:self-center">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        exportSampleFile('xlsx', `sample_${activeFile.id || 'npci'}_format`);
                      }}
                      className="px-3.5 py-2 rounded-xl bg-white hover:bg-[#0e8696]/10 border border-[#0e8696]/40 text-[#0e8696] font-semibold text-xs transition-all flex items-center gap-2 shadow-xs hover:shadow cursor-pointer group"
                      title="Download sample format template (.xlsx) with exact parameters"
                    >
                      <Download className="w-3.5 h-3.5 text-[#0e8696] group-hover:-translate-y-0.5 transition-transform" />
                      <span>Download Sample File</span>
                      <span className="text-[10px] bg-[#0e8696]/15 text-[#0e8696] font-bold px-1.5 py-0.5 rounded">.xlsx</span>
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        exportSampleFile('csv', `sample_${activeFile.id || 'npci'}_format`);
                      }}
                      className="px-2.5 py-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 font-semibold text-xs transition-all flex items-center gap-1 shadow-xs hover:shadow cursor-pointer"
                      title="Download sample format in .csv"
                    >
                      <span className="text-[10px] font-bold text-slate-500">.csv</span>
                    </button>
                  </div>
                </div>

                {/* Dropzone Container or Ingestion Progress Component */}
                {isIngestingFile ? (
                  <div className="rounded-2xl border border-slate-200 bg-[#f8fbff] py-14 px-8 text-center space-y-5 shadow-xs animate-in fade-in duration-200">
                    <div className="w-14 h-14 rounded-2xl bg-[#e0f7f8] text-[#00a3b8] flex items-center justify-center mx-auto shadow-xs">
                      <Loader2 className="w-7 h-7 animate-spin text-[#00a3b8]" />
                    </div>

                    <div>
                      <h5 className="font-bold text-lg text-[#0f172a]">
                        Uploading & Ingesting File... {hasInternalFiles ? '(Auto-fetching Switch & Middleware Logs in Backend)' : ''}
                      </h5>
                      <p className="text-xs text-slate-500 mt-1">
                        {hasInternalFiles
                          ? 'Ingesting file and fetching corresponding Switch / Middleware journals from GCP Bucket'
                          : 'Ingesting file and validating file parameters'}
                      </p>
                    </div>

                    <div className="max-w-xl mx-auto space-y-2 pt-1">
                      <div className="w-full h-3 bg-slate-200/80 rounded-full overflow-hidden p-0.5">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-[#00b4d8] to-[#10b981] transition-all duration-300 ease-out"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                      <div className="text-xs font-medium text-slate-500 flex items-center justify-center gap-1.5 pt-0.5">
                        <span className="font-bold text-[#00a3b8]">{uploadProgress}% Loaded</span>
                        <span>•</span>
                        <span>Validating schema & parsing records...</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      handleFileUpload(activeFile.id);
                    }}
                    className="rounded-2xl border-2 border-dashed border-[#38bdf8]/60 bg-[#f0f9ff]/20 py-12 px-6 text-center space-y-4"
                  >
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={() => handleFileUpload(activeFile.id)}
                      className="hidden"
                      accept=".csv,.xlsx,.txt"
                    />

                    <div className="w-14 h-14 rounded-2xl bg-[#e0f4f7] text-[#0e8696] flex items-center justify-center mx-auto shadow-xs">
                      <UploadCloud className="w-7 h-7" />
                    </div>

                    <div>
                      <h5 className="font-bold text-base text-[#0f172a]">
                        Drag & Drop {activeFile.name} Here
                      </h5>
                      <p className="text-xs text-slate-500 mt-1">
                        Supports .csv, .txt, .xlsx files ({activeFile.channel})
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          if (fileInputRef.current) {
                            fileInputRef.current.click();
                          } else {
                            handleFileUpload(activeFile.id);
                          }
                        }}
                        className="px-6 py-2.5 rounded-xl bg-[#0e8696] hover:bg-[#0b6c7a] text-white font-bold text-xs transition shadow-sm hover:shadow cursor-pointer flex items-center gap-2"
                      >
                        <span>Browse or Upload File</span>
                      </button>

                      {activeFile.type === 'internal' && (
                        <button
                          type="button"
                          onClick={() => handleAutoFetchGCP(activeFile.id)}
                          className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-bold text-xs transition cursor-pointer flex items-center gap-2"
                        >
                          <Server className="w-4 h-4 text-[#0e8696]" />
                          <span>Auto-Fetch GCP Bucket</span>
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
