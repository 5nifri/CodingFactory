import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ProgressResponse {
  enrollmentId: number;
  courseId: number;
  courseTitle: string;
  completed: boolean;
  formationProgress: number;
}

@Injectable({ providedIn: 'root' })
export class ProgressService {

  private readonly apiUrl = 'http://localhost:8080/api/progress';

  constructor(private http: HttpClient) {}

  completeCourse(courseId: number): Observable<ProgressResponse> {
    return this.http.post<ProgressResponse>(`${this.apiUrl}/courses/${courseId}/complete`, {});
  }

  getCompletedCourseIds(enrollmentId: number): Observable<number[]> {
    return this.http.get<number[]>(`${this.apiUrl}/enrollment/${enrollmentId}/completed`);
  }
}
