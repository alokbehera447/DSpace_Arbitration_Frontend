import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserPdfPasswordReportComponent } from './user-pdf-password-report.component';
import { UserPdfPasswordReportRoutingModule } from './user-pdf-password-report-routing.module';

@NgModule({
  declarations: [
    UserPdfPasswordReportComponent
  ],
  imports: [
    CommonModule,
    UserPdfPasswordReportRoutingModule
  ]
})
export class UserPdfPasswordReportModule {}
