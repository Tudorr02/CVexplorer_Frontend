import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { User } from '../_models/user';
import { Observable } from 'rxjs';
import { UserDetails } from '../_models/userDetails';
import { Router } from '@angular/router';
import { NotificationService } from './notification.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private http =  inject(HttpClient);
  private apiUrl = `${environment.apiBaseUrl}/Users`;
  currentUser = signal<User | null>(null);
  Router = inject(Router);
  NotificationService = inject(NotificationService);

  getUserDetails(): Observable<UserDetails> {
    return this.http.get<UserDetails>(`${this.apiUrl}/Me`);
  }

  updateUserDetails(userDetails: UserDetails): Observable<UserDetails> {
    return this.http.put<UserDetails>(`${this.apiUrl}/Me`, userDetails);
  }
  
}
