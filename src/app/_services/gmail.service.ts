import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable, NgZone } from '@angular/core';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';


export interface SessionData {
  processedCVs: number;
  expiry: string;  
  isProcessing : boolean;  // ISO-string sau null
  processingRoundId? :string ; // ID-ul rundei de procesare sau null
}

export interface SessionResponse {
  sessionActive: boolean;
  data: SessionData;
}
@Injectable({
  providedIn: 'root'
})
export class GmailService {

  private http =  inject(HttpClient);
  private zone = inject(NgZone);
  private apiUrl = `${environment.apiBaseUrl}/Gmail`;
  
  
  loadFolders(positionId : string): Observable<{ id: string; name: string ; isSubscribed: boolean}[]> 
  {
    const params = new HttpParams()
      .set('publicPosId', positionId);
    return this.http.get<{ id: string; name: string ; isSubscribed: boolean}[]>(
      `${this.apiUrl}/Folders`,
      { params,withCredentials: true }
    );
  }

  unsubscribe(positionId : string): Observable<void> {
    const params = new HttpParams()
      .set('publicPosId', positionId);
    return this.http.post<void>(
      `${this.apiUrl}/Unsubscribe`,
      {},
      { params, withCredentials: true }
    );
  }

  connect(
    width = 500,
    height = 650
  ): Observable<void> {
    return new Observable<void>(observer => {
      
      const left = (window.screen.width  - width)  / 2;
      const top  = (window.screen.height - height) / 2;
      const popup = window.open(
        `${this.apiUrl}/Connect`,
        'googleAuth',
        `width=${width},height=${height},left=${left},top=${top}`
      );

      
      const handler = (event: MessageEvent) => {
        const data = event.data as { type: string; status: string };
        if (data?.type === 'Google-auth' && data.status === 'success') {
          this.zone.run(() => {
            observer.next();
            observer.complete();
          });
          //popup?.close();
          window.removeEventListener('message', handler);
        }
      };

      
      window.addEventListener('message', handler);
    
      return () => {
        window.removeEventListener('message', handler);
       // popup?.close();
      };
    });
  }

  disconnect(): Observable<void> {
  return this.http.post<void>(
    `${this.apiUrl}/Disconnect`,
    {},
    { withCredentials: true }
  );
  }



  isGmailSession(publicId: string): Observable<SessionResponse> {
    let params = new HttpParams();
    params = params.set('publicId', publicId);
    return this.http.get<SessionResponse>(`${this.apiUrl}/Session`, { withCredentials: true , params});
  }


  watchLabel(labelIds: string[], positionId: string , roundId? : string): Observable<{
    id: string; 
    name: string ; 
    isSubscribed: boolean
  }[]> {
    let params = new HttpParams()
      .set('positionPublicId', positionId);

    if (roundId !== undefined) {
      params = params.set('roundId', roundId);
    }
      
    return this.http.post<{
      id: string; 
      name: string ; 
      isSubscribed: boolean
    }[]>(
      `${this.apiUrl}/Watch`,
      labelIds,
      { params,withCredentials: true }
    );
  }
}
