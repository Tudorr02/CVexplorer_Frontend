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

  sessionActive = false; // for showing/hiding the Connect button

  ngOnInit() {
    this.checkSession(); // Check if the session is active on component init
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

    this.checkSession(); // Check if the session is active
  }

  private clearPopupTimer() {
    if (this.pollTimer) {
      clearInterval(this.pollTimer);
      this.pollTimer = null;
    }
  }

  private checkSession() {
    this.gmailService.isGmailSession().subscribe({
      next: () => {
        this.sessionActive = true; // Gmail session is active
        this.loadLabels();
      },
      error: () => {
        this.sessionActive = false; // Gmail session is not active
      }
    });
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
