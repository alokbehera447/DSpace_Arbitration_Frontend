// import { Component, OnDestroy, OnInit, ChangeDetectorRef } from '@angular/core';
// import { Subscription, interval, Subject } from 'rxjs';
// import { finalize, takeUntil } from 'rxjs/operators';
// import { AlertEvent, RealTimeMonitoringService } from './real-time-monitoring.service';

// @Component({
//   selector: 'app-real-time-monitoring',
//   templateUrl: './real-time-monitoring.component.html',
//   styleUrls: ['./real-time-monitoring.component.scss']
// })
// export class RealTimeMonitoringComponent implements OnInit, OnDestroy {
//   alerts: AlertEvent[] = [];
//   history: AlertEvent[] = [];

//   loading = false;
//   activeTab: 'realtime' | 'history' = 'realtime';

//   private sub?: Subscription;
//   private destroy$ = new Subject<void>();

//   constructor(
//     private rt: RealTimeMonitoringService,
//     private cdr: ChangeDetectorRef
//   ) {}

//   ngOnInit(): void {
//     // Live SSE always on
//     this.rt.connectStream();

//     // Live updates from SSE
//     this.sub = this.rt.alerts$.subscribe((list) => {
//       this.alerts = list || [];
//       if (this.activeTab === 'realtime') {
//         this.loading = false;
//       }
//       this.cdr.detectChanges();
//     });

//     // Auto-refresh current tab every 30 seconds
//     interval(30000)
//       .pipe(takeUntil(this.destroy$))
//       .subscribe(() => this.refresh());

//     // Initial load for the default tab
//     this.refresh();
//   }

//   ngOnDestroy(): void {
//     this.destroy$.next();
//     this.destroy$.complete();
//     this.sub?.unsubscribe();
//     this.rt.disconnect();
//   }

//   setTab(tab: 'realtime' | 'history'): void {
//     if (this.activeTab === tab) {
//       // Still refresh to avoid “click elsewhere then data appears”
//       this.refresh();
//       return;
//     }
//     this.activeTab = tab;
//     this.refresh();
//   }

//   // private loadRealtime(): void {
//   //   this.loading = true;

//   //   this.rt.getAlerts(20)
//   //     .pipe(finalize(() => {
//   //       this.loading = false;
//   //       this.cdr.detectChanges();
//   //     }))
//   //     .subscribe({
//   //       next: (data) => {
//   //         // IMPORTANT: set alerts here (not only console.log)
//   //         this.alerts = data || [];
//   //       },
//   //       error: (err) => {
//   //         console.error('Live refresh failed:', err);
//   //       }
//   //     });
//   // }

//   private loadRealtime(): void {
//   this.loading = true;

//   this.rt.getAlerts(500)
//     .pipe(finalize(() => {
//       this.loading = false;
//       this.cdr.detectChanges();
//     }))
//     .subscribe({
//       next: (data) => {
//         this.alerts = data || [];
//       },
//       error: (err) => {
//         console.error('Live refresh failed:', err);
//       }
//     });
// }

//   // private loadHistory(): void {
//   //   this.loading = true;

//   //   this.rt.getHistory({ days: 7, failedThreshold: 1, downloadThreshold: 1 })
//   //     .pipe(finalize(() => {
//   //       this.loading = false;
//   //       this.cdr.detectChanges();
//   //     }))
//   //     .subscribe({
//   //       next: (data) => {
//   //         this.history = data || [];
//   //       },
//   //       error: (err) => {
//   //         console.error('History failed:', err);
//   //         this.history = [];
//   //       }
//   //     });
//   // }

//   private loadHistory(): void {
//   this.loading = true;

//   this.rt.getHistory({ days: 7, failedThreshold: 1, downloadThreshold: 7 })
//     .pipe(finalize(() => {
//       this.loading = false;
//       this.cdr.detectChanges();
//     }))
//     .subscribe({
//       next: (data) => {
//         this.history = data || [];
//       },
//       error: (err) => {
//         console.error('History failed:', err);
//         this.history = [];
//       }
//     });
// }

//   refresh(): void {
//     if (this.activeTab === 'history') {
//       this.loadHistory();
//     } else {
//       this.loadRealtime();
//     }
//   }

//   severityClass(sev: string): string {
//     const s = (sev || '').toLowerCase();
//     if (s === 'high') return 'sev-high';
//     if (s === 'medium') return 'sev-medium';
//     return 'sev-low';
//   }

//   icon(sev: string): string {
//     const s = (sev || '').toUpperCase();
//     if (s === 'HIGH') return '🚨';
//     if (s === 'MEDIUM') return '⚠️';
//     return 'ℹ️';
//   }

//   trackByIndex(index: number, item: AlertEvent): string {
//     return item.timestamp || index.toString();
//   }

//   formatDate(timestamp: string): string {
//     if (!timestamp) return '';
//     return new Date(timestamp).toLocaleString('en-IN', {
//       timeZone: 'Asia/Kolkata',
//       day: '2-digit',
//       month: 'short',
//       year: 'numeric',
//       hour: '2-digit',
//       minute: '2-digit'
//     });
//   }
// }



import { Component, OnDestroy, OnInit, ChangeDetectorRef } from '@angular/core';
import { Subscription, interval, Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { AlertEvent, RealTimeMonitoringService } from './real-time-monitoring.service';

@Component({
  selector: 'app-real-time-monitoring',
  templateUrl: './real-time-monitoring.component.html',
  styleUrls: ['./real-time-monitoring.component.scss']
})
export class RealTimeMonitoringComponent implements OnInit, OnDestroy {

  alerts: AlertEvent[] = [];
  history: AlertEvent[] = [];

  loading = false;
  activeTab: 'realtime' | 'history' = 'realtime';

  pageSize = 10;
  currentPage = 1;

  private sub?: Subscription;
  private destroy$ = new Subject<void>();

  constructor(
    private rt: RealTimeMonitoringService,
    private cdr: ChangeDetectorRef
  ) {}

  /* =========================
     LIFECYCLE
     ========================= */
  ngOnInit(): void {
    this.rt.connectStream();

    this.sub = this.rt.alerts$.subscribe((list) => {
      this.alerts = list || [];
      if (this.activeTab === 'realtime') {
        this.loading = false;
      }
      this.cdr.detectChanges();
    });

    interval(30000)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.refresh());

    this.refresh();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.sub?.unsubscribe();
    this.rt.disconnect();
  }

  /* =========================
     TAB HANDLING
     ========================= */
  setTab(tab: 'realtime' | 'history'): void {
    if (this.activeTab === tab) {
      this.refresh();
      return;
    }
    this.activeTab = tab;
    this.resetPagination();
    this.refresh();
  }

  /* =========================
     DATA LOADERS
     ========================= */
  private loadRealtime(): void {
    this.loading = true;

    this.rt.getAlerts(500)
      .pipe(finalize(() => {
        this.loading = false;
        this.cdr.detectChanges();
      }))
      .subscribe({
        next: (data) => this.alerts = data || [],
        error: (err) => console.error('Live refresh failed:', err)
      });
  }

  private loadHistory(): void {
    this.loading = true;

    this.rt.getHistory({ days: 7, failedThreshold: 1, downloadThreshold: 7 })
      .pipe(finalize(() => {
        this.loading = false;
        this.cdr.detectChanges();
      }))
      .subscribe({
        next: (data) => this.history = data || [],
        error: (err) => {
          console.error('History failed:', err);
          this.history = [];
        }
      });
  }

  refresh(): void {
    this.activeTab === 'history'
      ? this.loadHistory()
      : this.loadRealtime();
  }

  /* =========================
     PAGINATION
     ========================= */
  get paginatedData(): AlertEvent[] {
    const data = this.activeTab === 'realtime' ? this.alerts : this.history;
    const start = (this.currentPage - 1) * this.pageSize;
    return data.slice(start, start + this.pageSize);
  }

  get totalPages(): number {
    const data = this.activeTab === 'realtime' ? this.alerts : this.history;
    return Math.ceil(data.length / this.pageSize);
  }

  changePage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
  }

  resetPagination(): void {
    this.currentPage = 1;
  }

  /** 🔑 FIX FOR TEMPLATE (no Math in HTML) */
  getRangeEnd(): number {
    const total = this.activeTab === 'history'
      ? this.history.length
      : this.alerts.length;

    return Math.min(this.currentPage * this.pageSize, total);
  }

  /* =========================
     UI HELPERS
     ========================= */
  severityClass(sev: string): string {
    const s = (sev || '').toLowerCase();
    if (s === 'high') return 'sev-high';
    if (s === 'medium') return 'sev-medium';
    return 'sev-low';
  }

  icon(sev: string): string {
    if (sev === 'HIGH') return '🚨';
    if (sev === 'MEDIUM') return '⚠️';
    return 'ℹ️';
  }

  trackByIndex(index: number, item: AlertEvent): string {
    return item.timestamp || index.toString();
  }

  formatDate(timestamp: string): string {
    if (!timestamp) return '';
    return new Date(timestamp).toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  activityClass(a: AlertEvent): string {
    const text = (a.alertType || a.details || '').toLowerCase();

    if (text.includes('failed') || text.includes('login')) {
      return 'act-login-failed';
    }

    if (text.includes('bulk') || text.includes('download')) {
      return 'act-bulk-download';
    }

    return 'act-normal';
  }
}











