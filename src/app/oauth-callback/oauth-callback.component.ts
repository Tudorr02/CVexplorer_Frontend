import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-oauth-callback',
  imports: [],
  templateUrl: './oauth-callback.component.html',
  styleUrl: './oauth-callback.component.css'
})
export class OAuthCallbackComponent implements OnInit {

  ngOnInit() {

    const params   = new URLSearchParams(window.location.search);
    const provider = params.get('provider') || 'generic';

    console.log('OAuth callback initialized');
    window.opener.postMessage(
      { type: `${provider}-auth`, status: 'success' },
      window.location.origin
    );
    window.close();
  }

}
