import { useEffect, useRef, memo } from "react";
import { Terminal } from "lucide-react";

export interface LogEntry {
  time: string;
  level: 'info' | 'warn' | 'error' | 'success';
  message: string;
}

interface TerminalLogProps {
  logs: LogEntry[];
  title?: string;
  maxHeight?: string;
}

function TerminalLogComponent({ logs, title = "Scanner Log", maxHeight = "280px" }: TerminalLogProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs.length]);

  const levelPrefix: Record<string, string> = {
    info: '[INFO]',
    warn: '[WARN]',
    error: '[ERRO]',
    success: '[ OK ]',
  };

  const levelClass: Record<string, string> = {
    info: 'terminal-info',
    warn: 'terminal-warn',
    error: 'terminal-error',
    success: 'terminal-success',
  };

  return (
    <div className="terminal-panel rounded-lg overflow-hidden">
      <div className="flex items-center gap-2 px-3 py-2 border-b border-border bg-secondary/30">
        <Terminal className="w-3 h-3 text-primary" />
        <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">{title}</span>
        <span className="ml-auto text-[10px] font-mono text-muted-foreground">{logs.length} lines</span>
      </div>
      <div className="overflow-y-auto" style={{ maxHeight }}>
        {logs.map((log, i) => (
          <div key={i} className="terminal-line flex gap-2 items-start">
            <span className="terminal-timestamp text-[10px] flex-shrink-0 select-none">{log.time}</span>
            <span className={`text-[10px] flex-shrink-0 font-semibold ${levelClass[log.level]}`}>
              {levelPrefix[log.level]}
            </span>
            <span className={`text-[11px] ${log.level === 'error' ? 'terminal-error' : log.level === 'warn' ? 'terminal-warn' : log.level === 'success' ? 'terminal-success' : 'text-foreground/80'}`}>
              {log.message}
            </span>
          </div>
        ))}
        {logs.length > 0 && (
          <div className="terminal-line flex gap-1 items-center">
            <span className="terminal-success text-[11px]">▌</span>
            <span className="terminal-cursor terminal-success text-[11px]">_</span>
          </div>
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}

export default memo(TerminalLogComponent);
