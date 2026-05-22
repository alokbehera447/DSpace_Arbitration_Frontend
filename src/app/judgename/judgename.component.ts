
import { Component, OnInit } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { JudegNameService } from '../core/serachpage/judgename.service';

@Component({
  selector: 'judge-name-page',
  templateUrl: './judgename.component.html',
  styleUrls: ['./judgename.component.scss']
})

export class JudgeNameComponent implements OnInit {

  // ─────────────────────────────────────
  // CASE LIST
  // ─────────────────────────────────────

  private caseListSubject =
    new BehaviorSubject<any[]>([]);

  caseList$ =
    this.caseListSubject.asObservable();

  // ─────────────────────────────────────
  // FILTERS
  // ─────────────────────────────────────

  judgeName: string = '';

  sortBy: string = 'dc.title';

  sortOrder: string = 'ASC';

  resultsPerPage: number = 10;

  // ─────────────────────────────────────
  // PAGINATION
  // ─────────────────────────────────────

  currentPage: number = 0;

  totalPages: number = 0;

  totalElements: number = 0;

  // ─────────────────────────────────────
  // CONSTRUCTOR
  // ─────────────────────────────────────

  constructor(
    private searchPageService: JudegNameService
  ) { }

  // ─────────────────────────────────────
  // INIT
  // ─────────────────────────────────────

  ngOnInit(): void {

    this.fetchCases(0);

  }

  // ─────────────────────────────────────
  // FETCH CASES
  // ─────────────────────────────────────

  fetchCases(page: number = 0): void {

    // current page
    this.currentPage = page;

    this.searchPageService.getSearchResults(

      this.judgeName,

      this.sortBy,

      this.sortOrder,

      this.resultsPerPage,

      page

    ).subscribe(

      (response: any) => {

        console.log(
          '🔹 FULL API RESPONSE:',
          response
        );

        // load table data
        this.loadCases(response);

        // pagination info
        const pageInfo =

          response?.page ||

          response?.searchResult?.page ||

          response?._embedded?.searchResult?.page ||

          response?._embedded?.page ||

          {};

        console.log(
          '📄 PAGE INFO:',
          pageInfo
        );

        // total pages
        this.totalPages =
          pageInfo?.totalPages || 0;

        // total records
        this.totalElements =
          pageInfo?.totalElements || 0;

        // current page
        this.currentPage =
          pageInfo?.number || page || 0;

        console.log(
          '✅ Total Pages:',
          this.totalPages
        );

        console.log(
          '✅ Total Elements:',
          this.totalElements
        );

        console.log(
          '✅ Current Page:',
          this.currentPage
        );

      },

      (error) => {

        console.error(
          '❌ Error fetching cases:',
          error
        );

        // reset on error
        this.caseListSubject.next([]);

        this.totalPages = 0;

        this.totalElements = 0;

      }

    );

  }

  // ─────────────────────────────────────
  // LOAD CASE DATA
  // ─────────────────────────────────────

  loadCases(response: any): void {

    const objects =

      response?._embedded?.searchResult?._embedded?.objects ||

      response?._embedded?.objects ||

      [];

    const caseList = objects

      .map((obj: any) => {

        const indexableObject =

          obj?._embedded?.indexableObject ||

          obj;

        return {

          uuid: indexableObject?.uuid,

          metadata: indexableObject?.metadata

        };

      })

      .filter((item: any) =>

        item.uuid &&

        item.metadata?.['dc.casetype']?.[0]?.value

      );

    console.log(
      '✅ Processed Case List:',
      caseList
    );

    this.caseListSubject.next(caseList);

  }

  // ─────────────────────────────────────
  // SEARCH
  // ─────────────────────────────────────

  searchCases(): void {

    this.currentPage = 0;

    this.fetchCases(0);

  }

  // ─────────────────────────────────────
  // RESET
  // ─────────────────────────────────────

  resetForm(): void {

    this.judgeName = '';

    this.sortBy = 'dc.title';

    this.sortOrder = 'ASC';

    this.resultsPerPage = 10;

    this.currentPage = 0;

    this.fetchCases(0);

  }

  // ─────────────────────────────────────
  // NEXT PAGE
  // ─────────────────────────────────────

  nextPage(): void {

    if (
      this.currentPage <
      this.totalPages - 1
    ) {

      this.fetchCases(
        this.currentPage + 1
      );

    }

  }

  // ─────────────────────────────────────
  // PREVIOUS PAGE
  // ─────────────────────────────────────

  prevPage(): void {

    if (this.currentPage > 0) {

      this.fetchCases(
        this.currentPage - 1
      );

    }

  }

  // ─────────────────────────────────────
  // GO TO PAGE
  // ─────────────────────────────────────

  goToPage(page: number): void {

    if (

      page >= 0 &&

      page < this.totalPages

    ) {

      this.fetchCases(page);

    }

  }

  // ─────────────────────────────────────
  // CHANGE PAGE SIZE
  // ─────────────────────────────────────

  changePageSize(): void {

    this.currentPage = 0;

    this.fetchCases(0);

  }

  // ─────────────────────────────────────
  // VISIBLE PAGES
  // ─────────────────────────────────────

  get visiblePages(): (number | string)[] {

    const pages: (number | string)[] = [];

    // SMALL PAGE COUNT
    if (this.totalPages <= 5) {

      for (
        let i = 1;
        i <= this.totalPages;
        i++
      ) {

        pages.push(i);

      }

    }

    // LARGE PAGE COUNT
    else {

      // START
      if (this.currentPage < 3) {

        pages.push(
          1,
          2,
          3,
          '...',
          this.totalPages
        );

      }

      // MIDDLE
      else if (

        this.currentPage >= 3 &&

        this.currentPage <
        this.totalPages - 3

      ) {

        pages.push(
          1,
          '...',
          this.currentPage,
          this.currentPage + 1,
          this.currentPage + 2,
          '...',
          this.totalPages
        );

      }

      // END
      else {

        pages.push(
          1,
          '...',
          this.totalPages - 2,
          this.totalPages - 1,
          this.totalPages
        );

      }

    }

    return pages;

  }

}

