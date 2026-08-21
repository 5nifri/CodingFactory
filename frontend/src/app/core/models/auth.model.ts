export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
}

export interface DecodedToken {
  sub: string;   // email
  role: string;  // ADMIN or STUDENT — confirm this claim name matches your JwtService
  exp: number;
}
