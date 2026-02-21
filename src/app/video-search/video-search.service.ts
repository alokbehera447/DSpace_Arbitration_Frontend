// import { Injectable } from '@angular/core';
// import { HttpClient, HttpParams } from '@angular/common/http';
// import { Observable } from 'rxjs';
// import { map } from 'rxjs/operators';

// @Injectable({
//   providedIn: 'root'
// })
// export class VideoSearchService {
  
//   private apiUrl = '/server/api'; // Adjust based on your DSpace configuration
  
//   constructor(private http: HttpClient) {}

//   /**
//    * Search for videos by transcript content using filter approach
//    * This matches the pattern used for judge name search in DSpace
//    * @param query - Search term to find in transcripts
//    * @param size - Number of results per page
//    * @param page - Page offset
//    * @returns Observable of search results
//    */
//   searchVideos(query: string, size: number = 10, page: number = 0): Observable<any> {

//     let params = new HttpParams()
//       .set('size', size.toString())
//       .set('page', page.toString())
//       .set('configuration', 'default')
//       .set('sort', 'dc.title,ASC');  // Optional: add sorting

//     // Use filter for transcript search (same pattern as f.author)
//     // Format: f.fieldname=value,operator
//     params = params.set('f.transcript', `${query},contains`);
    
//     // Optional: Add item type filter if needed
//     // params = params.append('f.dc.type', 'video,equals');
    
//     return this.http.get(`${this.apiUrl}/discover/search/objects`, { params });
//   }

//   /**
//    * ALTERNATIVE: Use 'equals' operator for exact match (like judge name)
//    */
//   searchTranscriptExact(query: string, size: number = 10, page: number = 0): Observable<any> {
//     let params = new HttpParams()
//       .set('size', size.toString())
//       .set('page', page.toString())
//       .set('configuration', 'default')
//       .set('sort', 'dc.title,ASC')
//       .set('f.transcript', `${query},equals`);  // Exact match
    
//     return this.http.get(`${this.apiUrl}/discover/search/objects`, { params });
//   }

//   /**
//    * Advanced search with multiple criteria
//    */
//   advancedSearchVideos(options: {
//     transcriptQuery?: string;
//     titleQuery?: string;
//     authorQuery?: string;
//     dateFrom?: string;
//     dateTo?: string;
//     size?: number;
//     page?: number;
//   }): Observable<any> {
//     let params = new HttpParams()
//       .set('configuration', 'default')
//       .set('dsoType', 'item')
//       .set('size', (options.size || 10).toString())
//       .set('page', (options.page || 0).toString());

//     // Add transcript search
//     if (options.transcriptQuery) {
//       params = params.append('f.dc.description.transcript', `${options.transcriptQuery},query`);
//     }

//     // Add title search
//     if (options.titleQuery) {
//       params = params.append('f.dc.title', `${options.titleQuery},query`);
//     }

//     // Add author search
//     if (options.authorQuery) {
//       params = params.append('f.dc.contributor.author', `${options.authorQuery},query`);
//     }

//     // Add date range
//     if (options.dateFrom || options.dateTo) {
//       const dateFilter = [
//         options.dateFrom || '*',
//         options.dateTo || '*'
//       ].join(',');
//       params = params.append('f.dc.date.issued', dateFilter);
//     }

//     return this.http.get(`${this.apiUrl}/discover/search/objects`, { params });
//   }

//   /**
//    * Get item details by UUID
//    */
//   getItemByUuid(uuid: string): Observable<any> {
//     return this.http.get(`${this.apiUrl}/core/items/${uuid}`);
//   }

//   /**
//    * Get bitstreams for an item
//    */
//   getItemBitstreams(uuid: string): Observable<any> {
//     return this.http.get(`${this.apiUrl}/core/items/${uuid}/bitstreams`);
//   }

//   /**
//    * Search with filters (for faceted search)
//    */
//   searchWithFilters(query: string, filters: { [key: string]: string[] }, size: number = 10, page: number = 0): Observable<any> {
//     let params = new HttpParams()
//       .set('query', query)
//       .set('size', size.toString())
//       .set('page', page.toString())
//       .set('configuration', 'default')
//       .set('dsoType', 'item');

//     // Add filters
//     Object.keys(filters).forEach(filterKey => {
//       filters[filterKey].forEach(value => {
//         params = params.append(`f.${filterKey}`, `${value},equals`);
//       });
//     });

//     return this.http.get(`${this.apiUrl}/discover/search/objects`, { params });
//   }

//   /**
//    * Get search facets
//    */
//   getSearchFacets(query: string): Observable<any> {
//     const params = new HttpParams()
//       .set('query', query)
//       .set('configuration', 'default');

//     return this.http.get(`${this.apiUrl}/discover/facets`, { params });
//   }
// }