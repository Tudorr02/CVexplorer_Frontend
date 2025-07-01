import { Component, EventEmitter, inject, Output } from '@angular/core';
import { ProgressSpinner } from 'primeng/progressspinner';
import { FormsModule } from '@angular/forms';
import { NotificationService } from '../../_services/notification.service';
import { DepartmentService } from '../../_services/department.service';
import { finalize } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { Department } from '../../_models/department';
import { MultiSelect } from 'primeng/multiselect';

@Component({
  selector: 'app-add-department',
  imports: [MultiSelect,InputTextModule,ButtonModule,FormsModule,ProgressSpinner],
  templateUrl: './add-department.component.html',
  styleUrl: './add-department.component.css'
})
export class AddDepartmentComponent {
 
  notificationService = inject(NotificationService);
  departmentService = inject(DepartmentService);
  loading: boolean = false;
  selectedUsers: number[] = []; 

  department:Department = { name: '', departmentAccesses: [] };
  @Output() departmentAdded = new EventEmitter<void>();


  init() {
    this.department = { name: '', departmentAccesses: [] };
    this.selectedUsers = [];
    this.loadDepartmentAccessTemplate();
  }

  addDepartment(newDepartment : Department) {
  
    if(!newDepartment.name.trim()) {
      this.notificationService.showWarning('Department name is required');
      return;
    }

    this.department.departmentAccesses = this.department.departmentAccesses?.map(user => ({
      userId: user.userId,
      userName: user.userName,
      hasAccess: this.selectedUsers.includes(user.userId) 
    }));

    
    this.loading = true;
    this.departmentService.createDepartment(newDepartment)
    .pipe(finalize(() => setTimeout(() => {this.loading = false }, 1000)))
    .subscribe({
      next: () => {
        this.departmentAdded.emit();
        this.notificationService.showSuccess('Department created successfully'); 
      },
      error: (err) => {
        this.notificationService.showError('Failed to create department. '+ err.error.message);
      }
    });
  
  }

  loadDepartmentAccessTemplate() {
    this.departmentService.getDepartmentAccessTemplate()
    .subscribe({
      next: (departmentAccesses) => {
        this.department.departmentAccesses = departmentAccesses;
      },
      error: (err) => {
        this.notificationService.showError('Failed to get department access template. '+ err.error.message);
      }
    });
  }
  
}
