import { Component, inject, Input, OnInit } from '@angular/core';
import { RoundService } from '../../_services/round.service';
import { Round } from '../../_models/round';
import { NotificationService } from '../../_services/notification.service';
import { CardModule } from 'primeng/card';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { Router } from '@angular/router';
import { Tag } from 'primeng/tag';
@Component({
  selector: 'app-round-card',
  imports: [Tag,CardModule, CommonModule, ButtonModule],
  templateUrl: './round-card.component.html',
  styleUrl: './round-card.component.css'
})
export class RoundCardComponent implements OnInit {

  @Input({ required: true }) round !: Round;

  private roundService = inject(RoundService);
  private notificationService = inject(NotificationService);
  router = inject(Router);
  
  //loading = true;
  error?: string;

  ngOnInit(): void {
    
  }

  openRound(id: string) {
    // navigates to /round/{publicId}
    this.router.navigate(['/evaluation-rounds', id]);
  }
}


