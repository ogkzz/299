import { motion, AnimatePresence } from "framer-motion";
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
      className="glass-panel glass-hover rounded-xl overflow-hidden"
    >
      <button onClick={() => setOpen(!open)} className="w-full p-4 flex items-center gap-3 text-left">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
          result.category === 'clean' ? 'bg-emerald-500/10' :
          result.category === 'suspect' ? 'bg-amber-500/10' : 'bg-red-500/10'
        }`}>
          <Icon className={`w-4 h-4 ${
            result.category === 'clean' ? 'status-clean' :
            result.category === 'suspect' ? 'status-suspect' : 'status-confirmed'
          }`} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-foreground truncate">{result.title}</p>
          <p className="text-[11px] text-muted-foreground font-mono">{result.module}</p>
        </div>
        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold ${badgeClass[result.category]}`}>
          {t(`results.${result.category}`)}
        </span>
        <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="px-4 pb-4 border-t border-border overflow-hidden"
          >
            <p className="text-xs text-muted-foreground mt-3 leading-relaxed">{result.description}</p>
            <div className="mt-3 space-y-1.5">
              <p className="text-[11px] font-semibold text-foreground">{t('card.evidence')}</p>
              {result.evidence.map((ev, i) => (
                <p key={i} className="text-[11px] text-muted-foreground font-mono bg-secondary/60 px-3 py-1 rounded-lg">{ev}</p>
              ))}
            </div>
            <div className="mt-3 flex items-center gap-4 text-[11px] text-muted-foreground font-mono">
              <span>{t('card.severity', { val: result.severity })}</span>
              {result.timestamp && <span>{new Date(result.timestamp).toLocaleString()}</span>}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
