import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Account } from '../_models/account';
import { Observable, tap , interval, Subscription } from 'rxjs';
import { UserDetails } from '../_models/userDetails';
import { jwtDecode } from 'jwt-decode';
import { Router } from '@angular/router';
import { NotificationService } from './notification.service';

@Injectable({
  providedIn: 'root'
})
export class AccountService {
  private http =  inject(HttpClient);
  private apiUrl = `${environment.apiBaseUrl}/Account`;
  currentUser = signal<Account | null>(null);
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
      let user: Account = JSON.parse(userData);

      // ✅ Decode the token to extract roles & expirationTime
      try {
        const decoded: any = jwtDecode(user.token);
        user.role = decoded.role || '';
        user.expirationTime = decoded.exp * 1000; // ✅ Convert UNIX timestamp to ms
      } catch (error) {
        console.error('Error decoding JWT on load:', error);
        user.role = '';
        user.expirationTime = 0;
      }

      this.currentUser.set(user);
    }
  }

  login(model: any) : Observable<Account> {
    return this.http.post<Account>(`${this.apiUrl}/Login`, model , {withCredentials : true}).pipe(
      tap(user => { 
        if (user) {
          localStorage.setItem('userData', JSON.stringify(user)); //  Store user in localStorage
          try{
            const decodedToken: any = jwtDecode(user.token);
            user.role = decodedToken.role;
            user.expirationTime = decodedToken.exp *1000;
          }catch(error){
            console.error('Error decoding JWT:', error);
            user.role = '';
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
    this.http.post<void>(`${this.apiUrl}/Logout`, {}, { withCredentials: true }).subscribe({
      next: () => {
        console.log('Logged out successfully');
      },
      error: (error) => {
        console.error('Error during logout:', error);
      }
    });
  }

  isLoggedIn(): boolean {
    return this.currentUser() !== null || localStorage.getItem('userData') !== null;
  }
  
  

}
