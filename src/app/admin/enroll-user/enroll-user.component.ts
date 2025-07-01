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
import { SelectModule } from 'primeng/select';
import { AccountService } from '../../_services/account.service';
import { SelectButton } from 'primeng/selectbutton';

@Component({
  selector: 'app-enroll-user',
  standalone: true, 
  imports: [SelectButton,SelectModule,SplitterModule,TagModule,CommonModule, FormsModule, MultiSelectModule, InputTextModule, ButtonModule],
  templateUrl: './enroll-user.component.html',
  styleUrl: './enroll-user.component.css'
})
export class EnrollUserComponent implements OnInit {

  private adminService = inject(AdminService);
  private notificationService = inject(NotificationService);
  private accountService = inject(AccountService);
  isModerator: boolean = false;

  userEnrollment = {
    username: '',
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    companyName: '',
    userRole: ''
  };

  roles: { key: string; name: string ; disabled: boolean }[] = [];
  companies:string[] = [];
  loadingCompanies: boolean = false; 


  ngOnInit() {
    this.loadRoles();
    this.checkIfModerator();
    this.fetchCompanies();
  }

  private checkIfModerator() {
   const userRole =  this.accountService.currentUser()?.role || '';
   this.isModerator = userRole === 'Moderator';
 }

  loadRoles() {
    this.adminService.getRoles().subscribe({
      next: (roles) => {
        this.roles = roles.map(role => ({ 
          key: role, 
          name: role,
          disabled: this.isModerator && role === 'Admin' })); 
      },
      error: () => this.notificationService.showError("Failed to load roles.")
    });
  }

  fetchCompanies() {

    if (this.companies.length > 0) return; 

    this.loadingCompanies = true; 

    this.adminService.getCompanies().subscribe({
      next: (companies) => {
        this.companies = companies.map(company => company.name); 
        this.loadingCompanies = false;
    }, 
      error: () => {
        this.notificationService.showError("Failed to fetch companies.")
        this.loadingCompanies = false; 
      }
    });
  }

  enrollUser() {
    if (!this.userEnrollment.username || !this.userEnrollment.password) {
      this.notificationService.showWarning("Username and password are required!");
      return;
    }

    if (this.userEnrollment.userRole.length === 0) {
      this.notificationService.showWarning("At least one role is required!");
      return;
    }

    this.adminService.enrollUser(this.userEnrollment).subscribe({
      next: (response) => {
        this.notificationService.showSuccess(`User ${response.username} enrolled successfully!`);
        this.resetForm();
      },
      error: (err) => { 
        const errorMessage = 'Failed to enroll user. '+ err?.error.error;
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
      userRole: ''
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
