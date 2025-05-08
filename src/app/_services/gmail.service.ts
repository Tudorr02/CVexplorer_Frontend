import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GmailService {

  private http =  inject(HttpClient);
  private apiUrl = `${environment.apiBaseUrl}/Gmail`;
  

  getGmailFolders(): Observable<{ id: string; name: string }[]> {
    return this.http.get<{ id: string; name: string }[]>(
      `${this.apiUrl}/labels`,
      { withCredentials: true }
    );
  }

  getUnread(labelId: string): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.apiUrl}/unread?labelId=${encodeURIComponent(labelId)}`,
      { withCredentials: true }
    );
  }

  connectToGmail(width = 500, height = 650): Window | null {
    const left = (window.screen.width  - width)  / 2;
    const top  = (window.screen.height - height) / 2;
    // must match [HttpGet("login")] în backend
    return window.open(
      `${this.apiUrl}/login`,
      'googleAuth',
      `width=${width},height=${height},left=${left},top=${top}`
    );
  }

  isGmailSession(): Observable<void> {
    return this.http.get<void>(`${this.apiUrl}/session`, { withCredentials: true });
  }
}
