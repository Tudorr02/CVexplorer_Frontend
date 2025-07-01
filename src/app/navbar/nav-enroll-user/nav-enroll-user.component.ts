import { Component,  EventEmitter,  inject, Output } from '@angular/core';
import { UserService } from '../../_services/user.service';
import { NotificationService } from '../../_services/notification.service';
import { RoleService } from '../../_services/role.service';
import { UserEnrollmentCompany } from '../../_models/userEnrollmentCompany';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
import { ProgressSpinner } from 'primeng/progressspinner';
import { TagModule } from 'primeng/tag';
import { finalize } from 'rxjs';
import { SelectButton } from 'primeng/selectbutton';

@Component({
  selector: 'app-nav-enroll-user',
  standalone: true,
  imports: [
    SelectButton,CommonModule, FormsModule, ButtonModule,InputTextModule, MultiSelectModule, ProgressSpinner, TagModule
  ],
  templateUrl: './nav-enroll-user.component.html',
  styleUrl: './nav-enroll-user.component.css'
})
export class NavEnrollUserComponent  {

  @Output() userEnrolled: EventEmitter<void> = new EventEmitter();
  
  visibleEnrollUser: boolean = false;
  loading: boolean = false;

  UserService = inject(UserService);
  RoleService = inject(RoleService);
  NotificationService = inject(NotificationService);

  roles: string[] = [];
  userEnrollment: UserEnrollmentCompany = {
    username: '',
    password: '',
    userRole: ''
  };

  init(): void {
    this.loadRoles();
    this.resetForm();
  }

  loadRoles(): void {
    this.RoleService.getRoles().subscribe({
      next: (roles) => this.roles = roles,
      error: () => this.NotificationService.showError('Failed to load roles.')
    });
  }

  private resetForm(): void {
    this.userEnrollment = { username: '', password: '', userRole: '' };
  }

  enrollUser(): void {
    if (!this.userEnrollment.username || !this.userEnrollment.password || this.userEnrollment.userRole === '') {
      this.NotificationService.showError('All fields are required.');
      return;
    }

    this.loading = true;
    this.UserService.enrollUser(this.userEnrollment)
    .pipe(finalize(() => setTimeout(() => this.loading = false, 1000)))
    .subscribe({
      next: () => {
        this.NotificationService.showSuccess('User enrolled successfully!');
        this.resetForm();
        this.userEnrolled.emit();
      },
      error: (err) => this.NotificationService.showError('Failed to enroll user.'+err.error.error),
    });
  }

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

