import { HttpClient, HttpResponse } from '@angular/common/http';
import { inject, Injectable, NgZone } from '@angular/core';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class OutlookService {
  private http =  inject(HttpClient);
  private zone = inject(NgZone);
  private apiUrl = `${environment.apiBaseUrl}/Outlook`;

  connectToOutlook(
    width = 500,
    height = 650
  ): Observable<void> {
    return new Observable<void>(observer => {
      // 1) Deschizi popup-ul centrat
      const left  = (window.screen.width  - width)  / 2;
      const top   = (window.screen.height - height) / 2;
      const popup = window.open(
        `${this.apiUrl}/login`,
        'outlookAuth',
        `width=${width},height=${height},left=${left},top=${top},resizable,scrollbars`
      );

      if (!popup) {
        observer.error(new Error('Popup failed to open'));
        return;
      }

      // 2) Handlerul de postMessage
      const handler = (event: MessageEvent) => {
        // Restrânge origin-ul dacă vrei:
        // if (event.origin !== window.location.origin) return;
        const data = event.data as { type: string; status: string };
        if (data?.type === 'outlook-auth' && data.status === 'success') {
          this.zone.run(() => {
            observer.next();
            observer.complete();
          });
          popup.close();
          window.removeEventListener('message', handler);
        }
      };

      // 3) Atașezi listener-ul
      window.addEventListener('message', handler);

      // 4) Cleanup la unsubscribe
      return () => {
        window.removeEventListener('message', handler);
        if (!popup.closed) {
          popup.close();
        }
      };
    });
  }

  isOutlookSession(): Observable<void> {
    return this.http.get<void>(`${this.apiUrl}/session`, { withCredentials: true });
  }

   getOutlookFolders(positionId : string): Observable<{ id: string; name: string ; selected: boolean }[]> {
    return this.http.get<{ id: string;  name: string; selected: boolean }[]>(
      `${this.apiUrl}/folders`,
      { params: { publicPosId: positionId }, withCredentials: true }
      
    );
  }

  
  watchFolder(folderIds: string[], positionId: string): Observable<any> {
     
    const body: any = {
      folderIds:            folderIds,
      positionPublicId:     positionId
    };
      return this.http.post<{
        labelIds: string[];
        historyId: number;
        expiration: number;
      }>(
        `${this.apiUrl}/subscribe-folders`,
        body,
        { withCredentials: true }

      );
    }
  
 
}
