import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { TreeNode } from 'primeng/api';
import { Tree } from 'primeng/tree';
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
@Component({
  selector: 'app-left-menu',
  imports: [Skeleton,DeleteDepartmentComponent,EditDepartmentComponent,FormsModule, InputTextModule, Dialog, HasRoleDirective, TabsModule, ButtonModule, Tree, TreeModule, CommonModule, Menu, AddDepartmentComponent],
  templateUrl: './departments-tree.component.html',
  styleUrl: './departments-tree.component.css',
  
})
export class LeftMenuComponent implements OnInit {

  @ViewChild('parentMenu') parentMenu!: Menu; 
  @ViewChild('leafMenu') leafMenu!: Menu;  
  @ViewChild('editDepartmentComponent') editDepartmentComponent!: EditDepartmentComponent;
  @ViewChild('addDepartmentComponent') addDepartmentComponent!: AddDepartmentComponent;

  treeData: TreeNode[] = []
  loading: boolean = true; 
  loadingItems: Array<any> = []; 


  visibleAddDepartmentDialog: boolean = false;
  visibleEditDepartmentDialog: boolean = false;
  visibleDeleteDepartmentDialog: boolean = false;
  
  selectedNode!: TreeNode;
  parentNodeActions: MenuItem[] = [];

// ✅ Actions for Leaf Positions
  leafNodeActions: MenuItem[] = [
      {label: 'Edit Position', icon: 'pi pi-pencil'},
      {label: 'Delete Position', icon: 'pi pi-trash'}
  ];

  departmentService = inject(DepartmentService);
  notificationService = inject(NotificationService);
  accountService = inject(AccountService);  
by: any;

  ngOnInit() {
    this.fetchTreeData();
    this.setupContextMenu();
  }

  // ✅ Function to build context menu based on user role
setupContextMenu() {
  const userRole = this.accountService.currentUser()?.role || '';

  this.parentNodeActions = [
    { label: 'Add Position', icon: 'pi pi-plus', command: () => console.log('Add Position') }
  ];

  // ✅ Add "Rename" and "Delete" only if user has 'HRLeader' role
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
            children: department.positions.map(position => ({
                label: position.name,  
                icon: 'pi pi-inbox'
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
            children: department.positions.map(position => ({
                label: position.name,  
                icon: 'pi pi-inbox'
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
        // ✅ Open Parent Menu
        this.parentMenu.toggle(event);
    } else {
        // ✅ Open Leaf Menu
        this.leafMenu.toggle(event);
    }
  }

  onNodeSelect(event: { node: TreeNode }) {
    console.log('Selected node:', event.node.label);
  }



  //Features for Department Actions

  openAddDepartmentDialog() {
    this.addDepartmentComponent.init();
    this.visibleAddDepartmentDialog = true;
  }

  closeAddDepartmentDialog() {
    this.visibleAddDepartmentDialog = false;
  }

  onDepartmentAdded() {
    this.loadTree(); // ✅ Refresh tree when department is added
    this.closeAddDepartmentDialog(); // ✅ Close dialog after successful addition
  }

  // Edit Department

  openEditDepartmentDialog(node: TreeNode) {
    this.selectedNode = node;
    this.editDepartmentComponent.init();
    this.visibleEditDepartmentDialog = true;
     
  }

  closeEditDepartmentDialog() {
    this.visibleEditDepartmentDialog = false;
  }

  onDepartmentEdit() {
    this.loadTree(); // ✅ Refresh tree when department is added
    this.closeEditDepartmentDialog(); // ✅ Close dialog after successful addition
  }


  // Delete Department

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

}
