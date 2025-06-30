import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { AvatarModule } from 'primeng/avatar';
import { RoundEntry } from '../../_models/round-entry';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { ButtonModule } from 'primeng/button';
import { NotificationService } from '../../_services/notification.service';
import { CommonModule } from '@angular/common';
import { Dialog } from 'primeng/dialog';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { TextareaModule } from 'primeng/textarea';
import { AccordionModule } from 'primeng/accordion';
import { CvEvaluationComponent } from '../../cv-evaluation/cv-evaluation.component';
import { ConfirmPopupModule } from 'primeng/confirmpopup';
import { ToastModule } from 'primeng/toast';
import { RoundEntriesService } from '../../_services/round-entries.service';
import { ConfirmationService, MessageService } from 'primeng/api';


@Component({
  selector: 'app-round-entry-card',
  imports: [ToastModule,ConfirmPopupModule,CvEvaluationComponent,Dialog,AccordionModule,TextareaModule,InputNumberModule,AvatarModule,DragDropModule, ButtonModule, CommonModule, FormsModule,InputTextModule],
  templateUrl: './round-entry-card.component.html',
    providers: [
    ConfirmationService,         // <-- provide the services here
    MessageService
  ],
  styleUrl: './round-entry-card.component.css'
  
})
export class RoundEntryCardComponent {

  viewCv: boolean = false;
  @Input({ required: true }) entry!: RoundEntry;

  reService = inject(RoundEntriesService);
  notificationService = inject(NotificationService);

  onDialogHide() {
    this.viewCv = false;
  }


  updateDetails(){
    if (this.entry.details?.trim() === '') {
      this.notificationService.showError('Details cannot be empty.');
      return;
    }

    this.reService.updateRoundEntryDetails(this.entry.id, this.entry.details)
      .subscribe({
        next: (result) => {
          this.notificationService.showSuccess('Details updated successfully.');  
          this.entry.details = result; // Update the entry details with the response
        },
        error: (err) => {
          
          this.notificationService.showError('Failed to update details.');
        }
      });

  }

  confirmationService = inject(ConfirmationService);
  messageService = inject(MessageService);

  confirm(event: Event) {
        this.confirmationService.confirm({
            key: 'entryDetails',
            target: event.target as HTMLElement,
            rejectButtonProps: {
                label: 'Cancel',
                severity: 'secondary',
                size : 'small',
            },
            acceptButtonProps: {
                label: 'Update',
                size : 'small',
            },
            accept: () => {
               this.updateDetails();
            },
            reject: () => {
            },
        });
  }
}

