import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { map, Observable } from 'rxjs';
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

 
  getAllCVs(positionPublicId?: string, departmentId?: number): Observable<CV[]> {
    let params = new HttpParams();

    if (positionPublicId) {
      params = params.set('positionPublicId', positionPublicId);
    }
    if (departmentId != null) {
      params = params.set('departmentId', departmentId.toString());
    }

    return this.http.get<any[]>(`${this.apiUrl}`, { params }).pipe(
      map(cvs =>
        cvs.map(cv => ({
          ...cv,
          // parse the ISO string into a real Date
          uploadedAt: new Date(cv.uploadedAt)
        }))
      )
    );
  }


  getCV(cvPublicId: string): Observable<CV> {
    return this.http.get<CV>(`${this.apiUrl}/${cvPublicId}`);
  }

  deleteCVs(
    cvPublicIds: string[],
    positionPublicId?: string,
    departmentId?: number
  ): Observable<boolean> {
    // Construim query-params
    let params = new HttpParams();
    if (positionPublicId) {
      params = params.set('positionPublicId', positionPublicId);
    }
    if (departmentId != null) {
      params = params.set('departmentId', departmentId.toString());
    }

    // Angular HttpClient suportă DELETE cu body din v7+:
    return this.http.delete<boolean>(this.apiUrl, {
      params,
      body: cvPublicIds
    });
  }

  
}
