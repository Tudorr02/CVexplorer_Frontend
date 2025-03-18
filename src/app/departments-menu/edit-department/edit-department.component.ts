import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { ProgressSpinner } from 'primeng/progressspinner';
import { FormsModule } from '@angular/forms';
import { NotificationService } from '../../_services/notification.service';
import { DepartmentService } from '../../_services/department.service';
import { finalize } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TreeNode } from 'primeng/api';
import { Department } from '../../_models/department';
import { Position } from '../../_models/position';

@Component({
  selector: 'app-edit-department',
  imports: [InputTextModule,ButtonModule,FormsModule,ProgressSpinner],
  templateUrl: './edit-department.component.html',
  styleUrl: './edit-department.component.css'
})
export class EditDepartmentComponent {

  @Input() departmentNode!: TreeNode; // ✅ Input: Selected department to edit
  @Output() departmentEdited = new EventEmitter<void>(); // ✅ Output: Notify parent when Edit is done

  notificationService = inject(NotificationService);
  departmentService = inject(DepartmentService);

  loading: boolean = false;
  updatedDepartmentName: string = '';
  
  ngOnChanges() {
    this.updatedDepartmentName = this.departmentNode.label || '';
  }

  editDepartment(updatedDepartmentName: string) {
    if(!updatedDepartmentName.trim()) {
      this.notificationService.showWarning('Department name is required');
      return;
    }

    if(updatedDepartmentName === this.departmentNode.label) {
      this.notificationService.showWarning('Department name is the same');
      return;
    }

    this.loading = true;
    this.departmentService.updateDepartment(Number(this.departmentNode.key),{ name: this.updatedDepartmentName } as Department)
    .pipe(finalize(() => setTimeout(() => {this.loading = false }, 1000)))
    .subscribe({
      next: () => {
        this.departmentEdited.emit();
        this.notificationService.showSuccess('Department Updated successfully');
        
      },
      error: (err) => {
        this.notificationService.showError('Failed to update department. '+ err.error.message);
      }
    });

    this.updatedDepartmentName = ''; 
  }

}
