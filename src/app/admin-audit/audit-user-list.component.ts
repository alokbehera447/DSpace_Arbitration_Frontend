// 1. IMPORT ChangeDetectorRef
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { AdminAuditService } from './admin-audit.service';

@Component({
  selector: 'app-audit-user-list',
  templateUrl: './audit-user-list.component.html',
  styleUrls: ['./audit-user-list.component.scss']
})
export class AuditUserListComponent implements OnInit {
  users: any[] = [];

  constructor(
    private router: Router,
    private auditService: AdminAuditService,
    private cdr: ChangeDetectorRef // 2. ADD THIS
  ) {}

  ngOnInit(): void {
    this.auditService.getAllUsers().subscribe({
      next: (response) => {
        this.users = response || [];
        this.cdr.detectChanges(); // 3. ADD THIS LINE - MOST IMPORTANT!
      },
      error: (err) => {
        console.error('Error fetching users:', err);
      }
    });
  }

  goToDetails(userId: string): void {
    this.router.navigate(['/user-audit/user', userId]);
  }
}