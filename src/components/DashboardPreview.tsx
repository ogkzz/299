import { motion } from "framer-motion";
import { Shield, AlertTriangle, CheckCircle, Terminal } from "lucide-react";

export default function DashboardPreview() {
  const fakeLines = [
    { level: 'info', text: '[INFO] Magisk Scanner v2.0 initialized' },
    { level: 'success', text: '[ OK ] Report parsed: 847 entries' },
    { level: 'info', text: '[INFO] Running module: VPN/Proxy Detection...' },
    { level: 'warn', text: '[WARN] Suspicious domain: proxy-relay.xyz' },
    { level: 'success', text: '[ OK ] IP verified: 189.44.x.x (Mobile)' },
    { level: 'error', text: '[ERRO] DETECTED: Sideload tool (ESign)' },
    { level: 'info', text: '[INFO] Temporal correlation analysis...' },
    { level: 'success', text: '[ OK ] Analysis complete. Risk: 73/100' },
  ];

  const levelClass: Record<string, string> = {
    info: 'terminal-info',
    success: 'terminal-success',
    warn: 'terminal-warn',
    error: 'terminal-error',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.6 }}
      className="space-y-3"
    >
      {/* Mini stats */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { icon: CheckCircle, label: "Clean", value: "12", cls: "status-clean" },
          { icon: AlertTriangle, label: "Suspect", value: "3", cls: "status-suspect" },
          { icon: Shield, label: "Confirmed", value: "1", cls: "status-confirmed" },
        ].map((item, i) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 + i * 0.08 }}
            className="glass-panel rounded-lg p-3 text-center"
          >
            <item.icon className={`w-4 h-4 mx-auto mb-1.5 ${item.cls}`} />
            <div className={`text-lg font-bold ${item.cls}`}>{item.value}</div>
            <div className="text-[10px] text-muted-foreground">{item.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Fake terminal */}
      <div className="terminal-panel rounded-lg overflow-hidden animate-pulse-glow">
        <div className="flex items-center gap-2 px-3 py-1.5 border-b border-border bg-secondary/30">
          <Terminal className="w-3 h-3 text-primary" />
          <span className="text-[10px] font-mono text-muted-foreground">preview</span>
        </div>
        <div className="py-1">
          {fakeLines.map((line, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8 + i * 0.12 }}
              className="terminal-line"
            >
              <span className={`text-[10px] font-mono ${levelClass[line.level]}`}>{line.text}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
