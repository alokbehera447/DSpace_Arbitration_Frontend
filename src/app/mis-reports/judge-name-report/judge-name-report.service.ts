import { Injectable } from '@angular/core';

import {
    HttpClient,
    HttpParams
} from '@angular/common/http';

import { Observable } from 'rxjs';

import {
    CURRENT_API_URL
} from '../../core/serachpage/api-urls';

@Injectable({
    providedIn: 'root'
})
export class JudgeNameReportService {

    constructor(
        private http: HttpClient
    ) { }

    getJudgeNames(): Observable<string[]> {

        return this.http.get<string[]>(

            `${CURRENT_API_URL}/server/api/diracai/judge-name-report/judges`
        );
    }

    exportCSV(
        judgeName: string,
        startDate: string,
        endDate: string
    ): Observable<Blob> {

        let params = new HttpParams()
            .set('startDate', startDate)
            .set('endDate', endDate);

        if (judgeName) {

            params = params.set(
                'judgeName',
                judgeName
            );

        }

        return this.http.get(

            `${CURRENT_API_URL}/server/api/diracai/judge-name-report/csv`,

            {
                params,
                responseType: 'blob'
            }
        );
    }

    exportPDF(
        judgeName: string,
        startDate: string,
        endDate: string
    ): Observable<Blob> {

        let params = new HttpParams()
            .set('startDate', startDate)
            .set('endDate', endDate);

        if (judgeName) {

            params = params.set(
                'judgeName',
                judgeName
            );

        }

        return this.http.get(

            `${CURRENT_API_URL}/server/api/diracai/judge-name-report/pdf`,

            {
                params,
                responseType: 'blob'
            }
        );
    }
}