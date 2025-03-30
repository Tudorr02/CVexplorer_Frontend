import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LanguageService {

  private http =  inject(HttpClient);

  getLanguages(): Observable<{ label: string; value: string }[]> {
    return this.http.get<{ [key: string]: any }>('assets/languages.json').pipe(
      map(languagesObj =>
        Object.entries(languagesObj).map(([code, lang]) => ({
          label: lang.name,
          value: code
        }))
      )
    );
  }
}
