import { Component, OnInit, inject } from '@angular/core';
import { UserService } from '../../_services/user.service';
import { NotificationService } from '../../_services/notification.service';
import { UserDetails } from '../../_models/userDetails';
import { finalize } from 'rxjs/operators';

// PrimeNG UI Components
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ProgressSpinner } from 'primeng/progressspinner';

@Component({
  selector: 'app-nav-user-details',
  standalone: true,
  imports: [
    CommonModule, FormsModule, ButtonModule, InputTextModule, ProgressSpinner
  ],
  templateUrl: './nav-user-details.component.html',
  styleUrl: './nav-user-details.component.css'
})
export class NavUserDetailsComponent implements OnInit {
  // ✅ Dialog visibility
  visibleDetails: boolean = false;
  isEditing: boolean = false;
  loading: boolean = false;

  // ✅ Services
  UserService = inject(UserService);
  NotificationService = inject(NotificationService);

  // ✅ User Data
  userDetails: UserDetails = this.createEmptyUserDetails();
  userDetailsBackup: UserDetails = { ...this.userDetails };

  ngOnInit(): void {
    this.loadUserDetails();
  }

  // ✅ Fetch User Details
  loadUserDetails(): void {
    this.UserService.getUserDetails().subscribe({
      next: (data) => {
        this.userDetails = data;
        this.userDetailsBackup = { ...data };
      },
      error: () => this.NotificationService.showError('Failed to load details.')
    });
  }

  // ✅ Open/Close Dialog
  showDetails(): void {
    this.visibleDetails = true;
  }

  closeDetailsDialog(): void {
    this.visibleDetails = false;
  }

  // ✅ Edit & Update User Details
  editFields(): void {
    this.isEditing = true;
  }

  cancelEdit(): void {
    this.isEditing = false;
    this.userDetails = { ...this.userDetailsBackup };
  }

  updateDetails(): void {
    this.loading = true;
    this.UserService.updateUserDetails(this.userDetails)
    .pipe(finalize(() => setTimeout(() => { this.loading = false ,  this.isEditing = false }, 1000)))
    .subscribe({
      next: () => {
        this.NotificationService.showSuccess('Details updated!');
        this.loadUserDetails();
      },
      error: () => this.NotificationService.showError('Update failed.'),
     
    });
  }

  private createEmptyUserDetails(): UserDetails {
    return { firstName: '', lastName: '', companyName: '', email: '' };
  }
}
