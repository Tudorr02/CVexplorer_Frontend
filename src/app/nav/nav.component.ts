import { Component , OnInit,Input , inject} from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { UserService } from '../_services/user.service';
import { NavigationEnd, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Dialog } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { UserDetails } from '../_models/userDetails';
import { FormsModule } from '@angular/forms';
import { computed } from '@angular/core';
import { ProgressSpinner } from 'primeng/progressspinner';
@Component({
  selector: 'app-nav',
  imports: [ProgressSpinner,FormsModule,CommonModule,ButtonModule,Dialog,InputTextModule],
  templateUrl: './nav.component.html',
  styleUrl: './nav.component.css'
})
export class NavComponent implements OnInit {

  visibleDetails: boolean = false;
  isLoginRoute: boolean = false; // Default route
  Router = inject(Router);
  UserService = inject(UserService);
  isDarkMode: boolean = true; // Default theme mode
  buttonText: string = 'Dark Mode'; // Default button text
  logoPath: string = 'logos/CVexplorerDark.svg'; // Path to the logo image
  username = computed(() => this.UserService.currentUser()?.username || '');
  iconClass: string = 'pi pi-moon'; // Default icon class
  isEditing: boolean = false;
  userDetails: UserDetails = {
    firstName: 'not available',
    lastName: 'not available',
    companyName: 'not available',
    email: 'not available',
  };
  loading: boolean = false; // Flag to control the loading spinner visibility


  userDetailsBackup: UserDetails = { ...this.userDetails }; // Create a backup
  

  ngOnInit(): void {
    this.Router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.isLoginRoute = this.Router.url === '/login'; // Always updated when route changes
      }
    }); 
    // Check if the current route is the login page
    

    //this.username = this.UserService.currentUser()?.username || '';
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      this.isDarkMode = true;
      this.applyTheme();
    } else {
      this.isDarkMode = false;
      this.applyTheme();
    }
  }

  editFields() {
    this.isEditing = true;
  }

  cancelEdit() {
    this.isEditing = false;
    this.userDetails = { ...this.userDetailsBackup }
  }

  updateDetails() {
    this.loading = true; // Flag to control the loading spinner visibility
    this.UserService.updateUserDetails(this.userDetails).subscribe(
      (response: UserDetails) => {
        this.showDetails(); 
        this.isEditing = false; // Close edit mode
        this.loading = false; // Hide the spinner
      },
      (error) => {
        console.error('Error updating account details:', error);
        this.loading = false; // Hide the loading spinner
      }
    );
  }


  toggleTheme(): void {
    // Toggle between light and dark modes
    this.isDarkMode = !this.isDarkMode;
    this.applyTheme();

    // Save the updated theme preference in localStorage
    const theme = this.isDarkMode ? 'dark' : 'light';
    localStorage.setItem('theme', theme);
  }

  private applyTheme(): void {
    const element = document.querySelector('html'); // Target the <html> tag
    if (this.isDarkMode) {
      element?.classList.add('my-app-dark'); // Apply the dark mode class
      element?.classList.remove('my-app-light'); // Remove light mode class
      this.buttonText = 'Dark Mode';
      this.logoPath = 'logos/CVexplorerDark.svg'; // Update the logo image path
      this.iconClass = 'pi pi-moon'; // Update the icon class
    } else {
      element?.classList.add('my-app-light'); // Apply the light mode class
      element?.classList.remove('my-app-dark'); // Remove dark mode class
      this.buttonText = 'Light Mode';
      this.logoPath = 'logos/CVexplorerLight.svg'; // Update the logo image path
      this.iconClass = 'pi pi-sun'; // Update the icon class
    }
  }

  signOut(){
    this.UserService.logout();
    this.Router.navigate(['/login']);
  }

  isLogin(): boolean {
    return this.Router.url.includes('/login'); 
  }

  showDetails(): void {
    this.UserService.getUserDetails().subscribe(
      (response: UserDetails) => {
        this.userDetails = {
          firstName: response.firstName ?? 'Not Available',
          lastName: response.lastName ?? 'Not Available',
          companyName: response.companyName ?? 'Not Available',
          email: response.email ?? 'Not Available'
        };
        this.userDetailsBackup = { ...this.userDetails }; // Store a backup before editing
        this.visibleDetails = true;  // Open the dialog
      },
      (error) => {
        console.error('Error fetching account details:', error);
      }
    );
   

  }
}
