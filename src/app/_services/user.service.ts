import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { User } from '../_models/user';
import { Observable, tap } from 'rxjs';
import { UserDetails } from '../_models/userDetails';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private http =  inject(HttpClient);
  private apiUrl = `${environment.apiBaseUrl}/Account`;
  currentUser = signal<User | null>(null);
  
  constructor() {
    const userData = localStorage.getItem('userData');
    if (userData) {
      this.currentUser.set(JSON.parse(userData));
    }
  }

  login(model: any) : Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/Login`, model).pipe(
      tap(user => { 
        if (user) {
          this.currentUser.set(user); //  Update currentUser
          localStorage.setItem('userData', JSON.stringify(user)); //  Store user in localStorage
        }
      })  
    );
  }

  logout() {
    localStorage.removeItem('userData');
    this.currentUser.set(null);
  }

  isLoggedIn(): boolean {
    return this.currentUser() !== null || localStorage.getItem('userData') !== null;
  }
  
  getUserDetails(): Observable<UserDetails> {
    return this.http.get<UserDetails>(`${this.apiUrl}/Details`);
  }

}
