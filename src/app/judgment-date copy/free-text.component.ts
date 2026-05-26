import { Component, OnInit } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { FreeTextService } from '../core/serachpage/free-text.service';

@Component({
  selector: 'app-search-page',
  templateUrl: './free-text.component.html',
  styleUrls: ['./free-text.component.scss']
})
export class FreeTextComponent implements OnInit {

  private caseListSubject = new BehaviorSubject<any[]>([]);
  caseList$ = this.caseListSubject.asObservable();

  freeTextQuery: string = '';

  sortBy: string = 'dc.title';
  sortOrder: string = 'ASC';

  resultsPerPage: number = 10;

  startDate: string = '';
  endDate: string = '';

  page = 0;

  constructor(
    private searchPageService: FreeTextService
  ) {}

  ngOnInit(): void {
    this.freeTextQuery = '';
    this.fetchCases();
  }

  /* SEARCH */
  onSearchClick(): void {
    this.page = 0;
    this.storeSearchTerm();
    this.fetchCases();
  }

  /* SORT FIELD */
  onSortChange(field: string): void {
    this.sortBy = field;
    this.page = 0;
    this.fetchCases();
  }

  /* SORT ORDER */
  onSortOrderChange(order: string): void {
    this.sortOrder = order;
    this.page = 0;
    this.fetchCases();
  }

  /* RESULTS COUNT */
  onResultsPerPageChange(count: number): void {
    this.resultsPerPage = +count;
    this.page = 0;
    this.fetchCases();
  }

  /* API CALL */
  fetchCases(): void {

    this.searchPageService.getDateSearchResults(
      this.freeTextQuery,
      this.startDate,
      this.endDate,
      this.sortBy,
      this.sortOrder,
      this.resultsPerPage
    ).subscribe({

      next: (response) => {
        this.loadCases(response);
      },

      error: (error) => {
        console.error('❌ Error fetching cases:', error);
      }

    });
  }

  /* STORE SEARCH TERM */
  storeSearchTerm(): void {

    if (
      this.freeTextQuery &&
      this.freeTextQuery.trim() !== '' &&
      this.freeTextQuery !== '*'
    ) {

      localStorage.setItem(
        'pdfSearchTerm',
        this.freeTextQuery
      );

    } else {

      localStorage.removeItem('pdfSearchTerm');
    }
  }

  /* LOAD CASES */
  loadCases(response: any): void {

    const objects =
      response?._embedded?.searchResult?._embedded?.objects || [];

    const caseList = objects
      .map((obj: any) => {

        const indexableObject =
          obj?._embedded?.indexableObject;

        return {
          uuid: indexableObject?.uuid,
          metadata: indexableObject?.metadata
        };
      })

      .filter((item: any) =>
        item.uuid &&
        item.metadata?.['dc.casetype']?.[0]?.value
      );

    console.log('✅ Processed Case List:', caseList);

    this.caseListSubject.next(caseList);
  }

}