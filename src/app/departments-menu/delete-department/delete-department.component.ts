import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { TreeNode } from 'primeng/api';
import { DepartmentService } from '../../_services/department.service';
import { NotificationService } from '../../_services/notification.service';
import { finalize } from 'rxjs';
import { ProgressSpinner } from 'primeng/progressspinner';
import { Router } from '@angular/router';
import { NodeSelectionService } from '../../_services/node-selection.service';
@Component({
  selector: 'app-delete-department',
  imports: [ProgressSpinner, ButtonModule],
  templateUrl: './delete-department.component.html',
  styleUrl: './delete-department.component.css'
})
export class DeleteDepartmentComponent {

  @Input() departmentNode?: TreeNode; // ✅ Input: Selected department to delete
  @Output() departmentDeleted = new EventEmitter<void>(); // ✅ Output: Notify parent when deleted

  departmentService = inject(DepartmentService);
  notificationService = inject(NotificationService);
  loading: boolean = false;
  private router = inject(Router);
  nodeService = inject(NodeSelectionService);

  deleteDepartment() {
    if (!this.departmentNode || !this.departmentNode.key) {
      this.notificationService.showError('Invalid department selected.');
      return;
    }

    const departmentId = Number(this.departmentNode.key); // ✅ Convert key to number

    this.loading = true;
    this.departmentService.deleteDepartment(departmentId)
      .pipe(finalize(() => setTimeout(() => { this.loading = false ; this.departmentDeleted.emit(); }, 1000)))
      .subscribe({
        next: () => {
          this.notificationService.showSuccess('Department deleted successfully');
          this.router.navigate(['/dashboard']);
          this.nodeService.setSelectedNodeNull(); // ✅ Clear selected node after deletion
        },
        error: (err) => {
          this.notificationService.showError('Failed to delete department. ' + err.error.message);
        }
      });
  }

}
