import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RoundEntriesService {

  private http =  inject(HttpClient);
  private apiUrl = `${environment.apiBaseUrl}/RoundEntries`;

  updateRoundEntry(entryId: number, targetOrdinal : number): Observable<void> {
    const params = new HttpParams().set('targetOrdinal', targetOrdinal);

    return this.http.put<void>(
      `${this.apiUrl}/${entryId}`,
      null,               // no request body
      { params }         // selected goes in the query string
    );
  }
}
