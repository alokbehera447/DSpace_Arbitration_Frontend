import { Component, ChangeDetectorRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { OnInit } from '@angular/core';
import { CURRENT_API_URL } from '../core/serachpage/api-urls';
import { AdminPoolService } from './admin-service';

@Component({
    selector: 'app-admin-pool',
    templateUrl: './admin-pool.component.html',
    styleUrls: ['./admin-pool.component.scss'],
})
export class AdminPoolComponent implements OnInit {

    constructor(private adminPoolService: AdminPoolService, private cdr: ChangeDetectorRef) { }
    
    claimedTasks = [];
    pooledTasks = [];
    rejectedTasks = [];
    acceptedSubmissions: any[] = [];
    selectedBatch: any = null;
    dummyFiles: any[] = [];
    actionUUID: any = null;
    collectionUuid: any = null;
    reviewLoading: boolean = false;
    showAccepted = false;
    viewingAcceptedBatch: any = null;
    
    // Rejection dialog properties
    showRejectDialog: boolean = false;
    rejectionReason: string = '';

    currentPdfUrl: string | null = null; // add this

    ngOnInit() {
        this.fetchClaimedTasks();
        this.fetchPooledTasks();
        this.fetchRejectedTasks();
        this.fetchAcceptedSubmissions();
    }

    fetchClaimedTasks() {
        this.adminPoolService.fetchBatches('CLAIMED').subscribe(
            (res) => {
                this.claimedTasks = res;
                this.cdr.markForCheck();
            },
            (err) => {
                console.error('Failed to fetch CLAIMED tasks', err);
                this.cdr.markForCheck();
            }
        );
    }

    fetchPooledTasks() {
        this.adminPoolService.getPooledTasks().subscribe(
            (res) => {
                this.pooledTasks = res;
                this.cdr.markForCheck();
            },
            (err) => {
                console.error('Failed to fetch pooled tasks', err);
                this.cdr.markForCheck();
            }
        );
    }

    fetchRejectedTasks() {
        this.adminPoolService.getRejectedSubmissions().subscribe(
            (res) => {
                this.rejectedTasks = res;
                console.log("Rejected Tasks:", this.rejectedTasks);
                this.cdr.markForCheck();
            },
            (err) => {
                console.error('Failed to fetch rejected tasks', err);
                this.cdr.markForCheck();
            }
        );
    }

    fetchAcceptedSubmissions() {
        this.adminPoolService.getAcceptedSubmissions().subscribe(
            (res) => {
                this.acceptedSubmissions = res;
                this.cdr.markForCheck();
            },
            (err) => {
                console.error('Failed to fetch accepted submissions', err);
                this.acceptedSubmissions = [];
                this.cdr.markForCheck();
            }
        );
    }


    openReviewDialog(batch: any) {
        this.selectedBatch = batch;
        this.reviewLoading = true;
        const batchId = batch.bulkFileId;
        this.collectionUuid = batch.collection.collectionId;

        this.adminPoolService.getBatchFiles(batchId).subscribe(
            (res) => {
                this.actionUUID = res.requestId;

                this.dummyFiles = res.items.map((item: any) => {
                    if (typeof item.metadata === 'string') {
                        try {
                            item.metadata = JSON.parse(item.metadata);
                        } catch (e) {

                            item.metadata = {};
                        }
                    }

                    // pdfFiles from backend = list of relative URLs like /api/bulk-upload/...
                    const BULK_BASE = `${CURRENT_API_URL}/server`;

                    item.pdfFiles = (item.pdfFiles || []).map((rel: string) =>
                        rel.startsWith('http')
                            ? rel
                            : `${BULK_BASE}${rel.startsWith('/') ? '' : '/'}${rel}`
                    );


                    return item;
                });

                this.currentPdfUrl = null;





                this.reviewLoading = false;
                this.cdr.markForCheck();
                console.log("testing in the dialogue box", this.collectionUuid);

            },
            (err) => {
                console.error(`Failed to fetch files for batch ${batchId}`, err);
                this.dummyFiles = [];
                this.reviewLoading = false;
                this.cdr.markForCheck();
            }
        );
    }

    
    onSelectPdf(pdfUrl: string) {
        this.currentPdfUrl = pdfUrl;
        console.log('Selected PDF:', pdfUrl);
    }

    openPdf(url: string | null | undefined) {
        if (!url) {
            console.warn('No pdfPreviewUrl on selectedBatch', this.selectedBatch);
            return;
        }

        const fullUrl = url.startsWith('http')
            ? url
            : `${CURRENT_API_URL}${url.startsWith('/') ? '' : '/'}${url}`;

        window.open(fullUrl, '_blank');
    }

    approve(uuid: string) {

        this.adminPoolService.approve(this.actionUUID, this.collectionUuid).subscribe(() => {
            console.log(this.collectionUuid);

            alert('✅ Approved successfully.');
            this.fetchClaimedTasks();
            this.fetchPooledTasks();
            this.fetchRejectedTasks();
            this.fetchAcceptedSubmissions();
            this.cancelReview();
        });
    }

    reject(uuid: string) {
        this.adminPoolService.reject(this.actionUUID).subscribe(() => {
            alert('Rejected successfully.');
            this.fetchClaimedTasks();
            this.fetchPooledTasks();
            this.fetchRejectedTasks();
            this.fetchAcceptedSubmissions();
            this.cancelReview();

        });
    }

    // Open the reject dialog
    openRejectDialog() {
        this.rejectionReason = '';
        this.showRejectDialog = true;
        console.log("Rejecting UUID:", this.rejectedTasks);
    }

    // Close the reject dialog
    closeRejectDialog() {
        this.showRejectDialog = false;
        this.rejectionReason = '';
    }

    // Confirm rejection with optional reason
    confirmReject() {
        const reason = this.rejectionReason.trim();
        
        this.adminPoolService.reject(this.actionUUID, reason).subscribe(
            () => {
                alert('✅ Rejected successfully.');
                this.fetchClaimedTasks();
                this.fetchPooledTasks();
                this.fetchRejectedTasks();
                this.fetchAcceptedSubmissions();
                this.closeRejectDialog();
                this.cancelReview();
            },
            (err) => {
                console.error('Failed to reject', err);
                alert('❌ Failed to reject the batch: ' + (err.error?.error || 'Unknown error'));
                this.closeRejectDialog();
            }
        );
    }

    cancelReview() {
        this.selectedBatch = null;
        this.reviewLoading = false;
    }

    getBatchInfo() {
        alert("Fetching batch info...");
        // Placeholder for API integration
    }

    viewAcceptedSubmissions() {
        this.adminPoolService.getAcceptedSubmissions().subscribe(
            (res) => {
                this.acceptedSubmissions = res;
                this.showAccepted = true;
                this.viewingAcceptedBatch = null;
                this.cdr.markForCheck();
            },
            (err) => {
                console.error('Failed to fetch accepted submissions', err);
                this.acceptedSubmissions = [];
                this.showAccepted = true;
                this.viewingAcceptedBatch = null;
                this.cdr.markForCheck();
            }
        );
    }

    viewFiles(batch: any) {
        this.viewingAcceptedBatch = batch;
    }

    closeAcceptedView() {
        this.showAccepted = false;
        this.viewingAcceptedBatch = null;
    }
}