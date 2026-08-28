import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Enrollment } from './formation.model';

@Injectable({ providedIn: 'root' })
export class EnrollmentService {

  private readonly apiUrl = 'http://localhost:8080/api/enrollments';

  constructor(private http: HttpClient) {}

  enroll(formationId: number): Observable<Enrollment> {
    return this.http.post<Enrollment>(`${this.apiUrl}/formation/${formationId}`, {});
  }

  unenroll(formationId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/formation/${formationId}`);
  }

  getMyEnrollments(): Observable<Enrollment[]> {
    return this.http.get<Enrollment[]>(`${this.apiUrl}/my`);
  }
}
