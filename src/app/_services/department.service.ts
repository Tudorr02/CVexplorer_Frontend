import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { DepartmentTreeNode } from '../_models/departmentTreeNode';
import { Department } from '../_models/department';

@Injectable({
  providedIn: 'root'
})
export class DepartmentService {

  
  private http =  inject(HttpClient);
  private apiUrl = `${environment.apiBaseUrl}/Departments`;

  getDepartmentsTree(): Observable<DepartmentTreeNode[]> {
    return this.http.get<DepartmentTreeNode[]>(`${this.apiUrl}/DepartmentsTree`);
  }

  /** ✅ Get the list of departments (Requires HRLeader role) */
  getDepartments(): Observable<Department[]> {
    return this.http.get<Department[]>(`${this.apiUrl}`);
  }

  /** ✅ Create a new department */
  createDepartment(departmentName: string): Observable<Department> {
    return this.http.post<Department>(`${this.apiUrl}?departmentName=${departmentName}`, {});
  }

  /** ✅ Update an existing department */
  updateDepartment(departmentId: number, dto: Department): Observable<Department> {
    return this.http.put<Department>(`${this.apiUrl}/${departmentId}`, dto);
  }

  /** ✅ Delete a department */
  deleteDepartment(departmentId: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${departmentId}`);
  }
  
}
