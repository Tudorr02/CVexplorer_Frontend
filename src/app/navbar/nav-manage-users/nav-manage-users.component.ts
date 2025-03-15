import { Component, OnInit, ViewChild, inject } from '@angular/core';
import { Table } from 'primeng/table';
import { UserService } from '../../_services/user.service';
import { RoleService } from '../../_services/role.service';
import { NotificationService } from '../../_services/notification.service';
import { MessageService } from 'primeng/api';
import { User } from '../../_models/user';

// PrimeNG Modules
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ProgressSpinner } from 'primeng/progressspinner';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';

@Component({
  selector: 'app-nav-manage-users',
  imports: [ CommonModule, FormsModule,
    TableModule, ButtonModule, Dialog, InputTextModule,
    MultiSelectModule, TagModule, ProgressSpinner,
    IconField, InputIcon],
  templateUrl: './nav-manage-users.component.html',
  styleUrl: './nav-manage-users.component.css'
})
export class NavManageUsersComponent implements OnInit {
  @ViewChild('dtUsers') dt!: Table;

  // ✅ Dialog visibility
  visibleManageUsers: boolean = false;

  // ✅ Services
  UserService = inject(UserService);
  RoleService = inject(RoleService);
  NotificationService = inject(NotificationService);
  MessageService = inject(MessageService);

  // ✅ Data
  users: User[] = [];
  rolesOptions: string[] = [];
  globalFilter: string = '';
  clonedUsers: { [userId: number]: User } = {};
  deletingUsers: { [userId: number]: boolean } = {};

  ngOnInit(): void {
    this.loadUsers();
    this.loadRoles();
  }

  // ✅ Load Users & Roles
  loadUsers(): void {
    this.UserService.getUsers().subscribe({
      next: (users) => (this.users = users),
      error: () => this.NotificationService.showError('Failed to load users.')
    });
  }

  loadRoles(): void {
    this.RoleService.getRoles().subscribe({
      next: (roles) => (this.rolesOptions = roles),
      error: () => this.NotificationService.showError('Failed to load roles.')
    });
  }

  // ✅ User Management Actions
  onRowEditInit(user: User): void {
    if (user.id !== undefined) {
      this.clonedUsers[user.id] = { ...user };
    }
  }

  onRowEditSave(user: User): void {
    if (!user.id) {
      this.MessageService.add({ severity: 'error', summary: 'Error', detail: 'User ID is missing, update failed.' });
      return;
    }

    this.UserService.updateUser(user.id, user).subscribe({
      next: () => {
        this.MessageService.add({ severity: 'success', summary: 'Success', detail: `User '${user.username}' updated successfully` });
        if (user.id !== undefined) {
          delete this.clonedUsers[user.id];
        }
        this.loadUsers();
      },
      error: () => {
        this.MessageService.add({ severity: 'error', summary: 'Error', detail: `Failed to edit user '${user.username}'` });
        this.onRowEditCancel(user);
      }
    });
  }

  onRowEditCancel(user: User): void {
    if (user.id !== undefined && this.clonedUsers[user.id]) {
      Object.assign(user, this.clonedUsers[user.id]);
      delete this.clonedUsers[user.id];
    }
  }

  onRowDeleteInit(userId: number): void {
    this.deletingUsers[userId] = true;
  }

  onRowDeleteCancel(userId: number): void {
    delete this.deletingUsers[userId];
  }

  onRowDeleteConfirm(userId: number, username: string): void {
    this.UserService.deleteUser(userId).subscribe({
      next: () => {
        this.users = this.users.filter(user => user.id !== userId);
        this.MessageService.add({ severity: 'success', summary: 'Success', detail: `User '${username}' deleted successfully` });
        delete this.deletingUsers[userId];
      },
      error: () => {
        this.MessageService.add({ severity: 'error', summary: 'Error', detail: `Failed to delete user '${username}'` });
      }
    });
  }

  filterGlobal(): void {
    this.dt.filterGlobal(this.globalFilter, 'contains');
  }

  // ✅ Role badge color based on role
  getRoleSeverity(role: string) {
    switch (role) {
      case 'Admin':return 'danger';
      case 'Moderator':return 'warn';
      case 'HRLeader':return 'info';
      case 'HRUser':return 'success';
      default:return 'secondary';
    }
  }
}
