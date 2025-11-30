import type { NetworkStatus } from '@/types/errors';
import { errorLogger } from './error-logger';

class NetworkMonitor {
  private listeners: Array<(online: boolean) => void> = [];
  private _isOnline: boolean = true;

  constructor() {
    if (typeof window !== 'undefined') {
      this._isOnline = navigator.onLine;
      this.setupListeners();
    }
  }

  private setupListeners(): void {
    window.addEventListener('online', () => {
      this._isOnline = true;
      this.notifyListeners(true);
      console.log('[NetworkMonitor] Network connection restored');
    });

    window.addEventListener('offline', () => {
      this._isOnline = false;
      this.notifyListeners(false);

      errorLogger.log(new Error('Network connection lost'), {
        networkError: true,
      });
    });
  }

  private notifyListeners(online: boolean): void {
    this.listeners.forEach((listener) => {
      try {
        listener(online);
      } catch (error) {
        console.error('[NetworkMonitor] Listener error:', error);
      }
    });
  }

  public isOnline(): boolean {
    return this._isOnline;
  }

  public getStatus(): NetworkStatus {
    const status: NetworkStatus = {
      online: this._isOnline,
    };

    if (typeof navigator !== 'undefined' && 'connection' in navigator) {
      const connection = (navigator as any).connection;
      if (connection) {
        status.effectiveType = connection.effectiveType;
        status.downlink = connection.downlink;
        status.rtt = connection.rtt;
      }
    }

    return status;
  }

  public subscribe(listener: (online: boolean) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  public waitForConnection(timeout: number = 30000): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this._isOnline) {
        resolve();
        return;
      }

      const timeoutId = setTimeout(() => {
        cleanup();
        reject(new Error('Network connection timeout'));
      }, timeout);

      const cleanup = this.subscribe((online) => {
        if (online) {
          clearTimeout(timeoutId);
          cleanup();
          resolve();
        }
      });
    });
  }
}

export const networkMonitor = new NetworkMonitor();
