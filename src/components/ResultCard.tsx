import { motion } from "framer-motion";
import { AlertTriangle, ShieldAlert, CheckCircle, ChevronDown } from "lucide-react";
import { useState } from "react";
import { useI18n } from "@/lib/i18n";
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

export default function ResultCard({ result, index }: { result: AnalysisResult; index: number }) {
  const [open, setOpen] = useState(false);
  const { t } = useI18n();
  const Icon = icons[result.category];

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.03 }}
      className="glass-panel glass-hover rounded-lg overflow-hidden"
    >
      <button onClick={() => setOpen(!open)} className="w-full p-3 flex items-center gap-3 text-left">
        <Icon className={`w-4 h-4 flex-shrink-0 ${
          result.category === 'clean' ? 'status-clean' :
          result.category === 'suspect' ? 'status-suspect' : 'status-confirmed'
        }`} />
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-foreground truncate">{result.title}</p>
          <p className="text-[10px] text-muted-foreground font-mono">{result.module}</p>
        </div>
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${badgeClass[result.category]}`}>
          {t(`results.${result.category}`)}
        </span>
        <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} className="px-3 pb-3 border-t border-border">
          <p className="text-xs text-muted-foreground mt-2">{result.description}</p>
          <div className="mt-2 space-y-1">
            <p className="text-[10px] font-medium text-foreground">{t('card.evidence')}</p>
            {result.evidence.map((ev, i) => (
              <p key={i} className="text-[10px] text-muted-foreground font-mono bg-secondary/50 px-2 py-0.5 rounded">{ev}</p>
            ))}
          </div>
          <div className="mt-2 flex items-center gap-3 text-[10px] text-muted-foreground font-mono">
            <span>{t('card.severity', { val: result.severity })}</span>
            {result.timestamp && <span>{new Date(result.timestamp).toLocaleString()}</span>}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
