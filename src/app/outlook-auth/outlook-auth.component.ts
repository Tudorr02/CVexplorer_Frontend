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
@Component({
  selector: 'app-outlook-auth',
  imports: [ButtonModule,MultiSelectModule, FormsModule, CommonModule, Menu],
  templateUrl: './outlook-auth.component.html',
  styleUrl: './outlook-auth.component.css'
})
export class OutlookAuthComponent implements OnInit {
  private http: HttpClient;
  private router: Router;
items: MenuItem[] = [
    {
      label: 'Settings',
      items: [
        {
          label: 'Unsubscribe',
          icon: 'pi pi-stop-circle',
          command: () => this.connect()
        },
        {
          label: 'Disconnect',
          icon: 'pi pi-sign-out',
          command: () => this.watch()
        }
      ]
    }
  ];
  folders: any[] = [];
  selectedFolders: string[] = [];
  sessionActive = false;
  outlookService = inject(OutlookService);
    private route = inject(ActivatedRoute);

  outlookLogo: string = 'logos/icons8-outlook.svg';
  
  private notificationService = inject(NotificationService);

  constructor(http: HttpClient, router: Router) {
    this.http = http;
    this.router = router;
  }

    positionId!: string;

  ngOnInit(): void {
    this.positionId = this.route.snapshot.paramMap.get('publicId')!;
    this.outlookService.isOutlookSession().subscribe(
      () => {
        this.sessionActive = true;
        this.loadFolders();
      },
      () => this.sessionActive = false
    );
  }

  connect(): void {
    this.outlookService.connectToOutlook().subscribe({
    next: () => {
      this.sessionActive = true;
      this.loadFolders();
    },
    error: err => console.error('Login popup failed', err)
  });
  }

  private loadFolders(): void {
   this.outlookService.getOutlookFolders(this.positionId).subscribe({
      
      next: folders => {
        this.folders = folders;
        this.selectedFolders = folders.filter(folder => folder.selected).map(folder => folder.id);
      },
      error: err => {
       
        this.notificationService.showError('Failed to load Outlook Folders!');
      }
    });
  }

  watch() {
    if (this.selectedFolders.length === 0) {
      this.notificationService.showError('Please select at least one folder.');
      return;
    }

    this.outlookService
      .watchFolder(this.selectedFolders, this.positionId)
      .subscribe({
        next: res => {
          console.log('Subscribed:', res);
          this.notificationService.showSuccess('Subscription created successfully!');
          // optionally refresh to pick up new `selected` flags
          this.loadFolders();
        },
        error: err => {
          console.error(err);
          this.notificationService.showError('Failed to subscribe to folders.');
        }
      });
  }

}
