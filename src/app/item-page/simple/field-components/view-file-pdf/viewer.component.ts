import {
  Component,
  OnInit,
  OnDestroy,
  ElementRef,
  ViewChild
} from "@angular/core";
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from "@angular/router";
import { Location } from "@angular/common";
import { PdfService } from "src/app/core/serachpage/pdf-auth.service";
import { SafePipe } from "./safe.pipe";
@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, SafePipe],
  selector: 'app-viewer',
  templateUrl: './viewer.component.html',
  styleUrls: ['./viewer.component.scss']
})
export class ViewerComponent implements OnInit, OnDestroy {

  @ViewChild("pdfContainer") pdfContainer!: ElementRef;

  // ================= STATE =================
  isLoading = false;
  checkingPermissions = false;

  hasTimeAccess = true;
  canDownloadFile = true;
  canPrintFile = true;
  isAdmin = false;

  isPdfFile = true;
  isImageFile = false;
  isVideoFile = false;
  isAudioFile = false;

  isMetadataMinimized = false;
  isCommentMinimized = false;
  zoomLevel = 1;

  // ================= PIN DIALOG =================
  showPinDialog = false;
  userPin = "";
  pinError = "";

  zoomIn() {
    this.zoomLevel += 0.2;
  }

  zoomOut() {
    if (this.zoomLevel > 0.4) {
      this.zoomLevel -= 0.2;
    }
  }

  // ================= ACCESS =================
  timeAccessStatus: any = null;

  // ================= PDF =================
  currentBitstreamId = "";
  currentFileName = "document.pdf";
  fileUrl = "";
  currentPage = 1;
  totalPages = 1;

  // ================= SEARCH =================
  isSearchVisible = false;
  searchText = "";
  searchResults: any[] = [];
  currentSearchIndex = 0;

  // ================= IMAGE =================
  imageZoomLevel = 1;

  // ================= VIDEO =================
  videoError = false;

  // ================= METADATA =================
  metadata: any[] = [];

  // ================= COMMENTS =================
  comments: any[] = [];
  newCommentText = "";
  isAddingComment = false;
  deletingCommentId: number | null = null;
  showDeleteConfirmation = false;

  constructor(
    private route: ActivatedRoute,
    private location: Location,
    private pdfService: PdfService
  ) { }

  // ================= INIT =================
  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (params["bitstreamUuid"]) {
        this.currentBitstreamId = params["bitstreamUuid"];
        this.loadWithSignerCheck(this.currentBitstreamId);
      }
    });
  }

  // ================= SIGNER FLOW =================
  loadWithSignerCheck(bitstreamId: string) {
    this.isLoading = true;

    this.pdfService.checkSignerStatus().subscribe({
      next: status => {
        console.log('Signer status:', status);
        
        if (!status) {
          alert("Please attach your digital signature certificate. It is not detected.");
          this.isLoading = false;
          return;
        }

        // Token is available, now ask for PIN
        this.showPinDialog = true;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Signer check error:', err);
        alert("Signer service not reachable. Please ensure the local signer application is running.");
        this.isLoading = false;
      }
    });
  }

  // ================= PIN HANDLING =================
  submitPin() {
    if (!this.userPin || this.userPin.trim() === "") {
      this.pinError = "Please enter your PIN";
      return;
    }

    this.pinError = "";
    this.showPinDialog = false;
    this.isLoading = true;

    // Now encrypt and sign the PDF
    this.pdfService.encryptAndSignBitstream(
      this.currentBitstreamId,
      'view',
      this.userPin,
      this.currentFileName
    ).subscribe({
      next: signedBlob => {
        console.log('PDF signed successfully');
        this.fileUrl = this.pdfService.createBlobUrl(signedBlob);
        this.isLoading = false;
        this.userPin = ""; // Clear PIN for security
      },
      error: (err) => {
        console.error('Signing error:', err);
        alert("Failed to sign PDF. Please check your PIN and try again.");
        this.isLoading = false;
        this.showPinDialog = true; // Show dialog again
      }
    });
  }

  cancelPinDialog() {
    this.showPinDialog = false;
    this.userPin = "";
    this.pinError = "";
    this.goBack();
  }

  // ================= UI =================
  toggleFullScreen() { document.documentElement.requestFullscreen(); }

  toggleMetadataPanel() { this.isMetadataMinimized = !this.isMetadataMinimized; }
  toggleCommentPanel() { this.isCommentMinimized = !this.isCommentMinimized; }

  maximizePdfView() {
    this.isMetadataMinimized = true;
    this.isCommentMinimized = true;
  }

  restorePanels() {
    this.isMetadataMinimized = false;
    this.isCommentMinimized = false;
  }

  prevPage() { if (this.currentPage > 1) this.currentPage--; }
  nextPage() { if (this.currentPage < this.totalPages) this.currentPage++; }

  // ================= SEARCH =================
  toggleSearch() { this.isSearchVisible = !this.isSearchVisible; }
  searchPdf() { }
  clearSearch() { this.searchText = ""; }
  prevSearchResult() { }
  nextSearchResult() { }

  // ================= IMAGE =================
  imageZoomIn() { this.imageZoomLevel += 0.2; }
  imageZoomOut() { if (this.imageZoomLevel > 0.5) this.imageZoomLevel -= 0.2; }
  toggleImageFullScreen() { }
  openImageInNewTab() { }
  downloadImage() { }

  // ================= VIDEO =================
  openVideoInNewTab() { }
  downloadVideo() { }
  onVideoError(event?: any) { this.videoError = true; }

  // ================= AUDIO =================
  openAudioInNewTab() { }
  downloadAudio() { }

  // ================= FILE =================
  downloadFile() { }
  printFile() { }

  // ================= COMMENTS =================
  addComment() { }
  confirmDelete(id: number) {
    this.deletingCommentId = id;
    this.showDeleteConfirmation = true;
  }
  cancelDelete() {
    this.showDeleteConfirmation = false;
    this.deletingCommentId = null;
  }
  confirmDeleteComment() { }

  // ================= PERMISSIONS =================
  checkFilePermissions(id: string) { }

  // ================= NAV =================
  goBack() { this.location.back(); }

  // ================= CLEAN =================
  ngOnDestroy(): void {
    if (this.fileUrl?.startsWith("blob:")) {
      this.pdfService.revokeBlobUrl(this.fileUrl);
    }
  }
}