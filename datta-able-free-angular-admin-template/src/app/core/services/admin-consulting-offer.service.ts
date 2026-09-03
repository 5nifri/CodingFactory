import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ConsultingOffer } from '../models/consulting.model';

@Injectable({ providedIn: 'root' })
export class AdminConsultingOfferService {
  private readonly apiUrl = 'http://localhost:8080/api/consulting';

  constructor(private http: HttpClient) {}

  getAll(): Observable<ConsultingOffer[]> {
    return this.http.get<ConsultingOffer[]>(this.apiUrl);
  }

  getById(id: number): Observable<ConsultingOffer> {
    return this.http.get<ConsultingOffer>(`${this.apiUrl}/${id}`);
  }

  create(payload: Omit<ConsultingOffer, 'id'>): Observable<ConsultingOffer> {
    return this.http.post<ConsultingOffer>(this.apiUrl, payload);
  }

  update(id: number, payload: Omit<ConsultingOffer, 'id'>): Observable<ConsultingOffer> {
    return this.http.put<ConsultingOffer>(`${this.apiUrl}/${id}`, payload);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
