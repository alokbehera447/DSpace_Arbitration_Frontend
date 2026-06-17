import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CURRENT_API_URL } from '../../core/serachpage/api-urls';

@Injectable({ providedIn: 'root' })
export class AdvocateNameReportService {

    constructor(private http: HttpClient) { }

    getPetitionerAdvocates(): Observable<string[]> {
        return this.http.get<string[]>(
            `${CURRENT_API_URL}/server/api/diracai/advocate-name-report/petitioner-advocates`
        );
    }

    getRespondentAdvocates(): Observable<string[]> {
        return this.http.get<string[]>(
            `${CURRENT_API_URL}/server/api/diracai/advocate-name-report/respondent-advocates`
        );
    }

    exportPetitionerCSV(advocateName: string, startDate: string, endDate: string): Observable<Blob> {
        let params = new HttpParams()
            .set('startDate', startDate)
            .set('endDate', endDate);
        if (advocateName) params = params.set('advocateName', advocateName);
        return this.http.get(
            `${CURRENT_API_URL}/server/api/diracai/advocate-name-report/petitioner/csv`,
            { params, responseType: 'blob' }
        );
    }

    exportPetitionerPDF(advocateName: string, startDate: string, endDate: string): Observable<Blob> {
        let params = new HttpParams()
            .set('startDate', startDate)
            .set('endDate', endDate);
        if (advocateName) params = params.set('advocateName', advocateName);
        return this.http.get(
            `${CURRENT_API_URL}/server/api/diracai/advocate-name-report/petitioner/pdf`,
            { params, responseType: 'blob' }
        );
    }

    exportRespondentCSV(advocateName: string, startDate: string, endDate: string): Observable<Blob> {
        let params = new HttpParams()
            .set('startDate', startDate)
            .set('endDate', endDate);
        if (advocateName) params = params.set('advocateName', advocateName);
        return this.http.get(
            `${CURRENT_API_URL}/server/api/diracai/advocate-name-report/respondent/csv`,
            { params, responseType: 'blob' }
        );
    }

    exportRespondentPDF(advocateName: string, startDate: string, endDate: string): Observable<Blob> {
        let params = new HttpParams()
            .set('startDate', startDate)
            .set('endDate', endDate);
        if (advocateName) params = params.set('advocateName', advocateName);
        return this.http.get(
            `${CURRENT_API_URL}/server/api/diracai/advocate-name-report/respondent/pdf`,
            { params, responseType: 'blob' }
        );
    }
}