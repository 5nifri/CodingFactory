import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class FileUploadService {
  private readonly baseUrl = 'http://localhost:8080';
  private readonly apiUrl = `${this.baseUrl}/api/files`;

  constructor(private http: HttpClient) {}

  uploadCourseFile(file: File, type: 'video' | 'material'): Observable<{ url: string }> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);
    return this.http.post<{ url: string }>(`${this.apiUrl}/upload/courses`, formData);
  }

  uploadFormationImage(file: File): Observable<{ url: string }> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<{ url: string }>(`${this.apiUrl}/upload/formations`, formData);
  }

  uploadConsultingImage(file: File): Observable<{ url: string }> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<{ url: string }>(`${this.apiUrl}/upload/consulting`, formData);
  }

  /**
   * The backend returns relative paths like "/uploads/consulting/xyz.png".
   * This resolves them to a full URL so they can be used directly in <img [src]>.
   * Already-absolute URLs (http/https) are returned unchanged.
   */
  resolveUrl(path: string | null | undefined): string {
    if (!path) return '';
    return path.startsWith('http') ? path : `${this.baseUrl}${path}`;
  }
}
