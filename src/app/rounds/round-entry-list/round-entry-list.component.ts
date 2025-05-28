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
  
  publicId!: string;

  roundEntries: RoundEntry[] = []; 
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
          this.roundEntries = roundEntries; 
          this.sourceEntries = roundEntries;
          this.cdr.markForCheck(); 
        },
        error: (error) => {
          this.notificationService.showError('Error loading round entries');
        },
        
      }
    );

  }

  drop(event: CdkDragDrop<RoundEntry[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data,
                      event.previousIndex,
                      event.currentIndex);                 
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex);                              
    }

    if (event.container.id === 'tgt') {
      this.notificationService.showSuccess('Entries moved to target list');
    }
    else if (event.container.id === 'src') {
      this.notificationService.showSuccess('Entries moved to source list');
    }

  }
  
}
