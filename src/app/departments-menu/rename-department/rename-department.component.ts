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
  selector: 'app-rename-department',
  imports: [InputTextModule,ButtonModule,FormsModule,ProgressSpinner],
  templateUrl: './rename-department.component.html',
  styleUrl: './rename-department.component.css'
})
export class RenameDepartmentComponent {

  @Input() departmentNode!: TreeNode; // ✅ Input: Selected department to rename
  @Output() departmentRenamed = new EventEmitter<void>(); // ✅ Output: Notify parent when renamed

  notificationService = inject(NotificationService);
  departmentService = inject(DepartmentService);

  loading: boolean = false;
  updatedDepartmentName: string = '';
  
  ngOnChanges() {
    this.updatedDepartmentName = this.departmentNode.label || '';
  }

  renameDepartment(updatedDepartmentName: string) {
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
        this.departmentRenamed.emit();
        this.notificationService.showSuccess('Department renamed successfully');
        
      },
      error: (err) => {
        this.notificationService.showError('Failed to rename department. '+ err.error.message);
      }
    });

    this.updatedDepartmentName = ''; 
  }

}
