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
@Component({
  selector: 'app-round',
  imports: [CommonModule,ScrollPanelModule,PickListModule, DragDropModule, AvatarModule, RoundEntryCardComponent],
  templateUrl: './round-entry-list.component.html',
  styleUrl: './round-entry-list.component.css',
  
})
export class RoundEntryListComponent {



  private route = inject(ActivatedRoute);
  private roundService = inject(RoundService); 
  private notificationService = inject(NotificationService);
  private roundEntriesService = inject(RoundEntriesService)
  
  publicId!: string;

  sourceEntries: RoundEntry[] = [];
  targetEntries: RoundEntry[] = [];

  constructor(private cdr: ChangeDetectorRef) {
    // constructor logic here
  }
  ngOnInit() {
    this.route.paramMap.subscribe(p => {
      this.publicId = p.get('publicId')!;   
      this.loadRound(this.publicId);        
    });
  }

  loadRound(publicId: string) {
    
    this.roundService.getRound(publicId).subscribe(
      {
        next: (roundEntries) => {
          this.sourceEntries = roundEntries.filter(e => !e.selected);
          this.targetEntries = roundEntries.filter(e => e.selected);
          this.cdr.markForCheck(); 
        },
        error: (error) => {
          this.notificationService.showError('Error loading round entries');
        },
        
      }
    );

  }

  drop(event: CdkDragDrop<RoundEntry[]>) {
  // 1) Same-container → just reorder
  if (event.previousContainer === event.container) {
    moveItemInArray(
      event.container.data,
      event.previousIndex,
      event.currentIndex
    );
    return;
  }

  // 2) Different-container → optimistic transfer
  const srcList = event.previousContainer.data;
  const tgtList = event.container.data;
  const moved = srcList[event.previousIndex];

  // do the transfer in the UI
  transferArrayItem(srcList, tgtList, event.previousIndex, event.currentIndex);

  // if dropped into target, call API; otherwise (back to source) do nothing or call API(false)
  if (event.container.id === 'tgt') {
    this.roundEntriesService
      .updateRoundEntry(moved.id, true)
      .subscribe({
        next: () => {
          this.notificationService.showSuccess(
            'Entry selected for evaluation'
          );
          tgtList.sort((a, b) => b.score - a.score);
        },
        error: (err) => {
          // revert the move
          transferArrayItem(tgtList, srcList, event.currentIndex, event.previousIndex);
          this.notificationService.showError(
            'Error updating entry selection'
          );
          console.error(err);
        }
      });
  } else if (event.container.id === 'src') {
    // if you also want to notify the server that it was de-selected:
    this.roundEntriesService
      .updateRoundEntry(moved.id, false)
      .subscribe({
        next: () => {
          this.notificationService.showSuccess(
            'Entry returned to source'
          );
          tgtList.sort((a, b) => b.score - a.score);
        },
        error: (err) => {
          // revert the move
          transferArrayItem(tgtList, srcList, event.currentIndex, event.previousIndex);
          this.notificationService.showError(
            'Error updating entry deselection'
          );
          console.error(err);
        }
      });
  }
}
  
}
