import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CvService } from '../_services/cv.service';
import { NotificationService } from '../_services/notification.service';
import { CV } from '../_models/cv';
import { Table } from 'primeng/table';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
@Component({
  selector: 'app-explore-cv',
  imports: [DialogModule,TableModule, ButtonModule, CommonModule, IconField, InputIcon, InputTextModule, FormsModule],
  templateUrl: './explore-cv.component.html',
  styleUrl: './explore-cv.component.css'
})
export class ExploreCvComponent implements OnInit{

  private route = inject(ActivatedRoute);
  private cvService = inject(CvService);
  private notificationService = inject(NotificationService);
  private sanitizer = inject(DomSanitizer);

  positionPublicId?: string;
  departmentId?:     number;

  cvs: CV[] = [];
  selectedCVs: CV[] = [];

  viewCV: boolean = false; // For the dialog
  inspectedCV: CV | undefined; // For the dialog

  pdfUrl?: SafeResourceUrl;


  @ViewChild('dtCVs') dt!: Table; // Reference to PrimeNG Table
  globalFilter: string = '';
  ngOnInit() {
    // snapshot is fine if you don't care about param changes
    this.positionPublicId = this.route.snapshot.paramMap.get('publicId') ?? undefined;
    this.departmentId     = this.route.snapshot.paramMap.get('id') != null
                            ? Number(this.route.snapshot.paramMap.get('id'))
                            : undefined;

    this.loadCvs();
  }

  private loadCvs() {
    this.cvService
      .getAllCVs(this.positionPublicId, this.departmentId)
      .subscribe({
        next: cvs => {
          this.cvs = cvs;
        },
        error: err => {
          console.error('Error loading CVs', err);
          this.notificationService.showError('Failed to load CVs');
        }
      });
  }

  filterGlobal() {
    this.dt.filterGlobal(this.globalFilter, 'contains');
  }

  deleteSelected() {
    const toDelete = this.selectedCVs.map(cv => cv.publicId!);
    // this.cvService.deleteMany(toDelete).subscribe({
    //   next: () => {
    //     this.notification.showSuccess('Deleted successfully');
    //     this.selectedCVs = [];
    //     this.loadAll();
    //   },
    //   error: err => this.notification.showError('Delete failed', err)
    // });
  }

  getCV(cvPublicId: string) {
    this.cvService.getCV(cvPublicId).subscribe({
      next: cv => {
        console.log('CV details:', cv);
        // Handle the CV details as needed
        this.inspectedCV = cv; // Set the inspected CV
        const dataUrl = `data:application/pdf;base64,${cv.fileData}`;
        this.pdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(dataUrl);
        this.viewCV = true; // Open the dialog

      },
      error: err => {
        console.error('Error loading CV', err);
        this.notificationService.showError('Failed to load CV');
      }
    });
  }

  onDialogHide() {
    this.viewCV = false;
    this.inspectedCV = undefined;
    this.pdfUrl = undefined;
  }
}
