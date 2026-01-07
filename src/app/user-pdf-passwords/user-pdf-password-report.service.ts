import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CURRENT_API_URL } from '../core/serachpage/api-urls';

const BASE = `${CURRENT_API_URL}/server/api/diracai/user-pdf-passwords`;

export interface UserPdfPassword {
  email: string;
  firstName: string;
  lastName: string;
  pdfPassword: string;
}

@Injectable({ providedIn: 'root' })
export class UserPdfPasswordReportService {
  constructor(private http: HttpClient) {}

  getAll(): Observable<UserPdfPassword[]> {
    return this.http.get<UserPdfPassword[]>(BASE, { withCredentials: true });
  }
}
