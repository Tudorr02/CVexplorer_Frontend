import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-oauth-callback',
  imports: [],
  templateUrl: './oauth-callback.component.html',
  styleUrl: './oauth-callback.component.css'
})
export class OAuthCallbackComponent implements OnInit {

  ngOnInit() {
    window.opener.postMessage(
      { type: 'gmail-auth', status: 'success' },
      window.location.origin
    );
    window.close();
  }

}
