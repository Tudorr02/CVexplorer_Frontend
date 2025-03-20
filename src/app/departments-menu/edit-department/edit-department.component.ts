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
import { MultiSelectModule } from 'primeng/multiselect';
import { DepartmentAccess } from '../../_models/department-access';

@Component({
  selector: 'app-edit-department',
  imports: [InputTextModule,ButtonModule,FormsModule,ProgressSpinner,MultiSelectModule],
  templateUrl: './edit-department.component.html',
  styleUrl: './edit-department.component.css'
})
export class EditDepartmentComponent {

  @Input() departmentNode!: TreeNode; // ✅ Input: Selected department to edit
  @Output() departmentEdited = new EventEmitter<void>(); // ✅ Output: Notify parent when Edit is done

  notificationService = inject(NotificationService);
  departmentService = inject(DepartmentService);

  loading: boolean = false;
  department: Department = { name: '', departmentAccesses: [] };
  selectedUsers:  number[] = []; // ✅ Store selected user IDs

  
  init() {
    if (!this.departmentNode) return;
    this.loadDepartmentData();
  }

  loadDepartmentData() {
    this.departmentService.getDepartment(Number(this.departmentNode.key))
    .subscribe({
      next: (department) => {
        this.department = department;
        this.selectedUsers = (department.departmentAccesses ?? [])
          .filter(access => access.hasAccess)
          .map(access => access.userId);
      },
      error: (err) => {
        this.notificationService.showError('Failed to get department. '+ err.error.message);
      }
    });
  }

  editDepartment(department : Department) {
    if(!department.name.trim()) {
      this.notificationService.showWarning('Department name is required');
      return;
    }

    if (department.name === this.departmentNode.label && this.isAccessUnchanged()) {
      this.notificationService.showWarning('No changes detected');
      return;
    }

    // ✅ Assign selected users to departmentAccesses
    department.departmentAccesses = this.selectedUsers.map(userId => ({
      userId,
      userName: this.department.departmentAccesses?.find(user => user.userId === userId)?.userName || '',
      hasAccess: true, // ✅ Mark as having access
    }));

    this.loading = true;
    this.departmentService.updateDepartment(Number(this.departmentNode.key),this.department)
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

  }

  // ✅ Helper method to check if department access changed
isAccessUnchanged(): boolean {
  const currentAccess = (this.department.departmentAccesses ?? []).filter(da => da.hasAccess).map(da => da.userId).sort();
  const selectedAccess = [...this.selectedUsers].sort();
  return JSON.stringify(currentAccess) === JSON.stringify(selectedAccess);
}

}
