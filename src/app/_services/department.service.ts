import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { DepartmentTreeNode } from '../_models/departmentTreeNode';

@Injectable({
  providedIn: 'root'
})
export class DepartmentService {

  
  private http =  inject(HttpClient);
  private apiUrl = `${environment.apiBaseUrl}/Departments`;

  getDepartmentsTree(): Observable<DepartmentTreeNode[]> {
    return this.http.get<DepartmentTreeNode[]>(`${this.apiUrl}/DepartmentsTree`);
  }

  
}
