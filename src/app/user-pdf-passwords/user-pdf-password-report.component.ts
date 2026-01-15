import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { UserPdfPasswordReportService, UserPdfPassword } from './user-pdf-password-report.service';

// Extend the interface to include showPassword property
interface ExtendedUserPdfPassword extends UserPdfPassword {
  showPassword?: boolean;
}

@Component({
  selector: 'ds-user-pdf-password-report',
  templateUrl: './user-pdf-password-report.component.html',
  styleUrls: ['./user-pdf-password-report.component.scss']
})
export class UserPdfPasswordReportComponent implements OnInit {

  rows: ExtendedUserPdfPassword[] = []; // Changed to ExtendedUserPdfPassword
  loading = false;

  constructor(
    private service: UserPdfPasswordReportService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loading = true;
    this.service.getAll().subscribe({
      next: data => {
        // Add showPassword property to each row, default to false
        this.rows = data.map(user => ({
          ...user,
          showPassword: false
        }));
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  // Toggle password visibility for a specific user
  togglePassword(user: ExtendedUserPdfPassword): void {
    user.showPassword = !user.showPassword;
  }

  // Optional: Toggle all passwords
  toggleAllPasswords(show: boolean): void {
    this.rows.forEach(user => {
      user.showPassword = show;
    });
  }
}