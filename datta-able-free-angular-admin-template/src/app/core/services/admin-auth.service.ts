import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, map, throwError } from 'rxjs';
import { jwtDecode } from 'jwt-decode';

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
}

interface DecodedToken {
  sub: string;
  role: string;
  exp: number;
}

@Injectable({ providedIn: 'root' })
export class AdminAuthService {

  private readonly apiUrl = 'http://localhost:8080/api/auth';
  private readonly tokenKey = 'cf_admin_token';

  private _isLoggedIn = signal<boolean>(this.computeIsLoggedIn());
  readonly isLoggedIn = this._isLoggedIn.asReadonly();

  constructor(private http: HttpClient, private router: Router) {}

  login(request: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, request).pipe(
      map(response => {
        const decoded = jwtDecode<DecodedToken>(response.token);
        if (decoded.role !== 'ADMIN') {
          throw new Error('NOT_ADMIN');
        }
        return response;
      }),
      tap(response => {
        localStorage.setItem(this.tokenKey, response.token);
        this._isLoggedIn.set(true);
      })
    );
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    this._isLoggedIn.set(false);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  private computeIsLoggedIn(): boolean {
    const token = this.getToken();
    if (!token) return false;
    try {
      const decoded = jwtDecode<DecodedToken>(token);
      return decoded.exp * 1000 > Date.now() && decoded.role === 'ADMIN';
    } catch {
      return false;
    }
  }

  register(request: RegisterRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, request);
  }


}
