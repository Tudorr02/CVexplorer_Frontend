import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { TreeNode } from 'primeng/api';
import { PositionService } from '../../_services/position.service';
import { NotificationService } from '../../_services/notification.service';
import { finalize } from 'rxjs';
import { ProgressSpinner } from 'primeng/progressspinner';
import { Router } from '@angular/router';
import { NodeSelectionService } from '../../_services/node-selection.service';

@Component({
  selector: 'app-delete-position',
  imports: [ProgressSpinner, ButtonModule],
  templateUrl: './delete-position.component.html',
  styleUrl: './delete-position.component.css'
})
export class DeletePositionComponent {
  @Input() positionNode!: any;
  @Output() positionDeleted = new EventEmitter<void>();

 
  positionService = inject(PositionService);
  notificationService = inject(NotificationService);
  loading: boolean = false;
   private router = inject(Router);
    nodeService = inject(NodeSelectionService);

  confirmDelete() {
    if (!this.positionNode?.data?.publicId) {
      this.notificationService.showError('Invalid position selected.');
      return;
    }

    const publicId = this.positionNode.data.publicId;

    this.loading = true;
    this.positionService.deletePosition(publicId)
      .pipe(finalize(() => setTimeout(() => {
        this.loading = false;
        this.positionDeleted.emit(); // 🔁 emite după finalizare
      }, 1000)))
      .subscribe({
        next: () => {
          this.notificationService.showSuccess('Position deleted successfully');
          this.router.navigate(['/dashboard']);
          this.nodeService.setSelectedNodeNull(); 
        },
        error: (err) => {
          this.notificationService.showError('Failed to delete position. ' + err.error?.message);
        }
      });
  }
}
