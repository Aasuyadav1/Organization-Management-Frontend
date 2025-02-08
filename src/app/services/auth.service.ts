import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { AuthResponse, LoginData, RegisterData, User, UsersResponse } from '../interfaces/user.interface';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    console.log('AuthService initialized');
    this.loadUserFromStorage();
  }

  private loadUserFromStorage() {
    console.log('Loading user from storage...');
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    
    console.log('Storage state:', { hasToken: !!token, hasUserStr: !!userStr });
    
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user && user._id) {
          console.log('User loaded successfully:', { userId: user._id });
          this.currentUserSubject.next(user);
        } else {
          console.log('Invalid user data found, logging out');
          this.logout(); // Clear invalid user data
        }
      } catch (e) {
        console.error('Error parsing user data:', e);
        this.logout(); // Clear invalid user data
      }
    } else {
      console.log('No user data found in storage');
    }
  }

  register(data: RegisterData): Observable<AuthResponse> {
    console.log('Attempting to register user:', { email: data.email });
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/register`, data)
      .pipe(tap(response => {
        console.log('Register response:', { success: response.success });
        this.handleAuthResponse(response);
      }));
  }

  login(data: LoginData): Observable<AuthResponse> {
    console.log('Attempting to login user:', { email: data.email });
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/login`, data)
      .pipe(tap(response => {
        console.log('Login response:', { success: response.success });
        this.handleAuthResponse(response);
      }));
  }

  private handleAuthResponse(response: AuthResponse) {
    console.log('Raw auth response:', response); // Log the full response to see its structure
    console.log('Handling auth response:', { 
      success: response.success,
      hasData: !!response.data,
      hasUser: !!response.data?.user,
      hasToken: !!response.data?.token,
      userData: response.data?.user // Log the full user data
    });

    if (response.success && response.data && response.data.user && response.data.token) {
      // Ensure we have the required user fields
      const user = response.data.user;
      if (!user._id && user.id) {
        user._id = user.id; // Some APIs return id instead of _id
      }

      console.log('Processing user data:', user);

      if (!user._id) {
        console.error('User data is missing _id field:', user);
        this.logout();
        return;
      }

      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(user));
      console.log('Auth data saved to storage:', { 
        userId: user._id,
        tokenLength: response.data.token.length,
        user: user
      });
      this.currentUserSubject.next(user);
    } else {
      console.error('Invalid auth response:', response);
      this.logout();
    }
  }

  logout() {
    console.log('Logging out user');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.currentUserSubject.next(null);
    console.log('User logged out, storage cleared');
  }

  isLoggedIn(): boolean {
    const currentUser = this.currentUserSubject.value;
    const token = localStorage.getItem('token');
    const isLoggedIn = !!(currentUser && (currentUser._id || currentUser.id) && token);
    
    console.log('Checking login status:', { 
      isLoggedIn,
      hasUser: !!currentUser,
      hasToken: !!token,
      userId: currentUser?._id || currentUser?.id
    });
    
    return isLoggedIn;
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getCurrentUser(): User | null {
    const user = this.currentUserSubject.value;
    if (user && !user._id && user.id) {
      user._id = user.id; // Ensure consistency in ID field
    }
    return user;
  }

  getCurrentUserId(): string {
    const user = this.currentUserSubject.value;
    return user?._id || '';
  }

  getAllUsers(): Observable<UsersResponse> {
    return this.http.get<UsersResponse>(`${environment.apiUrl}/auth/users`);
  }

  getRemainingUsers(orgId: string): Observable<{ 
    success: boolean; 
    message: string; 
    data: { 
      users: User[] 
    } 
  }> {
    return this.http.get<any>(`${environment.apiUrl}/auth/organizations/${orgId}/remaining-users`);
  }
}
