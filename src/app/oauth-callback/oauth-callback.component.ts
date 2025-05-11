import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-oauth-callback',
  imports: [],
  templateUrl: './oauth-callback.component.html',
  styleUrl: './oauth-callback.component.css'
})
export class OAuthCallbackComponent implements OnInit {

  ngOnInit() {
    // 1) Trimitem semnal înapoi ferestrei care a deschis popup-ul:
    window.opener.postMessage(
      { type: 'gmail-auth', status: 'success' },
      window.location.origin
    );
    // 2) Închidem popup-ul
    window.close();
    // 3) (Opțional) redirectăm parent-ul intern, dacă vrei:
  }

}
