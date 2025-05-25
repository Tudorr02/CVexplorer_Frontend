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
@Component({
  selector: 'app-outlook-auth',
  imports: [ButtonModule,MultiSelectModule, FormsModule, CommonModule, Menu],
  templateUrl: './outlook-auth.component.html',
  styleUrl: './outlook-auth.component.css'
})
export class OutlookAuthComponent implements OnInit {
  private http: HttpClient;
  private router: Router;
  
  private outlookService = inject(OutlookService);
  private route = inject(ActivatedRoute);
  private notificationService = inject(NotificationService);

  folders: { id: string; name: string ; isSubscribed: boolean}[] = [];
  selectedFolders: string[] = [];
  outlookLogo: string = 'logos/icons8-outlook.svg';
  positionId!: string;
  settings: MenuItem[] = [];
  sessionActive = false;
  


  private messageHandler!: (event: MessageEvent) => void;
  private connectSub?: Subscription;

  constructor(http: HttpClient, router: Router) {
    this.http = http;
    this.router = router;
  }

    

  ngOnInit(): void {
    this.positionId = this.route.snapshot.paramMap.get('publicId')!;
    this.outlookService.isOutlookSession().subscribe({
        next: (res) => {
          this.sessionActive = res.sessionActive;
          if (this.sessionActive)
            this.loadOutlookData();
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
          }
        ]
      }
    ];
    this.loadFolders();
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

  watch() {
    if (!this.selectedFolders.length) {
      this.notificationService.showError('Choose at least one label to watch');
      return;
    }
    this.outlookService.watchFolder(this.selectedFolders, this.positionId)
    .subscribe({
    next: lbls => {
      this.folders = lbls;
      this.selectedFolders = lbls.filter(label => label.isSubscribed).map(label => label.id);
      
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
      },
      error: () => this.notificationService.showError('Failed to unsubscribe from Outlook!')
    });
  }

  ngOnDestroy() {
    window.removeEventListener('message', this.messageHandler);
    this.connectSub?.unsubscribe(); 
  }


}
