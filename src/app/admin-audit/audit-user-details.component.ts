// 1. IMPORT ChangeDetectorRef
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
  userId: string = '';
  userLogs: UserActionLog[] = [];
  uniqueDevices: string[] = [];
  loading = true; // 2. ADD LOADING STATE (optional but recommended)

  constructor(
    private route: ActivatedRoute,
    private auditService: AdminAuditService,
    private cdr: ChangeDetectorRef // 3. ADD THIS
  ) {}

  ngOnInit(): void {
    const paramId = this.route.snapshot.paramMap.get('userId');
    if (paramId) {
      this.userId = paramId;
      this.fetchUserLogs(this.userId);
    } else {
      console.error('User ID param is missing');
      this.loading = false;
    }
  }

  fetchUserLogs(userId: string): void {
    this.loading = true; // Set loading to true when fetching
    this.auditService.getAuditLogsByUser(userId).subscribe({
      next: (logs: UserActionLog[]) => {
        this.userLogs = logs;
        this.uniqueDevices = [...new Set(logs.map(log => log.userAgent))];
        this.loading = false;
        this.cdr.detectChanges(); // 4. ADD THIS LINE - MOST IMPORTANT!
      },
      error: (err) => {
        console.error('Error fetching audit logs:', err);
        this.loading = false;
        this.cdr.detectChanges(); // 5. ALSO ADD HERE
      }
    });
  }
}