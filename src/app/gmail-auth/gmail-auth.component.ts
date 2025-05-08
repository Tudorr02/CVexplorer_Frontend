import { Component, EventEmitter, inject, OnDestroy, OnInit, Output } from '@angular/core';
import { GmailService } from '../_services/gmail.service';
import { CommonModule } from '@angular/common';
import { Select } from 'primeng/select';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';  
import { FormsModule } from '@angular/forms';
import { NotificationService } from '../_services/notification.service';
@Component({
  selector: 'app-gmail-auth',
  imports: [Select, CommonModule, ButtonModule, ToastModule, FormsModule],
  templateUrl: './gmail-auth.component.html',
  styleUrl: './gmail-auth.component.css'
})
export class GmailAuthComponent implements OnInit , OnDestroy {

  private gmailService = inject(GmailService);
  private notificationService = inject(NotificationService);

  labels: { id: string; name: string }[] = [];
  selectedLabel = '';
  

  private popup: Window | null = null;
  private pollTimer: any;

  ngOnInit() {
    this.gmailService.isGmailSession().subscribe({
      next: () => {
        // 2) only if OK, load labels
        this.loadLabels();
      },
      error: () => {
        // not logged in → do nothing, show Connect button
      }
    });
  }

  ngOnDestroy() {
    this.clearPopupTimer();
  }

  connect() {
    // 1. deschide popup-ul de autentificare
    this.popup = this.gmailService.connectToGmail();
    // 2. pornește un interval care verifică dacă s-a închis
    this.pollTimer = setInterval(() => {
      if (!this.popup || this.popup.closed) {
        this.clearPopupTimer();
        this.loadLabels();
      }
    }, 500);
  }

  private clearPopupTimer() {
    if (this.pollTimer) {
      clearInterval(this.pollTimer);
      this.pollTimer = null;
    }
  }

  private loadLabels() {
    // 3. după ce popup-ul s-a închis, obține folderele
    this.gmailService.getGmailFolders().subscribe({
      next: lbls => {
        this.labels = lbls;
      },
      error: err => {
       
        this.notificationService.showError('Failed to load Gmail Folders!');
        
        // poți adăuga un toast de eroare aici
      }
    });
  }

  
}
