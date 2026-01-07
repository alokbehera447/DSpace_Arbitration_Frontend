// signed-pdf.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
// import { environment } from '../environments/environment';
import { CURRENT_API_URL } from 'DSpace-IndianJudiciary-FrontEnd/src/app/core/serachpage/api-urls';
export interface SignabilityCheck {
  signable: boolean;
  hasValidCertificate: boolean;
  isPdf: boolean;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class SignedPdfService {
  private apiUrl = `${CURRENT_API_URL}/api/signature/pdf`;

  constructor(private http: HttpClient) {}

  /**
   * Check if a bitstream can be signed
   */
  checkSignability(bitstreamId: string): Observable<SignabilityCheck> {
    return this.http.get<SignabilityCheck>(`${this.apiUrl}/check/${bitstreamId}`);
  }

  /**
   * View signed PDF (returns blob)
   */
  viewSignedPdf(bitstreamId: string, password: string): Observable<Blob> {
    const params = new HttpParams().set('password', password);
    
    return this.http.get(`${this.apiUrl}/view/${bitstreamId}`, {
      params,
      responseType: 'blob'
    });
  }

  /**
   * Download signed PDF (returns blob)
   */
  downloadSignedPdf(bitstreamId: string, password: string): Observable<Blob> {
    const params = new HttpParams().set('password', password);
    
    return this.http.get(`${this.apiUrl}/download/${bitstreamId}`, {
      params,
      responseType: 'blob'
    });
  }

  /**
   * Helper to open PDF in new tab
   */
  openPdfInNewTab(pdfBlob: Blob): void {
    const url = window.URL.createObjectURL(pdfBlob);
    window.open(url, '_blank');
    
    // Clean up after opening
    setTimeout(() => window.URL.revokeObjectURL(url), 100);
  }

  /**
   * Helper to download PDF
   */
  downloadPdfFile(pdfBlob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(pdfBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up
    setTimeout(() => window.URL.revokeObjectURL(url), 100);
  }
}