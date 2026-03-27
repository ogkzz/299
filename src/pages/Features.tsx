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
    { icon: Shield, title: "VPN/Proxy Detection", desc: "30+ known VPN, proxy and tunnel apps detected via bundle ID + keyword matching." },
    { icon: Radio, title: "IPA Sideload Detection", desc: "KSign, ESign, GBox, AltStore, TrollStore, Scarlet — detects sideloading tools and domains." },
    { icon: Server, title: "Datacenter/VPS IPs", desc: "Detects IPs from AWS, DigitalOcean, OVH, Hetzner and 20+ hosting providers." },
    { icon: Globe, title: "ASN Analysis", desc: "Verifies ASNs against known hosting and cloud infrastructure providers." },
    { icon: Search, title: "Domain Analysis", desc: "Pattern matching on proxy, vpn, tunnel, mitm, relay, bypass keywords in domains." },
    { icon: AlertTriangle, title: "High-Risk TLDs", desc: "Flags domains using .xyz, .top, .click, .link, .club and other high-risk TLDs." },
    { icon: Fingerprint, title: "rDNS Fingerprint", desc: "Reverse DNS analysis detecting server/VPS/cloud patterns in hostnames." },
    { icon: Eye, title: "Proxy 2.0 Detection", desc: "Multi-layer proxy detection: IP API + ASN + rDNS + behavioral cross-correlation." },
    { icon: Clock, title: "Temporal Correlation", desc: "Detects VPN/proxy activation within 30 minutes of game sessions (Free Fire, PUBG)." },
    { icon: Activity, title: "Network Monitor", desc: "Real-time tracking of IP changes, network type switches and offline events during scan." },
    { icon: Smartphone, title: "App Store Behavior", desc: "Detects App Store access before game sessions — possible cheat download indicator." },
    { icon: FileWarning, title: "File Integrity", desc: "Validates timestamps, detects gaps, future dates, and inconsistent report periods." },
    { icon: Layers, title: "Cross-Correlation", desc: "Multi-indicator scoring reduces false positives — requires 3+ confirming signals." },
    { icon: Zap, title: "Anti-Evasion", desc: "Detects network switching, IP rotation and connection changes during analysis." },
    { icon: Database, title: "Dynamic Scoring", desc: "Weighted risk scoring based on severity, cross-correlation and multiple confirmed findings." },
    { icon: Cpu, title: "Sysdiagnose Analysis", desc: "Deep iOS log analysis for process execution, installed profiles and unsigned apps." },
    { icon: Lock, title: "Anti-Tamper", desc: "File structure validation, encoding checks and manipulation detection." },
    { icon: Wifi, title: "Network Forensics", desc: "Indirect network fingerprinting based on domain access patterns and request behavior." },
  ];

  return (
    <div className="min-h-screen bg-background grid-pattern">
      <Navbar />
      <main className="container mx-auto px-4 sm:px-6 pt-20 pb-16">
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold gradient-text mb-2">{t('nav.features')}</h1>
          <p className="text-xs text-muted-foreground max-w-md mx-auto">
            18 detection modules working in parallel for comprehensive forensic analysis.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2 max-w-4xl mx-auto">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.025 }}
              className="glass-panel glass-hover rounded-lg p-3.5"
            >
              <f.icon className="w-4 h-4 text-primary/60 mb-2" />
              <h3 className="text-xs font-semibold text-foreground mb-0.5">{f.title}</h3>
              <p className="text-[10px] text-muted-foreground leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </main>
    </div>
  );
}
