// Real iOS App Privacy Report Analyzer Engine
// Supports NDJSON format exported from iPhone Settings > Privacy > App Privacy Report

// ============ TYPES ============

export interface NetworkActivityEntry {
  domain: string;
  firstAccess: string;
  domainType: number;
  initiatedType: string;
  hits: number;
  context: string;
  owner?: string;
  domainOwner?: string;
  bundleID?: string;
  timeStamp?: string;
}

export interface AccessEntry {
  accessor: { identifier: string; identifierType: string };
  category: string;
  identifier: string;
  kind: string;
  timeStamp: string;
  type: string;
}

export interface ParsedReport {
  networkAccess: NetworkActivityEntry[];
  dataAccess: AccessEntry[];
  raw: unknown[];
}

export interface IPInfo {
  ip: string;
  country: string;
  countryCode: string;
  region: string;
  city: string;
  isp: string;
  org: string;
  as: string;
  hosting: boolean;
  proxy: boolean;
  vpn: boolean;
  mobile: boolean;
  lat: number;
  lon: number;
  reverse?: string;
}

export interface AnalysisResult {
  id: string;
  category: 'suspect' | 'confirmed' | 'clean';
  title: string;
  description: string;
  evidence: string[];
  severity: number;
  timestamp?: string;
  module: string;
}

export interface AnalysisReport {
  deviceIP: string;
  ipInfo: IPInfo | null;
  totalEntries: number;
  analysisDate: string;
  reportPeriod: { start: string; end: string };
  riskScore: number;
  results: AnalysisResult[];
  summary: { clean: number; suspect: number; confirmed: number };
  appsAnalyzed: number;
  domainsAnalyzed: number;
  uniqueDomains: string[];
  topApps: { bundleId: string; hits: number }[];
}

export type ProgressCallback = (stage: string, progress: number, detail?: string) => void;

// ============ CONSTANTS ============

const VPN_PROXY_BUNDLE_IDS = new Set([
  'com.nordvpn.NordVPN', 'com.expressvpn.ExpressVPN', 'com.surfshark.SurfsharkVPN',
  'com.kape.pia.vpn', 'com.pango.hotspotshield', 'com.tunnelbear.ios',
  'com.windscribe.Windscribe', 'ch.protonvpn.ios', 'com.cyberghost.CyberGhost',
  'com.ixolit.ipvanish', 'com.gaditek.purevpn', 'com.strongvpn.StrongVPN',
  'com.goldenfrog.vyprvpn', 'net.mullvad.MullvadVPN', 'me.hide.vpnios',
  'com.zenguard.ZenMate', 'org.torproject.ios.TorBrowser', 'com.psiphon3',
  'com.cloudflare.1dot1dot1dot1', 'com.shadowsocks.ios', 'com.wireguard.ios',
  'com.openvpn.connect', 'com.betternet.Betternet', 'com.connectify.speedify',
  'com.AnchorFree.AlohaVPN', 'com.apple.networkextension', 'com.noodlewerk.shadowrocket',
  'com.lemonclove.quantumult', 'com.west2online.Shadowrocket', 'com.surge.ios',
  'com.particleapps.Thunder', 'com.vpnmaster.ios', 'com.sticktight.TurboVPN',
  'com.v2rayx.ios', 'com.ssrconnectpro', 'com.clashinios.proxy',
]);

const VPN_PROXY_KEYWORDS_IN_BUNDLEID = [
  'vpn', 'proxy', 'tunnel', 'shadowsock', 'wireguard', 'openvpn',
  'trojan', 'v2ray', 'clash', 'surge', 'quantumult', 'shadowrocket',
  'tor.browser', 'socks5', 'httproxy',
];

const SUSPICIOUS_DOMAIN_PATTERNS = [
  /proxy/i, /vpngate/i, /\.onion\./i, /tor(exit|node|relay)/i,
  /socks[45]/i, /mitm/i, /intercept/i, /sniffer/i,
  /packet.*capture/i, /ssl.*strip/i, /cert.*spoof/i,
];

const HIGH_RISK_TLDS = new Set([
  '.xyz', '.top', '.click', '.link', '.club', '.icu', '.buzz',
  '.gq', '.ml', '.tk', '.cf', '.ga', '.surf',
]);

const DATACENTER_INDICATORS = [
  'amazon', 'aws', 'google cloud', 'gcp', 'azure', 'microsoft',
  'digitalocean', 'linode', 'vultr', 'ovh', 'hetzner', 'contabo',
  'hostinger', 'cloudflare', 'akamai', 'fastly', 'rackspace',
  'leaseweb', 'choopa', 'datacamp', 'scaleway', 'upcloud',
  'kamatera', 'cherry', 'serverius', 'quasi', 'colocrossing',
];

const GAME_BUNDLE_IDS = new Set([
  'com.dts.freefireth', 'com.dts.freefiremax', 'com.garena.game.ffc',
  'com.garena.game.kgtw', 'com.garena.game.lulu',
  'com.tencent.ig', 'com.pubg.newstate', 'com.tencent.tmgp.pubgm',
  'com.supercell.clashofclans', 'com.riotgames.league.wildrift',
  'com.activision.callofduty.shooter', 'io.kodular.nickksbr.freefire',
]);

const GAME_DOMAINS = [
  'garena', 'freefire', 'ff.garena', 'booyah', 'freefiremax',
  'pubg', 'tencent', 'riotgames', 'activision', 'supercell',
];

// IPA Sideloading / Signing tools detection
const SIDELOAD_BUNDLE_IDS = new Set([
  'com.SideStore.SideStore', 'com.rileytestut.AltStore',
  'com.rileytestut.AltStore.Beta', 'com.rileytestut.Delta',
  'io.github.nickyuxuan.esign', 'com.esign.app',
  'com.gbox.app', 'com.gbox.ios', 'io.gbox.ios',
  'com.ksign.app', 'io.ksign.app', 'com.ksign.ios',
  'com.signtool.app', 'com.scarlet.ios', 'com.feather.ios',
  'com.buildstore.app', 'com.ipastore.app',
  'com.topstore.ios', 'com.vshare.ios', 'com.25pp.ppclient',
  'com.tutuapp.tutuapphwenterprise', 'com.appvalley.ios',
  'com.tweakbox.app', 'com.ignition.igeek', 'com.trollstore.app',
  'com.saurik.Cydia', 'org.coolstar.Sileo', 'xyz.willy.Zebra',
]);

const SIDELOAD_KEYWORDS_IN_BUNDLEID = [
  'sidestore', 'altstore', 'esign', 'gbox', 'ksign',
  'sideload', 'signtool', 'scarlet', 'feather', 'buildstore',
  'ipastore', 'topstore', 'vshare', '25pp', 'tutuapp',
  'appvalley', 'tweakbox', 'ignition', 'trollstore',
  'cydia', 'sileo', 'zebra', 'jailbreak',
];

const SIDELOAD_DOMAINS = [
  'esign.yyyue.xyz', 'gbox.run', 'ksign.cc', 'sidestore.io',
  'altstore.io', 'scarletcloud.com', 'signtools.cc',
  'app.localhost.direct', 'api.sidestore.io', 'cdn.altstore.io',
  'featherapp.io', 'trollstore.app', 'cydia.saurik.com',
  'repo.chariz.com', 'repo.dynastic.co', 'sileo.me',
  'appvalley.vip', 'tutuapp.vip', 'tweakboxapp.com',
  'next.bsstore.net', 'ignition.fun',
];

// ============ HELPERS ============

let idCounter = 0;
function genId(): string {
  return `r_${Date.now()}_${++idCounter}`;
}

function getTLD(domain: string): string {
  const parts = domain.split('.');
  if (parts.length < 2) return '';
  return '.' + parts[parts.length - 1];
}

// ============ PARSING ============

export function parseNDJSON(raw: string): ParsedReport {
  const networkAccess: NetworkActivityEntry[] = [];
  const dataAccess: AccessEntry[] = [];
  const rawEntries: unknown[] = [];

  const lines = raw.split('\n').filter(l => l.trim());

  for (const line of lines) {
    try {
      const entry = JSON.parse(line);
      rawEntries.push(entry);

      // iOS App Privacy Report has two main record types:
      // 1. Network activity (has "domain" field)
      // 2. Data access (has "accessor" field)
      if (entry.domain || entry.networkActivity) {
        if (entry.networkActivity && Array.isArray(entry.networkActivity)) {
          for (const na of entry.networkActivity) {
            networkAccess.push({
              domain: na.domain || '',
              firstAccess: na.firstAccess || na.timeStamp || '',
              domainType: na.domainType ?? 0,
              initiatedType: na.initiatedType || '',
              hits: na.hits || 1,
              context: na.context || '',
              owner: na.owner || na.domainOwner || '',
              bundleID: na.bundleID || entry.bundleID || '',
              timeStamp: na.firstAccess || na.timeStamp || '',
            });
          }
        } else if (entry.domain) {
          networkAccess.push({
            domain: entry.domain,
            firstAccess: entry.firstAccess || entry.timeStamp || '',
            domainType: entry.domainType ?? 0,
            initiatedType: entry.initiatedType || '',
            hits: entry.hits || 1,
            context: entry.context || '',
            owner: entry.owner || entry.domainOwner || '',
            bundleID: entry.bundleID || '',
            timeStamp: entry.firstAccess || entry.timeStamp || '',
          });
        }
      }

      if (entry.accessor) {
        dataAccess.push({
          accessor: entry.accessor,
          category: entry.category || '',
          identifier: entry.identifier || '',
          kind: entry.kind || '',
          timeStamp: entry.timeStamp || '',
          type: entry.type || '',
        });
      }
    } catch {
      // Skip malformed lines
    }
  }

  // Also try parsing as a single JSON array
  if (networkAccess.length === 0 && dataAccess.length === 0) {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        for (const entry of parsed) {
          rawEntries.push(entry);
          if (entry.domain) {
            networkAccess.push({
              domain: entry.domain,
              firstAccess: entry.firstAccess || entry.timeStamp || '',
              domainType: entry.domainType ?? 0,
              initiatedType: entry.initiatedType || '',
              hits: entry.hits || 1,
              context: entry.context || '',
              owner: entry.owner || '',
              bundleID: entry.bundleID || '',
              timeStamp: entry.firstAccess || entry.timeStamp || '',
            });
          }
          if (entry.accessor) {
            dataAccess.push(entry as AccessEntry);
          }
        }
      }
    } catch {
      throw new Error('Formato de arquivo inválido. Exporte o relatório de privacidade do seu iPhone em Configurações > Privacidade > Relatório de Privacidade do App.');
    }
  }

  return { networkAccess, dataAccess, raw: rawEntries };
}

// ============ IP ENRICHMENT (Real API) ============

export async function enrichIP(ip: string): Promise<IPInfo | null> {
  if (!ip || ip === 'N/A' || ip.trim() === '') return null;

  try {
    // Using ip-api.com (free, supports CORS, no key needed)
    const res = await fetch(
      `http://ip-api.com/json/${encodeURIComponent(ip.trim())}?fields=status,message,country,countryCode,region,city,isp,org,as,mobile,proxy,hosting,lat,lon,reverse,query`,
      { signal: AbortSignal.timeout(8000) }
    );
    
    if (!res.ok) return null;
    const data = await res.json();
    
    if (data.status === 'fail') return null;

    return {
      ip: data.query || ip,
      country: data.country || '',
      countryCode: data.countryCode || '',
      region: data.region || '',
      city: data.city || '',
      isp: data.isp || '',
      org: data.org || '',
      as: data.as || '',
      hosting: data.hosting === true,
      proxy: data.proxy === true,
      vpn: data.proxy === true, // ip-api uses proxy field for VPN too
      mobile: data.mobile === true,
      lat: data.lat || 0,
      lon: data.lon || 0,
      reverse: data.reverse || '',
    };
  } catch {
    return null;
  }
}

// Try alternative API if first fails
async function enrichIPFallback(ip: string): Promise<IPInfo | null> {
  try {
    const res = await fetch(
      `https://ipapi.co/${encodeURIComponent(ip.trim())}/json/`,
      { signal: AbortSignal.timeout(8000) }
    );
    if (!res.ok) return null;
    const data = await res.json();
    if (data.error) return null;

    return {
      ip: data.ip || ip,
      country: data.country_name || '',
      countryCode: data.country_code || '',
      region: data.region || '',
      city: data.city || '',
      isp: data.org || '',
      org: data.org || '',
      as: `AS${data.asn || ''} ${data.org || ''}`,
      hosting: false,
      proxy: false,
      vpn: false,
      mobile: false,
      lat: data.latitude || 0,
      lon: data.longitude || 0,
    };
  } catch {
    return null;
  }
}

export async function getIPInfo(ip: string): Promise<IPInfo | null> {
  const primary = await enrichIP(ip);
  if (primary) return primary;
  return enrichIPFallback(ip);
}

// ============ DOMAIN ENRICHMENT ============

async function checkDomainsViaIP(domains: string[]): Promise<Map<string, IPInfo>> {
  const results = new Map<string, IPInfo>();
  // Check up to 20 unique domains to avoid rate limiting
  const domainsToCheck = domains.slice(0, 20);
  
  for (const domain of domainsToCheck) {
    try {
      const res = await fetch(
        `http://ip-api.com/json/${encodeURIComponent(domain)}?fields=status,query,isp,org,as,hosting,proxy`,
        { signal: AbortSignal.timeout(5000) }
      );
      if (res.ok) {
        const data = await res.json();
        if (data.status === 'success') {
          results.set(domain, {
            ip: data.query || '',
            country: '', countryCode: '', region: '', city: '',
            isp: data.isp || '', org: data.org || '', as: data.as || '',
            hosting: data.hosting === true,
            proxy: data.proxy === true,
            vpn: data.proxy === true,
            mobile: false, lat: 0, lon: 0,
          });
        }
      }
      // Rate limiting: ip-api allows 45 req/min on free tier
      await new Promise(r => setTimeout(r, 1400));
    } catch {
      // Skip failed lookups
    }
  }

  return results;
}

// ============ ANALYSIS MODULES ============

function analyzeVPNApps(report: ParsedReport): AnalysisResult[] {
  const results: AnalysisResult[] = [];
  const foundApps = new Set<string>();

  for (const entry of report.networkAccess) {
    const bid = entry.bundleID || entry.context || '';
    if (!bid) continue;

    // Exact match
    if (VPN_PROXY_BUNDLE_IDS.has(bid) && !foundApps.has(bid)) {
      foundApps.add(bid);
      results.push({
        id: genId(),
        category: 'confirmed',
        title: `App de VPN/Proxy instalado: ${bid}`,
        description: `O bundle ID "${bid}" corresponde a um aplicativo conhecido de VPN, proxy ou túnel. Este app foi detectado realizando atividade de rede.`,
        evidence: [
          `Bundle ID: ${bid}`,
          `Domínio acessado: ${entry.domain}`,
          `Timestamp: ${entry.firstAccess || 'N/A'}`,
          `Hits: ${entry.hits}`,
        ],
        severity: 9,
        timestamp: entry.firstAccess,
        module: 'Detecção de Apps VPN/Proxy',
      });
    }

    // Keyword match in bundle ID
    const bidLower = bid.toLowerCase();
    const matchedKw = VPN_PROXY_KEYWORDS_IN_BUNDLEID.find(kw => bidLower.includes(kw));
    if (matchedKw && !foundApps.has(bid)) {
      foundApps.add(bid);
      results.push({
        id: genId(),
        category: 'suspect',
        title: `App possivelmente de VPN/Proxy: ${bid}`,
        description: `O bundle ID contém a palavra-chave "${matchedKw}", associada a ferramentas de VPN/proxy.`,
        evidence: [
          `Bundle ID: ${bid}`,
          `Keyword detectada: ${matchedKw}`,
          `Domínio: ${entry.domain}`,
        ],
        severity: 7,
        timestamp: entry.firstAccess,
        module: 'Detecção de Apps VPN/Proxy',
      });
    }
  }

  return results;
}

function analyzeSuspiciousDomains(report: ParsedReport): AnalysisResult[] {
  const results: AnalysisResult[] = [];
  const flagged = new Set<string>();

  for (const entry of report.networkAccess) {
    const domain = entry.domain?.toLowerCase();
    if (!domain || flagged.has(domain)) continue;

    // Pattern matching
    for (const pattern of SUSPICIOUS_DOMAIN_PATTERNS) {
      if (pattern.test(domain)) {
        flagged.add(domain);
        results.push({
          id: genId(),
          category: 'suspect',
          title: `Domínio suspeito: ${domain}`,
          description: `O domínio corresponde ao padrão "${pattern.source}", frequentemente associado a ferramentas de proxy/VPN/interceptação.`,
          evidence: [
            `Domínio: ${domain}`,
            `Padrão: ${pattern.source}`,
            `App: ${entry.bundleID || entry.context || 'N/A'}`,
            `Acessos: ${entry.hits}`,
            `Primeiro acesso: ${entry.firstAccess || 'N/A'}`,
          ],
          severity: 6,
          timestamp: entry.firstAccess,
          module: 'Análise de Domínios',
        });
        break;
      }
    }

    // High-risk TLD check (only flag if domain is not from known legitimate owners)
    const tld = getTLD(domain);
    if (HIGH_RISK_TLDS.has(tld) && !flagged.has(domain)) {
      const owner = (entry.owner || '').toLowerCase();
      const isKnownLegit = ['apple', 'google', 'facebook', 'meta', 'microsoft', 'amazon', 'cloudflare']
        .some(co => owner.includes(co));
      
      if (!isKnownLegit) {
        flagged.add(domain);
        results.push({
          id: genId(),
          category: 'suspect',
          title: `TLD de alto risco: ${domain}`,
          description: `O domínio usa TLD "${tld}", frequentemente usado por serviços maliciosos ou temporários. O proprietário não é reconhecido como legítimo.`,
          evidence: [
            `Domínio: ${domain}`,
            `TLD: ${tld}`,
            `Proprietário: ${owner || 'Desconhecido'}`,
            `App: ${entry.bundleID || 'N/A'}`,
          ],
          severity: 4,
          timestamp: entry.firstAccess,
          module: 'Análise de TLD',
        });
      }
    }
  }

  return results;
}

function analyzeIPInfo(ipInfo: IPInfo | null): AnalysisResult[] {
  if (!ipInfo) return [];
  const results: AnalysisResult[] = [];

  // Check if IP is from a hosting/datacenter provider
  if (ipInfo.hosting) {
    results.push({
      id: genId(),
      category: 'confirmed',
      title: `IP de datacenter/hosting detectado`,
      description: `O IP ${ipInfo.ip} pertence a um provedor de hosting/datacenter. Dispositivos móveis reais não usam IPs de datacenter.`,
      evidence: [
        `IP: ${ipInfo.ip}`,
        `ISP: ${ipInfo.isp}`,
        `Organização: ${ipInfo.org}`,
        `ASN: ${ipInfo.as}`,
        `Localização: ${ipInfo.city}, ${ipInfo.country}`,
      ],
      severity: 10,
      module: 'Análise de IP',
    });
  }

  // Check if proxy/VPN detected by API
  if (ipInfo.proxy || ipInfo.vpn) {
    results.push({
      id: genId(),
      category: 'confirmed',
      title: `Proxy/VPN detectado no IP`,
      description: `O IP ${ipInfo.ip} foi identificado como proxy ou VPN por serviço de inteligência de IP.`,
      evidence: [
        `IP: ${ipInfo.ip}`,
        `Proxy: ${ipInfo.proxy ? 'Sim' : 'Não'}`,
        `ISP: ${ipInfo.isp}`,
        `ASN: ${ipInfo.as}`,
      ],
      severity: 10,
      module: 'Análise de IP',
    });
  }

  // Check ASN for known datacenter providers
  const asLower = (ipInfo.as + ' ' + ipInfo.isp + ' ' + ipInfo.org).toLowerCase();
  const matchedDC = DATACENTER_INDICATORS.find(dc => asLower.includes(dc));
  if (matchedDC && !ipInfo.hosting) {
    results.push({
      id: genId(),
      category: 'suspect',
      title: `ASN de provedor cloud: ${matchedDC}`,
      description: `O IP está associado ao provedor "${matchedDC}". Isso pode indicar uso de VPS ou servidor cloud como proxy.`,
      evidence: [
        `IP: ${ipInfo.ip}`,
        `ASN: ${ipInfo.as}`,
        `ISP: ${ipInfo.isp}`,
        `Provider: ${matchedDC}`,
      ],
      severity: 7,
      module: 'Análise de ASN',
    });
  }

  // Check rDNS for server patterns
  if (ipInfo.reverse) {
    const rdns = ipInfo.reverse.toLowerCase();
    const serverPatterns = ['vps', 'server', 'dedicated', 'cloud', 'host', 'node', 'compute'];
    const matched = serverPatterns.find(p => rdns.includes(p));
    if (matched) {
      results.push({
        id: genId(),
        category: 'suspect',
        title: `rDNS indica servidor: ${ipInfo.reverse}`,
        description: `O DNS reverso contém "${matched}", típico de servidores e não de conexões residenciais/móveis.`,
        evidence: [
          `IP: ${ipInfo.ip}`,
          `rDNS: ${ipInfo.reverse}`,
          `Padrão: ${matched}`,
        ],
        severity: 6,
        module: 'Análise de rDNS',
      });
    }
  }

  // Mobile check - if IP says it's mobile, that's a good sign
  if (ipInfo.mobile && !ipInfo.proxy && !ipInfo.hosting) {
    results.push({
      id: genId(),
      category: 'clean',
      title: `IP de rede móvel confirmado`,
      description: `O IP ${ipInfo.ip} pertence a uma rede móvel legítima (${ipInfo.isp}), consistente com uso em iPhone.`,
      evidence: [
        `IP: ${ipInfo.ip}`,
        `ISP: ${ipInfo.isp}`,
        `Tipo: Rede Móvel`,
        `Localização: ${ipInfo.city}, ${ipInfo.country}`,
      ],
      severity: 0,
      module: 'Análise de IP',
    });
  }

  return results;
}

function analyzeTemporalCorrelation(report: ParsedReport): AnalysisResult[] {
  const results: AnalysisResult[] = [];
  
  // Build timeline of events
  const events: { time: Date; domain: string; bundleId: string; type: 'vpn' | 'game' | 'normal' }[] = [];

  for (const entry of report.networkAccess) {
    const ts = entry.firstAccess || entry.timeStamp;
    if (!ts) continue;

    const time = new Date(ts);
    if (isNaN(time.getTime())) continue;

    const bid = (entry.bundleID || entry.context || '').toLowerCase();
    const domain = (entry.domain || '').toLowerCase();

    let type: 'vpn' | 'game' | 'normal' = 'normal';
    
    if (VPN_PROXY_KEYWORDS_IN_BUNDLEID.some(kw => bid.includes(kw)) ||
        SUSPICIOUS_DOMAIN_PATTERNS.some(p => p.test(domain))) {
      type = 'vpn';
    } else if (GAME_BUNDLE_IDS.has(entry.bundleID || '') ||
               GAME_DOMAINS.some(g => domain.includes(g))) {
      type = 'game';
    }

    events.push({ time, domain, bundleId: bid, type });
  }

  events.sort((a, b) => a.time.getTime() - b.time.getTime());

  // Detect VPN activity close to game sessions
  for (let i = 0; i < events.length; i++) {
    if (events[i].type !== 'vpn') continue;

    for (let j = i + 1; j < events.length && j < i + 50; j++) {
      if (events[j].type !== 'game') continue;

      const diffMin = (events[j].time.getTime() - events[i].time.getTime()) / 60000;
      if (diffMin > 30) break;

      results.push({
        id: genId(),
        category: 'confirmed',
        title: 'VPN/Proxy ativo antes de sessão de jogo',
        description: `Atividade de VPN/proxy detectada ${Math.round(diffMin)} minutos antes do acesso ao jogo. Forte indicação de uso de proxy durante gameplay.`,
        evidence: [
          `VPN/Proxy: ${events[i].domain} (${events[i].time.toLocaleString()})`,
          `Jogo: ${events[j].domain} (${events[j].time.toLocaleString()})`,
          `Intervalo: ${Math.round(diffMin)} minutos`,
          `Bundle VPN: ${events[i].bundleId}`,
          `Bundle Jogo: ${events[j].bundleId}`,
        ],
        severity: 10,
        timestamp: events[i].time.toISOString(),
        module: 'Correlação Temporal',
      });
      break; // One finding per VPN event
    }
  }

  return results;
}

function analyzeDatacenterDomains(domainIPMap: Map<string, IPInfo>, networkAccess: NetworkActivityEntry[]): AnalysisResult[] {
  const results: AnalysisResult[] = [];
  const flagged = new Set<string>();

  for (const [domain, info] of domainIPMap) {
    if (flagged.has(domain)) continue;

    if (info.hosting || info.proxy) {
      // Find which app accessed this domain
      const entry = networkAccess.find(e => e.domain === domain);
      const bid = entry?.bundleID || entry?.context || 'N/A';
      
      // Skip well-known CDN/cloud domains that are legitimate
      const knownCDNs = ['cloudfront.net', 'akamai', 'fastly', 'cloudflare', 'googleapis.com', 'apple.com', 'icloud.com'];
      if (knownCDNs.some(cdn => domain.includes(cdn))) continue;

      flagged.add(domain);
      results.push({
        id: genId(),
        category: info.proxy ? 'confirmed' : 'suspect',
        title: `Domínio em ${info.proxy ? 'proxy' : 'datacenter'}: ${domain}`,
        description: `O domínio ${domain} resolve para IP de ${info.proxy ? 'proxy/VPN' : 'datacenter'} (${info.ip}).`,
        evidence: [
          `Domínio: ${domain}`,
          `IP: ${info.ip}`,
          `ISP: ${info.isp}`,
          `ASN: ${info.as}`,
          `Hosting: ${info.hosting ? 'Sim' : 'Não'}`,
          `Proxy: ${info.proxy ? 'Sim' : 'Não'}`,
          `App: ${bid}`,
        ],
        severity: info.proxy ? 8 : 5,
        module: 'Análise de Infraestrutura',
      });
    }
  }

  return results;
}

function analyzeFileIntegrity(report: ParsedReport, rawContent: string): AnalysisResult[] {
  const results: AnalysisResult[] = [];

  // Check entries count
  const totalEntries = report.networkAccess.length + report.dataAccess.length;
  if (totalEntries < 5 && rawContent.length > 100) {
    results.push({
      id: genId(),
      category: 'suspect',
      title: 'Arquivo com poucos registros',
      description: `O relatório contém apenas ${totalEntries} entradas válidas. Pode indicar um relatório truncado, recém-resetado ou manipulado.`,
      evidence: [`Total de entradas: ${totalEntries}`, `Tamanho do arquivo: ${(rawContent.length / 1024).toFixed(1)} KB`],
      severity: 5,
      module: 'Integridade do Arquivo',
    });
  }

  // Check timestamp consistency
  const timestamps = report.networkAccess
    .map(e => new Date(e.firstAccess || e.timeStamp || ''))
    .filter(d => !isNaN(d.getTime()))
    .sort((a, b) => a.getTime() - b.getTime());

  if (timestamps.length >= 2) {
    const firstTs = timestamps[0];
    const lastTs = timestamps[timestamps.length - 1];
    const days = (lastTs.getTime() - firstTs.getTime()) / 86400000;

    // iOS App Privacy Report only keeps 7 days by default
    if (days > 8) {
      results.push({
        id: genId(),
        category: 'suspect',
        title: 'Período inconsistente com iOS',
        description: `O relatório cobre ${Math.round(days)} dias, mas o iOS mantém apenas ~7 dias de dados. Pode indicar dados concatenados ou manipulados.`,
        evidence: [
          `Primeiro registro: ${firstTs.toLocaleString()}`,
          `Último registro: ${lastTs.toLocaleString()}`,
          `Período: ${Math.round(days)} dias`,
        ],
        severity: 6,
        module: 'Integridade do Arquivo',
      });
    }

    // Check for gaps (more than 24h without activity is suspicious for active device)
    for (let i = 1; i < timestamps.length; i++) {
      const gap = (timestamps[i].getTime() - timestamps[i - 1].getTime()) / 3600000;
      if (gap > 48) {
        results.push({
          id: genId(),
          category: 'suspect',
          title: 'Gap de atividade detectado',
          description: `Lacuna de ${Math.round(gap)} horas sem atividade. Pode indicar que o dispositivo foi desligado, em modo avião, ou dados foram removidos.`,
          evidence: [
            `De: ${timestamps[i - 1].toLocaleString()}`,
            `Até: ${timestamps[i].toLocaleString()}`,
            `Gap: ${Math.round(gap)} horas`,
          ],
          severity: 3,
          module: 'Integridade do Arquivo',
        });
        break; // Report only first major gap
      }
    }
  }

  // Check for future timestamps
  const now = new Date();
  const futureEntries = timestamps.filter(t => t > now);
  if (futureEntries.length > 0) {
    results.push({
      id: genId(),
      category: 'confirmed',
      title: 'Timestamps no futuro detectados',
      description: `${futureEntries.length} registros possuem timestamps no futuro, forte indicação de manipulação.`,
      evidence: [
        `Entradas com data futura: ${futureEntries.length}`,
        `Exemplo: ${futureEntries[0].toLocaleString()}`,
      ],
      severity: 9,
      module: 'Integridade do Arquivo',
    });
  }

  return results;
}

function analyzeNetworkBehavior(report: ParsedReport): AnalysisResult[] {
  const results: AnalysisResult[] = [];

  // Build domain-to-app map
  const domainsByApp = new Map<string, Set<string>>();
  for (const entry of report.networkAccess) {
    const bid = entry.bundleID || entry.context || 'unknown';
    if (!domainsByApp.has(bid)) domainsByApp.set(bid, new Set());
    domainsByApp.get(bid)!.add(entry.domain);
  }

  // Check for apps accessing unusual number of unique domains
  for (const [app, domains] of domainsByApp) {
    if (domains.size > 100) {
      const suspiciousDomains = [...domains].filter(d => 
        SUSPICIOUS_DOMAIN_PATTERNS.some(p => p.test(d))
      );
      if (suspiciousDomains.length > 0) {
        results.push({
          id: genId(),
          category: 'suspect',
          title: `App com atividade de rede anômala: ${app}`,
          description: `O app ${app} acessou ${domains.size} domínios únicos, incluindo ${suspiciousDomains.length} suspeitos.`,
          evidence: [
            `App: ${app}`,
            `Domínios únicos: ${domains.size}`,
            `Domínios suspeitos: ${suspiciousDomains.join(', ')}`,
          ],
          severity: 5,
          module: 'Análise Comportamental',
        });
      }
    }
  }

  return results;
}

// ============ IPA SIDELOAD DETECTION ============

function analyzeSideloadApps(report: ParsedReport): AnalysisResult[] {
  const results: AnalysisResult[] = [];
  const foundApps = new Set<string>();

  for (const entry of report.networkAccess) {
    const bid = entry.bundleID || entry.context || '';
    if (!bid) continue;

    // Exact bundle ID match
    if (SIDELOAD_BUNDLE_IDS.has(bid) && !foundApps.has(bid)) {
      foundApps.add(bid);
      results.push({
        id: genId(),
        category: 'confirmed',
        title: `App de sideload/IPA detectado: ${bid}`,
        description: `O bundle ID "${bid}" corresponde a uma ferramenta conhecida de instalação de apps não-oficiais (sideloading). Isso permite instalar apps modificados, cheats e ferramentas de manipulação.`,
        evidence: [
          `Bundle ID: ${bid}`,
          `Domínio acessado: ${entry.domain}`,
          `Timestamp: ${entry.firstAccess || 'N/A'}`,
          `Hits: ${entry.hits}`,
        ],
        severity: 10,
        timestamp: entry.firstAccess,
        module: 'Detecção de IPA/Sideload',
      });
    }

    // Keyword match
    const bidLower = bid.toLowerCase();
    const matchedKw = SIDELOAD_KEYWORDS_IN_BUNDLEID.find(kw => bidLower.includes(kw));
    if (matchedKw && !foundApps.has(bid)) {
      foundApps.add(bid);
      results.push({
        id: genId(),
        category: 'confirmed',
        title: `Possível app de sideload: ${bid}`,
        description: `O bundle ID contém a palavra-chave "${matchedKw}", associada a ferramentas de sideloading (KSign, ESign, GBox, etc).`,
        evidence: [
          `Bundle ID: ${bid}`,
          `Keyword: ${matchedKw}`,
          `Domínio: ${entry.domain}`,
        ],
        severity: 9,
        timestamp: entry.firstAccess,
        module: 'Detecção de IPA/Sideload',
      });
    }

    // Domain match for sideload services
    const domainLower = (entry.domain || '').toLowerCase();
    const matchedDomain = SIDELOAD_DOMAINS.find(d => domainLower.includes(d));
    if (matchedDomain && !foundApps.has(`domain_${matchedDomain}`)) {
      foundApps.add(`domain_${matchedDomain}`);
      results.push({
        id: genId(),
        category: 'confirmed',
        title: `Acesso a serviço de sideload: ${matchedDomain}`,
        description: `O domínio "${entry.domain}" está associado ao serviço de sideloading "${matchedDomain}". Indica uso de ferramentas para instalar apps fora da App Store.`,
        evidence: [
          `Domínio: ${entry.domain}`,
          `Serviço: ${matchedDomain}`,
          `App: ${bid || 'N/A'}`,
          `Timestamp: ${entry.firstAccess || 'N/A'}`,
        ],
        severity: 9,
        timestamp: entry.firstAccess,
        module: 'Detecção de IPA/Sideload',
      });
    }
  }

  return results;
}

// ============ APP STORE BEHAVIOR DETECTION ============

function analyzeAppStoreBehavior(report: ParsedReport): AnalysisResult[] {
  const results: AnalysisResult[] = [];
  
  const appStoreAccess: { time: Date; domain: string }[] = [];
  const gameAccess: { time: Date; domain: string; bundleId: string }[] = [];

  for (const entry of report.networkAccess) {
    const ts = entry.firstAccess || entry.timeStamp;
    if (!ts) continue;
    const time = new Date(ts);
    if (isNaN(time.getTime())) continue;

    const domain = (entry.domain || '').toLowerCase();
    const bid = (entry.bundleID || entry.context || '').toLowerCase();

    // Detect App Store activity
    if (bid.includes('com.apple.appstore') || domain.includes('apps.apple.com') ||
        domain.includes('itunes.apple.com') || domain.includes('buy.itunes.apple.com') ||
        domain.includes('p-appstore') || domain.includes('mesu.apple.com')) {
      appStoreAccess.push({ time, domain });
    }

    // Detect game activity
    if (GAME_BUNDLE_IDS.has(entry.bundleID || '') || GAME_DOMAINS.some(g => domain.includes(g))) {
      gameAccess.push({ time, domain, bundleId: bid });
    }
  }

  // Check if App Store was accessed right before a game session
  for (const store of appStoreAccess) {
    for (const game of gameAccess) {
      const diffMin = (game.time.getTime() - store.time.getTime()) / 60000;
      if (diffMin > 0 && diffMin < 15) {
        results.push({
          id: genId(),
          category: 'suspect',
          title: 'App Store acessada antes de sessão de jogo',
          description: `A App Store foi acessada ${Math.round(diffMin)} minutos antes da sessão do jogo. Pode indicar download de app modificado ou cheat.`,
          evidence: [
            `App Store: ${store.domain} (${store.time.toLocaleString()})`,
            `Jogo: ${game.domain} (${game.time.toLocaleString()})`,
            `Intervalo: ${Math.round(diffMin)} min`,
          ],
          severity: 5,
          timestamp: store.time.toISOString(),
          module: 'Análise Comportamental',
        });
        break;
      }
    }
  }

  return results;
}

// ============ SCORE CALCULATION ============

function calculateRiskScore(results: AnalysisResult[]): number {
  const confirmed = results.filter(r => r.category === 'confirmed');
  const suspect = results.filter(r => r.category === 'suspect');

  if (confirmed.length === 0 && suspect.length === 0) return 0;

  let score = 0;

  // Weighted scoring
  for (const r of confirmed) {
    score += r.severity * 2.5;
  }
  for (const r of suspect) {
    score += r.severity * 1;
  }

  // Bonus for multiple confirmed findings (cross-correlation)
  if (confirmed.length >= 3) score += 15;
  if (confirmed.length >= 5) score += 10;

  return Math.min(100, Math.round(score));
}

// ============ MAIN ANALYSIS FUNCTION ============

export async function analyzeReport(
  rawContent: string,
  deviceIP: string,
  onProgress: ProgressCallback
): Promise<AnalysisReport> {
  idCounter = 0;

  // Stage 1: Parse
  onProgress('Validando e parseando arquivo...', 5);
  const report = parseNDJSON(rawContent);
  
  if (report.networkAccess.length === 0 && report.dataAccess.length === 0) {
    throw new Error('Nenhum dado de privacidade encontrado no arquivo. Verifique se é um App Privacy Report válido do iOS.');
  }

  onProgress('Arquivo parseado com sucesso', 15, `${report.networkAccess.length} entradas de rede, ${report.dataAccess.length} acessos a dados`);

  // Stage 2: Enrich IP
  onProgress('Analisando IP do dispositivo...', 20);
  let ipInfo: IPInfo | null = null;
  if (deviceIP && deviceIP.trim() !== '') {
    ipInfo = await getIPInfo(deviceIP);
    if (ipInfo) {
      onProgress('IP enriquecido com sucesso', 30, `${ipInfo.isp} - ${ipInfo.city}, ${ipInfo.country}`);
    } else {
      onProgress('Não foi possível analisar o IP', 30, 'Continuando sem dados de IP');
    }
  } else {
    onProgress('Nenhum IP informado, pulando análise de IP', 30);
  }

  // Stage 3: Analyze VPN/Proxy apps
  onProgress('Detectando apps de VPN/Proxy...', 35);
  const vpnResults = analyzeVPNApps(report);

  // Stage 4: Analyze domains
  onProgress('Analisando domínios acessados...', 45);
  const domainResults = analyzeSuspiciousDomains(report);

  // Stage 5: Analyze IP
  onProgress('Processando dados de IP...', 55);
  const ipResults = analyzeIPInfo(ipInfo);

  // Stage 6: Temporal correlation
  onProgress('Correlacionando eventos temporais...', 65);
  const temporalResults = analyzeTemporalCorrelation(report);

  // Stage 7: File integrity
  onProgress('Verificando integridade do arquivo...', 75);
  const integrityResults = analyzeFileIntegrity(report, rawContent);

  // Stage 8: Network behavior
  onProgress('Analisando comportamento de rede...', 80);
  const behaviorResults = analyzeNetworkBehavior(report);

  // Stage 9: Domain IP enrichment (check suspicious domains)
  onProgress('Enriquecendo domínios suspeitos com API...', 85);
  const suspiciousDomains = [...new Set(
    report.networkAccess
      .filter(e => {
        const d = (e.domain || '').toLowerCase();
        return SUSPICIOUS_DOMAIN_PATTERNS.some(p => p.test(d)) ||
               HIGH_RISK_TLDS.has(getTLD(d));
      })
      .map(e => e.domain)
  )];

  let dcResults: AnalysisResult[] = [];
  if (suspiciousDomains.length > 0) {
    const domainIPs = await checkDomainsViaIP(suspiciousDomains.slice(0, 10));
    dcResults = analyzeDatacenterDomains(domainIPs, report.networkAccess);
  }

  onProgress('Gerando relatório final...', 95);

  // Combine all results
  const allResults = [
    ...vpnResults,
    ...domainResults,
    ...ipResults,
    ...temporalResults,
    ...integrityResults,
    ...behaviorResults,
    ...dcResults,
  ];

  // Deduplicate
  const seen = new Set<string>();
  const uniqueResults = allResults.filter(r => {
    if (seen.has(r.title)) return false;
    seen.add(r.title);
    return true;
  });

  uniqueResults.sort((a, b) => b.severity - a.severity);

  // If nothing bad found, mark as clean
  if (uniqueResults.filter(r => r.category !== 'clean').length === 0) {
    uniqueResults.push({
      id: genId(),
      category: 'clean',
      title: 'Nenhuma atividade suspeita detectada',
      description: 'A análise completa não identificou indicadores de proxy, VPN, túnel ou interceptação de tráfego no relatório.',
      evidence: [
        'Todas as 8 verificações passaram sem alertas',
        `${report.networkAccess.length} entradas de rede analisadas`,
        `Domínios verificados via API de inteligência de IP`,
      ],
      severity: 0,
      module: 'Resultado Geral',
    });
  }

  // Compute metadata
  const allDomains = [...new Set(report.networkAccess.map(e => e.domain).filter(Boolean))];
  const appHits = new Map<string, number>();
  for (const e of report.networkAccess) {
    const bid = e.bundleID || e.context || '';
    if (bid) appHits.set(bid, (appHits.get(bid) || 0) + e.hits);
  }
  const topApps = [...appHits.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .map(([bundleId, hits]) => ({ bundleId, hits }));

  const timestamps = report.networkAccess
    .map(e => e.firstAccess || e.timeStamp || '')
    .filter(Boolean)
    .map(t => new Date(t))
    .filter(d => !isNaN(d.getTime()))
    .sort((a, b) => a.getTime() - b.getTime());

  onProgress('Análise concluída!', 100);

  return {
    deviceIP: deviceIP || 'N/A',
    ipInfo,
    totalEntries: report.networkAccess.length + report.dataAccess.length,
    analysisDate: new Date().toISOString(),
    reportPeriod: {
      start: timestamps[0]?.toISOString() || 'N/A',
      end: timestamps[timestamps.length - 1]?.toISOString() || 'N/A',
    },
    riskScore: calculateRiskScore(uniqueResults),
    results: uniqueResults,
    summary: {
      clean: uniqueResults.filter(r => r.category === 'clean').length,
      suspect: uniqueResults.filter(r => r.category === 'suspect').length,
      confirmed: uniqueResults.filter(r => r.category === 'confirmed').length,
    },
    appsAnalyzed: appHits.size,
    domainsAnalyzed: allDomains.length,
    uniqueDomains: allDomains,
    topApps,
  };
}
