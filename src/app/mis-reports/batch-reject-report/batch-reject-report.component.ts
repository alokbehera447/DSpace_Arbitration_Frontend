import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { BatchRejectReportService } from './batch-reject-report.service';

@Component({
    selector: 'app-batch-reject-report',
    templateUrl: './batch-reject-report.component.html',
    styleUrls: ['./batch-reject-report.component.scss']
})
export class BatchRejectReportComponent implements OnInit {

    collections: any[] = [
        { id: 'ALL', name: 'All Case Files' }
    ];

    selectedCollectionId: string = 'ALL';
    startDate: string = '';
    endDate: string = '';

    loading = false;
    errorMessage = '';
    successMessage = '';

    constructor(
        private batchRejectReportService: BatchRejectReportService,
        private cdr: ChangeDetectorRef
    ) { }

    ngOnInit(): void {
        this.startDate = '';
        this.endDate = '';
    }

    exportCSV(): void {
        if (!this.validateForm()) {
            return;
        }

        this.loading = true;
        this.errorMessage = '';
        this.successMessage = '';

        this.batchRejectReportService
            .exportCSV(this.selectedCollectionId, this.startDate, this.endDate)
            .subscribe({
                next: (response: Blob) => {
                    this.downloadFile(response, 'batch_reject_report.csv');
                    this.loading = false;
                    this.successMessage = 'CSV exported successfully.';
                    this.cdr.detectChanges();
                    setTimeout(() => {
                        this.successMessage = '';
                        this.cdr.detectChanges();
                    }, 3000);
                },
                error: (error) => {
                    console.error('CSV export error:', error);
                    this.loading = false;
                    this.errorMessage = 'Failed to export CSV report.';
                    this.cdr.detectChanges();
                    setTimeout(() => {
                        this.errorMessage = '';
                        this.cdr.detectChanges();
                    }, 3000);
                }
            });
    }

    exportPDF(): void {
        if (!this.validateForm()) {
            return;
        }

        this.loading = true;
        this.errorMessage = '';
        this.successMessage = '';

        this.batchRejectReportService
            .exportPDF(this.selectedCollectionId, this.startDate, this.endDate)
            .subscribe({
                next: (response: Blob) => {
                    this.downloadFile(response, 'batch_reject_report.pdf');
                    this.loading = false;
                    this.successMessage = 'PDF exported successfully.';
                    this.cdr.detectChanges();
                    setTimeout(() => {
                        this.successMessage = '';
                        this.cdr.detectChanges();
                    }, 3000);
                },
                error: (error) => {
                    console.error('PDF export error:', error);
                    this.loading = false;
                    this.errorMessage = 'Failed to export PDF report.';
                    this.cdr.detectChanges();
                    setTimeout(() => {
                        this.errorMessage = '';
                        this.cdr.detectChanges();
                    }, 3000);
                }
            });
    }

    private validateForm(): boolean {
        if (!this.startDate || !this.endDate) {
            this.errorMessage = 'Please select start date and end date.';
            this.cdr.detectChanges();
            setTimeout(() => {
                this.errorMessage = '';
                this.cdr.detectChanges();
            }, 3000);
            return false;
        }

        if (this.startDate > this.endDate) {
            this.errorMessage = 'Start date cannot be greater than end date.';
            this.cdr.detectChanges();
            setTimeout(() => {
                this.errorMessage = '';
                this.cdr.detectChanges();
            }, 3000);
            return false;
        }

        return true;
    }

    private downloadFile(blob: Blob, fileName: string): void {
        const fileURL = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = fileURL;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(fileURL);
    }
}