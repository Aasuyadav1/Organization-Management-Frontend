import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, tap } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const authService = inject(AuthService);
  const token = localStorage.getItem('token');
  
  console.log(`[Auth Interceptor] Request to ${req.url}`, {
    hasToken: !!token,
    method: req.method
  });
  
  if (token) {
    const cloned = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${token}`)
    });
    
    console.log('[Auth Interceptor] Added token to request headers');
    
    return next(cloned).pipe(
      tap(response => {
        console.log(`[Auth Interceptor] Response from ${req.url}`, {
          status: response instanceof HttpErrorResponse ? response.status : 200,
          success: !(response instanceof HttpErrorResponse)
        });
      }),
      catchError((error: HttpErrorResponse) => {
        console.error(`[Auth Interceptor] Error from ${req.url}`, {
          status: error.status,
          message: error.message
        });
        
        if (error.status === 401) {
          console.log('[Auth Interceptor] Received 401, logging out user');
          authService.logout();
          router.navigate(['/login']);
        }
        return throwError(() => error);
      })
    );
  }
  
  console.log('[Auth Interceptor] No token found, proceeding without authentication');
  return next(req);
};
