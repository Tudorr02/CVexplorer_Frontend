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

  // ✅ Get a position by publicId
  getPosition(publicId: string): Observable<Position> {
    return this.http.get<Position>(`${this.apiUrl}/${publicId}`);
  }

  // ✅ Update a position
  updatePosition(publicId: string, dto: Position): Observable<Position> {
    return this.http.put<Position>(`${this.apiUrl}/${publicId}`, dto);
  }

  // ✅ Delete a position
  deletePosition(publicId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${publicId}`);
  }
}
