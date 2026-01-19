import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry, switchMap } from 'rxjs/operators';
import { CURRENT_API_URL } from './api-urls';

@Injectable({
  providedIn: 'root'
})
export class PdfService {
  private readonly SIGNER_BASE_URL = "http://192.168.0.125:9001/signer";

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


  checkSignerStatus(): Observable<{ tokenPresent: boolean }> {
    const url = `${this.SIGNER_BASE_URL}/token/status`;

    return this.http.get<{ tokenPresent: boolean }>(url, {
      withCredentials: true
    }).pipe(
      catchError(error => {
        console.error('Signer status check error:', error);
        return throwError(() => new Error('Signer service not reachable.'));
      })
    );
  }



  signPdfWithLocalSigner(pdfBlob: Blob, fileName: string, pin: string): Observable<Blob> {
    return new Observable(observer => {
      const reader = new FileReader();

      reader.onload = () => {
        const base64String = (reader.result as string).split(',')[1];

        const payload = {
          pin: pin,
          fileName: fileName,
          pdfBytes: base64String
        };

        const url = `${this.SIGNER_BASE_URL}/sign`;

        this.http.post(url, payload, {
          responseType: 'blob',
          withCredentials: true,
          headers: new HttpHeaders({
            'Content-Type': 'application/json'
          })
        }).pipe(
          catchError(error => {
            console.error('PDF signing error:', error);
            return throwError(() => new Error('PDF signing failed.'));
          })
        ).subscribe({
          next: (signedBlob) => {
            observer.next(signedBlob);
            observer.complete();
          },
          error: (err) => {
            observer.error(err);
          }
        });
      };

      reader.onerror = () => {
        observer.error(new Error('Failed to read PDF file.'));
      };

      reader.readAsDataURL(pdfBlob);
    });
  }

  encryptAndSignBitstream(
    bitstreamId: string,
    mode: 'view' | 'download' = 'view',
    pin: string,
    fileName: string = 'document.pdf'
  ): Observable<Blob> {

    return this.checkSignerStatus().pipe(

      switchMap(status => {
        if (!status.tokenPresent) {
          alert('❌ DSC Token is not attached. Please insert your DSC and try again.');
          return throwError(() => new Error('DSC token not present'));
        }

        return this.encryptBitstream(bitstreamId, mode);
      }),

      switchMap(encryptedBlob => {
        return this.signPdfWithLocalSigner(encryptedBlob, fileName, pin);
      }),

      catchError(error => {
        return throwError(() => error);
      })
    );
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