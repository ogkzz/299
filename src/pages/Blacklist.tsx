import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Shield, Download, Trash2, AlertTriangle, ChevronDown, Ban } from "lucide-react";
import Navbar from "@/components/Navbar";
import { getBlacklist, removeFromBlacklist, exportBlacklist, type BlacklistEntry } from "@/lib/blacklist";
import { useI18n } from "@/lib/i18n";

export default function Blacklist() {
  const { t } = useI18n();
  const [list, setList] = useState<BlacklistEntry[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => { setList(getBlacklist()); }, []);

  const handleRemove = (id: string) => {
    removeFromBlacklist(id);
    setList(getBlacklist());
  };

  const handleExport = () => {
    const blob = new Blob([exportBlacklist(list)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `magisk_blacklist_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-background grid-pattern">
      <Navbar />
      <main className="container mx-auto px-4 sm:px-6 pt-20 pb-16">
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-destructive/10 border border-destructive/20 flex items-center justify-center">
                <Ban className="w-4 h-4 text-destructive" />
              </div>
              <div>
                <h1 className="text-base font-bold text-foreground">{t('blacklist.title')}</h1>
                <p className="text-[10px] text-muted-foreground">{t('blacklist.subtitle')}</p>
              </div>
            </div>
            {list.length > 0 && (
              <button onClick={handleExport} className="flex items-center gap-1.5 text-[10px] text-muted-foreground hover:text-foreground transition-colors font-mono">
                <Download className="w-3 h-3" /> {t('blacklist.export')}
              </button>
            )}
          </div>

          {list.length === 0 ? (
            <div className="glass-panel rounded-xl p-10 text-center">
              <Shield className="w-10 h-10 text-muted-foreground/20 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">{t('blacklist.empty')}</p>
              <p className="text-[10px] text-muted-foreground/60 mt-1">{t('blacklist.empty_hint')}</p>
            </div>
          ) : (
            <div className="space-y-2">
              {list.map((entry, i) => (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="glass-panel rounded-lg overflow-hidden"
                >
                  <button
                    onClick={() => setExpanded(expanded === entry.id ? null : entry.id)}
                    className="w-full p-3 flex items-center gap-3 text-left"
                  >
                    <div className="w-8 h-8 rounded-md status-badge-confirmed flex items-center justify-center flex-shrink-0">
                      <AlertTriangle className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-foreground truncate">{entry.deviceModel}</p>
                      <p className="text-[10px] text-muted-foreground font-mono">{entry.deviceIP} · {new Date(entry.bannedAt).toLocaleDateString()}</p>
                    </div>
                    <span className="status-badge-confirmed px-2 py-0.5 rounded-full text-[10px] font-mono font-bold">{entry.riskScore}</span>
                    <ChevronDown className={`w-3 h-3 text-muted-foreground transition-transform ${expanded === entry.id ? 'rotate-180' : ''}`} />
                  </button>

                  {expanded === entry.id && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} className="px-3 pb-3 border-t border-border">
                      <div className="mt-2 space-y-1.5">
                        <p className="text-[10px] text-muted-foreground font-mono"><strong>{t('blacklist.serial')}:</strong> {entry.serial}</p>
                        <p className="text-[10px] text-muted-foreground font-mono"><strong>{t('blacklist.reason')}:</strong> {entry.reason}</p>
                        {entry.ipInfo && (
                          <p className="text-[10px] text-muted-foreground font-mono">
                            ISP: {entry.ipInfo.isp} · {entry.ipInfo.city}, {entry.ipInfo.country}
                            {entry.ipInfo.proxy && <span className="text-destructive ml-1">● Proxy/VPN</span>}
                            {entry.ipInfo.hosting && <span className="text-destructive ml-1">● Hosting/DC</span>}
                          </p>
                        )}
                        {entry.findings.slice(0, 8).map((f, j) => (
                          <p key={j} className="text-[10px] text-muted-foreground font-mono bg-secondary/50 px-2 py-0.5 rounded">{f}</p>
                        ))}
                      </div>
                      <button
                        onClick={() => handleRemove(entry.id)}
                        className="mt-2 flex items-center gap-1 text-[10px] text-destructive hover:text-destructive/80 transition-colors font-mono"
                      >
                        <Trash2 className="w-2.5 h-2.5" /> Remove
                      </button>
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
}
