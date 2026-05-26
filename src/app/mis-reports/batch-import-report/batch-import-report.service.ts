import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { CURRENT_API_URL } from '../../core/serachpage/api-urls';

@Injectable({
    providedIn: 'root'
})
export class BatchImportReportService {

    constructor(private http: HttpClient) { }

    exportCSV(
        collectionId: string,
        startDate: string,
        endDate: string
    ): Observable<Blob> {

        let params = new HttpParams()
            .set('startDate', startDate)
            .set('endDate', endDate);

        if (collectionId && collectionId !== 'ALL') {
            params = params.set('collectionId', collectionId);
        }

        return this.http.get(
            `${CURRENT_API_URL}/server/api/diracai/batch-import-report/csv`,
            {
                params,
                responseType: 'blob'
            }
        );
    }

    exportPDF(
        collectionId: string,
        startDate: string,
        endDate: string
    ): Observable<Blob> {

        let params = new HttpParams()
            .set('startDate', startDate)
            .set('endDate', endDate);

        if (collectionId && collectionId !== 'ALL') {
            params = params.set('collectionId', collectionId);
        }

        return this.http.get(
            `${CURRENT_API_URL}/server/api/diracai/batch-import-report/pdf`,
            {
                params,
                responseType: 'blob'
            }
        );
    }
}