import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable, NgZone } from '@angular/core';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GmailService {

  private http =  inject(HttpClient);
  private zone = inject(NgZone);
  private apiUrl = `${environment.apiBaseUrl}/Gmail`;
  

  getGmailFolders(positionId : string): Observable<{ id: string; name: string ; selected: boolean}[]> 
  {
    const params = new HttpParams()
      .set('publicPosId', positionId);
    return this.http.get<{ id: string; name: string ; selected: boolean}[]>(
      `${this.apiUrl}/labels`,
      { params,withCredentials: true }
    );
  }

  getUnread(labelId: string): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.apiUrl}/unread?labelId=${encodeURIComponent(labelId)}`,
      { withCredentials: true }
    );
  }

  connectToGmail(
    width = 500,
    height = 650
  ): Observable<void> {
    return new Observable<void>(observer => {
      // 1) Deschizi popup-ul
      const left = (window.screen.width  - width)  / 2;
      const top  = (window.screen.height - height) / 2;
      const popup = window.open(
        `${this.apiUrl}/login`,
        'googleAuth',
        `width=${width},height=${height},left=${left},top=${top}`
      );

      // 2) Definim handler-ul de postMessage
      const handler = (event: MessageEvent) => {
        // Dacă vrei să restrângi origin-ul:
        // if (event.origin !== window.location.origin) return;
        const data = event.data as { type: string; status: string };
        if (data?.type === 'gmail-auth' && data.status === 'success') {
          // Emit și complete în NgZone
          this.zone.run(() => {
            observer.next();
            observer.complete();
          });
          // Închide popup-ul și dezafectează listener-ul
          popup?.close();
          window.removeEventListener('message', handler);
        }
      };

      // 3) Atașezi listener-ul
      window.addEventListener('message', handler);

      // 4) Cleanup la unsubscribe
      return () => {
        window.removeEventListener('message', handler);
        popup?.close();
      };
    });
  }


  isGmailSession(): Observable<void> {
    return this.http.get<void>(`${this.apiUrl}/session`, { withCredentials: true });
  }


  watchLabel(labelIds: string[], positionId: string): Observable<{
    labelIds: string[];
    historyId: number;
    expiration: number;
  }> {
    const params = new HttpParams()
      .set('positionPublicId', positionId);

    return this.http.post<{
      labelIds: string[];
      historyId: number;
      expiration: number;
    }>(
      `${this.apiUrl}/watch`,
      labelIds,
      { params,withCredentials: true }
    );
  }
}
