// Blacklist management (local storage for now, ready for backend migration)

import type { AnalysisReport } from './analyzer';
import type { NetworkEvent } from './network-monitor';

export interface BlacklistEntry {
  id: string;
  deviceIP: string;
  deviceModel: string;
  serial: string;
  reason: string;
  riskScore: number;
  bannedAt: string;
  findings: string[];
  networkEvents: NetworkEvent[];
  ipInfo: {
    isp: string;
    country: string;
    city: string;
    proxy: boolean;
    hosting: boolean;
    vpn: boolean;
  } | null;
}

const STORAGE_KEY = 'scanner299_blacklist';

export function getBlacklist(): BlacklistEntry[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function addToBlacklist(
  report: AnalysisReport,
  networkEvents: NetworkEvent[],
  deviceModel: string
): BlacklistEntry {
  const entry: BlacklistEntry = {
    id: `bl_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    deviceIP: report.deviceIP,
    deviceModel: deviceModel || 'Unknown iPhone',
    serial: `${report.deviceIP.replace(/\./g, '')}_${Date.now()}`,
    reason: report.results
      .filter(r => r.category === 'confirmed')
      .map(r => r.title)
      .join('; ') || 'Multiple irregularities detected',
    riskScore: report.riskScore,
    bannedAt: new Date().toISOString(),
    findings: report.results
      .filter(r => r.category === 'confirmed' || r.category === 'suspect')
      .map(r => `[${r.category.toUpperCase()}] ${r.title}: ${r.description}`),
    networkEvents,
    ipInfo: report.ipInfo ? {
      isp: report.ipInfo.isp,
      country: report.ipInfo.country,
      city: report.ipInfo.city,
      proxy: report.ipInfo.proxy,
      hosting: report.ipInfo.hosting,
      vpn: report.ipInfo.vpn,
    } : null,
  };

  const list = getBlacklist();
  list.push(entry);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch {}

  return entry;
}

export function removeFromBlacklist(id: string): void {
  const list = getBlacklist().filter(e => e.id !== id);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch {}
}

export function shouldAutoBlacklist(report: AnalysisReport, networkEvents: NetworkEvent[]): boolean {
  const confirmedCount = report.results.filter(r => r.category === 'confirmed').length;
  const hasIPChange = networkEvents.some(e => e.type === 'ip_change');
  const hasNetworkSwitch = networkEvents.some(e => e.type === 'connection_change');
  
  // Auto-blacklist if: risk score >= 70, or 3+ confirmed, or IP changed during scan
  return report.riskScore >= 70 || confirmedCount >= 3 || (hasIPChange && confirmedCount >= 1) || (hasNetworkSwitch && confirmedCount >= 1);
}

export function exportBlacklist(list: BlacklistEntry[]): string {
  return JSON.stringify(list, null, 2);
}
