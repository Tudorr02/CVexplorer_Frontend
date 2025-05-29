import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
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
import { InputNumberModule } from 'primeng/inputnumber';
import { TextareaModule } from 'primeng/textarea';
import { EvaluationService } from '../../_services/evaluation.service';
import { AccordionModule } from 'primeng/accordion';
import { Position } from '../../_models/position';

@Component({
  selector: 'app-round-entry-card',
  imports: [AccordionModule,TextareaModule,InputNumberModule,AvatarModule,DragDropModule, ButtonModule, Dialog, CommonModule, FormsModule,InputTextModule],
  templateUrl: './round-entry-card.component.html',
  styleUrl: './round-entry-card.component.css'
})
export class RoundEntryCardComponent {

updateSkills($event: any) {
throw new Error('Method not implemented.');
}

  @Input({ required: true }) entry!: RoundEntry;
  @Output() updated = new EventEmitter<void>();

  roundService = inject(RoundService);
  notificationService = inject(NotificationService); 
  evaluationService = inject(EvaluationService); 


  evaluation!: Evaluation;
  tempCardData! : { 
    evaluation: CvEvaluationResult;
    score: number;
  };
 
  evaluationTabs: { key: Exclude<keyof CvEvaluationResult, 'candidateName'>,value : string , title: string; body: string | string[] | number ; positionBody: string | string[] | number }[] = [];

  pdfUrl?: SafeResourceUrl;
  sanitizer= inject(DomSanitizer);
  editMode : boolean= false;
  viewEvaluation = false; 


  getEvaluationResult( entryId: number) {
    this.roundService.getEvaluation(entryId).subscribe(
      {
        next: (evaluation) => {
          this.evaluation = evaluation;
          this.loadEvaluationTabs(this.evaluation.evaluation, this.evaluation.positionData);

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

  loadEvaluationTabs(ev : CvEvaluationResult , pd: Position): void {
    this.evaluationTabs=[
    {
      key: 'requiredSkills',
      value: '0',
      title: 'Required skills',
      body: ev.requiredSkills.scraped.length
        ? ev.requiredSkills.scraped
        : '— none —',
      positionBody: pd.requiredSkills.length
        ? pd.requiredSkills
        : '— none —'
    },
    {
      key: 'niceToHave',
      value: '1',
      title: 'Nice to have',
      body: ev.niceToHave.scraped.length
        ? ev.niceToHave.scraped
        : '— none —',
      positionBody: pd.niceToHave.length
        ? pd.niceToHave
        : '— none —'
    },
    {
      key: 'languages',
      value: '2',
      title: 'Languages',
      body: ev.languages.value,
      positionBody: pd.languages.length
        ? pd.languages
        : '— none —'
    },
    {
      key: 'certifications',
      value: '3',
      title: 'Certifications',
      body: ev.certifications.scraped.length
        ? ev.certifications.scraped
        : '— none —',
      positionBody: pd.certifications.length
        ? pd.certifications
        : '— none —'
    },
    {
      key: 'responsibilities',
      value: '4',
      title: 'Responsibilities',
      body: ev.responsibilities.scraped.length
        ? ev.responsibilities.scraped
        : '— none —',
      positionBody: pd.responsibilities.length
        ? pd.responsibilities
        : '— none —'
    },
    {
      key: 'minimumExperienceMonths',
      value: '5',
      title: 'Minimum experience',
      body: `${ev.minimumExperienceMonths.value} months`,
      positionBody: `${pd.minimumExperienceMonths} months`
    },
    {
      key: 'minimumEducationLevel',
      value: '6',
      title: 'Education level',
      body: ev.minimumEducationLevel.value,
      positionBody: pd.minimumEducationLevel
    },
    {
      key: 'level',
      value: '7',
      title: 'Candidate level',
      body: ev.level.value,
      positionBody: pd.level
    },
    ];
  }

  recalculateScore() {
    if (!this.tempCardData) return;

    const ev = this.tempCardData.evaluation;
    const w  = this.evaluation.positionData.weights; 
    let total = 0;
    total += ev.requiredSkills.score          * w.requiredSkills;
    total += ev.niceToHave.score              * w.niceToHave;
    total += ev.languages.score               * w.languages;
    total += ev.certifications.score          * w.certifications;
    total += ev.responsibilities.score        * w.responsibilities;
    total += ev.minimumExperienceMonths.score * w.experienceMonths;
    total += ev.level.score                   * w.level;
    total += ev.minimumEducationLevel.score   * w.minimumEducation;

    this.tempCardData.score = Math.round(total/100);
  }
 
  onDialogHide() {
    this.viewEvaluation = false;
    this.pdfUrl = undefined;
    this.evaluationTabs = [];
    
  }


  editEvaluation() {
    this.tempCardData={
      evaluation: JSON.parse(JSON.stringify(this.evaluation.evaluation)),
      score: this.entry.score || 0
    }
    this.editMode = true;
  }

  cancelEdit(): void {
     this.tempCardData={
      evaluation: JSON.parse(JSON.stringify(this.evaluation.evaluation)),
      score: this.entry.score || 0
    }
    this.editMode = false;
  }

  updateEvaluation(cvPublicId : string, dto : CvEvaluationResult): void {
    
    this.evaluationService.updateEvaluation(cvPublicId, dto ).subscribe(
      {
        next: (response) => {
          this.notificationService.showSuccess('Evaluation updated successfully!');
          this.entry.score =  this.tempCardData.score;
          this.editMode = false; 
          this.evaluation.evaluation = response
          this.updated.emit();
        },
        error: (error) => {
          this.notificationService.showError('Error updating evaluation!');
          console.error('Error updating evaluation', error);
        }
      });
  }
}
