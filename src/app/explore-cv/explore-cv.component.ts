import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
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
import { ProgressSpinner } from 'primeng/progressspinner';
import { timer, forkJoin, of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
@Component({
  selector: 'app-explore-cv',
  imports: [ProgressSpinner,DialogModule,TableModule, ButtonModule, CommonModule, IconField, InputIcon, InputTextModule, FormsModule],
  templateUrl: './explore-cv.component.html',
  styleUrl: './explore-cv.component.css'
})
export class ExploreCvComponent implements OnInit , AfterViewInit , OnDestroy {

  private route = inject(ActivatedRoute);
  private cvService = inject(CvService);
  private notificationService = inject(NotificationService);
  private sanitizer = inject(DomSanitizer);
  private readonly MIN_SPINNER_MS = 500;

  positionPublicId?: string;
  departmentId?:     number;
  loading: boolean = false;

  cvs: CV[] = [];
  selectedCVs: CV[] = [];

  viewCV: boolean = false; // For the dialog
  viewDeleteDialog: boolean = false; // For the delete dialog
  inspectedCV: CV | undefined; // For the dialog

  pdfUrl?: SafeResourceUrl;


  @ViewChild('dtCVs') dt!: Table; // Reference to PrimeNG Table
  globalFilter: string = '';
  
  cdr = inject(ChangeDetectorRef);
  private ro?: ResizeObserver;   
  @ViewChild('wrapper', { static: false })
  wrapper!: ElementRef<HTMLElement>;
  scrollHeight = '0px'; 

  ngOnInit() {

    this.route.queryParamMap.subscribe(qp => {
        this.positionPublicId = qp.get('positionPublicId') ?? undefined;
        const dept = qp.get('departmentId');
        this.departmentId = dept != null ? Number(dept) : undefined;   
        this.loadCvs();
        
    });
  }

  

  ngAfterViewInit(): void {
    this.updateHeight();

    // dacă vrei să reacţionezi când utilizatorul redimensionează fereastra
    this.ro = new ResizeObserver(() => this.updateHeight());
    this.ro.observe(this.wrapper.nativeElement);
  }

  private updateHeight(): void {
    if (!this.wrapper) return;
    const h = this.wrapper.nativeElement.offsetHeight;  // pixeli incluşi padding
    this.scrollHeight = `${Math.max(h - 65, 500)}px`;   // -65 px header intern
    this.cdr.detectChanges();                           // forţează aplicaţia
  }

  ngOnDestroy(): void {
    this.ro?.disconnect();   // curăţă observaţia de resize
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
    if (!this.selectedCVs.length) {
      this.notificationService.showError('Select at least one CV to delete');
      return;
    }

    this.loading = true;
    const toDelete = this.selectedCVs.map(cv => cv.publicId!);

    // 1) stream-ul HTTP, cu catchError pentru a emite false în loc de eroare
    const delete$ = this.cvService
      .deleteCVs(toDelete, this.positionPublicId, this.departmentId)
      .pipe(
        catchError(err => {
          // notificăm eroarea, dar continuăm stream-ul cu `false`
          this.notificationService.showError('Failed to delete CVs');
          return of(false);
        })
      );

    // 2) timer-ul care emite după MIN_SPINNER_MS și apoi se completează
    const spinnerMin$ = timer(this.MIN_SPINNER_MS);

    // 3) așteptăm ambele să se termine
    forkJoin([delete$, spinnerMin$])
      .pipe(
        finalize(() => {
          // se execută când *ambele* s-au completat
          this.loading = false;
        })
      )
      .subscribe(([success]) => {
        // notificăm rezultatul delete$
        if (success) {
          this.notificationService.showSuccess('Documents deleted successfully');
        } else {
          this.notificationService.showInfo('No documents were deleted');
        }

        // cleanup-ul comun
        this.selectedCVs = [];
        this.loadCvs();
        this.dt.clear();
        this.onDialogHide();
      });
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
    this.viewDeleteDialog = false;
    this.globalFilter = '';
    this.inspectedCV = undefined;
    this.pdfUrl = undefined;
  }

  openDeleteDialog() {
   if(this.selectedCVs.length == 0) {
      this.notificationService.showError('Select at least one CV to delete');
      return;
   }
    this.viewDeleteDialog = true;
  }
}
