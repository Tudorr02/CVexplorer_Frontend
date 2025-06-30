import { ChangeDetectorRef, Component, importProvidersFrom, inject } from '@angular/core';
import { CdkDragDrop, DragDropModule, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { ActivatedRoute } from '@angular/router';
import { RoundService } from '../../_services/round.service';
import { RoundEntry } from '../../_models/round-entry';
import { NotificationService } from '../../_services/notification.service';
import { PickListModule } from 'primeng/picklist';
import { CardModule } from 'primeng/card';
import { AvatarModule } from 'primeng/avatar';
import { RoundEntryCardComponent } from "../round-entry-card/round-entry-card.component";
import { ScrollPanelModule } from 'primeng/scrollpanel';
import { CommonModule } from '@angular/common';
import { RoundEntriesService } from '../../_services/round-entries.service';
import { RoundStage } from '../../_models/round-stage';
import {  ButtonModule } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';
import { Dialog } from 'primeng/dialog';
import { ProgressSpinner } from 'primeng/progressspinner';
import { finalize } from 'rxjs';
@Component({
  selector: 'app-round',
  imports: [ProgressSpinner,Dialog,FormsModule,InputText,ButtonModule,CommonModule,ScrollPanelModule,PickListModule, DragDropModule, AvatarModule, RoundEntryCardComponent],
  templateUrl: './round-entry-list.component.html',
  styleUrl: './round-entry-list.component.css',
  
})
export class RoundEntryListComponent {



  private route = inject(ActivatedRoute);
  private roundService = inject(RoundService); 
  private notificationService = inject(NotificationService);
  private roundEntriesService = inject(RoundEntriesService)
  private cdr = inject(ChangeDetectorRef);


  publicId!: string;
  stages: RoundStage[] = [];
  zones: { id: string; label: string ; ordinal : number}[] = [];
  entriesByZone: RoundEntry[][] = [];
  addStage : boolean = false;
  newStageName: string = '';
  viewDeleteDialog: boolean = false;
  loading: boolean = false;
  selectedStageOrdinal?: number;

  ngOnInit() {
    this.route.paramMap.subscribe(p => {
      this.publicId = p.get('publicId')!;   
      this.loadRound(this.publicId);        
    });


  }

    private loadRound(publicId: string): void {
    this.roundService.getRound(publicId).subscribe({
      next: (roundStages: RoundStage[]) => {
        this.stages = roundStages.sort((a, b) => a.ordinal - b.ordinal);
        this.zones = this.stages.map(stage => ({
          id: 'stage-' + stage.ordinal,
          label: stage.name,
          ordinal: stage.ordinal
        }));

        this.entriesByZone = this.stages.map(stage => {
          return [...stage.entries];
        });

        this.entriesByZone.forEach(list => {
          list.sort((a, b) => b.score - a.score);
        });

        this.cdr.markForCheck();
      },
      error: () => {
        this.notificationService.showError('Failed to load round stages.');
      }
    });
  }

   getConnectedZoneIds(curId: string): string[] {
    return this.zones.map(z => z.id).filter(id => id !== curId);
  }


  drop(event: CdkDragDrop<RoundEntry[]>): void {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
      event.container.data.sort((a, b) => b.score - a.score);

      return;
    }

    const prevId = event.previousContainer.id; 
    const currId = event.container.id;
    const prevIdx = this.zones.findIndex(z => z.id === prevId);
    const currIdx = this.zones.findIndex(z => z.id === currId);
    if (prevIdx < 0 || currIdx < 0) return;

    const srcList = this.entriesByZone[prevIdx];
    const tgtList = this.entriesByZone[currIdx];
    const movedEntry = srcList[event.previousIndex];

    transferArrayItem(srcList, tgtList, event.previousIndex, event.currentIndex);

    srcList.sort((a, b) => b.score - a.score);
    tgtList.sort((a, b) => b.score - a.score);
    this.roundEntriesService
    .updateRoundEntry(movedEntry.id, this.stages[currIdx].ordinal)
    .subscribe({
      next: () => {
        this.notificationService.showSuccess(`Entry ${movedEntry.candidateName} moved to stage ${this.stages[currIdx].name}`);
        this.cdr.markForCheck();
      },
      error: () => {

        transferArrayItem(tgtList, srcList, event.currentIndex, event.previousIndex);
        this.notificationService.showError(
          "Failed to move entry. Please try again."
        );
      }
    });

  }

  trackByEntryIdx(index: number, item: RoundEntry): number {
    return item.id;
  }

  addStageToRound(){

    if(this.newStageName.length >18){
      this.notificationService.showWarning('Stage name cannot exceed 18 characters.');
      return;
    }
    
    this.roundService.addStage(this.publicId, this.newStageName).subscribe({
      next: (stage) => {
        this.stages.push(stage);
        this.zones.push({ id: 'stage-' + stage.ordinal, label: stage.name , ordinal: stage.ordinal });
        this.entriesByZone.push([]);
        this.addStage = false;
        this.newStageName = '';
        this.cdr.markForCheck();
      },
      error: (error) => {
        this.notificationService.showError('Error adding stage');
      }
    });
  }

  deleteStage(stageOrdinal: number): void {
    this.roundService.deleteStage(this.publicId, stageOrdinal).subscribe({
      next: () => {
        this.notificationService.showSuccess(`Stage ${stageOrdinal} deleted successfully`);
        this.loadRound(this.publicId);
      },
      error: (err) => {
        console.error(err);
        this.notificationService.showError('Error deleting stage');
      }
    });
  }

  showDeleteDialog(stageOrdinal: number): void {
    this.viewDeleteDialog = true;
    this.selectedStageOrdinal = stageOrdinal;
    this.loading = false; 
  }
  confirmDelete() {
    if (this.selectedStageOrdinal == null) {
      this.notificationService.showError('Invalid stage selected.');
      return;
    }
  
    this.loading = true;
    this.roundService.deleteStage(this.publicId, this.selectedStageOrdinal)
    .pipe(finalize(() => setTimeout(() => {
          this.loading = false;
        }, 1000)))
    .subscribe({
      next: () => {
        this.notificationService.showSuccess(`Stage ${this.selectedStageOrdinal} deleted successfully`);
        this.loadRound(this.publicId);
        this.selectedStageOrdinal = undefined;
        this.viewDeleteDialog = false;
      },
      error: (err) => {
        console.error(err);
        this.notificationService.showError('Error deleting stage');
      }
    });  
  
  }

  cancelDelete() {
    this.viewDeleteDialog = false;
    this.selectedStageOrdinal = undefined; 
  }


}
