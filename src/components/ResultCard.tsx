import { motion } from "framer-motion";
import { AlertTriangle, ShieldAlert, CheckCircle, ChevronDown } from "lucide-react";
import { useState } from "react";
import type { AnalysisResult } from "@/lib/analyzer";

const icons = {
  suspect: AlertTriangle,
  confirmed: ShieldAlert,
  clean: CheckCircle,
};

const badgeClass = {
  suspect: "status-badge-suspect",
  confirmed: "status-badge-confirmed",
  clean: "status-badge-clean",
};

const labels = {
  suspect: "Suspeito",
  confirmed: "Confirmado",
  clean: "Limpo",
};

export default function ResultCard({ result, index }: { result: AnalysisResult; index: number }) {
  const [open, setOpen] = useState(false);
  const Icon = icons[result.category];

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className="glass-panel glass-hover rounded-xl overflow-hidden"
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full p-4 flex items-center gap-4 text-left"
      >
        <Icon className={`w-5 h-5 flex-shrink-0 ${
          result.category === 'clean' ? 'status-clean' :
          result.category === 'suspect' ? 'status-suspect' : 'status-confirmed'
        }`} />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground truncate">{result.title}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{result.module}</p>
        </div>
        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${badgeClass[result.category]}`}>
          {labels[result.category]}
        </span>
        <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          className="px-4 pb-4 border-t border-border"
        >
          <p className="text-sm text-muted-foreground mt-3">{result.description}</p>
          <div className="mt-3 space-y-1.5">
            <p className="text-xs font-medium text-foreground">Evidências:</p>
            {result.evidence.map((ev, i) => (
              <p key={i} className="text-xs text-muted-foreground font-mono bg-secondary/50 px-2 py-1 rounded">
                {ev}
              </p>
            ))}
          </div>
          <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
            <span>Severidade: {result.severity}/10</span>
            {result.timestamp && <span>Timestamp: {new Date(result.timestamp).toLocaleString()}</span>}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
