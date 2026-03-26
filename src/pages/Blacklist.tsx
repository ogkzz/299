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

  useEffect(() => {
    setList(getBlacklist());
  }, []);

  const handleRemove = (id: string) => {
    removeFromBlacklist(id);
    setList(getBlacklist());
  };

  const handleExport = () => {
    const blob = new Blob([exportBlacklist(list)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `299_blacklist_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-background grid-pattern">
      <Navbar />
      <main className="container mx-auto px-4 sm:px-6 pt-24 pb-20">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-destructive/10 border border-destructive/20 flex items-center justify-center">
                <Ban className="w-5 h-5 text-destructive" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">{t('blacklist.title')}</h1>
                <p className="text-xs text-muted-foreground">{t('blacklist.subtitle')}</p>
              </div>
            </div>
            {list.length > 0 && (
              <button onClick={handleExport} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                <Download className="w-4 h-4" /> {t('blacklist.export')}
              </button>
            )}
          </div>

          {list.length === 0 ? (
            <div className="glass-panel rounded-2xl p-12 text-center">
              <Shield className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground">{t('blacklist.empty')}</p>
              <p className="text-xs text-muted-foreground/60 mt-2">{t('blacklist.empty_hint')}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {list.map((entry, i) => (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="glass-panel rounded-xl overflow-hidden"
                >
                  <button
                    onClick={() => setExpanded(expanded === entry.id ? null : entry.id)}
                    className="w-full p-4 flex items-center gap-4 text-left"
                  >
                    <div className="w-10 h-10 rounded-lg status-badge-confirmed flex items-center justify-center flex-shrink-0">
                      <AlertTriangle className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{entry.deviceModel}</p>
                      <p className="text-xs text-muted-foreground">{entry.deviceIP} · {new Date(entry.bannedAt).toLocaleDateString()}</p>
                    </div>
                    <span className="status-badge-confirmed px-2 py-1 rounded-full text-xs font-medium">{entry.riskScore}/100</span>
                    <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${expanded === entry.id ? 'rotate-180' : ''}`} />
                  </button>

                  {expanded === entry.id && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} className="px-4 pb-4 border-t border-border">
                      <div className="mt-3 space-y-2">
                        <p className="text-xs text-muted-foreground"><strong>{t('blacklist.serial')}:</strong> {entry.serial}</p>
                        <p className="text-xs text-muted-foreground"><strong>{t('blacklist.reason')}:</strong> {entry.reason}</p>
                        {entry.ipInfo && (
                          <div className="text-xs text-muted-foreground">
                            <strong>ISP:</strong> {entry.ipInfo.isp} · <strong>{t('device.location')}:</strong> {entry.ipInfo.city}, {entry.ipInfo.country}
                            {entry.ipInfo.proxy && <span className="ml-2 text-destructive">🔴 Proxy/VPN</span>}
                            {entry.ipInfo.hosting && <span className="ml-2 text-destructive">🔴 Hosting/DC</span>}
                          </div>
                        )}
                        {entry.networkEvents.length > 0 && (
                          <div className="mt-2">
                            <p className="text-xs font-medium text-foreground mb-1">{t('results.network_events')}:</p>
                            {entry.networkEvents.map((ev, j) => (
                              <p key={j} className="text-xs text-muted-foreground font-mono bg-secondary/50 px-2 py-1 rounded mb-1">
                                [{ev.type}] {ev.details}
                              </p>
                            ))}
                          </div>
                        )}
                        <div className="mt-2">
                          <p className="text-xs font-medium text-foreground mb-1">{t('blacklist.details')}:</p>
                          {entry.findings.slice(0, 10).map((f, j) => (
                            <p key={j} className="text-xs text-muted-foreground font-mono bg-secondary/50 px-2 py-1 rounded mb-1">{f}</p>
                          ))}
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemove(entry.id)}
                        className="mt-3 flex items-center gap-2 text-xs text-destructive hover:text-destructive/80 transition-colors"
                      >
                        <Trash2 className="w-3 h-3" /> Remover da blacklist
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
