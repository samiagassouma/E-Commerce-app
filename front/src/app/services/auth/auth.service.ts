import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, filter, Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment.development';

export interface User {
  idUser: number;
  name: string;
  email: string;
  role: string;
  lastName?: string;
  phone?: string;
  address?: string;
  companyName: string;
  taxNumber: string;
}

export interface Session {
  access_token: string;
  refresh_token: string;
}

export interface LoginResponse {
  message: string;
  user: User;
  session: Session;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = environment.baseUrl + '/auth'; //'http://localhost:3000/auth';

  constructor(private http: HttpClient) {
    this.loadUserFromStorage();
  }



  private currentUserSubject = new BehaviorSubject<User | null>(null);
  //public currentUser$ = this.currentUserSubject.asObservable();
  public currentUser$ = this.currentUserSubject.asObservable().pipe(
  filter((user): user is User => user !== null)
);


  // ✅ Login method (matches your backend POST /auth/signin)
  login(credentials: { email: string; password: string }): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/signin`, credentials, { withCredentials: true }).pipe(
      tap(response => {

        console.log('Login response:', response);  // <-- ajoute ce log
        if (!response.session) {
          console.error('Session object missing in login response:', response);
          throw new Error('Session object missing in response');
        }
        this.storeSession({
          access_token: response.session.access_token,
          refresh_token: response.session.refresh_token,
          user_id: response.user.idUser.toString()
        });
        this.currentUserSubject.next(response.user);
      })
    );
  }

  // ✅ Sign up method (matches POST /auth/signup)
  signUp(data: {
    email: string;
    password: string;
    name: string;
    lastName: string;
    phone: string;
    address: string;
    age: number;
    role: string;
  }): Observable<any> {
    return this.http.post(`${this.apiUrl}/signup`, data);
  }

  // ✅ Forgot password method (matches POST /auth/forgot-password)
  forgotPassword(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/forgot-password`, { email }); // FIXED string interpolation
  }

  // ✅ Reset password method (matches POST /auth/reset-password)
  resetPassword(newPassword: string, accessToken: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/reset-password`, {
      newPassword,
      accessToken
    }); // FIXED string interpolation
  }

  // ✅ Logout method
  logout(): void {
    this.http.post(`${this.apiUrl}/signout`, {}, { withCredentials: true }).subscribe({
      next: () => {
        localStorage.clear();
        this.currentUserSubject.next(null);
        window.location.href = '/login';
      },
      error: (err) => console.error('Logout failed', err)
    });
  }


  // ✅ Store session data in localStorage
  storeSession(data: { access_token: string; refresh_token: string; user_id: string }): void {
    localStorage.setItem('access_token', data.access_token);
    localStorage.setItem('refresh_token', data.refresh_token);
    localStorage.setItem('user_id', data.user_id);
  }

  // ✅ Get access token
  getAccessToken(): string | null {
    return localStorage.getItem('access_token');
  }


  loadUserFromStorage() {
    const userId = localStorage.getItem('user_id');
    if (1) {
      this.http.get<User>(`${this.apiUrl}/user/${userId}`).subscribe({
        next: (user) => this.currentUserSubject.next(user),
        error: () => this.currentUserSubject.next(null)
      });
    }
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  getCurrentUser$() {
    return this.currentUser$;
  }

}
