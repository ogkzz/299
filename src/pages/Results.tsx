import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Download, Search, Shield, Clock, Globe, Smartphone, MapPin, Server, Wifi, AlertTriangle, Ban } from "lucide-react";
import Navbar from "@/components/Navbar";
import RiskGauge from "@/components/RiskGauge";
import ResultCard from "@/components/ResultCard";
import TerminalLog, { type LogEntry } from "@/components/TerminalLog";
import { useI18n } from "@/lib/i18n";
import type { AnalysisReport } from "@/lib/analyzer";
import type { NetworkEvent } from "@/lib/network-monitor";

interface ExtendedReport extends AnalysisReport {
  networkMonitorEvents?: NetworkEvent[];
  autoBlacklisted?: boolean;
}

export default function Results() {
  const navigate = useNavigate();
  const { t } = useI18n();
  const [report, setReport] = useState<ExtendedReport | null>(null);
  const [filter, setFilter] = useState<'all' | 'suspect' | 'confirmed' | 'clean'>('all');
  const [search, setSearch] = useState("");

  useEffect(() => {
    const data = sessionStorage.getItem("magisk_report");
    if (!data) { navigate("/"); return; }
    try { setReport(JSON.parse(data)); } catch { navigate("/"); }
  }, [navigate]);

  // Build terminal log from results
  const terminalLogs = useMemo((): LogEntry[] => {
    if (!report) return [];
    const logs: LogEntry[] = [];
    const time = new Date(report.analysisDate).toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });

    logs.push({ time, level: 'info', message: `Magisk Scanner — ${report.totalEntries} entries analyzed` });
    logs.push({ time, level: 'info', message: `Period: ${report.reportPeriod.start?.split('T')[0] || 'N/A'} → ${report.reportPeriod.end?.split('T')[0] || 'N/A'}` });

    if (report.ipInfo) {
      logs.push({ time, level: report.ipInfo.proxy ? 'error' : 'success', message: `IP ${report.ipInfo.ip}: ${report.ipInfo.isp} (${report.ipInfo.city}, ${report.ipInfo.country})` });
      if (report.ipInfo.proxy) logs.push({ time, level: 'error', message: 'PROXY/VPN DETECTED on device IP' });
      if (report.ipInfo.hosting) logs.push({ time, level: 'error', message: 'HOSTING/DATACENTER IP detected' });
    }

    for (const r of report.results) {
      const lvl: LogEntry['level'] = r.category === 'confirmed' ? 'error' : r.category === 'suspect' ? 'warn' : 'success';
      logs.push({ time, level: lvl, message: `[${r.module}] ${r.title}` });
    }

    if (report.networkMonitorEvents) {
      for (const ev of report.networkMonitorEvents) {
        const evTime = new Date(ev.timestamp).toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
        logs.push({ time: evTime, level: 'error', message: `NETWORK: ${ev.details}` });
      }
    }

    logs.push({ time, level: report.riskScore > 60 ? 'error' : report.riskScore > 25 ? 'warn' : 'success', message: `Final risk score: ${report.riskScore}/100` });
    return logs;
  }, [report]);

  if (!report) return null;

  const filteredResults = report.results
    .filter(r => filter === 'all' || r.category === filter)
    .filter(r => !search ||
      r.title.toLowerCase().includes(search.toLowerCase()) ||
      r.description.toLowerCase().includes(search.toLowerCase()) ||
      r.module.toLowerCase().includes(search.toLowerCase())
    );

  const formatDate = (iso: string) => {
    if (!iso || iso === 'N/A') return 'N/A';
    try { return new Date(iso).toLocaleDateString(); } catch { return iso; }
  };

  return (
    <div className="min-h-screen bg-background grid-pattern overscroll-none">
      <Navbar />
      <main className="container mx-auto px-4 sm:px-6 pt-16 pb-16">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="book-open">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <button onClick={() => navigate("/")} className="flex items-center gap-1.5 text-[10px] text-muted-foreground hover:text-foreground transition-colors font-mono">
              <ArrowLeft className="w-3 h-3" /> {t('results.back')}
            </button>
            <button
              onClick={() => {
                const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url; a.download = `magisk_report_${new Date().toISOString().split('T')[0]}.json`;
                a.click(); URL.revokeObjectURL(url);
              }}
              className="flex items-center gap-1.5 text-[10px] text-muted-foreground hover:text-foreground transition-colors font-mono"
            >
              <Download className="w-3 h-3" /> {t('results.export')}
            </button>
          </div>

          {/* Auto-blacklisted */}
          {report.autoBlacklisted && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-3 p-3 rounded-lg status-badge-confirmed flex items-center gap-2">
              <Ban className="w-4 h-4 flex-shrink-0" />
              <div>
                <p className="text-xs font-medium">Device auto-blacklisted</p>
                <p className="text-[10px] opacity-80">Confirmed irregularities detected.</p>
              </div>
            </motion.div>
          )}

          {/* Terminal Log */}
          <div className="mb-4">
            <TerminalLog logs={terminalLogs} title="magisk-report" maxHeight="180px" />
          </div>

          {/* Risk + IP */}
          <div className="grid md:grid-cols-2 gap-2.5 mb-4">
            <div className="glass-panel rounded-lg p-4 flex flex-col items-center justify-center">
              <RiskGauge score={report.riskScore} />
              <p className="text-[10px] text-muted-foreground mt-2 font-mono">
                {t('results.score_based', { count: report.results.length })}
              </p>
            </div>

            {report.ipInfo ? (
              <div className="glass-panel rounded-lg p-3 space-y-2">
                <div className="flex items-center gap-1.5 mb-1">
                  <Wifi className="w-3 h-3 text-primary" />
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-mono">{t('results.ip_intelligence')}</span>
                </div>
                {[
                  { icon: Globe, label: "IP", value: report.ipInfo.ip },
                  { icon: MapPin, label: t('device.location'), value: `${report.ipInfo.city}, ${report.ipInfo.region}, ${report.ipInfo.country}` },
                  { icon: Server, label: "ISP", value: report.ipInfo.isp },
                  { icon: Shield, label: "ASN", value: report.ipInfo.as },
                  { icon: Wifi, label: t('device.type'), value: [
                    report.ipInfo.mobile ? t('device.mobile') : t('device.fixed'),
                    report.ipInfo.proxy ? t('device.proxy') : '',
                    report.ipInfo.hosting ? t('device.hosting') : '',
                  ].filter(Boolean).join(' · ') },
                ].map(item => (
                  <div key={item.label} className="flex items-start gap-1.5">
                    <item.icon className="w-3 h-3 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <div className="min-w-0">
                      <span className="text-[10px] text-muted-foreground font-mono">{item.label}: </span>
                      <span className="text-[10px] text-foreground font-mono break-all">{item.value}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="glass-panel rounded-lg p-4 flex items-center justify-center">
                <p className="text-xs text-muted-foreground font-mono">{t('results.ip_na')}</p>
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
            {[
              { icon: Clock, label: t('results.period'), value: `${formatDate(report.reportPeriod.start)} → ${formatDate(report.reportPeriod.end)}` },
              { icon: Globe, label: t('results.domains'), value: report.domainsAnalyzed.toString() },
              { icon: Smartphone, label: t('results.apps'), value: report.appsAnalyzed.toString() },
              { icon: Shield, label: t('results.entries'), value: report.totalEntries.toString() },
            ].map(item => (
              <div key={item.label} className="glass-panel rounded-lg p-2.5">
                <div className="flex items-center gap-1 mb-0.5">
                  <item.icon className="w-2.5 h-2.5 text-muted-foreground" />
                  <span className="text-[10px] text-muted-foreground font-mono">{item.label}</span>
                </div>
                <p className="text-[10px] font-medium text-foreground font-mono truncate">{item.value}</p>
              </div>
            ))}
          </div>

          {/* Network events banner */}
          {report.networkMonitorEvents && report.networkMonitorEvents.length > 0 && (
            <div className="mb-3 glass-panel rounded-lg p-3">
              <div className="flex items-center gap-1.5 mb-1.5">
                <AlertTriangle className="w-3 h-3 status-confirmed" />
                <span className="text-[10px] text-foreground font-medium font-mono">{t('results.network_events')}</span>
              </div>
              {report.networkMonitorEvents.map((ev, i) => (
                <p key={i} className="text-[10px] font-mono terminal-error bg-destructive/10 px-2 py-0.5 rounded mb-0.5">
                  [{new Date(ev.timestamp).toLocaleTimeString()}] {ev.type}: {ev.details}
                </p>
              ))}
            </div>
          )}

          {/* Filters */}
          <div className="grid grid-cols-3 gap-2 mb-3">
            {[
              { key: 'clean' as const, label: t('results.clean'), count: report.summary.clean, cls: 'status-badge-clean' },
              { key: 'suspect' as const, label: t('results.suspect'), count: report.summary.suspect, cls: 'status-badge-suspect' },
              { key: 'confirmed' as const, label: t('results.confirmed'), count: report.summary.confirmed, cls: 'status-badge-confirmed' },
            ].map(s => (
              <button
                key={s.key}
                onClick={() => setFilter(filter === s.key ? 'all' : s.key)}
                className={`rounded-lg p-2.5 text-center transition-all touch-manipulation ${
                  filter === s.key ? `${s.cls} scale-[1.02]` : 'glass-panel glass-hover'
                }`}
              >
                <div className={`text-lg font-bold font-mono ${
                  s.key === 'clean' ? 'status-clean' : s.key === 'suspect' ? 'status-suspect' : 'status-confirmed'
                }`}>{s.count}</div>
                <div className="text-[10px] text-muted-foreground">{s.label}</div>
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="glass-panel rounded-lg p-2.5 mb-3 flex items-center gap-2">
            <Search className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
            <input
              type="text"
              placeholder={t('results.search')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 bg-transparent text-xs text-foreground font-mono placeholder:text-muted-foreground outline-none min-w-0"
            />
            {search && <span className="text-[10px] text-muted-foreground font-mono">{filteredResults.length}</span>}
          </div>

          {/* Results */}
          <div className="space-y-1.5">
            {filteredResults.map((result, i) => (
              <ResultCard key={result.id} result={result} index={i} />
            ))}
            {filteredResults.length === 0 && (
              <div className="glass-panel rounded-lg p-6 text-center">
                <p className="text-xs text-muted-foreground font-mono">{t('results.no_results')}</p>
              </div>
            )}
          </div>

          {/* Top Apps */}
          {report.topApps && report.topApps.length > 0 && (
            <div className="mt-5">
              <h3 className="text-xs font-medium text-foreground mb-2 font-mono">{t('results.top_apps')}</h3>
              <div className="glass-panel rounded-lg p-3 space-y-1.5">
                {report.topApps.slice(0, 10).map((app, i) => (
                  <div key={app.bundleId} className="flex items-center gap-2">
                    <span className="text-[10px] text-muted-foreground font-mono w-4 text-right">{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] text-foreground truncate font-mono">{app.bundleId}</p>
                    </div>
                    <span className="text-[10px] text-muted-foreground font-mono">{app.hits}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
}
