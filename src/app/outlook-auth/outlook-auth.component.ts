import { Component, inject, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { MultiSelectModule } from 'primeng/multiselect';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { OutlookService } from '../_services/outlook.service';
import { ButtonModule } from 'primeng/button';
import { NotificationService } from '../_services/notification.service';
import { Menu } from 'primeng/menu';
import { MenuItem } from 'primeng/api';
import { Subscription } from 'rxjs';
import { Tag } from 'primeng/tag';
import { Round } from '../_models/round';
import { SelectModule } from 'primeng/select';
import { RoundService } from '../_services/round.service';
import { ToggleButton } from 'primeng/togglebutton';

@Component({
  selector: 'app-outlook-auth',
  imports: [ToggleButton,SelectModule,Tag,ButtonModule,MultiSelectModule, FormsModule, CommonModule, Menu],
  templateUrl: './outlook-auth.component.html',
  styleUrl: './outlook-auth.component.css'
})
export class OutlookAuthComponent implements OnInit {
  private http: HttpClient;
  private router: Router;
  
  private outlookService = inject(OutlookService);
  private route = inject(ActivatedRoute);
  private notificationService = inject(NotificationService);
  private roundService = inject(RoundService);

  folders: { id: string; name: string ; isSubscribed: boolean}[] = [];
  selectedFolders: string[] = [];

  positionId!: string;
  settings: MenuItem[] = [];

  outlookExpiry: Date | null = null;
  processedCVs: number = 0;
  
  isProcessing: boolean = false;

  createRound : boolean = false;
  selectedRound : Round | null = null;
  rounds : Round[] = [];
  selectedRoundId: string | null = null;
  
  
  
  private messageHandler!: (event: MessageEvent) => void;
  private connectSub?: Subscription;

  sessionActive = false;

  constructor(http: HttpClient, router: Router) {
    this.http = http;
    this.router = router;
  }

    updateRoundCreation() {
    console.log(this.createRound);
    if (this.createRound) {
      this.selectedRound = null;
      return;
    }
  }

  

  ngOnInit(): void {
    this.positionId = this.route.snapshot.paramMap.get('publicId')!;
    this.syncConnection();
  }

  syncConnection() {
    this.outlookService.isOutlookSession(this.positionId).subscribe({
        next: (res) => {
          this.sessionActive = res.sessionActive;
          if (this.sessionActive){
            this.outlookExpiry =  new Date(res.data.expiry) || null;
            this.processedCVs = res.data.processedCVs;
            this.isProcessing = res.data.isProcessing;
            this.selectedRoundId = res.data.processingRoundId || null;
            this.loadOutlookData();
          }
        },
        error: (err) => {
          this.sessionActive = false
        }
      });
  }



  loadOutlookData() {
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
    
    this.loadFolders();
    this.loadRounds();
  }


  connect(): void {
    this.connectSub = this.outlookService.connect().subscribe({
      next: () => {
        this.loadOutlookData();
        this.notificationService.showSuccess('Outlook connected successfully!');
      },
      error: () => {
        this.notificationService.showError('Outlook connection failed!');
        this.sessionActive = false;
      }
    });
  }

  private loadFolders(): void {
   this.outlookService.loadFolders(this.positionId).subscribe({
      next: folders => {
        this.folders = folders;
        this.selectedFolders = folders.filter(folder => folder.isSubscribed).map(folder => folder.id);
      },
      error: err => {
       
        this.notificationService.showError('Failed to load Outlook Folders!');
      }
    });
  }

  private loadRounds() {
    this.roundService.getAllRounds(undefined, this.positionId).subscribe({
      next: rounds => {
        this.rounds = rounds;
        if( this.selectedRoundId) {
          this.selectedRound = rounds.find(r => r.publicId === this.selectedRoundId) || null;
        }
      },
      error: () => {
        this.notificationService.showError('Failed to load rounds!');
      }
    });
  }

  watch() {
    if (!this.selectedFolders.length) {
      this.notificationService.showError('Choose at least one label to watch');
      return;
    }
    this.outlookService.watchFolder(this.selectedFolders, this.positionId, this.selectedRound?.publicId)
    .subscribe({
    next: lbls => {
      this.createRound = false;
      this.folders = lbls;
      this.selectedFolders = lbls.filter(label => label.isSubscribed).map(label => label.id);
      this.isProcessing = true;
      this.notificationService.showSuccess('Watch started successfully!');
    },
    error: () => this.notificationService.showError('Failed to start watch!')
    });
  }

  destroyOutlookData() {
    this.sessionActive = false;
    this.settings = [];
    this.folders = [];
    this.selectedFolders = [];
    this.outlookExpiry = null;
    this.processedCVs = 0;
    this.createRound = false;
    this.selectedRound = null;
    this.isProcessing = false;
    this.selectedRoundId = null;
  }

  disconnect() {
    this.outlookService.disconnect().subscribe({
      next: () => {
        this.destroyOutlookData();
        this.notificationService.showSuccess('Outlook disconnected successfully!');
      },
      error: () => this.notificationService.showError('Failed to disconnect Outlook!')
    });
  }

  unsubscribe() {
    this.outlookService.unsubscribe(this.positionId).subscribe({
      next: () => {
        this.selectedFolders = []
        this.notificationService.showSuccess('Unsubscribed from Outlook successfully!');
        this.isProcessing = false;
        this.selectedRound = null;
      },
      error: () => this.notificationService.showError('Failed to unsubscribe from Outlook!')
    });
  }

  ngOnDestroy() {
    window.removeEventListener('message', this.messageHandler);
    this.connectSub?.unsubscribe(); 
  }


}
