import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { CURRENT_API_URL } from 'DSpace-IndianJudiciary-FrontEnd/src/app/core/serachpage/api-urls';
export interface AuditLog {
  id: number;
  userId: string;
  documentId: string;
  bitstreamId: string;
  actionType: 'VIEW' | 'DOWNLOAD';
  certificateId: number;
  certificateSerial: string;
  ipAddress: string;
  userAgent: string;
  signatureTimestamp: string;
  signatureAlgorithm: string;
  pdfHash: string;
  signedPdfHash: string;
  success: boolean;
  errorMessage?: string;
  processingTimeMs: number;
  sessionId: string;
}

export interface AuditLogResponse {
  logs: AuditLog[];
  totalPages: number;
  totalElements: number;
  currentPage: number;
}

@Injectable({
  providedIn: 'root'
})
export class AuditLogService {
  private apiUrl = `${CURRENT_API_URL}/api/signature/audit`;

  constructor(private http: HttpClient) {}

  /**
   * Get audit logs for current user
   */
  getMyAuditLogs(page: number = 0, size: number = 20): Observable<AuditLogResponse> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<AuditLogResponse>(`${this.apiUrl}/my-logs`, { params });
  }

  /**
   * Get audit logs for a document (admin only)
   */
  getDocumentAuditLogs(documentId: string, page: number = 0, size: number = 20): Observable<AuditLogResponse> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<AuditLogResponse>(`${this.apiUrl}/document/${documentId}`, { params });
  }
}