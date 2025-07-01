import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { TreeNode } from 'primeng/api';
import { Tree, TreeNodeCollapseEvent, TreeNodeExpandEvent } from 'primeng/tree';
import { TreeModule } from 'primeng/tree';
import { CommonModule } from '@angular/common';
import { DepartmentService } from '../../_services/department.service';
import { MenuItem } from 'primeng/api';
import { Menu } from 'primeng/menu';
import { ButtonModule } from 'primeng/button';
import { TabsModule } from 'primeng/tabs';
import { HasRoleDirective } from '../../_directives/has-role.directive';
import { Dialog } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';
import { NotificationService } from '../../_services/notification.service';
import { AddDepartmentComponent } from "../add-department/add-department.component";
import { EditDepartmentComponent } from '../edit-department/edit-department.component';
import { DeleteDepartmentComponent } from '../delete-department/delete-department.component';
import { AccountService } from '../../_services/account.service';
import { Skeleton } from 'primeng/skeleton';
import { finalize, timeout } from 'rxjs';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { DepartmentTreeEventService } from '../../_services/department-tree-event.service';
import { DeletePositionComponent } from '../delete-position/delete-position.component';
import { NodeSelectionService } from '../../_services/node-selection.service';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';

@Component({
  selector: 'app-left-menu',
  imports: [IconFieldModule,  InputIconModule,Skeleton,DeletePositionComponent,DeleteDepartmentComponent,EditDepartmentComponent,FormsModule, InputTextModule, Dialog, HasRoleDirective, TabsModule, ButtonModule, Tree, TreeModule, CommonModule, Menu, AddDepartmentComponent],
  templateUrl: './departments-tree.component.html',
  styleUrl: './departments-tree.component.css',
  
})
export class DepartmentsTreeComponent implements OnInit {
  
  @ViewChild('parentMenu') parentMenu!: Menu; 
  @ViewChild('leafMenu') leafMenu!: Menu;  
  @ViewChild('editDepartmentComponent') editDepartmentComponent!: EditDepartmentComponent;
  @ViewChild('addDepartmentComponent') addDepartmentComponent!: AddDepartmentComponent;

  treeData: TreeNode[] = []
  loading: boolean = true; 
  loadingItems: Array<any> = []; 
  expandedNodesKey: { [key: string]: boolean } = {};

  visibleAddDepartmentDialog: boolean = false;
  visibleEditDepartmentDialog: boolean = false;
  visibleDeleteDepartmentDialog: boolean = false;
  visibleDeletePositionDialog: boolean = false;

  selectedNode!: TreeNode;
  parentNodeActions: MenuItem[] = [];

  leafNodeActions: MenuItem[] = [
      {label: 'Edit Position', icon: 'pi pi-pencil' , command: () => this.editPosition(this.selectedNode) },
      {label: 'Delete Position', icon: 'pi pi-trash', command: () => this.openDeletePositionDialog(this.selectedNode)}
  ];

  departmentService = inject(DepartmentService);
  notificationService = inject(NotificationService);
  accountService = inject(AccountService);
  router = inject(Router);    
  location = inject(Location);
  treeEventService = inject(DepartmentTreeEventService);
  departmentSelectionService = inject(NodeSelectionService);


  ngOnInit() {
    this.fetchTreeData();
    this.setupContextMenu();
    this.subscribeToPositionAdditions();
  
  }

  subscribeToPositionAdditions() {
    this.treeEventService.addPosition$.subscribe(({ departmentId, position }) => {
      const departmentNode = this.treeData.find(dep => dep.key === departmentId.toString());
  
      if (departmentNode) {
        if (!departmentNode.children) {
          departmentNode.children = [];
        }
  
        departmentNode.children.push({
          label: position.name,
          icon: 'pi pi-inbox',
          data: { publicId: position.publicId, type: 'position' }
        });
      }
    });
  }


setupContextMenu() {
  const userRole = this.accountService.currentUser()?.role || '';

  this.parentNodeActions = [
    { label: 'Add Position', icon: 'pi pi-plus', command: () => this.addPosition(this.selectedNode)  }
  ];

  
  if (userRole === "HRLeader") {
    this.parentNodeActions.push(
      { label: 'Edit Department', icon: 'pi pi-pencil', command: () => this.openEditDepartmentDialog(this.selectedNode!) },
      { label: 'Delete Department', icon: 'pi pi-trash', command: () => this.openDeleteDepartmentDialog(this.selectedNode) },
    );
  }
}

  fetchTreeData() {
    this.loading = true;
    this.departmentService.getDepartmentsTree()
    .pipe(finalize(() => setTimeout(() => {this.loading = false }, 1000)))
      .subscribe( {
        next: (departments) => {
          this.loadingItems = Array.from({ length: departments.length }, (_, i) => i + 1);
          this.treeData = departments.map(department => ({
            key: department.id.toString(),
            label: department.name,  
            icon: 'pi pi-folder',
            data: {id : department.id, type: 'department'},
            children: department.positions.map(position => ({
                label: position.name,  
                icon: 'pi pi-inbox',
                data: { publicId: position.publicId, type: 'position' }
            }))
          }));
        },
        error: () => {
          this.notificationService.showError('Failed to load departments');
        }
    });
  }

  loadTree(){
    this.departmentService.getDepartmentsTree()
      .subscribe( {
        next: (departments) => {
          this.treeData = departments.map(department => ({
            key: department.id.toString(),
            label: department.name,  
            icon: 'pi pi-folder',
            data: {id : department.id, type: 'department'},
            expanded: !!this.expandedNodesKey[department.id.toString()],
            children: department.positions.map(position => ({
                label: position.name,  
                icon: 'pi pi-inbox',
                data: { publicId: position.publicId, type: 'position' }
            }))
          }));

        },
        error: () => {
          this.notificationService.showError('Failed to load departments');
        }
    }); 
  }

  openNodeOptions(event: Event, node: TreeNode) {
    this.selectedNode = node;  

    if (node.children ) {
        this.parentMenu.toggle(event);
    } else {
        this.leafMenu.toggle(event);
    }
  }

  onNodeSelect(event: { node: TreeNode }) {
    console.log('Selected node:', event.node.label);
    const node = event.node;
    this.departmentSelectionService.setSelectedNode(node);
    if (node.data?.type === 'department') {
      const departmentId = node.data.id;
      this.router.navigate(['/departments', departmentId]);
    } else if (node.data?.type === 'position') {
      const publicId = node.data.publicId;
      this.router.navigate(['/positions', publicId]);
    }

  }

  openAddDepartmentDialog() {
    this.addDepartmentComponent.init();
    this.visibleAddDepartmentDialog = true;
  }

  closeAddDepartmentDialog() {
    this.visibleAddDepartmentDialog = false;
  }

  onDepartmentAdded() {
    this.loadTree(); 
    this.closeAddDepartmentDialog(); 
  }

  openEditDepartmentDialog(node: TreeNode) {
    this.selectedNode = node;
    this.editDepartmentComponent.init();
    this.visibleEditDepartmentDialog = true;
     
  }

  closeEditDepartmentDialog() {
    this.visibleEditDepartmentDialog = false;
  }

  onDepartmentEdit() {
    this.loadTree(); 
    this.closeEditDepartmentDialog();
  }

  openDeleteDepartmentDialog(node: TreeNode) {
    this.selectedNode = node;
    this.visibleDeleteDepartmentDialog = true;
  }

  closeDeleteDepartmentDialog() {
    this.visibleDeleteDepartmentDialog = false;
  }

  onDepartmentDeleted() {
    this.loadTree(); 
    this.closeDeleteDepartmentDialog();
  }

  addPosition(node: TreeNode) {
    const departmentId = node.data?.id;
    if (departmentId) {
      this.router.navigate([`/departments/${departmentId}/create-position`]);
    }
  }

  openDeletePositionDialog(node: TreeNode) {
    this.selectedNode = node;
    this.visibleDeletePositionDialog = true;
  }

  closeDeletePositionDialog() {
    this.visibleDeletePositionDialog = false;
  }
  onPositionDeleted() {
    this.loadTree();
    this.closeDeletePositionDialog();
  }

  onNodeExpand(event: TreeNodeExpandEvent) {
    const node = event.node;
    if (node?.key) {
      this.expandedNodesKey[node.key] = true;
    }
  }
  
  onNodeCollapse(event: TreeNodeCollapseEvent) {
    const node = event.node;
    if (node?.key) {
      delete this.expandedNodesKey[node.key];
    }
  }

  editPosition(node: TreeNode): void {
    const positionId = node.data?.publicId;
    if (positionId) {
      this.router.navigate([`/positions/${positionId}/edit-position`]);
    }
  }


}
