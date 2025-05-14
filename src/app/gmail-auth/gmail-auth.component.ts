import { Component, EventEmitter, inject, OnDestroy, OnInit, Output } from '@angular/core';
import { GmailService } from '../_services/gmail.service';
import { CommonModule } from '@angular/common';
import { Select } from 'primeng/select';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';  
import { FormsModule } from '@angular/forms';
import { NotificationService } from '../_services/notification.service';
import { Subscription } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { MultiSelectModule } from 'primeng/multiselect';
@Component({
  selector: 'app-gmail-auth',
  imports: [Select, CommonModule, ButtonModule, ToastModule, FormsModule, MultiSelectModule],
  templateUrl: './gmail-auth.component.html',
  styleUrl: './gmail-auth.component.css'
})
export class GmailAuthComponent implements OnInit , OnDestroy {

  private gmailService = inject(GmailService);
  private notificationService = inject(NotificationService);
  private route = inject(ActivatedRoute);
  labels: { id: string; name: string ; selected : boolean}[] = [];
  selectedLabels: string[] = [];  // acum un array
  
  positionId!: string;

  private messageHandler!: (event: MessageEvent) => void;
  private connectSub?: Subscription;

  sessionActive = false; // for showing/hiding the Connect button

  ngOnInit() {
    this.positionId = this.route.snapshot.paramMap.get('publicId')!;

    this.gmailService.isGmailSession().subscribe({
      next: () => {
        this.sessionActive = true;
        this.loadLabels();
      },
      error: () => this.sessionActive = false
    });
  }

  ngOnDestroy() {
    window.removeEventListener('message', this.messageHandler);
    this.connectSub?.unsubscribe(); 
   }

  connect() {
    
    this.connectSub = this.gmailService.connectToGmail().subscribe({
      next: () => {
        // Popup-ul s-a autentificat și s-a închis deja
        this.sessionActive = true;
        this.loadLabels();
      },
      error: () => {
        this.notificationService.showError('Autentificarea la Gmail a eșuat');
      }
    });

  }

  private loadLabels() {
    // 3. după ce popup-ul s-a închis, obține folderele
    this.gmailService.getGmailFolders(this.positionId).subscribe({
      next: lbls => {
        this.labels = lbls;
        this.selectedLabels = lbls.filter(label => label.selected).map(label => label.id);
      },
      error: err => {
       
        this.notificationService.showError('Failed to load Gmail Folders!');
      }
    });
  }


  watch() {
    if (!this.selectedLabels.length) {
      this.notificationService.showError('Selecteaza un folder Gmail');
      return;
    }
    this.gmailService.watchLabel(this.selectedLabels, this.positionId)
    .subscribe({
    next: res => {
      console.log('Watch started:', res);
      this.notificationService.showSuccess('Watch pornit cu succes');
    },
    error: () => this.notificationService.showError('Eroare la pornirea watch-ului')
    });
  }
  

// this.gmailService.unwatchLabels(this.selectedLabels, this.positionPublicId)
//   .subscribe({
//     next: res => {
//       console.log('Watch stopped:', res);
//       this.notify.showSuccess('Watch oprit cu succes');
//     },
//     error: () => this.notify.showError('Eroare la oprirea watch-ului')
//   });

  
}
