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
import { MenuItem } from 'primeng/api';
import { Menu } from 'primeng/menu';
import { ToggleButton } from 'primeng/togglebutton';
import { SelectModule } from 'primeng/select';
import { RoundService } from '../_services/round.service';
import { Round } from '../_models/round';
import { Tag } from 'primeng/tag';

@Component({
  selector: 'app-gmail-auth',
  imports: [Tag,SelectModule,ToggleButton,CommonModule, ButtonModule, ToastModule, FormsModule, MultiSelectModule, Menu],
  templateUrl: './gmail-auth.component.html',
  styleUrl: './gmail-auth.component.css'
})
export class GmailAuthComponent implements OnInit , OnDestroy {

  private gmailService = inject(GmailService);
  private notificationService = inject(NotificationService);
  private route = inject(ActivatedRoute);
  private roundService = inject(RoundService);

  labels: { id: string; name: string ; isSubscribed: boolean}[] = [];
  selectedLabels: string[] = []; 
  gmailLogo : string ='logos/icons8-gmail.svg';
  positionId!: string;
  settings: MenuItem[] = [];

  gmailExpiry: Date | null = null;
  processedCVs: number = 0;

  createRound : boolean = false;
  selectedRound : Round | null = null;
  rounds : Round[] = [];

  private messageHandler!: (event: MessageEvent) => void;
  private connectSub?: Subscription;

  sessionActive = false; 

  ngOnInit() {
    this.positionId = this.route.snapshot.paramMap.get('publicId')!;
    this.syncConnection();
    
  }

  updateRoundCreation() {
    console.log(this.createRound);
    if (this.createRound) {
      this.selectedRound = null;
      return;
    }
  }

  


  ngOnDestroy() {
    window.removeEventListener('message', this.messageHandler);
    this.connectSub?.unsubscribe(); 
  }

  loadGmailData() {
    this.sessionActive = true;
    this.settings = [
      {
        label: 'Settings',
        items: [
          {
            label: 'Unsubscribe',
            icon: 'pi pi-stop-circle',
            command: () => this.unsubscribe()
          },
          {
            label: 'Disconnect',
            icon: 'pi pi-sign-out',
            command: () => this.disconnect()
          },
          {
            label: 'Sync Connection',
            icon: 'pi pi-sync',
            command: () => this.syncConnection()
          }
        ]
      }
    ];
    this.loadLabels();
    this.loadRounds();
  }

  connect() {
    
    this.connectSub = this.gmailService.connect().subscribe({
      next: () => {
        this.loadGmailData();
        this.notificationService.showSuccess('Gmail connected successfully!');
      },
      error: () => {
        this.notificationService.showError('Gmail connection failed!');
        this.sessionActive = false;
      }
    });

  }

  syncConnection() {
    this.gmailService.isGmailSession(this.positionId).subscribe({
        next: (res) => {
          this.sessionActive = res.sessionActive;
          this.gmailExpiry =  new Date(res.data.expiry);
          this.processedCVs = res.data.processedCVs;
          if (this.sessionActive)
          this.loadGmailData();
        },
        error: (err) => {
          this.sessionActive = false
        }
      });
  }


  private loadLabels() {
    // 3. după ce popup-ul s-a închis, obține folderele
    this.gmailService.loadFolders(this.positionId).subscribe({
      next: lbls => {
        this.labels = lbls;
        this.selectedLabels = lbls.filter(label => label.isSubscribed).map(label => label.id);
      },
      error: err => {
        this.notificationService.showError('Failed to load Gmail Folders!');
      }
    });
  }

  private loadRounds() {
    this.roundService.getAllRounds(undefined, this.positionId).subscribe({
      next: rounds => {
        this.rounds = rounds;
        
      },
      error: () => {
        this.notificationService.showError('Failed to load rounds!');
      }
    });
  }


  watch() {
    if (!this.selectedLabels.length) {
      this.notificationService.showError('Choose at least one label to watch');
      return;
    }
    this.gmailService.watchLabel(this.selectedLabels, this.positionId)
    .subscribe({
    next: lbls => {
      this.labels = lbls;
      this.selectedLabels = lbls.filter(label => label.isSubscribed).map(label => label.id);
      
      this.notificationService.showSuccess('Watch started successfully!');
    },
    error: () => this.notificationService.showError('Failed to start watch!')
    });
  }
  
  destroyGmailData() {
    this.sessionActive = false;
    this.settings = [];
    this.labels = [];
    this.selectedLabels = [];
    this.gmailExpiry = null;
    this.processedCVs = 0;
    this.createRound = false;
    this.selectedRound = null;
  }

  disconnect() {
    this.gmailService.disconnect().subscribe({
      next: () => {
        this.destroyGmailData();
        this.notificationService.showSuccess('Gmail disconnected successfully!');
      },
      error: () => this.notificationService.showError('Failed to disconnect Gmail!')
    });
  }

  unsubscribe() {
    this.gmailService.unsubscribe(this.positionId).subscribe({
      next: () => {
        this.selectedLabels = []
        this.notificationService.showSuccess('Unsubscribed from Gmail successfully!');
      },
      error: () => this.notificationService.showError('Failed to unsubscribe from Gmail!')
    });
  }

}
