import { Component, inject, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { MultiSelectModule } from 'primeng/multiselect';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { OutlookService } from '../_services/outlook.service';
import { ButtonModule } from 'primeng/button';
@Component({
  selector: 'app-outlook-auth',
  imports: [ButtonModule,MultiSelectModule, FormsModule, CommonModule],
  templateUrl: './outlook-auth.component.html',
  styleUrl: './outlook-auth.component.css'
})
export class OutlookAuthComponent implements OnInit {
  private http: HttpClient;
  private router: Router;

  folders: any[] = [];
  selectedFolders: string[] = [];
  sessionActive = false;
  outlookService = inject(OutlookService);

  constructor(http: HttpClient, router: Router) {
    this.http = http;
    this.router = router;
  }

  ngOnInit(): void {
    this.outlookService.isOutlookSession().subscribe(
      () => {
        this.sessionActive = true;
        this.loadFolders();
      },
      () => this.sessionActive = false
    );
  }

  login(): void {
    this.outlookService.connectToOutlook().subscribe({
    next: () => {
      this.sessionActive = true;
      this.loadFolders();
    },
    error: err => console.error('Login popup failed', err)
  });
  }

  private loadFolders(): void {
    this.outlookService.getOutlookFolders().subscribe(
      folders => this.folders = folders,
      err => console.error('Could not load folders', err)
    );
  }

  watch(): void {
    // this.outlookService.watchFolders(this.selectedFolders).subscribe(
    //   res => console.log('Watch started', res),
    //   err => console.error('Error starting watch', err)
    // );
  }

}
