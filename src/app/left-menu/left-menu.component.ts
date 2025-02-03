import { Component, OnInit } from '@angular/core';
import { TreeNode } from 'primeng/api';
import { NodeService } from '../_services/nodeservice';
import { Tree } from 'primeng/tree';

@Component({
  selector: 'app-left-menu',
  imports: [Tree],
  templateUrl: './left-menu.component.html',
  styleUrl: './left-menu.component.css',
  providers: [NodeService]
})
export class LeftMenuComponent {
  files!: TreeNode[];

  constructor(private nodeService: NodeService) {}

  ngOnInit() {
      this.files = this.nodeService.getTreeNodes();
  }
}
