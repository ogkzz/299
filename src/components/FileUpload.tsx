import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Upload, FileText, X, Loader2 } from "lucide-react";

interface FileUploadProps {
  onFileContent: (content: string) => void;
  isAnalyzing: boolean;
}

export default function FileUpload({ onFileContent, isAnalyzing }: FileUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFile = useCallback((f: File) => {
    setFile(f);
    const reader = new FileReader();
    reader.onload = (e) => {
      onFileContent(e.target?.result as string);
    };
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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className={`glass-panel rounded-2xl p-8 transition-all duration-300 ${
        isDragOver ? "border-foreground/30 shadow-[var(--glow-white)]" : ""
      }`}
      onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={onDrop}
    >
      {!file ? (
        <motion.label
          key="upload"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center gap-4 cursor-pointer py-8"
        >
            <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center">
              <Upload className="w-7 h-7 text-muted-foreground" />
            </div>
            <div className="text-center">
              <p className="text-foreground font-medium">Upload do App Privacy Report</p>
              <p className="text-sm text-muted-foreground mt-1">
                Arraste o arquivo ou clique para selecionar (.json, .ndjson)
              </p>
            </div>
            <input
              type="file"
              accept=".json,.ndjson,.txt"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleFile(f);
              }}
            />
        </motion.label>
      ) : (
        <motion.div
          key="file"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center gap-4"
        >
            <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0">
              {isAnalyzing ? (
                <Loader2 className="w-5 h-5 text-foreground animate-spin" />
              ) : (
                <FileText className="w-5 h-5 text-foreground" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-foreground font-medium truncate">{file.name}</p>
              <p className="text-xs text-muted-foreground">
                {(file.size / 1024).toFixed(1)} KB
              </p>
            </div>
            {!isAnalyzing && (
              <button
                onClick={() => setFile(null)}
                className="p-2 rounded-lg hover:bg-secondary transition-colors"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            )}
        </motion.div>
      )}
    </motion.div>
    </motion.div>
  );
}
