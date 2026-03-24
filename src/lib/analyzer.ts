// iOS App Privacy Report Analyzer Engine

export interface PrivacyReportEntry {
  domain?: string;
  firstAccess?: string;
  lastAccess?: string;
  owner?: string;
  context?: string;
  domainType?: number;
  initiatedType?: string;
  hits?: number;
  type?: string;
  bundleID?: string;
  timeStamp?: string;
  accessor?: { identifier: string; identifierType: string };
  category?: string;
  networkActivity?: Array<{
    domain: string;
    firstAccess: string;
    context: string;
    domainType: number;
    initiatedType: string;
    hits: number;
    owner?: string;
    domainOwner?: string;
    bundleID?: string;
  }>;
}

export interface AnalysisResult {
  id: string;
  category: 'suspect' | 'confirmed' | 'clean';
  title: string;
  description: string;
  evidence: string[];
  severity: number; // 1-10
  timestamp?: string;
  module: string;
}

export interface AnalysisReport {
  deviceIP: string;
  totalEntries: number;
  analysisDate: string;
  reportPeriod: { start: string; end: string };
  riskScore: number;
  results: AnalysisResult[];
  summary: {
    clean: number;
    suspect: number;
    confirmed: number;
  };
  appsAnalyzed: number;
  domainsAnalyzed: number;
}

const VPN_PROXY_APPS = [
  'com.nordvpn', 'com.expressvpn', 'com.surfshark', 'com.privateinternetaccess',
  'com.hotspotshield', 'com.tunnelbear', 'com.windscribe', 'com.protonvpn',
  'com.cyberghostvpn', 'com.ipvanish', 'com.purevpn', 'com.strongvpn',
  'com.vypr', 'com.mullvad', 'com.hide.me', 'com.zenmate',
  'org.torproject', 'com.psiphon3', 'com.cloudflare.onedotoneapp',
  'com.shadowsocks', 'com.v2ray', 'com.wireguard', 'com.openvpn',
  'com.ultrasurf', 'com.lantern', 'com.betternet', 'com.speedify',
  'com.aloha', 'com.x-vpn', 'com.thunder', 'com.snap.vpn',
];

const SUSPICIOUS_DOMAINS_KEYWORDS = [
  'proxy', 'vpn', 'tunnel', 'mitm', 'relay', 'bypass', 'socks',
  'tor', 'onion', 'anonymo', 'hide', 'mask', 'spoof', 'intercept',
  'inject', 'sniff', 'hack', 'cheat', 'mod', 'crack',
];

const HIGH_RISK_TLDS = [
  '.xyz', '.site', '.store', '.top', '.click', '.link', '.club',
  '.online', '.fun', '.icu', '.buzz', '.surf', '.gq', '.ml', '.tk', '.cf',
];

const DATACENTER_ASN_KEYWORDS = [
  'amazon', 'aws', 'google cloud', 'gcp', 'azure', 'microsoft',
  'digitalocean', 'linode', 'vultr', 'ovh', 'hetzner', 'contabo',
  'hostinger', 'godaddy', 'cloudflare', 'akamai', 'fastly',
  'rackspace', 'leaseweb', 'choopa', 'datacamp',
];

const SERVER_FINGERPRINTS = [
  'nginx', 'apache', 'ubuntu', 'debian', 'centos', 'cloud',
  'vps', 'dedicated', 'server', 'hosting',
];

const FREEFIRE_DOMAINS = [
  'garena', 'freefire', 'ff.garena', 'booyah', 'shopee',
];

function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

function parseReportData(raw: string): PrivacyReportEntry[] {
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed;
    if (parsed.networkActivity) return parsed.networkActivity;
    if (parsed.entries) return parsed.entries;
    // NDJSON fallback
    return raw.split('\n').filter(l => l.trim()).map(l => JSON.parse(l));
  } catch {
    // Try NDJSON
    const lines = raw.split('\n').filter(l => l.trim());
    if (lines.length > 0) {
      return lines.map(l => {
        try { return JSON.parse(l); } catch { return null; }
      }).filter(Boolean) as PrivacyReportEntry[];
    }
    throw new Error('Formato de arquivo inválido');
  }
}

function analyzeVPNApps(entries: PrivacyReportEntry[]): AnalysisResult[] {
  const results: AnalysisResult[] = [];
  const bundleIds = new Set<string>();

  entries.forEach(e => {
    const bid = e.bundleID || e.accessor?.identifier || '';
    if (bid) bundleIds.add(bid.toLowerCase());
    e.networkActivity?.forEach(na => {
      if (na.bundleID) bundleIds.add(na.bundleID.toLowerCase());
    });
  });

  VPN_PROXY_APPS.forEach(app => {
    const found = [...bundleIds].find(b => b.includes(app.replace('com.', '')));
    if (found) {
      results.push({
        id: generateId(),
        category: 'confirmed',
        title: `App de VPN/Proxy detectado: ${found}`,
        description: `O aplicativo ${found} é conhecido como ferramenta de VPN, proxy ou túnel. Sua presença indica uso ativo de anonimização de tráfego.`,
        evidence: [`Bundle ID: ${found}`, `Match: ${app}`],
        severity: 9,
        module: 'VPN/Proxy Apps',
      });
    }
  });

  return results;
}

function analyzeSuspiciousDomains(entries: PrivacyReportEntry[]): AnalysisResult[] {
  const results: AnalysisResult[] = [];
  const domains = new Set<string>();

  entries.forEach(e => {
    if (e.domain) domains.add(e.domain.toLowerCase());
    e.networkActivity?.forEach(na => {
      if (na.domain) domains.add(na.domain.toLowerCase());
    });
  });

  domains.forEach(domain => {
    // Keyword check
    const matchedKeywords = SUSPICIOUS_DOMAINS_KEYWORDS.filter(kw => domain.includes(kw));
    if (matchedKeywords.length > 0) {
      results.push({
        id: generateId(),
        category: matchedKeywords.length >= 2 ? 'confirmed' : 'suspect',
        title: `Domínio suspeito: ${domain}`,
        description: `O domínio contém palavras-chave associadas a proxy/VPN/interceptação: ${matchedKeywords.join(', ')}`,
        evidence: [`Domínio: ${domain}`, `Keywords: ${matchedKeywords.join(', ')}`],
        severity: matchedKeywords.length >= 2 ? 8 : 5,
        module: 'Análise de Domínios',
      });
    }

    // High risk TLD
    const riskyTld = HIGH_RISK_TLDS.find(tld => domain.endsWith(tld));
    if (riskyTld) {
      results.push({
        id: generateId(),
        category: 'suspect',
        title: `TLD de alto risco: ${domain}`,
        description: `O domínio utiliza o TLD ${riskyTld}, frequentemente associado a serviços maliciosos ou temporários.`,
        evidence: [`Domínio: ${domain}`, `TLD: ${riskyTld}`],
        severity: 4,
        module: 'Análise de TLD',
      });
    }
  });

  return results;
}

function analyzeTemporalPatterns(entries: PrivacyReportEntry[]): AnalysisResult[] {
  const results: AnalysisResult[] = [];
  const timestamps: { domain: string; time: Date; bundleId?: string }[] = [];

  entries.forEach(e => {
    const ts = e.timeStamp || e.firstAccess || e.lastAccess;
    if (ts) {
      timestamps.push({ domain: e.domain || '', time: new Date(ts), bundleId: e.bundleID });
    }
    e.networkActivity?.forEach(na => {
      if (na.firstAccess) {
        timestamps.push({ domain: na.domain, time: new Date(na.firstAccess), bundleId: na.bundleID });
      }
    });
  });

  timestamps.sort((a, b) => a.time.getTime() - b.time.getTime());

  // Check for VPN usage before game sessions
  for (let i = 0; i < timestamps.length - 1; i++) {
    const current = timestamps[i];
    const next = timestamps[i + 1];
    
    const isVpnDomain = SUSPICIOUS_DOMAINS_KEYWORDS.some(kw => current.domain.includes(kw));
    const isGameDomain = FREEFIRE_DOMAINS.some(d => next.domain.includes(d));
    
    if (isVpnDomain && isGameDomain) {
      const timeDiff = (next.time.getTime() - current.time.getTime()) / 1000 / 60;
      if (timeDiff <= 10) {
        results.push({
          id: generateId(),
          category: 'confirmed',
          title: 'Proxy/VPN usado antes de sessão de jogo',
          description: `Atividade de proxy/VPN detectada ${Math.round(timeDiff)} minutos antes de acesso a domínio de jogo. Correlação temporal forte.`,
          evidence: [
            `Domínio suspeito: ${current.domain} às ${current.time.toISOString()}`,
            `Domínio de jogo: ${next.domain} às ${next.time.toISOString()}`,
            `Intervalo: ${Math.round(timeDiff)} minutos`,
          ],
          severity: 10,
          timestamp: current.time.toISOString(),
          module: 'Correlação Temporal',
        });
      }
    }
  }

  // Check rapid IP/domain changes
  const windowSize = 5 * 60 * 1000; // 5 minutes
  const uniqueDomainsPerWindow: Map<string, Set<string>> = new Map();
  
  timestamps.forEach(ts => {
    const windowKey = Math.floor(ts.time.getTime() / windowSize).toString();
    if (!uniqueDomainsPerWindow.has(windowKey)) {
      uniqueDomainsPerWindow.set(windowKey, new Set());
    }
    uniqueDomainsPerWindow.get(windowKey)!.add(ts.domain);
  });

  uniqueDomainsPerWindow.forEach((domains, _window) => {
    const suspiciousCount = [...domains].filter(d => 
      SUSPICIOUS_DOMAINS_KEYWORDS.some(kw => d.includes(kw))
    ).length;
    if (suspiciousCount >= 3) {
      results.push({
        id: generateId(),
        category: 'suspect',
        title: 'Atividade suspeita concentrada',
        description: `${suspiciousCount} domínios suspeitos acessados em janela de 5 minutos, indicando possível configuração de proxy/tunnel.`,
        evidence: [`Domínios suspeitos na janela: ${suspiciousCount}`],
        severity: 7,
        module: 'Análise Temporal',
      });
    }
  });

  return results;
}

function analyzeFileIntegrity(entries: PrivacyReportEntry[], rawContent: string): AnalysisResult[] {
  const results: AnalysisResult[] = [];

  // Check if file seems too small
  if (entries.length < 3) {
    results.push({
      id: generateId(),
      category: 'suspect',
      title: 'Arquivo com poucos registros',
      description: 'O relatório contém muito poucos registros, o que pode indicar manipulação ou exportação incompleta.',
      evidence: [`Total de entradas: ${entries.length}`],
      severity: 6,
      module: 'Integridade do Arquivo',
    });
  }

  // Check for timestamp consistency
  const allTimestamps: Date[] = [];
  entries.forEach(e => {
    const ts = e.timeStamp || e.firstAccess || e.lastAccess;
    if (ts) allTimestamps.push(new Date(ts));
  });

  if (allTimestamps.length > 0) {
    allTimestamps.sort((a, b) => a.getTime() - b.getTime());
    const oldest = allTimestamps[0];
    const newest = allTimestamps[allTimestamps.length - 1];
    const daysDiff = (newest.getTime() - oldest.getTime()) / (1000 * 60 * 60 * 24);

    if (daysDiff > 14) {
      results.push({
        id: generateId(),
        category: 'suspect',
        title: 'Período do relatório muito extenso',
        description: `O relatório cobre ${Math.round(daysDiff)} dias, o que pode indicar dados acumulados ou combinados de múltiplas exportações.`,
        evidence: [
          `Primeiro registro: ${oldest.toISOString()}`,
          `Último registro: ${newest.toISOString()}`,
          `Período: ${Math.round(daysDiff)} dias`,
        ],
        severity: 3,
        module: 'Integridade do Arquivo',
      });
    }
  }

  // Check for duplicate entries (possible manipulation)
  const seen = new Map<string, number>();
  entries.forEach(e => {
    const key = `${e.domain}-${e.timeStamp || e.firstAccess}-${e.bundleID}`;
    seen.set(key, (seen.get(key) || 0) + 1);
  });

  const duplicates = [...seen.entries()].filter(([_, count]) => count > 3);
  if (duplicates.length > 5) {
    results.push({
      id: generateId(),
      category: 'suspect',
      title: 'Entradas duplicadas detectadas',
      description: 'Múltiplas entradas duplicadas encontradas, o que pode indicar manipulação do arquivo.',
      evidence: [`Entradas com mais de 3 duplicatas: ${duplicates.length}`],
      severity: 5,
      module: 'Integridade do Arquivo',
    });
  }

  return results;
}

function analyzeServerFingerprints(entries: PrivacyReportEntry[]): AnalysisResult[] {
  const results: AnalysisResult[] = [];
  const domains = new Set<string>();

  entries.forEach(e => {
    if (e.domain) domains.add(e.domain.toLowerCase());
    e.networkActivity?.forEach(na => {
      if (na.domain) domains.add(na.domain.toLowerCase());
    });
  });

  domains.forEach(domain => {
    const matches = SERVER_FINGERPRINTS.filter(fp => domain.includes(fp));
    if (matches.length > 0) {
      results.push({
        id: generateId(),
        category: 'suspect',
        title: `Possível servidor/datacenter: ${domain}`,
        description: `O domínio contém indicadores de infraestrutura de servidor: ${matches.join(', ')}`,
        evidence: [`Domínio: ${domain}`, `Fingerprints: ${matches.join(', ')}`],
        severity: 4,
        module: 'Fingerprint de Servidor',
      });
    }
  });

  return results;
}

function analyzeAppStoreActivity(entries: PrivacyReportEntry[]): AnalysisResult[] {
  const results: AnalysisResult[] = [];
  const timestamps: { domain: string; time: Date; isAppStore: boolean; isSuspicious: boolean }[] = [];

  entries.forEach(e => {
    const ts = e.timeStamp || e.firstAccess || e.lastAccess;
    if (!ts || !e.domain) return;
    const domain = e.domain.toLowerCase();
    timestamps.push({
      domain,
      time: new Date(ts),
      isAppStore: domain.includes('apple.com/app-store') || domain.includes('itunes.apple.com') || 
                  (e.bundleID || '').includes('com.apple.AppStore'),
      isSuspicious: SUSPICIOUS_DOMAINS_KEYWORDS.some(kw => domain.includes(kw)),
    });
  });

  timestamps.sort((a, b) => a.time.getTime() - b.time.getTime());

  for (let i = 0; i < timestamps.length - 1; i++) {
    if (timestamps[i].isSuspicious && timestamps[i + 1].isAppStore) {
      const diff = (timestamps[i + 1].time.getTime() - timestamps[i].time.getTime()) / 1000 / 60;
      if (diff <= 15) {
        results.push({
          id: generateId(),
          category: 'suspect',
          title: 'App Store acessada após atividade suspeita',
          description: `A App Store foi acessada ${Math.round(diff)} minutos após atividade de domínio suspeito, possivelmente para instalar/atualizar ferramenta.`,
          evidence: [
            `Domínio suspeito: ${timestamps[i].domain}`,
            `Acesso App Store: ${timestamps[i + 1].time.toISOString()}`,
          ],
          severity: 6,
          module: 'Atividade App Store',
        });
      }
    }
  }

  return results;
}

function calculateRiskScore(results: AnalysisResult[]): number {
  if (results.length === 0) return 0;
  
  const maxSeverity = Math.max(...results.map(r => r.severity));
  const confirmedCount = results.filter(r => r.category === 'confirmed').length;
  const suspectCount = results.filter(r => r.category === 'suspect').length;
  
  let score = 0;
  score += confirmedCount * 15;
  score += suspectCount * 5;
  score += maxSeverity * 3;
  
  return Math.min(100, Math.max(0, score));
}

export function analyzeReport(rawContent: string, deviceIP: string): AnalysisReport {
  const entries = parseReportData(rawContent);
  
  const allResults: AnalysisResult[] = [
    ...analyzeVPNApps(entries),
    ...analyzeSuspiciousDomains(entries),
    ...analyzeTemporalPatterns(entries),
    ...analyzeFileIntegrity(entries, rawContent),
    ...analyzeServerFingerprints(entries),
    ...analyzeAppStoreActivity(entries),
  ];

  // Deduplicate by title
  const uniqueResults = allResults.filter((r, i, arr) => 
    arr.findIndex(x => x.title === r.title) === i
  );

  // Sort by severity
  uniqueResults.sort((a, b) => b.severity - a.severity);

  // If nothing found, add clean result
  if (uniqueResults.length === 0) {
    uniqueResults.push({
      id: generateId(),
      category: 'clean',
      title: 'Nenhuma atividade suspeita detectada',
      description: 'A análise não identificou indicadores de proxy, VPN, túnel ou interceptação de tráfego.',
      evidence: ['Todas as verificações passaram sem alertas'],
      severity: 0,
      module: 'Resultado Geral',
    });
  }

  const allTimestamps: Date[] = [];
  entries.forEach(e => {
    const ts = e.timeStamp || e.firstAccess || e.lastAccess;
    if (ts) allTimestamps.push(new Date(ts));
  });
  allTimestamps.sort((a, b) => a.getTime() - b.getTime());

  const domains = new Set<string>();
  const apps = new Set<string>();
  entries.forEach(e => {
    if (e.domain) domains.add(e.domain);
    if (e.bundleID) apps.add(e.bundleID);
    e.networkActivity?.forEach(na => {
      if (na.domain) domains.add(na.domain);
      if (na.bundleID) apps.add(na.bundleID);
    });
  });

  return {
    deviceIP,
    totalEntries: entries.length,
    analysisDate: new Date().toISOString(),
    reportPeriod: {
      start: allTimestamps[0]?.toISOString() || 'N/A',
      end: allTimestamps[allTimestamps.length - 1]?.toISOString() || 'N/A',
    },
    riskScore: calculateRiskScore(uniqueResults),
    results: uniqueResults,
    summary: {
      clean: uniqueResults.filter(r => r.category === 'clean').length,
      suspect: uniqueResults.filter(r => r.category === 'suspect').length,
      confirmed: uniqueResults.filter(r => r.category === 'confirmed').length,
    },
    appsAnalyzed: apps.size,
    domainsAnalyzed: domains.size,
  };
}
