import { Component, OnInit , inject, ViewChild } from '@angular/core';
import { MessageService, SelectItem , ConfirmationService} from 'primeng/api';
import { UserManagement } from '../../_models/userManagement';
import { AdminService } from '../../_services/admin.service';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { CommonModule } from '@angular/common';
import { TagModule } from 'primeng/tag';
import { SelectModule } from 'primeng/select';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';
import { MultiSelectModule } from 'primeng/multiselect';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { Table } from 'primeng/table';
import { ScrollPanelModule } from 'primeng/scrollpanel';
@Component({ 
  selector: 'app-manage-users',
  imports: [ScrollPanelModule,InputIcon,IconField,MultiSelectModule,FormsModule,TableModule, ToastModule, CommonModule, TagModule, SelectModule, ButtonModule, InputTextModule],
  templateUrl: './manage-users.component.html',
  styleUrl: './manage-users.component.css',
  providers: [ConfirmationService]
})
export class ManageUsersComponent implements OnInit{

  @ViewChild('dtUsers') dt!: Table; // Reference to PrimeNG Table
  users: UserManagement[] = [];
  rolesOptions: string[] = [];
  companies: string[] = [];
  loadingCompanies: boolean = false; // Control loading state
  globalFilter: string = '';
  clonedUsers: { [username: string]: UserManagement } = {};
  deletingUsers: { [username: string]: boolean } = {}; // ✅ Track rows in delete mode

  private adminService = inject(AdminService);
  private messageService = inject(MessageService);

  ngOnInit() {
    this.loadUsers();
    this.loadRoles();
  }

  private loadUsers() {
    this.adminService.getUsers().subscribe(
      (data) => {
        this.users = data;
      },
      (error) => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load users' });
      }
    );
  }

  private loadRoles() {
    this.adminService.getRoles().subscribe({
      next: (roles) => this.rolesOptions = roles,
      error: (err) => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load roles' })

    });
  }

  fetchCompanies() {

    if (this.companies.length > 0) return; // Prevent multiple requests

    this.loadingCompanies = true; // Show loading indicator

    this.adminService.getCompanies().subscribe({
      next: (companies) => {
        this.companies = companies.map(company => company.name); // Format company names
        this.loadingCompanies = false; // Hide loading indicator
    }, // Format company names
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to fetch companies' });
        this.loadingCompanies = false; // Hide loading indicator
      }
    });
  }

  // ✅ Start editing a row (store backup)
  onRowEditInit(user: UserManagement) {
    this.clonedUsers[user.username] = { ...user };
  }

  // ✅ Save user after edit
  onRowEditSave(user: UserManagement) {
    this.adminService.updateUser(user.username, user).subscribe(
      () => {
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'User updated successfully' });
        delete this.clonedUsers[user.username]; // Remove backup
      },
      (error) => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to update user' });
        this.onRowEditCancel(user); // Rollback
      }
    );
  }

  // ✅ Cancel edit and restore backup
  onRowEditCancel(user: UserManagement) {
    const originalUser = this.clonedUsers[user.username];
    if (originalUser) {
      Object.assign(user, originalUser);
      delete this.clonedUsers[user.username];
    }
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

  // ✅ Enable Delete Mode
  onRowDeleteInit(username: string) {
    this.deletingUsers[username] = true; 
  }

  // ✅ Cancel Delete
  onRowDeleteCancel(username: string) {
    delete this.deletingUsers[username];
  }

  // ✅ Confirm Deletion
  onRowDeleteConfirm(username: string) {
    this.adminService.deleteUser(username).subscribe(
      () => {
        this.users = this.users.filter(user => user.username !== username); // ✅ Remove user from UI
        this.messageService.add({ severity: 'success', summary: 'Success', detail: `User '${username}' deleted successfully` }); 
        delete this.deletingUsers[username];
      },
      (error) => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: `Failed to delete user '${username}'` });
        delete this.deletingUsers[username];
      });
  }


  
  filterGlobal() {
    this.dt.filterGlobal(this.globalFilter, 'contains');
  }

}
