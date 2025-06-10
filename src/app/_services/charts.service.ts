import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable, NgZone } from '@angular/core';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

export interface ChartCounts {
  [key: string]: number;
}

@Injectable({
  providedIn: 'root'
})


export class ChartsService {

  private http =  inject(HttpClient);
  private zone = inject(NgZone);
  private apiUrl = `${environment.apiBaseUrl}/Charts`;

  constructor() { }

  getSeniorityDistribution(
    positionPublicId?: string,
    departmentId?: number
  ): Observable<ChartCounts> {
    let params = new HttpParams();
    if (positionPublicId) {
      params = params.set('positionPublicId', positionPublicId);
    }
    if (departmentId != null) {
      params = params.set('departmentId', departmentId.toString());
    }
    // Execute HTTP request outside Angular zone to reduce change detection cycles
    return this.zone.runOutsideAngular(() =>
      this.http.get<ChartCounts>(`${this.apiUrl}/GetCandidatesSeniority`, { params })
    );
  }

  getScoreDistribution(
    positionPublicId?: string,
    departmentId?: number
  ): Observable<ChartCounts> {
    let params = new HttpParams();
    if (positionPublicId) {
      params = params.set('positionPublicId', positionPublicId);
    }
    if (departmentId != null) {
      params = params.set('departmentId', departmentId.toString());
    }
    return this.zone.runOutsideAngular(() =>
      this.http.get<ChartCounts>(`${this.apiUrl}/GetScoreDistribution`, { params })
    );
  }
}
