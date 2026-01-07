import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CURRENT_API_URL } from '../serachpage/api-urls';

@Injectable({
  providedIn: 'root'
})
export class VideoSearchService {
  private baseUrl = `${CURRENT_API_URL}/server/api/discover/search/objects`;

  constructor(private http: HttpClient) {}

  searchVideos(
    transcriptQuery: string,
    resultsPerPage: number = 10
  ): Observable<any> {

    let params = new HttpParams()
      .set('query', '*') 
      .set('size', resultsPerPage.toString())
      .set('sort', 'dc.title,ASC');

    if (transcriptQuery) {
      params = params.append('f.dc.transcript', `${transcriptQuery},contains`);
    }

    // Optional: return only items that have video link metadata
    // (modify based on your DSpace metadata field names)
    params = params.append('f.dc.type', 'video,equals');

    return this.http.get<any>(this.baseUrl, { params });
  }
}
