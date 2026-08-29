import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ConsultationRequest } from './consulting.model';

@Injectable({ providedIn: 'root' })
export class ConsultationRequestService {
  private readonly apiUrl = 'http://localhost:8080/api/consulting-requests';

  constructor(private http: HttpClient) {}

  create(consultingId: number, message: string): Observable<ConsultationRequest> {
    return this.http.post<ConsultationRequest>(this.apiUrl, { consultingId, message });
  }

  getMyRequests(): Observable<ConsultationRequest[]> {
    return this.http.get<ConsultationRequest[]>(`${this.apiUrl}/my`);
  }
}
