import { motion } from "framer-motion";
import { Shield, Activity, AlertTriangle, CheckCircle } from "lucide-react";

export default function DashboardPreview() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6, duration: 0.8 }}
      className="glass-panel rounded-2xl p-6 animate-pulse-glow"
    >
      <div className="flex items-center gap-2 mb-6">
        <Activity className="w-4 h-4 text-muted-foreground" />
        <span className="text-xs text-muted-foreground uppercase tracking-wider">Preview do Dashboard</span>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { icon: CheckCircle, label: "Limpo", value: "12", cls: "status-clean" },
          { icon: AlertTriangle, label: "Suspeito", value: "3", cls: "status-suspect" },
          { icon: Shield, label: "Confirmado", value: "1", cls: "status-confirmed" },
        ].map((item, i) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 + i * 0.1 }}
            className="glass-panel rounded-xl p-4 text-center"
          >
            <item.icon className={`w-5 h-5 mx-auto mb-2 ${item.cls}`} />
            <div className={`text-2xl font-semibold ${item.cls}`}>{item.value}</div>
            <div className="text-xs text-muted-foreground mt-1">{item.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Fake scan bars */}
      <div className="space-y-3">
        {[85, 60, 40, 90, 25].map((width, i) => (
          <motion.div
            key={i}
            initial={{ width: 0 }}
            animate={{ width: `${width}%` }}
            transition={{ delay: 1 + i * 0.15, duration: 0.6 }}
            className="h-2 rounded-full bg-foreground/10"
          >
            <div
              className="h-full rounded-full"
              style={{
                width: "100%",
                background: width > 70
                  ? "hsl(var(--status-clean))"
                  : width > 40
                  ? "hsl(var(--status-suspect))"
                  : "hsl(var(--status-confirmed))",
                opacity: 0.6,
              }}
            />
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
