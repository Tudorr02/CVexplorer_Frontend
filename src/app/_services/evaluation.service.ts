import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { CvEvaluationResult, Evaluation } from '../_models/evaluation';
import { Observable } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class EvaluationService {

  private http =  inject(HttpClient);
  private apiUrl = `${environment.apiBaseUrl}/CVsEvaluation`;

  updateEvaluation(evaluationId: string, evaluation: CvEvaluationResult): Observable<CvEvaluationResult> {
    return this.http.put<CvEvaluationResult>(`${this.apiUrl}/${evaluationId}`, evaluation);
  }

  getEvaluation(cvPublicId: string): Observable<Evaluation> {
    return this.http.get<Evaluation>(`${this.apiUrl}/${cvPublicId}`);
  }

 

}
