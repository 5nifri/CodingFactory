import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Consulting } from './consulting.model';

@Injectable({ providedIn: 'root' })
export class ConsultingService {

  private readonly apiUrl = 'http://localhost:8080/api/consulting';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Consulting[]> {
    return this.http.get<Consulting[]>(this.apiUrl);
  }

  getById(id: number): Observable<Consulting> {
    return this.http.get<Consulting>(`${this.apiUrl}/${id}`);
  }
}
