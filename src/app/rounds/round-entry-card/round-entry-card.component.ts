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
import { CvEvaluationComponent } from '../../cv-evaluation/cv-evaluation.component';
@Component({
  selector: 'app-round-entry-card',
  imports: [CvEvaluationComponent,Dialog,AccordionModule,TextareaModule,InputNumberModule,AvatarModule,DragDropModule, ButtonModule, CommonModule, FormsModule,InputTextModule],
  templateUrl: './round-entry-card.component.html',
  styleUrl: './round-entry-card.component.css'
})
export class RoundEntryCardComponent {

  viewCv: boolean = false;
  @Input({ required: true }) entry!: RoundEntry;

  onDialogHide() {
    this.viewCv = false;
  }
}
