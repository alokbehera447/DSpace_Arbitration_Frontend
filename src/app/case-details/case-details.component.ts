

import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Bitstream } from '../core/shared/bitstream.model';
import { CaseDetailsService } from '../core/serachpage/case-details.service';
// import { BitstreamPermissionsService } from '../core/shared/bitstream-permissions.service';
import { forkJoin, of } from 'rxjs';
import { catchError, finalize, map, switchMap } from 'rxjs/operators';
import { BitstreamPermissionsService } from '../core/serachpage/bitstream-permissions.service';



@Component({
  selector: "app-case-details",
  templateUrl: "./case-details.component.html",
  styleUrls: ["./case-details.component.scss"],
})
export class CaseDetailsComponent implements OnInit {
  metadata: any = {}
  attachments: Bitstream[] = []
  filteredAttachments: Bitstream[] = []

  itemUuid = ""
  showMore = false
  currentPage = 1
  pageSize = 5
  loading = true
  loadError = false
  checkingPermissions = false
  // Fields to exclude from display
  excludedFields = [
    "dc.description.provenance",
    "dc.identifier.uri",
    "dc.date.accessioned",
    "dc.date.issued",
    "dc.title.alternative",
    "dc.type",
    "dc.language.iso"

  ];
  customMetadataLabels: { [key: string]: string } = {

    "dc.batch-number": "Batch Name",
    "dc.barcode": "Barcode No",
    "dc.section": "Section",

    "dc.title": "Case Number",
    "dc.casetype": "Case Type",
    "dc.caseyear": "Case Year",

    "dc.court.name": "Court Name",

    "dc.pname": "Petitioner Name",
    "dc.rname": "Respondent Name",

    "dc.paname": "Petitioner Advocate Name",
    "dc.raname": "Respondent Advocate Name",

    "dc.judge.name": "Judge Name",
    "dc.date.disposal": "Date of Disposal",

    "dc.district": "District",

    "dc.date.verification": "Date of Verification",

    "dc.verified-by": "Name of Verifier",

    "dc.act.rule": "Act Rule",

    "dc.comments": "Comments",

    "dc.remarks": "Remarks",

    "dc.pages": "Pages",

    "dc.case.status": "Case Status",

    "dc.date.decree": "Date of Decree",

    "dc.char-count": "Characters Count",

    "dc.image.path": "Image Path"
  };

  // Updated visibleKeys array with the two specified fields removed
  visibleKeys = [
    "dc.batch-number",
    "dc.barcode",
    "dc.section",
    "dc.title",
    "dc.casetype",
    "dc.caseyear",
    "dc.court.name",
    "dc.pname",
    "dc.rname",
    "dc.paname",
    "dc.raname",
    "dc.judge.name",
    "dc.date.disposal",
    "dc.district",
    "dc.date.verification",
    "dc.verified-by",
    "dc.act.rule",
    "dc.comments",
    "dc.remarks",
    "dc.pages",
    "dc.case.status",
    "dc.date.decree",
    "dc.char-count",
    "dc.image.path"
  ];
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private caseDetailsService: CaseDetailsService,
    private bitstreamPermissionsService: BitstreamPermissionsService,
    private cdr: ChangeDetectorRef,
  ) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const uuid = params.get("id")
      if (uuid) {
        this.itemUuid = uuid
        this.fetchData(uuid)
      } else {
        this.loading = false
        this.loadError = true
        console.error("❌ UUID missing in route")
        this.cdr.detectChanges()
      }
    })
  }

  get metadataOnly() {
    return this.metadata?.metadata ?? {}
  }

  fetchData(uuid: string): void {
    this.loading = true
    this.loadError = false
    this.cdr.detectChanges()

    this.caseDetailsService.getCaseDataWithAttachments(uuid).subscribe({
      // next: (res) => {
      //   this.metadata = res.metadata
      //   this.attachments = res.attachments

      //   // After getting attachments, check permissions for each
      //   this.checkPermissionsForAttachments()
      // },



      next: (res) => {
        this.metadata = res.metadata
        this.attachments = res.attachments

        // Show metadata immediately
        this.filteredAttachments = [...this.attachments]
        this.loading = false
        this.cdr.detectChanges()

        // Check permissions in background
        this.checkPermissionsForAttachments()
      },
      error: (err) => {
        console.error("❌ Error fetching case details:", err)
        this.loading = false
        this.loadError = true
        this.cdr.detectChanges()
      },
    })
  }

  checkPermissionsForAttachments(): void {
    if (!this.attachments || this.attachments.length === 0) {
      this.filteredAttachments = []
      this.loading = false
      this.cdr.detectChanges()
      return
    }

    this.checkingPermissions = true

    // Create an array of observables for each bitstream permission check
    const permissionChecks = this.attachments.map((file) => {
      const bitstreamId = this.extractUuidFromBitstream(file)
      if (!bitstreamId) {
        return of({ file, hasPermission: false, isAdmin: false })
      }

      return this.bitstreamPermissionsService.getBitstreamPermissions(bitstreamId).pipe(
        map((permission) => {
          // User has permission if they are admin OR they have policies
          const hasPermission = permission.isAdmin === true || (permission.policies && permission.policies.length > 0)

          return { file, hasPermission, isAdmin: permission.isAdmin === true }
        }),
        catchError((error) => {
          console.error(`Error checking permissions for ${file.name}:`, error)
          return of({ file, hasPermission: false, isAdmin: false })
        }),
      )
    })

    // Execute all permission checks in parallel
    forkJoin(permissionChecks)
      .pipe(
        finalize(() => {
          // this.loading = false
          this.checkingPermissions = false
          this.cdr.detectChanges()
        }),
      )
      .subscribe({
        next: (results) => {
          // Filter attachments to only include those with permissions
          this.filteredAttachments = results.filter((result) => result.hasPermission).map((result) => result.file)



          console.log('ALL ATTACHMENTS', this.attachments)
          console.log('ATTACHMENT COUNT', this.attachments.length)

          console.log('FILTERED ATTACHMENTS', this.filteredAttachments)
          console.log('FILTERED COUNT', this.filteredAttachments.length)

          console.log(
            `Filtered ${this.attachments.length} files to ${this.filteredAttachments.length} with permissions`,
          )
          console.log("Permission results:", results)
          this.currentPage = 1 // Reset to first page after filtering
          this.cdr.detectChanges()
        },
        error: (err) => {
          console.error("❌ Error checking file permissions:", err)
          this.filteredAttachments = [] // On error, show no files
          this.cdr.detectChanges()
        },
      })
  }

  reloadData(): void {
    if (this.itemUuid) {
      this.fetchData(this.itemUuid)
    }
  }

  getMetadataValue(field: string): string {
    return this.metadata?.metadata?.[field]?.[0]?.value ?? "-"
  }

  get extraMetadata(): { key: string, label: string, value: string }[] {
    return Object.keys(this.metadata?.metadata || {})
      .filter(key => !this.visibleKeys.includes(key) && !this.excludedFields.includes(key))
      .map(key => ({
        key,
        label: this.customMetadataLabels[key] || key,
        value: this.getMetadataValue(key)
      }));
  }

  navigateToEdit(): void {
    if (this.itemUuid) {
      this.router.navigate(["edit/metadata"], { relativeTo: this.route })
    }
  }

  paginatedAttachments(): Bitstream[] {
    const start = (this.currentPage - 1) * this.pageSize
    return this.filteredAttachments.slice(start, start + this.pageSize)
  }

  get totalPages(): number {
    return Math.ceil(this.filteredAttachments.length / this.pageSize)
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) this.currentPage++
  }

  prevPage(): void {
    if (this.currentPage > 1) this.currentPage--
  }

  extractUuidFromBitstream(file: any): string {
    const href = file._links?.content?.href || ""
    const parts = href.split("/")
    return parts.length > 2 ? parts[parts.length - 2] : ""
  }

  viewFile(file: Bitstream): void {
    const bitstreamUuid = this.extractUuidFromBitstream(file)
    if (bitstreamUuid && this.itemUuid) {
      this.router.navigate([`/viewer/i/${this.itemUuid}/f/${bitstreamUuid}`])
    }
  }
}