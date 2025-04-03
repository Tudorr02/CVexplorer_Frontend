import { Component, inject } from '@angular/core';
import { ToastModule } from 'primeng/toast';
import { NotificationService } from '../_services/notification.service';
import { FileUploadEvent, FileUploadModule } from 'primeng/fileupload';
import { ButtonModule } from 'primeng/button';


@Component({
  selector: 'app-upload-cv',
  imports: [FileUploadModule, ButtonModule, ToastModule],
  templateUrl: './upload-cv.component.html',
  styleUrl: './upload-cv.component.css'
})
export class UploadCvComponent {

  notificationService = inject(NotificationService);

  onUpload(event: FileUploadEvent) {
    this.notificationService.showSuccess('CVs uploaded successfully!');
  }
}
