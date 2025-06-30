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
import { CvEvaluationComponent } from '../cv-evaluation/cv-evaluation.component';
import { Tag } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { DeleteCvResult } from '../_services/cv.service'; // Import the interface for delete result
@Component({
  selector: 'app-explore-cv',
  imports: [TooltipModule,Tag,CvEvaluationComponent,ProgressSpinner, DialogModule, TableModule, ButtonModule, CommonModule, IconField, InputIcon, InputTextModule, FormsModule, CvEvaluationComponent],
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
  evaluatedCv?: CV;

  viewCvEvaluation: boolean = false;
  viewDeleteDialog: boolean = false;


  @ViewChild('dtCVs') dt!: Table;
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
    this.ro = new ResizeObserver(() => this.updateHeight());
    this.ro.observe(this.wrapper.nativeElement);
  }

  private updateHeight(): void {
    if (!this.wrapper) return;
    const h = this.wrapper.nativeElement.offsetHeight;
    this.scrollHeight = `${Math.max(h - 65, 200)}px`;
    this.cdr.detectChanges();                         
  }

  ngOnDestroy(): void {
    this.ro?.disconnect();
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

    const delete$ = this.cvService
      .deleteCVs(toDelete, this.positionPublicId, this.departmentId)
      .pipe(
        catchError(err => {
          this.notificationService.showError(`Failed to delete Documents`);
          return of({ success: false } as DeleteCvResult);
        })
      );

    const spinnerMin$ = timer(this.MIN_SPINNER_MS);

    forkJoin([delete$, spinnerMin$])
      .pipe(
        finalize(() => {
          this.loading = false;
        })
      )
      .subscribe(([result]) => {
        if (result.success) {

          if(!result.message) {
            this.notificationService.showSuccess('Documents deleted successfully');
          }
          else {
            this.notificationService.showWarning(result.message);
          }
        } else {
          this.notificationService.showInfo('No documents were deleted');
        }

        this.selectedCVs = [];
        this.loadCvs();
        this.dt.clear();
        this.onDialogHide();
      });
  }

  openEvaluationDialog(cv: CV) { 
    this.evaluatedCv = cv;
    this.viewCvEvaluation = true;
   
  }

  onDialogHide() {
    this.viewDeleteDialog = false;
    this.globalFilter = '';
    this.selectedCVs = [];
    this.viewCvEvaluation = false;
    this.evaluatedCv = undefined;
  }

  openDeleteDialog() {
   if(this.selectedCVs.length == 0) {
      this.notificationService.showError('Select at least one CV to delete');
      return;
   }

    this.viewDeleteDialog = true;
  }
}
