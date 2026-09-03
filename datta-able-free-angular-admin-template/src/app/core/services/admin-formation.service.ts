import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { FormationRequest, FormationResponse } from '../models/formation.model';

@Injectable({ providedIn: 'root' })
export class AdminFormationService {
  private readonly apiUrl = 'http://localhost:8080/api/formations';

  constructor(private http: HttpClient) {}

  getAllForAdmin(): Observable<FormationResponse[]> {
    return this.http.get<FormationResponse[]>(`${this.apiUrl}/admin`);
  }

  getById(id: number): Observable<FormationResponse> {
    return this.http.get<FormationResponse>(`${this.apiUrl}/${id}`);
  }

  create(request: FormationRequest): Observable<FormationResponse> {
    return this.http.post<FormationResponse>(this.apiUrl, request);
  }

  update(id: number, request: FormationRequest): Observable<FormationResponse> {
    return this.http.put<FormationResponse>(`${this.apiUrl}/${id}`, request);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
