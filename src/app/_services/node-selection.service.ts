import { Injectable, signal } from '@angular/core';
import { TreeNode } from 'primeng/api';

@Injectable({
  providedIn: 'root'
})
export class NodeSelectionService {
  private selectedNodeSignal = signal<TreeNode | null>(null); // ✅ create signal correctly

  setSelectedNode(node: TreeNode) {
    this.selectedNodeSignal.set(node); 
  }

  setSelectedNodeNull() {
    this.selectedNodeSignal.set(null);
  }

  getSelectedNode(): TreeNode | null {
    return this.selectedNodeSignal();
  }

}
