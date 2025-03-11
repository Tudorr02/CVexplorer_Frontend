import { Component, OnInit, inject } from '@angular/core';
import { AdminService } from '../../_services/admin.service';
import { NotificationService } from '../../_services/notification.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MultiSelectModule } from 'primeng/multiselect';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { SplitterModule } from 'primeng/splitter';
import { Checkbox } from 'primeng/checkbox';
import { CompanyManagement } from '../../_models/companyManagement';
import { SelectModule } from 'primeng/select';
import { UserService } from '../../_services/user.service';

@Component({
  selector: 'app-enroll-user',
  standalone: true, // ✅ Allows the component to be used without a module
  imports: [SelectModule,Checkbox,SplitterModule,TagModule,CommonModule, FormsModule, MultiSelectModule, InputTextModule, ButtonModule],
  templateUrl: './enroll-user.component.html',
  styleUrl: './enroll-user.component.css'
})
export class EnrollUserComponent implements OnInit {

  private adminService = inject(AdminService);
  private notificationService = inject(NotificationService);
  private userService = inject(UserService);
  isModerator: boolean = false;

  userEnrollment = {
    username: '',
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    companyName: '',
    userRoles: []
  };

  rolesOptions: { key: string; name: string ; disabled: boolean }[] = [];
  companies:string[] = [];
  loadingCompanies: boolean = false; // Control loading state


  ngOnInit() {
    this.loadRoles();
    this.checkIfModerator();
  }

  private checkIfModerator() {

   const userRoles =  this.userService.currentUser()?.roles || [];
   this.isModerator = userRoles.includes('Moderator') && !userRoles.includes('Admin');
 }

  loadRoles() {
    this.adminService.getRoles().subscribe({
      next: (roles) => {
        this.rolesOptions = roles.map(role => ({ 
          key: role, 
          name: role,
          disabled: this.isModerator && role === 'Admin' })); // Format role names
      },
      error: () => this.notificationService.showError("Failed to load roles.")
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
        this.notificationService.showError("Failed to fetch companies.")
        this.loadingCompanies = false; // Hide loading indicator
      }
    });
  }

  enrollUser() {
    if (!this.userEnrollment.username || !this.userEnrollment.password) {
      this.notificationService.showWarning("Username and password are required!");
      return;
    }

    if (this.userEnrollment.userRoles.length === 0) {
      this.notificationService.showWarning("At least one role is required!");
      return;
    }

    this.adminService.enrollUser(this.userEnrollment).subscribe({
      next: (response) => {
        this.notificationService.showSuccess(`User ${response.username} enrolled successfully!`);
        this.resetForm();
      },
      error: (err) => { 
        const errorMessage = 'Failed to enroll user. '+ err?.error;
        this.notificationService.showError(errorMessage);}
    });
  }

  resetForm() {
    this.userEnrollment = {
      username: '',
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      companyName: '',
      userRoles: []
    };
  }

  getRoleSeverity(role: string) {
    switch (role) {
      case 'Admin': return 'danger';
      case 'Moderator': return 'warn';
      case 'HRUser': return 'success';
      default: return 'info';
    }
  }
}
