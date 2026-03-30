import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Download, Trash2, AlertTriangle, ChevronDown, Ban, Lock, ClipboardList, Eye, EyeOff, RefreshCw, Loader2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import { getBlacklist, removeFromBlacklist, getAuditLog, type BlacklistEntry, type AuditLogEntry } from "@/lib/blacklist";
import { useI18n } from "@/lib/i18n";

export default function Blacklist() {
  const { t } = useI18n();
  const [list, setList] = useState<BlacklistEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [removeTarget, setRemoveTarget] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [removeError, setRemoveError] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [showAudit, setShowAudit] = useState(false);
  const [auditLog, setAuditLog] = useState<AuditLogEntry[]>([]);

  const loadList = useCallback(async () => {
    setLoading(true);
    const data = await getBlacklist();
    setList(data);
    setLoading(false);
  }, []);

  useEffect(() => { loadList(); }, [loadList]);

  const handleRemoveRequest = (id: string) => {
    setRemoveTarget(id);
    setPassword("");
    setRemoveError(false);
  };

  const handleRemoveConfirm = async () => {
    if (!removeTarget || !password) return;
    setRemoving(true);
    const success = await removeFromBlacklist(removeTarget, password);
    if (success) {
      await loadList();
      setRemoveTarget(null);
      setPassword("");
      setRemoveError(false);
    } else {
      setRemoveError(true);
      setPassword("");
    }
    setRemoving(false);
  };

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(list, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `magisk_blacklist_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const toggleAudit = async () => {
    if (!showAudit) {
      const log = await getAuditLog();
      setAuditLog(log);
    }
    setShowAudit(!showAudit);
  };

  return (
    <div className="min-h-screen bg-background grid-pattern">
      <Navbar />
      <main className="container mx-auto px-4 sm:px-6 pt-20 pb-16">
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-destructive/10 border border-destructive/20 flex items-center justify-center">
                <Ban className="w-5 h-5 text-destructive" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-foreground">{t('blacklist.title')}</h1>
                <p className="text-[11px] text-muted-foreground">{t('blacklist.subtitle')}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={loadList} className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors" title="Refresh">
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
              <button onClick={toggleAudit} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors font-mono">
                <ClipboardList className="w-3.5 h-3.5" /> Audit
              </button>
              {list.length > 0 && (
                <button onClick={handleExport} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors font-mono">
                  <Download className="w-3.5 h-3.5" /> {t('blacklist.export')}
                </button>
              )}
            </div>
          </div>

          {/* Count badge */}
          <div className="flex items-center gap-3 mb-4">
            <div className="px-3 py-1.5 rounded-lg bg-destructive/10 border border-destructive/20">
              <span className="text-xs font-bold text-destructive font-mono">{list.length}</span>
              <span className="text-[10px] text-destructive/70 ml-1.5">banned</span>
            </div>
          </div>

          {/* Audit Log */}
          <AnimatePresence>
            {showAudit && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="mb-4 overflow-hidden">
                <div className="glass-panel rounded-xl p-4">
                  <h3 className="text-[11px] text-muted-foreground font-mono uppercase tracking-wider mb-3 flex items-center gap-2">
                    <ClipboardList className="w-3 h-3" /> Audit Log
                  </h3>
                  {auditLog.length === 0 ? (
                    <p className="text-[11px] text-muted-foreground font-mono">No audit entries.</p>
                  ) : (
                    <div className="space-y-1 max-h-48 overflow-y-auto">
                      {auditLog.map(entry => (
                        <div key={entry.id} className={`text-[11px] font-mono px-3 py-1.5 rounded-lg ${
                          entry.action === 'remove_denied' ? 'bg-destructive/10 text-destructive' :
                          entry.action === 'remove_success' ? 'bg-primary/10 text-primary' :
                          'bg-secondary text-muted-foreground'
                        }`}>
                          [{new Date(entry.created_at).toLocaleString()}] {entry.action.toUpperCase()} — IP: {entry.target_ip}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Password Modal */}
          <AnimatePresence>
            {removeTarget && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md px-4"
                onClick={() => !removing && setRemoveTarget(null)}
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  onClick={e => e.stopPropagation()}
                  className="glass-panel-strong rounded-2xl p-6 w-full max-w-sm border border-border shadow-2xl"
                >
                  <div className="flex items-center gap-2.5 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-destructive/10 flex items-center justify-center">
                      <Lock className="w-4 h-4 text-destructive" />
                    </div>
                    <h3 className="text-sm font-bold text-foreground">{t('blacklist.confirm_remove')}</h3>
                  </div>
                  <p className="text-[11px] text-muted-foreground mb-4">{t('blacklist.password_required')}</p>
                  
                  <div className="relative mb-3">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={e => { setPassword(e.target.value); setRemoveError(false); }}
                      onKeyDown={e => e.key === 'Enter' && handleRemoveConfirm()}
                      placeholder={t('blacklist.password_placeholder')}
                      className="w-full bg-secondary rounded-xl px-4 py-2.5 text-xs text-foreground font-mono placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-destructive/30 pr-10 transition-shadow"
                      autoFocus
                      disabled={removing}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  {removeError && (
                    <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}
                      className="text-[11px] text-destructive font-mono mb-3 flex items-center gap-1.5"
                    >
                      <AlertTriangle className="w-3 h-3" /> {t('blacklist.wrong_password')}
                    </motion.p>
                  )}

                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => setRemoveTarget(null)}
                      disabled={removing}
                      className="flex-1 px-4 py-2.5 rounded-xl text-xs text-muted-foreground hover:text-foreground transition-colors bg-secondary font-mono disabled:opacity-30"
                    >
                      {t('blacklist.cancel')}
                    </button>
                    <button
                      onClick={handleRemoveConfirm}
                      disabled={!password || removing}
                      className="flex-1 px-4 py-2.5 rounded-xl text-xs text-destructive-foreground bg-destructive hover:bg-destructive/90 transition-colors font-mono disabled:opacity-30 flex items-center justify-center gap-1.5"
                    >
                      {removing ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
                      {t('blacklist.confirm')}
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* List */}
          {loading ? (
            <div className="glass-panel rounded-xl p-10 text-center">
              <Loader2 className="w-6 h-6 text-primary animate-spin mx-auto mb-3" />
              <p className="text-xs text-muted-foreground font-mono">Loading blacklist...</p>
            </div>
          ) : list.length === 0 ? (
            <div className="glass-panel rounded-xl p-12 text-center">
              <Shield className="w-12 h-12 text-muted-foreground/15 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">{t('blacklist.empty')}</p>
              <p className="text-[11px] text-muted-foreground/60 mt-1">{t('blacklist.empty_hint')}</p>
            </div>
          ) : (
            <div className="space-y-2">
              {list.map((entry, i) => (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="glass-panel rounded-xl overflow-hidden"
                >
                  <button
                    onClick={() => setExpanded(expanded === entry.id ? null : entry.id)}
                    className="w-full p-4 flex items-center gap-3 text-left"
                  >
                    <div className="w-9 h-9 rounded-lg status-badge-confirmed flex items-center justify-center flex-shrink-0">
                      <AlertTriangle className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-foreground truncate">{entry.device_model}</p>
                      <p className="text-[11px] text-muted-foreground font-mono">{entry.device_ip} · {new Date(entry.banned_at).toLocaleDateString()}</p>
                    </div>
                    <span className="status-badge-confirmed px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold">{entry.risk_score}</span>
                    <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${expanded === entry.id ? 'rotate-180' : ''}`} />
                  </button>

                  <AnimatePresence>
                    {expanded === entry.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="px-4 pb-4 border-t border-border overflow-hidden"
                      >
                        <div className="mt-3 space-y-2">
                          <p className="text-[11px] text-muted-foreground font-mono"><strong className="text-foreground/80">{t('blacklist.serial')}:</strong> {entry.serial}</p>
                          <p className="text-[11px] text-muted-foreground font-mono"><strong className="text-foreground/80">{t('blacklist.reason')}:</strong> {entry.reason}</p>
                          {entry.ip_info && (
                            <p className="text-[11px] text-muted-foreground font-mono">
                              ISP: {entry.ip_info.isp} · {entry.ip_info.city}, {entry.ip_info.country}
                              {entry.ip_info.proxy && <span className="text-destructive ml-1.5 font-semibold">● Proxy/VPN</span>}
                              {entry.ip_info.hosting && <span className="text-destructive ml-1.5 font-semibold">● Hosting/DC</span>}
                            </p>
                          )}
                          {entry.findings.slice(0, 8).map((f, j) => (
                            <p key={j} className="text-[11px] text-muted-foreground font-mono bg-secondary/60 px-3 py-1 rounded-lg">{f}</p>
                          ))}
                        </div>
                        <button
                          onClick={() => handleRemoveRequest(entry.id)}
                          className="mt-3 flex items-center gap-1.5 text-[11px] text-destructive hover:text-destructive/80 transition-colors font-mono font-medium"
                        >
                          <Trash2 className="w-3 h-3" /> <Lock className="w-3 h-3" /> {t('blacklist.remove_protected')}
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
