import { useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Shield, Scan, Zap, Lock, ArrowRight, Wifi } from "lucide-react";
import Navbar from "@/components/Navbar";
import FileUpload from "@/components/FileUpload";
import DashboardPreview from "@/components/DashboardPreview";
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
  const [progressStage, setProgressStage] = useState("");
  const [progressDetail, setProgressDetail] = useState("");
  const [networkEvents, setNetworkEvents] = useState<NetworkEvent[]>([]);
  const monitorRef = useRef<NetworkMonitor | null>(null);

  const handleAnalyze = useCallback(async () => {
    if (!fileContent) return;
    setIsAnalyzing(true);
    setProgress(0);
    setNetworkEvents([]);
    setProgressStage("Iniciando análise...");

    // Start network monitoring
    const monitor = new NetworkMonitor((event) => {
      setNetworkEvents(prev => [...prev, event]);
    });
    monitorRef.current = monitor;
    await monitor.start(deviceIP || undefined);

    try {
      const report = await analyzeReport(fileContent, deviceIP, (stage, pct, detail) => {
        setProgressStage(stage);
        setProgress(pct);
        if (detail) setProgressDetail(detail);
      });

      // Stop monitoring and collect events
      const events = monitor.stop();

      // Add network events to report
      const finalReport = {
        ...report,
        networkMonitorEvents: events,
      };

      // Auto-blacklist check
      if (shouldAutoBlacklist(report, events)) {
        addToBlacklist(report, events, 'iPhone');
        finalReport.autoBlacklisted = true;
      }

      sessionStorage.setItem("299_report", JSON.stringify(finalReport));
      navigate("/results");
    } catch (err) {
      monitor.stop();
      setIsAnalyzing(false);
      setProgressStage("");
      setProgress(0);
      alert(err instanceof Error ? err.message : "Erro ao analisar arquivo");
    }
  }, [fileContent, deviceIP, navigate]);

  return (
    <div className="min-h-screen bg-background grid-pattern overscroll-none">
      <Navbar />

      <main className="container mx-auto px-4 sm:px-6 pt-24 pb-20">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-3xl mx-auto mb-10"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
            className="w-14 h-14 rounded-2xl bg-foreground/5 border border-border flex items-center justify-center mx-auto mb-5"
          >
            <Shield className="w-7 h-7 text-foreground" />
          </motion.div>
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold tracking-tight gradient-text mb-3">
            {t('hero.title')}
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto">
            {t('hero.subtitle')}
          </p>
        </motion.div>

        <div className="max-w-2xl mx-auto space-y-3 mb-12">
          <FileUpload onFileContent={setFileContent} isAnalyzing={isAnalyzing} />

          {/* IP Input */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-panel rounded-2xl p-4 sm:p-5"
          >
            <div className="flex items-center gap-2 mb-2">
              <Wifi className="w-4 h-4 text-muted-foreground" />
              <label className="text-sm text-muted-foreground">
                {t('upload.ip_label')}
              </label>
            </div>
            <input
              type="text"
              placeholder={t('upload.ip_placeholder')}
              value={deviceIP}
              onChange={(e) => setDeviceIP(e.target.value)}
              className="w-full bg-secondary rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-ring transition-shadow"
            />
            <p className="text-xs text-muted-foreground mt-2">
              {t('upload.ip_hint')}
            </p>
          </motion.div>

          {/* Progress */}
          {isAnalyzing && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="glass-panel rounded-2xl p-4 sm:p-5 space-y-3"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm text-foreground font-medium">{progressStage}</p>
                <span className="text-xs text-muted-foreground">{progress}%</span>
              </div>
              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-foreground"
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
              {progressDetail && (
                <p className="text-xs text-muted-foreground">{progressDetail}</p>
              )}
              {/* Network events during analysis */}
              {networkEvents.length > 0 && (
                <div className="mt-2 space-y-1">
                  {networkEvents.map((ev, i) => (
                    <p key={i} className="text-xs font-mono status-confirmed bg-destructive/10 px-2 py-1 rounded">
                      ⚠️ {ev.details}
                    </p>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* Analyze Button */}
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            onClick={handleAnalyze}
            disabled={!fileContent || isAnalyzing}
            className="w-full bg-foreground text-background rounded-2xl py-4 px-6 font-medium text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-30 disabled:cursor-not-allowed active:scale-[0.98] touch-manipulation"
          >
            {isAnalyzing ? (
              <>
                <div className="w-4 h-4 border-2 border-background/30 border-t-background rounded-full animate-spin" />
                {t('upload.analyzing')}
              </>
            ) : (
              <>
                {t('upload.analyze')}
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </motion.button>
        </div>

        {/* Features Mini */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 max-w-4xl mx-auto mb-12">
          {[
            { icon: Scan, title: t('feat.modules'), desc: t('feat.modules_desc') },
            { icon: Zap, title: t('feat.realtime'), desc: t('feat.realtime_desc') },
            { icon: Lock, title: t('feat.privacy'), desc: t('feat.privacy_desc') },
            { icon: Wifi, title: t('feat.ipintel'), desc: t('feat.ipintel_desc') },
          ].map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + i * 0.1 }}
              className="glass-panel glass-hover rounded-xl p-3 sm:p-4"
            >
              <f.icon className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground mb-2" />
              <h3 className="text-xs font-medium text-foreground">{f.title}</h3>
              <p className="text-xs text-muted-foreground mt-0.5">{f.desc}</p>
            </motion.div>
          ))}
        </div>

        <div className="max-w-3xl mx-auto">
          <p className="text-center text-xs text-muted-foreground uppercase tracking-wider mb-4">
            {t('results.preview')}
          </p>
          <DashboardPreview />
        </div>
      </main>
    </div>
  );
}
