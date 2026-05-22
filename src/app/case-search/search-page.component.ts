



import { Component, OnInit } from '@angular/core';

import { BehaviorSubject } from 'rxjs';

import { SearchPageService } from '../core/serachpage/search-page.service';

import { FacetsService } from '../core/serachpage/casetype.service';

@Component({
  selector: 'app-search-page',

  templateUrl: './search-page.component.html',

  styleUrls: ['./search-page.component.scss']
})

export class SearchPageComponent implements OnInit {

  // =========================================
  // OBSERVABLE DATA
  // =========================================

  private caseListSubject =
    new BehaviorSubject<any[]>([]);

  caseList$ =
    this.caseListSubject.asObservable();

  // =========================================
  // SEARCH FILTERS
  // =========================================

  caseNumber: string = '';

  caseType: string = '';

  caseYear: string = '';

  // =========================================
  // SORTING
  // =========================================

  sortBy: string = 'dc.title';

  sortOrder: string = 'ASC';

  // =========================================
  // RESULTS
  // =========================================

  resultsPerPage: number = 10;

  caseTypeOptions: string[] = [];

  // =========================================
  // PAGINATION
  // =========================================

  currentPage: number = 0;

  totalPages: number = 0;

  totalElements: number = 0;

  // =========================================
  // LOADING
  // =========================================

  loading: boolean = false;

  // =========================================
  // CONSTRUCTOR
  // =========================================

  constructor(

    private searchPageService:
      SearchPageService,

    private facetsService:
      FacetsService

  ) { }

  // =========================================
  // INIT
  // =========================================

  ngOnInit(): void {

    this.fetchCases();

    this.loadCaseTypeOptions();

  }

  // =========================================
  // FETCH CASES
  // =========================================

  fetchCases(): void {

    this.loading = true;

    console.log(
      '🔍 Fetching Cases With Params:',
      {
        caseNumber: this.caseNumber,
        caseType: this.caseType,
        caseYear: this.caseYear,
        sortBy: this.sortBy,
        sortOrder: this.sortOrder,
        resultsPerPage: this.resultsPerPage,
        currentPage: this.currentPage
      }
    );

    this.searchPageService.getSearchResults(

      this.caseNumber,

      this.caseType,

      this.caseYear,

      this.sortBy,

      this.sortOrder,

      this.resultsPerPage,

      this.currentPage

    ).subscribe(

      (response) => {

        console.log(
          '✅ API Response:',
          response
        );

        // =====================================
        // PAGINATION DATA
        // =====================================

        // this.totalPages =
        //   response?.page?.totalPages || 0;

        // this.totalElements =
        //   response?.page?.totalElements || 0;


        this.totalPages =
          response?._embedded?.searchResult?.page?.totalPages || 0;

        this.totalElements =
          response?._embedded?.searchResult?.page?.totalElements || 0;

        console.log(
          '📄 Total Pages:',
          this.totalPages
        );

        console.log(
          '📊 Total Elements:',
          this.totalElements
        );

        // =====================================
        // LOAD TABLE DATA
        // =====================================

        this.loadCases(response);

        this.loading = false;

      },

      (error) => {

        console.error(
          '❌ Error Fetching Cases:',
          error
        );

        this.caseListSubject.next([]);

        this.totalPages = 0;

        this.totalElements = 0;

        this.loading = false;

      }

    );

  }

  // =========================================
  // LOAD CASES
  // =========================================

  loadCases(response: any): void {

    const objects =

      response?._embedded
        ?.searchResult
        ?._embedded
        ?.objects || [];

    const caseList = objects

      .map((obj: any) => {

        const indexableObject =

          obj?._embedded
            ?.indexableObject;

        return {

          uuid:
            indexableObject?.uuid,

          metadata:
            indexableObject?.metadata

        };

      })

      .filter((item: any) =>

        item.uuid &&

        item.metadata?.['dc.casetype']
          ?.[0]?.value

      );

    console.log(
      '✅ Processed Case List:',
      caseList
    );

    this.caseListSubject.next(caseList);

  }

  // =========================================
  // LOAD CASE TYPE OPTIONS
  // =========================================

  loadCaseTypeOptions(): void {

    this.facetsService.getCaseTypeFacets()

      .subscribe(

        (response) => {

          this.caseTypeOptions =

            response?._embedded?.values?.map(

              (val: any) => val.label

            ) || [];

          console.log(
            '📌 Loaded Case Types:',
            this.caseTypeOptions
          );

        },

        (error) => {

          console.error(
            '❌ Failed Loading Case Types:',
            error
          );

        }

      );

  }

  // =========================================
  // SEARCH
  // =========================================

  searchCases(): void {

    this.currentPage = 0;

    this.fetchCases();

  }

  // =========================================
  // SORT CHANGE
  // =========================================

  onSortChange(): void {

    this.currentPage = 0;

    this.fetchCases();

  }

  // =========================================
  // RESET
  // =========================================

  resetForm(): void {

    this.caseNumber = '';

    this.caseType = '';

    this.caseYear = '';

    this.sortBy = 'dc.title';

    this.sortOrder = 'ASC';

    this.resultsPerPage = 10;

    this.currentPage = 0;

    this.fetchCases();

  }


  // =========================================  ← ADD FROM HERE
  // MIN HELPER
  // =========================================

  min(a: number, b: number): number {
    return Math.min(a, b);
  }

  // =========================================
  // GO TO PAGE  ← NEW
  // =========================================

  goToPage(page: number): void {

    if (page < 0 || page >= this.totalPages) {
      return;
    }

    this.currentPage = page;

    this.fetchCases();

  }

  // =========================================
  // VISIBLE PAGES GETTER  ← NEW
  // Returns an array like [1, 2, 3, '...', 125]
  // =========================================

  get visiblePages(): (number | string)[] {

    const total = this.totalPages;
    const current = this.currentPage + 1; // 1-based for display
    const pages: (number | string)[] = [];

    if (total <= 7) {
      // Show all pages if total is small
      for (let i = 1; i <= total; i++) {
        pages.push(i);
      }
      return pages;
    }

    // Always show first page
    pages.push(1);

    if (current > 4) {
      pages.push('...');
    }

    // Pages around current
    const rangeStart = Math.max(2, current - 1);
    const rangeEnd = Math.min(total - 1, current + 1);

    for (let i = rangeStart; i <= rangeEnd; i++) {
      pages.push(i);
    }

    if (current < total - 3) {
      pages.push('...');
    }

    // Always show last page
    pages.push(total);

    return pages;

  }

  // =========================================
  // NEXT PAGE
  // =========================================

  nextPage(): void {

    if (
      this.currentPage
      < this.totalPages - 1
    ) {

      this.currentPage++;

      this.fetchCases();

    }

  }

  // =========================================
  // PREVIOUS PAGE
  // =========================================

  previousPage(): void {

    if (this.currentPage > 0) {

      this.currentPage--;

      this.fetchCases();

    }

  }

  // =========================================
  // RESULTS PER PAGE
  // =========================================

  onResultsPerPageChange(): void {

    this.currentPage = 0;

    this.fetchCases();

  }

}