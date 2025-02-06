import { Component , OnInit,Input , inject} from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { UserService } from '../_services/user.service';
import { NavigationEnd, Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-nav',
  imports: [CommonModule,ButtonModule],
  templateUrl: './nav.component.html',
  styleUrl: './nav.component.css'
})
export class NavComponent implements OnInit {

  isLoginRoute: boolean = false; // Default route

  Router = inject(Router);
  UserServices = inject(UserService);
  isDarkMode: boolean = true; // Default theme mode
  buttonText: string = 'Dark Mode'; // Default button text
  logoPath: string = 'logos/CVexplorerDark.svg'; // Path to the logo image
  iconClass: string = 'pi pi-moon'; // Default icon class

  ngOnInit(): void {

    this.Router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.isLoginRoute = this.Router.url === '/login'; // Always updated when route changes
      }
    }); // Check if the current route is the login page
    // Check localStorage for saved theme preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      this.isDarkMode = true;
      this.applyTheme();
    } else {
      this.isDarkMode = false;
      this.applyTheme();
    }
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
    this.UserServices.logout();
    this.Router.navigate(['/login']);
  }

  isLogin(): boolean {
    return this.Router.url.includes('/login'); // Adjust this based on your route structure
  }
}
