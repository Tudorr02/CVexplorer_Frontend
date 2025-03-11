import { Injectable, signal, effect } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ScreenSizeService {
    public screenWidth : number = 1920;
    isLargeScreen = signal<boolean>(window.innerWidth > this.screenWidth); // Reactive signal
    
  constructor() {
    window.addEventListener('resize', () => {
      this.isLargeScreen.set(window.innerWidth > this.screenWidth);
    });
    console.log("Screen size on init:", this.isLargeScreen()); 
  }
}
