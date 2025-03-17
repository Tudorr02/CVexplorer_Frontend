import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { TreeNode } from 'primeng/api';
import { Tree } from 'primeng/tree';
import { TreeModule } from 'primeng/tree';
import { CommonModule } from '@angular/common';
import { DepartmentService } from '../_services/department.service';
import { MenuItem } from 'primeng/api';
import { Menu } from 'primeng/menu';
import { ButtonModule } from 'primeng/button';
@Component({
  selector: 'app-left-menu',
  imports: [ButtonModule,Tree, TreeModule, CommonModule, Menu],
  templateUrl: './left-menu.component.html',
  styleUrl: './left-menu.component.css',
  
})
export class LeftMenuComponent implements OnInit {

  
  @ViewChild('options') menu!: Menu; // Reference to PrimeNG Menu
  treeData: TreeNode[] = [
    {
      label: 'Add Department',
      icon: 'pi pi-folder-plus',
      
    }
  ];

  selectedNode!: TreeNode;
  nodeOptions : MenuItem[] = [
    {label: 'Edit', icon: 'pi pi-pencil', command: () => this.editDepartment(this.selectedNode)},
    {label: 'Delete', icon: 'pi pi-trash', command: () => this.deleteDepartment(this.selectedNode)}
  ]

  departmentService = inject(DepartmentService);  

  ngOnInit() {
    this.loadTree();
    
  }

  loadTree(){

    this.departmentService.getDepartmentsTree().subscribe(departments => {
      this.treeData = [
        ...this.treeData,
        ...departments.map(department => ({
        label: department.name,  
        icon: 'pi pi-folder',
          children: department.positions.map(position => ({
            label: position.name,  
            icon: 'pi pi-inbox'
          }))
        }))
      ];
    });
    
  }

  editDepartment(node: TreeNode) {
    console.log('Editing department:', node.label);
  }

  deleteDepartment(node: TreeNode) {
    console.log('Deleting department:', node.label);
  }

  openNodeOptions(event: Event, node: TreeNode) {
    this.selectedNode = node;  // ✅ Store the correct node before opening the menu
    this.menu.toggle(event);

  }

  addDepartment() {
    console.log('Adding department...');
  }

  onNodeSelect(event: { node: TreeNode }) {
    const node = event.node;
  
    if (node.label === this.treeData[0].label) {
      this.addDepartment();
      this.selectedNode = {} as TreeNode;  // ✅ Call the function when clicking "Add Department"
    } else {
      console.log('Selected node:', node.label);
    }
  }

}
