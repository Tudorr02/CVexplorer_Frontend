import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { User } from '../_models/user';
import { Observable, tap , interval, Subscription } from 'rxjs';
import { UserDetails } from '../_models/userDetails';
import { jwtDecode } from 'jwt-decode';
import { Router } from '@angular/router';
import { NotificationService } from './notification.service';
@Injectable({
  providedIn: 'root'
})
export class UserService {
  private http =  inject(HttpClient);
  private apiUrl = `${environment.apiBaseUrl}/Account`;
  currentUser = signal<User | null>(null);
  private tokenCheckInterval: Subscription | null = null;
  Router = inject(Router);
  NotificationService = inject(NotificationService);

  constructor() {
    this.loadUserData();
    this.startTokenCheck(); // ✅ Start checking expiration on app load
  }

  private startTokenCheck() {
    if (this.tokenCheckInterval) {
      this.tokenCheckInterval.unsubscribe();
    }
    this.tokenCheckInterval = interval(60 * 1000).subscribe(() => {
      if (this.isTokenExpired()) {
        this.logout();
      }
    });
  }

  isTokenExpired(): boolean {
    const expTime = this.currentUser()?.expirationTime;
    if (!expTime) return true;
    return new Date().getTime() > expTime;
  }

   private loadUserData() {
    const userData = localStorage.getItem('userData');
    if (userData) {
      let user: User = JSON.parse(userData);

      // ✅ Decode the token to extract roles & expirationTime
      try {
        const decoded: any = jwtDecode(user.token);
        user.roles = decoded.role || [];
        user.expirationTime = decoded.exp * 1000; // ✅ Convert UNIX timestamp to ms
      } catch (error) {
        console.error('Error decoding JWT on load:', error);
        user.roles = [];
        user.expirationTime = 0;
      }

      this.currentUser.set(user);
    }
  }

  login(model: any) : Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/Login`, model).pipe(
      tap(user => { 
        if (user) {
          localStorage.setItem('userData', JSON.stringify(user)); //  Store user in localStorage
          try{
            const decodedToken: any = jwtDecode(user.token);
            user.roles = decodedToken.role;
            user.expirationTime = decodedToken.exp *1000;
          }catch(error){
            console.error('Error decoding JWT:', error);
            user.roles = [];
            user.expirationTime = 0;
          }
          this.currentUser.set(user); //  Update currentUser
          this.startTokenCheck(); //  Start token check
        }
      })  
    );
  }

  logout() {
    if (this.tokenCheckInterval) {
      if(this.isTokenExpired()){
        console.log('Session expired. Stopping token check !');
        this.NotificationService.showWarning('Session expired. Please login again !');
      }
      //this.Router.navigate(['/login']);
      this.tokenCheckInterval.unsubscribe();
    }
    localStorage.removeItem('userData');
    this.currentUser.set(null);
  }

  isLoggedIn(): boolean {
    return this.currentUser() !== null || localStorage.getItem('userData') !== null;
  }
  
  getUserDetails(): Observable<UserDetails> {
    return this.http.get<UserDetails>(`${this.apiUrl}/Details`);
  }

  updateUserDetails(userDetails: UserDetails): Observable<UserDetails> {
    return this.http.put<UserDetails>(`${this.apiUrl}/Details`, userDetails);
  }

}
