import { useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Shield, Scan, Zap, Lock, ArrowRight, Wifi, Radio, Cpu } from "lucide-react";
import Navbar from "@/components/Navbar";
import FileUpload from "@/components/FileUpload";
import DashboardPreview from "@/components/DashboardPreview";
import TerminalLog, { type LogEntry } from "@/components/TerminalLog";
import { analyzeReport } from "@/lib/analyzer";
import { NetworkMonitor, type NetworkEvent } from "@/lib/network-monitor";
import { shouldAutoBlacklist, addToBlacklist } from "@/lib/blacklist";
import { useI18n } from "@/lib/i18n";

export default function Index() {
  const navigate = useNavigate();
  const { t } = useI18n();
  const [deviceIP, setDeviceIP] = useState("");
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [networkEvents, setNetworkEvents] = useState<NetworkEvent[]>([]);
  const [terminalLogs, setTerminalLogs] = useState<LogEntry[]>([]);
  const monitorRef = useRef<NetworkMonitor | null>(null);

  const addLog = useCallback((level: LogEntry['level'], message: string) => {
    const time = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setTerminalLogs(prev => [...prev, { time, level, message }]);
  }, []);

  const handleAnalyze = useCallback(async () => {
    if (!fileContent) return;
    setIsAnalyzing(true);
    setProgress(0);
    setNetworkEvents([]);
    setTerminalLogs([]);

    addLog('info', 'Magisk Scanner v2.0 initialized');
    addLog('info', 'Starting network monitor...');

    const monitor = new NetworkMonitor((event) => {
      setNetworkEvents(prev => [...prev, event]);
      addLog('error', `NETWORK ALERT: ${event.details}`);
    });
    monitorRef.current = monitor;
    await monitor.start(deviceIP || undefined);
    addLog('success', 'Network monitor active');

    try {
      const report = await analyzeReport(fileContent, deviceIP, (stage, pct, detail) => {
        setProgress(pct);
        const level: LogEntry['level'] = pct === 100 ? 'success' : 'info';
        addLog(level, stage);
        if (detail) addLog('info', `  └─ ${detail}`);
      });

      const events = monitor.stop();
      addLog('info', `Network monitor stopped. ${events.length} events captured.`);

      const autoBlacklisted = shouldAutoBlacklist(report, events);
      if (autoBlacklisted) {
        addToBlacklist(report, events, 'iPhone');
        addLog('error', 'AUTO-BLACKLIST: Device flagged and banned');
      }

      const finalReport = {
        ...report,
        networkMonitorEvents: events,
        autoBlacklisted,
      } as Record<string, unknown>;

      addLog('success', `Analysis complete. Risk score: ${report.riskScore}/100`);
      sessionStorage.setItem("magisk_report", JSON.stringify(finalReport));

      // Small delay to let user see final log
      setTimeout(() => navigate("/results"), 800);
    } catch (err) {
      monitor.stop();
      setIsAnalyzing(false);
      setProgress(0);
      addLog('error', `FATAL: ${err instanceof Error ? err.message : "Analysis failed"}`);
    }
  }, [fileContent, deviceIP, navigate, addLog]);

  const features = [
    { icon: Scan, title: t('feat.modules'), desc: t('feat.modules_desc') },
    { icon: Zap, title: t('feat.realtime'), desc: t('feat.realtime_desc') },
    { icon: Lock, title: t('feat.privacy'), desc: t('feat.privacy_desc') },
    { icon: Wifi, title: t('feat.ipintel'), desc: t('feat.ipintel_desc') },
    { icon: Radio, title: t('feat.sideload'), desc: t('feat.sideload_desc') },
    { icon: Cpu, title: t('feat.sysdiag'), desc: t('feat.sysdiag_desc') },
  ];

  return (
    <div className="min-h-screen bg-background grid-pattern overscroll-none">
      <Navbar />

      <main className="container mx-auto px-4 sm:px-6 pt-20 pb-16">
        {/* Hero */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-2xl mx-auto mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/5 border border-primary/10 mb-4"
          >
            <Shield className="w-3.5 h-3.5 text-primary animate-dot-pulse" />
            <span className="text-[10px] font-mono text-primary uppercase tracking-wider">{t('hero.badge')}</span>
          </motion.div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight gradient-text mb-2">
            {t('hero.title')}
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-lg mx-auto">
            {t('hero.subtitle')}
          </p>
        </motion.div>

        <div className="max-w-2xl mx-auto space-y-2.5 mb-10">
          <FileUpload onFileContent={setFileContent} isAnalyzing={isAnalyzing} />

          {/* IP Input */}
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="glass-panel rounded-xl p-3 sm:p-4">
            <div className="flex items-center gap-1.5 mb-1.5">
              <Wifi className="w-3 h-3 text-muted-foreground" />
              <label className="text-[10px] text-muted-foreground uppercase tracking-wider font-mono">{t('upload.ip_label')}</label>
            </div>
            <input
              type="text"
              placeholder={t('upload.ip_placeholder')}
              value={deviceIP}
              onChange={(e) => setDeviceIP(e.target.value.replace(/[^0-9.]/g, ''))}
              className="w-full bg-secondary rounded-lg px-3 py-2 text-xs text-foreground font-mono placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary/30 transition-shadow"
              maxLength={15}
            />
            <p className="text-[10px] text-muted-foreground mt-1.5">{t('upload.ip_hint')}</p>
          </motion.div>

          {/* Sysdiagnose guide */}
          <motion.details initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-panel rounded-xl overflow-hidden group">
            <summary className="p-3 sm:p-4 cursor-pointer flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors">
              <Cpu className="w-3.5 h-3.5" />
              <span className="font-medium">{t('upload.sysdiagnose_guide')}</span>
            </summary>
            <div className="px-3 sm:px-4 pb-3 sm:pb-4 space-y-1.5">
              {['step1', 'step2', 'step3', 'step4'].map(step => (
                <p key={step} className="text-[10px] text-muted-foreground font-mono">{t(`upload.sysdiagnose_${step}`)}</p>
              ))}
            </div>
          </motion.details>

          {/* Terminal Log (during analysis) */}
          {isAnalyzing && terminalLogs.length > 0 && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}>
              <TerminalLog logs={terminalLogs} title="magisk-scanner" maxHeight="200px" />
            </motion.div>
          )}

          {/* Progress bar */}
          {isAnalyzing && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-panel rounded-xl p-3 animate-shimmer">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] text-muted-foreground font-mono flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-dot-pulse" />
                  SCANNING
                </span>
                <span className="text-[10px] text-primary font-mono font-bold">{progress}%</span>
              </div>
              <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                <motion.div className="h-full rounded-full bg-gradient-to-r from-primary to-primary/60" animate={{ width: `${progress}%` }} transition={{ duration: 0.3 }} />
              </div>
              {networkEvents.length > 0 && (
                <div className="mt-2 space-y-0.5">
                  {networkEvents.map((ev, i) => (
                    <p key={i} className="text-[10px] font-mono terminal-error bg-destructive/10 px-2 py-0.5 rounded">⚠ {ev.details}</p>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* Analyze Button */}
          <motion.button
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            onClick={handleAnalyze}
            disabled={!fileContent || isAnalyzing}
            className="w-full bg-primary text-primary-foreground rounded-xl py-3 px-6 font-medium text-xs flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-30 disabled:cursor-not-allowed active:scale-[0.98] touch-manipulation"
          >
            {isAnalyzing ? (
              <>
                <div className="w-3 h-3 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                {t('upload.analyzing')}
              </>
            ) : (
              <>
                {t('upload.analyze')}
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </motion.button>
        </div>

        {/* Features */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-w-2xl mx-auto mb-10">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + i * 0.06 }}
              whileHover={{ y: -3, transition: { duration: 0.2 } }}
              className="glass-panel glass-hover rounded-lg p-3 cursor-default"
            >
              <f.icon className="w-3.5 h-3.5 text-primary/60 mb-1.5" />
              <h3 className="text-[10px] font-semibold text-foreground">{f.title}</h3>
              <p className="text-[10px] text-muted-foreground mt-0.5">{f.desc}</p>
            </motion.div>
          ))}
        </div>

        <div className="max-w-2xl mx-auto">
          <p className="text-center text-[10px] text-muted-foreground uppercase tracking-wider font-mono mb-3">
            {t('results.preview')}
          </p>
          <DashboardPreview />
        </div>
      </main>
    </div>
  );
}
