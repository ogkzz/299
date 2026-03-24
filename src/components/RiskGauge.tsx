import { motion } from "framer-motion";

interface RiskGaugeProps {
  score: number;
}

export default function RiskGauge({ score }: RiskGaugeProps) {
  const getColor = () => {
    if (score <= 25) return "hsl(var(--status-clean))";
    if (score <= 60) return "hsl(var(--status-suspect))";
    return "hsl(var(--status-confirmed))";
  };

  const getLabel = () => {
    if (score <= 25) return "Baixo Risco";
    if (score <= 60) return "Risco Moderado";
    return "Alto Risco";
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative w-36 h-36">
        <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
          <circle cx="50" cy="50" r="42" fill="none" stroke="hsl(var(--border))" strokeWidth="6" />
          <motion.circle
            cx="50" cy="50" r="42" fill="none"
            stroke={getColor()}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 42}`}
            initial={{ strokeDashoffset: 2 * Math.PI * 42 }}
            animate={{ strokeDashoffset: 2 * Math.PI * 42 * (1 - score / 100) }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            className="text-3xl font-bold"
            style={{ color: getColor() }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            {score}
          </motion.span>
          <span className="text-xs text-muted-foreground">/100</span>
        </div>
      </div>
      <span className="text-sm font-medium" style={{ color: getColor() }}>
        {getLabel()}
      </span>
    </div>
  );
}
