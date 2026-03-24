import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Shield, Scan, Zap, Lock, ArrowRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import FileUpload from "@/components/FileUpload";
import DashboardPreview from "@/components/DashboardPreview";
import { analyzeReport } from "@/lib/analyzer";
import type { AnalysisReport } from "@/lib/analyzer";

export default function Index() {
  const navigate = useNavigate();
  const [deviceIP, setDeviceIP] = useState("");
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleAnalyze = useCallback(() => {
    if (!fileContent) return;
    setIsAnalyzing(true);
    
    // Simulate processing delay for UX
    setTimeout(() => {
      const report = analyzeReport(fileContent, deviceIP || "N/A");
      setIsAnalyzing(false);
      // Store in sessionStorage for results page
      sessionStorage.setItem("299_report", JSON.stringify(report));
      navigate("/results");
    }, 2000);
  }, [fileContent, deviceIP, navigate]);

  return (
    <div className="min-h-screen bg-background grid-pattern">
      <Navbar />

      <main className="container mx-auto px-6 pt-28 pb-20">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
            className="w-16 h-16 rounded-2xl bg-foreground/5 border border-border flex items-center justify-center mx-auto mb-6"
          >
            <Shield className="w-8 h-8 text-foreground" />
          </motion.div>
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight gradient-text mb-4">
            Scanner 299
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Análise avançada de relatórios de privacidade do iOS. Detecte proxy, VPN, túneis e comportamentos anômalos em tempo real.
          </p>
        </motion.div>

        <div className="max-w-2xl mx-auto space-y-4 mb-16">
          {/* File Upload */}
          <FileUpload onFileContent={setFileContent} isAnalyzing={isAnalyzing} />

          {/* IP Input */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-panel rounded-2xl p-5"
          >
            <label className="text-sm text-muted-foreground block mb-2">
              IP do dispositivo (opcional)
            </label>
            <input
              type="text"
              placeholder="Ex: 189.44.72.103"
              value={deviceIP}
              onChange={(e) => setDeviceIP(e.target.value)}
              className="w-full bg-secondary rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-ring transition-shadow"
            />
          </motion.div>

          {/* Analyze Button */}
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            onClick={handleAnalyze}
            disabled={!fileContent || isAnalyzing}
            className="w-full bg-foreground text-background rounded-2xl py-4 px-6 font-medium text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {isAnalyzing ? (
              <>
                <div className="w-4 h-4 border-2 border-background/30 border-t-background rounded-full animate-spin" />
                Analisando...
              </>
            ) : (
              <>
                Iniciar Análise
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </motion.button>
        </div>

        {/* Features Mini */}
        <div className="grid md:grid-cols-3 gap-4 max-w-4xl mx-auto mb-16">
          {[
            { icon: Scan, title: "16+ Detecções", desc: "Proxy, VPN, MITM, datacenter e mais" },
            { icon: Zap, title: "Tempo Real", desc: "Análise completa em segundos" },
            { icon: Lock, title: "Privacidade", desc: "Dados processados localmente" },
          ].map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + i * 0.1 }}
              className="glass-panel glass-hover rounded-xl p-5"
            >
              <f.icon className="w-5 h-5 text-muted-foreground mb-3" />
              <h3 className="text-sm font-medium text-foreground">{f.title}</h3>
              <p className="text-xs text-muted-foreground mt-1">{f.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Dashboard Preview */}
        <div className="max-w-3xl mx-auto">
          <p className="text-center text-xs text-muted-foreground uppercase tracking-wider mb-4">
            Prévia dos resultados
          </p>
          <DashboardPreview />
        </div>
      </main>
    </div>
  );
}
