import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard {
  constructor(private authService: AuthService, private router: Router) {
    console.log('[Auth Guard] Initialized');
  }

  canActivate(): boolean {
    console.log('[Auth Guard] Checking route access');
    
    const token = localStorage.getItem('token');
    const user = this.authService.getCurrentUser();
    const userId = user?._id || user?.id;

    console.log('[Auth Guard] Auth state:', {
      hasToken: !!token,
      hasUser: !!user,
      userId: userId,
      userObject: user
    });

    if (!token || !user || !userId) {
      console.log('[Auth Guard] Missing auth requirements:', {
        hasToken: !!token,
        hasUser: !!user,
        hasUserId: !!userId
      });
      this.authService.logout(); // Clear any partial state
      this.router.navigate(['/login']);
      return false;
    }

    if (this.authService.isLoggedIn()) {
      console.log('[Auth Guard] User is logged in, allowing access');
      return true;
    }

    console.log('[Auth Guard] User not logged in, redirecting to login');
    this.router.navigate(['/login']);
    return false;
  }
}
