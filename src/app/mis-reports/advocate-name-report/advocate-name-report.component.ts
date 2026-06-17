import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { AdvocateNameReportService } from './advocate-name-report.service';

@Component({
    selector: 'ds-advocate-name-report',
    templateUrl: './advocate-name-report.component.html',
    styleUrls: ['./advocate-name-report.component.scss']
})
export class AdvocateNameReportComponent implements OnInit {

    petitionerAdvocates: string[] = [];
    respondentAdvocates: string[] = [];

    petitionerAdvocateName = '';
    petitionerStartDate = '';
    petitionerEndDate = '';

    respondentAdvocateName = '';
    respondentStartDate = '';
    respondentEndDate = '';

    loading = false;
    successMessage = '';
    errorMessage = '';

    constructor(
        private service: AdvocateNameReportService,
        private cdr: ChangeDetectorRef
    ) { }

    ngOnInit(): void {
        this.service.getPetitionerAdvocates().subscribe({
            next: (data) => { this.petitionerAdvocates = data || []; },
            error: () => { this.showError('Failed to load petitioner advocate names'); }
        });
        this.service.getRespondentAdvocates().subscribe({
            next: (data) => { this.respondentAdvocates = data || []; },
            error: () => { this.showError('Failed to load respondent advocate names'); }
        });
    }

    exportPetitionerCSV(): void {
        if (!this.petitionerStartDate || !this.petitionerEndDate) {
            this.showError('Please select start date and end date for Petitioner Advocate');
            return;
        }
        this.loading = true;
        this.service.exportPetitionerCSV(
            this.petitionerAdvocateName,
            this.petitionerStartDate,
            this.petitionerEndDate
        ).subscribe({
            next: (blob) => {
                this.downloadFile(blob, 'petitioner_advocate_report.csv');
                this.showSuccess('CSV exported successfully.');
            },
            error: () => {
                this.loading = false;
                this.showError('Failed to export CSV');
            }
        });
    }

    exportPetitionerPDF(): void {
        if (!this.petitionerStartDate || !this.petitionerEndDate) {
            this.showError('Please select start date and end date for Petitioner Advocate');
            return;
        }
        this.loading = true;
        this.service.exportPetitionerPDF(
            this.petitionerAdvocateName,
            this.petitionerStartDate,
            this.petitionerEndDate
        ).subscribe({
            next: (blob) => {
                this.downloadFile(blob, 'petitioner_advocate_report.pdf');
                this.showSuccess('PDF exported successfully.');
            },
            error: () => {
                this.loading = false;
                this.showError('Failed to export PDF');
            }
        });
    }

    exportRespondentCSV(): void {
        if (!this.respondentStartDate || !this.respondentEndDate) {
            this.showError('Please select start date and end date for Respondent Advocate');
            return;
        }
        this.loading = true;
        this.service.exportRespondentCSV(
            this.respondentAdvocateName,
            this.respondentStartDate,
            this.respondentEndDate
        ).subscribe({
            next: (blob) => {
                this.downloadFile(blob, 'respondent_advocate_report.csv');
                this.showSuccess('CSV exported successfully.');
            },
            error: () => {
                this.loading = false;
                this.showError('Failed to export CSV');
            }
        });
    }

    exportRespondentPDF(): void {
        if (!this.respondentStartDate || !this.respondentEndDate) {
            this.showError('Please select start date and end date for Respondent Advocate');
            return;
        }
        this.loading = true;
        this.service.exportRespondentPDF(
            this.respondentAdvocateName,
            this.respondentStartDate,
            this.respondentEndDate
        ).subscribe({
            next: (blob) => {
                this.downloadFile(blob, 'respondent_advocate_report.pdf');
                this.showSuccess('PDF exported successfully.');
            },
            error: () => {
                this.loading = false;
                this.showError('Failed to export PDF');
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
        this.loading = false;
    }

    private showSuccess(message: string): void {
        this.successMessage = message;
        this.errorMessage = '';
        this.cdr.detectChanges();
        setTimeout(() => { this.successMessage = ''; this.cdr.detectChanges(); }, 3000);
    }

    private showError(message: string): void {
        this.errorMessage = message;
        this.successMessage = '';
        this.cdr.detectChanges();
        setTimeout(() => { this.errorMessage = ''; this.cdr.detectChanges(); }, 3000);
    }
}