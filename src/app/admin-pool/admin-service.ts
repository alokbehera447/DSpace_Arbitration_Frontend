import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CURRENT_API_URL } from '../core/serachpage/api-urls';

@Injectable({
  providedIn: 'root',
})
export class AdminPoolService {
  constructor(private http: HttpClient) { }

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json'
    });
  }

  fetchBatches(status: string): Observable<any[]> {
    return this.http.get<any[]>(`${CURRENT_API_URL}/server/api/bulk-upload/status/${status}`);
  }

  getBatchFiles(batchId: string): Observable<any> {
    return this.http.get<any>(`${CURRENT_API_URL}/server/api/bulk-upload/${batchId}`);
  }

  /**
   * Approve entire batch - uses /review endpoint with APPROVE_ALL
   */
  approveAllBatch(uuid: string): Observable<any> {
    return this.http.post(
      `${CURRENT_API_URL}/server/api/bulk-upload/review/${uuid}`,
      {
        batchAction: 'APPROVE_ALL'
      },
      { headers: this.getHeaders() }
    );
  }

  /**
   * Reject entire batch - uses /review endpoint with REJECT_ALL
   */
  rejectAllBatch(uuid: string, rejectionReason: string): Observable<any> {
    return this.http.post(
      `${CURRENT_API_URL}/server/api/bulk-upload/review/${uuid}`,
      {
        batchAction: 'REJECT_ALL',
        items: [{
          itemId: '',
          action: 'REJECT',
          rejectionReason: rejectionReason
        }]
      },
      { headers: this.getHeaders() }
    );
  }

  /**
   * Review batch with partial approval/rejection
   */
  reviewBatch(uuid: string, reviewData: {
    batchAction: 'APPROVE_ALL' | 'REJECT_ALL' | 'PARTIAL',
    items?: Array<{
      itemId: string,
      action: 'APPROVE' | 'REJECT',
      rejectionReason?: string
    }>
  }): Observable<any> {
    return this.http.post(
      `${CURRENT_API_URL}/server/api/bulk-upload/review/${uuid}`,
      reviewData,
      { headers: this.getHeaders() }
    );
  }

  getPooledTasks(): Observable<any[]> {
    return this.http.get<any[]>(`${CURRENT_API_URL}/server/api/bulk-upload/pooled`);
  }

  getAcceptedSubmissions(): Observable<any[]> {
    return this.http.get<any[]>(`${CURRENT_API_URL}/server/api/bulk-upload/status/APPROVED`);
  }

  getRejectedSubmissions(): Observable<any[]> {
    return this.http.get<any[]>(`${CURRENT_API_URL}/server/api/bulk-upload/status/REJECTED`);
  }

  getPartiallyApprovedSubmissions(): Observable<any[]> {
    return this.http.get<any[]>(`${CURRENT_API_URL}/server/api/bulk-upload/status/PARTIALLY_APPROVED`);
  }
}