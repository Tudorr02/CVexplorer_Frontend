import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { Position } from '../_models/position';
import { PositionTreeNode } from '../_models/positionTreeNode';

interface PositionPayload {
  departmentId: number;
  position: {
    name: string;
    publicId: string;
  };
}

@Injectable({
  providedIn: 'root'
})


export class DepartmentTreeEventService {

   private addPositionSubject = new Subject<PositionPayload>();
   addPosition$ = this.addPositionSubject.asObservable();
 
   addPositionToTree(payload: PositionPayload) {
    this.addPositionSubject.next(payload);
  }
}
