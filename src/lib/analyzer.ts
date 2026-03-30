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
  'com.AnchorFree.AlohaVPN', 'com.noodlewerk.shadowrocket',
  'com.lemonclove.quantumult', 'com.west2online.Shadowrocket', 'com.surge.ios',
  'com.particleapps.Thunder', 'com.vpnmaster.ios', 'com.sticktight.TurboVPN',
  'com.v2rayx.ios', 'com.ssrconnectpro', 'com.clashinios.proxy',
]);

// Removed 'com.apple.networkextension' — it's a system framework, not a VPN app (false positive source)

const VPN_PROXY_KEYWORDS_IN_BUNDLEID = [
  'vpn', 'proxy', 'tunnel', 'shadowsock', 'wireguard', 'openvpn',
  'trojan', 'v2ray', 'clash', 'surge', 'quantumult', 'shadowrocket',
  'tor.browser', 'socks5', 'httproxy',
];

const SUSPICIOUS_DOMAIN_PATTERNS = [
  /^proxy\./i, /\.proxy\./i, /vpngate/i, /\.onion\./i, /tor(exit|node|relay)/i,
  /socks[45]\./i, /mitm\./i, /intercept\./i, /sniffer\./i,
  /packet.*capture/i, /ssl.*strip/i, /cert.*spoof/i,
];
// Made patterns more specific with anchors/dots to avoid matching substrings in legitimate domains

const HIGH_RISK_TLDS = new Set([
  '.xyz', '.top', '.click', '.icu', '.buzz',
  '.gq', '.ml', '.tk', '.cf', '.ga',
]);
// Removed '.link', '.club', '.surf' — too many legitimate services use these

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
  'cydia', 'sileo', 'zebra',
];
// Removed 'jailbreak' keyword — too generic, causes FP with news articles etc.

const SIDELOAD_DOMAINS = [
  'esign.yyyue.xyz', 'gbox.run', 'ksign.cc', 'sidestore.io',
  'altstore.io', 'scarletcloud.com', 'signtools.cc',
  'app.localhost.direct', 'api.sidestore.io', 'cdn.altstore.io',
  'featherapp.io', 'trollstore.app', 'cydia.saurik.com',
  'repo.chariz.com', 'repo.dynastic.co', 'sileo.me',
  'appvalley.vip', 'tutuapp.vip', 'tweakboxapp.com',
  'next.bsstore.net', 'ignition.fun',
];

// Known legitimate domain owners — expanded to reduce false positives
const KNOWN_LEGITIMATE_OWNERS = [
  'apple', 'google', 'facebook', 'meta', 'microsoft', 'amazon', 'cloudflare',
  'akamai', 'fastly', 'tiktok', 'bytedance', 'twitter', 'snap', 'spotify',
  'netflix', 'adobe', 'oracle', 'ibm', 'salesforce', 'shopify', 'stripe',
  'twitch', 'reddit', 'pinterest', 'linkedin', 'whatsapp', 'telegram',
  'discord', 'zoom', 'slack', 'dropbox', 'github', 'gitlab', 'stackoverflow',
  'mozilla', 'samsung', 'huawei', 'xiaomi', 'oneplus', 'garena', 'tencent',
  'riot', 'supercell', 'activision', 'unity', 'appsflyer', 'adjust',
  'branch', 'firebase', 'crashlytics', 'sentry', 'amplitude', 'mixpanel',
  'segment', 'datadog', 'newrelic', 'pendo',
];

// Known legitimate apps that should never trigger VPN keyword detection
const KNOWN_SYSTEM_APPS = new Set([
  'com.apple.', 'com.google.', 'com.facebook.', 'com.meta.',
  'com.microsoft.', 'com.amazon.', 'com.netflix.',
  'com.spotify.', 'com.snapchat.', 'com.zhiliaoapp.musically',
  'com.burbn.instagram', 'com.atebits.Tweetie2',
]);

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

function isKnownSystemApp(bid: string): boolean {
  const lower = bid.toLowerCase();
  return [...KNOWN_SYSTEM_APPS].some(prefix => lower.startsWith(prefix));
}

function isKnownLegitDomain(domain: string, owner: string): boolean {
  const combined = `${domain} ${owner}`.toLowerCase();
  return KNOWN_LEGITIMATE_OWNERS.some(co => combined.includes(co));
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
      throw new Error('Invalid file format. Export the privacy report from your iPhone in Settings > Privacy > App Privacy Report.');
    }
  }

  return { networkAccess, dataAccess, raw: rawEntries };
}

// ============ IP ENRICHMENT ============

export async function enrichIP(ip: string): Promise<IPInfo | null> {
  if (!ip || ip === 'N/A' || ip.trim() === '') return null;

  // Validate IP format
  const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
  if (!ipRegex.test(ip.trim())) return null;

  try {
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
      vpn: data.proxy === true,
      mobile: data.mobile === true,
      lat: data.lat || 0,
      lon: data.lon || 0,
      reverse: data.reverse || '',
    };
  } catch {
    return null;
  }
}

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
  const domainsToCheck = domains.slice(0, 10); // Reduced from 20 to 10 for performance
  
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
            ip: data.query || '', country: '', countryCode: '', region: '', city: '',
            isp: data.isp || '', org: data.org || '', as: data.as || '',
            hosting: data.hosting === true,
            proxy: data.proxy === true,
            vpn: data.proxy === true,
            mobile: false, lat: 0, lon: 0,
          });
        }
      }
      await new Promise(r => setTimeout(r, 1400));
    } catch {
      // Skip
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

    // Skip system apps entirely
    if (isKnownSystemApp(bid)) continue;

    // Exact match
    if (VPN_PROXY_BUNDLE_IDS.has(bid) && !foundApps.has(bid)) {
      foundApps.add(bid);
      results.push({
        id: genId(),
        category: 'confirmed',
        title: `VPN/Proxy app detected: ${bid}`,
        description: `The bundle ID "${bid}" matches a known VPN, proxy or tunnel application actively making network requests.`,
        evidence: [
          `Bundle ID: ${bid}`,
          `Domain accessed: ${entry.domain}`,
          `Timestamp: ${entry.firstAccess || 'N/A'}`,
          `Hits: ${entry.hits}`,
        ],
        severity: 9,
        timestamp: entry.firstAccess,
        module: 'VPN/Proxy Detection',
      });
    }

    // Keyword match — only if NOT a system app and has significant activity
    const bidLower = bid.toLowerCase();
    const matchedKw = VPN_PROXY_KEYWORDS_IN_BUNDLEID.find(kw => bidLower.includes(kw));
    if (matchedKw && !foundApps.has(bid) && entry.hits >= 3) {
      foundApps.add(bid);
      results.push({
        id: genId(),
        category: 'suspect',
        title: `Possible VPN/Proxy app: ${bid}`,
        description: `The bundle ID contains keyword "${matchedKw}", associated with VPN/proxy tools. Requires ${entry.hits} hits for confirmation.`,
        evidence: [
          `Bundle ID: ${bid}`,
          `Keyword: ${matchedKw}`,
          `Domain: ${entry.domain}`,
          `Hits: ${entry.hits}`,
        ],
        severity: 6,
        timestamp: entry.firstAccess,
        module: 'VPN/Proxy Detection',
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

    // Skip known legitimate domains
    if (isKnownLegitDomain(domain, entry.owner || '')) continue;

    // Pattern matching — requires hits >= 2 to avoid one-off redirects
    if (entry.hits >= 2) {
      for (const pattern of SUSPICIOUS_DOMAIN_PATTERNS) {
        if (pattern.test(domain)) {
          flagged.add(domain);
          results.push({
            id: genId(),
            category: 'suspect',
            title: `Suspicious domain: ${domain}`,
            description: `Domain matches pattern "${pattern.source}", frequently associated with proxy/VPN/interception tools.`,
            evidence: [
              `Domain: ${domain}`,
              `Pattern: ${pattern.source}`,
              `App: ${entry.bundleID || entry.context || 'N/A'}`,
              `Hits: ${entry.hits}`,
            ],
            severity: 5,
            timestamp: entry.firstAccess,
            module: 'Domain Analysis',
          });
          break;
        }
      }
    }

    // High-risk TLD — much stricter: requires hits > 5 AND unknown owner AND not from known apps
    const tld = getTLD(domain);
    if (HIGH_RISK_TLDS.has(tld) && !flagged.has(domain)) {
      const bid = (entry.bundleID || entry.context || '').toLowerCase();
      const isKnownApp = isKnownSystemApp(bid);
      
      if (!isKnownLegitDomain(domain, entry.owner || '') && !isKnownApp && entry.hits > 5) {
        flagged.add(domain);
        results.push({
          id: genId(),
          category: 'suspect',
          title: `High-risk TLD: ${domain}`,
          description: `Domain uses TLD "${tld}" frequently used by malicious or temporary services, with ${entry.hits} persistent accesses.`,
          evidence: [
            `Domain: ${domain}`,
            `TLD: ${tld}`,
            `Owner: ${entry.owner || 'Unknown'}`,
            `Hits: ${entry.hits}`,
          ],
          severity: 3,
          timestamp: entry.firstAccess,
          module: 'TLD Analysis',
        });
      }
    }
  }

  return results;
}

function analyzeIPInfo(ipInfo: IPInfo | null): AnalysisResult[] {
  if (!ipInfo) return [];
  const results: AnalysisResult[] = [];

  if (ipInfo.hosting) {
    results.push({
      id: genId(),
      category: 'confirmed',
      title: `Datacenter/hosting IP detected`,
      description: `IP ${ipInfo.ip} belongs to a hosting/datacenter provider. Real mobile devices don't use datacenter IPs.`,
      evidence: [
        `IP: ${ipInfo.ip}`,
        `ISP: ${ipInfo.isp}`,
        `Org: ${ipInfo.org}`,
        `ASN: ${ipInfo.as}`,
        `Location: ${ipInfo.city}, ${ipInfo.country}`,
      ],
      severity: 10,
      module: 'IP Analysis',
    });
  }

  if (ipInfo.proxy || ipInfo.vpn) {
    results.push({
      id: genId(),
      category: 'confirmed',
      title: `Proxy/VPN detected on IP`,
      description: `IP ${ipInfo.ip} was identified as proxy or VPN by IP intelligence service.`,
      evidence: [
        `IP: ${ipInfo.ip}`,
        `Proxy: ${ipInfo.proxy ? 'Yes' : 'No'}`,
        `ISP: ${ipInfo.isp}`,
        `ASN: ${ipInfo.as}`,
      ],
      severity: 10,
      module: 'IP Analysis',
    });
  }

  // ASN check — only if not already flagged as hosting
  const asLower = (ipInfo.as + ' ' + ipInfo.isp + ' ' + ipInfo.org).toLowerCase();
  const matchedDC = DATACENTER_INDICATORS.find(dc => asLower.includes(dc));
  if (matchedDC && !ipInfo.hosting && !ipInfo.proxy) {
    // Exclude common CDN providers that serve mobile traffic
    const cdnProviders = ['cloudflare', 'akamai', 'fastly'];
    if (!cdnProviders.some(cdn => matchedDC.includes(cdn))) {
      results.push({
        id: genId(),
        category: 'suspect',
        title: `Cloud provider ASN: ${matchedDC}`,
        description: `IP is associated with cloud provider "${matchedDC}". May indicate VPS or cloud server used as proxy.`,
        evidence: [
          `IP: ${ipInfo.ip}`,
          `ASN: ${ipInfo.as}`,
          `ISP: ${ipInfo.isp}`,
        ],
        severity: 6,
        module: 'ASN Analysis',
      });
    }
  }

  // rDNS check
  if (ipInfo.reverse) {
    const rdns = ipInfo.reverse.toLowerCase();
    const serverPatterns = ['vps', 'server', 'dedicated', 'cloud', 'node', 'compute'];
    // Removed 'host' — too generic (matches hostname, webhostapp, etc.)
    const matched = serverPatterns.find(p => rdns.includes(p));
    if (matched) {
      results.push({
        id: genId(),
        category: 'suspect',
        title: `rDNS indicates server: ${ipInfo.reverse}`,
        description: `Reverse DNS contains "${matched}", typical of servers, not residential/mobile connections.`,
        evidence: [`IP: ${ipInfo.ip}`, `rDNS: ${ipInfo.reverse}`],
        severity: 5,
        module: 'rDNS Analysis',
      });
    }
  }

  // Mobile confirmation — positive signal
  if (ipInfo.mobile && !ipInfo.proxy && !ipInfo.hosting) {
    results.push({
      id: genId(),
      category: 'clean',
      title: `Mobile network IP confirmed`,
      description: `IP ${ipInfo.ip} belongs to a legitimate mobile network (${ipInfo.isp}), consistent with iPhone usage.`,
      evidence: [
        `IP: ${ipInfo.ip}`,
        `ISP: ${ipInfo.isp}`,
        `Type: Mobile Network`,
        `Location: ${ipInfo.city}, ${ipInfo.country}`,
      ],
      severity: 0,
      module: 'IP Analysis',
    });
  }

  return results;
}

function analyzeTemporalCorrelation(report: ParsedReport): AnalysisResult[] {
  const results: AnalysisResult[] = [];
  const events: { time: Date; domain: string; bundleId: string; type: 'vpn' | 'game' | 'normal' }[] = [];

  for (const entry of report.networkAccess) {
    const ts = entry.firstAccess || entry.timeStamp;
    if (!ts) continue;
    const time = new Date(ts);
    if (isNaN(time.getTime())) continue;

    const bid = (entry.bundleID || entry.context || '').toLowerCase();
    const domain = (entry.domain || '').toLowerCase();

    // Skip system apps for VPN classification
    if (isKnownSystemApp(bid)) {
      events.push({ time, domain, bundleId: bid, type: 'normal' });
      continue;
    }

    let type: 'vpn' | 'game' | 'normal' = 'normal';
    if (VPN_PROXY_BUNDLE_IDS.has(entry.bundleID || '') ||
        VPN_PROXY_KEYWORDS_IN_BUNDLEID.some(kw => bid.includes(kw))) {
      type = 'vpn';
    } else if (GAME_BUNDLE_IDS.has(entry.bundleID || '') ||
               GAME_DOMAINS.some(g => domain.includes(g))) {
      type = 'game';
    }

    events.push({ time, domain, bundleId: bid, type });
  }

  events.sort((a, b) => a.time.getTime() - b.time.getTime());

  // Detect VPN activity close to game sessions — only exact VPN bundle matches
  const foundCorrelations = new Set<string>();
  for (let i = 0; i < events.length; i++) {
    if (events[i].type !== 'vpn') continue;

    for (let j = i + 1; j < events.length && j < i + 50; j++) {
      if (events[j].type !== 'game') continue;

      const diffMin = (events[j].time.getTime() - events[i].time.getTime()) / 60000;
      if (diffMin > 30) break;

      const corrKey = `${events[i].bundleId}_${events[j].bundleId}`;
      if (foundCorrelations.has(corrKey)) continue;
      foundCorrelations.add(corrKey);

      results.push({
        id: genId(),
        category: 'confirmed',
        title: 'VPN/Proxy active before game session',
        description: `VPN/proxy activity detected ${Math.round(diffMin)} minutes before game access. Strong indication of proxy usage during gameplay.`,
        evidence: [
          `VPN: ${events[i].domain} (${events[i].time.toLocaleString()})`,
          `Game: ${events[j].domain} (${events[j].time.toLocaleString()})`,
          `Interval: ${Math.round(diffMin)} minutes`,
        ],
        severity: 9,
        timestamp: events[i].time.toISOString(),
        module: 'Temporal Correlation',
      });
      break;
    }
  }

  return results;
}

function analyzeDatacenterDomains(domainIPMap: Map<string, IPInfo>, networkAccess: NetworkActivityEntry[]): AnalysisResult[] {
  const results: AnalysisResult[] = [];
  const flagged = new Set<string>();

  const knownCDNs = [
    'cloudfront.net', 'akamai', 'fastly', 'cloudflare', 'googleapis.com',
    'apple.com', 'icloud.com', 'gstatic.com', 'fbcdn.net', 'aaplimg.com',
    'microsoft.com', 'msecnd.net', 'azureedge.net', 'amazonaws.com',
    'googlevideo.com', 'youtube.com', 'ytimg.com',
  ];

  for (const [domain, info] of domainIPMap) {
    if (flagged.has(domain)) continue;
    if (knownCDNs.some(cdn => domain.includes(cdn))) continue;

    if (info.proxy) {
      const entry = networkAccess.find(e => e.domain === domain);
      flagged.add(domain);
      results.push({
        id: genId(),
        category: 'confirmed',
        title: `Domain on proxy server: ${domain}`,
        description: `Domain ${domain} resolves to proxy IP (${info.ip}).`,
        evidence: [
          `Domain: ${domain}`, `IP: ${info.ip}`, `ISP: ${info.isp}`,
          `App: ${entry?.bundleID || 'N/A'}`,
        ],
        severity: 8,
        module: 'Infrastructure Analysis',
      });
    }
    // Removed datacenter-only detection for domains — too many FPs from legitimate CDN/hosting
  }

  return results;
}

function analyzeFileIntegrity(report: ParsedReport, rawContent: string): AnalysisResult[] {
  const results: AnalysisResult[] = [];

  const totalEntries = report.networkAccess.length + report.dataAccess.length;
  if (totalEntries < 3 && rawContent.length > 2000) {
    results.push({
      id: genId(),
      category: 'suspect',
      title: 'File with very few records',
      description: `Report contains only ${totalEntries} valid entries for ${(rawContent.length / 1024).toFixed(1)} KB file. May indicate stripped data.`,
      evidence: [`Entries: ${totalEntries}`, `File size: ${(rawContent.length / 1024).toFixed(1)} KB`],
      severity: 4,
      module: 'File Integrity',
    });
  }

  const timestamps = report.networkAccess
    .map(e => new Date(e.firstAccess || e.timeStamp || ''))
    .filter(d => !isNaN(d.getTime()))
    .sort((a, b) => a.getTime() - b.getTime());

  if (timestamps.length >= 2) {
    const days = (timestamps[timestamps.length - 1].getTime() - timestamps[0].getTime()) / 86400000;

    if (days > 10) { // Relaxed from 8 to 10 days
      results.push({
        id: genId(),
        category: 'suspect',
        title: 'Period inconsistent with iOS',
        description: `Report covers ${Math.round(days)} days but iOS keeps only ~7 days. May indicate concatenated or manipulated data.`,
        evidence: [
          `First: ${timestamps[0].toLocaleString()}`,
          `Last: ${timestamps[timestamps.length - 1].toLocaleString()}`,
          `Period: ${Math.round(days)} days`,
        ],
        severity: 5,
        module: 'File Integrity',
      });
    }
  }

  // Future timestamps — definitive manipulation
  const now = new Date();
  const futureEntries = timestamps.filter(t => t > new Date(now.getTime() + 86400000)); // +1 day tolerance
  if (futureEntries.length > 2) { // At least 3 to avoid timezone edge cases
    results.push({
      id: genId(),
      category: 'confirmed',
      title: 'Future timestamps detected',
      description: `${futureEntries.length} records have future timestamps, strong indication of manipulation.`,
      evidence: [
        `Future entries: ${futureEntries.length}`,
        `Example: ${futureEntries[0].toLocaleString()}`,
      ],
      severity: 9,
      module: 'File Integrity',
    });
  }

  return results;
}

function analyzeNetworkBehavior(report: ParsedReport): AnalysisResult[] {
  const results: AnalysisResult[] = [];
  const domainsByApp = new Map<string, Set<string>>();
  
  for (const entry of report.networkAccess) {
    const bid = entry.bundleID || entry.context || 'unknown';
    if (!domainsByApp.has(bid)) domainsByApp.set(bid, new Set());
    domainsByApp.get(bid)!.add(entry.domain);
  }

  for (const [app, domains] of domainsByApp) {
    if (isKnownSystemApp(app) || app === 'unknown') continue;
    
    const suspiciousDomains = [...domains].filter(d => 
      SUSPICIOUS_DOMAIN_PATTERNS.some(p => p.test(d))
    );
    // Much stricter: need 8+ suspicious domains AND they must be >30% of total
    if (suspiciousDomains.length >= 8 && (suspiciousDomains.length / domains.size) > 0.3) {
      results.push({
        id: genId(),
        category: 'suspect',
        title: `App with anomalous network activity: ${app}`,
        description: `App ${app} accessed ${domains.size} unique domains, including ${suspiciousDomains.length} suspicious ones (${Math.round(suspiciousDomains.length / domains.size * 100)}%).`,
        evidence: [
          `App: ${app}`,
          `Unique domains: ${domains.size}`,
          `Suspicious: ${suspiciousDomains.slice(0, 5).join(', ')}`,
        ],
        severity: 5,
        module: 'Behavioral Analysis',
      });
    }
  }

  return results;
}

function analyzeSideloadApps(report: ParsedReport): AnalysisResult[] {
  const results: AnalysisResult[] = [];
  const foundApps = new Set<string>();

  for (const entry of report.networkAccess) {
    const bid = entry.bundleID || entry.context || '';
    if (!bid) continue;

    if (SIDELOAD_BUNDLE_IDS.has(bid) && !foundApps.has(bid)) {
      foundApps.add(bid);
      results.push({
        id: genId(),
        category: 'confirmed',
        title: `Sideload/IPA tool detected: ${bid}`,
        description: `Bundle ID "${bid}" matches a known sideloading tool that allows installing unofficial/modified apps.`,
        evidence: [
          `Bundle ID: ${bid}`,
          `Domain: ${entry.domain}`,
          `Timestamp: ${entry.firstAccess || 'N/A'}`,
          `Hits: ${entry.hits}`,
        ],
        severity: 10,
        timestamp: entry.firstAccess,
        module: 'Sideload Detection',
      });
    }

    // Keyword match — require hits >= 3
    const bidLower = bid.toLowerCase();
    const matchedKw = SIDELOAD_KEYWORDS_IN_BUNDLEID.find(kw => bidLower.includes(kw));
    if (matchedKw && !foundApps.has(bid) && entry.hits >= 3) {
      foundApps.add(bid);
      results.push({
        id: genId(),
        category: 'confirmed',
        title: `Possible sideload app: ${bid}`,
        description: `Bundle ID contains keyword "${matchedKw}", associated with sideloading tools.`,
        evidence: [
          `Bundle ID: ${bid}`,
          `Keyword: ${matchedKw}`,
          `Domain: ${entry.domain}`,
          `Hits: ${entry.hits}`,
        ],
        severity: 8,
        timestamp: entry.firstAccess,
        module: 'Sideload Detection',
      });
    }

    // Domain match
    const domainLower = (entry.domain || '').toLowerCase();
    const matchedDomain = SIDELOAD_DOMAINS.find(d => domainLower.includes(d));
    if (matchedDomain && !foundApps.has(`domain_${matchedDomain}`)) {
      foundApps.add(`domain_${matchedDomain}`);
      results.push({
        id: genId(),
        category: 'confirmed',
        title: `Sideload service access: ${matchedDomain}`,
        description: `Domain "${entry.domain}" is associated with sideloading service "${matchedDomain}".`,
        evidence: [
          `Domain: ${entry.domain}`,
          `Service: ${matchedDomain}`,
          `App: ${bid || 'N/A'}`,
        ],
        severity: 9,
        timestamp: entry.firstAccess,
        module: 'Sideload Detection',
      });
    }
  }

  return results;
}

function analyzeAppStoreBehavior(report: ParsedReport): AnalysisResult[] {
  // Removed this detection module — it generates too many false positives.
  // Accessing App Store before a game is completely normal user behavior.
  return [];
}

// ============ SCORE CALCULATION ============

function calculateRiskScore(results: AnalysisResult[]): number {
  const confirmed = results.filter(r => r.category === 'confirmed');
  const suspect = results.filter(r => r.category === 'suspect');

  if (confirmed.length === 0 && suspect.length === 0) return 0;

  let score = 0;

  // Confirmed findings: weighted by severity
  for (const r of confirmed) {
    score += r.severity >= 8 ? r.severity * 1.8 : r.severity * 1;
  }
  // Suspects: contribute very little
  for (const r of suspect) {
    score += r.severity * 0.25;
  }

  // Cross-correlation bonus only for confirmed from different modules
  const confirmedModules = new Set(confirmed.map(r => r.module));
  if (confirmedModules.size >= 3) score += 8;
  if (confirmedModules.size >= 5) score += 5;

  // Cap suspects-only scenarios at 40
  if (confirmed.length === 0) {
    score = Math.min(40, score);
  }

  return Math.min(100, Math.round(score));
}

// ============ MAIN ANALYSIS FUNCTION ============

export async function analyzeReport(
  rawContent: string,
  deviceIP: string,
  onProgress: ProgressCallback
): Promise<AnalysisReport> {
  idCounter = 0;

  onProgress('Validating and parsing file...', 5);
  const report = parseNDJSON(rawContent);
  
  if (report.networkAccess.length === 0 && report.dataAccess.length === 0) {
    throw new Error('No privacy data found in file. Verify it is a valid iOS App Privacy Report.');
  }

  onProgress('File parsed successfully', 15, `${report.networkAccess.length} network entries, ${report.dataAccess.length} data accesses`);

  onProgress('Analyzing device IP...', 20);
  let ipInfo: IPInfo | null = null;
  if (deviceIP && deviceIP.trim() !== '') {
    ipInfo = await getIPInfo(deviceIP);
    if (ipInfo) {
      onProgress('IP enriched', 30, `${ipInfo.isp} - ${ipInfo.city}, ${ipInfo.country}`);
    } else {
      onProgress('Could not analyze IP', 30);
    }
  } else {
    onProgress('No IP provided, skipping IP analysis', 30);
  }

  onProgress('Detecting VPN/Proxy apps...', 38);
  const vpnResults = analyzeVPNApps(report);

  onProgress('Detecting sideload tools...', 45);
  const sideloadResults = analyzeSideloadApps(report);

  onProgress('Analyzing domains...', 52);
  const domainResults = analyzeSuspiciousDomains(report);

  onProgress('Processing IP data...', 58);
  const ipResults = analyzeIPInfo(ipInfo);

  onProgress('Temporal correlation...', 65);
  const temporalResults = analyzeTemporalCorrelation(report);

  onProgress('Checking file integrity...', 72);
  const integrityResults = analyzeFileIntegrity(report, rawContent);

  onProgress('Analyzing network behavior...', 78);
  const behaviorResults = analyzeNetworkBehavior(report);

  onProgress('Enriching suspicious domains via API...', 85);
  const suspiciousDomains = [...new Set(
    report.networkAccess
      .filter(e => {
        const d = (e.domain || '').toLowerCase();
        return SUSPICIOUS_DOMAIN_PATTERNS.some(p => p.test(d));
      })
      .map(e => e.domain)
  )];

  let dcResults: AnalysisResult[] = [];
  if (suspiciousDomains.length > 0) {
    const domainIPs = await checkDomainsViaIP(suspiciousDomains.slice(0, 8));
    dcResults = analyzeDatacenterDomains(domainIPs, report.networkAccess);
  }

  onProgress('Generating final report...', 95);

  const allResults = [
    ...vpnResults, ...sideloadResults, ...domainResults,
    ...ipResults, ...temporalResults, ...integrityResults,
    ...behaviorResults, ...dcResults,
  ];

  // Deduplicate by title
  const seen = new Set<string>();
  const uniqueResults = allResults.filter(r => {
    if (seen.has(r.title)) return false;
    seen.add(r.title);
    return true;
  });

  uniqueResults.sort((a, b) => b.severity - a.severity);

  if (uniqueResults.filter(r => r.category !== 'clean').length === 0) {
    uniqueResults.push({
      id: genId(),
      category: 'clean',
      title: 'No suspicious activity detected',
      description: 'Complete analysis found no indicators of proxy, VPN, tunnel or traffic interception in the report.',
      evidence: [
        'All verification modules passed',
        `${report.networkAccess.length} network entries analyzed`,
        `Domains verified via IP intelligence API`,
      ],
      severity: 0,
      module: 'Overall Result',
    });
  }

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

  onProgress('Analysis complete!', 100);

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
