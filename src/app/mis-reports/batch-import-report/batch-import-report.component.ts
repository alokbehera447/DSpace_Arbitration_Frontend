import { Component, OnInit } from '@angular/core';
import { BatchImportReportService } from './batch-import-report.service';

@Component({
    selector: 'app-batch-import-report',
    templateUrl: './batch-import-report.component.html',
    styleUrls: ['./batch-import-report.component.scss']
})
export class BatchImportReportComponent implements OnInit {

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
        private batchImportReportService: BatchImportReportService
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

        this.batchImportReportService
            .exportCSV(this.selectedCollectionId, this.startDate, this.endDate)
            .subscribe({
                next: (response: Blob) => {
                    this.downloadFile(response, 'batch_import_report.csv');
                    this.loading = false;
                    this.successMessage = 'CSV exported successfully.';
                },
                error: (error) => {
                    console.error('CSV export error:', error);
                    this.loading = false;
                    this.errorMessage = 'Failed to export CSV report.';
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

        this.batchImportReportService
            .exportPDF(this.selectedCollectionId, this.startDate, this.endDate)
            .subscribe({
                next: (response: Blob) => {
                    this.downloadFile(response, 'batch_import_report.pdf');
                    this.loading = false;
                    this.successMessage = 'PDF exported successfully.';
                },
                error: (error) => {
                    console.error('PDF export error:', error);
                    this.loading = false;
                    this.errorMessage = 'Failed to export PDF report.';
                }
            });
    }

    private validateForm(): boolean {
        if (!this.startDate || !this.endDate) {
            this.errorMessage = 'Please select start date and end date.';
            return false;
        }

        if (this.startDate > this.endDate) {
            this.errorMessage = 'Start date cannot be greater than end date.';
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