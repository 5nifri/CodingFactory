import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ConsultationRequest, RequestStatus } from '../models/consulting.model';

@Injectable({ providedIn: 'root' })
export class AdminConsultationRequestService {
  private readonly apiUrl = 'http://localhost:8080/api/consulting-requests';

  constructor(private http: HttpClient) {}

  getAll(): Observable<ConsultationRequest[]> {
    return this.http.get<ConsultationRequest[]>(this.apiUrl);
  }

  updateStatus(id: number, status: RequestStatus): Observable<ConsultationRequest> {
    return this.http.put<ConsultationRequest>(`${this.apiUrl}/${id}/status`, { status });
  }

  getById(id: number): Observable<ConsultationRequest> {
    return this.http.get<ConsultationRequest>(`${this.apiUrl}/${id}`);
  }

  getByConsultingId(consultingId: number): Observable<ConsultationRequest[]> {
    return this.http.get<ConsultationRequest[]>(`${this.apiUrl}/by-consulting/${consultingId}`);
  }
}
