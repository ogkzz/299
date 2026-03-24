import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Download, Search, Shield, Clock, Globe, Smartphone } from "lucide-react";
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
    setReport(JSON.parse(data));
  }, [navigate]);

  if (!report) return null;

  const filteredResults = report.results
    .filter(r => filter === 'all' || r.category === filter)
    .filter(r => !search || r.title.toLowerCase().includes(search.toLowerCase()) || r.description.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="min-h-screen bg-background grid-pattern">
      <Navbar />

      <main className="container mx-auto px-6 pt-28 pb-20">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="book-open"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
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
              }}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <Download className="w-4 h-4" /> Exportar
            </button>
          </div>

          {/* Summary Cards */}
          <div className="grid md:grid-cols-4 gap-4 mb-8">
            <div className="glass-panel rounded-xl p-6 flex flex-col items-center justify-center md:row-span-2">
              <RiskGauge score={report.riskScore} />
            </div>
            {[
              { icon: Clock, label: "Período", value: report.reportPeriod.start !== 'N/A' ? `${new Date(report.reportPeriod.start).toLocaleDateString()} - ${new Date(report.reportPeriod.end).toLocaleDateString()}` : 'N/A' },
              { icon: Globe, label: "Domínios analisados", value: report.domainsAnalyzed.toString() },
              { icon: Smartphone, label: "Apps analisados", value: report.appsAnalyzed.toString() },
              { icon: Shield, label: "IP do dispositivo", value: report.deviceIP },
            ].map((item, i) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.05 }}
                className="glass-panel rounded-xl p-4"
              >
                <div className="flex items-center gap-2 mb-1">
                  <item.icon className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">{item.label}</span>
                </div>
                <p className="text-sm font-medium text-foreground truncate">{item.value}</p>
              </motion.div>
            ))}
          </div>

          {/* Status summary */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            {[
              { key: 'clean' as const, label: 'Limpo', count: report.summary.clean, cls: 'status-badge-clean' },
              { key: 'suspect' as const, label: 'Suspeito', count: report.summary.suspect, cls: 'status-badge-suspect' },
              { key: 'confirmed' as const, label: 'Confirmado', count: report.summary.confirmed, cls: 'status-badge-confirmed' },
            ].map(s => (
              <button
                key={s.key}
                onClick={() => setFilter(filter === s.key ? 'all' : s.key)}
                className={`rounded-xl p-4 text-center transition-all ${
                  filter === s.key ? `${s.cls} scale-[1.02]` : 'glass-panel glass-hover'
                }`}
              >
                <div className={`text-2xl font-bold ${
                  s.key === 'clean' ? 'status-clean' :
                  s.key === 'suspect' ? 'status-suspect' : 'status-confirmed'
                }`}>{s.count}</div>
                <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="glass-panel rounded-xl p-3 mb-6 flex items-center gap-3">
            <Search className="w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar nos resultados..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
            />
            {search && (
              <span className="text-xs text-muted-foreground">{filteredResults.length} resultados</span>
            )}
          </div>

          {/* Results */}
          <div className="space-y-2">
            {filteredResults.map((result, i) => (
              <ResultCard key={result.id} result={result} index={i} />
            ))}
          </div>
        </motion.div>
      </main>
    </div>
  );
}
