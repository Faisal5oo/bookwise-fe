import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface User {
  user_id: string;
  fname: string;
  lname: string;
  email: string;
  avatar?: string;
  memberSince?: string;
  booksListed?: number;
  exchanges?: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  fname: string;
  lname: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  message: string;
  access_token: string;
  token_type: string;
  user_id: string;
  fname: string;
  lname: string;
  email: string;
  expires_in: number;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}`;
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  private isLoggedInSubject = new BehaviorSubject<boolean>(false);

  public currentUser$ = this.currentUserSubject.asObservable();
  public isLoggedIn$ = this.isLoggedInSubject.asObservable();

  constructor(private http: HttpClient) {
    this.checkStoredAuth();
  }

  private checkStoredAuth() {
    const token = localStorage.getItem('bookwise_token');
    const user = localStorage.getItem('bookwise_user');
    const tokenExpiry = localStorage.getItem('bookwise_token_expiry');
    
    if (token && user && tokenExpiry) {
      try {
        const expiryTime = parseInt(tokenExpiry);
        const currentTime = Date.now();
        
        if (currentTime < expiryTime) {
          const parsedUser = JSON.parse(user);
          this.currentUserSubject.next(parsedUser);
          this.isLoggedInSubject.next(true);
        } else {
          this.logout();
        }
      } catch (error) {
        this.logout();
      }
    }
  }

  register(userData: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, userData)
      .pipe(
        tap(response => {
          if (response.access_token) {
            this.setAuthData(response);
          }
        })
      );
  }

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials)
      .pipe(
        tap(response => {
          if (response.access_token) {
            this.setAuthData(response);
          }
        })
      );
  }

  logout() {
    localStorage.removeItem('bookwise_token');
    localStorage.removeItem('bookwise_user');
    localStorage.removeItem('bookwise_token_expiry');
    this.currentUserSubject.next(null);
    this.isLoggedInSubject.next(false);
  }

  private setAuthData(response: AuthResponse) {
    const user: User = {
      user_id: response.user_id,
      fname: response.fname,
      lname: response.lname,
      email: response.email
    };

    const expiryTime = Date.now() + (response.expires_in * 1000);

    localStorage.setItem('bookwise_token', response.access_token);
    localStorage.setItem('bookwise_user', JSON.stringify(user));
    localStorage.setItem('bookwise_token_expiry', expiryTime.toString());
    
    this.currentUserSubject.next(user);
    this.isLoggedInSubject.next(true);
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  isAuthenticated(): boolean {
    const token = localStorage.getItem('bookwise_token');
    const tokenExpiry = localStorage.getItem('bookwise_token_expiry');
    
    if (!token || !tokenExpiry) {
      return false;
    }

    const expiryTime = parseInt(tokenExpiry);
    const currentTime = Date.now();
    
    if (currentTime >= expiryTime) {
      this.logout();
      return false;
    }

    return this.isLoggedInSubject.value;
  }

  getToken(): string | null {
    if (this.isAuthenticated()) {
      return localStorage.getItem('bookwise_token');
    }
    return null;
  }

  updateUser(userData: Partial<User>) {
    const currentUser = this.getCurrentUser();
    if (currentUser) {
      const updatedUser = { ...currentUser, ...userData };
      localStorage.setItem('bookwise_user', JSON.stringify(updatedUser));
      this.currentUserSubject.next(updatedUser);
    }
  }

  getUserId(): string | null {
    const user = this.getCurrentUser();
    return user ? user.user_id : null;
  }
} 