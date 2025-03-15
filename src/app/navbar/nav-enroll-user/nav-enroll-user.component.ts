import { Component, OnInit, inject } from '@angular/core';
import { UserService } from '../../_services/user.service';
import { NotificationService } from '../../_services/notification.service';
import { RoleService } from '../../_services/role.service';

// PrimeNG UI Components
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
import { ProgressSpinner } from 'primeng/progressspinner';
import { TagModule } from 'primeng/tag';

@Component({
  selector: 'app-nav-enroll-user',
  standalone: true,
  imports: [
    CommonModule, FormsModule, ButtonModule, Dialog, InputTextModule, MultiSelectModule, ProgressSpinner, TagModule
  ],
  templateUrl: './nav-enroll-user.component.html',
  styleUrl: './nav-enroll-user.component.css'
})
export class NavEnrollUserComponent implements OnInit {
  // ✅ Dialog visibility
  visibleEnrollUser: boolean = false;
  loading: boolean = false;

  // ✅ Services
  UserService = inject(UserService);
  RoleService = inject(RoleService);
  NotificationService = inject(NotificationService);

  // ✅ User Enrollment Data
  rolesOptions: string[] = [];
  userEnrollment = {
    username: '',
    password: '',
    userRoles: []
  };

  ngOnInit(): void {
    this.loadRoles();
  }

  // ✅ Load Available Roles
  loadRoles(): void {
    this.RoleService.getRoles().subscribe({
      next: (roles) => this.rolesOptions = roles,
      error: () => this.NotificationService.showError('Failed to load roles.')
    });
  }

  // ✅ Open/Close Dialog
  openEnrollUserDialog(): void {
    this.visibleEnrollUser = true;
    this.loadRoles();
  }

  closeEnrollUserDialog(): void {
    this.visibleEnrollUser = false;
    this.resetForm();
  }

  // ✅ Reset Form
  private resetForm(): void {
    this.userEnrollment = { username: '', password: '', userRoles: [] };
  }

  // ✅ Enroll User
  enrollUser(): void {
    if (!this.userEnrollment.username || !this.userEnrollment.password || this.userEnrollment.userRoles.length === 0) {
      this.NotificationService.showError('All fields are required.');
      return;
    }

    this.loading = true;
    // this.UserService.enrollUser(this.userEnrollment).subscribe({
    //   next: () => {
    //     this.NotificationService.showSuccess('User enrolled successfully!');
    //     this.closeEnrollUserDialog();
    //   },
    //   error: () => this.NotificationService.showError('Failed to enroll user.'),
    //   complete: () => this.loading = false
    // });
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

