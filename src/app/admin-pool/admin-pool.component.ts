import { Component, ChangeDetectorRef } from '@angular/core';
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

    // Rejection dialog for remaining items
    showRejectDialog: boolean = false;
    rejectionReason: string = '';

    // Reject all dialog
    showRejectAllDialog: boolean = false;
    rejectAllReason: string = '';

    // Track approved items (for UI state before submitting)
    approvedItems: Set<string> = new Set();

    currentPdfUrl: string | null = null;
    showRejected = false;
    showClaimed = false;
    showPooled = false;

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
        this.approvedItems.clear();
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

                    const BULK_BASE = `${CURRENT_API_URL}/server`;
                    item.pdfFiles = (item.pdfFiles || []).map((rel: string) =>
                        rel.startsWith('http')
                            ? rel
                            : `${BULK_BASE}${rel.startsWith('/') ? '' : '/'}${rel}`
                    );

                    // Store the status from database
                    item.dbStatus = item.status || 'PENDING';
                    item.dbRejectionReason = item.rejectionReason || '';

                    return item;
                });

                this.currentPdfUrl = null;
                this.reviewLoading = false;
                this.cdr.markForCheck();
            },
            (err) => {
                console.error(`Failed to fetch files for batch ${batchId}`, err);
                this.dummyFiles = [];
                this.reviewLoading = false;
                this.cdr.markForCheck();
            }
        );
    }

    /**
     * Get item's current status (from DB or pending UI change)
     */
    getItemStatus(file: any): string {
        // If user has approved it in UI (not yet saved)
        if (this.approvedItems.has(file.itemId)) {
            return 'APPROVED';
        }
        // Otherwise show status from database
        return file.dbStatus || 'PENDING';
    }

    /**
     * Get item's rejection reason
     */
    getItemRejectionReason(file: any): string {
        return file.dbRejectionReason || '';
    }

    /**
     * Approve a single item
     */
    approveSingleItem(itemId: string) {
        if (!this.approvedItems.has(itemId)) {
            this.approvedItems.add(itemId);
            this.cdr.markForCheck();
        }
    }

    /**
     * Unapprove a single item
     */
    unapproveSingleItem(itemId: string) {
        this.approvedItems.delete(itemId);
        this.cdr.markForCheck();
    }

    /**
     * Check if item is approved (in UI state)
     */
    isItemApproved(itemId: string): boolean {
        return this.approvedItems.has(itemId);
    }

    /**
     * Get count of approved items (from DB + UI state)
     */
    getApprovedCount(): number {
        let count = 0;
        this.dummyFiles.forEach(file => {
            if (file.dbStatus === 'APPROVED' || this.approvedItems.has(file.itemId)) {
                count++;
            }
        });
        return count;
    }

    /**
     * Get count of rejected items (from DB)
     */
    getRejectedCount(): number {
        let count = 0;
        this.dummyFiles.forEach(file => {
            if (file.dbStatus === 'REJECTED' && !this.approvedItems.has(file.itemId)) {
                count++;
            }
        });
        return count;
    }

    /**
     * Get count of pending items
     */
    getPendingCount(): number {
        let count = 0;
        this.dummyFiles.forEach(file => {
            if (file.dbStatus === 'PENDING' && !this.approvedItems.has(file.itemId)) {
                count++;
            }
        });
        return count;
    }

    /**
     * Get count of remaining items that will be rejected
     */
    getRemainingCount(): number {
        return this.dummyFiles.length - this.getApprovedCount();
    }

    /**
     * Approve all items in the batch
     */
    approveAllItems() {
        if (confirm('Are you sure you want to approve ALL items in this batch?')) {
            this.adminPoolService.approveAllBatch(this.actionUUID).subscribe(
                () => {
                    alert('✅ All items approved successfully!');
                    this.refreshAllData();
                    this.cancelReview();
                },
                (err) => {
                    console.error('Failed to approve all items', err);
                    alert('❌ Failed to approve all items: ' + (err.error?.error || 'Unknown error'));
                }
            );
        }
    }

    /**
     * Open dialog to reject ALL items
     */
    openRejectAllDialog() {
        this.rejectAllReason = '';
        this.showRejectAllDialog = true;
    }

    /**
     * Close reject all dialog
     */
    closeRejectAllDialog() {
        this.showRejectAllDialog = false;
        this.rejectAllReason = '';
    }

    /**
     * Confirm reject all items
     */
    confirmRejectAll() {
        const reason = this.rejectAllReason.trim();

        if (!reason) {
            alert('❌ Please provide a rejection reason.');
            return;
        }

        this.adminPoolService.rejectAllBatch(this.actionUUID, reason).subscribe(
            () => {
                alert('✅ All items rejected successfully!');
                this.refreshAllData();
                this.closeRejectAllDialog();
                this.cancelReview();
            },
            (err) => {
                console.error('Failed to reject all items', err);
                alert('❌ Failed to reject all items: ' + (err.error?.error || 'Unknown error'));
                this.closeRejectAllDialog();
            }
        );
    }

    /**
     * Open dialog to reject remaining items
     */
    openRejectRemainingDialog() {
        if (this.approvedItems.size === 0) {
            alert('❌ You must approve at least one item before rejecting the rest.\n\nIf you want to reject all items, use the "Reject All Items" button.');
            return;
        }

        if (this.getApprovedCount() === this.dummyFiles.length) {
            alert('❌ All items are already approved. There are no items to reject.');
            return;
        }

        this.rejectionReason = '';
        this.showRejectDialog = true;
    }

    /**
     * Close reject dialog
     */
    closeRejectDialog() {
        this.showRejectDialog = false;
        this.rejectionReason = '';
    }

    /**
     * Submit partial review: approve selected, reject rest
     */
    submitPartialReview() {
        const reason = this.rejectionReason.trim();

        if (!reason) {
            alert('❌ Please provide a rejection reason for the remaining items.');
            return;
        }

        const reviewItems: any[] = [];

        // Add all items with their actions
        this.dummyFiles.forEach((file) => {
            if (file.dbStatus === 'APPROVED' || this.approvedItems.has(file.itemId)) {
                // Item is approved (either from DB or UI)
                reviewItems.push({
                    itemId: file.itemId,
                    action: 'APPROVE'
                });
            } else {
                // Reject remaining items
                reviewItems.push({
                    itemId: file.itemId,
                    action: 'REJECT',
                    rejectionReason: reason
                });
            }
        });

        this.adminPoolService.reviewBatch(this.actionUUID, {
            batchAction: 'PARTIAL',
            items: reviewItems
        }).subscribe(
            () => {
                const approveCount = reviewItems.filter(i => i.action === 'APPROVE').length;
                const rejectCount = reviewItems.filter(i => i.action === 'REJECT').length;
                alert(`✅ Review submitted successfully!\n✓ Approved: ${approveCount}\n✗ Rejected: ${rejectCount}`);
                this.refreshAllData();
                this.closeRejectDialog();
                this.cancelReview();
            },
            (err) => {
                console.error('Failed to submit review', err);
                alert('❌ Failed to submit review: ' + (err.error?.error || 'Unknown error'));
                this.closeRejectDialog();
            }
        );
    }

    openPdf(url: string | null | undefined) {
        if (!url) {
            console.warn('No PDF URL provided');
            return;
        }

        const fullUrl = url.startsWith('http')
            ? url
            : `${CURRENT_API_URL}${url.startsWith('/') ? '' : '/'}${url}`;

        window.open(fullUrl, '_blank');
    }

    refreshAllData() {
        this.fetchClaimedTasks();
        this.fetchPooledTasks();
        this.fetchRejectedTasks();
        this.fetchAcceptedSubmissions();
    }

    cancelReview() {
        this.selectedBatch = null;
        this.reviewLoading = false;
        this.approvedItems.clear();
        this.currentPdfUrl = null;
    }

    getBatchInfo() {
        alert("Fetching batch info...");
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

    scrollToReview() {
        const element = document.getElementById('reviewSection');
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }

    toggleSection(section: string) {
        switch (section) {
            case 'rejected':
                this.showRejected = !this.showRejected;
                break;
            case 'claimed':
                this.showClaimed = !this.showClaimed;
                break;
            case 'pooled':
                this.showPooled = !this.showPooled;
                break;
        }
    }
    /**
 * Check if item can be approved (not already approved)
 */
    canApproveItem(file: any): boolean {
        return file.dbStatus !== 'APPROVED';
    }

    /**
     * Check if item can be rejected (not already rejected)
     */
    canRejectItem(file: any): boolean {
        return file.dbStatus !== 'REJECTED';
    }

    /**
     * Reject a single item
     */
    rejectSingleItem(itemId: string) {
        const reason = prompt('Enter rejection reason for this item:');
        if (!reason || !reason.trim()) {
            alert('❌ Rejection reason is required.');
            return;
        }

        this.adminPoolService.reviewBatch(this.actionUUID, {
            batchAction: 'PARTIAL',
            items: [{
                itemId: itemId,
                action: 'REJECT',
                rejectionReason: reason.trim()
            }]
        }).subscribe(
            () => {
                alert('✅ Item rejected successfully!');
                // Refresh the batch details to show updated status
                this.openReviewDialog(this.selectedBatch);
            },
            (err) => {
                console.error('Failed to reject item', err);
                alert('❌ Failed to reject item: ' + (err.error?.error || 'Unknown error'));
            }
        );
    }

    /**
     * Approve a single item (save to DB immediately)
     */
    approveSingleItemToDB(itemId: string) {
        this.adminPoolService.reviewBatch(this.actionUUID, {
            batchAction: 'PARTIAL',
            items: [{
                itemId: itemId,
                action: 'APPROVE'
            }]
        }).subscribe(
            () => {
                alert('✅ Item approved successfully!');
                // Refresh the batch details to show updated status
                this.openReviewDialog(this.selectedBatch);
            },
            (err) => {
                console.error('Failed to approve item', err);
                alert('❌ Failed to approve item: ' + (err.error?.error || 'Unknown error'));
            }
        );
    }
}