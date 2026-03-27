export type Locale = 'pt-BR' | 'en' | 'es';

const translations: Record<Locale, Record<string, string>> = {
  'pt-BR': {
    'nav.scanner': 'Scanner',
    'nav.features': 'Módulos',
    'nav.blacklist': 'Blacklist',
    'nav.terms': 'Termos',
    'nav.privacy': 'Privacidade',

    'hero.title': 'Magisk',
    'hero.subtitle': 'Scanner forense iOS com detecção avançada de proxy, VPN, sideload e comportamento anômalo em tempo real.',
    'hero.badge': 'Scanner Forense iOS',

    'upload.title': 'Upload do Relatório',
    'upload.desc': 'Arraste o App Privacy Report ou Sysdiagnose (.json, .ndjson, .tar.gz)',
    'upload.ip_label': 'IP do dispositivo',
    'upload.ip_placeholder': 'Ex: 189.44.72.103',
    'upload.ip_hint': 'Verificado em tempo real via API — detecta VPN, proxy, datacenter e geolocalização.',
    'upload.analyze': 'Iniciar Escaneamento',
    'upload.analyzing': 'Escaneando...',
    'upload.sysdiagnose_title': 'Sysdiagnose (Opcional)',
    'upload.sysdiagnose_desc': 'Upload do arquivo Sysdiagnose para análise profunda de logs iOS.',
    'upload.sysdiagnose_guide': 'Como gerar o Sysdiagnose',
    'upload.sysdiagnose_step1': '1. No iPhone, pressione simultaneamente Vol+ Vol- e Power por 1.5s',
    'upload.sysdiagnose_step2': '2. Aguarde ~10 min para a geração completa',
    'upload.sysdiagnose_step3': '3. Vá em Ajustes > Privacidade > Análises e Melhorias > Dados de Análise',
    'upload.sysdiagnose_step4': '4. Encontre o arquivo sysdiagnose_*.tar.gz e compartilhe',

    'feat.modules': '16+ Módulos',
    'feat.modules_desc': 'Análise forense multicamada',
    'feat.realtime': 'Tempo Real',
    'feat.realtime_desc': 'APIs ao vivo + monitor de rede',
    'feat.privacy': 'Anti-Evasão',
    'feat.privacy_desc': 'Detecta troca de rede/IP',
    'feat.ipintel': 'IP Intel',
    'feat.ipintel_desc': 'Proxy/VPN/DC/ASN check',
    'feat.sideload': 'Sideload',
    'feat.sideload_desc': 'KSign, ESign, GBox, IPA',
    'feat.sysdiag': 'Sysdiagnose',
    'feat.sysdiag_desc': 'Logs profundos do iOS',

    'results.back': 'Nova análise',
    'results.export': 'Exportar JSON',
    'results.score_based': 'Score baseado em {count} verificações',
    'results.ip_intelligence': 'Inteligência de IP',
    'results.ip_na': 'IP não informado',
    'results.period': 'Período',
    'results.domains': 'Domínios',
    'results.apps': 'Apps',
    'results.entries': 'Entradas',
    'results.clean': 'Limpo',
    'results.suspect': 'Suspeito',
    'results.confirmed': 'Confirmado',
    'results.search': 'Buscar resultados...',
    'results.no_results': 'Nenhum resultado',
    'results.top_apps': 'Top Apps por Atividade',
    'results.preview': 'Prévia do scanner',
    'results.device_info': 'Dispositivo',
    'results.network_events': 'Eventos de Rede (Monitor)',
    'results.terminal': 'Log do Scanner',
    'results.findings': 'Descobertas',

    'card.evidence': 'Evidências:',
    'card.severity': 'Severidade: {val}/10',

    'blacklist.title': 'Blacklist',
    'blacklist.subtitle': 'Dispositivos banidos automaticamente por irregularidades confirmadas.',
    'blacklist.empty': 'Nenhum dispositivo banido.',
    'blacklist.empty_hint': 'Dispositivos são adicionados automaticamente quando a análise confirma irregularidades.',
    'blacklist.model': 'Modelo',
    'blacklist.serial': 'Serial/ID',
    'blacklist.reason': 'Motivo',
    'blacklist.date': 'Data',
    'blacklist.risk': 'Risco',
    'blacklist.details': 'Detalhes',
    'blacklist.export': 'Exportar',

    'device.model': 'Modelo',
    'device.ip': 'IP',
    'device.location': 'Localização',
    'device.isp': 'ISP',
    'device.type': 'Tipo',
    'device.mobile': '📱 Móvel',
    'device.fixed': '🖥 Fixo',
    'device.proxy': '🔴 Proxy/VPN',
    'device.hosting': '🔴 Hosting/DC',
    'device.asn': 'ASN',

    'terminal.starting': 'Iniciando Magisk Scanner v2.0...',
    'terminal.parsing': 'Parseando relatório de privacidade...',
    'terminal.ip_check': 'Verificando IP: {ip}',
    'terminal.module': 'Executando módulo: {name}',
    'terminal.found': 'DETECTADO: {item}',
    'terminal.clean': 'OK: Nenhuma anomalia em {module}',
    'terminal.complete': 'Análise completa. Score de risco: {score}/100',
    'terminal.network_alert': 'ALERTA DE REDE: {details}',
  },

  'en': {
    'nav.scanner': 'Scanner',
    'nav.features': 'Modules',
    'nav.blacklist': 'Blacklist',
    'nav.terms': 'Terms',
    'nav.privacy': 'Privacy',

    'hero.title': 'Magisk',
    'hero.subtitle': 'iOS forensic scanner with advanced real-time detection of proxy, VPN, sideloading and anomalous behavior.',
    'hero.badge': 'iOS Forensic Scanner',

    'upload.title': 'Upload Report',
    'upload.desc': 'Drag App Privacy Report or Sysdiagnose (.json, .ndjson, .tar.gz)',
    'upload.ip_label': 'Device IP',
    'upload.ip_placeholder': 'E.g.: 189.44.72.103',
    'upload.ip_hint': 'Verified in real-time via API — detects VPN, proxy, datacenter and geolocation.',
    'upload.analyze': 'Start Scan',
    'upload.analyzing': 'Scanning...',
    'upload.sysdiagnose_title': 'Sysdiagnose (Optional)',
    'upload.sysdiagnose_desc': 'Upload Sysdiagnose file for deep iOS log analysis.',
    'upload.sysdiagnose_guide': 'How to generate Sysdiagnose',
    'upload.sysdiagnose_step1': '1. On iPhone, press Vol+ Vol- and Power simultaneously for 1.5s',
    'upload.sysdiagnose_step2': '2. Wait ~10 min for full generation',
    'upload.sysdiagnose_step3': '3. Go to Settings > Privacy > Analytics & Improvements > Analytics Data',
    'upload.sysdiagnose_step4': '4. Find sysdiagnose_*.tar.gz and share it',

    'feat.modules': '16+ Modules',
    'feat.modules_desc': 'Multi-layer forensic analysis',
    'feat.realtime': 'Real-Time',
    'feat.realtime_desc': 'Live APIs + network monitor',
    'feat.privacy': 'Anti-Evasion',
    'feat.privacy_desc': 'Detects network/IP switching',
    'feat.ipintel': 'IP Intel',
    'feat.ipintel_desc': 'Proxy/VPN/DC/ASN check',
    'feat.sideload': 'Sideload',
    'feat.sideload_desc': 'KSign, ESign, GBox, IPA',
    'feat.sysdiag': 'Sysdiagnose',
    'feat.sysdiag_desc': 'Deep iOS logs',

    'results.back': 'New scan',
    'results.export': 'Export JSON',
    'results.score_based': 'Score based on {count} checks',
    'results.ip_intelligence': 'IP Intelligence',
    'results.ip_na': 'IP not provided',
    'results.period': 'Period',
    'results.domains': 'Domains',
    'results.apps': 'Apps',
    'results.entries': 'Entries',
    'results.clean': 'Clean',
    'results.suspect': 'Suspect',
    'results.confirmed': 'Confirmed',
    'results.search': 'Search results...',
    'results.no_results': 'No results',
    'results.top_apps': 'Top Apps by Activity',
    'results.preview': 'Scanner preview',
    'results.device_info': 'Device',
    'results.network_events': 'Network Events (Monitor)',
    'results.terminal': 'Scanner Log',
    'results.findings': 'Findings',

    'card.evidence': 'Evidence:',
    'card.severity': 'Severity: {val}/10',

    'blacklist.title': 'Blacklist',
    'blacklist.subtitle': 'Devices automatically banned due to confirmed irregularities.',
    'blacklist.empty': 'No banned devices.',
    'blacklist.empty_hint': 'Devices are added automatically when analysis confirms irregularities.',
    'blacklist.model': 'Model',
    'blacklist.serial': 'Serial/ID',
    'blacklist.reason': 'Reason',
    'blacklist.date': 'Date',
    'blacklist.risk': 'Risk',
    'blacklist.details': 'Details',
    'blacklist.export': 'Export',

    'device.model': 'Model',
    'device.ip': 'IP',
    'device.location': 'Location',
    'device.isp': 'ISP',
    'device.type': 'Type',
    'device.mobile': '📱 Mobile',
    'device.fixed': '🖥 Fixed',
    'device.proxy': '🔴 Proxy/VPN',
    'device.hosting': '🔴 Hosting/DC',
    'device.asn': 'ASN',

    'terminal.starting': 'Starting Magisk Scanner v2.0...',
    'terminal.parsing': 'Parsing privacy report...',
    'terminal.ip_check': 'Checking IP: {ip}',
    'terminal.module': 'Running module: {name}',
    'terminal.found': 'DETECTED: {item}',
    'terminal.clean': 'OK: No anomalies in {module}',
    'terminal.complete': 'Analysis complete. Risk score: {score}/100',
    'terminal.network_alert': 'NETWORK ALERT: {details}',
  },

  'es': {
    'nav.scanner': 'Escáner',
    'nav.features': 'Módulos',
    'nav.blacklist': 'Blacklist',
    'nav.terms': 'Términos',
    'nav.privacy': 'Privacidad',

    'hero.title': 'Magisk',
    'hero.subtitle': 'Escáner forense iOS con detección avanzada en tiempo real de proxy, VPN, sideloading y comportamiento anómalo.',
    'hero.badge': 'Escáner Forense iOS',

    'upload.title': 'Subir Informe',
    'upload.desc': 'Arrastra el App Privacy Report o Sysdiagnose (.json, .ndjson, .tar.gz)',
    'upload.ip_label': 'IP del dispositivo',
    'upload.ip_placeholder': 'Ej: 189.44.72.103',
    'upload.ip_hint': 'Verificado en tiempo real vía API — detecta VPN, proxy, datacenter y geolocalización.',
    'upload.analyze': 'Iniciar Escaneo',
    'upload.analyzing': 'Escaneando...',
    'upload.sysdiagnose_title': 'Sysdiagnose (Opcional)',
    'upload.sysdiagnose_desc': 'Sube el archivo Sysdiagnose para análisis profundo de logs iOS.',
    'upload.sysdiagnose_guide': 'Cómo generar Sysdiagnose',
    'upload.sysdiagnose_step1': '1. En el iPhone, presiona Vol+ Vol- y Power simultáneamente por 1.5s',
    'upload.sysdiagnose_step2': '2. Espera ~10 min para la generación completa',
    'upload.sysdiagnose_step3': '3. Ve a Ajustes > Privacidad > Análisis y Mejoras > Datos de Análisis',
    'upload.sysdiagnose_step4': '4. Encuentra sysdiagnose_*.tar.gz y compártelo',

    'feat.modules': '16+ Módulos',
    'feat.modules_desc': 'Análisis forense multicapa',
    'feat.realtime': 'Tiempo Real',
    'feat.realtime_desc': 'APIs en vivo + monitor de red',
    'feat.privacy': 'Anti-Evasión',
    'feat.privacy_desc': 'Detecta cambio de red/IP',
    'feat.ipintel': 'IP Intel',
    'feat.ipintel_desc': 'Proxy/VPN/DC/ASN check',
    'feat.sideload': 'Sideload',
    'feat.sideload_desc': 'KSign, ESign, GBox, IPA',
    'feat.sysdiag': 'Sysdiagnose',
    'feat.sysdiag_desc': 'Logs profundos de iOS',

    'results.back': 'Nuevo escaneo',
    'results.export': 'Exportar JSON',
    'results.score_based': 'Score basado en {count} verificaciones',
    'results.ip_intelligence': 'Inteligencia de IP',
    'results.ip_na': 'IP no proporcionado',
    'results.period': 'Período',
    'results.domains': 'Dominios',
    'results.apps': 'Apps',
    'results.entries': 'Entradas',
    'results.clean': 'Limpio',
    'results.suspect': 'Sospechoso',
    'results.confirmed': 'Confirmado',
    'results.search': 'Buscar resultados...',
    'results.no_results': 'Sin resultados',
    'results.top_apps': 'Top Apps por Actividad',
    'results.preview': 'Vista previa del escáner',
    'results.device_info': 'Dispositivo',
    'results.network_events': 'Eventos de Red (Monitor)',
    'results.terminal': 'Log del Escáner',
    'results.findings': 'Hallazgos',

    'card.evidence': 'Evidencias:',
    'card.severity': 'Severidad: {val}/10',

    'blacklist.title': 'Blacklist',
    'blacklist.subtitle': 'Dispositivos baneados automáticamente por irregularidades confirmadas.',
    'blacklist.empty': 'Sin dispositivos baneados.',
    'blacklist.empty_hint': 'Los dispositivos se agregan automáticamente cuando el análisis confirma irregularidades.',
    'blacklist.model': 'Modelo',
    'blacklist.serial': 'Serial/ID',
    'blacklist.reason': 'Motivo',
    'blacklist.date': 'Fecha',
    'blacklist.risk': 'Riesgo',
    'blacklist.details': 'Detalles',
    'blacklist.export': 'Exportar',

    'device.model': 'Modelo',
    'device.ip': 'IP',
    'device.location': 'Ubicación',
    'device.isp': 'ISP',
    'device.type': 'Tipo',
    'device.mobile': '📱 Móvil',
    'device.fixed': '🖥 Fijo',
    'device.proxy': '🔴 Proxy/VPN',
    'device.hosting': '🔴 Hosting/DC',
    'device.asn': 'ASN',

    'terminal.starting': 'Iniciando Magisk Scanner v2.0...',
    'terminal.parsing': 'Parseando informe de privacidad...',
    'terminal.ip_check': 'Verificando IP: {ip}',
    'terminal.module': 'Ejecutando módulo: {name}',
    'terminal.found': 'DETECTADO: {item}',
    'terminal.clean': 'OK: Sin anomalías en {module}',
    'terminal.complete': 'Análisis completo. Score de riesgo: {score}/100',
    'terminal.network_alert': 'ALERTA DE RED: {details}',
  },
};

import { createContext, useContext, useState as reactUseState, useCallback, type ReactNode } from 'react';

function getStoredLocale(): Locale {
  try {
    const stored = localStorage.getItem('magisk_locale');
    if (stored && (stored === 'pt-BR' || stored === 'en' || stored === 'es')) return stored;
  } catch {}
  const nav = navigator.language;
  if (nav.startsWith('pt')) return 'pt-BR';
  if (nav.startsWith('es')) return 'es';
  return 'en';
}

interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}

const I18nContext = createContext<I18nContextType>({
  locale: 'pt-BR',
  setLocale: () => {},
  t: (key) => key,
});

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = reactUseState<Locale>(getStoredLocale);

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    try { localStorage.setItem('magisk_locale', l); } catch {}
  }, []);

  const t = useCallback((key: string, params?: Record<string, string | number>): string => {
    let text = translations[locale]?.[key] || translations['pt-BR']?.[key] || key;
    if (params) {
      for (const [k, v] of Object.entries(params)) {
        text = text.replace(`{${k}}`, String(v));
      }
    }
    return text;
  }, [locale]);

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  return useContext(I18nContext);
}

export const LOCALE_OPTIONS: { value: Locale; label: string; flag: string }[] = [
  { value: 'pt-BR', label: 'Português', flag: '🇧🇷' },
  { value: 'en', label: 'English', flag: '🇺🇸' },
  { value: 'es', label: 'Español', flag: '🇪🇸' },
];
