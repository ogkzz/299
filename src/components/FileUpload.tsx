import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Upload, FileText, X, Loader2, Shield } from "lucide-react";
import { useI18n } from "@/lib/i18n";

interface FileUploadProps {
  onFileContent: (content: string) => void;
  isAnalyzing: boolean;
}

export default function FileUpload({ onFileContent, isAnalyzing }: FileUploadProps) {
  const { t } = useI18n();
  const [file, setFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFile = useCallback((f: File) => {
    // Validate file size (max 20MB)
    if (f.size > 20 * 1024 * 1024) {
      alert('File too large. Maximum 20MB.');
      return;
    }
    // Validate extension
    const ext = f.name.split('.').pop()?.toLowerCase();
    if (!['json', 'ndjson', 'txt'].includes(ext || '')) {
      alert('Invalid file format. Use .json, .ndjson or .txt');
      return;
    }
    setFile(f);
    const reader = new FileReader();
    reader.onload = (e) => onFileContent(e.target?.result as string);
    reader.readAsText(f);
  }, [onFileContent]);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }, [handleFile]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className={`glass-panel rounded-xl transition-all duration-200 ${
        isDragOver ? "border-primary/30 shadow-[var(--glow-green)]" : ""
      }`}
      onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={onDrop}
    >
      {!file ? (
        <motion.label key="upload" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-3 cursor-pointer p-6 sm:p-8">
          <div className="w-12 h-12 rounded-xl bg-primary/5 border border-primary/10 flex items-center justify-center">
            <Upload className="w-5 h-5 text-primary/60" />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-foreground">{t('upload.title')}</p>
            <p className="text-xs text-muted-foreground mt-1">{t('upload.desc')}</p>
          </div>
          <input type="file" accept=".json,.ndjson,.txt" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
        </motion.label>
      ) : (
        <motion.div key="file" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} className="flex items-center gap-3 p-4">
          <div className="w-10 h-10 rounded-lg bg-primary/5 border border-primary/10 flex items-center justify-center flex-shrink-0">
            {isAnalyzing ? <Loader2 className="w-4 h-4 text-primary animate-spin" /> : <FileText className="w-4 h-4 text-primary" />}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">{file.name}</p>
            <div className="flex items-center gap-2">
              <p className="text-[10px] text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</p>
              {isAnalyzing && (
                <span className="flex items-center gap-1 text-[10px] text-primary">
                  <Shield className="w-2.5 h-2.5" /> Secure
                </span>
              )}
            </div>
          </div>
          {!isAnalyzing && (
            <button onClick={() => setFile(null)} className="p-1.5 rounded-md hover:bg-secondary transition-colors">
              <X className="w-3.5 h-3.5 text-muted-foreground" />
            </button>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}
