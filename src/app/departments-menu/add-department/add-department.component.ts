import { Component, EventEmitter, inject, Output } from '@angular/core';
import { ProgressSpinner } from 'primeng/progressspinner';
import { FormsModule } from '@angular/forms';
import { NotificationService } from '../../_services/notification.service';
import { DepartmentService } from '../../_services/department.service';
import { finalize } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'app-add-department',
  imports: [InputTextModule,ButtonModule,FormsModule,ProgressSpinner],
  templateUrl: './add-department.component.html',
  styleUrl: './add-department.component.css'
})
export class AddDepartmentComponent {
 
  notificationService = inject(NotificationService);
  departmentService = inject(DepartmentService);
  loading: boolean = false;

  @Output() departmentAdded = new EventEmitter<void>();

  newDepartmentName: string = '';
  addDepartment(newDepartmentName: string) {
  
      if(!newDepartmentName.trim()) {
        this.notificationService.showWarning('Department name is required');
        return;
      }
  
      this.loading = true;
      this.departmentService.createDepartment(newDepartmentName)
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
  
      this.newDepartmentName = '';
  }
  
}
