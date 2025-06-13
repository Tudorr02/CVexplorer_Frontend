import { Component, inject, ViewChild } from '@angular/core';
import { ToastModule } from 'primeng/toast';
import { NotificationService } from '../_services/notification.service';
import { FileUpload, FileUploadEvent, FileUploadModule } from 'primeng/fileupload';
import { ButtonModule } from 'primeng/button';
import { CvService } from '../_services/cv.service';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { GmailAuthComponent } from '../gmail-auth/gmail-auth.component';
import { OutlookAuthComponent } from '../outlook-auth/outlook-auth.component';
import JSZip from 'jszip';
import { Tag } from 'primeng/tag';
import { ProgressSpinnerModule } from 'primeng/progressspinner';


@Component({
  selector: 'app-upload-cv',
  imports: [ProgressSpinnerModule ,OutlookAuthComponent,CommonModule,FileUploadModule, ButtonModule, ToastModule, GmailAuthComponent, Tag],
  templateUrl: './upload-cv.component.html',
  styleUrl: './upload-cv.component.css'
})
export class UploadCvComponent {

  @ViewChild('fu') fu!: FileUpload;
  private route = inject(ActivatedRoute);
  private cvService = inject(CvService);
  private notificationService = inject(NotificationService);  

  positionPublicId: string = this.route.snapshot.paramMap.get('publicId')!;
  cvCount = 0;
  fileSelected: boolean = false;
  uploading = false;



  onUpload(event: any) {
    const fileUploadEvent: FileUploadEvent = {
      originalEvent: event.originalEvent || null,
      files: event.files
    };
    const file = event.files?.[0]; 

    if (!file) {
      this.notificationService.showError('No file selected');
      return;
    }
    
    this.uploading = true;
    this.notificationService.showInfo('Uploading...');

    this.cvService.uploadCV(this.positionPublicId, file).subscribe({
      next: () => {
        this.notificationService.showSuccess('CV uploaded successfully!');
        this.fu.clear();
        this.fileSelected = false;
        this.uploading = false;
      },
      error: () => {
        this.notificationService.showError('CV upload failed!');
        this.fu.clear();
        this.fileSelected = false;
        this.uploading = false;
      }
    });
  }

  onSelect(event: any) {
    const file: File = event.files?.[0];
    this.cvCount = 0;
    if (!file) 
      return;

    this.fileSelected = true;

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
