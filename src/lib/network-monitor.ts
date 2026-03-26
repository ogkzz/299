// Real-time network monitoring during analysis
// Detects IP changes, network switches, VPN toggles

export interface NetworkEvent {
  type: 'ip_change' | 'connection_change' | 'offline' | 'online' | 'vpn_toggle';
  timestamp: string;
  details: string;
  oldValue?: string;
  newValue?: string;
}

export interface NetworkMonitorState {
  events: NetworkEvent[];
  currentIP: string | null;
  connectionType: string | null;
  isMonitoring: boolean;
}

type NetworkEventCallback = (event: NetworkEvent) => void;

export class NetworkMonitor {
  private events: NetworkEvent[] = [];
  private currentIP: string | null = null;
  private connectionType: string | null = null;
  private intervalId: number | null = null;
  private onEvent: NetworkEventCallback;
  private isRunning = false;

  constructor(onEvent: NetworkEventCallback) {
    this.onEvent = onEvent;
  }

  async start(initialIP?: string) {
    if (this.isRunning) return;
    this.isRunning = true;
    this.events = [];

    // Set initial IP
    if (initialIP) {
      this.currentIP = initialIP;
    } else {
      this.currentIP = await this.fetchPublicIP();
    }

    // Detect connection type
    this.connectionType = this.getConnectionType();

    // Listen for online/offline events
    window.addEventListener('online', this.handleOnline);
    window.addEventListener('offline', this.handleOffline);

    // Poll for IP changes every 10 seconds
    this.intervalId = window.setInterval(() => this.checkForChanges(), 10000);
  }

  stop(): NetworkEvent[] {
    this.isRunning = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    window.removeEventListener('online', this.handleOnline);
    window.removeEventListener('offline', this.handleOffline);
    return [...this.events];
  }

  getEvents(): NetworkEvent[] {
    return [...this.events];
  }

  private handleOnline = () => {
    this.addEvent({
      type: 'online',
      timestamp: new Date().toISOString(),
      details: 'Device reconnected to network',
    });
    // Re-check IP after reconnection
    setTimeout(() => this.checkForChanges(), 2000);
  };

  private handleOffline = () => {
    this.addEvent({
      type: 'offline',
      timestamp: new Date().toISOString(),
      details: 'Device went offline - possible network switch attempt',
    });
  };

  private async checkForChanges() {
    if (!this.isRunning) return;

    // Check connection type change (wifi <-> cellular)
    const newConnType = this.getConnectionType();
    if (newConnType && this.connectionType && newConnType !== this.connectionType) {
      this.addEvent({
        type: 'connection_change',
        timestamp: new Date().toISOString(),
        details: `Connection changed from ${this.connectionType} to ${newConnType}`,
        oldValue: this.connectionType,
        newValue: newConnType,
      });
      this.connectionType = newConnType;
    }

    // Check IP change
    const newIP = await this.fetchPublicIP();
    if (newIP && this.currentIP && newIP !== this.currentIP) {
      this.addEvent({
        type: 'ip_change',
        timestamp: new Date().toISOString(),
        details: `IP changed from ${this.currentIP} to ${newIP}`,
        oldValue: this.currentIP,
        newValue: newIP,
      });
      this.currentIP = newIP;
    }
  }

  private getConnectionType(): string | null {
    const nav = navigator as Navigator & { connection?: { effectiveType?: string; type?: string } };
    if (nav.connection) {
      return nav.connection.type || nav.connection.effectiveType || 'unknown';
    }
    return navigator.onLine ? 'online' : 'offline';
  }

  private async fetchPublicIP(): Promise<string | null> {
    try {
      const res = await fetch('https://api.ipify.org?format=json', {
        signal: AbortSignal.timeout(5000),
      });
      if (!res.ok) return null;
      const data = await res.json();
      return data.ip || null;
    } catch {
      try {
        const res = await fetch('https://api64.ipify.org?format=json', {
          signal: AbortSignal.timeout(5000),
        });
        if (!res.ok) return null;
        const data = await res.json();
        return data.ip || null;
      } catch {
        return null;
      }
    }
  }

  private addEvent(event: NetworkEvent) {
    this.events.push(event);
    this.onEvent(event);
  }
}
