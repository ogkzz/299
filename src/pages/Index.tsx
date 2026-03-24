import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Shield, Scan, Zap, Lock, ArrowRight, Wifi } from "lucide-react";
import Navbar from "@/components/Navbar";
import FileUpload from "@/components/FileUpload";
import DashboardPreview from "@/components/DashboardPreview";
import { analyzeReport } from "@/lib/analyzer";

export default function Index() {
  const navigate = useNavigate();
  const [deviceIP, setDeviceIP] = useState("");
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressStage, setProgressStage] = useState("");
  const [progressDetail, setProgressDetail] = useState("");

  const handleAnalyze = useCallback(async () => {
    if (!fileContent) return;
    setIsAnalyzing(true);
    setProgress(0);
    setProgressStage("Iniciando análise...");

    try {
      const report = await analyzeReport(fileContent, deviceIP, (stage, pct, detail) => {
        setProgressStage(stage);
        setProgress(pct);
        if (detail) setProgressDetail(detail);
      });

      sessionStorage.setItem("299_report", JSON.stringify(report));
      navigate("/results");
    } catch (err) {
      setIsAnalyzing(false);
      setProgressStage("");
      setProgress(0);
      alert(err instanceof Error ? err.message : "Erro ao analisar arquivo");
    }
  }, [fileContent, deviceIP, navigate]);

  return (
    <div className="min-h-screen bg-background grid-pattern">
      <Navbar />

      <main className="container mx-auto px-6 pt-28 pb-20">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-3xl mx-auto mb-12"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
            className="w-16 h-16 rounded-2xl bg-foreground/5 border border-border flex items-center justify-center mx-auto mb-6"
          >
            <Shield className="w-8 h-8 text-foreground" />
          </motion.div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight gradient-text mb-4">
            Scanner 299
          </h1>
          <p className="text-base md:text-lg text-muted-foreground max-w-xl mx-auto">
            Análise avançada de relatórios de privacidade do iOS com verificação de IP em tempo real via APIs de inteligência.
          </p>
        </motion.div>

        <div className="max-w-2xl mx-auto space-y-4 mb-16">
          <FileUpload onFileContent={setFileContent} isAnalyzing={isAnalyzing} />

          {/* IP Input */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-panel rounded-2xl p-5"
          >
            <div className="flex items-center gap-2 mb-2">
              <Wifi className="w-4 h-4 text-muted-foreground" />
              <label className="text-sm text-muted-foreground">
                IP do dispositivo analisado
              </label>
            </div>
            <input
              type="text"
              placeholder="Ex: 189.44.72.103"
              value={deviceIP}
              onChange={(e) => setDeviceIP(e.target.value)}
              className="w-full bg-secondary rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-ring transition-shadow"
            />
            <p className="text-xs text-muted-foreground mt-2">
              O IP será verificado em tempo real via API para detectar VPN, proxy, datacenter e geolocalização.
            </p>
          </motion.div>

          {/* Progress */}
          {isAnalyzing && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="glass-panel rounded-2xl p-5 space-y-3"
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
            </motion.div>
          )}

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
                Analisando em tempo real...
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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-4xl mx-auto mb-16">
          {[
            { icon: Scan, title: "8 Módulos", desc: "Análise completa multi-camada" },
            { icon: Zap, title: "Tempo Real", desc: "APIs de IP ao vivo" },
            { icon: Lock, title: "Privacidade", desc: "Processamento no navegador" },
            { icon: Wifi, title: "IP Intel", desc: "Verificação VPN/Proxy/DC" },
          ].map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + i * 0.1 }}
              className="glass-panel glass-hover rounded-xl p-4"
            >
              <f.icon className="w-5 h-5 text-muted-foreground mb-2" />
              <h3 className="text-xs font-medium text-foreground">{f.title}</h3>
              <p className="text-xs text-muted-foreground mt-0.5">{f.desc}</p>
            </motion.div>
          ))}
        </div>

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
