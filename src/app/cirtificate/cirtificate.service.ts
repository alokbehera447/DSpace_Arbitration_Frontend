import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CURRENT_API_URL } from 'DSpace-IndianJudiciary-FrontEnd/src/app/core/serachpage/api-urls';
export interface CertificateInfo {
  id: number;
  subjectDn: string;
  issuerDn: string;
  serialNumber: string;
  validFrom: string;
  validTo: string;
  keyUsage: string;
  createdAt: string;
  isActive: boolean;
}

export interface CertificateStatus {
  hasValidCertificate: boolean;
  userId: string;
}

export interface CertificateResponse {
  hasCertificate: boolean;
  certificate?: CertificateInfo;
}

@Injectable({
  providedIn: 'root'
})
export class CertificateService {
  private apiUrl = `${CURRENT_API_URL}/api/signature/certificates`;

  constructor(private http: HttpClient) {}

  /**
   * Upload a digital certificate
   */
  uploadCertificate(certificateFile: File, password: string): Observable<any> {
    const formData = new FormData();
    formData.append('certificate', certificateFile);
    formData.append('password', password);

    return this.http.post(`${this.apiUrl}/upload`, formData);
  }

  /**
   * Get current user's certificate
   */
  getCurrentCertificate(): Observable<CertificateResponse> {
    return this.http.get<CertificateResponse>(`${this.apiUrl}/current`);
  }

  /**
   * Check certificate status
   */
  getCertificateStatus(): Observable<CertificateStatus> {
    return this.http.get<CertificateStatus>(`${this.apiUrl}/status`);
  }

  /**
   * Revoke certificate
   */
  revokeCertificate(reason: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/revoke`, {
      params: { reason }
    });
  }
}
