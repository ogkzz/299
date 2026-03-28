import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Download, Trash2, AlertTriangle, ChevronDown, Ban, Lock, ClipboardList, Eye, EyeOff } from "lucide-react";
import Navbar from "@/components/Navbar";
import { getBlacklist, removeFromBlacklist, exportBlacklist, getAuditLog, type BlacklistEntry, type AuditLogEntry } from "@/lib/blacklist";
import { useI18n } from "@/lib/i18n";

export default function Blacklist() {
  const { t } = useI18n();
  const [list, setList] = useState<BlacklistEntry[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [removeTarget, setRemoveTarget] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [removeError, setRemoveError] = useState(false);
  const [showAudit, setShowAudit] = useState(false);
  const [auditLog, setAuditLog] = useState<AuditLogEntry[]>([]);

  useEffect(() => { setList(getBlacklist()); }, []);

  const handleRemoveRequest = (id: string) => {
    setRemoveTarget(id);
    setPassword("");
    setRemoveError(false);
  };

  const handleRemoveConfirm = () => {
    if (!removeTarget) return;
    const success = removeFromBlacklist(removeTarget, password);
    if (success) {
      setList(getBlacklist());
      setRemoveTarget(null);
      setPassword("");
      setRemoveError(false);
    } else {
      setRemoveError(true);
      setPassword("");
    }
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

  const toggleAudit = () => {
    if (!showAudit) setAuditLog(getAuditLog());
    setShowAudit(!showAudit);
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
            <div className="flex items-center gap-2">
              <button onClick={toggleAudit} className="flex items-center gap-1.5 text-[10px] text-muted-foreground hover:text-foreground transition-colors font-mono">
                <ClipboardList className="w-3 h-3" /> Audit
              </button>
              {list.length > 0 && (
                <button onClick={handleExport} className="flex items-center gap-1.5 text-[10px] text-muted-foreground hover:text-foreground transition-colors font-mono">
                  <Download className="w-3 h-3" /> {t('blacklist.export')}
                </button>
              )}
            </div>
          </div>

          {/* Audit Log Panel */}
          <AnimatePresence>
            {showAudit && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-4 overflow-hidden"
              >
                <div className="glass-panel rounded-lg p-3">
                  <h3 className="text-[10px] text-muted-foreground font-mono uppercase tracking-wider mb-2">Audit Log</h3>
                  {auditLog.length === 0 ? (
                    <p className="text-[10px] text-muted-foreground font-mono">No audit entries.</p>
                  ) : (
                    <div className="space-y-1 max-h-40 overflow-y-auto">
                      {auditLog.slice().reverse().map(entry => (
                        <div key={entry.id} className={`text-[10px] font-mono px-2 py-1 rounded ${
                          entry.action === 'remove_denied' ? 'bg-destructive/10 text-destructive' :
                          entry.action === 'remove_success' ? 'bg-primary/10 text-primary' :
                          'bg-secondary text-muted-foreground'
                        }`}>
                          [{new Date(entry.timestamp).toLocaleString()}] {entry.action.toUpperCase()} — IP: {entry.targetIP}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Password Confirmation Modal */}
          <AnimatePresence>
            {removeTarget && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
                onClick={() => setRemoveTarget(null)}
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  onClick={e => e.stopPropagation()}
                  className="glass-panel-strong rounded-xl p-5 w-full max-w-sm border border-border"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <Lock className="w-4 h-4 text-destructive" />
                    <h3 className="text-sm font-bold text-foreground">{t('blacklist.confirm_remove')}</h3>
                  </div>
                  <p className="text-[10px] text-muted-foreground mb-3">{t('blacklist.password_required')}</p>
                  
                  <div className="relative mb-2">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={e => { setPassword(e.target.value); setRemoveError(false); }}
                      onKeyDown={e => e.key === 'Enter' && handleRemoveConfirm()}
                      placeholder={t('blacklist.password_placeholder')}
                      className="w-full bg-secondary rounded-lg px-3 py-2 text-xs text-foreground font-mono placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-destructive/30 pr-8"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  {removeError && (
                    <motion.p
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-[10px] text-destructive font-mono mb-2"
                    >
                      ⚠ {t('blacklist.wrong_password')}
                    </motion.p>
                  )}

                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => setRemoveTarget(null)}
                      className="flex-1 px-3 py-2 rounded-lg text-xs text-muted-foreground hover:text-foreground transition-colors bg-secondary font-mono"
                    >
                      {t('blacklist.cancel')}
                    </button>
                    <button
                      onClick={handleRemoveConfirm}
                      disabled={!password}
                      className="flex-1 px-3 py-2 rounded-lg text-xs text-destructive-foreground bg-destructive hover:bg-destructive/90 transition-colors font-mono disabled:opacity-30"
                    >
                      {t('blacklist.confirm')}
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

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

                  <AnimatePresence>
                    {expanded === entry.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="px-3 pb-3 border-t border-border overflow-hidden"
                      >
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
                          onClick={() => handleRemoveRequest(entry.id)}
                          className="mt-2 flex items-center gap-1 text-[10px] text-destructive hover:text-destructive/80 transition-colors font-mono"
                        >
                          <Trash2 className="w-2.5 h-2.5" /> <Lock className="w-2.5 h-2.5" /> {t('blacklist.remove_protected')}
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
}
