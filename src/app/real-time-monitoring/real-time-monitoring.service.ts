import { Injectable, NgZone } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { CURRENT_API_URL } from '../core/serachpage/api-urls';

export interface AlertEvent {
  alertType: string;
  userEmail: string;
  details: string;
  severity: 'HIGH' | 'MEDIUM' | 'LOW' | string;
  timestamp: string;
}

@Injectable()
export class RealTimeMonitoringService {
  private readonly alertsSubject = new BehaviorSubject<AlertEvent[]>([]);
  public readonly alerts$ = this.alertsSubject.asObservable();

  private es?: EventSource;

  constructor(private http: HttpClient, private zone: NgZone) {}

  // Snapshot getter for current alerts
  get alertsSnapshot(): AlertEvent[] {
    return this.alertsSubject.value;
  }

  // Public helper to prepend a new alert (used by test button)
  prependAlert(alert: AlertEvent): void {
    const current = this.alertsSubject.value || [];
    this.alertsSubject.next([alert, ...current].slice(0, 100));
  }

  // REST: get last N alerts (history / refresh / fallback)
  getAlerts(limit: number = 20): Observable<AlertEvent[]> {
    return this.http.get<AlertEvent[]>(
      `${CURRENT_API_URL}/server/api/diracai/monitoring/alerts?limit=${limit}`
    );
  }

  // SSE: live stream
  connectStream(): void {
    this.disconnect();

    const url = `${CURRENT_API_URL}/server/api/diracai/monitoring/stream`;
    this.es = new EventSource(url);

    // Initial list
    this.es.addEventListener('init', (event: MessageEvent) => {
      this.zone.run(() => {
        const initial: AlertEvent[] = JSON.parse(event.data || '[]');
        this.alertsSubject.next(initial);
      });
    });

    // Optional ping (your backend sends event name "ping")
    this.es.addEventListener('ping', (event: MessageEvent) => {
      // event.data = "ok" (ignore)
    });

    // New alerts (plain data messages)
    this.es.onmessage = (event: MessageEvent) => {
      if (!event?.data || event.data === 'ok') return;

      this.zone.run(() => {
        const alert: AlertEvent = JSON.parse(event.data);
        const current = this.alertsSubject.value;
        this.alertsSubject.next([alert, ...current].slice(0, 100));
      });
    };

    this.es.onerror = () => {
      // auto reconnect
      this.disconnect();
      setTimeout(() => this.connectStream(), 3000);
    };
  }

  disconnect(): void {
    try {
      this.es?.close();
    } finally {
      this.es = undefined;
    }
  }



  // Add history endpoint (same pattern as getAlerts)
getHistory(params?: { days?: number; failedThreshold?: number; downloadThreshold?: number }): Observable<AlertEvent[]> {
  const url = `${CURRENT_API_URL}/server/api/diracai/monitoring/history`;
  const queryParams = new URLSearchParams({
    days: (params?.days || 7).toString(),
    failedThreshold: (params?.failedThreshold || 1).toString(),
    downloadThreshold: (params?.downloadThreshold || 1).toString()
  });
  return this.http.get<AlertEvent[]>(`${url}?${queryParams}`);
}

}
