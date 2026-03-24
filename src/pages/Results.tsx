import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Download, Search, Shield, Clock, Globe, Smartphone, MapPin, Server, Wifi } from "lucide-react";
import Navbar from "@/components/Navbar";
import RiskGauge from "@/components/RiskGauge";
import ResultCard from "@/components/ResultCard";
import type { AnalysisReport } from "@/lib/analyzer";

export default function Results() {
  const navigate = useNavigate();
  const [report, setReport] = useState<AnalysisReport | null>(null);
  const [filter, setFilter] = useState<'all' | 'suspect' | 'confirmed' | 'clean'>('all');
  const [search, setSearch] = useState("");

  useEffect(() => {
    const data = sessionStorage.getItem("299_report");
    if (!data) {
      navigate("/");
      return;
    }
    try {
      setReport(JSON.parse(data));
    } catch {
      navigate("/");
    }
  }, [navigate]);

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
    try { return new Date(iso).toLocaleDateString('pt-BR'); } catch { return iso; }
  };

  return (
    <div className="min-h-screen bg-background grid-pattern">
      <Navbar />

      <main className="container mx-auto px-6 pt-28 pb-20">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="book-open">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Nova análise
            </button>
            <button
              onClick={() => {
                const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `299_report_${new Date().toISOString().split('T')[0]}.json`;
                a.click();
                URL.revokeObjectURL(url);
              }}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <Download className="w-4 h-4" /> Exportar
            </button>
          </div>

          {/* Risk Gauge + IP Info */}
          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <div className="glass-panel rounded-xl p-6 flex flex-col items-center justify-center">
              <RiskGauge score={report.riskScore} />
              <p className="text-xs text-muted-foreground mt-3">
                Score baseado em {report.results.length} verificações
              </p>
            </div>

            {report.ipInfo ? (
              <div className="glass-panel rounded-xl p-5 space-y-3">
                <div className="flex items-center gap-2 mb-2">
                  <Wifi className="w-4 h-4 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground uppercase tracking-wider">Inteligência de IP</span>
                </div>
                {[
                  { icon: Globe, label: "IP", value: report.ipInfo.ip },
                  { icon: MapPin, label: "Localização", value: `${report.ipInfo.city}, ${report.ipInfo.region}, ${report.ipInfo.country}` },
                  { icon: Server, label: "ISP", value: report.ipInfo.isp },
                  { icon: Shield, label: "ASN", value: report.ipInfo.as },
                  { icon: Wifi, label: "Tipo", value: [
                    report.ipInfo.mobile ? '📱 Móvel' : '🖥 Fixo',
                    report.ipInfo.proxy ? '🔴 Proxy/VPN' : '',
                    report.ipInfo.hosting ? '🔴 Hosting/DC' : '',
                  ].filter(Boolean).join(' · ') },
                ].map(item => (
                  <div key={item.label} className="flex items-start gap-2">
                    <item.icon className="w-3.5 h-3.5 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="text-xs text-muted-foreground">{item.label}: </span>
                      <span className="text-xs text-foreground">{item.value}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="glass-panel rounded-xl p-5 flex items-center justify-center">
                <p className="text-sm text-muted-foreground">IP não informado ou indisponível</p>
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            {[
              { icon: Clock, label: "Período", value: `${formatDate(report.reportPeriod.start)} - ${formatDate(report.reportPeriod.end)}` },
              { icon: Globe, label: "Domínios", value: report.domainsAnalyzed.toString() },
              { icon: Smartphone, label: "Apps", value: report.appsAnalyzed.toString() },
              { icon: Shield, label: "Entradas", value: report.totalEntries.toString() },
            ].map(item => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-panel rounded-xl p-3"
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <item.icon className="w-3 h-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">{item.label}</span>
                </div>
                <p className="text-xs font-medium text-foreground truncate">{item.value}</p>
              </motion.div>
            ))}
          </div>

          {/* Status summary filters */}
          <div className="grid grid-cols-3 gap-3 mb-5">
            {[
              { key: 'clean' as const, label: 'Limpo', count: report.summary.clean, cls: 'status-badge-clean' },
              { key: 'suspect' as const, label: 'Suspeito', count: report.summary.suspect, cls: 'status-badge-suspect' },
              { key: 'confirmed' as const, label: 'Confirmado', count: report.summary.confirmed, cls: 'status-badge-confirmed' },
            ].map(s => (
              <button
                key={s.key}
                onClick={() => setFilter(filter === s.key ? 'all' : s.key)}
                className={`rounded-xl p-3 text-center transition-all ${
                  filter === s.key ? `${s.cls} scale-[1.02]` : 'glass-panel glass-hover'
                }`}
              >
                <div className={`text-xl font-bold ${
                  s.key === 'clean' ? 'status-clean' :
                  s.key === 'suspect' ? 'status-suspect' : 'status-confirmed'
                }`}>{s.count}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{s.label}</div>
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="glass-panel rounded-xl p-3 mb-5 flex items-center gap-3">
            <Search className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            <input
              type="text"
              placeholder="Buscar nos resultados..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none min-w-0"
            />
            {search && (
              <span className="text-xs text-muted-foreground flex-shrink-0">{filteredResults.length}</span>
            )}
          </div>

          {/* Results */}
          <div className="space-y-2">
            {filteredResults.map((result, i) => (
              <ResultCard key={result.id} result={result} index={i} />
            ))}
            {filteredResults.length === 0 && (
              <div className="glass-panel rounded-xl p-8 text-center">
                <p className="text-sm text-muted-foreground">Nenhum resultado encontrado</p>
              </div>
            )}
          </div>

          {/* Top Apps */}
          {report.topApps && report.topApps.length > 0 && (
            <div className="mt-8">
              <h3 className="text-sm font-medium text-foreground mb-3">Top Apps por Atividade de Rede</h3>
              <div className="glass-panel rounded-xl p-4 space-y-2">
                {report.topApps.slice(0, 10).map((app, i) => (
                  <div key={app.bundleId} className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground w-5">{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-foreground truncate font-mono">{app.bundleId}</p>
                    </div>
                    <span className="text-xs text-muted-foreground">{app.hits} hits</span>
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
