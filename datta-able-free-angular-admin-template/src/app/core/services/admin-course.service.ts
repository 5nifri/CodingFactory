import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CourseRequest, CourseResponse } from '../models/course.model';

@Injectable({ providedIn: 'root' })
export class AdminCourseService {
  private readonly apiUrl = 'http://localhost:8080/api';

  constructor(private http: HttpClient) {}

  getByFormation(formationId: number): Observable<CourseResponse[]> {
    return this.http.get<CourseResponse[]>(`${this.apiUrl}/formations/${formationId}/courses`);
  }

  create(formationId: number, request: CourseRequest): Observable<CourseResponse> {
    return this.http.post<CourseResponse>(`${this.apiUrl}/formations/${formationId}/courses`, request);
  }

  update(courseId: number, request: CourseRequest): Observable<CourseResponse> {
    return this.http.put<CourseResponse>(`${this.apiUrl}/courses/${courseId}`, request);
  }

  delete(courseId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/courses/${courseId}`);
  }

  reorder(formationId: number, courseIds: number[]): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/formations/${formationId}/courses/reorder`, courseIds);
  }


  getById(courseId: number): Observable<CourseResponse> {
    return this.http.get<CourseResponse>(`${this.apiUrl}/courses/${courseId}`);
  }



}
