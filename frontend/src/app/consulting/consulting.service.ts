import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ConsultingOffer } from './consulting.model';

@Injectable({ providedIn: 'root' })
export class ConsultingService {
  private readonly apiUrl = 'http://localhost:8080/api/consulting';

  constructor(private http: HttpClient) {}

  getAll(): Observable<ConsultingOffer[]> {
    return this.http.get<ConsultingOffer[]>(this.apiUrl);
  }

  getById(id: number): Observable<ConsultingOffer> {
    return this.http.get<ConsultingOffer>(`${this.apiUrl}/${id}`);
  }
}
