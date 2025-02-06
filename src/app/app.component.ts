import { Component} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavComponent } from './nav/nav.component';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-root',
  imports: [CommonModule,RouterOutlet, NavComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  providers: []
  
})
export class AppComponent  {
  title(title: any) {
    throw new Error('Method not implemented.');
  }

  constructor(private router: Router) {}

  isDashboard(): boolean {
    return this.router.url.includes('/dashboard'); // Adjust this based on your route structure
  }
}
