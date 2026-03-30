// Blacklist management — persisted in Supabase with server-side password validation

import { supabase } from "@/integrations/supabase/client";
import type { AnalysisReport } from './analyzer';
import type { NetworkEvent } from './network-monitor';

export interface BlacklistEntry {
  id: string;
  device_ip: string;
  device_model: string;
  serial: string;
  reason: string;
  risk_score: number;
  banned_at: string;
  findings: string[];
  network_events: NetworkEvent[];
  ip_info: {
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
  action: string;
  target_id: string | null;
  target_ip: string;
  success: boolean;
  created_at: string;
}

export async function getBlacklist(): Promise<BlacklistEntry[]> {
  const { data, error } = await supabase
    .from('blacklist')
    .select('*')
    .order('banned_at', { ascending: false });
  
  if (error || !data) return [];
  return data.map(row => ({
    id: row.id,
    device_ip: row.device_ip,
    device_model: row.device_model,
    serial: row.serial,
    reason: row.reason,
    risk_score: row.risk_score,
    banned_at: row.banned_at,
    findings: (row.findings as unknown as string[]) || [],
    network_events: (row.network_events as unknown as NetworkEvent[]) || [],
    ip_info: row.ip_info as BlacklistEntry['ip_info'],
  }));
}

export async function getAuditLog(): Promise<AuditLogEntry[]> {
  const { data, error } = await supabase
    .from('blacklist_audit_log')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100);
  
  if (error || !data) return [];
  return data as AuditLogEntry[];
}

export async function addToBlacklist(
  report: AnalysisReport,
  networkEvents: NetworkEvent[],
  deviceModel: string
): Promise<BlacklistEntry | null> {
  const entry = {
    device_ip: report.deviceIP,
    device_model: deviceModel || 'Unknown iPhone',
    serial: `${report.deviceIP.replace(/\./g, '')}_${Date.now()}`,
    reason: report.results
      .filter(r => r.category === 'confirmed')
      .map(r => r.title)
      .join('; ') || 'Multiple irregularities detected',
    risk_score: report.riskScore,
    findings: report.results
      .filter(r => r.category === 'confirmed' || r.category === 'suspect')
      .map(r => `[${r.category.toUpperCase()}] ${r.title}: ${r.description}`),
    network_events: networkEvents as unknown as Record<string, unknown>[],
    ip_info: report.ipInfo ? {
      isp: report.ipInfo.isp,
      country: report.ipInfo.country,
      city: report.ipInfo.city,
      proxy: report.ipInfo.proxy,
      hosting: report.ipInfo.hosting,
      vpn: report.ipInfo.vpn,
    } : null,
  };

  const { data, error } = await supabase
    .from('blacklist')
    .insert(entry as any)
    .select()
    .single();
  
  if (error || !data) return null;
  return {
    ...data,
    findings: (data.findings as unknown as string[]) || [],
    network_events: (data.network_events as unknown as NetworkEvent[]) || [],
    ip_info: data.ip_info as BlacklistEntry['ip_info'],
  };
}

export async function removeFromBlacklist(id: string, password: string): Promise<boolean> {
  try {
    const res = await supabase.functions.invoke('blacklist-remove', {
      body: { id, password },
    });
    return res.data?.success === true;
  } catch {
    return false;
  }
}

export function shouldAutoBlacklist(report: AnalysisReport, networkEvents: NetworkEvent[]): boolean {
  const confirmedCount = report.results.filter(r => r.category === 'confirmed').length;
  const hasIPChange = networkEvents.some(e => e.type === 'ip_change');
  const hasNetworkSwitch = networkEvents.some(e => e.type === 'connection_change');
  
  return report.riskScore >= 70 || confirmedCount >= 3 || (hasIPChange && confirmedCount >= 1) || (hasNetworkSwitch && confirmedCount >= 1);
}
