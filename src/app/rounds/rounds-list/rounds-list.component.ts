import { Component, inject, OnInit } from '@angular/core';
import { RoundService } from '../../_services/round.service';
import { ActivatedRoute } from '@angular/router';
import { NotificationService } from '../../_services/notification.service';
import { Round } from '../../_models/round';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-rounds-list',
  imports: [CommonModule],
  templateUrl: './rounds-list.component.html',
  styleUrl: './rounds-list.component.css'
})
export class RoundsListComponent implements OnInit {

  private route = inject(ActivatedRoute);
  private cvService = inject(RoundService);
  private notificationService = inject(NotificationService);

  Rounds: Round[] = [];

  positionPublicId?: string;
  departmentId?:     number;

  ngOnInit(): void {
    this.route.queryParamMap.subscribe(qp => {
      this.positionPublicId = qp.get('positionPublicId') ?? undefined;
      const dept = qp.get('departmentId');
      this.departmentId = dept != null ? Number(dept) : undefined;
      this.loadRounds();
  });
  }

  loadRounds() {
   this.cvService.getAllRounds(this.departmentId, this.positionPublicId).subscribe({
        next: (rounds) => {
          this.Rounds = rounds;
        },
        error: (error) => {
          this.notificationService.showError(error);
        }
      });
    }
}


