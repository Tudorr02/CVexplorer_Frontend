import { Component, inject, OnInit } from '@angular/core';
import { RoundService } from '../../_services/round.service';
import { ActivatedRoute } from '@angular/router';
import { NotificationService } from '../../_services/notification.service';
import { Round } from '../../_models/round';
import { CommonModule } from '@angular/common';
import { RoundCardComponent } from '../round-card/round-card.component';
import { ScrollPanelModule } from 'primeng/scrollpanel';  
import { InputIcon } from 'primeng/inputicon';
import { IconField } from 'primeng/iconfield';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { ProgressSpinner } from 'primeng/progressspinner';
import { SelectModule } from 'primeng/select';
@Component({
  selector: 'app-rounds-list',
  imports: [SelectModule,ProgressSpinner,Dialog,ButtonModule,CommonModule, RoundCardComponent, ScrollPanelModule, InputIcon, IconField, InputTextModule, FormsModule],
  templateUrl: './rounds-list.component.html',
  styleUrl: './rounds-list.component.css'
})
export class RoundsListComponent implements OnInit {


  private route = inject(ActivatedRoute);
  private roundService = inject(RoundService);
  private notificationService = inject(NotificationService);

  rounds: Round[] = [];

  positionPublicId?: string;
  departmentId?:     number;

  searchText: string = '';
  viewDeleteDialog: boolean = false;
  loading: boolean = false;
  deletionRoundId?: string = undefined;
  deletionStage?: string = undefined;

  get filteredRounds(): Round[] {
    const term = this.searchText.trim().toLowerCase();
    if (!term) {
      return this.rounds;
    }
    return this.rounds.filter(r =>
      r.positionName?.toLowerCase().includes(term) ||
      r.name.toLowerCase().includes(term)||
      r.stage.toLowerCase().includes(term) 
    );
  }

  trackById(_index: number, round: Round): string {
    return round.publicId;
  }

  ngOnInit(): void {
    this.route.queryParamMap.subscribe(qp => {
      this.positionPublicId = qp.get('positionPublicId') ?? undefined;
      const dept = qp.get('departmentId');
      this.departmentId = dept != null ? Number(dept) : undefined;
      this.loadRounds();
  });
  }

  loadRounds() {
   this.roundService.getAllRounds(this.departmentId, this.positionPublicId).subscribe({
        next: (rounds) => {
          this.rounds = rounds.map(r => ({
          ...r,
          displayLabel: (r.positionName?.trim().length ?? 0) > 0
            ? `${r.name} - Position ${r.positionName}`
            : r.name
        }));
        },
        error: (error) => {
          this.notificationService.showError(error);
        }
      });
  }


  openDeleteDialog() {
    this.deletionRoundId = undefined;
    this.deletionStage = undefined;
    if(this.rounds.length > 0) {
      this.viewDeleteDialog = true;
    }
  }

  onDialogHide() {
    this.viewDeleteDialog = false;
    this.deletionRoundId = undefined;
    this.deletionStage = undefined;
  }

  deleteRound() {
    const enteredStage = (this.deletionStage || '').toLowerCase().trim();

    if (!this.deletionRoundId) {
      this.notificationService.showWarning('Please select a round first.');
    return;
    }

    const selectedRound = this.rounds.find(r => r.publicId === this.deletionRoundId);
    if (!selectedRound) {
      this.notificationService.showError('Selected round not found.');
      return;
    }

    const lastStageName = selectedRound.stage.toLowerCase().trim();

    if (enteredStage !== lastStageName) {
    this.notificationService.showError(
      `Stage name does not match. Please type exactly: "${lastStageName}".`
    );
    return;
    }

    this.loading = true;
    this.roundService.deleteRound(selectedRound.publicId).subscribe({
      next: () => {
        this.notificationService.showSuccess('Round deleted successfully.');
        this.viewDeleteDialog = false;
        this.loading = false;
        this.loadRounds();
      },
      error: err => {
        this.notificationService.showError("Failed to delete round: " + err);
        this.loading = false;
      }
    });

  }

  }





