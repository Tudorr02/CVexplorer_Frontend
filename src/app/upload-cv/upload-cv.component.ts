import { Component, inject } from '@angular/core';
import { ToastModule } from 'primeng/toast';
import { NotificationService } from '../_services/notification.service';
import { FileUploadEvent, FileUploadModule } from 'primeng/fileupload';
import { ButtonModule } from 'primeng/button';
import { CvService } from '../_services/cv.service';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { GmailAuthComponent } from '../gmail-auth/gmail-auth.component';
import { GmailService } from '../_services/gmail.service';
import { OutlookAuthComponent } from '../outlook-auth/outlook-auth.component';
@Component({
  selector: 'app-upload-cv',
  imports: [OutlookAuthComponent,CommonModule,FileUploadModule, ButtonModule, ToastModule, GmailAuthComponent],
  templateUrl: './upload-cv.component.html',
  styleUrl: './upload-cv.component.css'
})
export class UploadCvComponent {


  private route = inject(ActivatedRoute);
  private cvService = inject(CvService);
  private notificationService = inject(NotificationService);  

  positionPublicId: string = this.route.snapshot.paramMap.get('publicId')!;
  gmailLabels: { id:string; name:string }[] = [];
  chosenLabel = '';

  onUpload(event: any) {
    const fileUploadEvent: FileUploadEvent = {
      originalEvent: event.originalEvent || null,
      files: event.files
    };
    const file = event.files?.[0]; // only one file allowed

    if (!file) {
      this.notificationService.showError('No file selected');
      return;
    }
  
    this.cvService.uploadCV(this.positionPublicId, file).subscribe({
      next: () => {
        this.notificationService.showSuccess('CV uploaded successfully!');
      },
      error: () => {
        this.notificationService.showError('CV upload failed!');
      }
    });
  }
  choose(event: Event, callback: () => void): void {
    event.preventDefault();
    callback(); // deschide file picker-ul intern al PrimeNG
  }
  

  formatSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

}
