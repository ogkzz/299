// Blacklist management with password-protected removal and audit logging

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

export interface AuditLogEntry {
  id: string;
  action: 'remove_attempt' | 'remove_success' | 'remove_denied';
  targetId: string;
  targetIP: string;
  timestamp: string;
  success: boolean;
}

const STORAGE_KEY = 'scanner299_blacklist';
const AUDIT_KEY = 'scanner299_audit_log';

// Obfuscated password verification (not plaintext in source)
// In production, this should be server-side validated
const _ph = [75,114,108,114,35,57,86,113,33,50,55,76,109,64,88,53,112,90];
function _vp(input: string): boolean {
  if (input.length !== _ph.length) return false;
  for (let i = 0; i < _ph.length; i++) {
    if (input.charCodeAt(i) !== _ph[i]) return false;
  }
  return true;
}

export function verifyBlacklistPassword(password: string): boolean {
  return _vp(password);
}

export function getBlacklist(): BlacklistEntry[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function getAuditLog(): AuditLogEntry[] {
  try {
    const data = localStorage.getItem(AUDIT_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function addAuditEntry(entry: Omit<AuditLogEntry, 'id' | 'timestamp'>): void {
  const log = getAuditLog();
  log.push({
    ...entry,
    id: `audit_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    timestamp: new Date().toISOString(),
  });
  try {
    localStorage.setItem(AUDIT_KEY, JSON.stringify(log));
  } catch {}
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

/**
 * Remove from blacklist with password verification and audit logging.
 * Returns true if removal succeeded, false if password was wrong.
 */
export function removeFromBlacklist(id: string, password: string): boolean {
  const list = getBlacklist();
  const target = list.find(e => e.id === id);
  const targetIP = target?.deviceIP || 'unknown';

  if (!verifyBlacklistPassword(password)) {
    addAuditEntry({
      action: 'remove_denied',
      targetId: id,
      targetIP,
      success: false,
    });
    return false;
  }

  const filtered = list.filter(e => e.id !== id);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch {}

  addAuditEntry({
    action: 'remove_success',
    targetId: id,
    targetIP,
    success: true,
  });
  return true;
}

export function shouldAutoBlacklist(report: AnalysisReport, networkEvents: NetworkEvent[]): boolean {
  const confirmedCount = report.results.filter(r => r.category === 'confirmed').length;
  const hasIPChange = networkEvents.some(e => e.type === 'ip_change');
  const hasNetworkSwitch = networkEvents.some(e => e.type === 'connection_change');
  
  return report.riskScore >= 70 || confirmedCount >= 3 || (hasIPChange && confirmedCount >= 1) || (hasNetworkSwitch && confirmedCount >= 1);
}

export function exportBlacklist(list: BlacklistEntry[]): string {
  return JSON.stringify(list, null, 2);
}
