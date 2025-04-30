import { Component, inject, Input } from '@angular/core';
import { AvatarModule } from 'primeng/avatar';
import { RoundEntry } from '../../_models/round-entry';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { ButtonModule } from 'primeng/button';
import { RoundService } from '../../_services/round.service';
import { Evaluation } from '../../_models/evaluation';
import { NotificationService } from '../../_services/notification.service';
import { CommonModule } from '@angular/common';
import { Dialog } from 'primeng/dialog';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
@Component({
  selector: 'app-round-entry-card',
  imports: [AvatarModule,DragDropModule, ButtonModule, Dialog, CommonModule, FormsModule,InputTextModule],
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
  eval : Evaluation |undefined = undefined; // will hold the evaluation result
  viewEvaluation = false; // will hold the evaluation result
  pdfUrl?: SafeResourceUrl;
  sanitizer= inject(DomSanitizer);
  
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
    this.eval = undefined;
    this.pdfUrl = undefined;
  }

}
