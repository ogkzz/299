import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import {
  Shield, Wifi, Server, Globe, Search, FileWarning, Clock,
  Smartphone, Fingerprint, Activity, Lock, Layers, Eye, Zap, AlertTriangle, Database
} from "lucide-react";

const features = [
  { icon: Shield, title: "Detecção de VPN/Proxy", desc: "Identifica mais de 30 aplicativos conhecidos de VPN, proxy e túnel instalados ou ativos no dispositivo." },
  { icon: Server, title: "IPs de Datacenter/VPS", desc: "Detecta IPs pertencentes a provedores de hospedagem, cloud e VPS como AWS, DigitalOcean, OVH." },
  { icon: Globe, title: "Análise de ASN", desc: "Verifica ASNs suspeitos associados a provedores de hosting e infraestrutura cloud." },
  { icon: Search, title: "Análise de Domínios", desc: "Identifica domínios com palavras-chave suspeitas como proxy, vpn, tunnel, mitm, relay, bypass." },
  { icon: AlertTriangle, title: "TLDs de Alto Risco", desc: "Detecta domínios usando TLDs frequentemente associados a serviços maliciosos (.xyz, .site, .store)." },
  { icon: Fingerprint, title: "Fingerprint de Servidor", desc: "Analisa headers HTTP e padrões de servidor como nginx, apache, cloud, ubuntu." },
  { icon: Eye, title: "Detecção de MITM", desc: "Identifica padrões de interceptação de tráfego e certificados suspeitos." },
  { icon: Clock, title: "Correlação Temporal", desc: "Detecta uso de proxy/VPN antes de login ou durante sessões críticas de jogos." },
  { icon: Activity, title: "Análise de Atividade", desc: "Monitora a última atividade de aplicativos e correlaciona com eventos suspeitos." },
  { icon: Smartphone, title: "Atividade App Store", desc: "Identifica abertura da App Store após eventos suspeitos, indicando instalação de ferramentas." },
  { icon: FileWarning, title: "Integridade do Arquivo", desc: "Detecta arquivos antigos, incompletos, manipulados ou com estrutura inconsistente." },
  { icon: Layers, title: "Correlação Cruzada", desc: "Sistema de correlação de múltiplos indicadores (IP, ASN, DNS, comportamento) para reduzir falsos positivos." },
  { icon: Zap, title: "Heurística Temporal", desc: "Detecta mudanças rápidas de IP, sessões inconsistentes e padrões de evasão." },
  { icon: Database, title: "Score Dinâmico", desc: "Sistema de pontuação de risco dinâmico baseado em múltiplos fatores ao invés de regras fixas." },
  { icon: Lock, title: "Anti-Manipulação", desc: "Proteção contra arquivos modificados manualmente com validação profunda de estrutura." },
  { icon: Wifi, title: "Fingerprint de Rede", desc: "Análise indireta de rede baseada em padrões de requisições e domínios acessados." },
];

export default function Features() {
  return (
    <div className="min-h-screen bg-background grid-pattern">
      <Navbar />
      <main className="container mx-auto px-6 pt-28 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold gradient-text mb-3">Funcionalidades</h1>
          <p className="text-muted-foreground max-w-lg mx-auto">
            16 módulos de detecção independentes trabalhando em conjunto para uma análise completa.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="glass-panel glass-hover rounded-xl p-5"
            >
              <f.icon className="w-5 h-5 text-muted-foreground mb-3" />
              <h3 className="text-sm font-medium text-foreground mb-1">{f.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </main>
    </div>
  );
}
