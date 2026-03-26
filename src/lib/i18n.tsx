// Internationalization system for Scanner 299

export type Locale = 'pt-BR' | 'en' | 'es';

const translations: Record<Locale, Record<string, string>> = {
  'pt-BR': {
    // Navbar
    'nav.scanner': 'Scanner',
    'nav.features': 'Funcionalidades',
    'nav.blacklist': 'Blacklist',
    'nav.terms': 'Termos',
    'nav.privacy': 'Privacidade',

    // Hero
    'hero.title': 'Scanner 299',
    'hero.subtitle': 'Análise avançada de relatórios de privacidade do iOS com verificação de IP em tempo real via APIs de inteligência.',

    // Upload
    'upload.title': 'Upload do App Privacy Report',
    'upload.desc': 'Arraste o arquivo ou clique para selecionar (.json, .ndjson)',
    'upload.ip_label': 'IP do dispositivo analisado',
    'upload.ip_placeholder': 'Ex: 189.44.72.103',
    'upload.ip_hint': 'O IP será verificado em tempo real via API para detectar VPN, proxy, datacenter e geolocalização.',
    'upload.analyze': 'Iniciar Análise',
    'upload.analyzing': 'Analisando em tempo real...',

    // Features mini
    'feat.modules': '10 Módulos',
    'feat.modules_desc': 'Análise completa multi-camada',
    'feat.realtime': 'Tempo Real',
    'feat.realtime_desc': 'APIs de IP ao vivo',
    'feat.privacy': 'Privacidade',
    'feat.privacy_desc': 'Processamento no navegador',
    'feat.ipintel': 'IP Intel',
    'feat.ipintel_desc': 'Verificação VPN/Proxy/DC',

    // Results
    'results.back': 'Nova análise',
    'results.export': 'Exportar',
    'results.score_based': 'Score baseado em {count} verificações',
    'results.ip_intelligence': 'Inteligência de IP',
    'results.ip_na': 'IP não informado ou indisponível',
    'results.period': 'Período',
    'results.domains': 'Domínios',
    'results.apps': 'Apps',
    'results.entries': 'Entradas',
    'results.clean': 'Limpo',
    'results.suspect': 'Suspeito',
    'results.confirmed': 'Confirmado',
    'results.search': 'Buscar nos resultados...',
    'results.no_results': 'Nenhum resultado encontrado',
    'results.top_apps': 'Top Apps por Atividade de Rede',
    'results.preview': 'Prévia dos resultados',
    'results.device_info': 'Informações do Dispositivo',
    'results.network_events': 'Eventos de Rede',

    // Result card
    'card.evidence': 'Evidências:',
    'card.severity': 'Severidade: {val}/10',

    // Blacklist
    'blacklist.title': 'Blacklist de Dispositivos',
    'blacklist.subtitle': 'Dispositivos banidos automaticamente por irregularidades confirmadas.',
    'blacklist.empty': 'Nenhum dispositivo na blacklist ainda.',
    'blacklist.empty_hint': 'Quando uma análise confirmar irregularidades, o dispositivo será registrado aqui automaticamente.',
    'blacklist.model': 'Modelo',
    'blacklist.serial': 'Serial/ID',
    'blacklist.reason': 'Motivo',
    'blacklist.date': 'Data do Banimento',
    'blacklist.risk': 'Risco',
    'blacklist.details': 'Detalhes',
    'blacklist.export': 'Exportar Blacklist',

    // Device info
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

    // Modules
    'mod.vpn': 'Detecção de Apps VPN/Proxy',
    'mod.domains': 'Análise de Domínios',
    'mod.tld': 'Análise de TLD',
    'mod.ip': 'Análise de IP',
    'mod.asn': 'Análise de ASN',
    'mod.rdns': 'Análise de rDNS',
    'mod.temporal': 'Correlação Temporal',
    'mod.integrity': 'Integridade do Arquivo',
    'mod.behavior': 'Análise Comportamental',
    'mod.infra': 'Análise de Infraestrutura',
    'mod.ipa': 'Detecção de IPA/Sideload',
    'mod.network': 'Monitoramento de Rede',
    'mod.general': 'Resultado Geral',

    // Network monitoring
    'net.change_detected': 'Mudança de rede detectada',
    'net.ip_changed': 'IP alterado durante análise',
    'net.connection_changed': 'Tipo de conexão alterado',
  },

  'en': {
    'nav.scanner': 'Scanner',
    'nav.features': 'Features',
    'nav.blacklist': 'Blacklist',
    'nav.terms': 'Terms',
    'nav.privacy': 'Privacy',

    'hero.title': 'Scanner 299',
    'hero.subtitle': 'Advanced iOS privacy report analysis with real-time IP verification via intelligence APIs.',

    'upload.title': 'Upload App Privacy Report',
    'upload.desc': 'Drag & drop or click to select (.json, .ndjson)',
    'upload.ip_label': 'Device IP address',
    'upload.ip_placeholder': 'E.g.: 189.44.72.103',
    'upload.ip_hint': 'The IP will be checked in real-time via API to detect VPN, proxy, datacenter, and geolocation.',
    'upload.analyze': 'Start Analysis',
    'upload.analyzing': 'Analyzing in real-time...',

    'feat.modules': '10 Modules',
    'feat.modules_desc': 'Complete multi-layer analysis',
    'feat.realtime': 'Real-Time',
    'feat.realtime_desc': 'Live IP APIs',
    'feat.privacy': 'Privacy',
    'feat.privacy_desc': 'In-browser processing',
    'feat.ipintel': 'IP Intel',
    'feat.ipintel_desc': 'VPN/Proxy/DC check',

    'results.back': 'New analysis',
    'results.export': 'Export',
    'results.score_based': 'Score based on {count} checks',
    'results.ip_intelligence': 'IP Intelligence',
    'results.ip_na': 'IP not provided or unavailable',
    'results.period': 'Period',
    'results.domains': 'Domains',
    'results.apps': 'Apps',
    'results.entries': 'Entries',
    'results.clean': 'Clean',
    'results.suspect': 'Suspect',
    'results.confirmed': 'Confirmed',
    'results.search': 'Search results...',
    'results.no_results': 'No results found',
    'results.top_apps': 'Top Apps by Network Activity',
    'results.preview': 'Results preview',
    'results.device_info': 'Device Information',
    'results.network_events': 'Network Events',

    'card.evidence': 'Evidence:',
    'card.severity': 'Severity: {val}/10',

    'blacklist.title': 'Device Blacklist',
    'blacklist.subtitle': 'Devices automatically banned due to confirmed irregularities.',
    'blacklist.empty': 'No devices on the blacklist yet.',
    'blacklist.empty_hint': 'When an analysis confirms irregularities, the device will be automatically registered here.',
    'blacklist.model': 'Model',
    'blacklist.serial': 'Serial/ID',
    'blacklist.reason': 'Reason',
    'blacklist.date': 'Ban Date',
    'blacklist.risk': 'Risk',
    'blacklist.details': 'Details',
    'blacklist.export': 'Export Blacklist',

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

    'mod.vpn': 'VPN/Proxy App Detection',
    'mod.domains': 'Domain Analysis',
    'mod.tld': 'TLD Analysis',
    'mod.ip': 'IP Analysis',
    'mod.asn': 'ASN Analysis',
    'mod.rdns': 'rDNS Analysis',
    'mod.temporal': 'Temporal Correlation',
    'mod.integrity': 'File Integrity',
    'mod.behavior': 'Behavioral Analysis',
    'mod.infra': 'Infrastructure Analysis',
    'mod.ipa': 'IPA/Sideload Detection',
    'mod.network': 'Network Monitoring',
    'mod.general': 'Overall Result',

    'net.change_detected': 'Network change detected',
    'net.ip_changed': 'IP changed during analysis',
    'net.connection_changed': 'Connection type changed',
  },

  'es': {
    'nav.scanner': 'Escáner',
    'nav.features': 'Funciones',
    'nav.blacklist': 'Blacklist',
    'nav.terms': 'Términos',
    'nav.privacy': 'Privacidad',

    'hero.title': 'Scanner 299',
    'hero.subtitle': 'Análisis avanzado de informes de privacidad de iOS con verificación de IP en tiempo real.',

    'upload.title': 'Subir Informe de Privacidad',
    'upload.desc': 'Arrastra o haz clic para seleccionar (.json, .ndjson)',
    'upload.ip_label': 'IP del dispositivo analizado',
    'upload.ip_placeholder': 'Ej: 189.44.72.103',
    'upload.ip_hint': 'El IP será verificado en tiempo real vía API para detectar VPN, proxy, datacenter y geolocalización.',
    'upload.analyze': 'Iniciar Análisis',
    'upload.analyzing': 'Analizando en tiempo real...',

    'feat.modules': '10 Módulos',
    'feat.modules_desc': 'Análisis completo multicapa',
    'feat.realtime': 'Tiempo Real',
    'feat.realtime_desc': 'APIs de IP en vivo',
    'feat.privacy': 'Privacidad',
    'feat.privacy_desc': 'Procesamiento en navegador',
    'feat.ipintel': 'IP Intel',
    'feat.ipintel_desc': 'Verificación VPN/Proxy/DC',

    'results.back': 'Nuevo análisis',
    'results.export': 'Exportar',
    'results.score_based': 'Score basado en {count} verificaciones',
    'results.ip_intelligence': 'Inteligencia de IP',
    'results.ip_na': 'IP no proporcionado o no disponible',
    'results.period': 'Período',
    'results.domains': 'Dominios',
    'results.apps': 'Apps',
    'results.entries': 'Entradas',
    'results.clean': 'Limpio',
    'results.suspect': 'Sospechoso',
    'results.confirmed': 'Confirmado',
    'results.search': 'Buscar en resultados...',
    'results.no_results': 'No se encontraron resultados',
    'results.top_apps': 'Top Apps por Actividad de Red',
    'results.preview': 'Vista previa de resultados',
    'results.device_info': 'Información del Dispositivo',
    'results.network_events': 'Eventos de Red',

    'card.evidence': 'Evidencias:',
    'card.severity': 'Severidad: {val}/10',

    'blacklist.title': 'Blacklist de Dispositivos',
    'blacklist.subtitle': 'Dispositivos baneados automáticamente por irregularidades confirmadas.',
    'blacklist.empty': 'Ningún dispositivo en la blacklist aún.',
    'blacklist.empty_hint': 'Cuando un análisis confirme irregularidades, el dispositivo será registrado aquí automáticamente.',
    'blacklist.model': 'Modelo',
    'blacklist.serial': 'Serial/ID',
    'blacklist.reason': 'Motivo',
    'blacklist.date': 'Fecha de Baneo',
    'blacklist.risk': 'Riesgo',
    'blacklist.details': 'Detalles',
    'blacklist.export': 'Exportar Blacklist',

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

    'mod.vpn': 'Detección de Apps VPN/Proxy',
    'mod.domains': 'Análisis de Dominios',
    'mod.tld': 'Análisis de TLD',
    'mod.ip': 'Análisis de IP',
    'mod.asn': 'Análisis de ASN',
    'mod.rdns': 'Análisis de rDNS',
    'mod.temporal': 'Correlación Temporal',
    'mod.integrity': 'Integridad del Archivo',
    'mod.behavior': 'Análisis de Comportamiento',
    'mod.infra': 'Análisis de Infraestructura',
    'mod.ipa': 'Detección de IPA/Sideload',
    'mod.network': 'Monitoreo de Red',
    'mod.general': 'Resultado General',

    'net.change_detected': 'Cambio de red detectado',
    'net.ip_changed': 'IP cambiado durante análisis',
    'net.connection_changed': 'Tipo de conexión cambiado',
  },
};

// Context with React
import { createContext, useContext, useState as reactUseState, useCallback, type ReactNode } from 'react';

function getStoredLocale(): Locale {
  try {
    const stored = localStorage.getItem('scanner299_locale');
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
    try { localStorage.setItem('scanner299_locale', l); } catch {}
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
