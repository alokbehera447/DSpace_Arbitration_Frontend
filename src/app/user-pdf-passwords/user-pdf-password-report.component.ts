import { Component, OnInit } from '@angular/core';
import { UserPdfPasswordReportService, UserPdfPassword } from './user-pdf-password-report.service';

@Component({
  selector: 'ds-user-pdf-password-report',
  templateUrl: './user-pdf-password-report.component.html'
})
export class UserPdfPasswordReportComponent implements OnInit {

  rows: UserPdfPassword[] = [];
  loading = false;

  constructor(private service: UserPdfPasswordReportService) {}

  ngOnInit(): void {
    this.loading = true;
    this.service.getAll().subscribe({
      next: data => {
        this.rows = data;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }
}
