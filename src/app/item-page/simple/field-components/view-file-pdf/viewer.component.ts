// import {
//   Component,
//   OnInit,
//   OnDestroy,
//   ElementRef,
//   ViewChild,
//   HostListener
// } from "@angular/core";
// import { CommonModule } from '@angular/common';
// import { FormsModule } from '@angular/forms';
// import { ActivatedRoute } from "@angular/router";
// import { Location } from "@angular/common";
// import { PdfService } from "src/app/core/serachpage/pdf-auth.service";
// import { SafePipe } from "./safe.pipe";
// import { ChangeDetectorRef } from '@angular/core';
// import { SignpostingDataService1 } from "src/app/core/serachpage/signposting-metadata-data.service";
// import { timeout, catchError, of, throwError } from 'rxjs';

// declare const pdfjsLib: any;

// @Component({
//   standalone: true,
//   imports: [CommonModule, FormsModule, SafePipe],
//   selector: 'app-viewer',
//   templateUrl: './viewer.component.html',
//   styleUrls: ['./viewer.component.scss']
// })
// export class ViewerComponent implements OnInit, OnDestroy {

//   @ViewChild("pdfContainer") pdfContainer!: ElementRef;

//   isLoading = false;
//   checkingPermissions = false;

//   hasTimeAccess = true;
//   canDownloadFile = true;
//   canPrintFile = true;
//   isAdmin = false;

//   isPdfFile = true;
//   isImageFile = false;
//   isVideoFile = false;
//   isAudioFile = false;

//   isMetadataMinimized = false;
//   isCommentMinimized = false;
//   zoomLevel = 1;

//   showPinDialog = false;
//   userPin = "";
//   pinError = "";

//   timeAccessStatus: any = null;

//   currentBitstreamId = "";
//   currentFileName = "document.pdf";
//   fileUrl = "";
//   currentPage = 1;
//   totalPages = 1;

//   isSearchVisible = false;
//   searchText = "";
//   searchResults: any[] = [];
//   currentSearchIndex = 0;

//   imageZoomLevel = 1;
//   videoError = false;

//   metadata: any[] = [];
//   comments: any[] = [];
//   newCommentText = "";
//   isAddingComment = false;
//   deletingCommentId: number | null = null;
//   showDeleteConfirmation = false;
//   userPdfPassword = "";
//   private viewPdfPassword = ""; // Store PDF password from view
//   private viewDscPin = ""; // Store DSC PIN from view
//   private isDscAvailable = false;

//   // PDF.js specific properties
//   // PDF.js specific properties
//   private pdfDocument: any = null;
//   private renderTasks: Map<number, any> = new Map();
//   private renderedPages: Set<number> = new Set();
//   private isScrollUpdating = false;
//   private isCurrentPdfSigned = false;
//   private lastUsedPin = "";

//   excludedFields = [
//     "dc.description.provenance",
//     "dc.identifier.uri",
//     "dc.date.accessioned"
//   ];

//   orderedMetadataKeys = [
//     "dc.casetype",
//     "dc.title",
//     "dc.caseyear",
//     "dc.date.disposal",
//     "dc.contributor.author",
//     "dc.pname",
//     "dc.rname",
//     "dc.paname",
//     "dc.raname",
//     "dc.district",
//     "dc.date.scan",
//     "dc.verified-by",
//     "dc.date.verification",
//     "dc.barcode",
//     "dc.batch-number",
//     "dc.size",
//     "dc.char-count",
//     "dc.pages"
//   ];

//   customMetadataLabels: { [key: string]: string } = {
//     "dc.caseyear": "Case Year",
//     "dc.casetype": "Case Type",
//     "dc.title": "Case Number",
//     "dc.district": "District",
//     "dc.pname": "Petitioner Name",
//     "dc.rname": "Respondent Name",
//     "dc.paname": "Petitioner's Advocate Name",
//     "dc.raname": "Respondent's Advocate Name",
//     "dc.contributor.author": "Judge Name",
//     "dc.date.disposal": "Disposal Date",
//     "dc.barcode": "Barcode Number",
//     "dc.batch-number": "Batch Number",
//     "dc.char-count": "Character Count",
//     "dc.date.scan": "Scan Date",
//     "dc.date.verification": "Date Verification",
//     "dc.pages": "No of Pages of the Main File",
//     "dc.size": "File Size",
//     "dc.verified-by": "Verified By"
//   };

//   constructor(
//     private route: ActivatedRoute,
//     private location: Location,
//     private pdfService: PdfService,
//     private cdr: ChangeDetectorRef,
//     private metadataApiService: SignpostingDataService1
//   ) { }


//   submitPin() {
//     if (!this.userPin.trim()) {
//       this.pinError = "Please enter your DSC PIN";
//       return;
//     }

//     if (!this.userPdfPassword.trim()) {
//       this.pinError = "Please enter your PDF password";
//       return;
//     }

//     this.pinError = "";

//     // Store both credentials for download reuse
//     this.viewDscPin = this.userPin;
//     this.viewPdfPassword = this.userPdfPassword;

//     this.showPinDialog = false;
//     this.isLoading = true;
//     this.cdr.detectChanges();

//     this.pdfService.encryptBitstream(this.currentBitstreamId, 'view')
//       .subscribe({
//         next: (blob) => {
//           this.pdfService.signPdfWithLocalSigner(
//             blob,
//             'view',
//             this.userPin,
//             this.currentFileName,
//             this.userPdfPassword
//           ).subscribe({
//             next: signedBlob => {
//               this.isCurrentPdfSigned = true;
//               this.isDscAvailable = true; // ✅ Confirm DSC was used successfully
//               this.lastUsedPin = this.userPin;
//               this.userPin = "";
//               this.userPdfPassword = "";

//               this.loadPdfWithPdfJs(signedBlob);

//               this.isLoading = false;
//               this.cdr.detectChanges();
//             },
//             error: () => {
//               alert("Signing failed. Please check your credentials and try again.");
//               this.isLoading = false;
//               this.showPinDialog = true;
//               this.cdr.detectChanges();
//             }
//           });
//         },
//         error: () => {
//           alert("Failed to fetch PDF. Please try again.");
//           this.isLoading = false;
//           this.showPinDialog = true;
//           this.cdr.detectChanges();
//         }
//       });
//   }

//   ngOnInit(): void {
//     // Set PDF.js worker
//     if (typeof pdfjsLib !== 'undefined') {
//       pdfjsLib.GlobalWorkerOptions.workerSrc =
//         'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
//     }

//     this.route.params.subscribe(params => {
//       if (params["bitstreamUuid"]) {
//         this.currentBitstreamId = params["bitstreamUuid"];
//       }

//       if (params["itemUuid"]) {
//         this.fetchMetadataFromApi(params["itemUuid"]);
//       }

//       if (params["bitstreamUuid"]) {
//         this.loadWithSignerCheck(this.currentBitstreamId);
//       }
//     });
//   }

//   @HostListener('scroll', ['$event'])
//   onScroll(event: Event) {
//     this.updateCurrentPageFromScroll();
//   }

//   loadWithSignerCheck(bitstreamId: string) {
//     this.isLoading = true;

//     this.pdfService.checkSignerStatus().pipe(
//       timeout(5000),
//       catchError(error => {
//         if (error.name === 'TimeoutError') {
//           console.warn('⏱️ Signer service timeout - proceeding without signature');
//           return of({ tokenPresent: false, timeout: true });
//         }
//         return throwError(() => error);
//       })
//     ).subscribe({
//       next: (status: any) => {
//         if (status.timeout) {
//           this.isDscAvailable = false; // ✅ DSC not available
//           const proceed = confirm(
//             "⚠️ DSC service is taking too long to respond.\n\n" +
//             "Click 'OK' to proceed without digital signature.\n" +
//             "Click 'Cancel' to wait longer."
//           );

//           if (!proceed) {
//             this.isLoading = false;
//             this.goBack();
//             return;
//           }

//           this.loadPdfNormally();
//           return;
//         }

//         if (!status.tokenPresent) {
//           this.isDscAvailable = false; // ✅ DSC not available
//           alert("⚠️ No DSC key found. Showing PDF without digital signature.");
//           this.loadPdfNormally();
//           return;
//         }

//         this.isDscAvailable = true; // ✅ DSC is available
//         this.showPinDialog = true;
//         this.isLoading = false;
//       },
//       error: () => {
//         this.isDscAvailable = false; // ✅ DSC not available
//         const proceed = confirm(
//           "⚠️ DSC service not reachable.\n\n" +
//           "Click 'OK' to proceed without digital signature.\n" +
//           "Click 'Cancel' to go back."
//         );

//         if (proceed) {
//           this.loadPdfNormally();
//         } else {
//           this.isLoading = false;
//           this.goBack();
//         }
//       }
//     });
//   }
//   loadPdfNormally() {
//     this.pdfService.encryptBitstream(this.currentBitstreamId, 'view')
//       .subscribe({
//         next: blob => {
//           this.loadPdfWithPdfJs(blob);
//           this.cdr.detectChanges();
//         },
//         error: () => {
//           alert("Unable to load document.");
//           this.isLoading = false;
//         }
//       });
//   }

//   fetchMetadataFromApi(itemUuid: string): void {
//     this.metadataApiService.getItemByUuid(itemUuid).subscribe({
//       next: (res) => {
//         const metadataMap: { [key: string]: string } = {};
//         const apiMetadata = res.metadata;

//         for (const key in apiMetadata) {
//           if (apiMetadata.hasOwnProperty(key) && !this.excludedFields.includes(key)) {
//             const values = apiMetadata[key];
//             metadataMap[key] = values.map((v: any) => v.value).join(", ");
//           }
//         }

//         const orderedMetadata: { name: string; value: string }[] = [];

//         this.orderedMetadataKeys.forEach((key) => {
//           if (metadataMap[key]) {
//             orderedMetadata.push({
//               name: this.customMetadataLabels[key] || key,
//               value: metadataMap[key]
//             });
//           }
//         });

//         for (const key in metadataMap) {
//           if (!this.orderedMetadataKeys.includes(key)) {
//             orderedMetadata.push({
//               name: this.customMetadataLabels[key] || key,
//               value: metadataMap[key]
//             });
//           }
//         }

//         this.metadata = orderedMetadata;
//         this.cdr.detectChanges();
//       },
//       error: err => console.error("Metadata load error", err)
//     });
//   }

//   private async loadPdfWithPdfJs(blob: Blob) {
//     try {
//       const arrayBuffer = await blob.arrayBuffer();
//       const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });

//       this.pdfDocument = await loadingTask.promise;
//       this.totalPages = this.pdfDocument.numPages;
//       this.currentPage = 1;

//       this.fileUrl = this.pdfService.createBlobUrl(blob);

//       this.isLoading = false;
//       this.cdr.detectChanges();

//       setTimeout(() => this.renderAllPages(), 100);
//     } catch (error) {
//       console.error('Error loading PDF:', error);
//       alert("Error loading PDF document");
//       this.isLoading = false;
//     }
//   }

//   private async renderAllPages() {
//     if (!this.pdfDocument || !this.pdfContainer) return;

//     const container = this.pdfContainer.nativeElement;
//     container.innerHTML = '';

//     for (let pageNum = 1; pageNum <= this.totalPages; pageNum++) {
//       const pageContainer = document.createElement('div');
//       pageContainer.className = 'pdf-page-container';
//       pageContainer.id = `page-${pageNum}`;
//       pageContainer.style.marginBottom = '20px';
//       pageContainer.style.position = 'relative';

//       const pageLabel = document.createElement('div');
//       pageLabel.className = 'page-label';
//       pageLabel.textContent = `Page ${pageNum}`;
//       pageLabel.style.textAlign = 'center';
//       pageLabel.style.padding = '10px';
//       pageLabel.style.color = '#666';
//       pageLabel.style.fontSize = '14px';
//       pageContainer.appendChild(pageLabel);

//       const canvasWrapper = document.createElement('div');
//       canvasWrapper.className = 'canvas-wrapper';
//       canvasWrapper.style.display = 'flex';
//       canvasWrapper.style.justifyContent = 'center';
//       pageContainer.appendChild(canvasWrapper);

//       container.appendChild(pageContainer);

//       this.renderPage(pageNum, canvasWrapper);
//     }

//     this.setupScrollObserver();
//   }

//   private async renderPage(pageNum: number, canvasWrapper: HTMLElement) {
//     try {
//       const page = await this.pdfDocument.getPage(pageNum);

//       const canvas = document.createElement('canvas');
//       const context = canvas.getContext('2d');
//       canvasWrapper.appendChild(canvas);

//       const containerWidth = this.pdfContainer.nativeElement.clientWidth - 40;
//       const viewport = page.getViewport({ scale: 1.0 });
//       const scale = (containerWidth / viewport.width) * this.zoomLevel;
//       const scaledViewport = page.getViewport({ scale });

//       canvas.height = scaledViewport.height;
//       canvas.width = scaledViewport.width;

//       const renderContext = {
//         canvasContext: context,
//         viewport: scaledViewport
//       };

//       const renderTask = page.render(renderContext);
//       this.renderTasks.set(pageNum, renderTask);

//       await renderTask.promise;
//       this.renderedPages.add(pageNum);
//       this.renderTasks.delete(pageNum);

//     } catch (error: any) {
//       if (error?.name === 'RenderingCancelledException') {
//         return;
//       }
//       console.error(`Error rendering page ${pageNum}:`, error);
//     }
//   }

//   private setupScrollObserver() {
//     const options = {
//       root: this.pdfContainer.nativeElement,
//       rootMargin: '0px',
//       threshold: 0.5
//     };

//     const observer = new IntersectionObserver((entries) => {
//       entries.forEach(entry => {
//         if (entry.isIntersecting) {
//           const pageNum = parseInt(entry.target.id.replace('page-', ''));
//           if (!isNaN(pageNum) && this.currentPage !== pageNum) {
//             this.currentPage = pageNum;
//             this.cdr.detectChanges();
//           }
//         }
//       });
//     }, options);

//     const pageContainers = this.pdfContainer.nativeElement.querySelectorAll('.pdf-page-container');
//     pageContainers.forEach((container: Element) => observer.observe(container));
//   }

//   private updateCurrentPageFromScroll() {
//     if (this.isScrollUpdating || !this.pdfContainer) return;

//     const container = this.pdfContainer.nativeElement;
//     const pageContainers = container.querySelectorAll('.pdf-page-container');

//     let currentVisiblePage = 1;
//     pageContainers.forEach((pageContainer: any, index: number) => {
//       const rect = pageContainer.getBoundingClientRect();
//       const containerRect = container.getBoundingClientRect();

//       if (rect.top <= containerRect.top + containerRect.height / 2 &&
//         rect.bottom >= containerRect.top + containerRect.height / 2) {
//         currentVisiblePage = index + 1;
//       }
//     });

//     if (this.currentPage !== currentVisiblePage) {
//       this.currentPage = currentVisiblePage;
//       this.cdr.detectChanges();
//     }
//   }

//   setPdfUrl(blob: Blob) {
//     this.loadPdfWithPdfJs(blob);
//   }

//   // private pdfDocument: any = null;
//   // private renderTasks: Map<number, any> = new Map();
//   // private renderedPages: Set<number> = new Set();
//   // private isScrollUpdating = false;

//   cancelPinDialog() {
//     this.showPinDialog = false;
//     this.userPin = "";
//     this.userPdfPassword = ""; // ✅ Clear PDF password too
//     this.pinError = "";
//     this.goBack();
//   }

//   downloadFile() {
//   if (!this.canDownloadFile) {
//     console.warn("Download permission denied");
//     return;
//   }

//   const filename = this.generateCustomFilename() || "document.pdf";

//   // ✅ Check if DSC was available during view
//   if (!this.isDscAvailable) {
//     // DSC not available - download without signing
//     this.isLoading = true;
    
//     this.pdfService.encryptBitstream(this.currentBitstreamId, 'download')
//       .subscribe({
//         next: (blob) => {
//           const url = this.pdfService.createBlobUrl(blob);
//           const a = document.createElement('a');
//           a.href = url;
//           a.download = filename;
//           a.click();
//           this.pdfService.revokeBlobUrl(url);
//           this.isLoading = false;
//           this.cdr.detectChanges();
//           // console.log("✅ Downloaded without signature (DSC not available)");
//         },
//         error: () => {
//           alert("Failed to download file. Please try again.");
//           this.isLoading = false;
//         }
//       });
//     return;
//   }

//   // ✅ DSC available - check if user already viewed with DSC
//   if (this.isCurrentPdfSigned && this.viewDscPin && this.viewPdfPassword) {
//     // Reuse stored credentials from view
//     this.isLoading = true;
    
//     this.pdfService.encryptBitstream(this.currentBitstreamId, 'download')
//       .subscribe({
//         next: (blob) => {
//           this.pdfService.signPdfWithLocalSigner(
//             blob,
//             'download',
//             this.viewDscPin,
//             filename,
//             this.viewPdfPassword
//           ).subscribe({
//             next: (signedBlob) => {
//               const url = this.pdfService.createBlobUrl(signedBlob);
//               const a = document.createElement('a');
//               a.href = url;
//               a.download = filename;
//               a.click();
//               this.pdfService.revokeBlobUrl(url);
//               this.isLoading = false;
//               this.cdr.detectChanges();
//               // console.log("✅ Downloaded with stored credentials");
//             },
//             error: () => {
//               alert("Download signing failed. Please try again.");
//               this.isLoading = false;
//             }
//           });
//         },
//         error: () => {
//           alert("Failed to fetch file for download. Please try again.");
//           this.isLoading = false;
//         }
//       });
//     return;
//   }

//   // ✅ DSC available but user viewed without signing - ask for credentials
//   const pdfPassword = prompt("Enter PDF password:");
//   if (!pdfPassword) return;

//   const pin = prompt("Enter DSC PIN:");
//   if (!pin) return;

//   this.isLoading = true;

//   this.pdfService.encryptBitstream(this.currentBitstreamId, 'download')
//     .subscribe({
//       next: (blob) => {
//         this.pdfService.signPdfWithLocalSigner(
//           blob,
//           'download',
//           pin,
//           filename,
//           pdfPassword
//         ).subscribe({
//           next: (signedBlob) => {
//             const url = this.pdfService.createBlobUrl(signedBlob);
//             const a = document.createElement('a');
//             a.href = url;
//             a.download = filename;
//             a.click();
//             this.pdfService.revokeBlobUrl(url);
//             this.isLoading = false;
//             this.cdr.detectChanges();
//           },
//           error: () => {
//             alert("Signing failed. Please check your credentials and try again.");
//             this.isLoading = false;
//           }
//         });
//       },
//       error: () => {
//         alert("Failed to fetch file. Please try again.");
//         this.isLoading = false;
//       }
//     });
// }

//   private generateCustomFilename(): string {
//     const caseType = this.findMetadataByPartialName("type");
//     const caseNumber = this.findMetadataByPartialName("number");
//     const caseYear = this.findMetadataByPartialName("year");

//     const parts = [caseType, caseNumber, caseYear]
//       .map((p) => p?.replace(/[^a-zA-Z0-9]/g, ""))
//       .filter(Boolean);

//     return parts.length > 0 ? parts.join("_") + ".pdf" : "document.pdf";
//   }

//   private findMetadataByPartialName(partialName: string): string {
//     const lowerPartialName = partialName.toLowerCase();
//     const entry = this.metadata.find((item) =>
//       item.name.toLowerCase().includes(lowerPartialName)
//     );
//     return entry?.value?.trim() || "";
//   }

//   toggleFullScreen() {
//     document.documentElement.requestFullscreen();
//   }

//   toggleMetadataPanel() {
//     this.isMetadataMinimized = !this.isMetadataMinimized;
//     setTimeout(() => this.reRenderAllPages(), 100);
//   }

//   toggleCommentPanel() {
//     this.isCommentMinimized = !this.isCommentMinimized;
//     setTimeout(() => this.reRenderAllPages(), 100);
//   }

//   maximizePdfView() {
//     this.isMetadataMinimized = true;
//     this.isCommentMinimized = true;
//     setTimeout(() => this.reRenderAllPages(), 100);
//   }

//   restorePanels() {
//     this.isMetadataMinimized = false;
//     this.isCommentMinimized = false;
//     setTimeout(() => this.reRenderAllPages(), 100);
//   }

//   prevPage() {
//     if (this.currentPage > 1) {
//       this.scrollToPage(this.currentPage - 1);
//     }
//   }

//   nextPage() {
//     if (this.currentPage < this.totalPages) {
//       this.scrollToPage(this.currentPage + 1);
//     }
//   }

//   private scrollToPage(pageNum: number) {
//     this.isScrollUpdating = true;
//     const pageElement = this.pdfContainer.nativeElement.querySelector(`#page-${pageNum}`);
//     if (pageElement) {
//       pageElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
//       this.currentPage = pageNum;
//       this.cdr.detectChanges();
//     }
//     setTimeout(() => {
//       this.isScrollUpdating = false;
//     }, 500);
//   }

//   zoomIn() {
//     this.zoomLevel += 0.2;
//     this.reRenderAllPages();
//   }

//   zoomOut() {
//     if (this.zoomLevel > 0.4) {
//       this.zoomLevel -= 0.2;
//       this.reRenderAllPages();
//     }
//   }

//   private reRenderAllPages() {
//     this.renderTasks.forEach((task) => {
//       try {
//         task.cancel();
//       } catch (e) { }
//     });
//     this.renderTasks.clear();
//     this.renderedPages.clear();

//     this.renderAllPages();
//   }

//   toggleSearch() {
//     this.isSearchVisible = !this.isSearchVisible;
//   }

//   async searchPdf() {
//     if (!this.searchText.trim() || !this.pdfDocument) return;

//     this.searchResults = [];
//     this.currentSearchIndex = 0;

//     try {
//       for (let pageNum = 1; pageNum <= this.totalPages; pageNum++) {
//         const page = await this.pdfDocument.getPage(pageNum);
//         const textContent = await page.getTextContent();
//         const pageText = textContent.items.map((item: any) => item.str).join(' ');

//         const searchLower = this.searchText.toLowerCase();
//         const textLower = pageText.toLowerCase();

//         let index = textLower.indexOf(searchLower);
//         while (index !== -1) {
//           this.searchResults.push({
//             pageNum: pageNum,
//             index: index
//           });
//           index = textLower.indexOf(searchLower, index + 1);
//         }
//       }

//       if (this.searchResults.length > 0) {
//         this.currentSearchIndex = 0;
//         this.scrollToPage(this.searchResults[0].pageNum);
//       } else {
//         alert('No results found');
//       }

//       this.cdr.detectChanges();
//     } catch (error) {
//       console.error('Search error:', error);
//     }
//   }

//   clearSearch() {
//     this.searchText = "";
//     this.searchResults = [];
//     this.currentSearchIndex = 0;
//   }

//   prevSearchResult() {
//     if (this.currentSearchIndex > 0) {
//       this.currentSearchIndex--;
//       const result = this.searchResults[this.currentSearchIndex];
//       this.scrollToPage(result.pageNum);
//     }
//   }

//   nextSearchResult() {
//     if (this.currentSearchIndex < this.searchResults.length - 1) {
//       this.currentSearchIndex++;
//       const result = this.searchResults[this.currentSearchIndex];
//       this.scrollToPage(result.pageNum);
//     }
//   }

//   printFile() {
//     if (!this.canPrintFile) {
//       console.warn("Print permission denied");
//       return;
//     }

//     if (this.fileUrl) {
//       const printWindow = window.open(this.fileUrl, '_blank');
//       if (printWindow) {
//         printWindow.addEventListener('load', () => {
//           printWindow.focus();
//           printWindow.print();
//         });
//       } else {
//         alert('Popup blocked! Please allow popups for this site to print the PDF.');
//       }
//     }
//   }

//   imageZoomIn() { this.imageZoomLevel += 0.2; }
//   imageZoomOut() { if (this.imageZoomLevel > 0.5) this.imageZoomLevel -= 0.2; }
//   toggleImageFullScreen() { }
//   openImageInNewTab() { if (this.fileUrl) window.open(this.fileUrl, '_blank'); }
//   downloadImage() {
//     if (this.fileUrl && this.canDownloadFile) {
//       const link = document.createElement('a');
//       link.href = this.fileUrl;
//       link.download = this.currentFileName;
//       link.click();
//     }
//   }

//   openVideoInNewTab() { if (this.fileUrl) window.open(this.fileUrl, '_blank'); }
//   downloadVideo() {
//     if (this.fileUrl && this.canDownloadFile) {
//       const link = document.createElement('a');
//       link.href = this.fileUrl;
//       link.download = this.currentFileName;
//       link.click();
//     }
//   }
//   onVideoError(event?: any) { this.videoError = true; }

//   openAudioInNewTab() { if (this.fileUrl) window.open(this.fileUrl, '_blank'); }
//   downloadAudio() {
//     if (this.fileUrl && this.canDownloadFile) {
//       const link = document.createElement('a');
//       link.href = this.fileUrl;
//       link.download = this.currentFileName;
//       link.click();
//     }
//   }

//   addComment() { }
//   confirmDelete(id: number) {
//     this.deletingCommentId = id;
//     this.showDeleteConfirmation = true;
//   }
//   cancelDelete() {
//     this.showDeleteConfirmation = false;
//     this.deletingCommentId = null;
//   }
//   confirmDeleteComment() { }
//   checkFilePermissions(id: string) { }

//   goBack() { this.location.back(); }

//   ngOnDestroy(): void {
//     this.renderTasks.forEach((task) => {
//       try {
//         task.cancel();
//       } catch (e) { }
//     });
//     this.renderTasks.clear();

//     if (this.pdfDocument) {
//       this.pdfDocument.destroy();
//     }

//     if (this.fileUrl?.startsWith("blob:")) {
//       this.pdfService.revokeBlobUrl(this.fileUrl);
//     }

//     this.lastUsedPin = "";
//     this.viewDscPin = "";
//     this.viewPdfPassword = "";
//     this.isDscAvailable = false;
//   }
// }

import {
  Component,
  OnInit,
  OnDestroy,
  ElementRef,
  ViewChild,
  HostListener
} from "@angular/core";
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from "@angular/router";
import { Location } from "@angular/common";
import { PdfService } from "src/app/core/serachpage/pdf-auth.service";
import { SafePipe } from "./safe.pipe";
import { ChangeDetectorRef } from '@angular/core';
import { SignpostingDataService1 } from "src/app/core/serachpage/signposting-metadata-data.service";
import { timeout, catchError, of, throwError } from 'rxjs';
import { BitstreamComment, BitstreamCommentService } from "src/app/core/serachpage/bitstream-comment.service";
import { BitstreamPermissionsService } from "src/app/core/serachpage/bitstream-permissions.service";

declare const pdfjsLib: any;

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, SafePipe],
  selector: 'app-viewer',
  templateUrl: './viewer.component.html',
  styleUrls: ['./viewer.component.scss']
})
export class ViewerComponent implements OnInit, OnDestroy {

  @ViewChild("pdfContainer") pdfContainer!: ElementRef;

  isLoading = false;
  checkingPermissions = false;

  hasTimeAccess = true;
  canDownloadFile = true;
  canPrintFile = false; // ❌ PRINT DISABLED - Users must download encrypted PDF
  isAdmin = false;

  isPdfFile = true;
  isImageFile = false;
  isVideoFile = false;
  isAudioFile = false;

  isMetadataMinimized = false;
  isCommentMinimized = false;
  zoomLevel = 1;

  showPinDialog = false;
  userPin = "";
  pinError = "";

  timeAccessStatus: any = null;

  currentBitstreamId = "";
  currentFileName = "document.pdf";
  fileUrl = "";
  currentPage = 1;
  totalPages = 1;

  isSearchVisible = false;
  searchText = "";
  searchResults: any[] = [];
  currentSearchIndex = 0;

  imageZoomLevel = 1;
  videoError = false;

  metadata: any[] = [];
  comments: BitstreamComment[] = [];
  newCommentText = "";
  isAddingComment = false;
  commentToDelete: number | null = null;
  deletingCommentId: number | null = null;
  showDeleteConfirmation = false;
  userPdfPassword = "";
  private viewPdfPassword = ""; // Store PDF password from view
  private viewDscPin = ""; // Store DSC PIN from view
  private isDscAvailable = false;

  // PDF.js specific properties
  private pdfDocument: any = null;
  private renderTasks: Map<number, any> = new Map();
  private renderedPages: Set<number> = new Set();
  private isScrollUpdating = false;
  private isCurrentPdfSigned = false;
  private lastUsedPin = "";

  excludedFields = [
    "dc.description.provenance",
    "dc.identifier.uri",
    "dc.date.accessioned"
  ];

  orderedMetadataKeys = [
    "dc.casetype",
    "dc.title",
    "dc.caseyear",
    "dc.date.disposal",
    "dc.contributor.author",
    "dc.pname",
    "dc.rname",
    "dc.paname",
    "dc.raname",
    "dc.district",
    "dc.date.scan",
    "dc.verified-by",
    "dc.date.verification",
    "dc.barcode",
    "dc.batch-number",
    "dc.size",
    "dc.char-count",
    "dc.pages"
  ];

  customMetadataLabels: { [key: string]: string } = {
    "dc.caseyear": "Case Year",
    "dc.casetype": "Case Type",
    "dc.title": "Case Number",
    "dc.district": "District",
    "dc.pname": "Petitioner Name",
    "dc.rname": "Respondent Name",
    "dc.paname": "Petitioner's Advocate Name",
    "dc.raname": "Respondent's Advocate Name",
    "dc.contributor.author": "Judge Name",
    "dc.date.disposal": "Disposal Date",
    "dc.barcode": "Barcode Number",
    "dc.batch-number": "Batch Number",
    "dc.char-count": "Character Count",
    "dc.date.scan": "Scan Date",
    "dc.date.verification": "Date Verification",
    "dc.pages": "No of Pages of the Main File",
    "dc.size": "File Size",
    "dc.verified-by": "Verified By",
    "dc.case.cnrno": "CNR Number",
    "dc.cino": "CINO",
    "dc.date.issued": "Date of Issue",
    "dc.judge.name": "Judge Name"
  };

  constructor(
    private route: ActivatedRoute,
    private location: Location,
    private pdfService: PdfService,
    private cdr: ChangeDetectorRef,
    private metadataApiService: SignpostingDataService1,
    private bitstreamCommentService: BitstreamCommentService,
    private bitstreamPermissionsService: BitstreamPermissionsService
  ) { }

  @HostListener('window:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent) {
    // Disable Ctrl+P / Cmd+P completely
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'p') {
      event.preventDefault();
      event.stopImmediatePropagation();
      alert('⚠️ Printing is disabled in the viewer.\n\nTo print this document:\n1. Download the encrypted PDF\n2. Enter the password when prompted\n3. Print from your PDF reader (e.g., Adobe Acrobat)');
      return false;
    }
  }

  // Disable browser context menu to prevent "Print" option
  disableContextMenu(event: MouseEvent) {
    event.preventDefault();
  }

  submitPin() {
    if (!this.userPin.trim()) {
      this.pinError = "Please enter your DSC PIN";
      return;
    }

    if (!this.userPdfPassword.trim()) {
      this.pinError = "Please enter your PDF password";
      return;
    }

    this.pinError = "";

    // Store both credentials for download reuse
    this.viewDscPin = this.userPin;
    this.viewPdfPassword = this.userPdfPassword;

    this.showPinDialog = false;
    this.isLoading = true;
    this.cdr.detectChanges();

    this.pdfService.encryptBitstream(this.currentBitstreamId, 'view')
      .subscribe({
        next: (blob) => {
          this.pdfService.signPdfWithLocalSigner(
            blob,
            'view',
            this.userPin,
            this.currentFileName,
            this.userPdfPassword
          ).subscribe({
            next: signedBlob => {
              this.isCurrentPdfSigned = true;
              this.isDscAvailable = true;
              this.lastUsedPin = this.userPin;
              this.userPin = "";
              this.userPdfPassword = "";

              this.loadPdfWithPdfJs(signedBlob);

              this.isLoading = false;
              this.cdr.detectChanges();
            },
            error: () => {
              alert("Signing failed. Please check your credentials and try again.");
              this.isLoading = false;
              this.showPinDialog = true;
              this.cdr.detectChanges();
            }
          });
        },
        error: () => {
          alert("Failed to fetch PDF. Please try again.");
          this.isLoading = false;
          this.showPinDialog = true;
          this.cdr.detectChanges();
        }
      });
  }

  ngOnInit(): void {
    // Set PDF.js worker
    if (typeof pdfjsLib !== 'undefined') {
      pdfjsLib.GlobalWorkerOptions.workerSrc =
        'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
    }

    this.route.params.subscribe(params => {
      if (params["bitstreamUuid"]) {
        this.currentBitstreamId = params["bitstreamUuid"];
      }

      if (params["itemUuid"]) {
        this.fetchMetadataFromApi(params["itemUuid"]);
      }

      if (params["bitstreamUuid"]) {
        this.checkFilePermissions(params["bitstreamUuid"]);
        this.loadWithSignerCheck(this.currentBitstreamId);
      }
    });
  }

  @HostListener('scroll', ['$event'])
  onScroll(event: Event) {
    this.updateCurrentPageFromScroll();
  }

  loadWithSignerCheck(bitstreamId: string) {
    this.isLoading = true;

    this.pdfService.checkSignerStatus().pipe(
      timeout(10000),
      catchError(error => {
        if (error.name === 'TimeoutError') {
          console.warn('⏱️ Signer service timeout - proceeding without signature');
          return of({ tokenPresent: false, timeout: true });
        }
        return throwError(() => error);
      })
    ).subscribe({
      next: (status: any) => {
        if (status.timeout) {
          this.isDscAvailable = false;
          this.loadComments(bitstreamId);
          const proceed = confirm(
            "⚠️ DSC service is taking too long to respond.\n\n" +
            "Click 'OK' to proceed without digital signature.\n" +
            "Click 'Cancel' to wait longer."
          );

          if (!proceed) {
            this.isLoading = false;
            this.goBack();
            return;
          }

          this.loadPdfNormally();
          return;
        }

        if (!status.tokenPresent) {
          this.isDscAvailable = false;
          alert("⚠️ No DSC key found. Showing PDF without digital signature.");
          this.loadPdfNormally();
          return;
        }

        this.isDscAvailable = true;
        this.showPinDialog = true;
        this.isLoading = false;
      },
      error: () => {
        this.isDscAvailable = false;
        const proceed = confirm(
          "⚠️ DSC service not reachable.\n\n" +
          "Click 'OK' to proceed without digital signature.\n" +
          "Click 'Cancel' to go back."
        );

        if (proceed) {
          this.loadPdfNormally();
        } else {
          this.isLoading = false;
          this.goBack();
        }
      }
    });
  }

  loadPdfNormally() {
    this.pdfService.encryptBitstream(this.currentBitstreamId, 'view')
      .subscribe({
        next: blob => {
          this.loadPdfWithPdfJs(blob);
          this.cdr.detectChanges();
        },
        error: () => {
          alert("Unable to load document.");
          this.isLoading = false;
        }
      });
  }

  fetchMetadataFromApi(itemUuid: string): void {
    this.metadataApiService.getItemByUuid(itemUuid).subscribe({
      next: (res) => {
        const metadataMap: { [key: string]: string } = {};
        const apiMetadata = res.metadata;

        for (const key in apiMetadata) {
          if (apiMetadata.hasOwnProperty(key) && !this.excludedFields.includes(key)) {
            const values = apiMetadata[key];
            metadataMap[key] = values.map((v: any) => v.value).join(", ");
          }
        }

        const orderedMetadata: { name: string; value: string }[] = [];

        this.orderedMetadataKeys.forEach((key) => {
          if (metadataMap[key]) {
            orderedMetadata.push({
              name: this.customMetadataLabels[key] || key,
              value: metadataMap[key]
            });
          }
        });

        for (const key in metadataMap) {
          if (!this.orderedMetadataKeys.includes(key)) {
            orderedMetadata.push({
              name: this.customMetadataLabels[key] || key,
              value: metadataMap[key]
            });
          }
        }

        this.metadata = orderedMetadata;
        this.cdr.detectChanges();
      },
      error: err => console.error("Metadata load error", err)
    });
  }

  private async loadPdfWithPdfJs(blob: Blob) {
    try {
      const arrayBuffer = await blob.arrayBuffer();
      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });

      this.pdfDocument = await loadingTask.promise;
      this.totalPages = this.pdfDocument.numPages;
      this.currentPage = 1;

      this.fileUrl = this.pdfService.createBlobUrl(blob);

      this.isLoading = false;
      this.cdr.detectChanges();

      setTimeout(() => this.renderAllPages(), 100);
    } catch (error) {
      console.error('Error loading PDF:', error);
      alert("Error loading PDF document");
      this.isLoading = false;
    }
  }

  private async renderAllPages() {
    if (!this.pdfDocument || !this.pdfContainer) return;

    const container = this.pdfContainer.nativeElement;
    container.innerHTML = '';

    for (let pageNum = 1; pageNum <= this.totalPages; pageNum++) {
      const pageContainer = document.createElement('div');
      pageContainer.className = 'pdf-page-container';
      pageContainer.id = `page-${pageNum}`;
      pageContainer.style.marginBottom = '20px';
      pageContainer.style.position = 'relative';

      const pageLabel = document.createElement('div');
      pageLabel.className = 'page-label';
      pageLabel.textContent = `Page ${pageNum}`;
      pageLabel.style.textAlign = 'center';
      pageLabel.style.padding = '10px';
      pageLabel.style.color = '#666';
      pageLabel.style.fontSize = '14px';
      pageContainer.appendChild(pageLabel);

      const canvasWrapper = document.createElement('div');
      canvasWrapper.className = 'canvas-wrapper';
      canvasWrapper.style.display = 'flex';
      canvasWrapper.style.justifyContent = 'center';
      pageContainer.appendChild(canvasWrapper);

      container.appendChild(pageContainer);

      this.renderPage(pageNum, canvasWrapper);
    }

    this.setupScrollObserver();
  }

  private async renderPage(pageNum: number, canvasWrapper: HTMLElement) {
    try {
      const page = await this.pdfDocument.getPage(pageNum);

      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      canvasWrapper.appendChild(canvas);

      const containerWidth = this.pdfContainer.nativeElement.clientWidth - 40;
      const viewport = page.getViewport({ scale: 1.0 });
      const scale = (containerWidth / viewport.width) * this.zoomLevel;
      const scaledViewport = page.getViewport({ scale });

      canvas.height = scaledViewport.height;
      canvas.width = scaledViewport.width;

      const renderContext = {
        canvasContext: context,
        viewport: scaledViewport
      };

      const renderTask = page.render(renderContext);
      this.renderTasks.set(pageNum, renderTask);

      await renderTask.promise;
      this.renderedPages.add(pageNum);
      this.renderTasks.delete(pageNum);

    } catch (error: any) {
      if (error?.name === 'RenderingCancelledException') {
        return;
      }
      console.error(`Error rendering page ${pageNum}:`, error);
    }
  }

  private setupScrollObserver() {
    const options = {
      root: this.pdfContainer.nativeElement,
      rootMargin: '0px',
      threshold: 0.5
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const pageNum = parseInt(entry.target.id.replace('page-', ''));
          if (!isNaN(pageNum) && this.currentPage !== pageNum) {
            this.currentPage = pageNum;
            this.cdr.detectChanges();
          }
        }
      });
    }, options);

    const pageContainers = this.pdfContainer.nativeElement.querySelectorAll('.pdf-page-container');
    pageContainers.forEach((container: Element) => observer.observe(container));
  }

  private updateCurrentPageFromScroll() {
    if (this.isScrollUpdating || !this.pdfContainer) return;

    const container = this.pdfContainer.nativeElement;
    const pageContainers = container.querySelectorAll('.pdf-page-container');

    let currentVisiblePage = 1;
    pageContainers.forEach((pageContainer: any, index: number) => {
      const rect = pageContainer.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();

      if (rect.top <= containerRect.top + containerRect.height / 2 &&
        rect.bottom >= containerRect.top + containerRect.height / 2) {
        currentVisiblePage = index + 1;
      }
    });

    if (this.currentPage !== currentVisiblePage) {
      this.currentPage = currentVisiblePage;
      this.cdr.detectChanges();
    }
  }

  setPdfUrl(blob: Blob) {
    this.loadPdfWithPdfJs(blob);
  }

  cancelPinDialog() {
    this.showPinDialog = false;
    this.userPin = "";
    this.userPdfPassword = "";
    this.pinError = "";
    this.goBack();
  }

  downloadFile() {
    if (!this.canDownloadFile) {
      console.warn("Download permission denied");
      return;
    }

    const filename = this.generateCustomFilename() || "document.pdf";

    // Show download instructions
    const downloadConfirmed = confirm(
      "📥 DOWNLOAD ENCRYPTED PDF\n\n" +
      "The PDF will be downloaded as a password-protected file.\n\n" +
      "To print the document:\n" +
      "1. Open the downloaded PDF in Adobe Acrobat or similar PDF reader\n" +
      "2. Enter the password when prompted\n" +
      "3. Print using your PDF reader's print function\n\n" +
      "Note: Printing is disabled in the web viewer for security.\n\n" +
      "Click OK to download the encrypted PDF."
    );

    if (!downloadConfirmed) {
      return;
    }

    // Check if DSC was available during view
    if (!this.isDscAvailable) {
      // DSC not available - download without signing
      this.isLoading = true;

      this.pdfService.encryptBitstream(this.currentBitstreamId, 'download')
        .subscribe({
          next: (blob) => {
            const url = this.pdfService.createBlobUrl(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            a.click();
            this.pdfService.revokeBlobUrl(url);
            this.isLoading = false;
            this.cdr.detectChanges();
            
            // Show post-download message
            setTimeout(() => {
              alert(
                "✅ Download Complete!\n\n" +
                "Your encrypted PDF has been downloaded.\n\n" +
                "To print:\n" +
                "• Open the file in a PDF reader\n" +
                "• Enter the password\n" +
                "• Use File > Print in the PDF reader"
              );
            }, 500);
          },
          error: () => {
            alert("Failed to download file. Please try again.");
            this.isLoading = false;
          }
        });
      return;
    }

    // DSC available - check if user already viewed with DSC
    if (this.isCurrentPdfSigned && this.viewDscPin && this.viewPdfPassword) {
      // Reuse stored credentials from view
      this.isLoading = true;

      this.pdfService.encryptBitstream(this.currentBitstreamId, 'download')
        .subscribe({
          next: (blob) => {
            this.pdfService.signPdfWithLocalSigner(
              blob,
              'download',
              this.viewDscPin,
              filename,
              this.viewPdfPassword
            ).subscribe({
              next: (signedBlob) => {
                const url = this.pdfService.createBlobUrl(signedBlob);
                const a = document.createElement('a');
                a.href = url;
                a.download = filename;
                a.click();
                this.pdfService.revokeBlobUrl(url);
                this.isLoading = false;
                this.cdr.detectChanges();
                
                // Show post-download message
                setTimeout(() => {
                  alert(
                    "✅ Download Complete!\n\n" +
                    "Your encrypted and digitally signed PDF has been downloaded.\n\n" +
                    "To print:\n" +
                    "• Open the file in a PDF reader\n" +
                    "• Enter the password you used earlier\n" +
                    "• Use File > Print in the PDF reader"
                  );
                }, 500);
              },
              error: () => {
                alert("Download signing failed. Please try again.");
                this.isLoading = false;
              }
            });
          },
          error: () => {
            alert("Failed to fetch file for download. Please try again.");
            this.isLoading = false;
          }
        });
      return;
    }

    // DSC available but user viewed without signing - ask for credentials
    const pdfPassword = prompt("Enter PDF password for the encrypted file:");
    if (!pdfPassword) return;

    const pin = prompt("Enter DSC PIN:");
    if (!pin) return;

    this.isLoading = true;

    this.pdfService.encryptBitstream(this.currentBitstreamId, 'download')
      .subscribe({
        next: (blob) => {
          this.pdfService.signPdfWithLocalSigner(
            blob,
            'download',
            pin,
            filename,
            pdfPassword
          ).subscribe({
            next: (signedBlob) => {
              const url = this.pdfService.createBlobUrl(signedBlob);
              const a = document.createElement('a');
              a.href = url;
              a.download = filename;
              a.click();
              this.pdfService.revokeBlobUrl(url);
              this.isLoading = false;
              this.cdr.detectChanges();
              
              // Show post-download message
              setTimeout(() => {
                alert(
                  "✅ Download Complete!\n\n" +
                  "Your encrypted and digitally signed PDF has been downloaded.\n\n" +
                  "Password: " + pdfPassword + "\n\n" +
                  "To print:\n" +
                  "• Open the file in a PDF reader\n" +
                  "• Enter the password shown above\n" +
                  "• Use File > Print in the PDF reader"
                );
              }, 500);
            },
            error: () => {
              alert("Signing failed. Please check your credentials and try again.");
              this.isLoading = false;
            }
          });
        },
        error: () => {
          alert("Failed to fetch file. Please try again.");
          this.isLoading = false;
        }
      });
  }

  loadComments(bitstreamId: string): void {
    this.bitstreamCommentService.getComments(bitstreamId).subscribe({
      next: (res) => {
        this.comments = res;
        this.cdr.detectChanges();
      },
      error: (err) => console.error("Failed to load comments", err),
    });
  }

  private generateCustomFilename(): string {
    const caseType = this.findMetadataByPartialName("type");
    const caseNumber = this.findMetadataByPartialName("number");
    const caseYear = this.findMetadataByPartialName("year");

    const parts = [caseType, caseNumber, caseYear]
      .map((p) => p?.replace(/[^a-zA-Z0-9]/g, ""))
      .filter(Boolean);

    return parts.length > 0 ? parts.join("_") + ".pdf" : "document.pdf";
  }

  private findMetadataByPartialName(partialName: string): string {
    const lowerPartialName = partialName.toLowerCase();
    const entry = this.metadata.find((item) =>
      item.name.toLowerCase().includes(lowerPartialName)
    );
    return entry?.value?.trim() || "";
  }

  toggleFullScreen() {
    document.documentElement.requestFullscreen();
  }

  toggleMetadataPanel() {
    this.isMetadataMinimized = !this.isMetadataMinimized;
    setTimeout(() => this.reRenderAllPages(), 100);
  }

  toggleCommentPanel() {
    this.isCommentMinimized = !this.isCommentMinimized;
    setTimeout(() => this.reRenderAllPages(), 100);
  }

  maximizePdfView() {
    this.isMetadataMinimized = true;
    this.isCommentMinimized = true;
    setTimeout(() => this.reRenderAllPages(), 100);
  }

  restorePanels() {
    this.isMetadataMinimized = false;
    this.isCommentMinimized = false;
    setTimeout(() => this.reRenderAllPages(), 100);
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.scrollToPage(this.currentPage - 1);
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.scrollToPage(this.currentPage + 1);
    }
  }

  private scrollToPage(pageNum: number) {
    this.isScrollUpdating = true;
    const pageElement = this.pdfContainer.nativeElement.querySelector(`#page-${pageNum}`);
    if (pageElement) {
      pageElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      this.currentPage = pageNum;
      this.cdr.detectChanges();
    }
    setTimeout(() => {
      this.isScrollUpdating = false;
    }, 500);
  }

  zoomIn() {
    this.zoomLevel += 0.2;
    this.reRenderAllPages();
  }

  zoomOut() {
    if (this.zoomLevel > 0.4) {
      this.zoomLevel -= 0.2;
      this.reRenderAllPages();
    }
  }

  private reRenderAllPages() {
    this.renderTasks.forEach((task) => {
      try {
        task.cancel();
      } catch (e) { }
    });
    this.renderTasks.clear();
    this.renderedPages.clear();

    this.renderAllPages();
  }

  toggleSearch() {
    this.isSearchVisible = !this.isSearchVisible;
  }

  async searchPdf() {
    if (!this.searchText.trim() || !this.pdfDocument) return;

    this.searchResults = [];
    this.currentSearchIndex = 0;

    try {
      for (let pageNum = 1; pageNum <= this.totalPages; pageNum++) {
        const page = await this.pdfDocument.getPage(pageNum);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map((item: any) => item.str).join(' ');

        const searchLower = this.searchText.toLowerCase();
        const textLower = pageText.toLowerCase();

        let index = textLower.indexOf(searchLower);
        while (index !== -1) {
          this.searchResults.push({
            pageNum: pageNum,
            index: index
          });
          index = textLower.indexOf(searchLower, index + 1);
        }
      }

      if (this.searchResults.length > 0) {
        this.currentSearchIndex = 0;
        this.scrollToPage(this.searchResults[0].pageNum);
      } else {
        alert('No results found');
      }

      this.cdr.detectChanges();
    } catch (error) {
      console.error('Search error:', error);
    }
  }

  clearSearch() {
    this.searchText = "";
    this.searchResults = [];
    this.currentSearchIndex = 0;
    this.isSearchVisible = false;
  }

  prevSearchResult() {
    if (this.currentSearchIndex > 0) {
      this.currentSearchIndex--;
      const result = this.searchResults[this.currentSearchIndex];
      this.scrollToPage(result.pageNum);
    }
  }

  nextSearchResult() {
    if (this.currentSearchIndex < this.searchResults.length - 1) {
      this.currentSearchIndex++;
      const result = this.searchResults[this.currentSearchIndex];
      this.scrollToPage(result.pageNum);
    }
  }

  // ❌ PRINT FUNCTION REMOVED - Users must download and print from PDF reader
  printFile() {
    alert(
      "🚫 PRINTING DISABLED IN VIEWER\n\n" +
      "For security reasons, printing is disabled in the web viewer.\n\n" +
      "To print this document:\n" +
      "1. Click the Download button to get the encrypted PDF\n" +
      "2. Open the downloaded file in Adobe Acrobat or another PDF reader\n" +
      "3. Enter the password when prompted\n" +
      "4. Use File > Print in your PDF reader\n\n" +
      "This ensures secure, password-protected access to the document."
    );
  }

  imageZoomIn() { this.imageZoomLevel += 0.2; }
  imageZoomOut() { if (this.imageZoomLevel > 0.5) this.imageZoomLevel -= 0.2; }
  toggleImageFullScreen() { }
  openImageInNewTab() { if (this.fileUrl) window.open(this.fileUrl, ''); }
  downloadImage() {
    if (this.fileUrl && this.canDownloadFile) {
      const link = document.createElement('a');
      link.href = this.fileUrl;
      link.download = this.currentFileName;
      link.click();
    }
  }

  openVideoInNewTab() { if (this.fileUrl) window.open(this.fileUrl, '_blank'); }
  downloadVideo() {
    if (this.fileUrl && this.canDownloadFile) {
      const link = document.createElement('a');
      link.href = this.fileUrl;
      link.download = this.currentFileName;
      link.click();
    }
  }
  onVideoError(event?: any) { this.videoError = true; }

  openAudioInNewTab() { if (this.fileUrl) window.open(this.fileUrl, '_blank'); }
  downloadAudio() {
    if (this.fileUrl && this.canDownloadFile) {
      const link = document.createElement('a');
      link.href = this.fileUrl;
      link.download = this.currentFileName;
      link.click();
    }
  }

  addComment(): void {
    const comment = this.newCommentText.trim();
    if (!comment || this.isAddingComment) return;

    this.isAddingComment = true;

    const newComment: BitstreamComment = {
      bitstreamId: this.currentBitstreamId,
      comment: comment,
    };

    this.bitstreamCommentService.addComment(newComment).subscribe({
      next: (res) => {
        this.comments.push(res);
        this.newCommentText = "";
        this.isAddingComment = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error("Failed to add comment", err);
        this.isAddingComment = false;
        this.cdr.detectChanges();
      },
    });
  }

  confirmDelete(commentId: number): void {
    this.commentToDelete = commentId;
    this.showDeleteConfirmation = true;
  }

  cancelDelete(): void {
    this.showDeleteConfirmation = false;
    this.commentToDelete = null;
  }

  confirmDeleteComment(): void {
    if (this.commentToDelete === null) return;

    this.deletingCommentId = this.commentToDelete;
    this.showDeleteConfirmation = false;

    this.bitstreamCommentService.deleteComment(this.commentToDelete).subscribe({
      next: () => {
        this.comments = this.comments.filter((c) => c.id !== this.commentToDelete);
        this.deletingCommentId = null;
        this.commentToDelete = null;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error("Delete failed", err);
        this.deletingCommentId = null;
        this.commentToDelete = null;
        this.cdr.detectChanges();
      },
    });
  }

  checkFilePermissions(bitstreamId: string): void {
    this.checkingPermissions = true;

    this.bitstreamPermissionsService.getBitstreamPermissions(bitstreamId).subscribe({
      next: (permData) => {
        this.isAdmin = permData?.isAdmin === true;

        if (this.isAdmin) {
          // ✅ Full access for admins (but still no web print)
          this.canDownloadFile = true;
          this.canPrintFile = false; // ❌ Even admins must download to print
          this.hasTimeAccess = true;
          // Don't add can-print class since printing is disabled

          this.checkingPermissions = false;
          this.cdr.detectChanges();
          return;
        }

        // For non-admins, check download permission only
        this.bitstreamPermissionsService.canDownload(bitstreamId).subscribe({
          next: (canDownload) => {
            this.canDownloadFile = canDownload;
          },
          error: (err) => {
            console.error("Error checking download permission:", err);
            this.canDownloadFile = false;
          },
        });

        // Print permission check - but always set to false
        this.canPrintFile = false;
        document.body.classList.remove("can-print");

        this.checkingPermissions = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error("Error fetching bitstream permissions:", err);
        this.checkingPermissions = false;
        this.cdr.detectChanges();
      },
    });
  }

  goBack() { this.location.back(); }

  ngOnDestroy(): void {
    this.renderTasks.forEach((task) => {
      try {
        task.cancel();
      } catch (e) { }
    });
    this.renderTasks.clear();

    if (this.pdfDocument) {
      this.pdfDocument.destroy();
    }

    if (this.fileUrl?.startsWith("blob:")) {
      this.pdfService.revokeBlobUrl(this.fileUrl);
    }

    this.lastUsedPin = "";
    this.viewDscPin = "";
    this.viewPdfPassword = "";
    this.isDscAvailable = false;
  }
}