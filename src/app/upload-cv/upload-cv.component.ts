import { Component, inject } from '@angular/core';
import { ToastModule } from 'primeng/toast';
import { NotificationService } from '../_services/notification.service';
import { FileUploadEvent, FileUploadModule } from 'primeng/fileupload';
import { ButtonModule } from 'primeng/button';
import { CvService } from '../_services/cv.service';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { GmailAuthComponent } from '../gmail-auth/gmail-auth.component';
import { OutlookAuthComponent } from '../outlook-auth/outlook-auth.component';
import JSZip from 'jszip';
import { Tag } from 'primeng/tag';

@Component({
  selector: 'app-upload-cv',
  imports: [OutlookAuthComponent,CommonModule,FileUploadModule, ButtonModule, ToastModule, GmailAuthComponent, Tag],
  templateUrl: './upload-cv.component.html',
  styleUrl: './upload-cv.component.css'
})
export class UploadCvComponent {


  private route = inject(ActivatedRoute);
  private cvService = inject(CvService);
  private notificationService = inject(NotificationService);  

  positionPublicId: string = this.route.snapshot.paramMap.get('publicId')!;
  cvCount = 0;


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

  onSelect(event: any) {
    const file: File = event.files?.[0];
    this.cvCount = 0;
    if (!file) 
      return;


    const name = file.name.toLowerCase();
    if (file.type === 'application/pdf' || name.endsWith('.pdf')) {
      this.cvCount = 1;
    } 
    else if (name.endsWith('.zip') || name.endsWith('.rar')) {
      JSZip.loadAsync(file).then(zip => {
        let count = 0;
        zip.forEach((relativePath, zipEntry) => {
          if (!zipEntry.dir && zipEntry.name.toLowerCase().endsWith('.pdf')) {
            count++;
          }
        });
        this.cvCount = count;
      });
    } 
    else {
      this.cvCount = 0;
    }
  
  }

  onChoose(event: Event, callback: () => void): void {
    event.preventDefault();
    callback();
  }
  

  formatSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

}
