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
@Component({
  selector: 'app-round',
  imports: [ScrollPanelModule,PickListModule, DragDropModule, AvatarModule, RoundEntryCardComponent],
  templateUrl: './round-data.component.html',
  styleUrl: './round-data.component.css',
  
})
export class RoundDataComponent {



  private route = inject(ActivatedRoute);
  private roundService = inject(RoundService); // if you have a service to load rounds
  private notificationService = inject(NotificationService); // if you have a service to show notifications
  
  publicId!: string;   // will hold "R2dc4073c-2"

  roundEntries: RoundEntry[] = []; // will hold the list of round entries
  sourceEntries: RoundEntry[] = [];
  targetEntries: RoundEntry[] = [];

  constructor(private cdr: ChangeDetectorRef) {
    // constructor logic here
  }
  ngOnInit() {
    // subscribe so it also works if the user navigates to a different id
    this.route.paramMap.subscribe(p => {
      this.publicId = p.get('publicId')!;   // non-null because route has it
      this.loadRound(this.publicId);        // → call your API, set up picklist…
    });
  }

  loadRound(publicId: string) {
    
    this.roundService.getRound(publicId).subscribe(
      {
        next: (roundEntries) => {
          this.roundEntries = roundEntries; // set the list of round entries
          this.sourceEntries = roundEntries;
          this.cdr.markForCheck(); // mark for check if you are using ChangeDetectionStrategy.OnPush
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
  }
  
}
