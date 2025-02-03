import { Injectable } from '@angular/core';
import { TreeNode } from 'primeng/api';

@Injectable({
  providedIn: 'root', // This ensures the service is provided application-wide
})
export class NodeService {
  // Mock data for the tree
  private mockTreeData: TreeNode[] = [
    {
      label: 'Documents',
      data: 'Documents Folder',
      expandedIcon: 'pi pi-folder-open',
      collapsedIcon: 'pi pi-folder',
      children: [
        {
          label: 'Work',
          data: 'Work Folder',
          expandedIcon: 'pi pi-folder-open',
          collapsedIcon: 'pi pi-folder',
          children: [
            { label: 'Expenses.doc', icon: 'pi pi-file', data: 'Expenses Document' },
            { label: 'Resume.doc', icon: 'pi pi-file', data: 'Resume Document' },
          ],
        },
        {
          label: 'Home',
          data: 'Home Folder',
          expandedIcon: 'pi pi-folder-open',
          collapsedIcon: 'pi pi-folder',
          children: [
            { label: 'Invoices.txt', icon: 'pi pi-file', data: 'Invoices Document' },
          ],
        },
      ],
    },
    {
      label: 'Pictures',
      data: 'Pictures Folder',
      expandedIcon: 'pi pi-folder-open',
      collapsedIcon: 'pi pi-folder',
      children: [
        { label: 'barcelona.jpg', icon: 'pi pi-image', data: 'Barcelona Photo' },
        { label: 'logo.jpg', icon: 'pi pi-image', data: 'PrimeFaces Logo' },
      ],
    },
    {
      label: 'Movies',
      data: 'Movies Folder',
      expandedIcon: 'pi pi-folder-open',
      collapsedIcon: 'pi pi-folder',
      children: [
        {
          label: 'Al Pacino',
          children: [
            { label: 'Scarface', icon: 'pi pi-video', data: 'Scarface Movie' },
            { label: 'Carlitos Way', icon: 'pi pi-video', data: 'Carlitos Way Movie' },
          ],
        },
        {
          label: 'Robert De Niro',
          children: [
            { label: 'Goodfellas', icon: 'pi pi-video', data: 'Goodfellas Movie' },
            { label: 'Untouchables', icon: 'pi pi-video', data: 'Untouchables Movie' },
          ],
        },
      ],
    },
  ];

  // Method to fetch the tree data
  getTreeNodes(): TreeNode[] {
    return this.mockTreeData;
  }
}
