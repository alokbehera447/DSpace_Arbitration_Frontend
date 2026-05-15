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

  private caseListSubject =
    new BehaviorSubject<any[]>([]);

  caseList$ =
    this.caseListSubject.asObservable();

  caseNumber: string = '';

  caseType: string = '';

  caseYear: string = '';

  sortBy: string = 'dc.title';

  sortOrder: string = 'ASC';

  resultsPerPage: number = 5;

  caseTypeOptions: string[] = [];

  // PAGINATION

  currentPage: number = 0;

  totalPages: number = 0;

  totalElements: number = 0;

  loading: boolean = false;

  constructor(

    private searchPageService:
      SearchPageService,

    private facetsService:
      FacetsService

  ) { }

  ngOnInit() {

    this.fetchCases();

    this.loadCaseTypeOptions();

  }

  // =========================================
  // FETCH CASES
  // =========================================

  fetchCases() {

    this.loading = true;

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
          '🔹 API Response:',
          response
        );

        // PAGINATION DATA

        this.totalPages =
          response?.page?.totalPages || 0;

        this.totalElements =
          response?.page?.totalElements || 0;

        this.loadCases(response);

        this.loading = false;

      },

      (error) => {

        console.error(
          '❌ Error fetching cases:',
          error
        );

        this.loading = false;

      }

    );

  }

  // =========================================
  // LOAD CASES
  // =========================================

  loadCases(response: any) {

    const objects =
      response?._embedded?.searchResult?._embedded?.objects || [];

    const caseList = objects

      .map(obj => {

        const indexableObject =
          obj?._embedded?.indexableObject;

        return {

          uuid:
            indexableObject?.uuid,

          metadata:
            indexableObject?.metadata

        };

      })

      .filter(item =>

        item.uuid &&

        item.metadata?.['dc.casetype']?.[0]?.value

      );

    console.log(
      '✅ Processed Case List:',
      caseList
    );

    this.caseListSubject.next(caseList);

  }

  // =========================================
  // LOAD CASE TYPES
  // =========================================

  loadCaseTypeOptions() {

    this.facetsService.getCaseTypeFacets()

      .subscribe(

        (response) => {

          this.caseTypeOptions =

            response?._embedded?.values?.map(

              val => val.label

            ) || [];

          console.log(

            '📌 Loaded Case Type Options:',

            this.caseTypeOptions

          );

        },

        (error) => {

          console.error(

            '❌ Failed to load case type facets:',

            error

          );

        }

      );

  }

  // =========================================
  // SEARCH
  // =========================================

  searchCases() {

    this.currentPage = 0;

    this.fetchCases();

  }

  // =========================================
  // RESET
  // =========================================

  resetForm() {

    this.caseNumber = '';

    this.caseType = '';

    this.caseYear = '';

    this.sortBy = 'dc.title';

    this.sortOrder = 'ASC';

    this.resultsPerPage = 5;

    this.currentPage = 0;

    this.fetchCases();

  }

  // =========================================
  // NEXT PAGE
  // =========================================

  nextPage() {

    if (
      this.currentPage + 1
      < this.totalPages
    ) {

      this.currentPage++;

      this.fetchCases();

    }

  }

  // =========================================
  // PREVIOUS PAGE
  // =========================================

  previousPage() {

    if (this.currentPage > 0) {

      this.currentPage--;

      this.fetchCases();

    }

  }

  // =========================================
  // RESULTS PER PAGE
  // =========================================

  onResultsPerPageChange() {

    this.currentPage = 0;

    this.fetchCases();

  }

}