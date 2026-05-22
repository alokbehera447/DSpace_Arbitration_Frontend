// import { Injectable } from '@angular/core';
// import { HttpClient, HttpParams } from '@angular/common/http';
// import { Observable } from 'rxjs';
// import { CURRENT_API_URL } from './api-urls';

// @Injectable({
//   providedIn: 'root'
// })
// export class JudegNameService {
//   private baseUrl = `${CURRENT_API_URL}/server/api/discover/search/objects`;

//   constructor(private http: HttpClient) { }

//   getSearchResults(
//     judgeName?: string,
//     sortBy: string = 'dc.title',
//     sortOrder: string = 'ASC',
//     resultsPerPage: number = 10
//   ): Observable<any> {

//     let params = new HttpParams()
//       .set('sort', `${sortBy},${sortOrder}`)
//       .set('size', resultsPerPage.toString());

//     if (judgeName) {
//       params = params.set('f.author', `${judgeName},equals`);
//     }

//     return this.http.get<any>(this.baseUrl, { params });
//   }
// }


import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CURRENT_API_URL } from './api-urls';

@Injectable({
  providedIn: 'root'
})

export class JudegNameService {

  private baseUrl =
    `${CURRENT_API_URL}/server/api/discover/search/objects`;

  constructor(
    private http: HttpClient
  ) { }

  getSearchResults(

    judgeName?: string,

    sortBy: string = 'dc.title',

    sortOrder: string = 'ASC',

    resultsPerPage: number = 10,

    page: number = 0

  ): Observable<any> {

    let params = new HttpParams()

      .set('sort', `${sortBy},${sortOrder}`)

      .set('size', resultsPerPage.toString())

      .set('page', page.toString());

    // FILTER
    if (judgeName) {

      params = params.set(
        'f.author',
        `${judgeName},equals`
      );

    }

    return this.http.get<any>(
      this.baseUrl,
      { params }
    );

  }

}