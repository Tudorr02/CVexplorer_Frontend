import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { Round } from '../_models/round';
import { RoundEntry } from '../_models/round-entry';
import { CvEvaluationResult, Evaluation } from '../_models/evaluation';
import { RoundStage } from '../_models/round-stage';

@Injectable({
  providedIn: 'root'
})
export class RoundService {

  private http =  inject(HttpClient);
  private apiUrl = `${environment.apiBaseUrl}/Rounds`;

  getAllRounds(
    departmentId?: number,
    publicPositionId?: string
  ): Observable<Round[]> {
    let params = new HttpParams();
    if (departmentId != null) {
      params = params.set('departmentId', departmentId.toString());
    }
    if (publicPositionId) {
      params = params.set('publicPositionId', publicPositionId);
    }
    return this.http.get<Round[]>(this.apiUrl, { params });
  }

  deleteRound(publicId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${publicId}`);
  }
  
  getRound(publicId: string): Observable<RoundStage[]> {
    return this.http.get<RoundStage[]>(`${this.apiUrl}/${publicId}`);
  }

  addStage(publicId: string, stageName: string): Observable<RoundStage> {
    const params = new HttpParams().set('name', stageName);
    return this.http.post<RoundStage>(`${this.apiUrl}/${publicId}/RoundStages`, null, { params });
  }

  deleteStage(publicId: string, stageOrdinal: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${publicId}/RoundStages/${stageOrdinal}`);
  }
  
}
