import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { JudgeNameReportService } from './judge-name-report.service';

@Component({
    selector: 'ds-judge-name-report',
    templateUrl: './judge-name-report.component.html',
    styleUrls: ['./judge-name-report.component.scss']
})
export class JudgeNameReportComponent implements OnInit {

    judgeNames: string[] = [];
    judgeName = '';
    startDate = '';
    endDate = '';
    loading = false;
    successMessage = '';
    errorMessage = '';

    constructor(
        private service: JudgeNameReportService,
        private cdr: ChangeDetectorRef  // ← ADD THIS
    ) { }

    ngOnInit(): void {
        this.loadJudgeNames();
    }

    loadJudgeNames(): void {
        this.service.getJudgeNames().subscribe({
            next: (data) => {
                this.judgeNames = data || [];
            },
            error: () => {
                this.showError('Failed to load judge names');
            }
        });
    }

    exportCSV(): void {
        if (!this.startDate || !this.endDate) {
            this.showError('Please select start date and end date');
            return;
        }

        this.loading = true;
        this.successMessage = '';
        this.errorMessage = '';

        this.service.exportCSV(this.judgeName, this.startDate, this.endDate).subscribe({
            next: (blob: Blob) => {
                this.downloadFile(blob, 'judge_name_report.csv');
                this.loading = false;
                this.successMessage = 'CSV exported successfully.';
                this.cdr.detectChanges();  // ← ADD THIS
                setTimeout(() => {
                    this.successMessage = '';
                    this.cdr.detectChanges();  // ← ADD THIS
                }, 3000);
            },
            error: () => {
                this.loading = false;
                this.errorMessage = 'Failed to export CSV';
                this.cdr.detectChanges();  // ← ADD THIS
                setTimeout(() => {
                    this.errorMessage = '';
                    this.cdr.detectChanges();  // ← ADD THIS
                }, 3000);
            }
        });
    }

    exportPDF(): void {
        if (!this.startDate || !this.endDate) {
            this.showError('Please select start date and end date');
            return;
        }

        this.loading = true;
        this.successMessage = '';
        this.errorMessage = '';

        this.service.exportPDF(this.judgeName, this.startDate, this.endDate).subscribe({
            next: (blob: Blob) => {
                this.downloadFile(blob, 'judge_name_report.pdf');
                this.loading = false;
                this.successMessage = 'PDF exported successfully.';
                this.cdr.detectChanges();  // ← ADD THIS
                setTimeout(() => {
                    this.successMessage = '';
                    this.cdr.detectChanges();  // ← ADD THIS
                }, 3000);
            },
            error: () => {
                this.loading = false;
                this.errorMessage = 'Failed to export PDF';
                this.cdr.detectChanges();  // ← ADD THIS
                setTimeout(() => {
                    this.errorMessage = '';
                    this.cdr.detectChanges();  // ← ADD THIS
                }, 3000);
            }
        });
    }

    private downloadFile(blob: Blob, filename: string): void {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    }

    private showError(message: string): void {
        this.errorMessage = message;
        this.successMessage = '';
        this.cdr.detectChanges();
        setTimeout(() => {
            this.errorMessage = '';
            this.cdr.detectChanges();
        }, 3000);
    }
}