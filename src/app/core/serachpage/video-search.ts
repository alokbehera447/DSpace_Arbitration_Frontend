// COPY THIS ENTIRE FILE TO: src/app/core/serachpage/video-search.ts
// (or wherever your VideoSearchService is located)

import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CURRENT_API_URL } from './api-urls';


@Injectable({
  providedIn: 'root'
})
export class VideoSearchService {

  private apiUrl = `${CURRENT_API_URL}/server/api`;

  constructor(private http: HttpClient) { }

  /**
   * Search for videos by transcript content using filter approach
   * This matches the pattern used for judge name search in DSpace
   * Pattern: dc.contributor.author → f.author
   * Pattern: dc.description.transcript → f.transcript
   */
  searchVideos(query: string, size: number = 10, page: number = 0): Observable<any> {

    let params = new HttpParams()
      .set('query', query)   // FULL TEXT SEARCH
      .set('sort', 'dc.title,ASC')
      .set('size', size.toString())
      .set('page', page.toString())
      .set('embed', 'searchResult.objects.indexableObject.bitstreams');

    console.log('🔍 Search API URL:', `${this.apiUrl}/discover/search/objects`);
    console.log('📋 Search params:', params.toString());

    return this.http.get(`${this.apiUrl}/discover/search/objects`, { params });
  }

  /**
   * Get item details by UUID
   */
  getItemByUuid(uuid: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/core/items/${uuid}`);
  }

  /**
   * Get bitstreams for an item
   */
  getItemBitstreams(uuid: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/core/items/${uuid}/bitstreams`);
  }
  getItemBundles(itemUuid: string) {
    return this.http.get(
      `${this.apiUrl}/core/items/${itemUuid}/bundles`
    );
  }

  getBundleBitstreams(bundleUuid: string) {
    return this.http.get(
      `${this.apiUrl}/core/bundles/${bundleUuid}/bitstreams`
    );
  }
}