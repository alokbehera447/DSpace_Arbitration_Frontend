import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError, timeout as rxTimeout } from 'rxjs';
import { catchError, retry, switchMap } from 'rxjs/operators';
import { CURRENT_API_URL } from './api-urls';

@Injectable({
  providedIn: 'root'
})
export class PdfService {
  private readonly SIGNER_BASE_URL = "http://192.168.0.125:9001/signer";
  private readonly SIGNER_TIMEOUT = 5000;

  constructor(private http: HttpClient) { }

  fetchRestrictedPdf(bitstreamUuid: string): Observable<Blob> {
    const url = `${CURRENT_API_URL}/server/api/custom/bitstreams/${bitstreamUuid}/filtered-content`;

    return this.http.get(url, {
      responseType: 'blob',
      withCredentials: true
    }).pipe(
      retry(2),
      catchError(error => {
        console.error('Error fetching PDF:', error);
        return throwError(() => new Error('Failed to fetch PDF.'));
      })
    );
  }

  fetchBitstream(bitstreamUuid: string): Observable<Blob> {
    const url = `${CURRENT_API_URL}/server/api/core/bitstreams/${bitstreamUuid}/content`;

    return this.http.get(url, {
      responseType: 'blob',
      withCredentials: true
    }).pipe(
      retry(2),
      catchError(error => {
        console.error('Error fetching bitstream:', error);
        return throwError(() => new Error('Failed to fetch file.'));
      })
    );
  }

  encryptBitstream(bitstreamId: string, mode: 'view' | 'download' = 'view'): Observable<Blob> {
    const url = `${CURRENT_API_URL}/server/api/diracai/encrypt-bitstream?mode=${mode}`;

    return this.http.post(url, { bitstreamId }, {
      responseType: 'blob',
      withCredentials: true
    }).pipe(
      catchError(error => {
        console.error('Encryption API error:', error);
        return throwError(() => new Error('Failed to encrypt file.'));
      })
    );
  }


  /**
   * ✅ Check signer status with automatic timeout
   * @returns Observable with tokenPresent flag
   */
  checkSignerStatus(): Observable<{ tokenPresent: boolean }> {
    const url = `${this.SIGNER_BASE_URL}/token/status`;

    return this.http.get<{ tokenPresent: boolean }>(url, {
      withCredentials: true
    }).pipe(
      rxTimeout(this.SIGNER_TIMEOUT), // ✅ Auto-timeout after 5 seconds
      catchError(error => {
        if (error.name === 'TimeoutError') {
          console.warn('⏱️ Signer status check timed out after 5 seconds');
        } else {
          console.error('❌ Signer status check error:', error);
        }
        return throwError(() => error);
      })
    );
  }


  signPdfWithLocalSigner(
    pdfBlob: Blob,
    mode: 'view' | 'download',
    pin: string,
    fileName: string,
    pdfPassword?: string
  ): Observable<Blob> {

    return new Observable(observer => {
      const reader = new FileReader();

      reader.onload = () => {
        const base64String = (reader.result as string).split(',')[1];

        const payload = {
          pdfBytes: base64String,
          mode,
          pin,
          fileName,
          pdfPassword
        };

        const url = `${this.SIGNER_BASE_URL}/sign`;

        this.http.post(url, payload, {
          responseType: 'blob',
          withCredentials: true
        }).subscribe({
          next: blob => {
            observer.next(blob);
            observer.complete();
          },
          error: err => observer.error(err)
        });
      };

      reader.readAsDataURL(pdfBlob);
    });
  }


  createBlobUrl(blob: Blob): string {
    return URL.createObjectURL(blob);
  }

  revokeBlobUrl(url: string): void {
    if (url && url.startsWith('blob:')) {
      URL.revokeObjectURL(url);
    }
  }
}