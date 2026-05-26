// import { Injectable } from '@angular/core';
// import { HttpClient } from '@angular/common/http';
// import { Observable } from 'rxjs';

// import { CURRENT_API_URL } from '../../core/serachpage/api-urls';
// @Injectable({
//     providedIn: 'root'
// })
// export class AuditTrailReportService {

//     constructor(private http: HttpClient) { }

//     /**
//      * Get all users/emails for dropdown
//      */
//     getUsers(): Observable<any> {

//         return this.http.get(
//             `${CURRENT_API_URL}/server/api/diracai/audittrail/users`
//         );

//     }

//     /**
//      * Get audit trail report
//      */
//     getAuditReport(
//         email: string,
//         startDate: string,
//         endDate: string
//     ): Observable<any> {

//         return this.http.get(
//             `${CURRENT_API_URL}/server/api/diracai/audittrail/report`,
//             {
//                 params: {
//                     email: email,
//                     startDate: startDate,
//                     endDate: endDate
//                 }
//             }
//         );

//     }

// }