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
import { AccordionModule } from 'primeng/accordion';

@Component({
  selector: 'app-round-entry-card',
  imports: [AccordionModule,TextareaModule,InputNumber,AvatarModule,DragDropModule, ButtonModule, Dialog, CommonModule, FormsModule,InputTextModule],
  templateUrl: './round-entry-card.component.html',
  styleUrl: './round-entry-card.component.css'
})
export class RoundEntryCardComponent {

updateSkills($event: any) {
throw new Error('Method not implemented.');
}

  @Input({ required: true }) entry!: RoundEntry;


  roundService = inject(RoundService);
  notificationService = inject(NotificationService); 
  evaluationService = inject(EvaluationService); 
  eval! : Evaluation; 
  viewEvaluation = false; 
  pdfUrl?: SafeResourceUrl;
  sanitizer= inject(DomSanitizer);
  editMode : boolean= false;
  evaluationTabs: {  score : number ,value : string , title: string; body: string | string[] | number ; positionBody: string | string[] | number }[] = [];

  getEvaluationResult( entryId: number) {
    this.roundService.getEvaluation(entryId).subscribe(
      {
        next: (evaluation) => {
          this.eval = evaluation; 
          const ev = evaluation.evaluation;
          const positionData = evaluation.positionData;
          this.evaluationTabs = [
          {
            score: ev.requiredSkills.score,         // or 0
            value : 'required-skills',                 // or 0
            title : 'Required skills',
            body  : ev.requiredSkills.scraped.length
                    ? ev.requiredSkills.scraped
                    : '— none —',
            positionBody: positionData.requiredSkills.length
                    ? positionData.requiredSkills
                    : '— none —'
          },
          {
            score: ev.niceToHave.score,             // or 1
            value : 'nice-to-have',                    // or 1
            title : 'Nice to have',
            body  : ev.niceToHave.scraped.length
                    ? ev.niceToHave.scraped
                    : '— none —',
            positionBody: positionData.niceToHave.length
                    ? positionData.niceToHave
                    : '— none —'

          },
          {score: ev.languages.score , value: 'languages',              title: 'Languages',          body: ev.languages.value , positionBody: positionData.languages.length
                    ? positionData.languages : '— none —' },
          {score:ev.certifications.score ,value: 'certifications',         title: 'Certifications',     body: ev.certifications.scraped, positionBody: positionData.certifications.length
                    ? positionData.certifications : '— none —' },
          {score:ev.responsibilities.score, value: 'responsibilities',       title: 'Responsibilities',   body: ev.responsibilities.scraped , positionBody: positionData.responsibilities.length
                    ? positionData.responsibilities : '— none —' },
          {score:ev.minimumExperienceMonths.score ,value: 'experience',             title: 'Minimum experience', body: ev.minimumExperienceMonths.value + ' months', positionBody: positionData.minimumExperienceMonths + ' months' },  
          {score:ev.minimumEducationLevel.score ,value: 'education-level',        title: 'Education level',    body: ev.minimumEducationLevel.value , positionBody: positionData.minimumEducationLevel },
          {score:ev.level.score, value: 'candidate-level',         title: 'Candidate level',     body: ev.level.value , positionBody: positionData.level }
        ];

          const dataUrl = `data:application/pdf;base64,${evaluation.fileData}`;
          this.pdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(dataUrl);
          this.viewEvaluation = true; 
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
    this.editMode = true;
  }

  cancelEdit(): void {
    this.editMode = false;

  }

  updateEvaluation(cvPublicId : string, dto : CvEvaluationResult): void {
   this.evaluationService.updateEvaluation(cvPublicId, dto ).subscribe(
    {
      next: (response) => {
        this.notificationService.showSuccess('Evaluation updated successfully!');
        this.editMode = false; 
        if (this.eval) {
          this.eval.evaluation = response; 
        }
      },
      error: (error) => {
        this.notificationService.showError('Error updating evaluation!');
        console.error('Error updating evaluation', error);
      }
    });
  }
}
