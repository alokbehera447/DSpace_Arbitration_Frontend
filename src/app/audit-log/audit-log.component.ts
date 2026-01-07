// audit-log.component.ts
import { Component, OnInit } from '@angular/core';
import { AuditLogService, AuditLog, AuditLogResponse } from './audit-log.service';

@Component({
  selector: 'app-audit-log',
  templateUrl: './audit-log.component.html',
  styleUrls: ['./audit-log.component.scss']
})
export class AuditLogComponent implements OnInit {
  auditLogs: AuditLog[] = [];
  currentPage = 0;
  totalPages = 0;
  totalElements = 0;
  pageSize = 20;
  isLoading = false;
  errorMessage: string | null = null;

  constructor(private auditLogService: AuditLogService) {}

  ngOnInit(): void {
    this.loadAuditLogs();
  }

  /**
   * Load audit logs for current page
   */
  loadAuditLogs(): void {
    this.isLoading = true;
    this.errorMessage = null;

    this.auditLogService.getMyAuditLogs(this.currentPage, this.pageSize).subscribe({
      next: (response: AuditLogResponse) => {
        this.auditLogs = response.logs;
        this.totalPages = response.totalPages;
        this.totalElements = response.totalElements;
        this.currentPage = response.currentPage;
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Failed to load audit logs: ' + (error.error?.message || 'Unknown error');
        this.isLoading = false;
      }
    });
  }

  /**
   * Go to next page
   */
  nextPage(): void {
    if (this.currentPage < this.totalPages - 1) {
      this.currentPage++;
      this.loadAuditLogs();
    }
  }

  /**
   * Go to previous page
   */
  previousPage(): void {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.loadAuditLogs();
    }
  }

  /**
   * Go to specific page
   */
  goToPage(page: number): void {
    if (page >= 0 && page < this.totalPages) {
      this.currentPage = page;
      this.loadAuditLogs();
    }
  }

  /**
   * Format timestamp for display
   */
  formatTimestamp(timestamp: string): string {
    const date = new Date(timestamp);
    return date.toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  }

  /**
   * Get action badge class
   */
  getActionBadgeClass(actionType: string): string {
    return actionType === 'VIEW' ? 'badge-view' : 'badge-download';
  }

  /**
   * Get status badge class
   */
  getStatusBadgeClass(success: boolean): string {
    return success ? 'badge-success' : 'badge-error';
  }

  /**
   * Format processing time
   */
  formatProcessingTime(timeMs: number): string {
    if (timeMs < 1000) {
      return `${timeMs}ms`;
    }
    return `${(timeMs / 1000).toFixed(2)}s`;
  }

  /**
   * Get page numbers for pagination
   */
  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxPagesToShow = 5;
    
    let startPage = Math.max(0, this.currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(this.totalPages - 1, startPage + maxPagesToShow - 1);
    
    // Adjust start if we're near the end
    if (endPage - startPage < maxPagesToShow - 1) {
      startPage = Math.max(0, endPage - maxPagesToShow + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return pages;
  }
}