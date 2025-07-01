import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { Position } from '../_models/position';


@Injectable({
  providedIn: 'root'
})
export class PositionService {

  private http =  inject(HttpClient);
  private apiUrl = `${environment.apiBaseUrl}/Positions`;

  createPosition(departmentId: number, dto: Position): Observable<Position> {
    const url = `${environment.apiBaseUrl}/Departments/${departmentId}/Positions`;
    return this.http.post<Position>(url, dto);
  }

  getPosition(publicId: string): Observable<Position> {
    return this.http.get<Position>(`${this.apiUrl}/${publicId}`);
  }

  updatePosition(publicId: string, dto: Position): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${publicId}`, dto);
  }

  deletePosition(publicId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${publicId}`);
  }
}
