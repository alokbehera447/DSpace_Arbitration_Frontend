// // 1. IMPORT ChangeDetectorRef
// import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
// import { ActivatedRoute } from '@angular/router';
// import { AdminAuditService } from './admin-audit.service';

// interface UserActionLog {
//   action: string;
//   timestamp: string;
//   ipAddress: string;
//   userAgent: string;
//   objectId: string | null;
// }

// @Component({
//   selector: 'app-audit-user-details',
//   templateUrl: './audit-user-details.component.html',
//   styleUrls: ['./audit-user-details.component.scss']
// })
// export class AuditUserDetailsComponent implements OnInit {
//   userId: string = '';
//   userLogs: UserActionLog[] = [];
//   uniqueDevices: string[] = [];
//   loading = true; // 2. ADD LOADING STATE (optional but recommended)

//   constructor(
//     private route: ActivatedRoute,
//     private auditService: AdminAuditService,
//     private cdr: ChangeDetectorRef // 3. ADD THIS
//   ) {}

//   ngOnInit(): void {
//     const paramId = this.route.snapshot.paramMap.get('userId');
//     if (paramId) {
//       this.userId = paramId;
//       this.fetchUserLogs(this.userId);
//     } else {
//       console.error('User ID param is missing');
//       this.loading = false;
//     }
//   }

//   fetchUserLogs(userId: string): void {
//     this.loading = true; // Set loading to true when fetching
//     this.auditService.getAuditLogsByUser(userId).subscribe({
//       next: (logs: UserActionLog[]) => {
//         this.userLogs = logs;
//         this.uniqueDevices = [...new Set(logs.map(log => log.userAgent))];
//         this.loading = false;
//         this.cdr.detectChanges(); // 4. ADD THIS LINE - MOST IMPORTANT!
//       },
//       error: (err) => {
//         console.error('Error fetching audit logs:', err);
//         this.loading = false;
//         this.cdr.detectChanges(); // 5. ALSO ADD HERE
//       }
//     });
//   }
// }

import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AdminAuditService } from './admin-audit.service';

interface UserActionLog {
  action: string;
  timestamp: string;
  ipAddress: string;
  userAgent: string;
  objectId: string | null;
}

@Component({
  selector: 'app-audit-user-details',
  templateUrl: './audit-user-details.component.html',
  styleUrls: ['./audit-user-details.component.scss']
})
export class AuditUserDetailsComponent implements OnInit {

  userId = '';
  userLogs: UserActionLog[] = [];
  pagedLogs: UserActionLog[] = [];
  uniqueDevices: string[] = [];

  loading = true;

  page = 1;
  pageSize = 10;   // ✅ 10 items per page
  totalPages = 0;

  constructor(
    private route: ActivatedRoute,
    private auditService: AdminAuditService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const paramId = this.route.snapshot.paramMap.get('userId');
    if (paramId) {
      this.userId = paramId;
      this.fetchUserLogs(this.userId);
    } else {
      this.loading = false;
    }
  }

  fetchUserLogs(userId: string): void {
    this.loading = true;

    this.auditService.getAuditLogsByUser(userId).subscribe({
      next: (logs: UserActionLog[]) => {

        // ✅ Sort: latest activity FIRST
        this.userLogs = (logs || []).sort(
          (a, b) =>
            new Date(b.timestamp).getTime() -
            new Date(a.timestamp).getTime()
        );

        // Unique devices
        this.uniqueDevices = [
          ...new Set(this.userLogs.map(log => log.userAgent))
        ];

        // Pagination setup
        this.totalPages = Math.ceil(this.userLogs.length / this.pageSize);
        this.page = 1;
        this.updatePagedLogs();

        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  updatePagedLogs(): void {
    const start = (this.page - 1) * this.pageSize;
    this.pagedLogs = this.userLogs.slice(start, start + this.pageSize);
  }

  nextPage(): void {
    if (this.page < this.totalPages) {
      this.page++;
      this.updatePagedLogs();
    }
  }

  prevPage(): void {
    if (this.page > 1) {
      this.page--;
      this.updatePagedLogs();
    }
  }

  /**
   * ✅ Maps backend action names to UI badge classes
   * This prevents blank / invisible actions in UI
   */
  getActionClass(action: string | null): string {
    if (!action) {
      return 'update';
    }

    const a = action.toLowerCase();

    if (a.startsWith('role')) {
      return 'role';
    }

    if (a.startsWith('permission')) {
      return 'permission';
    }

    return a; // login, view, download
  }
}


