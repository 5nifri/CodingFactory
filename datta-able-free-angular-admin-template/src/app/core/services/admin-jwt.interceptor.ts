import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AdminAuthService } from './admin-auth.service';

export const adminJwtInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AdminAuthService);
  const token = authService.getToken();

  if (token) {
    req = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
  }

  return next(req);
};
