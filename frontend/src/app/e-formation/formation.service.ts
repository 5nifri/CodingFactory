import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Formation, Course, Category } from './formation.model';

@Injectable({ providedIn: 'root' })
export class FormationService {

  private readonly apiUrl = 'http://localhost:8080/api';

  constructor(private http: HttpClient) {}

  getPublishedFormations(): Observable<Formation[]> {
    return this.http.get<Formation[]>(`${this.apiUrl}/formations`);
  }

  getFormationById(id: number): Observable<Formation> {
    return this.http.get<Formation>(`${this.apiUrl}/formations/${id}`);
  }

  getCoursesByFormation(formationId: number): Observable<Course[]> {
    return this.http.get<Course[]>(`${this.apiUrl}/formations/${formationId}/courses`);
  }

  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.apiUrl}/categories`);
  }
}
