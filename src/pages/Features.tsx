import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import { useI18n } from "@/lib/i18n";
import {
  Shield, Wifi, Server, Globe, Search, FileWarning, Clock,
  Smartphone, Fingerprint, Activity, Lock, Layers, Eye, Zap, AlertTriangle, Database, Radio, Cpu
} from "lucide-react";

export default function Features() {
  const { t } = useI18n();

  const features = [
    { icon: Shield, title: "VPN/Proxy Detection", desc: "30+ known VPN, proxy and tunnel apps detected via bundle ID + keyword matching.", color: "text-blue-400" },
    { icon: Radio, title: "IPA Sideload Detection", desc: "KSign, ESign, GBox, AltStore, TrollStore, Scarlet — detects sideloading tools and domains.", color: "text-red-400" },
    { icon: Server, title: "Datacenter/VPS IPs", desc: "Detects IPs from AWS, DigitalOcean, OVH, Hetzner and 20+ hosting providers.", color: "text-amber-400" },
    { icon: Globe, title: "ASN Analysis", desc: "Verifies ASNs against known hosting and cloud infrastructure providers.", color: "text-cyan-400" },
    { icon: Search, title: "Domain Analysis", desc: "Pattern matching on proxy, vpn, tunnel, mitm, relay keywords in domains.", color: "text-emerald-400" },
    { icon: AlertTriangle, title: "High-Risk TLDs", desc: "Flags domains using .xyz, .top, .click and other high-risk TLDs with persistent access.", color: "text-orange-400" },
    { icon: Fingerprint, title: "rDNS Fingerprint", desc: "Reverse DNS analysis detecting server/VPS/cloud patterns in hostnames.", color: "text-violet-400" },
    { icon: Eye, title: "Proxy 2.0 Detection", desc: "Multi-layer proxy detection: IP API + ASN + rDNS + behavioral cross-correlation.", color: "text-blue-300" },
    { icon: Clock, title: "Temporal Correlation", desc: "Detects VPN/proxy activation within 30 minutes of game sessions.", color: "text-pink-400" },
    { icon: Activity, title: "Network Monitor", desc: "Real-time tracking of IP changes, network type switches during scan.", color: "text-green-400" },
    { icon: FileWarning, title: "File Integrity", desc: "Validates timestamps, detects gaps, future dates and inconsistent periods.", color: "text-yellow-400" },
    { icon: Layers, title: "Cross-Correlation", desc: "Multi-indicator scoring reduces false positives — requires 3+ confirming signals.", color: "text-indigo-400" },
    { icon: Zap, title: "Anti-Evasion", desc: "Detects network switching, IP rotation and connection changes during analysis.", color: "text-rose-400" },
    { icon: Database, title: "Dynamic Scoring", desc: "Weighted risk scoring based on severity, cross-correlation and confirmed findings.", color: "text-teal-400" },
    { icon: Cpu, title: "Sysdiagnose Analysis", desc: "Deep iOS log analysis for process execution and unsigned apps.", color: "text-purple-400" },
    { icon: Lock, title: "Anti-Tamper", desc: "File structure validation, encoding checks and manipulation detection.", color: "text-sky-400" },
    { icon: Wifi, title: "Network Forensics", desc: "Indirect network fingerprinting based on domain access patterns.", color: "text-lime-400" },
    { icon: Smartphone, title: "Device Profiling", desc: "IP type verification confirming mobile network vs datacenter origin.", color: "text-fuchsia-400" },
  ];

  return (
    <div className="min-h-screen bg-background grid-pattern">
      <Navbar />
      <main className="container mx-auto px-4 sm:px-6 pt-24 pb-16">
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold gradient-text mb-3">{t('nav.features')}</h1>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            18 detection modules working in parallel for comprehensive forensic analysis.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 max-w-4xl mx-auto">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.02 }}
              whileHover={{ y: -3, transition: { duration: 0.2 } }}
              className="glass-panel glass-hover rounded-xl p-4 group"
            >
              <div className="flex items-center gap-2.5 mb-2">
                <div className="w-8 h-8 rounded-lg bg-primary/5 border border-primary/10 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                  <f.icon className={`w-4 h-4 ${f.color}`} />
                </div>
                <h3 className="text-xs font-semibold text-foreground">{f.title}</h3>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </main>
    </div>
  );
}
