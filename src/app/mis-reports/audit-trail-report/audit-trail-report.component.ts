// import { Component, OnInit } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { FormsModule } from '@angular/forms';
// import { HttpClientModule } from '@angular/common/http';

// import { AuditTrailReportService } from './audit-trail-report.service';

// @Component({
//     selector: 'ds-audit-trail-report',
//     standalone: true,
//     imports: [
//         CommonModule,
//         FormsModule,
//         HttpClientModule
//     ],
//     templateUrl: './audit-trail-report.component.html',
//     styleUrls: ['./audit-trail-report.component.scss']
// })
// export class AuditTrailReportComponent implements OnInit {

//     users: string[] = [];
//     reports: any[] = [];

//     selectedEmail = '';
//     startDate = '';
//     endDate = '';

//     loading = false;

//     constructor(
//         private auditService: AuditTrailReportService
//     ) { }

//     ngOnInit(): void {
//         this.loadUsers();
//     }

//     loadUsers(): void {
//         this.auditService.getUsers().subscribe({
//             next: (data) => {
//                 this.users = data;
//             },
//             error: (err) => {
//                 console.error(err);
//             }
//         });
//     }

//     getReport(): void {

//         if (!this.selectedEmail || !this.startDate || !this.endDate) {
//             alert('Please select all fields');
//             return;
//         }

//         this.loading = true;

//         this.auditService.getAuditReport(
//             this.selectedEmail,
//             this.startDate,
//             this.endDate
//         ).subscribe({
//             next: (data) => {
//                 this.reports = data;
//                 this.loading = false;
//             },
//             error: (err) => {
//                 console.error(err);
//                 this.loading = false;
//             }
//         });
//     }
// }