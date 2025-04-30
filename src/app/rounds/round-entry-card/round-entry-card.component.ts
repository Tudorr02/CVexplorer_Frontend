import { Component, inject, Input } from '@angular/core';
import { AvatarModule } from 'primeng/avatar';
import { RoundEntry } from '../../_models/round-entry';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { ButtonModule } from 'primeng/button';
import { RoundService } from '../../_services/round.service';
import { CvEvaluationResult, Evaluation } from '../../_models/evaluation';
import { NotificationService } from '../../_services/notification.service';
import { CommonModule } from '@angular/common';
import { Dialog } from 'primeng/dialog';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumber } from 'primeng/inputnumber';
import { TextareaModule } from 'primeng/textarea';
import { EvaluationService } from '../../_services/evaluation.service';
@Component({
  selector: 'app-round-entry-card',
  imports: [TextareaModule,InputNumber,AvatarModule,DragDropModule, ButtonModule, Dialog, CommonModule, FormsModule,InputTextModule],
  templateUrl: './round-entry-card.component.html',
  styleUrl: './round-entry-card.component.css'
})
export class RoundEntryCardComponent {

updateSkills($event: any) {
throw new Error('Method not implemented.');
}

  @Input({ required: true }) entry!: RoundEntry;

  roundService = inject(RoundService);
  notificationService = inject(NotificationService); // if you have a service to show notifications
  evaluationService = inject(EvaluationService); // if you have a service to handle evaluations
  eval! : Evaluation; // will hold the evaluation result
  viewEvaluation = false; // will hold the evaluation result
  pdfUrl?: SafeResourceUrl;
  sanitizer= inject(DomSanitizer);
  editMode : boolean= false; // flag to indicate if the edit mode is active
  getEvaluationResult( entryId: number) {
    this.roundService.getEvaluation(entryId).subscribe(
      {
        next: (evaluation) => {
          this.eval = evaluation; // set the evaluation result
          const dataUrl = `data:application/pdf;base64,${evaluation.fileData}`;
          this.pdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(dataUrl);
          this.viewEvaluation = true; // open the dialog
        },
        error: (error) => {
          console.error('Error loading evaluation', error);
        }
      }
    );
    
  }

  onDialogHide() {
    this.viewEvaluation = false;
    this.pdfUrl = undefined;
  }

  editEvaluation() {
    this.editMode = true; // set the edit mode to true
  }

  cancelEdit(): void {
    this.editMode = false;   // go back to view-only mode
    // optionally: reset the form here
  }

  updateEvaluation(cvPublicId : string, dto : CvEvaluationResult): void {
   this.evaluationService.updateEvaluation(cvPublicId, dto ).subscribe(
    {
      next: (response) => {
        this.notificationService.showSuccess('Evaluation updated successfully!');
        this.editMode = false; // go back to view-only mode
        if (this.eval) {
          this.eval.evaluation = response; // refresh the evaluation result
        }
      },
      error: (error) => {
        this.notificationService.showError('Error updating evaluation!');
        console.error('Error updating evaluation', error);
      }
    });
  }
}
