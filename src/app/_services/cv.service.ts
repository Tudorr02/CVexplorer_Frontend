import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { CV } from '../_models/cv';

@Injectable({
  providedIn: 'root'
})
export class CvService {


  private http =  inject(HttpClient);
  private apiUrl = `${environment.apiBaseUrl}/CVs`;

  uploadCV(positionPublicId: string, file: File): Observable<CV[]> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<CV[]>(`${environment.apiBaseUrl}/Positions/${positionPublicId}/CVs`, formData);
  }

  /**
   * Get all CVs for a specific position
   */
  getAllCVs(positionPublicId: string): Observable<CV[]> {
    return this.http.get<CV[]>(this.apiUrl, {
      params: { positionPublicId }
    });
  }

  /**
   * Get a single CV by its public ID
   */
  getCV(cvPublicId: string): Observable<CV> {
    return this.http.get<CV>(`${this.apiUrl}/${cvPublicId}`);
  }
}
