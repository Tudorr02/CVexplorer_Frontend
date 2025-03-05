import { Injectable , inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { UserManagement } from '../_models/userManagement';
import { UserEnrollment} from '../_models/userEnrollment';
import { Observable } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class AdminService {

  private http =  inject(HttpClient);
  private apiUrl = `${environment.apiBaseUrl}/Admin`;

  getUsers(): Observable<UserManagement[]> {
    return this.http.get<UserManagement[]>(`${this.apiUrl}/Users`);
  }

  getUser(username: string): Observable<UserManagement> {
    return this.http.get<UserManagement>(`${this.apiUrl}/Users/${username}`);
  }

  updateUser(username: string, dto: UserManagement): Observable<UserManagement> {
    return this.http.put<UserManagement>(`${this.apiUrl}/Users/${username}`, dto);
  }
 
  deleteUser(username: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/Users/${username}`);
  }

  enrollUser(dto: UserEnrollment): Observable<{ username: string; token: string }> {
    return this.http.post<{ username: string; token: string }>(`${this.apiUrl}/Users`, dto);
  }

  getRoles(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/Roles`);
  }
}
