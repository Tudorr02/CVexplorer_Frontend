import { Component, OnInit, ViewChild, inject, computed } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { Table } from 'primeng/table';
import { UserService } from '../../_services/user.service';
import { RoleService } from '../../_services/role.service';
import { NotificationService } from '../../_services/notification.service';
import { AccountService } from '../../_services/account.service';
import { ScreenSizeService } from '../../_services/screen-size.service';
import { MessageService } from 'primeng/api';
import { User } from '../../_models/user';
import { UserDetails } from '../../_models/userDetails';
import { UserEnrollment } from '../../_models/userEnrollment';
import { CommonModule } from '@angular/common';

// PrimeNG UI Components
import { ButtonModule } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { ProgressSpinner } from 'primeng/progressspinner';
import { MultiSelectModule } from 'primeng/multiselect';
import { Tag, TagModule } from 'primeng/tag';
import { TableModule } from 'primeng/table';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { FormsModule } from '@angular/forms';

// Custom Directives
import { HasRoleDirective } from '../../_directives/has-role.directive';
@Component({
  selector: 'app-nav', imports: [
    // Angular & Common Modules
    FormsModule,CommonModule,

    // PrimeNG Components
    TableModule, ButtonModule, Dialog, InputTextModule, ProgressSpinner, 
    MultiSelectModule, TagModule, IconField, InputIcon,TagModule,Tag,

    // Custom Directives
    HasRoleDirective
  ],
  templateUrl: './nav.component.html',
  styleUrl: './nav.component.css'
})
export class NavComponent implements OnInit {
  @ViewChild('dtUsers') dt!: Table;

  // ✅ Dialog visibility
  visibleDetails: boolean = false;
  visibleEnrollUser: boolean = false;
  visibleManageUsers: boolean = false;

  // ✅ Services
  Router = inject(Router);
  AccountService = inject(AccountService);
  NotificationService = inject(NotificationService);
  ScreenSizeService = inject(ScreenSizeService);
  RoleService = inject(RoleService);
  UserService = inject(UserService);
  MessageService = inject(MessageService);
  isLargeScreen = computed(() => this.ScreenSizeService.isLargeScreen());
  isEditing: boolean = false;
  // ✅ UI State
  isLoginRoute: boolean = false;
  isDarkMode: boolean = true;
  buttonText: string = 'Dark Mode';
  logoPath: string = 'logos/CVexplorerDark.svg';
  iconClass: string = 'pi pi-moon';
  globalFilter: string = '';

  // ✅ User Data
  username = computed(() => this.AccountService.currentUser()?.username || '');
  userDetails: UserDetails = this.createEmptyUserDetails();
  userDetailsBackup: UserDetails = { ...this.userDetails };
  userEnrollment = {
    username: '',
    password: '',
    userRoles: []
  };
  users: User[] = [];
  rolesOptions: string[] = [];
  clonedUsers: { [userId: number]: User } = {};
  deletingUsers: { [userId: number]: boolean } = {};

  loading: boolean = false;

  ngOnInit(): void {
    this.Router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.isLoginRoute = this.Router.url === '/login';
      }
    });

    this.applyTheme(localStorage.getItem('theme') === 'dark');
  }

  // ✅ Apply Theme
  toggleTheme(): void {
    this.applyTheme(!this.isDarkMode);
    localStorage.setItem('theme', this.isDarkMode ? 'dark' : 'light');
  }

  private applyTheme(isDark: boolean): void {
    this.isDarkMode = isDark;
    const element = document.querySelector('html');
    element?.classList.toggle('my-app-dark', isDark);
    element?.classList.toggle('my-app-light', !isDark);
    this.buttonText = isDark ? 'Dark Mode' : 'Light Mode';
    this.logoPath = isDark ? 'logos/CVexplorerDark.svg' : 'logos/CVexplorerLight.svg';
    this.iconClass = isDark ? 'pi pi-moon' : 'pi pi-sun';
  }

  isLogin(): boolean {
    return this.Router.url.includes('/login'); 
  }


  signOut(): void {
    this.AccountService.logout();
    this.Router.navigate(['/login']);
  }

  // ✅ User Details Dialog
  showDetails(): void {
    this.UserService.getUserDetails().subscribe({
      next: (data) => {
        this.userDetails = data;
        this.userDetailsBackup = { ...data };
        this.visibleDetails = true;
      },
      error: () => this.NotificationService.showError('Failed to load details.')
    });
  }

  updateDetails(): void {
    this.loading = true;
    this.UserService.updateUserDetails(this.userDetails).subscribe({
      next: () => {
        this.NotificationService.showSuccess('Details updated!');
        this.isEditing = false;
      },
      error: () => this.NotificationService.showError('Update failed.'),
      complete: () => (this.loading = false)
    });
  }

  cancelEdit(): void {
    this.isEditing = false;
    this.userDetails = { ...this.userDetailsBackup };
  }

  private createEmptyUserDetails(): UserDetails {
    return { firstName: '', lastName: '', companyName: '', email: '' };
  }

  // ✅ Load Users & Exclude Current User
  loadUsers(): void {
    this.UserService.getUsers().subscribe({
      next: (users) => {
        this.users = users.filter(user => user.username !== this.username());
      },
      error: () => this.NotificationService.showError('Failed to load users.')
    });
  }

  // ✅ Load Roles
  loadRoles(): void {
    this.RoleService.getRoles().subscribe({
      next: (roles) => (this.rolesOptions = roles),
      error: () => this.NotificationService.showError('Failed to load roles.')
    });
  }

  // ✅ Manage Users Dialog
  openManageUsersDialog(): void {
    this.visibleManageUsers = true;
    this.loadUsers();
    this.loadRoles();
  }
   
  editFields() {
    this.isEditing = true;
  }
  closeManageUsersDialog(): void {
    this.visibleManageUsers = false;
  }

  // ✅ User Enrollment Dialog
  openEnrollUserDialog(): void {
    this.visibleEnrollUser = true;
    this.loadRoles();
  }

  closeEnrollUserDialog(): void {
    this.visibleEnrollUser = false;
  }

  enrollUser(): void {
    console.log('Enrolling user:');
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

  // ✅ Edit & Delete Users
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
      error: (err) => {
        this.handleUserUpdateError(err, user);
      }
    });
  }

  private handleUserUpdateError(err: any, user: User): void {
    if (err.status === 403) {
      this.MessageService.add({ severity: 'warn', summary: 'Forbidden', detail: `You are not allowed to edit user '${user.username}'` });
    } else {
      this.MessageService.add({ severity: 'error', summary: 'Error', detail: `Failed to edit user '${user.username}'` });
    }
    this.onRowEditCancel(user);
  }

  onRowEditCancel(user: User): void {
    if (user.id !== undefined) {
      const originalUser = this.clonedUsers[user.id];
      if (originalUser) {
        Object.assign(user, originalUser);
        delete this.clonedUsers[user.id];
      }
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
      error: (err) => {
        this.handleUserDeleteError(err, username);
      }
    });
  }

   
  filterGlobal() {
    this.dt.filterGlobal(this.globalFilter, 'contains');
  }

  private handleUserDeleteError(err: any, username: string): void {
    if (err.status === 403) {
      this.MessageService.add({ severity: 'warn', summary: 'Forbidden', detail: `You are not allowed to delete user '${username}'` });
    } else {
      this.MessageService.add({ severity: 'error', summary: 'Error', detail: `Failed to delete user '${username}'` });
    }
  }
}
