import { Injectable, inject} from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
@Injectable({
  providedIn: 'root'
})
export class RoleService {

    private http =  inject(HttpClient);
    private apiUrl = `${environment.apiBaseUrl}/Roles`;

    getRoles(): Observable<string[]> {
      return this.http.get<string[]>(`${this.apiUrl}`); 
    }
}
